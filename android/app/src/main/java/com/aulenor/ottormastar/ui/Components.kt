package com.aulenor.ottormastar.ui

import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.ExperimentalSharedTransitionApi
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.draw.scale
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.aulenor.ottormastar.data.Country
import com.aulenor.ottormastar.data.L10n
import com.aulenor.ottormastar.data.LocalSettings
import com.aulenor.ottormastar.data.Plant
import com.aulenor.ottormastar.data.PlantStore

// ============================== Motion kit ==============================
// All motion helpers no-op under the Reduce-motion setting.

/** The app's push easing — same curve as the web ([.32,.72,0,1]). */
val MotionEase = CubicBezierEasing(0.32f, 0.72f, 0f, 1f)

/**
 * Shared-element plumbing: MainActivity's SharedTransitionLayout and each nav
 * destination's AnimatedContentScope, published as locals so tiles/heroes can
 * opt in without threading scopes through every screen signature.
 */
@OptIn(ExperimentalSharedTransitionApi::class)
val LocalSharedTransition = compositionLocalOf<SharedTransitionScope?> { null }
val LocalNavAnimation = compositionLocalOf<AnimatedVisibilityScope?> { null }

/**
 * Marks this element as one end of a plant-image shared-element transition.
 * Keys are namespaced by origin ("shelf-", "tile-", "hero-", "catalog-",
 * "search-" + slug) and the detail screen picks the matching key from its
 * `src` nav argument — so the SAME plant visible in two places on one screen
 * never produces a duplicate key.
 */
@OptIn(ExperimentalSharedTransitionApi::class)
@Composable
fun Modifier.sharedPlantImage(key: String?): Modifier {
    if (key == null || LocalSettings.current.reduceMotion) return this
    val shared = LocalSharedTransition.current ?: return this
    val anim = LocalNavAnimation.current ?: return this
    return with(shared) {
        this@sharedPlantImage.sharedBounds(
            sharedContentState = rememberSharedContentState(key),
            animatedVisibilityScope = anim,
        )
    }
}

/**
 * One-shot entrance: fade + small rise, staggered by [index]. Runs when the
 * element first enters composition — use on the hero/cover blocks and section
 * headers, with small indexes (0–4), never raw list positions.
 */
@Composable
fun Modifier.riseIn(index: Int = 0): Modifier {
    if (LocalSettings.current.reduceMotion) return this
    var shown by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { shown = true }
    val t by animateFloatAsState(
        targetValue = if (shown) 1f else 0f,
        animationSpec = tween(durationMillis = 420, delayMillis = 60 * index, easing = MotionEase),
        label = "riseIn",
    )
    return graphicsLayer {
        alpha = t
        translationY = (1f - t) * 22.dp.toPx()
    }
}

/**
 * The app's press affordance: a springy scale-down while touched (no ripple —
 * the design language uses geometry-stable tints and scale, never ink
 * splashes). Replaces plain `.clickable {}` on cards, tiles and buttons.
 */
@Composable
fun Modifier.scaledClickable(scaleTo: Float = 0.97f, onClick: () -> Unit): Modifier {
    val reduce = LocalSettings.current.reduceMotion
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val s by animateFloatAsState(
        targetValue = if (pressed && !reduce) scaleTo else 1f,
        animationSpec = spring(dampingRatio = 0.6f, stiffness = 900f),
        label = "pressScale",
    )
    return scale(s).clickable(interactionSource = interaction, indication = null) { onClick() }
}

// ========================================================================

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

/** Hairline-bordered parchment surface for botanical plates.
 *  @Composable because the tokens resolve against the active theme. */
@Composable
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
            // A pill must never break into two lines — long Sakha labels
            // ("Эмтээх оттор") were wrapping inside tight card rows.
            maxLines = 1,
            softWrap = false,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

/**
 * Chip row for category badges: wraps whole pills onto the next line instead
 * of letting a long Sakha label overflow the card (mirrors the web fix —
 * chips never break internally, the ROW wraps).
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun BadgeRow(categories: List<String>, onDark: Boolean = false, modifier: Modifier = Modifier) {
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
        modifier = modifier,
    ) {
        for (cat in categories) CategoryBadge(cat, onDark = onDark)
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
