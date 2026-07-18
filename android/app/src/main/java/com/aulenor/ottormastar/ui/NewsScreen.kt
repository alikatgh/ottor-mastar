package com.aulenor.ottormastar.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.aulenor.ottormastar.data.LocalSettings
import com.aulenor.ottormastar.data.LocalizedText
import com.aulenor.ottormastar.data.PlantStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Locale

@Serializable
data class NewsItem(
    val id: String,
    val date: String,
    val title: LocalizedText,
    val body: LocalizedText,
)

@Serializable
private data class NewsFeed(val version: Int? = null, val items: List<NewsItem> = emptyList())

private val newsJson = Json { ignoreUnknownKeys = true }

/**
 * Community news / changelog. Same over-the-air pattern as the catalog: show the
 * APK-bundled `news.json` instantly, then replace it if the hosted `news.json`
 * is reachable and non-empty. Offline keeps the bundle; errors never surface.
 */
@Composable
fun NewsScreen() {
    val settings = LocalSettings.current
    val loc = rememberL10n()
    val lang = settings.language
    val context = LocalContext.current

    val bundled = remember {
        runCatching {
            newsJson.decodeFromString<NewsFeed>(
                context.assets.open("news.json").bufferedReader().use { it.readText() }
            ).items
        }.getOrDefault(emptyList())
    }
    var items by remember { mutableStateOf(bundled) }

    LaunchedEffect(Unit) {
        runCatching {
            withContext(Dispatchers.IO) {
                val host = PlantStore.data.imageHost
                val conn = (URL("$host/news.json").openConnection() as HttpURLConnection).apply {
                    connectTimeout = 10_000; readTimeout = 10_000
                }
                if (conn.responseCode != 200) return@withContext null
                val raw = conn.inputStream.bufferedReader().use { it.readText() }
                newsJson.decodeFromString<NewsFeed>(raw).items.ifEmpty { null }
            }
        }.getOrNull()?.let { items = it }
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            loc.t("news.title"),
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.padding(bottom = 4.dp),
        )

        if (items.isEmpty()) {
            Text(
                loc.t("news.empty"),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(vertical = 40.dp),
            )
        }

        items.forEach { item ->
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                modifier = Modifier.fillMaxWidth().widthIn(max = 760.dp),
            ) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        formatDate(item.date, lang.code).uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Text(
                        item.title[lang],
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                    Text(
                        item.body[lang],
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

private fun formatDate(iso: String, langCode: String): String = runCatching {
    val parser = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    val date = parser.parse(iso) ?: return iso
    val locale = Locale(if (langCode == "sah") "ru" else langCode)
    SimpleDateFormat("d MMMM yyyy", locale).format(date)
}.getOrDefault(iso)
