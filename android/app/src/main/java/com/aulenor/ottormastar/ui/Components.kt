package com.aulenor.ottormastar.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.aulenor.ottormastar.data.Country
import com.aulenor.ottormastar.data.L10n
import com.aulenor.ottormastar.data.LocalSettings
import com.aulenor.ottormastar.data.Plant
import com.aulenor.ottormastar.data.PlantStore

/** Current-language string table, cached per language. */
@Composable
fun rememberL10n(): L10n {
    val settings = LocalSettings.current
    val context = LocalContext.current
    return remember(settings.language) { L10n.get(context, settings.language) }
}

enum class ImgSize(val dir: String) { THUMB("thumb"), MEDIUM("medium"), FULL("full") }

private val COMBINING_MARKS = Regex("\\p{Mn}+")

/**
 * Fold diacritics for search: NFD-decompose, drop combining marks, lowercase.
 * Mirrors iOS `String.folding(.diacriticInsensitive)` so "полынь" matches
 * "полы́нь" and "Ácer" matches "acer". Sakha keeps its own letters (ҥ, ө, ү…)
 * — those are base characters, not accents, so they survive folding.
 */
fun String.foldDiacritics(): String =
    COMBINING_MARKS.replace(java.text.Normalizer.normalize(this, java.text.Normalizer.Form.NFD), "")
        .lowercase()

/**
 * Model URI for a plant image. thumb + medium ship in assets (the guide must
 * work offline, in the field); full is remote-only from the deployed site.
 */
fun plantImageModel(country: Country, plant: Plant, size: ImgSize, plate: Boolean = false): String {
    val file = if (plate) "${plant.imageId}-ill" else plant.imageId
    val base = country.imageBase.trim('/')
    return if (size == ImgSize.FULL) {
        "${PlantStore.data.imageHost}${country.imageBase}/full/$file.webp"
    } else {
        "file:///android_asset/images/$base/${size.dir}/$file.webp"
    }
}

@Composable
fun PlantImage(
    country: Country,
    plant: Plant,
    size: ImgSize,
    modifier: Modifier = Modifier,
    plate: Boolean = false,
    contentScale: ContentScale = ContentScale.Crop,
) {
    AsyncImage(
        model = plantImageModel(country, plant, size, plate),
        contentDescription = plant.names.latin,
        contentScale = contentScale,
        modifier = modifier.background(Parchment),
    )
}

/**
 * Web `.plate-thumb`: source plates are square scans with wide aged-paper
 * margins — zoom into the figure (1.34×, origin slightly above center).
 * Apply to an already-clipped container.
 */
fun Modifier.plateThumbCrop(): Modifier = graphicsLayer {
    scaleX = 1.34f
    scaleY = 1.34f
    transformOrigin = TransformOrigin(0.5f, 0.38f)
}

/**
 * Letterspaced-uppercase section label over a hairline rule — the app's one
 * section-header idiom (never icon-next-to-heading).
 */
@Composable
fun OverlineLabel(text: String, modifier: Modifier = Modifier, trailing: String? = null) {
    Column(modifier = modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.Bottom) {
            Text(
                text = text.uppercase(),
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 1.6.sp,
                ),
                color = InkMuted,
                modifier = Modifier.weight(1f),
            )
            if (trailing != null) {
                Text(
                    text = trailing,
                    style = MaterialTheme.typography.labelSmall,
                    color = InkMuted,
                )
            }
        }
        Spacer(Modifier.height(8.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
    }
}

/** Hairline-bordered parchment surface for botanical plates. */
fun Modifier.plateCard(): Modifier =
    clip(RoundedCornerShape(12.dp))
        .background(Parchment)
        .border(1.dp, Hairline, RoundedCornerShape(12.dp))

/**
 * Category chip: hairline border + 6dp status dot; color carries the category
 * as a small signal, the text stays ink. `onDark` for the full-screen viewer.
 */
@Composable
fun CategoryBadge(category: String, onDark: Boolean = false) {
    val loc = rememberL10n()
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(5.dp),
        modifier = Modifier
            .border(
                1.dp,
                if (onDark) Color.White.copy(alpha = 0.3f) else Hairline,
                CircleShape,
            )
            .padding(horizontal = 9.dp, vertical = 4.dp),
    ) {
        Box(Modifier.size(6.dp).background(categoryColor(category), CircleShape))
        Text(
            loc.t("categories.$category"),
            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
            color = if (onDark) Color.White.copy(alpha = 0.85f) else InkLight,
        )
    }
}

/**
 * Amber safety-note box with a link into the Legal page — the web's
 * footer/detail disclaimer card.
 */
@Composable
fun DisclaimerBox(onOpenLegal: (() -> Unit)?, modifier: Modifier = Modifier) {
    val loc = rememberL10n()
    Row(
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(WarnBg)
            .border(1.dp, Amber.copy(alpha = 0.25f), RoundedCornerShape(12.dp))
            .let { if (onOpenLegal != null) it.clickable { onOpenLegal() } else it }
            .padding(14.dp),
    ) {
        Text("ⓘ", color = AmberWarm, style = MaterialTheme.typography.labelMedium)
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(
                loc.t("common.disclaimerShort"),
                style = MaterialTheme.typography.bodySmall.copy(lineHeight = 17.sp),
                color = InkLight,
            )
            if (onOpenLegal != null) {
                Text(
                    loc.t("common.readDisclaimer"),
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                    color = Forest,
                )
            }
        }
    }
}

/**
 * Colophon footer: safety disclaimer + wordmark + © year, like the web's
 * Footer on Home/About.
 */
@Composable
fun FooterBlock(onOpenLegal: () -> Unit) {
    val loc = rememberL10n()
    Column(
        verticalArrangement = Arrangement.spacedBy(28.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 36.dp),
    ) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
        Column(
            verticalArrangement = Arrangement.spacedBy(28.dp),
            modifier = Modifier.padding(horizontal = 20.dp),
        ) {
            DisclaimerBox(onOpenLegal = onOpenLegal)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(7.dp),
                ) {
                    Text("☘", color = Forest, style = MaterialTheme.typography.bodyMedium)
                    Text(
                        loc.t("app.title"),
                        style = MaterialTheme.typography.titleMedium,
                        color = Ink,
                    )
                }
                Text(
                    loc.t("app.description"),
                    style = MaterialTheme.typography.bodySmall.copy(lineHeight = 16.sp),
                    color = InkMuted,
                )
            }
            Column {
                Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
                Row(Modifier.fillMaxWidth().padding(top = 16.dp, bottom = 20.dp)) {
                    Text(
                        "© 2026 Ottor Mastar",
                        style = MaterialTheme.typography.labelSmall,
                        color = InkMuted,
                        modifier = Modifier.weight(1f),
                    )
                    Text(
                        loc.t("app.subtitle"),
                        style = MaterialTheme.typography.labelSmall,
                        color = InkMuted,
                    )
                }
            }
        }
    }
}
