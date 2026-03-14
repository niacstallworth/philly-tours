package com.founders.phillyartours

import android.content.pm.PackageManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap

class PhillyNativeARModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private var sessionRunning = false
  private val placedModelIds = linkedSetOf<String>()

  override fun getName(): String = "PhillyNativeAR"

  private fun isARCapable(): Boolean {
    val pm = reactContext.packageManager
    return pm.hasSystemFeature("android.hardware.camera.ar") ||
      pm.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)
  }

  @ReactMethod
  fun getStatus(promise: Promise) {
    val capable = isARCapable()
    val payload = WritableNativeMap().apply {
      putBoolean("available", capable)
      putString(
        "reason",
        if (capable) "ARCore bridge loaded. Runtime AR support depends on Google Play Services for AR."
        else "Device reports no AR-capable camera feature."
      )
      putBoolean("sessionRunning", sessionRunning)
      putInt("placedModelCount", placedModelIds.size)
    }
    promise.resolve(payload)
  }

  @ReactMethod
  fun startSession(promise: Promise) {
    if (!isARCapable()) {
      promise.reject("ARCORE_UNAVAILABLE", "ARCore unavailable on this device")
      return
    }

    sessionRunning = true
    placedModelIds.clear()
    promise.resolve(null)
  }

  @ReactMethod
  fun placeModel(placement: ReadableMap, promise: Promise) {
    if (!sessionRunning) {
      promise.reject("SESSION_NOT_RUNNING", "Call startSession first")
      return
    }

    if (!placement.hasKey("id") || !placement.hasKey("modelUrl")) {
      promise.reject("INVALID_PLACEMENT", "placement.id and placement.modelUrl are required")
      return
    }

    val id = placement.getString("id")?.trim().orEmpty()
    val modelUrl = placement.getString("modelUrl")?.trim().orEmpty()
    if (id.isEmpty() || modelUrl.isEmpty()) {
      promise.reject("INVALID_PLACEMENT", "placement.id and placement.modelUrl cannot be empty")
      return
    }

    if (placement.hasKey("scale") && !placement.isNull("scale")) {
      val scale = placement.getDouble("scale")
      if (scale <= 0.0) {
        promise.reject("INVALID_PLACEMENT", "placement.scale must be > 0")
        return
      }
    }

    // TODO: Bind into ARCore scene graph and place modelUrl at runtime hit-test result.
    placedModelIds.add(id)
    promise.resolve(null)
  }

  @ReactMethod
  fun stopSession(promise: Promise) {
    sessionRunning = false
    placedModelIds.clear()
    promise.resolve(null)
  }
}
