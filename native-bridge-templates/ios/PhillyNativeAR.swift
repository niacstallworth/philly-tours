import Foundation
import ARKit
import RealityKit

@objc(PhillyNativeAR)
class PhillyNativeAR: NSObject {
  private var isSessionRunning: Bool = false
  private var placedModelIds: Set<String> = []

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc(getStatus:rejecter:)
  func getStatus(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let supported = ARWorldTrackingConfiguration.isSupported
    resolve([
      "available": supported,
      "reason": supported ? "ARKit available" : "ARKit unsupported on this device",
      "sessionRunning": isSessionRunning,
      "placedModelCount": placedModelIds.count
    ])
  }

  @objc(startSession:rejecter:)
  func startSession(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    guard ARWorldTrackingConfiguration.isSupported else {
      reject("ARKIT_UNAVAILABLE", "ARKit is not supported", nil)
      return
    }

    isSessionRunning = true
    placedModelIds.removeAll()
    resolve(nil)
  }

  @objc(placeModel:resolver:rejecter:)
  func placeModel(_ placement: NSDictionary,
                  resolver resolve: RCTPromiseResolveBlock,
                  rejecter reject: RCTPromiseRejectBlock) {
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

    if let scale = placement["scale"] as? NSNumber, scale.doubleValue <= 0 {
      reject("INVALID_PLACEMENT", "placement.scale must be > 0", nil)
      return
    }

    // TODO: Hook into RealityKit/ARView and place `modelUrl` at hit-test/raycast position.
    placedModelIds.insert(id)
    resolve(nil)
  }

  @objc(stopSession:rejecter:)
  func stopSession(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    isSessionRunning = false
    placedModelIds.removeAll()
    resolve(nil)
  }
}
