import Expo
import MWDATCore
import MWDATMockDevice
import React
import ReactAppDependencyProvider

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    MetaWearablesManager.shared.configureIfAvailable()

    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // Linking API
  public override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    MetaWearablesManager.shared.handleOpenURL(url)
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    MetaWearablesManager.shared.handleUserActivity(userActivity)
    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  // Extension point for config-plugins

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    // needed to return the correct URL for expo-dev-client.
    bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    if let embeddedBundle = Bundle.main.url(forResource: "main", withExtension: "jsbundle") {
      return embeddedBundle
    }
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

enum MetaWearablesConnectionState: String {
  case unavailable
  case idle
  case pairing
  case connected
  case disconnected
  case error
}

@MainActor
final class MetaWearablesManager {
  static let shared = MetaWearablesManager()

  private var didConfigure = false
  private var observers: [NSObjectProtocol] = []
  private var sessionToken: ObjC_AnyListenerToken?
  private var activeDeviceId: String?
  private var activeSessionState: SessionState = .stopped
  private var lastErrorMessage: String?
  private var statusNote: String?
  private var configurationIssues: [String] = []

  private var wearables: ObjC_Wearables {
    ObjC_Wearables.sharedInstance
  }

  private var mockDeviceKit: ObjC_MockDeviceKit {
    ObjC_MockDeviceKit.sharedInstance
  }

  private init() {}

  func configureIfAvailable() {
    guard !didConfigure else { return }

    var configurationError: NSError?
    ObjC_Wearables.configure(&configurationError)

    didConfigure = true
    installObservers()

    if let configurationError {
      lastErrorMessage = configurationError.localizedDescription
    } else {
      lastErrorMessage = nil
      statusNote = "Meta DAT configured for this build."
    }

    configurationIssues = metaConfigurationIssues()
    Task { await syncFromToolkit() }
  }

  func beginPairing() async throws -> [String: Any] {
    await syncFromToolkit()
    lastErrorMessage = nil

    switch wearables.registrationState {
    case .available:
      do {
        try await wearables.startRegistration()
        statusNote = "Meta registration started. Complete the flow in the Meta AI app, then return here."
      } catch {
        lastErrorMessage = error.localizedDescription
        throw error
      }
    case .registering:
      statusNote = "Meta registration is already in progress."
    case .registered:
      statusNote = wearables.devices.isEmpty
        ? "Meta registration is complete. Power on paired glasses in the Meta AI app to continue."
        : "Meta glasses are already registered."

      if wearables.devices.first != nil {
        do {
          _ = try await wearables.requestPermission(.camera)
          statusNote = "Meta glasses are registered. Camera permission is available for this DAT build."
        } catch {
          lastErrorMessage = error.localizedDescription
        }
      }
    case .unavailable:
      let error = NSError(
        domain: "MetaWearables",
        code: 1,
        userInfo: [
          NSLocalizedDescriptionKey:
            unavailableMessage()
        ]
      )
      lastErrorMessage = error.localizedDescription
      throw error
    }

    return await statusPayload()
  }

  func beginMockPairing() async throws -> [String: Any] {
    configureIfAvailable()
    lastErrorMessage = nil

    let device = mockDeviceKit.pairRaybanMeta()
    device.powerOn()
    device.don()
    device.unfold()
    statusNote = "Mock Ray-Ban Meta connected."

    return await statusPayload()
  }

  func disconnect() async throws -> [String: Any] {
    await syncFromToolkit()
    lastErrorMessage = nil

    if let mockDevice = mockDeviceKit.pairedDevices.first {
      mockDeviceKit.unpairDevice(mockDevice)
      statusNote = "Mock Ray-Ban Meta disconnected."
      return await statusPayload()
    }

    guard wearables.registrationState == .registered else {
      statusNote = "No active Meta registration to remove."
      return await statusPayload()
    }

    do {
      try await wearables.startUnregistration()
      statusNote = "Meta wearables unregistration started in the Meta AI app."
    } catch {
      lastErrorMessage = error.localizedDescription
      throw error
    }

    return await statusPayload()
  }

  func handleOpenURL(_ url: URL) {
    Task {
      do {
        let handled = try await wearables.handleUrl(url)
        if handled {
          lastErrorMessage = nil
          statusNote = "Meta registration callback received."
        }
      } catch {
        lastErrorMessage = error.localizedDescription
      }

      await syncFromToolkit()
    }
  }

  func handleUserActivity(_ userActivity: NSUserActivity) {
    // Keep the hook in place for future DAT user-activity based flows.
    _ = userActivity
  }

  func statusPayload() async -> [String: Any] {
    await syncFromToolkit()
    let permissions = await grantedPermissions()
    let connectionState = currentConnectionState()
    let statusMessage = currentStatusMessage(for: connectionState)

    return [
      "supported": true,
      "connectionState": connectionState.rawValue,
      "pairedDevice": devicePayload() ?? NSNull(),
      "grantedPermissions": permissions,
      "lastError": lastErrorMessage ?? NSNull(),
      "statusMessage": statusMessage ?? NSNull()
    ]
  }

  private func installObservers() {
    guard observers.isEmpty else { return }

    let notificationCenter = NotificationCenter.default

    observers.append(
      notificationCenter.addObserver(
        forName: NSNotification.wearablesRegistrationStateChanged,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        Task { @MainActor in
          await self?.syncFromToolkit()
        }
      }
    )

    observers.append(
      notificationCenter.addObserver(
        forName: NSNotification.wearablesDevicesChanged,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        Task { @MainActor in
          await self?.syncFromToolkit()
        }
      }
    )
  }

  private func syncFromToolkit() async {
    configurationIssues = metaConfigurationIssues()
    let nextDeviceId = wearables.devices.first

    if activeDeviceId != nextDeviceId {
      sessionToken = nil
      activeDeviceId = nextDeviceId
      activeSessionState = .stopped

      if let nextDeviceId {
        sessionToken = await wearables.addDeviceSessionStateListener(forDeviceId: nextDeviceId) { [weak self] state in
          Task { @MainActor in
            self?.activeSessionState = state
            self?.statusNote = self?.message(for: state)
          }
        }
      }
    }
  }

  private func grantedPermissions() async -> [String] {
    var permissions: [String] = []

    if mockDeviceKit.pairedDevices.first != nil {
      permissions.append("camera")
      permissions.append("device_state")
      return permissions
    }

    do {
      if try await wearables.checkPermissionStatus(.camera) == .granted {
        permissions.append("camera")
      }
    } catch {
      if lastErrorMessage == nil {
        lastErrorMessage = error.localizedDescription
      }
    }

    return permissions
  }

  private func devicePayload() -> [String: Any]? {
    if let mockDevice = mockDeviceKit.pairedDevices.first {
      return [
        "id": mockDevice.deviceIdentifier,
        "model": "Ray-Ban Meta Mock",
        "displayName": "Mock Ray-Ban Meta",
        "platform": "meta_glasses",
        "capabilities": ["camera", "device_state"],
        "isMock": true
      ]
    }

    guard let deviceId = wearables.devices.first,
          let device = wearables.deviceForIdentifier(deviceId) else {
      return nil
    }

    return [
      "id": device.identifier,
      "model": device.deviceType().rawValue,
      "displayName": device.nameOrId(),
      "platform": "meta_glasses",
      "capabilities": ["camera", "device_state"],
      "isMock": false
    ]
  }

  private func currentConnectionState() -> MetaWearablesConnectionState {
    if mockDeviceKit.pairedDevices.first != nil {
      return .connected
    }

    if wearables.registrationState == .registering {
      return .pairing
    }

    if activeDeviceId != nil {
      switch activeSessionState {
      case .running, .paused:
        return .connected
      case .waitingForDevice:
        return .pairing
      case .stopped, .unknown:
        return .disconnected
      }
    }

    switch wearables.registrationState {
    case .registered, .available:
      return .idle
    case .registering:
      return .pairing
    case .unavailable:
      return lastErrorMessage == nil ? .unavailable : .error
    }
  }

  private func currentStatusMessage(for connectionState: MetaWearablesConnectionState) -> String? {
    if let lastErrorMessage {
      return lastErrorMessage
    }

    if !configurationIssues.isEmpty {
      return unavailableMessage()
    }

    if let statusNote {
      return statusNote
    }

    if mockDeviceKit.pairedDevices.first != nil {
      return "Mock Ray-Ban Meta is active."
    }

    switch connectionState {
    case .connected:
      return "Meta glasses session is active."
    case .pairing:
      return "Meta pairing or session activation is in progress."
    case .disconnected:
      return "Meta glasses are known to the app but the current session is not running."
    case .idle:
      return wearables.registrationState == .registered
        ? "Meta registration is complete. Connect glasses and grant camera permission to continue."
        : "Meta registration is available for this app."
    case .unavailable:
      return unavailableMessage()
    case .error:
      return "Meta DAT reported an error."
    }
  }

  private func unavailableMessage() -> String {
    if configurationIssues.isEmpty {
      return "Meta DAT is installed, but registration is unavailable until the Meta AI app is installed and the project is configured."
    }

    return "Meta DAT is missing project configuration: \(configurationIssues.joined(separator: ", ")). Replace the placeholder build settings in the iOS target before pairing."
  }

  private func metaConfigurationIssues() -> [String] {
    guard let config = Bundle.main.object(forInfoDictionaryKey: "MWDAT") as? [String: Any] else {
      return ["MWDAT dictionary"]
    }

    let requiredValues: [(String, String)] = [
      ("MetaAppID", "Meta app ID"),
      ("ClientToken", "Meta client token"),
      ("AppLinkURLScheme", "Meta app link URL scheme")
    ]

    return requiredValues.compactMap { key, label in
      guard let value = config[key] as? String else {
        return label
      }

      let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
      if trimmed.isEmpty || trimmed.contains("required") || trimmed.contains("placeholder") || trimmed == "$(DEVELOPMENT_TEAM)" {
        return label
      }

      return nil
    }
  }

  private func message(for sessionState: SessionState) -> String {
    switch sessionState {
    case .running:
      return "Meta glasses session is running."
    case .paused:
      return "Meta glasses session is paused."
    case .waitingForDevice:
      return "Waiting for paired Meta glasses to become available."
    case .stopped:
      return "Meta glasses session is stopped."
    case .unknown:
      return "Meta glasses session state is unknown."
    }
  }
}

@objc(PhillyNativeWearables)
class PhillyNativeWearables: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc(getStatus:rejecter:)
  func getStatus(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task { @MainActor in
      resolve(await MetaWearablesManager.shared.statusPayload())
    }
  }

  @objc(pairWearable:rejecter:)
  func pairWearable(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task { @MainActor in
      do {
        resolve(try await MetaWearablesManager.shared.beginPairing())
      } catch {
        reject("META_WEARABLE_PAIR_FAILED", error.localizedDescription, error)
      }
    }
  }

  @objc(pairMockWearable:rejecter:)
  func pairMockWearable(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task { @MainActor in
      do {
        resolve(try await MetaWearablesManager.shared.beginMockPairing())
      } catch {
        reject("META_WEARABLE_MOCK_PAIR_FAILED", error.localizedDescription, error)
      }
    }
  }

  @objc(disconnectWearable:rejecter:)
  func disconnectWearable(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task { @MainActor in
      do {
        resolve(try await MetaWearablesManager.shared.disconnect())
      } catch {
        reject("META_WEARABLE_DISCONNECT_FAILED", error.localizedDescription, error)
      }
    }
  }
}
