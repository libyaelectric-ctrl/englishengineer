# EngVox Mobile (Capacitor) Runbook

Android APK + iOS build guide: the two Clerk Dashboard settings every native
build depends on, the web-asset → native sync workflow, and how to exercise the
Google OAuth deep-link round trip on an emulator with adb.

## 1. Clerk Dashboard prerequisites (ops)

Everything below lives in the Clerk Dashboard for the production instance
(frontend API: `clerk.engvox.com`, publishable key `pk_live_...`). Without
these, **no sign-in method works on a device** — email/password included — and
the Google button shows an explicit error.

| Setting                | Value                                                                        | Why                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Redirect URL           | `com.engvox.app://oauth-callback`                                            | After Google OAuth completes in the system browser, Clerk redirects there. The `com.engvox.app` scheme is declared in the Android manifest and iOS `Info.plist`. |
| Allowed origins (CORS) | `https://localhost` (Android WebView), `capacitor://localhost` (iOS WebView) | The native WebView origin must be allowed to call the Clerk Frontend API. Production keys reject every other origin.                                             |
| OAuth providers        | Google enabled                                                               | Required for the "Continue with Google" button.                                                                                                                  |

**Symptom the allowed-origins entry is missing** (seen live on an emulator):
logcat shows `Clerk: Production Keys are only allowed for domain "engvox.com"`,
`window.Clerk.loaded` stays `false`, and a fetch from the app to
`https://clerk.engvox.com/v1/client` fails while `https://example.com`
succeeds. Development (`pk_test_...`) instances allow `localhost` origins by
default; production instances need the explicit allowlist entry.

## 2. Sync workflow (web assets → native)

Capacitor packages whatever is in `dist/`, and each native project caches its
own copy — Gradle/Xcode will NOT notice new JS until that copy is refreshed:

```bash
npm run build          # 1. fresh web assets into dist/
npx cap copy android   # 2a. dist -> android/app/src/main/assets/public
npx cap copy ios       # 2b. dist -> ios/App/App/public
```

`npx cap sync <platform>` = `cap copy` + native dependency update. For iOS it
regenerates `ios/App/CapApp-SPM/Package.swift` from the installed
`@capacitor/*` plugins — **run it whenever plugins change** (e.g. adding
status-bar removed the phantom push/splash entries). SPM sync is pure Node and
runs on Windows.

### Android APK

```bash
# Windows: JDK 21 shipped with Android Studio (also under ~/.jdks)
cd android
JAVA_HOME="$USERPROFILE/.jdks/jbr-21.0.11" ./gradlew :app:assembleDebug
# output: android/app/build/outputs/apk/debug/app-debug.apk
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Gotcha: running `assembleDebug` _without_ a fresh `npx cap copy android`
silently reuses stale assets (Gradle sees nothing changed and skips the copy),
so the APK can miss the newest JS. Confirm the build has the OAuth bridge:

```bash
unzip -p android/app/build/outputs/apk/debug/app-debug.apk \
  "assets/public/assets/*.js" | grep -c "oauth-callback"   # expect >= 1
```

### iOS

Open `ios/App/App.xcodeproj` in Xcode (macOS only — nothing here can be
build-verified on Windows) and run. Xcode resolves the local Swift packages
listed in `CapApp-SPM/Package.swift`.

## 3. Emulator deep-link test (Google OAuth round trip)

The system-browser Google consent page itself cannot be automated on a stock
AOSP emulator (no Play services / Google account). The step below injects the
exact deep link Clerk redirects to after consent, exercising the same return
path: `appUrlOpen` → param replay into the WebView → `#/oauth-callback` →
completion page.

```bash
# adb lives under $LOCALAPPDATA/Android/Sdk/platform-tools on Windows;
# add it to PATH or alias: ADB="$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"
ADB=adb   # adjust for your platform

# 0. Build + install per section 2.

# 1. The custom scheme must resolve to the app:
"$ADB" shell cmd package resolve-activity --brief \
  -a android.intent.action.VIEW \
  -d "com.engvox.app://oauth-callback?__clerk_handshake=1&__clerk_handshake_nonce=e2e"
#   expect: com.engvox.app/.MainActivity

# 2. Fresh logcat, then launch the app:
"$ADB" logcat -c
"$ADB" shell am force-stop com.engvox.app
"$ADB" shell am start -W -n com.engvox.app/.MainActivity

# 3. Inject the OAuth return deep link (system browser → app hand-off):
"$ADB" shell am start -W -a android.intent.action.VIEW \
  -d "com.engvox.app://oauth-callback?__clerk_handshake=1&__clerk_handshake_nonce=e2e-test" \
  com.engvox.app

# 4. Expect within a few seconds:
"$ADB" logcat -d | grep -iE "Capacitor/AppPlugin|Kernel Booting"
#   Capacitor/AppPlugin: Notifying listeners for event appUrlOpen
#   ... EngVox Kernel Booting ...        <- the app reloaded after forwarding

# 5. WebView debugging is enabled (MainActivity). Verify the WebView URL via
#    Chrome DevTools Protocol over adb:
"$ADB" forward tcp:9222 "localabstract:webview_devtools_remote_$("$ADB" shell pidof com.engvox.app)"
curl -s http://127.0.0.1:9222/json
#   url should be: https://localhost/?__clerk_handshake=1&__clerk_handshake_nonce=e2e-test#/oauth-callback
#   (the forwarder replays ALL of the deep link's query params, nonce included)
```

Read the rendered page through the DevTools socket (Node ≥ 22 has a global
`WebSocket`):

```bash
node --input-type=module <<'EOF'
const t = await (await fetch('http://127.0.0.1:9222/json')).json();
const page = t.find((x) => x.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (e) => {
  const v = JSON.parse(e.data).result?.result?.value;
  if (v) { console.log(v); ws.close(); }
};
ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: {
  expression: 'location.href + "\\n\\n" + document.body.innerText', returnByValue: true } }));
EOF
```

Expected: the callback page ("Finishing sign-in…"). With the Dashboard
allowlisted and a real OAuth attempt, `clerk.handleRedirectCallback()` then
activates the session and the app lands on the dashboard; with a bogus nonce
(no real flow) it settles on the "Sign-in incomplete" error card — either way
the round trip through the deep link is proven.

## 4. Testing with a development instance (required for device/emulator auth)

Clerk **live keys are domain-locked**: the Frontend API only accepts requests
whose Origin equals the instance's domain or a true subdomain of it
(`engvox.com` / `*.engvox.com`). The Capacitor WebView origin is always
`https://localhost`, so a live-key build can never authenticate on any device —
Clerk's server answers the CORS preflight with HTTP 400
`origin_invalid` (`The Request HTTP Origin header must be equal to or a
subdomain of the requesting URL`), `window.Clerk.loaded` stays `false`, and
email/password, OTP, and Google all fail. Confirm from the host:

```bash
curl -s -o /dev/null -w "engvox.com  -> %{http_code}\n" -X OPTIONS \
  https://clerk.engvox.com/v1/client -H "Origin: https://engvox.com" \
  -H "Access-Control-Request-Method: GET"
curl -s -o /dev/null -w "localhost   -> %{http_code}\n" -X OPTIONS \
  https://clerk.engvox.com/v1/client -H "Origin: https://localhost" \
  -H "Access-Control-Request-Method: GET"
# engvox.com -> 200, localhost -> 400
```

Clerk **development instances allow `localhost` origins**, so device testing
uses a dev key. There is no dashboard setting that relaxes the domain lock on a
live key.

1. Clerk Dashboard → create/use a **Development** instance → API keys → copy
   the `pk_test_...` publishable key.
2. Create `.env.mobile` (gitignored) with the dev key — it overrides
   `.env.local`'s live key only for mobile builds:

   ```bash
   echo 'VITE_CLERK_PUBLISHABLE_KEY="pk_test_YOUR_DEV_KEY"' > .env.mobile
   ```

3. Build with the mobile mode, then continue the sync workflow from section 2:

   ```bash
   npm run build:mobile   # vite build --mode mobile (loads .env.mobile)
   npx cap copy android
   cd android && JAVA_HOME="$USERPROFILE/.jdks/jbr-21.0.11" ./gradlew :app:assembleDebug
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

4. Backend JWT validation (only if API calls must authenticate too): set
   `CLERK_ISSUER=https://<dev-instance>.clerk.accounts.dev` in `backend/.env`
   so the JWKS lookup matches the dev instance.

Expected after install: `window.Clerk.loaded === true` on the sign-in screen
(no more production-key warning), then the deep-link test from section 3
completes into a real session.

> Returning to a production web build: `npm run build` (default mode) ignores
> `.env.mobile`, so the live key applies again — no cleanup needed beyond
> deleting `.env.mobile` when the dev instance is retired.

## Troubleshooting

| Symptom                                                            | Cause / fix                                                                                               |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `appUrlOpen` never fires                                           | Custom scheme not registered (Android manifest / iOS `Info.plist`) or stale APK — re-run section 2.       |
| `appUrlOpen` fires but no reload                                   | Stale web assets — `npx cap copy android` was skipped before `assembleDebug`.                             |
| `Clerk: Production Keys are only allowed...`, `Clerk.loaded` false | Allowed-origins entry missing in the Clerk Dashboard (section 1).                                         |
| Google button errors "could not be started"                        | `com.engvox.app://oauth-callback` not in the Dashboard redirect URLs, or the Google provider is disabled. |
| Sign-in completes but bounces back to sign-in                      | Same as above — the completion redirect isn't allowlisted.                                                |

## Limitations

- iOS edits (Info.plist, regenerated `Package.swift`) are verified structurally,
  not by an Xcode build — iOS requires macOS.
- A full Google consent flow needs a real device (or an emulator image with
  Google Play and a signed-in account).
