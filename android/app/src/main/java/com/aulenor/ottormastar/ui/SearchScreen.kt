package com.aulenor.ottormastar.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aulenor.ottormastar.data.LocalSettings
import com.aulenor.ottormastar.data.Plant

/**
 * Web-parity search tab: a big autofocused field that searches deeper than
 * the catalog — names and Latin plus descriptions and medicinal uses in the
 * current language. Empty state shows the browse prompt.
 */
@Composable
fun SearchScreen(onOpenPlant: (Plant) -> Unit) {
    val settings = LocalSettings.current
    val loc = rememberL10n()
    val country = settings.country
    val lang = settings.language
    var query by rememberSaveable { mutableStateOf("") }
    val focusRequester = remember { FocusRequester() }

    val q = query.trim()
    // Fold the query once; diacritic-insensitive so "полынь" finds "полы́нь"
    // (parity with iOS `.diacriticInsensitive`, SP2-M01).
    val qFolded = q.foldDiacritics()
    val results = if (q.isEmpty()) emptyList() else country.plants.filter { plant ->
        listOf(
            plant.names.sah, plant.names.ru, plant.names.en, plant.names.latin,
            plant.description[lang], plant.medicinalUses[lang],
        ).any { it.foldDiacritics().contains(qFolded) }
    }

    LaunchedEffect(Unit) { focusRequester.requestFocus() }

    LazyColumn(Modifier.fillMaxSize()) {
        item {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                placeholder = { Text(loc.t("catalog.searchPlaceholder"), color = InkMuted) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                textStyle = MaterialTheme.typography.bodyLarge,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Card,
                    unfocusedContainerColor = Card,
                    focusedBorderColor = Forest.copy(alpha = 0.5f),
                    unfocusedBorderColor = Hairline,
                ),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, end = 16.dp, top = 28.dp, bottom = 24.dp)
                    .focusRequester(focusRequester),
            )
        }

        if (q.isEmpty()) {
            item {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 48.dp),
                ) {
                    Text("⌕", color = InkMuted.copy(alpha = 0.3f), fontSize = 44.sp)
                    Text(
                        loc.t("catalog.searchPlaceholder"),
                        style = MaterialTheme.typography.bodySmall,
                        color = InkMuted,
                    )
                }
            }
        } else if (results.isEmpty()) {
            item {
                Box(Modifier.fillMaxWidth().padding(vertical = 40.dp), contentAlignment = Alignment.Center) {
                    Text(loc.t("catalog.noResults"), color = InkMuted)
                }
            }
        } else {
            item {
                Box(Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(1.dp).background(Hairline))
            }
            items(results.size) { index ->
                val plant = results[index]
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpenPlant(plant) }
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                ) {
                    Box(
                        Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Parchment)
                            .border(1.dp, Hairline, RoundedCornerShape(8.dp)),
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
                    Column {
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
                    }
                }
                Box(Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(1.dp).background(Hairline))
            }
        }
    }
}
