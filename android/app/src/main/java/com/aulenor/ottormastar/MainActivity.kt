package com.aulenor.ottormastar

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.ExperimentalSharedTransitionApi
import androidx.compose.animation.SharedTransitionLayout
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Photo
import androidx.compose.material.icons.outlined.Newspaper
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.navArgument
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.aulenor.ottormastar.data.LocalSettings
import com.aulenor.ottormastar.data.Plant
import com.aulenor.ottormastar.data.PlantStore
import com.aulenor.ottormastar.data.Settings
import com.aulenor.ottormastar.ui.AboutScreen
import com.aulenor.ottormastar.ui.CatalogScreen
import com.aulenor.ottormastar.ui.Cream
import com.aulenor.ottormastar.ui.CreamDark
import com.aulenor.ottormastar.ui.DetailScreen
import com.aulenor.ottormastar.ui.Forest
import com.aulenor.ottormastar.ui.HomeScreen
import com.aulenor.ottormastar.ui.Ink
import com.aulenor.ottormastar.ui.InkMuted
import com.aulenor.ottormastar.ui.HelpScreen
import com.aulenor.ottormastar.ui.LegalScreen
import com.aulenor.ottormastar.ui.LocalNavAnimation
import com.aulenor.ottormastar.ui.LocalSharedTransition
import com.aulenor.ottormastar.ui.OttorMastarTheme
import com.aulenor.ottormastar.ui.NewsScreen
import com.aulenor.ottormastar.ui.SearchScreen
import com.aulenor.ottormastar.ui.SettingsScreen
import com.aulenor.ottormastar.ui.ViewerItem
import com.aulenor.ottormastar.ui.ViewerOverlay
import com.aulenor.ottormastar.ui.rememberL10n

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        PlantStore.load(applicationContext)
        // Best-effort over-the-air content sync: fetch the hosted catalog in the
        // background and cache it for the NEXT launch (see PlantStore.refresh).
        // The bundled/cached snapshot already rendered, so this never blocks UI.
        PlantStore.refresh(applicationContext)
        enableEdgeToEdge()
        setContent {
            val context = LocalContext.current
            val settings = remember { Settings(context) }
            CompositionLocalProvider(LocalSettings provides settings) {
                // Root text scale — the web's data-text-size rem scaling.
                val density = LocalDensity.current
                CompositionLocalProvider(
                    LocalDensity provides Density(
                        density.density,
                        density.fontScale * settings.textSize.scale,
                    )
                ) {
                    OttorMastarTheme {
                        AppRoot()
                    }
                }
            }
        }
    }
}

private data class Tab(val route: String, val labelKey: String, val icon: ImageVector)

/** Viewer request: which items, which starting index. */
private data class ViewerRequest(val items: List<ViewerItem>, val index: Int)

@OptIn(ExperimentalSharedTransitionApi::class)
@Composable
private fun AppRoot() {
    val nav = rememberNavController()
    val loc = rememberL10n()
    val settings = LocalSettings.current
    val country = settings.country
    var viewer by remember { mutableStateOf<ViewerRequest?>(null) }

    val tabs = listOf(
        Tab("home", "nav.gallery", Icons.Outlined.Photo),
        Tab("catalog", "nav.catalog", Icons.AutoMirrored.Outlined.MenuBook),
        Tab("search", "nav.search", Icons.Outlined.Search),
        Tab("news", "nav.news", Icons.Outlined.Newspaper),
        Tab("about", "nav.about", Icons.Outlined.Info),
    )

    val backStack by nav.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route

    // Child screens (plant/settings/help/legal) are top-level routes, so on
    // them `currentRoute == tab.route` is false for every tab and the bar
    // would show NO selection. Remember which tab we're "inside" so its icon
    // stays lit on children too.
    val tabRoutes = remember { setOf("home", "catalog", "search", "news", "about") }
    var lastTabRoute by rememberSaveable { mutableStateOf("home") }
    LaunchedEffect(currentRoute) {
        if (currentRoute in tabRoutes) lastTabRoute = currentRoute!!
    }
    val activeTabRoute = if (currentRoute in tabRoutes) currentRoute else lastTabRoute
    // launchSingleTop everywhere: a double-tap (mouse users double-click by
    // habit) must never push the same screen twice — that makes Back appear
    // broken. `src` names the tapped element so the detail hero can join the
    // matching shared-element key ("shelf-…", "catalog-…", …).
    val openPlant = { plant: Plant, src: String ->
        nav.navigate("plant/${plant.slug}?src=$src") { launchSingleTop = true }
    }

    // The web's page-enter motion: opacity + a small rise, ease [.32,.72,0,1].
    val pushEase = CubicBezierEasing(0.32f, 0.72f, 0f, 1f)
    val reduce = settings.reduceMotion

    Scaffold(
        containerColor = Cream,
        bottomBar = {
            NavigationBar(containerColor = Cream) {
                for (tab in tabs) {
                    NavigationBarItem(
                        selected = activeTabRoute == tab.route,
                        onClick = {
                            // From a child screen (plant/settings/help/legal) a
                            // tab tap must LEAVE the child. The plain
                            // popUpTo(saveState) + restoreState combo captured
                            // the child into the tab's saved state and then
                            // restored it immediately — the "Home button does
                            // nothing" bug. Pop back to the tab if it's beneath
                            // us; otherwise navigate WITHOUT save/restore so
                            // the child can never round-trip back.
                            val onChild = currentRoute != null && currentRoute !in tabRoutes
                            if (!(onChild && nav.popBackStack(tab.route, false))) {
                                nav.navigate(tab.route) {
                                    popUpTo(nav.graph.findStartDestination().id) {
                                        saveState = !onChild
                                    }
                                    launchSingleTop = true
                                    restoreState = !onChild
                                }
                            }
                        },
                        icon = {
                            // Selection pop: a low-damping spring overshoots
                            // past 1.0 on the way up — the icon lands with a
                            // small bounce instead of snapping.
                            val selected = activeTabRoute == tab.route
                            val iconScale by animateFloatAsState(
                                targetValue = if (selected && !reduce) 1f else 0.92f,
                                animationSpec = spring(dampingRatio = 0.45f, stiffness = 700f),
                                label = "tabIcon",
                            )
                            Icon(
                                tab.icon,
                                contentDescription = null,
                                modifier = Modifier.scale(if (reduce) 1f else iconScale),
                            )
                        },
                        label = {
                            // Long Sakha labels ("Биһиги туспутунан") wrap to
                            // two tight centered lines instead of clipping.
                            Text(
                                loc.t(tab.labelKey),
                                textAlign = TextAlign.Center,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis,
                                lineHeight = MaterialTheme.typography.labelMedium.fontSize * 1.15,
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Forest,
                            selectedTextColor = Forest,
                            indicatorColor = CreamDark,
                            unselectedIconColor = InkMuted,
                            unselectedTextColor = InkMuted,
                        ),
                    )
                }
            }
        },
    ) { padding ->
        // SharedTransitionLayout hosts the tile→detail shared-element motion;
        // the scope goes into a CompositionLocal so tiles opt in via
        // Modifier.sharedPlantImage() without new parameters everywhere.
        SharedTransitionLayout(Modifier.padding(padding)) {
            CompositionLocalProvider(LocalSharedTransition provides this) {
        NavHost(
            navController = nav,
            startDestination = "home",
            enterTransition = {
                if (reduce) fadeIn(tween(150))
                else fadeIn(tween(320, easing = pushEase)) +
                    slideInVertically(tween(320, easing = pushEase)) { it / 24 }
            },
            exitTransition = { fadeOut(tween(if (reduce) 100 else 160)) },
            popEnterTransition = { fadeIn(tween(if (reduce) 150 else 240, easing = pushEase)) },
            popExitTransition = {
                if (reduce) fadeOut(tween(100))
                else fadeOut(tween(240, easing = pushEase)) +
                    slideOutVertically(tween(240, easing = pushEase)) { it / 24 }
            },
        ) {
            composable("home") {
                CompositionLocalProvider(LocalNavAnimation provides this) {
                HomeScreen(
                    onOpenPlant = openPlant,
                    onOpenViewer = { index ->
                        viewer = ViewerRequest(
                            country.plants.map {
                                ViewerItem(
                                    plant = it,
                                    country = country,
                                    plate = false,
                                    // Match iOS: the field-photo viewer labels each
                                    // item "Photograph" (SP2-M09).
                                    kindLabel = loc.t("plant.photograph"),
                                    detailSlug = it.slug,
                                )
                            },
                            index,
                        )
                    },
                    onOpenCatalog = {
                        nav.navigate("catalog") {
                            popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onOpenLegal = { nav.navigate("legal") { launchSingleTop = true } },
                )
                }
            }
            composable("catalog") {
                CompositionLocalProvider(LocalNavAnimation provides this) {
                    CatalogScreen(onOpenPlant = { openPlant(it, "catalog") })
                }
            }
            composable("search") {
                CompositionLocalProvider(LocalNavAnimation provides this) {
                    SearchScreen(onOpenPlant = { openPlant(it, "search") })
                }
            }
            composable("news") { NewsScreen() }
            composable("about") {
                AboutScreen(
                    onOpenSettings = { nav.navigate("settings") { launchSingleTop = true } },
                    onOpenHelp = { nav.navigate("help") { launchSingleTop = true } },
                    onOpenLegal = { nav.navigate("legal") { launchSingleTop = true } },
                )
            }
            composable("settings") { SettingsScreen(onBack = { nav.popBackStack() }) }
            composable("help") {
                HelpScreen(
                    onBack = { nav.popBackStack() },
                    onOpenLegal = { nav.navigate("legal") { launchSingleTop = true } },
                )
            }
            composable("legal") { LegalScreen(onBack = { nav.popBackStack() }) }
            composable(
                "plant/{slug}?src={src}",
                arguments = listOf(navArgument("src") { defaultValue = "" }),
                // The detail page owns its own entrance (sheet spring), like
                // the web — no page-level rise on top of it.
                enterTransition = { fadeIn(tween(if (reduce) 150 else 260, easing = pushEase)) },
            ) { entry ->
                val slug = entry.arguments?.getString("slug")
                val src = entry.arguments?.getString("src").orEmpty()
                // A bad/stale slug (edited deep link, removed plant) must show a
                // proper not-found screen with a way back — never a blank page.
                val found = slug?.let { PlantStore.findPlant(it) }
                if (found == null) {
                    // "Back to gallery" always lands somewhere real: pop if we
                    // have history, otherwise route home (a cold deep link into
                    // a dead slug has an empty back stack).
                    PlantNotFound(onBack = {
                        if (!nav.popBackStack()) {
                            nav.navigate("home") {
                                popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    })
                    return@composable
                }
                val (plant, plantCountry) = found
                val kindLoc = rememberL10n()
                CompositionLocalProvider(LocalNavAnimation provides this) {
                DetailScreen(
                    plant = plant,
                    country = plantCountry,
                    sharedKey = if (src.isEmpty()) null else "$src-${plant.slug}",
                    onOpenViewer = { slides, index ->
                        viewer = ViewerRequest(
                            slides.map { isPlate ->
                                ViewerItem(
                                    plant = plant,
                                    // The plant's OWN resolved country, which may
                                    // differ from the active setting (findPlant
                                    // searches every country) — so the viewer's
                                    // image URLs resolve against the right dataset.
                                    country = plantCountry,
                                    plate = isPlate,
                                    kindLabel = kindLoc.t(
                                        if (isPlate) "plant.illustration" else "plant.photograph"),
                                )
                            },
                            index,
                        )
                    },
                    onOpenLegal = { nav.navigate("legal") { launchSingleTop = true } },
                )
                }
            }
        }
            }
        }
    }

    viewer?.let { request ->
        ViewerOverlay(
            // Each ViewerItem carries its own plant's country now (SP2-H01), so
            // the overlay resolves image URLs per item instead of from settings.
            items = request.items,
            initialIndex = request.index,
            onDismiss = { viewer = null },
            onOpenDetail = { slug ->
                nav.navigate("plant/$slug") { launchSingleTop = true }
            },
        )
    }
}

/**
 * Shown when a plant route resolves to no plant (stale/edited deep link,
 * removed dataset entry). Herbarium-plain: cream canvas, serif-weight title,
 * muted body, one Forest "back to gallery" action — never a blank screen.
 */
@Composable
private fun PlantNotFound(onBack: () -> Unit) {
    val loc = rememberL10n()
    Box(
        Modifier
            .fillMaxSize()
            .background(Cream)
            .padding(32.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                loc.t("plant.notFound"),
                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.SemiBold),
                color = Ink,
                textAlign = TextAlign.Center,
            )
            Text(
                loc.t("plant.notFoundBody"),
                style = MaterialTheme.typography.bodyMedium,
                color = InkMuted,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(8.dp))
            Text(
                loc.t("plant.backToGallery"),
                style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
                color = Forest,
                modifier = Modifier
                    .clip(RoundedCornerShape(999.dp))
                    .clickable { onBack() }
                    .padding(horizontal = 20.dp, vertical = 12.dp),
            )
        }
    }
}
