package com.aulenor.ottormastar.ui

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.aulenor.ottormastar.data.CatalogSort
import com.aulenor.ottormastar.data.LocalSettings
import com.aulenor.ottormastar.data.Plant
import com.aulenor.ottormastar.data.SeasonOrder
import com.aulenor.ottormastar.data.plateNumeral
import java.text.Collator
import java.util.Locale

private val CATEGORY_FILTERS = listOf("all", "medicinal", "edible", "ornamental", "poisonous")

/**
 * Web-parity catalog: count in the header, search field, category filter
 * chips (color changes, never geometry), rows numbered by list position with
 * plate thumbs, Latin (per setting) and category badges. Sort follows the
 * "catalog order" setting: locale-aware alphabetical or blooming season.
 */
@Composable
fun CatalogScreen(onOpenPlant: (Plant) -> Unit) {
    val settings = LocalSettings.current
    val loc = rememberL10n()
    val country = settings.country
    var query by rememberSaveable { mutableStateOf("") }
    var activeCategory by rememberSaveable { mutableStateOf("all") }

    val lang = settings.language
    val collator = Collator.getInstance(Locale(lang.code))
    var filtered = country.plants.sortedWith(compareBy(collator) { it.names[lang] })
    if (settings.catalogSort == CatalogSort.SEASON) {
        filtered = filtered.sortedWith(
            compareBy<Plant> { SeasonOrder.rank(it.bloomingSeason) }
                .thenBy(collator) { it.names[lang] }
        )
    }
    if (activeCategory != "all") {
        filtered = filtered.filter { it.categories.contains(activeCategory) }
    }
    val q = query.trim()
    if (q.isNotEmpty()) {
        // Fold the query once; diacritic-insensitive to match iOS (SP2-M02).
        val qFolded = q.foldDiacritics()
        filtered = filtered.filter { plant ->
            listOf(
                plant.names.sah, plant.names.ru, plant.names.en, plant.names.latin,
                plant.names.mn ?: "", plant.names.zh ?: "",
            ).any { it.foldDiacritics().contains(qFolded) }
        }
    }

    // Adaptive grid: 1 column on phone width, 2–3 on tablet / large window,
    // so the browsable index uses the space (parity with the web catalog).
    // The header + empty state span the full row; entries are bordered cards.
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 340.dp),
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item(span = { GridItemSpan(maxLineSpan) }) {
            Column {
                Row(
                    verticalAlignment = Alignment.Bottom,
                    modifier = Modifier.padding(top = 16.dp, bottom = 20.dp),
                ) {
                    Text(
                        loc.t("catalog.title"),
                        style = MaterialTheme.typography.headlineMedium,
                        color = Ink,
                        modifier = Modifier.weight(1f),
                    )
                    Text(
                        "${filtered.size}",
                        style = MaterialTheme.typography.bodySmall,
                        color = InkMuted,
                    )
                }
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    placeholder = { Text(loc.t("catalog.searchPlaceholder"), color = InkMuted) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Card,
                        unfocusedContainerColor = Card,
                        focusedBorderColor = Forest.copy(alpha = 0.5f),
                        unfocusedBorderColor = Hairline,
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(16.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                ) {
                    for (key in CATEGORY_FILTERS) {
                        val active = activeCategory == key
                        // Color-only state change (never geometry), but the
                        // colors TWEEN instead of snapping.
                        val chipBg by animateColorAsState(
                            if (active) Forest else Color.Transparent, label = "chipBg")
                        val chipBorder by animateColorAsState(
                            if (active) Forest else Hairline, label = "chipBorder")
                        val chipText by animateColorAsState(
                            if (active) Color.White else InkLight, label = "chipText")
                        Text(
                            if (key == "all") loc.t("gallery.allPlants") else loc.t("categories.$key"),
                            style = MaterialTheme.typography.labelLarge,
                            color = chipText,
                            modifier = Modifier
                                .clip(CircleShape)
                                .background(chipBg)
                                .border(1.dp, chipBorder, CircleShape)
                                .clickable { activeCategory = key }
                                .padding(horizontal = 16.dp, vertical = 10.dp),
                        )
                    }
                }
                Spacer(Modifier.height(8.dp))
            }
        }

        if (filtered.isEmpty()) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Box(Modifier.fillMaxWidth().padding(vertical = 48.dp), contentAlignment = Alignment.Center) {
                    Text(loc.t("catalog.noResults"), color = InkMuted)
                }
            }
        } else {
            itemsIndexed(filtered, key = { _, p -> p.slug }) { index, plant ->
                // Rows glide to their new slots when the filter/sort/search
                // changes instead of the list snapping to a new arrangement.
                CatalogRow(
                    plant, index, onOpenPlant,
                    modifier = if (settings.reduceMotion) Modifier else Modifier.animateItem(),
                )
            }
        }
    }
}

@Composable
private fun CatalogRow(
    plant: Plant,
    index: Int,
    onOpenPlant: (Plant) -> Unit,
    modifier: Modifier = Modifier,
) {
    val settings = LocalSettings.current
    val country = settings.country

    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Card)
            .border(1.dp, Hairline, RoundedCornerShape(12.dp))
            .scaledClickable(scaleTo = 0.98f) { onOpenPlant(plant) }
            .padding(12.dp),
    ) {
        Text(
            plateNumeral(index),
            style = MaterialTheme.typography.labelSmall,
            color = InkMuted,
            modifier = Modifier.width(28.dp),
        )
        Box(
            Modifier
                .size(56.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Parchment)
                .border(1.dp, Hairline, RoundedCornerShape(8.dp))
                .sharedPlantImage("catalog-${plant.slug}"),
        ) {
            PlantImage(
                country, plant, ImgSize.THUMB,
                plate = plant.hasIllustration,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize()
                    .let { if (plant.hasIllustration) it.plateThumbCrop() else it },
            )
        }
        Column(Modifier.weight(1f)) {
            Text(
                plant.names[settings.language],
                style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
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
            Spacer(Modifier.height(6.dp))
            BadgeRow(plant.categories)
        }
    }
}
