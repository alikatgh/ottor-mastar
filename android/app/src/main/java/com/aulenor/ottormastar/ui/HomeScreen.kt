package com.aulenor.ottormastar.ui

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aulenor.ottormastar.data.LocalSettings
import com.aulenor.ottormastar.data.Plant
import com.aulenor.ottormastar.data.TileTap
import com.aulenor.ottormastar.data.plateNumeral

/**
 * Web-parity home: encyclopedia cover (plate panel of the collection's LAST
 * entry + title panel with CTA), the plates shelf with swipe cue, the 3-column
 * field-photo wall (tile labels + tap behavior follow Settings), and the
 * colophon footer.
 */
@Composable
fun HomeScreen(
    // (plant, src): src names the tapped element ("hero"/"shelf"/"tile") so the
    // detail hero joins the matching shared-element transition.
    onOpenPlant: (Plant, String) -> Unit,
    onOpenViewer: (Int) -> Unit,
    onOpenCatalog: () -> Unit,
    onOpenLegal: () -> Unit,
) {
    val settings = LocalSettings.current
    val loc = rememberL10n()
    val country = settings.country
    val plants = country.plants
    val plated = plants.filter { it.hasIllustration }
    // Cover = the country's explicit hero plate (Sardaana / marigold), not an
    // arbitrary last entry.
    val hero = country.heroPlant

    LazyColumn(modifier = Modifier.fillMaxSize()) {
        // ===== Cover: plate panel =====
        if (hero != null) {
            item {
                Box(
                    Modifier
                        .fillMaxWidth()
                        .background(Parchment)
                        .scaledClickable(scaleTo = 0.985f) { onOpenPlant(hero, "hero") },
                ) {
                    PlantImage(
                        country, hero, ImgSize.MEDIUM,
                        plate = hero.hasIllustration,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(360.dp)
                            .padding(start = 24.dp, end = 24.dp, top = 24.dp, bottom = 36.dp)
                            .sharedPlantImage("hero-${hero.slug}")
                            .graphicsLayer {
                                shadowElevation = 18f
                                shape = RoundedCornerShape(2.dp)
                            },
                    )
                    Text(
                        buildString {
                            append(hero.names[settings.language]); append(" · "); append(hero.names.latin)
                        },
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontStyle = FontStyle.Italic, lineHeight = 13.sp),
                        color = InkMuted,
                        textAlign = TextAlign.End,
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(end = 16.dp, bottom = 10.dp)
                            .fillMaxWidth(0.6f),
                    )
                }
                Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
            }
        }

        // ===== Cover: title panel =====
        item {
            Column(Modifier.padding(horizontal = 24.dp, vertical = 44.dp)) {
                Text(
                    (if (country.id == "yakutia") loc.t("app.subtitle")
                    else loc.t("settings.country_${country.id}")).uppercase(),
                    style = MaterialTheme.typography.labelMedium.copy(
                        fontWeight = FontWeight.SemiBold, letterSpacing = 1.6.sp),
                    color = InkMuted,
                    modifier = Modifier.riseIn(0),
                )
                Spacer(Modifier.height(16.dp))
                Text(
                    loc.t("app.title"),
                    style = MaterialTheme.typography.displaySmall.copy(
                        fontSize = 44.sp, lineHeight = 46.sp, fontWeight = FontWeight.Bold),
                    color = Ink,
                    modifier = Modifier.riseIn(1),
                )
                if (country.id == "yakutia") {
                    Spacer(Modifier.height(18.dp))
                    Text(
                        loc.t("app.description"),
                        style = MaterialTheme.typography.bodyLarge.copy(
                            fontWeight = FontWeight.Light, lineHeight = 24.sp),
                        color = InkLight,
                        modifier = Modifier.riseIn(2),
                    )
                }
                Spacer(Modifier.height(34.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(20.dp),
                    modifier = Modifier.riseIn(3),
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(Forest)
                            .scaledClickable { onOpenCatalog() }
                            .padding(horizontal = 20.dp, vertical = 11.dp),
                    ) {
                        Text(
                            loc.t("home.cta"),
                            style = MaterialTheme.typography.labelLarge,
                            color = Color.White,
                        )
                        Text("→", color = Color.White)
                    }
                    Text(
                        if (plated.isEmpty()) loc.plural("gallery.photoCount", plants.size)
                        else loc.plural("home.plateCount", plated.size),
                        style = MaterialTheme.typography.bodyMedium,
                        color = InkMuted,
                    )
                }
            }
            Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
        }

        // ===== Plates shelf =====
        if (plated.isNotEmpty()) {
            item {
                Spacer(Modifier.height(36.dp))
                Column(Modifier.padding(horizontal = 16.dp)) {
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            loc.t("home.platesTitle"),
                            style = MaterialTheme.typography.titleLarge,
                            color = Ink,
                            modifier = Modifier.weight(1f),
                        )
                        SwipeHint(loc.t("home.swipeHint"))
                        Spacer(Modifier.width(12.dp))
                        Text(
                            loc.plural("home.plateCount", plated.size),
                            style = MaterialTheme.typography.bodySmall,
                            color = InkMuted,
                        )
                    }
                    Spacer(Modifier.height(10.dp))
                    Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
                }
                Spacer(Modifier.height(18.dp))
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    items(plated.size) { index ->
                        PlateTile(plated[index], index) { onOpenPlant(it, "shelf") }
                    }
                }
            }
        }

        // ===== Field photographs =====
        item {
            Spacer(Modifier.height(36.dp))
            Column(Modifier.padding(horizontal = 16.dp)) {
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        loc.t("home.photosTitle"),
                        style = MaterialTheme.typography.titleLarge,
                        color = Ink,
                        modifier = Modifier.weight(1f),
                    )
                    Text(
                        loc.plural("gallery.photoCount", plants.size),
                        style = MaterialTheme.typography.bodySmall,
                        color = InkMuted,
                    )
                }
                Spacer(Modifier.height(10.dp))
                Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
            }
            Spacer(Modifier.height(14.dp))
        }
        val rows = plants.chunked(3)
        items(rows.size) { rowIndex ->
            Row(
                horizontalArrangement = Arrangement.spacedBy(2.dp),
                modifier = Modifier.padding(horizontal = 2.dp, vertical = 1.dp),
            ) {
                rows[rowIndex].forEachIndexed { colIndex, plant ->
                    val flatIndex = rowIndex * 3 + colIndex
                    GalleryTile(
                        plant = plant,
                        modifier = Modifier.weight(1f),
                        onClick = {
                            if (settings.tileTap == TileTap.DETAIL) onOpenPlant(plant, "tile")
                            else onOpenViewer(flatIndex)
                        },
                    )
                }
                repeat(3 - rows[rowIndex].size) { Spacer(Modifier.weight(1f)) }
            }
        }

        item { FooterBlock(onOpenLegal) }
    }
}

@Composable
private fun GalleryTile(plant: Plant, modifier: Modifier, onClick: () -> Unit) {
    val settings = LocalSettings.current
    val country = settings.country
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()

    Box(
        modifier
            .aspectRatio(1f)
            // Web PlantCard's whileTap scale 0.97.
            .scale(if (pressed && !settings.reduceMotion) 0.97f else 1f)
            .clip(RoundedCornerShape(0.dp))
            .sharedPlantImage("tile-${plant.slug}")
            .clickable(interactionSource = interaction, indication = null) { onClick() },
    ) {
        PlantImage(country, plant, ImgSize.THUMB, modifier = Modifier.fillMaxSize())
        if (settings.tileLabels) {
            Box(
                Modifier
                    .align(Alignment.BottomStart)
                    .fillMaxWidth()
                    .background(
                        Brush.verticalGradient(
                            listOf(
                                Color.Transparent,
                                Color.Black.copy(alpha = 0.4f),
                                Color.Black.copy(alpha = 0.8f),
                            )
                        )
                    )
                    .padding(start = 6.dp, end = 6.dp, bottom = 6.dp, top = 26.dp),
            ) {
                Text(
                    plant.names[settings.language],
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.Medium, lineHeight = 13.sp),
                    color = Color.White,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

@Composable
private fun PlateTile(plant: Plant, index: Int, onOpenPlant: (Plant) -> Unit) {
    val settings = LocalSettings.current
    val country = settings.country
    Column(Modifier.width(180.dp).scaledClickable { onOpenPlant(plant) }) {
        Box(
            Modifier
                .size(180.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Parchment)
                .border(1.dp, Hairline, RoundedCornerShape(8.dp))
                .sharedPlantImage("shelf-${plant.slug}"),
        ) {
            PlantImage(
                country, plant, ImgSize.THUMB,
                plate = true,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize().plateThumbCrop(),
            )
        }
        Spacer(Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                plateNumeral(index),
                style = MaterialTheme.typography.labelSmall,
                color = InkMuted,
            )
            Column {
                Text(
                    plant.names[settings.language],
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                    color = Ink,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                if (settings.showLatin) {
                    Text(
                        plant.names.latin,
                        style = MaterialTheme.typography.bodySmall.copy(fontStyle = FontStyle.Italic),
                        color = InkMuted,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
        }
    }
}

/** Drifting chevrons — the web's "keep swiping" cue on the plates shelf. */
@Composable
private fun SwipeHint(text: String) {
    val settings = LocalSettings.current
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(3.dp),
    ) {
        Text(text, style = MaterialTheme.typography.labelSmall, color = Forest)
        if (settings.reduceMotion) {
            Text("»", color = Forest, style = MaterialTheme.typography.labelSmall)
        } else {
            val transition = rememberInfiniteTransition(label = "swipe")
            val drift by transition.animateFloat(
                initialValue = 0f, targetValue = 1f,
                animationSpec = infiniteRepeatable(tween(700), RepeatMode.Reverse),
                label = "drift",
            )
            Text(
                "»",
                color = Forest.copy(alpha = 0.5f + drift * 0.5f),
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier.graphicsLayer { translationX = drift * 3.dp.toPx() },
            )
        }
    }
}
