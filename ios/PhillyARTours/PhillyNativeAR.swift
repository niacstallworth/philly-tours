import Foundation
import UIKit
import React
import ARKit
import RealityKit
import Metal

@objc(PhillyNativeAR)
class PhillyNativeAR: NSObject {
  private let sessionWarmupDelay: TimeInterval = 0.9
  private var isSessionRunning = false
  private var placedModelIds: Set<String> = []
  private weak var arController: PhillyARViewController?

  @objc
  static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc(getStatus:rejecter:)
  func getStatus(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if isSessionRunning && arController == nil {
      isSessionRunning = false
      placedModelIds.removeAll()
    }
    let supported = ARWorldTrackingConfiguration.isSupported
    resolve([
      "available": supported,
      "reason": supported ? "ARKit available" : "ARKit unsupported on this device",
      "sessionRunning": isSessionRunning,
      "placedModelCount": placedModelIds.count
    ])
  }

  @objc(startSession:rejecter:)
  func startSession(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      guard ARWorldTrackingConfiguration.isSupported else {
        reject("ARKIT_UNAVAILABLE", "ARKit is not supported on this device", nil)
        return
      }

      if let existing = self.arController {
        existing.restartSession()
        DispatchQueue.main.asyncAfter(deadline: .now() + self.sessionWarmupDelay) {
          self.isSessionRunning = true
          self.placedModelIds.removeAll()
          resolve(nil)
        }
        return
      }

      guard let presenter = Self.topViewController() else {
        reject("UI_UNAVAILABLE", "Could not find a view controller to present AR", nil)
        return
      }

      let controller = PhillyARViewController()
      controller.modalPresentationStyle = .fullScreen
      presenter.present(controller, animated: true) {
        self.arController = controller
        DispatchQueue.main.asyncAfter(deadline: .now() + self.sessionWarmupDelay) {
          self.isSessionRunning = true
          self.placedModelIds.removeAll()
          resolve(nil)
        }
      }
    }
  }

  @objc(placeModel:resolver:rejecter:)
  func placeModel(
    _ placement: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard isSessionRunning else {
      reject("SESSION_NOT_RUNNING", "Call startSession first", nil)
      return
    }

    guard let id = (placement["id"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
          let modelUrl = (placement["modelUrl"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
          !id.isEmpty,
          !modelUrl.isEmpty else {
      reject("INVALID_PLACEMENT", "placement.id and placement.modelUrl are required", nil)
      return
    }

    let scale = (placement["scale"] as? NSNumber)?.floatValue ?? 1.0
    if scale <= 0 {
      reject("INVALID_PLACEMENT", "placement.scale must be > 0", nil)
      return
    }

    let rotationYDeg = (placement["rotationYDeg"] as? NSNumber)?.floatValue ?? 0
    let verticalOffsetM = (placement["verticalOffsetM"] as? NSNumber)?.floatValue ?? 0
    let anchorStyle = (placement["anchorStyle"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "front_of_user"
    let fallbackType = (placement["fallbackType"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "box"
    let sitePlacementMode = (placement["sitePlacementMode"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    let preferredViewingDistanceM = (placement["preferredViewingDistanceM"] as? NSNumber)?.floatValue
    let siteOffsetXM = (placement["siteOffsetXM"] as? NSNumber)?.floatValue ?? 0
    let siteOffsetZM = (placement["siteOffsetZM"] as? NSNumber)?.floatValue ?? 0
    let title = (placement["title"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? id
    let subtitle = (placement["subtitle"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "Historic AR stop"
    let headline = (placement["headline"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? title
    let summary = (placement["summary"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? subtitle
    let placementNote = (placement["placementNote"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    let contentLayers = (placement["contentLayers"] as? [String]) ?? []
    let productionChecklist = (placement["productionChecklist"] as? [String]) ?? []

    DispatchQueue.main.async {
      guard let controller = self.arController else {
        reject("SESSION_NOT_RUNNING", "No active AR view. Start a session first", nil)
        return
      }

      do {
        try controller.placeModel(
          id: id,
          modelUrl: modelUrl,
          scale: scale,
          rotationYDeg: rotationYDeg,
          verticalOffsetM: verticalOffsetM,
          anchorStyle: anchorStyle,
          fallbackType: fallbackType,
          sitePlacementMode: sitePlacementMode,
          preferredViewingDistanceM: preferredViewingDistanceM,
          siteOffsetXM: siteOffsetXM,
          siteOffsetZM: siteOffsetZM,
          title: title,
          subtitle: subtitle,
          headline: headline,
          summary: summary,
          placementNote: placementNote,
          contentLayers: contentLayers,
          productionChecklist: productionChecklist,
          onPlaced: {
            self.placedModelIds.insert(id)
            resolve(nil)
          },
          onCancelled: { error in
            reject("PLACE_MODEL_FAILED", error.localizedDescription, error)
          }
        )
      } catch {
        reject("PLACE_MODEL_FAILED", error.localizedDescription, error)
      }
    }
  }

  @objc(stopSession:rejecter:)
  func stopSession(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      self.arController?.stopSession()
      if let controller = self.arController, controller.presentingViewController != nil {
        controller.dismiss(animated: true)
      }
      self.arController = nil
      self.isSessionRunning = false
      self.placedModelIds.removeAll()
      resolve(nil)
    }
  }

  private static func topViewController(base: UIViewController? = UIApplication.shared.connectedScenes
    .compactMap { $0 as? UIWindowScene }
    .flatMap { $0.windows }
    .first(where: { $0.isKeyWindow })?
    .rootViewController) -> UIViewController? {
    if let nav = base as? UINavigationController {
      return topViewController(base: nav.visibleViewController)
    }
    if let tab = base as? UITabBarController {
      return topViewController(base: tab.selectedViewController)
    }
    if let presented = base?.presentedViewController {
      return topViewController(base: presented)
    }
    return base
  }
}

final class PhillyARViewController: UIViewController {
  private let autoPlacementDelay: TimeInterval = 5.0
  private struct PendingPlacement {
    let id: String
    let modelUrl: String
    let scale: Float
    let rotationYDeg: Float
    let verticalOffsetM: Float
    let anchorStyle: String
    let fallbackType: String
    let sitePlacementMode: String
    let preferredViewingDistanceM: Float?
    let siteOffsetXM: Float
    let siteOffsetZM: Float
    let title: String
    let subtitle: String
    let headline: String
    let summary: String
    let placementNote: String
    let contentLayers: [String]
    let productionChecklist: [String]
    let onPlaced: () -> Void
    let onCancelled: (Error) -> Void
  }

  private let arView = ARView(frame: .zero)
  private let closeButton = UIButton(type: .system)
  private let coachingOverlay = ARCoachingOverlayView()
  private let placementGuideContainer = UIView()
  private let placementGuideLabel = UILabel()
  private let placementCountdownLabel = UILabel()
  private let placementReticle = UIView()
  private let infoPanel = UIView()
  private let infoTitleLabel = UILabel()
  private let infoBodyLabel = UILabel()
  private var currentAnchorStyle: String = "front_of_user"
  private var pendingPlacement: PendingPlacement?
  private var placementValidationTimer: Timer?
  private var autoPlacementTimer: Timer?
  private var cachedPlacementTransform: simd_float4x4?
  private var autoPlacementDeadline: Date?
  private lazy var useLegacyARRendering: Bool = {
    guard let device = MTLCreateSystemDefaultDevice() else { return true }
    if #available(iOS 13.0, *) {
      return !device.supportsFamily(.apple4)
    }
    return true
  }()

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .black
    arView.frame = view.bounds
    arView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    view.addSubview(arView)
    configureCoachingOverlay()
    configureCloseButton()
    configurePlacementGuide()
    restartSession()
  }

  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)

    // RealityKit/ARKit can continue holding significant resources after the modal
    // is dismissed unless we explicitly pause and tear the session down.
    if isBeingDismissed || navigationController?.isBeingDismissed == true {
      stopSession()
    }
  }

  deinit {
    stopSession()
  }

  func restartSession() {
    let config = ARWorldTrackingConfiguration()
    config.planeDetection = useLegacyARRendering ? [.horizontal] : [.horizontal, .vertical]
    config.environmentTexturing = .none
    if !useLegacyARRendering, ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh) {
      config.sceneReconstruction = .mesh
    }
    config.isAutoFocusEnabled = true
    arView.session.run(config, options: [.resetTracking, .removeExistingAnchors])
    coachingOverlay.setActive(true, animated: true)
  }

  func stopSession() {
    arView.session.pause()
    arView.scene.anchors.removeAll()
    cancelPendingPlacement(message: "AR placement was cancelled.")
    coachingOverlay.setActive(false, animated: false)
    updateInfoPanel(title: nil, body: nil)
  }

  func placeModel(
    id: String,
    modelUrl: String,
    scale: Float,
    rotationYDeg: Float,
    verticalOffsetM: Float,
    anchorStyle: String,
    fallbackType: String,
    sitePlacementMode: String,
    preferredViewingDistanceM: Float?,
    siteOffsetXM: Float,
    siteOffsetZM: Float,
    title: String,
    subtitle: String,
    headline: String,
    summary: String,
    placementNote: String,
    contentLayers: [String],
    productionChecklist: [String],
    onPlaced: @escaping () -> Void,
    onCancelled: @escaping (Error) -> Void
  ) throws {
    currentAnchorStyle = anchorStyle
    updateCoachingGoal(for: anchorStyle)

    pendingPlacement = PendingPlacement(
      id: id,
      modelUrl: modelUrl,
      scale: scale,
      rotationYDeg: rotationYDeg,
      verticalOffsetM: verticalOffsetM,
      anchorStyle: anchorStyle,
      fallbackType: fallbackType,
      sitePlacementMode: sitePlacementMode,
      preferredViewingDistanceM: preferredViewingDistanceM,
      siteOffsetXM: siteOffsetXM,
      siteOffsetZM: siteOffsetZM,
      title: title,
      subtitle: subtitle,
      headline: headline,
      summary: summary,
      placementNote: placementNote,
      contentLayers: contentLayers,
      productionChecklist: productionChecklist,
      onPlaced: onPlaced,
      onCancelled: onCancelled
    )
    let guideMessage: String
    if sitePlacementMode == "miniature_reconstruction" {
      guideMessage = "Hold the iPad steady. The miniature will place itself nearby in about five seconds."
    } else if anchorStyle == "ground" {
      guideMessage = "Hold the iPad steady. The exhibit will place itself on the ground in about five seconds."
    } else {
      guideMessage = "Hold the iPad steady. The exhibit will place itself in view in about five seconds."
    }
    updateInfoPanel(
      title: headline.isEmpty ? title : headline,
      body: summary.isEmpty ? placementNote : summary
    )
    showPlacementGuide(message: guideMessage)
    coachingOverlay.setActive(true, animated: true)
  }

  private func placeModelImmediately(
    id: String,
    modelUrl: String,
    scale: Float,
    rotationYDeg: Float,
    verticalOffsetM: Float,
    anchorStyle: String,
    fallbackType: String,
    sitePlacementMode: String,
    preferredViewingDistanceM: Float?,
    siteOffsetXM: Float,
    siteOffsetZM: Float,
    title: String,
    subtitle: String,
    headline: String,
    summary: String,
    placementNote: String,
    contentLayers: [String],
    productionChecklist: [String],
    overrideTransform: simd_float4x4? = nil
  ) throws {
    let transform: simd_float4x4
    if let overrideTransform {
      transform = overrideTransform
    } else {
      guard let frame = arView.session.currentFrame else {
        throw NSError(domain: "PhillyNativeAR", code: 1001, userInfo: [NSLocalizedDescriptionKey: "AR frame unavailable"])
      }

      transform = try placementTransform(
        frame: frame,
        anchorStyle: anchorStyle,
        sitePlacementMode: sitePlacementMode,
        preferredViewingDistanceM: preferredViewingDistanceM,
        siteOffsetXM: siteOffsetXM,
        siteOffsetZM: siteOffsetZM
      )
    }
    let anchor = AnchorEntity(world: transform)

    let entity = try loadOrFallbackModel(
      modelUrl: modelUrl,
      fallbackType: fallbackType,
      title: title,
      subtitle: subtitle,
      headline: headline,
      summary: summary,
      placementNote: placementNote,
      contentLayers: contentLayers,
      productionChecklist: productionChecklist
    )
    entity.name = id
    entity.scale = SIMD3<Float>(repeating: scale)
    entity.position = SIMD3<Float>(0, verticalOffsetM, 0)
    let rotationRadians = rotationYDeg * .pi / 180
    entity.orientation = simd_quatf(angle: rotationRadians, axis: SIMD3<Float>(0, 1, 0))

    anchor.addChild(entity)
    arView.scene.addAnchor(anchor)
    coachingOverlay.setActive(false, animated: true)
    hidePlacementGuide()
    updateInfoPanel(title: headline.isEmpty ? title : headline, body: summary.isEmpty ? placementNote : summary)
  }

  private func placementTransform(
    frame: ARFrame,
    anchorStyle: String,
    sitePlacementMode: String,
    preferredViewingDistanceM: Float?,
    siteOffsetXM: Float,
    siteOffsetZM: Float,
    activateCoachingOnFailure: Bool = true
  ) throws -> simd_float4x4 {
    let alignment: ARRaycastQuery.TargetAlignment
    switch anchorStyle {
    case "ground":
      alignment = .horizontal
    case "image_target":
      alignment = .vertical
    default:
      alignment = .any
    }

    let raycastPoints = placementRaycastPoints(for: anchorStyle)
    let targets: [ARRaycastQuery.Target]
    switch anchorStyle {
    case "ground":
      targets = [.existingPlaneGeometry, .existingPlaneInfinite, .estimatedPlane]
    default:
      targets = [.existingPlaneGeometry, .existingPlaneInfinite, .estimatedPlane]
    }

    for target in targets {
      for point in raycastPoints {
        if let query = arView.makeRaycastQuery(from: point, allowing: target, alignment: alignment),
           let result = arView.session.raycast(query).first {
          if anchorStyle == "ground" {
            return siteAwareGroundTransform(
              from: result.worldTransform,
              cameraTransform: frame.camera.transform,
              sitePlacementMode: sitePlacementMode,
              preferredViewingDistanceM: preferredViewingDistanceM,
              siteOffsetXM: siteOffsetXM,
              siteOffsetZM: siteOffsetZM
            )
          }

          return uprightWorldTransform(from: result.worldTransform, cameraTransform: frame.camera.transform)
        }
      }
    }

    if anchorStyle == "ground" {
      if activateCoachingOnFailure {
        coachingOverlay.setActive(true, animated: true)
      }
      throw NSError(
        domain: "PhillyNativeAR",
        code: 1002,
        userInfo: [
          NSLocalizedDescriptionKey: "Scan the ground, sidewalk, or street slowly before placing this building."
        ]
      )
    }

    return fallbackPlacementTransform(cameraTransform: frame.camera.transform, anchorStyle: anchorStyle)
  }

  private func placementRaycastPoints(for anchorStyle: String) -> [CGPoint] {
    let width = arView.bounds.width
    let height = arView.bounds.height

    if anchorStyle == "ground" {
      return [
        CGPoint(x: width * 0.5, y: height * 0.72),
        CGPoint(x: width * 0.5, y: height * 0.82),
        CGPoint(x: width * 0.35, y: height * 0.78),
        CGPoint(x: width * 0.65, y: height * 0.78),
        CGPoint(x: width * 0.5, y: height * 0.62)
      ]
    }

    return [
      CGPoint(x: width * 0.5, y: height * 0.5),
      CGPoint(x: width * 0.5, y: height * 0.62),
      CGPoint(x: width * 0.35, y: height * 0.55),
      CGPoint(x: width * 0.65, y: height * 0.55)
    ]
  }

  private func uprightWorldTransform(from source: simd_float4x4, cameraTransform: simd_float4x4) -> simd_float4x4 {
    var transform = matrix_identity_float4x4
    transform.columns.3 = source.columns.3

    let toCamera = SIMD3<Float>(
      cameraTransform.columns.3.x - source.columns.3.x,
      0,
      cameraTransform.columns.3.z - source.columns.3.z
    )
    let direction = simd_length_squared(toCamera) > 0.0001 ? simd_normalize(toCamera) : SIMD3<Float>(0, 0, 1)
    let yaw = atan2(direction.x, direction.z)
    let rotation = simd_quatf(angle: yaw, axis: SIMD3<Float>(0, 1, 0))
    return simd_mul(transform, matrixFromQuaternion(rotation))
  }

  private func siteAwareGroundTransform(
    from source: simd_float4x4,
    cameraTransform: simd_float4x4,
    sitePlacementMode: String,
    preferredViewingDistanceM: Float?,
    siteOffsetXM: Float,
    siteOffsetZM: Float
  ) -> simd_float4x4 {
    let cameraPosition = SIMD3<Float>(
      cameraTransform.columns.3.x,
      source.columns.3.y,
      cameraTransform.columns.3.z
    )
    let hitPosition = SIMD3<Float>(
      source.columns.3.x,
      source.columns.3.y,
      source.columns.3.z
    )

    var forward = SIMD3<Float>(
      hitPosition.x - cameraPosition.x,
      0,
      hitPosition.z - cameraPosition.z
    )

    if simd_length_squared(forward) < 0.0001 {
      forward = SIMD3<Float>(
        -cameraTransform.columns.2.x,
        0,
        -cameraTransform.columns.2.z
      )
    }

    if simd_length_squared(forward) < 0.0001 {
      forward = SIMD3<Float>(0, 0, -1)
    }

    forward = simd_normalize(forward)
    let right = simd_normalize(SIMD3<Float>(forward.z, 0, -forward.x))

    let currentDistance = simd_length(SIMD3<Float>(hitPosition.x - cameraPosition.x, 0, hitPosition.z - cameraPosition.z))
    let desiredDistance: Float
    if sitePlacementMode == "outdoor_building" {
      desiredDistance = max(preferredViewingDistanceM ?? currentDistance, 4.0)
    } else if sitePlacementMode == "miniature_reconstruction" {
      desiredDistance = preferredViewingDistanceM ?? 2.0
    } else {
      desiredDistance = preferredViewingDistanceM ?? currentDistance
    }

    var targetPosition = hitPosition
    if desiredDistance > 0, currentDistance > 0.0001 {
      targetPosition = cameraPosition + (forward * desiredDistance)
      targetPosition.y = hitPosition.y
    }

    targetPosition += (right * siteOffsetXM)
    targetPosition += (forward * siteOffsetZM)

    var adjusted = matrix_identity_float4x4
    adjusted.columns.3 = SIMD4<Float>(targetPosition.x, targetPosition.y, targetPosition.z, 1)
    return uprightWorldTransform(from: adjusted, cameraTransform: cameraTransform)
  }

  private func fallbackPlacementTransform(cameraTransform: simd_float4x4, anchorStyle: String) -> simd_float4x4 {
    var offset = matrix_identity_float4x4
    offset.columns.3.z = anchorStyle == "ground" ? -1.2 : -1.0
    let source = simd_mul(cameraTransform, offset)
    return uprightWorldTransform(from: source, cameraTransform: cameraTransform)
  }

  private func matrixFromQuaternion(_ rotation: simd_quatf) -> simd_float4x4 {
    let basis = simd_float3x3(rotation)
    return simd_float4x4(
      SIMD4<Float>(basis.columns.0.x, basis.columns.0.y, basis.columns.0.z, 0),
      SIMD4<Float>(basis.columns.1.x, basis.columns.1.y, basis.columns.1.z, 0),
      SIMD4<Float>(basis.columns.2.x, basis.columns.2.y, basis.columns.2.z, 0),
      SIMD4<Float>(0, 0, 0, 1)
    )
  }

  private func loadOrFallbackModel(
    modelUrl: String,
    fallbackType: String,
    title: String,
    subtitle: String,
    headline: String,
    summary: String,
    placementNote: String,
    contentLayers: [String],
    productionChecklist: [String]
  ) throws -> ModelEntity {
    for candidate in candidateModelPaths(from: modelUrl) {
      if let localURL = resolveModelURL(candidate) {
        do {
          let loaded = try ModelEntity.loadModel(contentsOf: localURL)
          print("[PhillyNativeAR] Loaded local model: \(localURL.path)")
          return optimizedModelEntity(loaded)
        } catch {
          print("[PhillyNativeAR] Failed loading local model at \(localURL.path): \(error.localizedDescription)")
        }
      }

      if let remoteURL = URL(string: candidate),
         remoteURL.scheme?.hasPrefix("http") == true {
        do {
          let loaded = try ModelEntity.loadModel(contentsOf: remoteURL)
          print("[PhillyNativeAR] Loaded remote model: \(remoteURL.absoluteString)")
          return optimizedModelEntity(loaded)
        } catch {
          print("[PhillyNativeAR] Failed loading remote model at \(remoteURL.absoluteString): \(error.localizedDescription)")
        }
      }
    }

    if fallbackType.lowercased() == "card",
       let cardEntity = makeStoryCardEntity(
        title: title,
        subtitle: subtitle,
        headline: headline,
        summary: summary,
        placementNote: placementNote,
        contentLayers: contentLayers,
        productionChecklist: productionChecklist
       ) {
      print("[PhillyNativeAR] Falling back to story card for model: \(modelUrl)")
      return cardEntity
    }

    print("[PhillyNativeAR] Falling back to default box for model: \(modelUrl)")
    let mesh = MeshResource.generateBox(size: 0.2)
    let material = SimpleMaterial(color: UIColor.systemTeal, roughness: 0.2, isMetallic: false)
    return ModelEntity(mesh: mesh, materials: [material])
  }

  private func optimizedModelEntity(_ entity: ModelEntity) -> ModelEntity {
    guard useLegacyARRendering else { return entity }
    simplifyMaterialsRecursively(for: entity)
    return entity
  }

  private func simplifyMaterialsRecursively(for entity: Entity) {
    if var model = entity.components[ModelComponent.self] {
      let simplified = model.materials.enumerated().map { index, _ in
        let tone: UIColor
        switch index % 4 {
        case 0:
          tone = UIColor(red: 0.86, green: 0.84, blue: 0.80, alpha: 1)
        case 1:
          tone = UIColor(red: 0.33, green: 0.36, blue: 0.42, alpha: 1)
        case 2:
          tone = UIColor(red: 0.52, green: 0.37, blue: 0.28, alpha: 1)
        default:
          tone = UIColor(red: 0.60, green: 0.60, blue: 0.58, alpha: 1)
        }
        return SimpleMaterial(color: tone, roughness: 0.95, isMetallic: false)
      }
      model.materials = simplified
      entity.components.set(model)
    }

    for child in entity.children {
      simplifyMaterialsRecursively(for: child)
    }
  }

  private func makeStoryCardEntity(
    title: String,
    subtitle: String,
    headline: String,
    summary: String,
    placementNote: String,
    contentLayers: [String],
    productionChecklist: [String]
  ) -> ModelEntity? {
    let renderer = UIGraphicsImageRenderer(size: CGSize(width: 1180, height: 720))
    let image = renderer.image { context in
      let cgContext = context.cgContext

      let backgroundColors = [
        UIColor(red: 6/255, green: 3/255, blue: 18/255, alpha: 0.98).cgColor,
        UIColor(red: 19/255, green: 10/255, blue: 37/255, alpha: 0.96).cgColor,
        UIColor(red: 27/255, green: 16/255, blue: 45/255, alpha: 0.98).cgColor
      ] as CFArray
      let colorSpace = CGColorSpaceCreateDeviceRGB()
      if let gradient = CGGradient(colorsSpace: colorSpace, colors: backgroundColors, locations: [0, 0.45, 1]) {
        cgContext.drawLinearGradient(gradient, start: CGPoint(x: 0, y: 0), end: CGPoint(x: 1180, y: 720), options: [])
      }

      UIColor(red: 255/255, green: 140/255, blue: 168/255, alpha: 0.14).setFill()
      UIBezierPath(ovalIn: CGRect(x: 794, y: 94, width: 286, height: 286)).fill()
      UIColor(red: 255/255, green: 188/255, blue: 138/255, alpha: 0.20).setStroke()
      let halo = UIBezierPath(ovalIn: CGRect(x: 744, y: 54, width: 386, height: 386))
      halo.lineWidth = 2
      halo.stroke()

      UIColor(red: 255/255, green: 255/255, blue: 255/255, alpha: 0.08).setStroke()
      UIBezierPath(roundedRect: CGRect(x: 26, y: 24, width: 1128, height: 672), cornerRadius: 34).stroke()

      UIColor(red: 255/255, green: 140/255, blue: 168/255, alpha: 0.92).setFill()
      UIBezierPath(roundedRect: CGRect(x: 42, y: 42, width: 156, height: 42), cornerRadius: 18).fill()

      let badgeText = NSString(string: "LIVE AR")
      badgeText.draw(
        in: CGRect(x: 72, y: 51, width: 110, height: 22),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 20, weight: .bold),
          .foregroundColor: UIColor(red: 43/255, green: 16/255, blue: 33/255, alpha: 1)
        ]
      )

      let titleText = NSString(string: headline)
      titleText.draw(
        in: CGRect(x: 44, y: 118, width: 620, height: 112),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 44, weight: .heavy),
          .foregroundColor: UIColor(red: 1, green: 0.95, blue: 0.92, alpha: 1)
        ]
      )

      let stopTitleText = NSString(string: title)
      stopTitleText.draw(
        in: CGRect(x: 46, y: 214, width: 520, height: 42),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 28, weight: .bold),
          .foregroundColor: UIColor(red: 255/255, green: 188/255, blue: 138/255, alpha: 1)
        ]
      )

      let summaryText = NSString(string: summary)
      summaryText.draw(
        in: CGRect(x: 46, y: 274, width: 552, height: 146),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 25, weight: .regular),
          .foregroundColor: UIColor(red: 230/255, green: 216/255, blue: 232/255, alpha: 1)
        ]
      )

      UIColor(red: 255/255, green: 188/255, blue: 138/255, alpha: 0.18).setFill()
      UIBezierPath(roundedRect: CGRect(x: 44, y: 450, width: 548, height: 100), cornerRadius: 24).fill()

      let placementTitle = NSString(string: "Stand + view")
      placementTitle.draw(
        in: CGRect(x: 68, y: 470, width: 180, height: 26),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 20, weight: .bold),
          .foregroundColor: UIColor(red: 1, green: 0.95, blue: 0.92, alpha: 1)
        ]
      )

      let placementText = NSString(string: placementNote.isEmpty ? subtitle : placementNote)
      placementText.draw(
        in: CGRect(x: 68, y: 504, width: 488, height: 38),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 18, weight: .regular),
          .foregroundColor: UIColor(red: 230/255, green: 216/255, blue: 232/255, alpha: 1)
        ]
      )

      UIColor(red: 18/255, green: 10/255, blue: 34/255, alpha: 0.94).setFill()
      UIBezierPath(roundedRect: CGRect(x: 724, y: 92, width: 386, height: 536), cornerRadius: 34).fill()

      UIColor(red: 255/255, green: 255/255, blue: 255/255, alpha: 0.08).setStroke()
      let frame = UIBezierPath(roundedRect: CGRect(x: 748, y: 116, width: 338, height: 214), cornerRadius: 24)
      frame.lineWidth = 2
      frame.stroke()

      let previewTitle = NSString(string: "Spatial preview")
      previewTitle.draw(
        in: CGRect(x: 778, y: 374, width: 220, height: 24),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 22, weight: .bold),
          .foregroundColor: UIColor(red: 1, green: 0.95, blue: 0.92, alpha: 1)
        ]
      )

      let firstLayer = contentLayers.first ?? "Hero object"
      let secondLayer = contentLayers.dropFirst().first ?? "Guided audio cue"
      let microCopy = NSString(string: "• \(firstLayer)\n• \(secondLayer)\n• Small-display optimized overlay")
      microCopy.draw(
        in: CGRect(x: 778, y: 414, width: 260, height: 120),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 18, weight: .regular),
          .foregroundColor: UIColor(red: 230/255, green: 216/255, blue: 232/255, alpha: 1)
        ]
      )

      UIColor(red: 143/255, green: 215/255, blue: 195/255, alpha: 0.82).setFill()
      UIBezierPath(roundedRect: CGRect(x: 778, y: 562, width: 152, height: 34), cornerRadius: 17).fill()
      let modeText = NSString(string: "3D moment")
      modeText.draw(
        in: CGRect(x: 814, y: 570, width: 100, height: 18),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 16, weight: .bold),
          .foregroundColor: UIColor(red: 20/255, green: 26/255, blue: 25/255, alpha: 1)
        ]
      )

      let footerText = NSString(string: productionChecklist.first ?? "Premium scene in progress")
      footerText.draw(
        in: CGRect(x: 44, y: 620, width: 540, height: 28),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 18, weight: .medium),
          .foregroundColor: UIColor(red: 182/255, green: 159/255, blue: 190/255, alpha: 1)
        ]
      )
    }

    guard let cgImage = image.cgImage,
          let texture = try? TextureResource.generate(from: cgImage, options: .init(semantic: .color)) else {
      return nil
    }

    var material = UnlitMaterial()
    material.color = .init(texture: .init(texture))

    let mesh = MeshResource.generatePlane(width: 0.58, height: 0.355)
    let entity = ModelEntity(mesh: mesh, materials: [material])
    entity.position = SIMD3<Float>(0, 0.08, 0)
    return entity
  }

  private func candidateModelPaths(from raw: String) -> [String] {
    let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return [] }

    if trimmed.lowercased().hasSuffix(".glb") {
      let usdz = String(trimmed.dropLast(4)) + ".usdz"
      return [usdz, trimmed]
    }
    return [trimmed]
  }

  private func configureCloseButton() {
    if #available(iOS 15.0, *) {
      var config = UIButton.Configuration.filled()
      config.title = "Close AR"
      config.baseForegroundColor = .white
      config.baseBackgroundColor = UIColor.black.withAlphaComponent(0.6)
      config.contentInsets = NSDirectionalEdgeInsets(top: 8, leading: 12, bottom: 8, trailing: 12)
      closeButton.configuration = config
    } else {
      closeButton.setTitle("Close AR", for: .normal)
      closeButton.setTitleColor(.white, for: .normal)
      closeButton.backgroundColor = UIColor.black.withAlphaComponent(0.6)
      closeButton.layer.cornerRadius = 12
      closeButton.contentEdgeInsets = UIEdgeInsets(top: 8, left: 12, bottom: 8, right: 12)
    }
    closeButton.translatesAutoresizingMaskIntoConstraints = false
    closeButton.addTarget(self, action: #selector(closeTapped), for: .touchUpInside)
    view.addSubview(closeButton)

    NSLayoutConstraint.activate([
      closeButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 12),
      closeButton.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -12)
    ])
  }

  private func configurePlacementGuide() {
    placementGuideContainer.translatesAutoresizingMaskIntoConstraints = false
    placementGuideContainer.backgroundColor = UIColor.black.withAlphaComponent(0.72)
    placementGuideContainer.layer.cornerRadius = 20
    placementGuideContainer.isHidden = true

    placementGuideLabel.translatesAutoresizingMaskIntoConstraints = false
    placementGuideLabel.numberOfLines = 0
    placementGuideLabel.textColor = .white
    placementGuideLabel.font = UIFont.systemFont(ofSize: 17, weight: .semibold)
    placementGuideLabel.textAlignment = .center

    placementCountdownLabel.translatesAutoresizingMaskIntoConstraints = false
    placementCountdownLabel.textColor = UIColor(red: 0.76, green: 0.90, blue: 1, alpha: 1)
    placementCountdownLabel.font = UIFont.monospacedDigitSystemFont(ofSize: 15, weight: .bold)
    placementCountdownLabel.textAlignment = .center

    placementReticle.translatesAutoresizingMaskIntoConstraints = false
    placementReticle.backgroundColor = .clear
    placementReticle.layer.cornerRadius = 24
    placementReticle.layer.borderWidth = 2
    placementReticle.layer.borderColor = UIColor.systemYellow.withAlphaComponent(0.95).cgColor
    placementReticle.isHidden = true

    infoPanel.translatesAutoresizingMaskIntoConstraints = false
    infoPanel.backgroundColor = UIColor.black.withAlphaComponent(0.74)
    infoPanel.layer.cornerRadius = 18
    infoPanel.layer.borderWidth = 1
    infoPanel.layer.borderColor = UIColor.white.withAlphaComponent(0.12).cgColor
    infoPanel.isHidden = true

    infoTitleLabel.translatesAutoresizingMaskIntoConstraints = false
    infoTitleLabel.numberOfLines = 2
    infoTitleLabel.textColor = .white
    infoTitleLabel.font = UIFont.systemFont(ofSize: 16, weight: .bold)

    infoBodyLabel.translatesAutoresizingMaskIntoConstraints = false
    infoBodyLabel.numberOfLines = 4
    infoBodyLabel.textColor = UIColor(red: 0.88, green: 0.88, blue: 0.92, alpha: 1)
    infoBodyLabel.font = UIFont.systemFont(ofSize: 13, weight: .regular)

    view.addSubview(placementGuideContainer)
    placementGuideContainer.addSubview(placementGuideLabel)
    placementGuideContainer.addSubview(placementCountdownLabel)
    view.addSubview(placementReticle)
    view.addSubview(infoPanel)
    infoPanel.addSubview(infoTitleLabel)
    infoPanel.addSubview(infoBodyLabel)

    NSLayoutConstraint.activate([
      placementGuideContainer.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
      placementGuideContainer.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
      placementGuideContainer.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -24),

      placementGuideLabel.topAnchor.constraint(equalTo: placementGuideContainer.topAnchor, constant: 16),
      placementGuideLabel.leadingAnchor.constraint(equalTo: placementGuideContainer.leadingAnchor, constant: 16),
      placementGuideLabel.trailingAnchor.constraint(equalTo: placementGuideContainer.trailingAnchor, constant: -16),

      placementCountdownLabel.topAnchor.constraint(equalTo: placementGuideLabel.bottomAnchor, constant: 10),
      placementCountdownLabel.leadingAnchor.constraint(equalTo: placementGuideContainer.leadingAnchor, constant: 16),
      placementCountdownLabel.trailingAnchor.constraint(equalTo: placementGuideContainer.trailingAnchor, constant: -16),
      placementCountdownLabel.bottomAnchor.constraint(equalTo: placementGuideContainer.bottomAnchor, constant: -16),

      placementReticle.widthAnchor.constraint(equalToConstant: 48),
      placementReticle.heightAnchor.constraint(equalToConstant: 48),
      placementReticle.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      placementReticle.centerYAnchor.constraint(equalTo: view.topAnchor, constant: view.bounds.height * 0.72),

      infoPanel.widthAnchor.constraint(lessThanOrEqualToConstant: 280),
      infoPanel.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -16),
      infoPanel.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -28),

      infoTitleLabel.topAnchor.constraint(equalTo: infoPanel.topAnchor, constant: 14),
      infoTitleLabel.leadingAnchor.constraint(equalTo: infoPanel.leadingAnchor, constant: 14),
      infoTitleLabel.trailingAnchor.constraint(equalTo: infoPanel.trailingAnchor, constant: -14),

      infoBodyLabel.topAnchor.constraint(equalTo: infoTitleLabel.bottomAnchor, constant: 6),
      infoBodyLabel.leadingAnchor.constraint(equalTo: infoPanel.leadingAnchor, constant: 14),
      infoBodyLabel.trailingAnchor.constraint(equalTo: infoPanel.trailingAnchor, constant: -14),
      infoBodyLabel.bottomAnchor.constraint(equalTo: infoPanel.bottomAnchor, constant: -14)
    ])
  }

  private func showPlacementGuide(message: String) {
    placementGuideLabel.text = message
    placementGuideContainer.isHidden = false
    placementReticle.isHidden = false
    startPlacementValidation()
    startAutoPlacementCountdown()
    view.bringSubviewToFront(placementReticle)
    view.bringSubviewToFront(placementGuideContainer)
    view.bringSubviewToFront(infoPanel)
    view.bringSubviewToFront(closeButton)
  }

  private func hidePlacementGuide() {
    stopPlacementValidation()
    stopAutoPlacementCountdown()
    placementGuideContainer.isHidden = true
    placementReticle.isHidden = true
  }

  private func startPlacementValidation() {
    stopPlacementValidation()
    refreshPlacementCandidate()
    placementValidationTimer = Timer.scheduledTimer(withTimeInterval: 0.2, repeats: true) { [weak self] _ in
      self?.refreshPlacementCandidate()
    }
  }

  private func stopPlacementValidation() {
    placementValidationTimer?.invalidate()
    placementValidationTimer = nil
    cachedPlacementTransform = nil
  }

  private func startAutoPlacementCountdown() {
    stopAutoPlacementCountdown()
    autoPlacementDeadline = Date().addingTimeInterval(autoPlacementDelay)
    updateAutoPlacementCountdownLabel()
    autoPlacementTimer = Timer.scheduledTimer(withTimeInterval: 0.2, repeats: true) { [weak self] _ in
      self?.updateAutoPlacementCountdownLabel()
    }
  }

  private func stopAutoPlacementCountdown() {
    autoPlacementTimer?.invalidate()
    autoPlacementTimer = nil
    autoPlacementDeadline = nil
    placementCountdownLabel.text = nil
  }

  private func updateAutoPlacementCountdownLabel() {
    guard let deadline = autoPlacementDeadline else {
      placementCountdownLabel.text = nil
      return
    }

    let remaining = max(0, deadline.timeIntervalSinceNow)
    placementCountdownLabel.text = remaining > 0.05
      ? String(format: "Automatic placement in %.1fs", remaining)
      : "Placing exhibit now…"

    if remaining <= 0.05 {
      stopAutoPlacementCountdown()
      autoPlacePendingPlacement()
    }
  }

  private func refreshPlacementCandidate() {
    guard let pendingPlacement,
          let frame = arView.session.currentFrame else {
      cachedPlacementTransform = nil
      updatePlacementGuideAvailability(isValid: false)
      return
    }

    do {
      cachedPlacementTransform = try placementTransform(
        frame: frame,
        anchorStyle: pendingPlacement.anchorStyle,
        sitePlacementMode: pendingPlacement.sitePlacementMode,
        preferredViewingDistanceM: pendingPlacement.preferredViewingDistanceM,
        siteOffsetXM: pendingPlacement.siteOffsetXM,
        siteOffsetZM: pendingPlacement.siteOffsetZM,
        activateCoachingOnFailure: false
      )
      updatePlacementGuideAvailability(isValid: true)
    } catch {
      cachedPlacementTransform = nil
      updatePlacementGuideAvailability(isValid: false)
    }
  }

  private func updatePlacementGuideAvailability(isValid: Bool) {
    placementReticle.layer.borderColor = (isValid
      ? UIColor.systemGreen.withAlphaComponent(0.95)
      : UIColor.systemOrange.withAlphaComponent(0.95)).cgColor
  }

  private func cancelPendingPlacement(message: String) {
    guard let pendingPlacement else {
      hidePlacementGuide()
      return
    }
    self.pendingPlacement = nil
    hidePlacementGuide()
    pendingPlacement.onCancelled(
      NSError(domain: "PhillyNativeAR", code: 1003, userInfo: [NSLocalizedDescriptionKey: message])
    )
  }

  private func updateInfoPanel(title: String?, body: String?) {
    let trimmedTitle = title?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    let trimmedBody = body?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    let isVisible = !trimmedTitle.isEmpty || !trimmedBody.isEmpty
    infoPanel.isHidden = !isVisible
    infoTitleLabel.text = trimmedTitle.isEmpty ? nil : trimmedTitle
    infoBodyLabel.text = trimmedBody.isEmpty ? nil : trimmedBody
  }

  private func configureCoachingOverlay() {
    coachingOverlay.session = arView.session
    coachingOverlay.delegate = self
    coachingOverlay.activatesAutomatically = true
    coachingOverlay.translatesAutoresizingMaskIntoConstraints = false
    coachingOverlay.backgroundColor = .clear
    view.addSubview(coachingOverlay)

    NSLayoutConstraint.activate([
      coachingOverlay.topAnchor.constraint(equalTo: view.topAnchor),
      coachingOverlay.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      coachingOverlay.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      coachingOverlay.bottomAnchor.constraint(equalTo: view.bottomAnchor)
    ])

    updateCoachingGoal(for: currentAnchorStyle)
  }

  private func updateCoachingGoal(for anchorStyle: String) {
    switch anchorStyle {
    case "ground":
      coachingOverlay.goal = .horizontalPlane
    case "image_target":
      coachingOverlay.goal = .verticalPlane
    default:
      coachingOverlay.goal = .anyPlane
    }
  }

  @objc
  private func closeTapped() {
    stopSession()
    dismiss(animated: true)
  }

  private func autoPlacePendingPlacement() {
    guard let pendingPlacement else { return }

    let overrideTransform: simd_float4x4?
    if let cachedPlacementTransform {
      overrideTransform = cachedPlacementTransform
    } else if let frame = arView.session.currentFrame {
      overrideTransform = fallbackPlacementTransform(cameraTransform: frame.camera.transform, anchorStyle: pendingPlacement.anchorStyle)
    } else {
      overrideTransform = nil
    }

    guard let overrideTransform else {
      placementGuideLabel.text = "Move slowly for a moment while AR locks the exhibit into place."
      coachingOverlay.setActive(true, animated: true)
      startAutoPlacementCountdown()
      return
    }

    do {
      try placeModelImmediately(
        id: pendingPlacement.id,
        modelUrl: pendingPlacement.modelUrl,
        scale: pendingPlacement.scale,
        rotationYDeg: pendingPlacement.rotationYDeg,
        verticalOffsetM: pendingPlacement.verticalOffsetM,
        anchorStyle: pendingPlacement.anchorStyle,
        fallbackType: pendingPlacement.fallbackType,
        sitePlacementMode: pendingPlacement.sitePlacementMode,
        preferredViewingDistanceM: pendingPlacement.preferredViewingDistanceM,
        siteOffsetXM: pendingPlacement.siteOffsetXM,
        siteOffsetZM: pendingPlacement.siteOffsetZM,
        title: pendingPlacement.title,
        subtitle: pendingPlacement.subtitle,
        headline: pendingPlacement.headline,
        summary: pendingPlacement.summary,
        placementNote: pendingPlacement.placementNote,
        contentLayers: pendingPlacement.contentLayers,
        productionChecklist: pendingPlacement.productionChecklist,
        overrideTransform: overrideTransform
      )
      self.pendingPlacement = nil
      pendingPlacement.onPlaced()
    } catch {
      print("[PhillyNativeAR] Auto-placement failed for \(pendingPlacement.id): \(error.localizedDescription)")
      placementGuideLabel.text = error.localizedDescription
      coachingOverlay.setActive(true, animated: true)
      startAutoPlacementCountdown()
    }
  }

  private func resolveModelURL(_ rawPath: String) -> URL? {
    let trimmed = rawPath.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return nil }

    if let directURL = URL(string: trimmed), directURL.isFileURL {
      return directURL
    }

    let normalized = trimmed.hasPrefix("/") ? String(trimmed.dropFirst()) : trimmed
    let ns = normalized as NSString
    let ext = ns.pathExtension
    let base = ns.deletingPathExtension
    let bundle = Bundle.main

    var resourceCandidates: [String] = [normalized]
    if !normalized.hasPrefix("ARAssets/") {
      resourceCandidates.append("ARAssets/\(normalized)")
    }
    if !normalized.hasPrefix("models/") {
      resourceCandidates.append("models/\(normalized)")
    } else {
      let tail = String(normalized.dropFirst("models/".count))
      resourceCandidates.append(tail)
      resourceCandidates.append("ARAssets/\(normalized)")
    }

    if ext.isEmpty {
      if let bundled = bundle.url(forResource: base, withExtension: nil) {
        return bundled
      }

      for candidate in resourceCandidates {
        if let url = bundle.resourceURL?.appendingPathComponent(candidate),
           FileManager.default.fileExists(atPath: url.path) {
          return url
        }
      }
      return nil
    }

    if let bundled = bundle.url(forResource: base, withExtension: ext) {
      return bundled
    }

    for candidate in resourceCandidates {
      if let url = bundle.resourceURL?.appendingPathComponent(candidate),
         FileManager.default.fileExists(atPath: url.path) {
        return url
      }
    }

    return nil
  }
}

extension PhillyARViewController: ARCoachingOverlayViewDelegate {
  func coachingOverlayViewWillActivate(_ coachingOverlayView: ARCoachingOverlayView) {}

  func coachingOverlayViewDidDeactivate(_ coachingOverlayView: ARCoachingOverlayView) {}

  func coachingOverlayViewDidRequestSessionReset(_ coachingOverlayView: ARCoachingOverlayView) {
    restartSession()
  }
}
