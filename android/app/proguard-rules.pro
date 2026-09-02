# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Capacitor WebView
-keepclassmembers class com.getcapacitor.** { *; }
-keepclassmembers class com.capacitorjs.plugins.** { *; }

# React / React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.** { *; }
-keepclassmembers class com.facebook.react.modules.** { *; }
-keepclassmembers class com.facebook.react.turbomodule.** { *; }

# Clerk
-keep class com.clerk.** { *; }
-keepclassmembers class com.clerk.** { *; }

# Sentry
-keep class io.sentry.** { *; }
-keepclassmembers class io.sentry.** { *; }

# Supabase
-keep class com.supabase.** { *; }
-keepclassmembers class com.supabase.** { *; }

# TanStack Query
-keep class com.tanstack.** { *; }
-keepclassmembers class com.tanstack.** { *; }

# React Router
-keep class org.reactjs.** { *; }

# WebView JavaScript interface
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
   public *;
}

# Preserve line numbers for crash reporting
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Don't warn on Capacitor plugins
-dontwarn com.getcapacitor.**
-dontwarn com.capacitorjs.**

# Optimize
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# Keep React component names for debugging
-keepclassmembers class * extends com.facebook.react.ReactActivity {
    public void onCreate(android.os.Bundle);
}

# Keep all React Native views
-keep public class * extends com.facebook.react.ReactActivity
-keep public class * extends com.facebook.react.ReactFragmentActivity

# Keep the module name for React Native
-keepclasseswithmembers class * {
    @com.facebook.react.bridge.JavaScriptModule *;
}

# Keep all native modules
-keepclasseswithmembers class * {
    @com.facebook.react.bridge.NativeModule <init>(com.facebook.react.bridge.ReactApplicationContext);
}

# Keep all ReactPackage implementations
-keep class * implements com.facebook.react.ReactPackage {
    <init>(com.facebook.react.bridge.ReactApplicationContext);
}

# Keep for New Architecture
-keep class com.facebook.react.turbomodule.** { *; }

# Keep for Hermes
-keep class com.facebook.hermes.** { *; }

# Keep for JSI
-keep class com.facebook.jni.** { *; }