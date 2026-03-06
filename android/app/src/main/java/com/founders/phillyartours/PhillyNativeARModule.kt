package com.founders.phillyartours

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap

class PhillyNativeARModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private var sessionRunning = false

  override fun getName(): String = "PhillyNativeAR"

  @ReactMethod
  fun getStatus(promise: Promise) {
    val payload = WritableNativeMap().apply {
      putBoolean("available", true)
      putString("reason", "ARCore module loaded")
    }
    promise.resolve(payload)
  }

  @ReactMethod
  fun startSession(promise: Promise) {
    sessionRunning = true
    promise.resolve(null)
  }

  @ReactMethod
  fun placeModel(placement: ReadableMap, promise: Promise) {
    if (!sessionRunning) {
      promise.reject("SESSION_NOT_RUNNING", "Call startSession first")
      return
    }

    // TODO: Hook into ARCore scene and place `placement.getString("modelUrl")`.
    promise.resolve(null)
  }

  @ReactMethod
  fun stopSession(promise: Promise) {
    sessionRunning = false
    promise.resolve(null)
  }
}
