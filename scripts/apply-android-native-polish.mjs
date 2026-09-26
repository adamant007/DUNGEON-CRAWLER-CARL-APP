#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const androidRoot = path.resolve("android");
const manifestPath = path.join(androidRoot, "app/src/main/AndroidManifest.xml");
const stylesPath = path.join(androidRoot, "app/src/main/res/values/styles.xml");

function fail(message) {
  console.error("Android native polish:", message);
  process.exit(1);
}

if (!fs.existsSync(androidRoot)) fail("android project has not been generated");
if (!fs.existsSync(manifestPath)) fail("AndroidManifest.xml not found");
if (!fs.existsSync(stylesPath)) fail("styles.xml not found");

function findMainActivity(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findMainActivity(full);
      if (found) return found;
    } else if (entry.name === "MainActivity.java") {
      return full;
    }
  }
  return null;
}

const javaRoot = path.join(androidRoot, "app/src/main/java");
const mainActivityPath = findMainActivity(javaRoot);
if (!mainActivityPath) fail("MainActivity.java not found");

const currentMain = fs.readFileSync(mainActivityPath, "utf8");
const packageMatch = currentMain.match(/^package\s+([^;]+);/m);
if (!packageMatch) fail("MainActivity package declaration not found");
const packageName = packageMatch[1].trim();

fs.writeFileSync(
  mainActivityPath,
  `package ${packageName};

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatDelegate;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String AUTH_SCHEME = "com.gingerdragonstudios.rpgcompanion";
    private static final String AUTH_HOST = "login-callback";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM);
        super.onCreate(savedInstanceState);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;

                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                    return;
                }

                setEnabled(false);
                getOnBackPressedDispatcher().onBackPressed();
                setEnabled(true);
            }
        });

        handleAuthIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleAuthIntent(intent);
    }

    private void handleAuthIntent(Intent intent) {
        Uri data = intent != null ? intent.getData() : null;
        if (data == null
                || !AUTH_SCHEME.equals(data.getScheme())
                || !AUTH_HOST.equals(data.getHost())) {
            return;
        }

        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView == null) return;

        final String fragment = data.getEncodedFragment();
        final String query = data.getEncodedQuery();

        webView.postDelayed(() -> {
            // Always return OAuth to the Capacitor app origin. During Google
            // sign-in the WebView may still be sitting on accounts.google.com
            // or Supabase; deriving the origin from webView.getUrl() sends the
            // callback to the wrong host and drops the user back at login.
            String suffix = "";
            if (fragment != null && !fragment.isEmpty()) {
                suffix = "#" + fragment;
            } else if (query != null && !query.isEmpty()) {
                suffix = "?" + query;
            }

            webView.loadUrl("https://localhost/dashboard?oauth_return=1" + suffix);
        }, 250);
    }
}
`,
);

let manifest = fs.readFileSync(manifestPath, "utf8");
if (!manifest.includes('android:enableOnBackInvokedCallback=')) {
  manifest = manifest.replace(
    /<application\b/,
    '<application android:enableOnBackInvokedCallback="true"',
  );
}
manifest = manifest.replace(
  /(<activity\b[^>]*android:name="\.MainActivity"[^>]*)(>)/s,
  (match, attrs, close) => {
    let next = attrs;
    if (!/android:windowSoftInputMode=/.test(next)) {
      next += '\n            android:windowSoftInputMode="adjustResize"';
    }
    return next + close;
  },
);

if (!manifest.includes('android:scheme="com.gingerdragonstudios.rpgcompanion"')) {
  manifest = manifest.replace(
    /(<activity\b[^>]*android:name="\.MainActivity"[\s\S]*?)(<\/activity>)/,
    `$1
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="com.gingerdragonstudios.rpgcompanion"
                    android:host="login-callback" />
            </intent-filter>
        $2`,
  );
}
fs.writeFileSync(manifestPath, manifest);

let styles = fs.readFileSync(stylesPath, "utf8");
const nativeItems = `
        <item name="android:windowLightStatusBar">false</item>
        <item name="android:windowLightNavigationBar">false</item>
        <item name="android:statusBarColor">#17110D</item>
        <item name="android:navigationBarColor">#120E0B</item>
        <item name="android:windowBackground">#17110D</item>
        <item name="android:forceDarkAllowed">false</item>`;

if (!styles.includes("android:forceDarkAllowed")) {
  const stylePattern = /(<style\s+name="AppTheme\.NoActionBar"[^>]*>)([\s\S]*?)(<\/style>)/;
  if (!stylePattern.test(styles)) fail("AppTheme.NoActionBar style not found");
  styles = styles.replace(
    stylePattern,
    (full, open, body, close) => `${open}${body}${nativeItems}\n    ${close}`,
  );
}
fs.writeFileSync(stylesPath, styles);

const nightDir = path.join(androidRoot, "app/src/main/res/values-night");
fs.mkdirSync(nightDir, { recursive: true });
fs.writeFileSync(
  path.join(nightDir, "styles.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="android:windowLightStatusBar">false</item>
        <item name="android:windowLightNavigationBar">false</item>
        <item name="android:statusBarColor">#0A0806</item>
        <item name="android:navigationBarColor">#0A0806</item>
        <item name="android:windowBackground">#0A0806</item>
        <item name="android:forceDarkAllowed">false</item>
    </style>
</resources>
`,
);

console.log("Applied Ginger Dragon Android native polish.");
