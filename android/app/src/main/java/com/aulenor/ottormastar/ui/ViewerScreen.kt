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
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
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

/** One viewer entry: which image + editorial caption fields. */
data class ViewerItem(
    val plant: Plant,
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
    country: Country,
    items: List<ViewerItem>,
    initialIndex: Int,
    onDismiss: () -> Unit,
    onOpenDetail: ((String) -> Unit)? = null,
) {
    val settings = LocalSettings.current
    val loc = rememberL10n()
    val scope = rememberCoroutineScope()

    val pagerState = rememberPagerState(initialPage = initialIndex, pageCount = { items.size })
    var zoomed by remember { mutableStateOf(false) }
    var dragY by remember { mutableFloatStateOf(0f) }
    val fade = remember { Animatable(if (settings.reduceMotion) 1f else 0f) }

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
        Box(Modifier.fillMaxSize().alpha(fade.value)) {
            // Backdrop: near-black base + blurred copy of the image (iOS
            // Photos letterbox fill), dimming as the image is dragged down.
            Box(Modifier.fillMaxSize().alpha(backdropAlpha)) {
                Box(Modifier.fillMaxSize().background(Color(0xFF0A0A0A)))
                AsyncImage(
                    model = plantImageModel(country, current.plant, ImgSize.MEDIUM, current.plate),
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
                    country = country,
                    item = item,
                    onZoomChange = { zoomed = it },
                    reduceMotion = settings.reduceMotion,
                    modifier = Modifier.padding(top = 56.dp, bottom = 150.dp),
                )
            }

            // Chrome: counter + close, fading with the drag.
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 40.dp)
                    .alpha(chromeAlpha),
            ) {
                Text(
                    "${pagerState.currentPage + 1} / ${items.size}",
                    style = MaterialTheme.typography.labelLarge,
                    color = Color.White,
                    modifier = Modifier
                        .background(Color.Black.copy(alpha = 0.4f), CircleShape)
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                )
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

            // Caption panel.
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
                    .padding(start = 20.dp, end = 20.dp, top = 60.dp, bottom = 40.dp)
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
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            for (cat in current.plant.categories) CategoryBadge(cat, onDark = true)
                        }
                    }
                    if (current.detailSlug != null && onOpenDetail != null) {
                        Text(
                            loc.t("plant.details") + " ↗",
                            style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
                            color = Ink,
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
    country: Country,
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
                model = plantImageModel(country, item.plant, ImgSize.MEDIUM, item.plate),
                contentDescription = item.plant.names.latin,
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxSize(),
            )
            // Remote full-res quietly replaces the bundled medium when it loads.
            AsyncImage(
                model = plantImageModel(country, item.plant, ImgSize.FULL, item.plate),
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxSize(),
            )
        }
    }
}
