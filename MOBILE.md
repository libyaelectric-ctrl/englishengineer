# EngVox Mobile (Capacitor) Runbook

Android APK + iOS build guide: the two Firebase settings every native build depends on, the web-asset → native sync workflow, and how to exercise the Google OAuth round trip on an emulator with adb.

## 1. Firebase Console prerequisites (ops)

Everything below lives in the Firebase Console for the **production project** (`elemental-outlet-pnn32`, numeric ID `1058778261006`). Without these, **no sign-in method works on a device** — email/password included.

| Setting                                        | Value                                                                                              | Why                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Authentication → Sign-in method**            | **Google** + **Email/Password** enabled                                                            | Required for "Continue with Google" and email/password            |
| **Project settings → Your apps → Android app** | Package: `com.engvox.app`                                                                          | Must match `android/app/build.gradle` `applicationId`             |
| **Android app → SHA-1 / SHA-256**              | Your keystore fingerprints                                                                         | Required for native Google Sign-In (Play Services)                |
| **Download `google-services.json`**            | Place at `android/app/google-services.json`                                                        | Capacitor Firebase Auth plugin reads this at build time           |
| **Authorized domains (OAuth redirect)**        | `localhost` (implicit), `elemental-outlet-pnn32.firebaseapp.com`, `elemental-outlet-pnn32.web.app` | Firebase automatically allows `localhost`; no extra config needed |

> **Why not Clerk?** Clerk's _production_ keys are domain-locked to `engvox.com`. The Capacitor WebView origin is always `https://localhost`, so every request gets CORS `400 origin_invalid` → `window.Firebase.loaded` stays `false` → login never works in the APK. Firebase Auth has no such domain lock on the web API key.

## 2. Sync workflow (web assets → native)

Capacitor packages whatever is in `dist/`, and each native project caches its own copy — Gradle/Xcode will NOT notice new JS until that copy is refreshed:

```bash
npm run build:mobile     # 1. fresh web assets into dist/ (loads .env.mobile)
npx cap copy android     # 2a. dist -> android/app/src/main/assets/public
npx cap copy ios         # 2b. dist -> ios/App/App/public
```

`npx cap sync <platform>` = `cap copy` + native dependency update. For iOS it regenerates `ios/App/CapApp-SPM/Package.swift` from the installed `@capacitor/*` plugins — **run it whenever plugins change**.

### Android APK

```bash
# Windows: JDK 21 shipped with Android Studio (also under ~/.jdks)
cd android
JAVA_HOME="$USERPROFILE/.jdks/jbr-21.0.11" ./gradlew :app:assembleDebug
# output: android/app/build/outputs/apk/debug/app-debug.apk
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

**Gotcha:** running `assembleDebug` _without_ a fresh `npx cap copy android` silently reuses stale assets (Gradle sees nothing changed and skips the copy), so the APK can miss the newest JS. Confirm the build has the Firebase bridge:

```bash
unzip -p android/app/build/outputs/apk/debug/app-debug.apk \
  "assets/public/assets/*.js" | grep -c "firebase"   # expect >= 1
```

### iOS

Open `ios/App/App.xcodeproj` in Xcode (macOS only — nothing here can be build-verified on Windows) and run. Xcode resolves the local Swift packages listed in `CapApp-SPM/Package.swift`.

## 3. Emulator deep-link test (Google OAuth round trip)

The native Google consent page itself cannot be automated on a stock AOSP emulator (no Play services / Google account). The step below injects the exact deep link Firebase redirects to after consent, exercising the same return path: `appUrlOpen` → param replay into the WebView → `#/auth-callback` → completion page.

```bash
# adb lives under $LOCALAPPDATA/Android/Sdk/platform-tools on Windows;
# add it to PATH or alias: ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"
ADB=adb   # adjust for your platform

# 0. Build + install per section 2.

# 1. Fresh logcat, then launch the app:
"$ADB" logcat -c
"$ADB" shell am force-stop com.engvox.app
"$ADB" shell am start -W -n com.engvox.app/.MainActivity

# 2. Native Google sign-in is handled by @capacitor-firebase/authentication
#    (Play Services / Credential Manager). No custom scheme deep link is needed
#    for the Google flow — the plugin returns the ID token directly to the JS
#    layer, which calls signInWithCredential() and completes the session in-app.
#    Therefore there is no __clerk_handshake deep-link round-trip to test.
#    Instead, verify the Google button works by opening the app and tapping it.
```

> **Note:** Unlike the old Clerk flow (which used a custom-scheme deep link `com.engvox.app://oauth-callback`), Firebase native Google sign-in via the Capacitor plugin completes entirely in-app. No deep-link forwarding, no WebView reload, no custom intent filter needed.

## 4. CI / CD notes

### GitHub Actions (`.github/workflows/build-android.yml`)

The `build` job now passes:

```yaml
env:
  VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
  VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
```

The old `smoke-test` job (Clerk deep-link round trip) has been removed — Firebase native sign-in has no custom-scheme round trip to exercise.

### Required secrets

| Secret                                                                   | Source                                                   |
| ------------------------------------------------------------------------ | -------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`                                                  | Firebase Console → Project settings → Web app → `apiKey` |
| `VITE_FIREBASE_PROJECT_ID`                                               | Firebase Console → Project settings → Project ID         |
| `ANDROID_KEYSTORE_BASE64`                                                | Base64-encoded release keystore (for `assembleRelease`)  |
| `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` | Keystore credentials                                     |

## Troubleshooting

| Symptom                                       | Cause / fix                                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `google-services.json` missing at build       | File not placed at `android/app/google-services.json` before `npx cap copy android`                                                  |
| Google button does nothing on APK             | `google-services.json` missing or SHA-1 not registered in Firebase Console                                                           |
| Email/password works but Google doesn't       | Google provider not enabled in Firebase Console → Authentication → Sign-in method                                                    |
| `window.Firebase.loaded` never true           | Check adb logcat for `origin_invalid` — usually means wrong API key or project ID                                                    |
| Sign-in completes but bounces back to sign-in | Firebase Auth state listener race — `onAuthStateChanged` fires before bridge seeds store; guard waits for both (see `AuthGuard.tsx`) |

## Limitations

- iOS edits (`Info.plist`, regenerated `Package.swift`) are verified structurally, not by an Xcode build — iOS requires macOS.
- A full Google consent flow needs a real device (or an emulator image with Google Play and a signed-in account).
- Native Google sign-in requires `google-services.json` + registered SHA-1. Without it, the Google button falls back to a web popup which is blocked by Google inside the WebView — email/password still works.
