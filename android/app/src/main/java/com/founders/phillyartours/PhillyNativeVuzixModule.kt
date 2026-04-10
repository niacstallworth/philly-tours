package com.founders.phillyartours

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import java.lang.reflect.Modifier

class PhillyNativeVuzixModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "PhillyNativeVuzix"

  @ReactMethod
  fun getStatus(promise: Promise) {
    try {
      promise.resolve(buildStatusPayload())
    } catch (error: Throwable) {
      promise.reject("VUZIX_STATUS_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun requestControl(promise: Promise) {
    try {
      if (!isRuntimeAvailable()) {
        throw IllegalStateException("Vuzix Z100 SDK is not enabled in this build.")
      }

      getSdkInstance()?.javaClass?.getMethod("requestControl")?.invoke(getSdkInstance())
      promise.resolve(buildStatusPayload("Requested Vuzix display control."))
    } catch (error: Throwable) {
      promise.reject("VUZIX_REQUEST_CONTROL_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun releaseControl(promise: Promise) {
    try {
      if (!isRuntimeAvailable()) {
        throw IllegalStateException("Vuzix Z100 SDK is not enabled in this build.")
      }

      getSdkInstance()?.javaClass?.getMethod("releaseControl")?.invoke(getSdkInstance())
      promise.resolve(buildStatusPayload("Released Vuzix display control."))
    } catch (error: Throwable) {
      promise.reject("VUZIX_RELEASE_CONTROL_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun sendNotification(title: String, body: String, promise: Promise) {
    try {
      if (!isRuntimeAvailable()) {
        throw IllegalStateException("Vuzix Z100 SDK is not enabled in this build.")
      }

      val sdk = getSdkInstance() ?: throw IllegalStateException("Vuzix SDK instance is unavailable.")
      sdk.javaClass
        .getMethod("sendNotification", String::class.java, String::class.java)
        .invoke(sdk, title, body)
      promise.resolve(buildStatusPayload("Sent notification to Vuzix glasses."))
    } catch (error: NoSuchMethodException) {
      promise.reject("VUZIX_SEND_NOTIFICATION_FAILED", "This Vuzix SDK build does not expose the expected notification method.", error)
    } catch (error: Throwable) {
      promise.reject("VUZIX_SEND_NOTIFICATION_FAILED", error.message, error)
    }
  }

  private fun buildStatusPayload(statusNote: String? = null): WritableNativeMap {
    val payload = WritableNativeMap()
    val available = readBooleanState("getAvailable")
    val linked = readBooleanState("getLinked")
    val connected = readBooleanState("getConnected")
    val controlled = readBooleanState("getControlledByMe")
    val runtimeAvailable = isRuntimeAvailable()

    payload.putBoolean("sdkEnabled", BuildConfig.VUZIX_ULTRALITE_SDK_ENABLED)
    payload.putBoolean("runtimeAvailable", runtimeAvailable)
    payload.putBoolean("available", available)
    payload.putBoolean("linked", linked)
    payload.putBoolean("connected", connected)
    payload.putBoolean("controlledByMe", controlled)
    payload.putString("deviceName", readSdkString("getName"))
    payload.putString(
      "statusMessage",
      statusNote ?: when {
        !BuildConfig.VUZIX_ULTRALITE_SDK_ENABLED ->
          "Vuzix scaffold is present, but the Ultralite SDK dependency is disabled for this build."
        !runtimeAvailable ->
          "Vuzix SDK dependency was enabled, but the runtime classes are not available."
        controlled ->
          "Vuzix glasses are connected and this app currently controls the display."
        connected ->
          "Vuzix glasses are connected and ready for display control."
        linked ->
          "Vuzix glasses are linked through Vuzix Connect, but not currently connected."
        available ->
          "Vuzix SDK is available on this device."
        else ->
          "Vuzix SDK is not currently available. Check Android version, Vuzix Connect, and paired Z100 glasses."
      }
    )
    payload.putArray("capabilities", WritableNativeArray().apply {
      pushString("display_control")
      pushString("notifications")
      pushString("tap_input")
    })
    return payload
  }

  private fun isRuntimeAvailable(): Boolean {
    if (!BuildConfig.VUZIX_ULTRALITE_SDK_ENABLED) {
      return false
    }

    return try {
      Class.forName("com.vuzix.ultralite.UltraliteSDK")
      true
    } catch (_: Throwable) {
      false
    }
  }

  private fun getSdkInstance(): Any? {
    if (!isRuntimeAvailable()) {
      return null
    }

    val sdkClass = Class.forName("com.vuzix.ultralite.UltraliteSDK")
    val getMethod = sdkClass.getMethod("get", Context::class.java)
    val target =
      if (Modifier.isStatic(getMethod.modifiers)) {
        null
      } else {
        sdkClass.getField("INSTANCE").get(null)
      }
    return getMethod.invoke(target, reactContext.applicationContext)
  }

  private fun readSdkString(methodName: String): String? {
    return try {
      getSdkInstance()?.javaClass?.getMethod(methodName)?.invoke(getSdkInstance()) as? String
    } catch (_: Throwable) {
      null
    }
  }

  private fun readBooleanState(methodName: String): Boolean {
    if (!isRuntimeAvailable()) {
      return false
    }

    return try {
      val sdk = getSdkInstance() ?: return false
      val liveData = sdk.javaClass.getMethod(methodName).invoke(sdk) ?: return false
      val value = liveData.javaClass.getMethod("getValue").invoke(liveData)
      value as? Boolean ?: false
    } catch (_: Throwable) {
      false
    }
  }
}
