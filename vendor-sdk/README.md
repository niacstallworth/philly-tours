Vendor SDK intake snapshot downloaded on 2026-04-05.

Contents

- `vuzix/ultralite-sdk-android-1.9.zip`
  Official public Vuzix Android SDK release archive.
  Source: `https://api.github.com/repos/Vuzix/ultralite-sdk-android/releases/latest`
- `vuzix/ultralite-sdk-android-release-1.9.json`
  Saved release metadata for the Vuzix SDK.
- `vuzix/ultralite-sdk-android-sample-master.zip`
  Official public Vuzix Android sample repository snapshot from the `master` branch.
  Source repo: `https://github.com/Vuzix/ultralite-sdk-android-sample`
- `vuzix/ultralite-sdk-android-sample-repo.json`
  Saved repository metadata for the Vuzix sample app.

- `xreal/xreal-download-page.html`
  Saved official XREAL download page snapshot.
  Source: `https://developer.xreal.com/download/`
- `xreal/ControlGlasses-1.1.0.20250307172552-release.apk`
  Latest public Control Glasses APK exposed in the XREAL download page source at intake time.
  Source: `https://public-resource.xreal.com/download/XREALSDK_Release_3.0.0.20250314/ControlGlasses-1.1.0.20250307172552-release.apk`

Rokid status

- Official docs URL identified: `https://developer.rokid.com/docs/5-enableVoice/rokid-vsvy-sdk-docs/mobliesdk/SDK.html`
- Direct download from this environment timed out repeatedly with zero bytes returned.
- No Rokid SDK binary was downloaded in this pass.

Notes

- Vuzix is the cleanest public Android SDK source in this intake.
- XREAL publicly exposes companion/control APK downloads, but no raw SDK archive was directly extracted from the page source during this pass.
- If we do a deeper vendor pass next, the best follow-up is:
  1. unpack and inspect Vuzix SDK/sample contents
  2. inspect XREAL download page JS for hidden SDK package URLs or portal-gated links
  3. retry Rokid from a browser-authenticated session if needed
