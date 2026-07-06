package com.aulenor.ottormastar.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aulenor.ottormastar.data.Language
import com.aulenor.ottormastar.data.LocalSettings

/**
 * Web-parity About: overline + serif title, intro (serif lead), mission, the
 * three stats computed from the live collection, Settings and Legal entry
 * cards, and the colophon footer.
 */
@Composable
fun AboutScreen(
    onOpenSettings: () -> Unit,
    onOpenLegal: () -> Unit,
) {
    val settings = LocalSettings.current
    val loc = rememberL10n()
    val lang = settings.language
    val plants = settings.country.plants

    val medicinal = plants.count { it.categories.contains("medicinal") }
    val statLabels = when (lang) {
        Language.SAH -> Triple("Айылҕа үүнээйилэрэ", "Эмтээх оттор", "Тыллар: саха, нуучча, ангылычаан")
        Language.RU -> Triple("Дикорастущих растений", "Лекарственных трав", "Языка: якутский, русский, английский")
        Language.EN -> Triple("Wild plants", "Medicinal herbs", "Languages: Yakut, Russian, English")
    }
    val stats = listOf(
        "${plants.size}" to statLabels.first,
        "$medicinal" to statLabels.second,
        "3" to statLabels.third,
    )

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Column(Modifier.padding(20.dp)) {
            Text(
                loc.t("app.subtitle").uppercase(),
                style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = FontWeight.SemiBold, letterSpacing = 1.6.sp),
                color = InkMuted,
            )
            Spacer(Modifier.height(8.dp))
            Text(
                loc.t("about.title"),
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = Ink,
            )
            Spacer(Modifier.height(28.dp))
            Text(
                loc.t("about.intro"),
                style = MaterialTheme.typography.titleLarge.copy(lineHeight = 28.sp),
                color = Ink,
            )
            Spacer(Modifier.height(14.dp))
            Text(
                loc.t("about.mission"),
                style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 22.sp),
                color = InkLight,
            )
            Spacer(Modifier.height(36.dp))

            // Stats — the numbers carry the page; hairline card, no shadows.
            Row(
                Modifier
                    .fillMaxWidth()
                    .height(IntrinsicSize.Min)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Card)
                    .border(1.dp, Hairline, RoundedCornerShape(16.dp)),
            ) {
                stats.forEachIndexed { i, (value, label) ->
                    if (i > 0) Box(Modifier.width(1.dp).fillMaxHeight().background(Hairline))
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 10.dp, vertical = 20.dp),
                    ) {
                        Text(
                            value,
                            style = MaterialTheme.typography.headlineMedium.copy(
                                fontWeight = FontWeight.SemiBold),
                            color = Forest,
                        )
                        Text(
                            label,
                            style = MaterialTheme.typography.labelSmall.copy(lineHeight = 13.sp),
                            color = InkMuted,
                            textAlign = TextAlign.Center,
                        )
                    }
                }
            }
            Spacer(Modifier.height(36.dp))

            EntryCard(loc.t("settings.title"), loc.t("settings.storageNote"), onOpenSettings)
            Spacer(Modifier.height(12.dp))
            EntryCard(loc.t("common.legal"), loc.t("common.readDisclaimer"), onOpenLegal)
        }

        FooterBlock(onOpenLegal)
    }
}

@Composable
private fun EntryCard(title: String, note: String, onClick: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Card)
            .border(1.dp, Hairline, RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(18.dp),
    ) {
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(
                title,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                color = Ink,
            )
            Text(
                note,
                style = MaterialTheme.typography.bodySmall,
                color = InkMuted,
                maxLines = 2,
            )
        }
        Text("›", color = InkMuted.copy(alpha = 0.6f), style = MaterialTheme.typography.titleMedium)
    }
}
