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
    let renderer = UIGraphicsImageRenderer(size: CGSize(width: 1180, height: 720))
    let image = renderer.image { context in
      let bounds = CGRect(x: 0, y: 0, width: 1180, height: 720)
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
