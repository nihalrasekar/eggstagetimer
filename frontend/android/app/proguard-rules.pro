# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# react-native-gesture-handler
-keep class com.swmansion.gesturehandler.** { *; }

# react-native-screens
-keep class com.swmansion.rnscreens.** { *; }

# react-native-svg
-keep class com.horcrux.svg.** { *; }

# react-native-safe-area-context
-keep class com.th3rdwave.safeareacontext.** { *; }

# react-native-webview
-keep class com.reactnativecommunity.webview.** { *; }

# expo-audio / expo-av
-keep class expo.modules.audio.** { *; }
-keep class expo.modules.av.** { *; }

# expo-modules-core
-keep class expo.modules.** { *; }

# Keep JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Parcelable classes
-keepclassmembers class * implements android.os.Parcelable {
    static ** CREATOR;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
