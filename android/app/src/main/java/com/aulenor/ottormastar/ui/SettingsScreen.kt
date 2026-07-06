package com.aulenor.ottormastar.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.runtime.remember
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aulenor.ottormastar.data.CatalogSort
import com.aulenor.ottormastar.data.Language
import com.aulenor.ottormastar.data.LeadImage
import com.aulenor.ottormastar.data.LocalSettings
import com.aulenor.ottormastar.data.PlantStore
import com.aulenor.ottormastar.data.TextSizeOpt
import com.aulenor.ottormastar.data.TileTap

/**
 * Web-parity settings — every setting from the web SettingsPage in the same
 * overline-sectioned, pill-segmented style: language, country, Latin names,
 * catalog order, lead image, text size, reduce motion, gallery tile labels,
 * tile tap behavior, and reset.
 */
@Composable
fun SettingsScreen() {
    val settings = LocalSettings.current
    val loc = rememberL10n()

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
    ) {
        Text(
            loc.t("settings.title"),
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            color = Ink,
        )
        Spacer(Modifier.height(6.dp))
        Text(loc.t("settings.storageNote"), style = MaterialTheme.typography.bodySmall, color = InkMuted)
        Spacer(Modifier.height(36.dp))

        SectionHeader(loc.t("settings.sectionRegion"))
        SettingRow(loc.t("settings.language")) {
            Segmented(
                value = settings.language.code,
                options = Language.entries.map { it.code to it.shortLabel },
                onChange = { settings.language = Language.from(it) },
            )
        }
        RowDivider()
        SettingRow(loc.t("settings.country"), note = loc.t("settings.countryNote")) {
            Segmented(
                value = settings.countryId,
                options = PlantStore.availableCountries.map { it.id to loc.t("settings.country_${it.id}") },
                onChange = { settings.countryId = it },
            )
        }

        Spacer(Modifier.height(36.dp))
        SectionHeader(loc.t("settings.sectionContent"))
        SettingRow(loc.t("settings.showLatin")) {
            PillToggle(settings.showLatin) { settings.showLatin = it }
        }
        RowDivider()
        SettingRow(loc.t("settings.catalogSort")) {
            Segmented(
                value = settings.catalogSort.name,
                options = listOf(
                    CatalogSort.NAME.name to loc.t("settings.sortName"),
                    CatalogSort.SEASON.name to loc.t("settings.sortSeason"),
                ),
                onChange = { settings.catalogSort = CatalogSort.valueOf(it) },
            )
        }
        RowDivider()
        SettingRow(loc.t("settings.leadImage")) {
            Segmented(
                value = settings.leadImage.name,
                options = listOf(
                    LeadImage.PLATE.name to loc.t("settings.leadPlate"),
                    LeadImage.PHOTO.name to loc.t("settings.leadPhoto"),
                ),
                onChange = { settings.leadImage = LeadImage.valueOf(it) },
            )
        }

        Spacer(Modifier.height(36.dp))
        SectionHeader(loc.t("settings.sectionDisplay"))
        SettingRow(loc.t("settings.textSize")) {
            Segmented(
                value = settings.textSize.name,
                options = listOf(
                    TextSizeOpt.SMALL.name to loc.t("settings.textSmall"),
                    TextSizeOpt.DEFAULT.name to loc.t("settings.textDefault"),
                    TextSizeOpt.LARGE.name to loc.t("settings.textLarge"),
                ),
                onChange = { settings.textSize = TextSizeOpt.valueOf(it) },
            )
        }
        RowDivider()
        SettingRow(loc.t("settings.reduceMotion")) {
            PillToggle(settings.reduceMotion) { settings.reduceMotion = it }
        }

        Spacer(Modifier.height(36.dp))
        SectionHeader(loc.t("settings.sectionGallery"))
        SettingRow(loc.t("settings.tileLabels")) {
            PillToggle(settings.tileLabels) { settings.tileLabels = it }
        }
        RowDivider()
        SettingRow(loc.t("settings.tileTap")) {
            Segmented(
                value = settings.tileTap.name,
                options = listOf(
                    TileTap.VIEWER.name to loc.t("settings.tapViewer"),
                    TileTap.DETAIL.name to loc.t("settings.tapDetail"),
                ),
                onChange = { settings.tileTap = TileTap.valueOf(it) },
            )
        }

        Spacer(Modifier.height(36.dp))
        SectionHeader(loc.t("settings.sectionData"))
        Text(
            loc.t("settings.reset"),
            style = MaterialTheme.typography.labelLarge,
            color = InkLight,
            modifier = Modifier
                .padding(vertical = 14.dp)
                .clip(CircleShape)
                .border(1.dp, HairlineStrong, CircleShape)
                .clickable { settings.reset() }
                .padding(horizontal = 16.dp, vertical = 9.dp),
        )
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun SectionHeader(title: String) {
    Column {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
        Text(
            title.uppercase(),
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.SemiBold, letterSpacing = 1.6.sp),
            color = InkMuted,
            modifier = Modifier.padding(top = 12.dp, bottom = 4.dp),
        )
    }
}

@Composable
private fun RowDivider() {
    Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
}

@Composable
private fun SettingRow(label: String, note: String? = null, control: @Composable () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth().padding(vertical = 14.dp),
    ) {
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(label, style = MaterialTheme.typography.bodyMedium, color = Ink)
            if (note != null) {
                Text(
                    note,
                    style = MaterialTheme.typography.bodySmall.copy(lineHeight = 15.sp),
                    color = InkMuted,
                )
            }
        }
        Spacer(Modifier.size(8.dp))
        control()
    }
}

/**
 * Pill segmented control — active state changes only color, never geometry.
 * Each option is a ≥44dp-tall touch target (visual pill stays compact; the
 * hit area is the padded cell).
 */
@Composable
fun Segmented(
    value: String,
    options: List<Pair<String, String>>,
    onChange: (String) -> Unit,
) {
    Row(
        Modifier
            .clip(CircleShape)
            .border(1.dp, Hairline, CircleShape),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        for ((optValue, label) in options) {
            val active = value == optValue
            Box(
                Modifier
                    .defaultMinSize(minHeight = 44.dp)
                    .background(if (active) Forest else Color.Transparent)
                    .clickable { onChange(optValue) }
                    .padding(horizontal = 14.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    label,
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Medium),
                    color = if (active) Color.White else InkLight,
                )
            }
        }
    }
}

/**
 * Switch with the web's fixed-track geometry, tinted forest. The visible
 * track is 44×26; the touch target is a full 48dp square around it.
 */
@Composable
fun PillToggle(checked: Boolean, onChange: (Boolean) -> Unit) {
    Box(
        Modifier
            .defaultMinSize(minWidth = 48.dp, minHeight = 48.dp)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
            ) { onChange(!checked) },
        contentAlignment = Alignment.Center,
    ) {
        Box(
            Modifier
                .size(width = 44.dp, height = 26.dp)
                .clip(CircleShape)
                .background(if (checked) Forest else CreamDark)
                .border(1.dp, if (checked) Forest else HairlineStrong, CircleShape),
        ) {
            Box(
                Modifier
                    .align(if (checked) Alignment.CenterEnd else Alignment.CenterStart)
                    .padding(2.dp)
                    .size(22.dp)
                    .background(Color.White, CircleShape)
            )
        }
    }
}
