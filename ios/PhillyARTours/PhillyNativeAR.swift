import Foundation
import UIKit
import React
import ARKit
import RealityKit

@objc(PhillyNativeAR)
class PhillyNativeAR: NSObject {
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
        self.isSessionRunning = true
        self.placedModelIds.removeAll()
        resolve(nil)
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
        self.isSessionRunning = true
        self.placedModelIds.removeAll()
        resolve(nil)
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
    let fallbackType = (placement["fallbackType"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "box"
    let title = (placement["title"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? id
    let subtitle = (placement["subtitle"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "Historic AR stop"
    let headline = (placement["headline"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? title
    let summary = (placement["summary"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? subtitle
    let placementNote = (placement["placementNote"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    let plannedProvider = (placement["plannedProvider"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "unassigned"
    let generatedProvider = (placement["generatedProvider"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "not generated"
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
          fallbackType: fallbackType,
          title: title,
          subtitle: subtitle,
          headline: headline,
          summary: summary,
          placementNote: placementNote,
          plannedProvider: plannedProvider,
          generatedProvider: generatedProvider,
          contentLayers: contentLayers,
          productionChecklist: productionChecklist
        )
        self.placedModelIds.insert(id)
        resolve(nil)
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
  private let arView = ARView(frame: .zero)
  private let closeButton = UIButton(type: .system)

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .black
    arView.frame = view.bounds
    arView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    view.addSubview(arView)
    configureCloseButton()
    restartSession()
  }

  func restartSession() {
    let config = ARWorldTrackingConfiguration()
    config.planeDetection = [.horizontal, .vertical]
    config.environmentTexturing = .automatic
    arView.session.run(config, options: [.resetTracking, .removeExistingAnchors])
  }

  func stopSession() {
    arView.session.pause()
    arView.scene.anchors.removeAll()
  }

  func placeModel(
    id: String,
    modelUrl: String,
    scale: Float,
    rotationYDeg: Float,
    fallbackType: String,
    title: String,
    subtitle: String,
    headline: String,
    summary: String,
    placementNote: String,
    plannedProvider: String,
    generatedProvider: String,
    contentLayers: [String],
    productionChecklist: [String]
  ) throws {
    guard let frame = arView.session.currentFrame else {
      throw NSError(domain: "PhillyNativeAR", code: 1001, userInfo: [NSLocalizedDescriptionKey: "AR frame unavailable"]) 
    }

    var offset = matrix_identity_float4x4
    offset.columns.3.z = -1.0
    let transform = simd_mul(frame.camera.transform, offset)
    let anchor = AnchorEntity(world: transform)

    let entity = try loadOrFallbackModel(
      modelUrl: modelUrl,
      fallbackType: fallbackType,
      title: title,
      subtitle: subtitle,
      headline: headline,
      summary: summary,
      placementNote: placementNote,
      plannedProvider: plannedProvider,
      generatedProvider: generatedProvider,
      contentLayers: contentLayers,
      productionChecklist: productionChecklist
    )
    entity.name = id
    entity.scale = SIMD3<Float>(repeating: scale)
    let rotationRadians = rotationYDeg * .pi / 180
    entity.orientation = simd_quatf(angle: rotationRadians, axis: SIMD3<Float>(0, 1, 0))

    anchor.addChild(entity)
    arView.scene.addAnchor(anchor)
  }

  private func loadOrFallbackModel(
    modelUrl: String,
    fallbackType: String,
    title: String,
    subtitle: String,
    headline: String,
    summary: String,
    placementNote: String,
    plannedProvider: String,
    generatedProvider: String,
    contentLayers: [String],
    productionChecklist: [String]
  ) throws -> ModelEntity {
    for candidate in candidateModelPaths(from: modelUrl) {
      if let localURL = resolveModelURL(candidate),
         let loaded = try? ModelEntity.loadModel(contentsOf: localURL) {
        return loaded
      }

      if let remoteURL = URL(string: candidate),
         remoteURL.scheme?.hasPrefix("http") == true,
         let loaded = try? ModelEntity.loadModel(contentsOf: remoteURL) {
        return loaded
      }
    }

    if fallbackType.lowercased() == "card",
       let cardEntity = makeStoryCardEntity(
        title: title,
        subtitle: subtitle,
        headline: headline,
        summary: summary,
        placementNote: placementNote,
        plannedProvider: plannedProvider,
        generatedProvider: generatedProvider,
        contentLayers: contentLayers,
        productionChecklist: productionChecklist
       ) {
      return cardEntity
    }

    let mesh = MeshResource.generateBox(size: 0.2)
    let material = SimpleMaterial(color: UIColor.systemTeal, roughness: 0.2, isMetallic: false)
    return ModelEntity(mesh: mesh, materials: [material])
  }

  private func makeStoryCardEntity(
    title: String,
    subtitle: String,
    headline: String,
    summary: String,
    placementNote: String,
    plannedProvider: String,
    generatedProvider: String,
    contentLayers: [String],
    productionChecklist: [String]
  ) -> ModelEntity? {
    let renderer = UIGraphicsImageRenderer(size: CGSize(width: 1200, height: 760))
    let image = renderer.image { context in
      let bounds = CGRect(x: 0, y: 0, width: 1200, height: 760)
      UIColor(red: 8/255, green: 15/255, blue: 33/255, alpha: 0.96).setFill()
      UIBezierPath(roundedRect: bounds, cornerRadius: 34).fill()

      UIColor(red: 59/255, green: 130/255, blue: 246/255, alpha: 1).setFill()
      UIBezierPath(roundedRect: CGRect(x: 28, y: 28, width: 236, height: 56), cornerRadius: 20).fill()

      let badgeText = NSString(string: "AR STORY CARD")
      badgeText.draw(
        in: CGRect(x: 52, y: 42, width: 190, height: 24),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 24, weight: .bold),
          .foregroundColor: UIColor.white
        ]
      )

      let titleText = NSString(string: headline)
      titleText.draw(
        in: CGRect(x: 44, y: 114, width: 660, height: 110),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 46, weight: .heavy),
          .foregroundColor: UIColor.white
        ]
      )

      let stopTitleText = NSString(string: title)
      stopTitleText.draw(
        in: CGRect(x: 44, y: 212, width: 660, height: 48),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 30, weight: .bold),
          .foregroundColor: UIColor(red: 147/255, green: 197/255, blue: 253/255, alpha: 1)
        ]
      )

      let subtitleText = NSString(string: subtitle)
      subtitleText.draw(
        in: CGRect(x: 44, y: 258, width: 660, height: 74),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 28, weight: .medium),
          .foregroundColor: UIColor(white: 0.88, alpha: 1)
        ]
      )

      let summaryText = NSString(string: summary)
      summaryText.draw(
        in: CGRect(x: 44, y: 346, width: 660, height: 144),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 24, weight: .regular),
          .foregroundColor: UIColor.white
        ]
      )

      let placementText = NSString(string: placementNote.isEmpty ? "Placement note unavailable." : placementNote)
      placementText.draw(
        in: CGRect(x: 44, y: 512, width: 660, height: 126),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 22, weight: .regular),
          .foregroundColor: UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 1)
        ]
      )

      UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 0.94).setFill()
      UIBezierPath(roundedRect: CGRect(x: 736, y: 110, width: 420, height: 584), cornerRadius: 28).fill()

      UIColor(red: 30/255, green: 41/255, blue: 59/255, alpha: 1).setFill()
      UIBezierPath(roundedRect: CGRect(x: 764, y: 188, width: 364, height: 204), cornerRadius: 18).fill()

      let metadataHeader = NSString(string: "Scene runtime")
      metadataHeader.draw(
        in: CGRect(x: 764, y: 140, width: 240, height: 32),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 28, weight: .bold),
          .foregroundColor: UIColor.white
        ]
      )

      let providerLine = NSString(string: "Planned: \(plannedProvider)\nGenerated: \(generatedProvider)")
      providerLine.draw(
        in: CGRect(x: 764, y: 412, width: 320, height: 60),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 20, weight: .medium),
          .foregroundColor: UIColor(red: 253/255, green: 224/255, blue: 71/255, alpha: 1)
        ]
      )

      let layersBody = contentLayers.prefix(4).isEmpty ? "Scene layers pending" : contentLayers.prefix(4).joined(separator: "\n• ")
      let layersText = NSString(string: "Layers\n• \(layersBody)")
      layersText.draw(
        in: CGRect(x: 764, y: 492, width: 336, height: 124),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 22, weight: .regular),
          .foregroundColor: UIColor.white
        ]
      )

      let checklistBody = productionChecklist.prefix(4).isEmpty ? "Production checklist pending" : productionChecklist.prefix(4).joined(separator: "\n• ")
      let checklistText = NSString(string: "Checklist\n• \(checklistBody)")
      checklistText.draw(
        in: CGRect(x: 764, y: 620, width: 336, height: 108),
        withAttributes: [
          .font: UIFont.systemFont(ofSize: 22, weight: .regular),
          .foregroundColor: UIColor(red: 191/255, green: 219/255, blue: 254/255, alpha: 1)
        ]
      )
    }

    guard let cgImage = image.cgImage,
          let texture = try? TextureResource.generate(from: cgImage, options: .init(semantic: .color)) else {
      return nil
    }

    var material = UnlitMaterial()
    material.color = .init(texture: .init(texture))

    let mesh = MeshResource.generatePlane(width: 0.62, height: 0.39)
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

  @objc
  private func closeTapped() {
    dismiss(animated: true)
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

    if ext.isEmpty {
      return Bundle.main.url(forResource: base, withExtension: nil)
    }

    return Bundle.main.url(forResource: base, withExtension: ext)
  }
}
