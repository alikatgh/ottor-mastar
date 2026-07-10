package com.aulenor.ottormastar.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Help — the same short guide as the web's /help, from the shared `help.*`
 * locale keys (all five languages): browsing, viewer gestures, languages &
 * collections, offline note, and the safety pointer into Legal.
 */
@Composable
fun HelpScreen(onBack: () -> Unit, onOpenLegal: () -> Unit) {
    val loc = rememberL10n()

    // The app-download section is web-specific (this IS the app) — here the
    // platform-neutral offline note stands alone, no store link needed.
    val sections = listOf(
        loc.t("help.browseTitle") to loc.t("help.browseBody"),
        loc.t("help.viewerTitle") to loc.t("help.viewerBody"),
        loc.t("help.langTitle") to loc.t("help.langBody"),
        loc.t("help.appTitle") to loc.t("help.appBodyNative"),
        loc.t("help.safetyTitle") to loc.t("help.safetyBody"),
    )

    Column(Modifier.fillMaxSize()) {
        // Compact header with back affordance, matching LegalScreen.
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .background(Cream)
                .padding(horizontal = 8.dp, vertical = 6.dp),
        ) {
            Text(
                "←",
                style = MaterialTheme.typography.titleLarge,
                color = InkLight,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable { onBack() }
                    .padding(12.dp),
            )
            Text(
                loc.t("help.title"),
                style = MaterialTheme.typography.titleMedium,
                color = Ink,
            )
        }

        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp),
        ) {
            Spacer(Modifier.height(12.dp))
            Text(
                loc.t("help.title"),
                style = MaterialTheme.typography.displaySmall,
                color = Ink,
            )
            Spacer(Modifier.height(8.dp))
            Text(
                loc.t("help.intro"),
                style = MaterialTheme.typography.bodyLarge,
                color = InkLight,
            )
            Spacer(Modifier.height(24.dp))

            sections.forEachIndexed { i, (title, body) ->
                if (i > 0) Spacer(Modifier.height(28.dp))
                Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))
                Spacer(Modifier.height(10.dp))
                Text(
                    title.uppercase(),
                    style = MaterialTheme.typography.labelMedium.copy(
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = 1.6.sp,
                    ),
                    color = InkMuted,
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    body,
                    style = MaterialTheme.typography.bodyLarge,
                    color = InkLight,
                )
            }

            // Safety pointer → Legal & Privacy
            Spacer(Modifier.height(12.dp))
            Text(
                loc.t("help.safetyLink"),
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                color = Forest,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable { onOpenLegal() }
                    .padding(vertical = 8.dp, horizontal = 4.dp),
            )
            Spacer(Modifier.height(48.dp))
        }
    }
}
