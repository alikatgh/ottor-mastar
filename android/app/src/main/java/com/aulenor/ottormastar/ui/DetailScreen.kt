package com.aulenor.ottormastar.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.nestedscroll.NestedScrollConnection
import androidx.compose.ui.input.nestedscroll.NestedScrollSource
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.layout.ContentScale
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aulenor.ottormastar.data.Country
import com.aulenor.ottormastar.data.Language
import com.aulenor.ottormastar.data.LeadImage
import com.aulenor.ottormastar.data.LocalSettings
import com.aulenor.ottormastar.data.Plant
import kotlin.math.roundToInt

/**
 * Web-parity plant page: swipeable image panel on parchment (plate ↔ photo,
 * order follows the "lead image" setting) with frosted paging dots and a zoom
 * affordance, then a white info sheet that rises with a spring — grabber,
 * serif title, badges, description, names table, medicinal uses with the (?)
 * legal note, habitat, blooming season, further reading (Wikipedia), and the
 * amber disclaimer linking to Legal.
 */
@Composable
fun DetailScreen(
    plant: Plant,
    country: Country,
    onOpenViewer: (slides: List<Boolean>, index: Int) -> Unit,
    onOpenLegal: () -> Unit,
) {
    val settings = LocalSettings.current
    val loc = rememberL10n()
    val lang = settings.language
    val uriHandler = LocalUriHandler.current

    // true = plate slide, false = photo slide.
    val slides = remember(plant.slug, settings.leadImage) {
        val plate = if (plant.hasIllustration) listOf(true) else emptyList()
        if (settings.leadImage == LeadImage.PHOTO) listOf(false) + plate else plate + listOf(false)
    }
    val pagerState = rememberPagerState(pageCount = { slides.size })

    // When the plant changes, or the lead-image order flips, snap the carousel
    // back to the first slide — otherwise `currentPage` points at a stale slide
    // (or past the end for a shorter list). Web parity: PlantDetailPage resets
    // activeSlide on [slug, leadImage] (SP2-M08 / R2-W-H01).
    LaunchedEffect(plant.slug, settings.leadImage) {
        pagerState.scrollToPage(0)
    }

    // The web's sheet entrance: y 28→0 + fade, spring 320/34.
    val sheetOffset = remember { Animatable(if (settings.reduceMotion) 0f else 28f) }
    val sheetAlpha = remember { Animatable(if (settings.reduceMotion) 1f else 0f) }
    LaunchedEffect(Unit) {
        if (!settings.reduceMotion) {
            sheetOffset.animateTo(0f, spring(dampingRatio = 0.85f, stiffness = 320f))
        }
    }
    LaunchedEffect(Unit) {
        if (!settings.reduceMotion) {
            sheetAlpha.animateTo(1f, spring(dampingRatio = 0.85f, stiffness = 320f))
        }
    }

    val scrollState = rememberScrollState()
    // The image panel's HorizontalPager lives inside a verticalScroll parent.
    // Left to itself the pager's touch region can swallow a mostly-vertical
    // drag, so the page won't scroll while a finger is over the images. This
    // connection forwards vertical deltas the pager doesn't use up to the
    // parent scroll (horizontal paging still wins horizontally) — SP2-M10.
    val panelToParentScroll = remember(scrollState) {
        object : NestedScrollConnection {
            override fun onPostScroll(
                consumed: Offset,
                available: Offset,
                source: NestedScrollSource,
            ): Offset {
                if (available.y == 0f) return Offset.Zero
                val consumedY = scrollState.dispatchRawDelta(-available.y)
                return Offset(0f, -consumedY)
            }
        }
    }

    Column(Modifier.fillMaxSize().background(Color.White).verticalScroll(scrollState)) {
        // ===== Image panel =====
        Box(Modifier.fillMaxWidth().height(400.dp).background(Parchment)) {
            // beyondViewportPageCount keeps the second slide composed (no
            // decode jank on first swipe); tap via detectTapGestures instead
            // of clickable — no ripple, no press-delay, never fights the
            // pager's horizontal drag.
            HorizontalPager(
                state = pagerState,
                beyondViewportPageCount = 1,
                modifier = Modifier.fillMaxSize().nestedScroll(panelToParentScroll),
            ) { page ->
                val isPlate = slides[page]
                if (isPlate) {
                    Box(
                        Modifier
                            .fillMaxSize()
                            .pointerInput(page) { detectTapGestures { onOpenViewer(slides, page) } },
                        contentAlignment = Alignment.Center,
                    ) {
                        PlantImage(
                            country, plant, ImgSize.MEDIUM,
                            plate = true,
                            contentScale = ContentScale.Fit,
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(start = 16.dp, end = 16.dp, top = 24.dp, bottom = 60.dp)
                                .graphicsLayer { shadowElevation = 16f },
                        )
                    }
                } else {
                    Box(
                        Modifier
                            .fillMaxSize()
                            .pointerInput(page) { detectTapGestures { onOpenViewer(slides, page) } },
                    ) {
                        PlantImage(
                            country, plant, ImgSize.MEDIUM,
                            modifier = Modifier.fillMaxSize(),
                        )
                        Box(
                            Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.verticalGradient(
                                        listOf(Color.Transparent, Color.Black.copy(alpha = 0.25f))
                                    )
                                )
                        )
                    }
                }
            }

            // Zoom affordance.
            Text(
                "⊕",
                color = Color.White,
                fontSize = 18.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 16.dp, end = 16.dp)
                    .size(36.dp)
                    .background(Color.Black.copy(alpha = 0.3f), CircleShape)
                    .padding(top = 4.dp),
            )

            // Frosted paging dots, riding above the sheet overlap.
            if (slides.size > 1) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 48.dp)
                        .background(Color.White.copy(alpha = 0.7f), CircleShape)
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                ) {
                    repeat(slides.size) { i ->
                        Box(
                            Modifier
                                .size(8.dp)
                                .background(
                                    if (pagerState.currentPage == i) Forest
                                    else Forest.copy(alpha = 0.25f),
                                    CircleShape,
                                )
                        )
                    }
                }
            }
        }

        // ===== Info sheet =====
        val density = LocalDensity.current.density
        Column(
            Modifier
                .offset { IntOffset(0, ((sheetOffset.value - 24f) * density).roundToInt()) }
                .alpha(sheetAlpha.value)
                .fillMaxWidth()
                .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                .background(Color.White),
        ) {
            Box(
                Modifier
                    .align(Alignment.CenterHorizontally)
                    .padding(top = 10.dp)
                    .size(width = 40.dp, height = 5.dp)
                    .background(Ink.copy(alpha = 0.15f), CircleShape)
            )

            Column(
                Modifier.padding(horizontal = 24.dp, vertical = 26.dp),
                verticalArrangement = Arrangement.spacedBy(32.dp),
            ) {
                // Title block.
                Column {
                    Text(
                        plant.names[lang],
                        style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                        color = Ink,
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        plant.names.latin,
                        style = MaterialTheme.typography.bodyLarge.copy(fontStyle = FontStyle.Italic),
                        color = InkMuted,
                    )
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        for (cat in plant.categories) CategoryBadge(cat)
                    }
                }

                Text(
                    plant.description[lang],
                    style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 23.sp),
                    color = InkLight,
                )

                NamesTable(plant, loc.t("plant.names"), lang)
                MedicinalSection(plant, lang)
                Section(loc.t("plant.habitat")) {
                    Text(
                        plant.habitat[lang],
                        style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 23.sp),
                        color = InkLight,
                    )
                }
                Section(loc.t("plant.bloomingSeason")) {
                    Text(
                        loc.season(plant.bloomingSeason),
                        style = MaterialTheme.typography.bodyMedium,
                        color = InkLight,
                    )
                }

                // Further reading — language-matched Wikipedia lookup.
                Section(loc.t("plant.furtherReading")) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Card)
                            .border(1.dp, Hairline, RoundedCornerShape(12.dp))
                            .clickable { uriHandler.openUri(plant.wikipediaUrl(lang)) }
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                    ) {
                        Text("↗", color = Forest, style = MaterialTheme.typography.titleMedium)
                        Column(Modifier.weight(1f)) {
                            Text(
                                loc.t("plant.readOnWikipedia"),
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                                color = Ink,
                            )
                            Text(
                                "${lang.code}.wikipedia.org",
                                style = MaterialTheme.typography.labelSmall,
                                color = InkMuted,
                            )
                        }
                    }
                }

                DisclaimerBox(onOpenLegal = onOpenLegal)
            }
        }
    }
}

@Composable
private fun Section(title: String, content: @Composable () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OverlineLabel(title)
        content()
    }
}

@Composable
private fun NamesTable(plant: Plant, title: String, lang: Language) {
    val loc = rememberL10n()
    Section(title) {
        Column {
            NameRow(loc.t("plant.yakutName"), plant.names.sah)
            Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
            NameRow(loc.t("plant.russianName"), plant.names.ru)
            Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
            NameRow(loc.t("plant.englishName"), plant.names.en)
            Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
            NameRow(loc.t("plant.latinName"), plant.names.latin, italic = true)
        }
    }
}

@Composable
private fun NameRow(label: String, value: String, italic: Boolean = false) {
    Row(Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Text(
            label,
            style = MaterialTheme.typography.bodySmall,
            color = InkMuted,
        )
        Spacer(Modifier.weight(1f))
        Spacer(Modifier.width(16.dp))
        Text(
            value,
            style = MaterialTheme.typography.bodySmall.copy(
                fontWeight = if (italic) FontWeight.Normal else FontWeight.Medium,
                fontStyle = if (italic) FontStyle.Italic else FontStyle.Normal,
            ),
            color = Ink,
            textAlign = TextAlign.End,
        )
    }
}

/** Medicinal uses with the (?) affordance that reveals the legal note. */
@Composable
private fun MedicinalSection(plant: Plant, lang: Language) {
    val settings = LocalSettings.current
    val loc = rememberL10n()
    var tipOpen by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text(
                    loc.t("plant.medicinalUses").uppercase(),
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.SemiBold, letterSpacing = 1.6.sp),
                    color = InkMuted,
                )
                // 16dp visual, 40dp touch target — small icons must never be
                // their own hit area.
                Box(
                    Modifier
                        .size(40.dp)
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null,
                        ) { tipOpen = !tipOpen },
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        "?",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = if (tipOpen) Forest else InkMuted,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .size(16.dp)
                            .border(1.dp, if (tipOpen) Forest else InkMuted.copy(alpha = 0.5f), CircleShape),
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
        }

        AnimatedVisibility(
            visible = tipOpen,
            enter = if (settings.reduceMotion) fadeIn() else fadeIn() + expandVertically(),
            exit = if (settings.reduceMotion) fadeOut() else fadeOut() + shrinkVertically(),
        ) {
            Text(
                loc.t("plant.medicinalDisclaimer"),
                style = MaterialTheme.typography.bodySmall.copy(lineHeight = 17.sp),
                color = InkLight,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White)
                    .border(1.dp, Hairline, RoundedCornerShape(12.dp))
                    .padding(12.dp),
            )
        }

        Text(
            plant.medicinalUses[lang],
            style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 23.sp),
            color = InkLight,
        )
    }
}
