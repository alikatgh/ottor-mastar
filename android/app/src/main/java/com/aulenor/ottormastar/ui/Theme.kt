package com.aulenor.ottormastar.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.aulenor.ottormastar.data.LocalSettings
import com.aulenor.ottormastar.data.ThemeOpt

// Herbarium tokens — the same palette as src/index.css @theme on the web,
// in light AND dark. Hierarchy lives in weight + size, not color; ONE forest
// accent; hairline borders instead of shadows; category colors appear ONLY as
// 6dp dots.
//
// Every public token is a @Composable getter over LocalDarkTheme, so all the
// existing `Cream` / `Ink` / `Hairline` call sites across the screens flip
// with the theme without a single call-site change.

/** True when the resolved app theme is dark (settings: system|light|dark). */
val LocalDarkTheme = staticCompositionLocalOf { false }

private object Light {
    val cream = Color(0xFFF4F1E8)
    val creamDark = Color(0xFFE9E4D5)
    val card = Color.White
    val parchment = Color(0xFFF9F4E9)
    val ink = Color(0xFF201E19)
    val inkLight = Color(0xFF4C4940)
    val inkMuted = Color(0xFF837E70)
    val forest = Color(0xFF2C5A2E)
    val forestDark = Color(0xFF1E421F)
    val amber = Color(0xFFE8963E)
    val amberWarm = Color(0xFFB4691E)
    val warnBg = Color(0xFFFFF7F2)
    val hairline = Color(0x1F201E19)        // ink @ 12%
    val hairlineStrong = Color(0x38201E19)  // ink @ 22%
}

private object Dark {
    val cream = Color(0xFF1A1914)
    val creamDark = Color(0xFF2A2820)
    val card = Color(0xFF23211B)
    val parchment = Color(0xFF26231B)
    val ink = Color(0xFFECE8DC)
    val inkLight = Color(0xFFC7C2B2)
    val inkMuted = Color(0xFF928C7B)
    val forest = Color(0xFF7DB380)
    val forestDark = Color(0xFF5E9861)
    val amber = Color(0xFFE8A35C)
    val amberWarm = Color(0xFFDFA05B)
    val warnBg = Color(0xFF2C2318)
    val hairline = Color(0x24ECE8DC)        // light ink @ 14%
    val hairlineStrong = Color(0x42ECE8DC)  // light ink @ 26%
}

val Cream: Color @Composable get() = if (LocalDarkTheme.current) Dark.cream else Light.cream
val CreamDark: Color @Composable get() = if (LocalDarkTheme.current) Dark.creamDark else Light.creamDark
val Card: Color @Composable get() = if (LocalDarkTheme.current) Dark.card else Light.card
val Parchment: Color @Composable get() = if (LocalDarkTheme.current) Dark.parchment else Light.parchment

val Ink: Color @Composable get() = if (LocalDarkTheme.current) Dark.ink else Light.ink
val InkLight: Color @Composable get() = if (LocalDarkTheme.current) Dark.inkLight else Light.inkLight
val InkMuted: Color @Composable get() = if (LocalDarkTheme.current) Dark.inkMuted else Light.inkMuted

val Forest: Color @Composable get() = if (LocalDarkTheme.current) Dark.forest else Light.forest
val ForestDark: Color @Composable get() = if (LocalDarkTheme.current) Dark.forestDark else Light.forestDark

val Amber: Color @Composable get() = if (LocalDarkTheme.current) Dark.amber else Light.amber
val AmberWarm: Color @Composable get() = if (LocalDarkTheme.current) Dark.amberWarm else Light.amberWarm
val WarnBg: Color @Composable get() = if (LocalDarkTheme.current) Dark.warnBg else Light.warnBg

val Hairline: Color @Composable get() = if (LocalDarkTheme.current) Dark.hairline else Light.hairline
val HairlineStrong: Color @Composable get() = if (LocalDarkTheme.current) Dark.hairlineStrong else Light.hairlineStrong

@Composable
fun categoryColor(id: String): Color {
    val dark = LocalDarkTheme.current
    return when (id) {
        "medicinal" -> if (dark) Color(0xFF6FAE6F) else Color(0xFF3E7B3E)
        "edible" -> if (dark) Color(0xFFD9A452) else Color(0xFFB87A1F)
        "ornamental" -> if (dark) Color(0xFFA796D8) else Color(0xFF7C64AE)
        "poisonous" -> if (dark) Color(0xFFD97A6C) else Color(0xFFB23B2E)
        else -> InkMuted
    }
}

private fun herbariumColorScheme(dark: Boolean) = if (dark) {
    darkColorScheme(
        primary = Dark.forest,
        onPrimary = Dark.cream,
        primaryContainer = Dark.creamDark,
        onPrimaryContainer = Dark.forest,
        secondary = Dark.inkLight,
        onSecondary = Dark.cream,
        secondaryContainer = Dark.creamDark,
        onSecondaryContainer = Dark.ink,
        background = Dark.cream,
        onBackground = Dark.ink,
        surface = Dark.cream,
        onSurface = Dark.ink,
        surfaceVariant = Dark.parchment,
        onSurfaceVariant = Dark.inkLight,
        surfaceContainer = Dark.cream,
        surfaceContainerLow = Dark.cream,
        surfaceContainerHigh = Dark.creamDark,
        surfaceContainerHighest = Dark.creamDark,
        outline = Dark.hairlineStrong,
        outlineVariant = Dark.hairline,
        error = Color(0xFFD97A6C),
    )
} else {
    lightColorScheme(
        primary = Light.forest,
        onPrimary = Color.White,
        primaryContainer = Light.creamDark,
        onPrimaryContainer = Light.forestDark,
        secondary = Light.inkLight,
        onSecondary = Color.White,
        secondaryContainer = Light.creamDark,
        onSecondaryContainer = Light.ink,
        background = Light.cream,
        onBackground = Light.ink,
        surface = Light.cream,
        onSurface = Light.ink,
        surfaceVariant = Light.parchment,
        onSurfaceVariant = Light.inkLight,
        surfaceContainer = Light.cream,
        surfaceContainerLow = Light.cream,
        surfaceContainerHigh = Light.creamDark,
        surfaceContainerHighest = Light.creamDark,
        outline = Light.hairlineStrong,
        outlineVariant = Light.hairline,
        error = Color(0xFFB23B2E),
    )
}

// Serif (Noto Serif — full Cyrillic, so Sakha renders) for the encyclopedia
// voice; default sans for body/UI. Same split as Playfair/Inter on the web.
private val Serif = FontFamily.Serif

private val HerbariumTypography = Typography(
    displaySmall = TextStyle(
        fontFamily = Serif, fontWeight = FontWeight.Medium, fontSize = 34.sp, lineHeight = 40.sp),
    headlineMedium = TextStyle(
        fontFamily = Serif, fontWeight = FontWeight.Medium, fontSize = 26.sp, lineHeight = 32.sp),
    titleLarge = TextStyle(
        fontFamily = Serif, fontWeight = FontWeight.Medium, fontSize = 20.sp, lineHeight = 26.sp),
    titleMedium = TextStyle(
        fontFamily = Serif, fontWeight = FontWeight.Medium, fontSize = 17.sp, lineHeight = 22.sp),
)

@Composable
fun OttorMastarTheme(content: @Composable () -> Unit) {
    // Resolve the user's theme setting; SYSTEM follows the OS live. Must run
    // inside CompositionLocalProvider(LocalSettings …) — see MainActivity.
    val settings = LocalSettings.current
    val dark = when (settings.theme) {
        ThemeOpt.SYSTEM -> isSystemInDarkTheme()
        ThemeOpt.LIGHT -> false
        ThemeOpt.DARK -> true
    }
    CompositionLocalProvider(LocalDarkTheme provides dark) {
        MaterialTheme(
            colorScheme = herbariumColorScheme(dark),
            typography = HerbariumTypography,
            content = content,
        )
    }
}
