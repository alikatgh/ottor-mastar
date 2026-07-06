package com.aulenor.ottormastar.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// Herbarium tokens — the same palette as src/index.css @theme on the web.
// Hierarchy lives in weight + size, not color; ONE forest accent; hairline
// borders instead of shadows; category colors appear ONLY as 6dp dots.
val Cream = Color(0xFFF4F1E8)
val CreamDark = Color(0xFFE9E4D5)
val Card = Color.White
val Parchment = Color(0xFFF9F4E9)

val Ink = Color(0xFF201E19)
val InkLight = Color(0xFF4C4940)
val InkMuted = Color(0xFF837E70)

val Forest = Color(0xFF2C5A2E)
val ForestDark = Color(0xFF1E421F)

val Amber = Color(0xFFE8963E)
val AmberWarm = Color(0xFFB4691E)
val WarnBg = Color(0xFFFFF7F2)

val Hairline = Color(0x1F201E19)        // ink @ 12%
val HairlineStrong = Color(0x38201E19)  // ink @ 22%

fun categoryColor(id: String): Color = when (id) {
    "medicinal" -> Color(0xFF3E7B3E)
    "edible" -> Color(0xFFB87A1F)
    "ornamental" -> Color(0xFF7C64AE)
    "poisonous" -> Color(0xFFB23B2E)
    else -> InkMuted
}

private val HerbariumColors = lightColorScheme(
    primary = Forest,
    onPrimary = Color.White,
    primaryContainer = CreamDark,
    onPrimaryContainer = ForestDark,
    secondary = InkLight,
    onSecondary = Color.White,
    secondaryContainer = CreamDark,
    onSecondaryContainer = Ink,
    background = Cream,
    onBackground = Ink,
    surface = Cream,
    onSurface = Ink,
    surfaceVariant = Parchment,
    onSurfaceVariant = InkLight,
    surfaceContainer = Cream,
    surfaceContainerLow = Cream,
    surfaceContainerHigh = CreamDark,
    surfaceContainerHighest = CreamDark,
    outline = HairlineStrong,
    outlineVariant = Hairline,
    error = Color(0xFFB23B2E),
)

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
    // The herbarium is a printed artifact — one light, paper-toned scheme.
    // (Deliberately no dynamic color / dark variant, matching the web app.)
    isSystemInDarkTheme() // read to keep the API surface honest if this changes
    MaterialTheme(
        colorScheme = HerbariumColors,
        typography = HerbariumTypography,
        content = content,
    )
}
