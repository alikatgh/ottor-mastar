package com.aulenor.ottormastar

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Photo
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
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
import com.aulenor.ottormastar.ui.InkMuted
import com.aulenor.ottormastar.ui.LegalScreen
import com.aulenor.ottormastar.ui.OttorMastarTheme
import com.aulenor.ottormastar.ui.SearchScreen
import com.aulenor.ottormastar.ui.SettingsScreen
import com.aulenor.ottormastar.ui.ViewerItem
import com.aulenor.ottormastar.ui.ViewerOverlay
import com.aulenor.ottormastar.ui.rememberL10n

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        PlantStore.load(applicationContext)
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
        Tab("about", "nav.about", Icons.Outlined.Info),
    )

    val backStack by nav.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route
    val openPlant = { plant: Plant -> nav.navigate("plant/${plant.slug}") }

    // The web's page-enter motion: opacity + a small rise, ease [.32,.72,0,1].
    val pushEase = CubicBezierEasing(0.32f, 0.72f, 0f, 1f)
    val reduce = settings.reduceMotion

    Scaffold(
        containerColor = Cream,
        bottomBar = {
            NavigationBar(containerColor = Cream) {
                for (tab in tabs) {
                    NavigationBarItem(
                        selected = currentRoute == tab.route,
                        onClick = {
                            nav.navigate(tab.route) {
                                popUpTo(nav.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(tab.icon, contentDescription = null) },
                        label = { Text(loc.t(tab.labelKey)) },
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
        NavHost(
            navController = nav,
            startDestination = "home",
            modifier = Modifier.padding(padding),
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
                HomeScreen(
                    onOpenPlant = openPlant,
                    onOpenViewer = { index ->
                        viewer = ViewerRequest(
                            country.plants.map {
                                ViewerItem(it, plate = false, kindLabel = null, detailSlug = it.slug)
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
                    onOpenLegal = { nav.navigate("legal") },
                )
            }
            composable("catalog") { CatalogScreen(onOpenPlant = openPlant) }
            composable("search") { SearchScreen(onOpenPlant = openPlant) }
            composable("about") {
                AboutScreen(
                    onOpenSettings = { nav.navigate("settings") },
                    onOpenLegal = { nav.navigate("legal") },
                )
            }
            composable("settings") { SettingsScreen() }
            composable("legal") { LegalScreen(onBack = { nav.popBackStack() }) }
            composable(
                "plant/{slug}",
                // The detail page owns its own entrance (sheet spring), like
                // the web — no page-level rise on top of it.
                enterTransition = { fadeIn(tween(if (reduce) 150 else 260, easing = pushEase)) },
            ) { entry ->
                val slug = entry.arguments?.getString("slug") ?: return@composable
                val found = PlantStore.findPlant(slug) ?: return@composable
                val (plant, plantCountry) = found
                val kindLoc = rememberL10n()
                DetailScreen(
                    plant = plant,
                    country = plantCountry,
                    onOpenViewer = { slides, index ->
                        viewer = ViewerRequest(
                            slides.map { isPlate ->
                                ViewerItem(
                                    plant, plate = isPlate,
                                    kindLabel = kindLoc.t(
                                        if (isPlate) "plant.illustration" else "plant.photograph"),
                                )
                            },
                            index,
                        )
                    },
                    onOpenLegal = { nav.navigate("legal") },
                )
            }
        }
    }

    viewer?.let { request ->
        ViewerOverlay(
            country = country,
            items = request.items,
            initialIndex = request.index,
            onDismiss = { viewer = null },
            onOpenDetail = { slug -> nav.navigate("plant/$slug") },
        )
    }
}
