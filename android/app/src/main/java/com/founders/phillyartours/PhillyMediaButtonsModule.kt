package com.founders.phillyartours

import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class PhillyMediaButtonsModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var mediaSession: MediaSession? = null
  private var listenerCount = 0
  private var playbackStateName = "stopped"

  override fun getName(): String = "PhillyMediaButtons"

  @ReactMethod
  fun activateSession(promise: Promise) {
    try {
      ensureMediaSession()
      updatePlaybackStateInternal(playbackStateName)
      mediaSession?.isActive = true
      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("MEDIA_BUTTONS_ACTIVATE_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun deactivateSession(promise: Promise) {
    try {
      mediaSession?.isActive = false
      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("MEDIA_BUTTONS_DEACTIVATE_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun updatePlaybackState(state: String, promise: Promise) {
    try {
      playbackStateName = state
      ensureMediaSession()
      updatePlaybackStateInternal(state)
      promise.resolve(null)
    } catch (error: Throwable) {
      promise.reject("MEDIA_BUTTONS_STATE_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun addListener(eventName: String) {
    listenerCount += 1
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    listenerCount = (listenerCount - count).coerceAtLeast(0)
  }

  override fun invalidate() {
    super.invalidate()
    mediaSession?.release()
    mediaSession = null
  }

  private fun ensureMediaSession() {
    if (mediaSession != null) {
      return
    }

    mediaSession = MediaSession(reactContext, "PhillyMediaButtons").apply {
      setCallback(
        object : MediaSession.Callback() {
          override fun onPlay() {
            emitCommand("resume_narration")
          }

          override fun onPause() {
            emitCommand("pause_narration")
          }

          override fun onSkipToNext() {
            emitCommand("next_stop")
          }
        }
      )
      isActive = true
    }
  }

  private fun emitCommand(type: String) {
    if (!reactContext.hasActiveReactInstance() || listenerCount <= 0) {
      return
    }

    val payload = Arguments.createMap().apply {
      putString("type", type)
    }
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("phillyMediaButtonCommand", payload)
  }

  private fun updatePlaybackStateInternal(state: String) {
    val session = mediaSession ?: return
    val normalizedState = when (state) {
      "playing" -> PlaybackState.STATE_PLAYING
      "paused" -> PlaybackState.STATE_PAUSED
      else -> PlaybackState.STATE_STOPPED
    }
    val actions =
      PlaybackState.ACTION_PLAY or
        PlaybackState.ACTION_PAUSE or
        PlaybackState.ACTION_PLAY_PAUSE or
        PlaybackState.ACTION_SKIP_TO_NEXT

    val builder =
      PlaybackState.Builder()
        .setActions(actions)
        .setState(normalizedState, PlaybackState.PLAYBACK_POSITION_UNKNOWN, 1.0f)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      builder.setBufferedPosition(0L)
    }

    session.setPlaybackState(builder.build())
  }
}
