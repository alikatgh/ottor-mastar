package com.aulenor.ottormastar.ui

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.calculatePan
import androidx.compose.foundation.gestures.calculateZoom
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.ui.input.pointer.PointerInputChange
import androidx.compose.ui.input.pointer.PointerInputScope
import androidx.compose.ui.input.pointer.positionChange
import androidx.compose.ui.input.pointer.util.VelocityTracker
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil3.compose.AsyncImage
import com.aulenor.ottormastar.data.Country
import com.aulenor.ottormastar.data.LocalSettings
import com.aulenor.ottormastar.data.Plant
import kotlinx.coroutines.launch
import kotlin.math.abs

/**
 * One viewer entry: which image + editorial caption fields. `country` is the
 * plant's OWN collection (matching iOS `ViewerItem.country`), so a
 * cross-collection entry resolves its images from the right imageBase — never
 * from `settings.country`.
 */
/** Text on the viewer's white pills — always near-black, never the themed Ink
 *  (dark-mode Ink is near-white and vanishes on the white capsule). */
private val ViewerPillInk = Color(0xFF201E19)

data class ViewerItem(
    val plant: Plant,
    val country: Country,
    val plate: Boolean,
    val kindLabel: String?,
    val detailSlug: String? = null,
)

/**
 * Full-screen viewer with iOS-Photos motion, 1:1 with the web ImageViewer:
 * blurred image letterbox fill, springy settle on open, swipe-down-to-dismiss
 * (image follows the finger, backdrop and chrome fade), horizontal paging,
 * pinch/double-tap zoom per page, counter chip, close button, always-visible
 * caption with badges and optional Details action.
 */
@Composable
fun ViewerOverlay(
    items: List<ViewerItem>,
    initialIndex: Int,
    onDismiss: () -> Unit,
    onOpenDetail: ((String) -> Unit)? = null,
) {
    // Nothing to show (no slides / stale request) → dismiss instead of
    // indexing an empty list. Guards the pager's undefined empty state.
    if (items.isEmpty()) {
        LaunchedEffect(Unit) { onDismiss() }
        return
    }

    val settings = LocalSettings.current
    val loc = rememberL10n()
    val scope = rememberCoroutineScope()
    val uriHandler = LocalUriHandler.current
    val lang = settings.language

    val pagerState = rememberPagerState(initialPage = initialIndex, pageCount = { items.size })
    var zoomed by remember { mutableStateOf(false) }
    var dragY by remember { mutableFloatStateOf(0f) }
    val fade = remember { Animatable(if (settings.reduceMotion) 1f else 0f) }

    // Leaving a zoomed page must not carry the zoom-lock to the next: reset so
    // the pager scroll + dismiss drag are re-enabled (mirrors iOS SP2-M07).
    LaunchedEffect(pagerState.currentPage) { zoomed = false }

    LaunchedEffect(Unit) {
        if (!settings.reduceMotion) fade.animateTo(1f, tween(200))
    }

    fun close() {
        if (settings.reduceMotion) {
            onDismiss()
        } else {
            scope.launch {
                fade.animateTo(0f, tween(200))
                onDismiss()
            }
        }
    }

    val backdropAlpha = (1f - dragY / 900f).coerceIn(0.25f, 1f)
    val chromeAlpha = (1f - dragY / 350f).coerceIn(0f, 1f)
    val dragScale = (1f - dragY / 1000f * 0.14f).coerceAtLeast(0.86f)
    val current = items[pagerState.currentPage.coerceIn(items.indices)]

    Dialog(
        onDismissRequest = { close() },
        properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
    ) {
        BoxWithConstraints(Modifier.fillMaxSize().alpha(fade.value)) {
            // Wide layouts (tablet / large window / landscape) get the "museum
            // placard" two-column treatment — image beside a metadata panel,
            // 1:1 with the web desktop viewer. Phones keep the bottom caption.
            val isWide = maxWidth >= 600.dp
            val panelWidth = 360.dp
            // Backdrop: near-black base + blurred copy of the image (iOS
            // Photos letterbox fill), dimming as the image is dragged down.
            Box(Modifier.fillMaxSize().alpha(backdropAlpha)) {
                Box(Modifier.fillMaxSize().background(Color(0xFF0A0A0A)))
                AsyncImage(
                    model = plantImageModel(current.country, current.plant, ImgSize.MEDIUM, current.plate),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxSize()
                        .graphicsLayer { scaleX = 1.25f; scaleY = 1.25f }
                        .blur(60.dp)
                        .alpha(0.6f),
                )
                Box(
                    Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                listOf(
                                    Color.Black.copy(alpha = 0.45f),
                                    Color.Black.copy(alpha = 0.25f),
                                    Color.Black.copy(alpha = 0.7f),
                                )
                            )
                        )
                )
            }

            // Pager — drag down (not zoomed) to dismiss.
            HorizontalPager(
                state = pagerState,
                userScrollEnabled = !zoomed,
                // Neighbor pages stay composed so a swipe never lands on a
                // blank, still-decoding image.
                beyondViewportPageCount = 1,
                modifier = Modifier
                    .fillMaxSize()
                    // Wide mode: keep the image clear of the placard panel.
                    .padding(end = if (isWide) panelWidth else 0.dp)
                    .graphicsLayer {
                        translationY = dragY
                        scaleX = dragScale
                        scaleY = dragScale
                    }
                    .pointerInput(zoomed) {
                        if (!zoomed) {
                            // detectVerticalDragGestures only claims drags that
                            // pass VERTICAL touch slop — horizontal swipes fall
                            // through to the pager untouched.
                            detectVerticalDragOnly(
                                onDrag = { dy, _ ->
                                    dragY = (dragY + dy).coerceAtLeast(0f)
                                },
                                onEnd = { velocity ->
                                    if (dragY > 300f || velocity > 2200f) {
                                        close()
                                    } else {
                                        scope.launch {
                                            val anim = Animatable(dragY)
                                            anim.animateTo(0f, spring(dampingRatio = 0.82f, stiffness = 420f)) {
                                                dragY = value
                                            }
                                        }
                                    }
                                },
                            )
                        }
                    },
            ) { page ->
                val item = items[page]
                ZoomablePage(
                    item = item,
                    onZoomChange = { zoomed = it },
                    reduceMotion = settings.reduceMotion,
                    // Wide mode's metadata is in the side panel, so the image
                    // only needs the top-bar reserve, not the caption reserve.
                    // The dialog is edge-to-edge (decorFitsSystemWindows=false),
                    // so the reserves sit on TOP of the real system-bar insets.
                    modifier = Modifier
                        .systemBarsPadding()
                        .padding(top = 56.dp, bottom = if (isWide) 40.dp else 150.dp),
                )
            }

            // Chrome: counter + close, fading with the drag.
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .fillMaxWidth()
                    // Real status-bar inset, not a guessed 40dp — edge-to-edge
                    // dialogs get zero automatic insets.
                    .statusBarsPadding()
                    .padding(horizontal = 14.dp, vertical = 10.dp)
                    .alpha(chromeAlpha),
            ) {
                // Wide mode carries the counter in the placard, so the top bar
                // stays clean with just the close button (matches web desktop).
                if (!isWide) {
                    Text(
                        "${pagerState.currentPage + 1} / ${items.size}",
                        style = MaterialTheme.typography.labelLarge,
                        color = Color.White,
                        modifier = Modifier
                            .background(Color.Black.copy(alpha = 0.4f), CircleShape)
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                    )
                }
                Spacer(Modifier.weight(1f))
                Text(
                    "✕",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.White,
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(Color.Black.copy(alpha = 0.4f))
                        .pointerInput(Unit) { detectTapGestures { close() } }
                        .padding(12.dp),
                )
            }

            // Caption panel (compact) — replaced by the placard on wide layouts.
            if (!isWide) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .background(
                            Brush.verticalGradient(
                                listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f), Color.Black)
                            )
                        )
                        // Gradient runs under the system nav bar (edge-to-edge),
                        // but the content must clear it — inset BEFORE the
                        // bottom padding, or the buttons hug the gesture bar.
                        .navigationBarsPadding()
                        .padding(start = 20.dp, end = 20.dp, top = 60.dp, bottom = 24.dp)
                        .alpha(chromeAlpha),
                ) {
                    current.kindLabel?.let {
                        Text(
                            it.uppercase(),
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.SemiBold, letterSpacing = 1.4.sp),
                            color = Color.White.copy(alpha = 0.55f),
                        )
                    }
                    Row(verticalAlignment = Alignment.Bottom) {
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                current.plant.names[settings.language],
                                style = MaterialTheme.typography.headlineMedium.copy(
                                    fontWeight = FontWeight.SemiBold),
                                color = Color.White,
                            )
                            Text(
                                current.plant.names.latin,
                                style = MaterialTheme.typography.bodyMedium.copy(fontStyle = FontStyle.Italic),
                                color = Color.White.copy(alpha = 0.65f),
                            )
                            BadgeRow(current.plant.categories, onDark = true)
                        }
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            // Wikipedia — round icon button, mirrors web mobile.
                            Text(
                                "↗",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                                color = Color.White,
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .background(Color.Black.copy(alpha = 0.3f))
                                    .border(1.dp, Color.White.copy(alpha = 0.25f), CircleShape)
                                    .pointerInput(current.plant.slug) {
                                        detectTapGestures { uriHandler.openUri(current.plant.wikipediaUrl(lang)) }
                                    }
                                    .padding(horizontal = 14.dp, vertical = 12.dp),
                            )
                            if (current.detailSlug != null && onOpenDetail != null) {
                                Text(
                                    loc.t("plant.details") + " ↗",
                                    style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
                                    // Fixed near-black, NOT the themed Ink: the
                                    // viewer chrome is always dark, and dark-mode
                                    // Ink is near-white — white-on-white pill.
                                    color = ViewerPillInk,
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(Color.White)
                                        .pointerInput(current.detailSlug) {
                                            detectTapGestures {
                                                onDismiss()
                                                onOpenDetail(current.detailSlug)
                                            }
                                        }
                                        .padding(horizontal = 18.dp, vertical = 13.dp),
                                )
                            }
                        }
                    }
                }
            }

            // Museum placard (wide layouts) — metadata column beside the image.
            if (isWide) {
                PlacardPanel(
                    item = current,
                    index = pagerState.currentPage,
                    total = items.size,
                    langCode = lang.name.lowercase(),
                    plantName = current.plant.names[settings.language],
                    onWikipedia = { uriHandler.openUri(current.plant.wikipediaUrl(lang)) },
                    onDetails = if (current.detailSlug != null && onOpenDetail != null) {
                        { onDismiss(); onOpenDetail(current.detailSlug) }
                    } else null,
                    modifier = Modifier
                        .align(Alignment.CenterEnd)
                        .width(panelWidth)
                        .fillMaxHeight()
                        .alpha(chromeAlpha),
                )
            }
        }
    }
}

/**
 * The wide-layout "museum placard" — the metadata column beside the image:
 * kind overline, serif name, italic Latin, category badges, a
 * language-matched Wikipedia link, an optional Details action, and the
 * plate counter. 1:1 with the web desktop viewer's panel.
 */
@Composable
private fun PlacardPanel(
    item: ViewerItem,
    index: Int,
    total: Int,
    langCode: String,
    plantName: String,
    onWikipedia: () -> Unit,
    onDetails: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    val loc = rememberL10n()
    Column(
        verticalArrangement = Arrangement.Center,
        modifier = modifier
            .background(Color.Black.copy(alpha = 0.55f))
            .border(width = 1.dp, color = Color.White.copy(alpha = 0.1f), shape = RoundedCornerShape(0.dp))
            .padding(horizontal = 36.dp),
    ) {
        item.kindLabel?.let {
            Text(
                it.uppercase(),
                style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = FontWeight.SemiBold, letterSpacing = 1.6.sp),
                color = Color.White.copy(alpha = 0.5f),
            )
            Spacer(Modifier.size(12.dp))
        }
        Text(
            plantName,
            style = MaterialTheme.typography.displaySmall.copy(fontWeight = FontWeight.SemiBold),
            color = Color.White,
        )
        Text(
            item.plant.names.latin,
            style = MaterialTheme.typography.titleMedium.copy(fontStyle = FontStyle.Italic),
            color = Color.White.copy(alpha = 0.6f),
            modifier = Modifier.padding(top = 8.dp),
        )
        if (item.plant.categories.isNotEmpty()) {
            BadgeRow(
                item.plant.categories,
                onDark = true,
                modifier = Modifier.padding(top = 22.dp),
            )
        }

        Spacer(Modifier.size(28.dp))
        Box(Modifier.fillMaxWidth().height(1.dp).background(Color.White.copy(alpha = 0.1f)))
        Spacer(Modifier.size(20.dp))

        // Wikipedia — a bordered link row (name + language-matched domain).
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(Color.White.copy(alpha = 0.05f))
                .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                .pointerInput(item.plant.slug) { detectTapGestures { onWikipedia() } }
                .padding(horizontal = 16.dp, vertical = 12.dp),
        ) {
            Column(Modifier.weight(1f)) {
                Text(
                    loc.t("plant.readOnWikipedia"),
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                    color = Color.White,
                )
                Text(
                    "$langCode.wikipedia.org",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White.copy(alpha = 0.45f),
                )
            }
            Text("↗", style = MaterialTheme.typography.bodyMedium, color = Color.White.copy(alpha = 0.4f))
        }

        if (onDetails != null) {
            Spacer(Modifier.size(10.dp))
            Text(
                loc.t("plant.details") + " ↗",
                style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
                color = ViewerPillInk,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White)
                    .pointerInput(Unit) { detectTapGestures { onDetails() } }
                    .padding(vertical = 14.dp),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            )
        }

        Spacer(Modifier.size(28.dp))
        Text(
            "%02d / %02d".format(index + 1, total),
            style = MaterialTheme.typography.labelMedium.copy(letterSpacing = 2.sp),
            color = Color.White.copy(alpha = 0.35f),
        )
    }
}

/**
 * Vertical-intent drag detector: hands horizontal motion to the pager,
 * accumulates vertical drags for the dismiss gesture.
 */
private suspend fun PointerInputScope.detectVerticalDragOnly(
    onDrag: (dy: Float, dx: Float) -> Unit,
    onEnd: (velocityY: Float) -> Unit,
) {
    val tracker = VelocityTracker()
    detectVerticalDragGestures(
        onDragStart = { tracker.resetTracking() },
        onVerticalDrag = { change: PointerInputChange, dragAmount: Float ->
            tracker.addPosition(change.uptimeMillis, change.position)
            onDrag(dragAmount, change.positionChange().x)
        },
        onDragEnd = { onEnd(tracker.calculateVelocity().y) },
        onDragCancel = { onEnd(0f) },
    )
}

/**
 * One zoomable page: bundled medium under remote full-res (which fades in on
 * arrival), pinch + double-tap zoom with pan, Photos-style settle on appear.
 */
@Composable
private fun ZoomablePage(
    item: ViewerItem,
    onZoomChange: (Boolean) -> Unit,
    reduceMotion: Boolean,
    modifier: Modifier = Modifier,
) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    val settle = remember { Animatable(if (reduceMotion) 1f else 0.94f) }

    LaunchedEffect(Unit) {
        if (!reduceMotion) settle.animateTo(1f, spring(dampingRatio = 0.85f, stiffness = 380f))
    }
    LaunchedEffect(scale) { onZoomChange(scale > 1.02f) }

    // Keep the zoomed image on-screen: pan is clamped to the overflow.
    fun clampOffset(raw: Offset, size: androidx.compose.ui.unit.IntSize): Offset {
        val maxX = (size.width * (scale - 1f)) / 2f
        val maxY = (size.height * (scale - 1f)) / 2f
        return Offset(raw.x.coerceIn(-maxX, maxX), raw.y.coerceIn(-maxY, maxY))
    }

    Box(
        modifier
            .fillMaxSize()
            // Zoom/pan claims touches ONLY for multi-finger gestures or a
            // single finger while zoomed in — otherwise the pager (horizontal
            // swipe) and the dismiss drag (vertical) get the events. This is
            // what detectTransformGestures gets wrong: it eats one-finger
            // drags too, which is why paging felt broken.
            .pointerInput(Unit) {
                awaitEachGesture {
                    awaitFirstDown(requireUnconsumed = false)
                    do {
                        val event = awaitPointerEvent()
                        val pressed = event.changes.count { it.pressed }
                        if (pressed > 1) {
                            val zoom = event.calculateZoom()
                            val pan = event.calculatePan()
                            scale = (scale * zoom).coerceIn(1f, 6f)
                            offset = if (scale > 1f) clampOffset(offset + pan, size) else Offset.Zero
                            event.changes.forEach { it.consume() }
                        } else if (pressed == 1 && scale > 1.02f) {
                            val pan = event.calculatePan()
                            offset = clampOffset(offset + pan, size)
                            event.changes.forEach { it.consume() }
                        }
                    } while (event.changes.any { it.pressed })
                }
            }
            .pointerInput(Unit) {
                detectTapGestures(
                    onDoubleTap = {
                        if (scale > 1f) {
                            scale = 1f; offset = Offset.Zero
                        } else {
                            scale = 2.4f
                        }
                    },
                )
            },
        contentAlignment = Alignment.Center,
    ) {
        Box(
            Modifier.graphicsLayer {
                scaleX = scale * settle.value
                scaleY = scale * settle.value
                translationX = offset.x
                translationY = offset.y
                alpha = if (reduceMotion) 1f else (0.4f + settle.value * 0.6f).coerceAtMost(1f)
            }
        ) {
            AsyncImage(
                model = plantImageModel(item.country, item.plant, ImgSize.MEDIUM, item.plate),
                contentDescription = item.plant.names.latin,
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxSize(),
            )
            // Remote full-res quietly replaces the bundled medium when it loads.
            AsyncImage(
                model = plantImageModel(item.country, item.plant, ImgSize.FULL, item.plate),
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxSize(),
            )
        }
    }
}
