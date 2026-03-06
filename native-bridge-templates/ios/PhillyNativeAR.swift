import Foundation
import ARKit
import RealityKit

@objc(PhillyNativeAR)
class PhillyNativeAR: NSObject {
  private var isSessionRunning: Bool = false

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc(getStatus:rejecter:)
  func getStatus(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if #available(iOS 13.0, *), ARWorldTrackingConfiguration.isSupported {
      resolve(["available": true, "reason": "ARKit available"])
    } else {
      resolve(["available": false, "reason": "ARKit unsupported on this device"])
    }
  }

  @objc(startSession:rejecter:)
  func startSession(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if !ARWorldTrackingConfiguration.isSupported {
      reject("ARKIT_UNAVAILABLE", "ARKit is not supported", nil)
      return
    }

    isSessionRunning = true
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

    // TODO: Hook into your RealityKit/ARView scene graph and load placement["modelUrl"].
    resolve(nil)
  }

  @objc(stopSession:rejecter:)
  func stopSession(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    isSessionRunning = false
    resolve(nil)
  }
}
