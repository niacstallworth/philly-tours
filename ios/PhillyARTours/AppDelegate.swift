import Expo
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
    if MetaWearablesManager.shared.handleOpenURL(url) {
      return true
    }
    return super.application(app, open: url, options: options) || RCTLinkingManager.application(app, open: url, options: options)
  }

  // Universal Links
  public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    if MetaWearablesManager.shared.handleUserActivity(userActivity) {
      return true
    }
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

final class MetaWearablesManager {
  static let shared = MetaWearablesManager()

  private(set) var connectionState: MetaWearablesConnectionState = .unavailable
  private(set) var statusMessage: String = "Meta Wearables Device Access Toolkit not installed."

  private init() {}

  func configureIfAvailable() {
    connectionState = .unavailable
    statusMessage = "Meta Wearables package not linked yet. Add https://github.com/facebook/meta-wearables-dat-ios in Xcode."

    // Future integration point:
    // 1. `import` the Meta package here once it is added via Swift Package Manager.
    // 2. Initialize toolkit registration/device management during app launch.
    // 3. Publish connection state to React Native through a native bridge or event emitter.
  }

  func beginPairing() {
    connectionState = .error
    statusMessage = "Pairing is not available until the Meta Wearables Device Access Toolkit is linked."
  }

  func disconnect() {
    connectionState = .disconnected
    statusMessage = "Wearable session disconnected."
  }

  func handleOpenURL(_ url: URL) -> Bool {
    // Future integration point for Meta toolkit callback URLs or pairing continuations.
    // Returning false keeps current React Native deep-link behavior unchanged.
    _ = url
    return false
  }

  func handleUserActivity(_ userActivity: NSUserActivity) -> Bool {
    // Future integration point for any Meta pairing/session continuation user activity.
    _ = userActivity
    return false
  }
}
