package com.founders.phillyartours

import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import java.lang.reflect.Modifier

class PhillyNativeWearablesModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var manualConnected = false
  private var lastStatusNote: String? = null
  private var lastErrorMessage: String? = null

  override fun getName(): String = "PhillyNativeWearables"

  @ReactMethod
  fun getStatus(promise: Promise) {
    try {
      promise.resolve(buildStatusPayload())
    } catch (error: Throwable) {
      promise.reject("META_WEARABLE_STATUS_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun pairWearable(promise: Promise) {
    try {
      val activity = currentActivity
      if (isDatRuntimeAvailable()) {
        if (activity == null) {
          throw IllegalStateException("Open the app on screen before starting Meta registration.")
        }

        initializeDatIfPossible()
        invokeWearablesStatic("startRegistration", arrayOf(Activity::class.java), arrayOf(activity))
        lastErrorMessage = null
        lastStatusNote =
          "Meta registration started on Android. Complete the flow in the Meta AI app, then return here."
      } else {
        manualConnected = true
        lastErrorMessage = null
        lastStatusNote =
          "Meta glasses audio mode enabled. Pair the glasses in Android Bluetooth settings to hear narration through them."
      }

      promise.resolve(buildStatusPayload())
    } catch (error: Throwable) {
      lastErrorMessage = error.message ?: "Meta registration failed."
      promise.reject("META_WEARABLE_PAIR_FAILED", lastErrorMessage, error)
    }
  }

  @ReactMethod
  fun disconnectWearable(promise: Promise) {
    try {
      val activity = currentActivity
      if (isDatRuntimeAvailable()) {
        if (activity == null) {
          throw IllegalStateException("Open the app on screen before removing Meta registration.")
        }

        initializeDatIfPossible()
        invokeWearablesStatic("startUnregistration", arrayOf(Activity::class.java), arrayOf(activity))
        lastErrorMessage = null
        lastStatusNote =
          "Meta wearables unregistration started in the Meta AI app."
      } else {
        manualConnected = false
        lastErrorMessage = null
        lastStatusNote = "Meta glasses audio mode disabled on Android."
      }

      promise.resolve(buildStatusPayload())
    } catch (error: Throwable) {
      lastErrorMessage = error.message ?: "Meta unregistration failed."
      promise.reject("META_WEARABLE_DISCONNECT_FAILED", lastErrorMessage, error)
    }
  }

  private fun buildStatusPayload(): WritableNativeMap {
    initializeDatIfPossible()
    val payload = WritableNativeMap()
    val datRuntimeAvailable = isDatRuntimeAvailable()
    val datConfigured = BuildConfig.META_WEARABLES_DAT_ENABLED && datRuntimeAvailable
    val pairedDeviceId = readFirstDeviceIdentifier()
    val registrationStateName = readRegistrationStateName()
    val connectionState = when {
      datConfigured && registrationStateName.contains("Registering") -> "pairing"
      datConfigured && pairedDeviceId != null -> "connected"
      datConfigured && registrationStateName.contains("Registered") -> "idle"
      datConfigured && registrationStateName.contains("Available") -> "idle"
      datConfigured && registrationStateName.contains("Unavailable") -> "error"
      manualConnected -> "connected"
      else -> "idle"
    }

    payload.putBoolean("supported", datConfigured || isManualModeAvailable())
    payload.putString("connectionState", connectionState)
    payload.putMap("pairedDevice", buildDevicePayload(pairedDeviceId, datConfigured))
    payload.putArray("grantedPermissions", buildPermissionsPayload(datConfigured))
    payload.putString("lastError", lastErrorMessage)
    payload.putString("integrationMode", if (datConfigured) "native" else if (isManualModeAvailable()) "manual" else "none")
    payload.putString("platformLabel", "Android")
    payload.putString(
      "statusMessage",
      when {
        datConfigured ->
          lastStatusNote ?: "Meta DAT is enabled on Android. Registration and device discovery are available in this build."
        BuildConfig.META_WEARABLES_DAT_ENABLED && !datRuntimeAvailable ->
          "Meta DAT was enabled for Android, but the SDK dependency is not available in this build. Check the GitHub Packages token and Gradle sync."
        isManualModeAvailable() ->
          lastStatusNote
            ?: "Android manual Meta glasses mode is active. Pair the glasses in Bluetooth settings to route narration through them."
        else -> "Meta glasses are not available in this Android build."
      }
    )
    return payload
  }

  private fun buildPermissionsPayload(datConfigured: Boolean): WritableNativeArray {
    val permissions = WritableNativeArray()
    if (datConfigured) {
      permissions.pushString("device_state")
    }
    return permissions
  }

  private fun buildDevicePayload(deviceId: String?, datConfigured: Boolean): WritableNativeMap? {
    if (datConfigured && deviceId == null) {
      return null
    }

    if (!datConfigured && !manualConnected) {
      return null
    }

    return WritableNativeMap().apply {
      putString("id", deviceId ?: "meta-glasses-manual-android")
      putString("model", "Meta AI Glasses")
      putString(
        "displayName",
        if (datConfigured) {
          "Meta Glasses ${deviceId ?: ""}".trim()
        } else {
          "Meta Glasses (Bluetooth audio)"
        }
      )
      putString("platform", "meta_glasses")
      val capabilities = WritableNativeArray().apply {
        if (datConfigured) {
          pushString("device_state")
        }
      }
      putArray("capabilities", capabilities)
    }
  }

  private fun isManualModeAvailable(): Boolean {
    return reactContext.packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH)
  }

  private fun isDatRuntimeAvailable(): Boolean {
    if (!BuildConfig.META_WEARABLES_DAT_ENABLED) {
      return false
    }

    return try {
      Class.forName("com.meta.wearable.dat.core.Wearables")
      true
    } catch (_: Throwable) {
      false
    }
  }

  private fun initializeDatIfPossible() {
    if (!isDatRuntimeAvailable()) {
      return
    }

    invokeWearablesStatic("initialize", arrayOf(Context::class.java), arrayOf(reactContext.applicationContext))
  }

  private fun readRegistrationStateName(): String {
    if (!isDatRuntimeAvailable()) {
      return if (manualConnected) "ManualConnected" else "ManualIdle"
    }

    return try {
      val stateFlow = invokeWearablesStatic("getRegistrationState")
      val value = stateFlow?.javaClass?.getMethod("getValue")?.invoke(stateFlow)
      value?.javaClass?.simpleName ?: "Unknown"
    } catch (error: Throwable) {
      lastErrorMessage = error.message ?: "Could not read Meta registration state."
      "Unknown"
    }
  }

  @Suppress("UNCHECKED_CAST")
  private fun readFirstDeviceIdentifier(): String? {
    if (!isDatRuntimeAvailable()) {
      return null
    }

    return try {
      val devicesFlow = invokeWearablesStatic("getDevices")
      val value = devicesFlow?.javaClass?.getMethod("getValue")?.invoke(devicesFlow) as? Collection<Any?>
      value?.firstOrNull()?.toString()
    } catch (error: Throwable) {
      lastErrorMessage = error.message ?: "Could not read Meta device state."
      null
    }
  }

  private fun invokeWearablesStatic(
    methodName: String,
    parameterTypes: Array<Class<*>> = emptyArray(),
    args: Array<Any?> = emptyArray()
  ): Any? {
    val wearablesClass = Class.forName("com.meta.wearable.dat.core.Wearables")
    val method = wearablesClass.getMethod(methodName, *parameterTypes)
    val target =
      if (Modifier.isStatic(method.modifiers)) {
        null
      } else {
        wearablesClass.getField("INSTANCE").get(null)
      }
    return method.invoke(target, *args)
  }
}
