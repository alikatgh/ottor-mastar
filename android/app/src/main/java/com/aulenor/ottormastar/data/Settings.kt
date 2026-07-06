package com.aulenor.ottormastar.data

import android.content.Context
import android.provider.Settings as AndroidSettings
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
import java.util.Locale

// Web-parity settings model — mirrors src/context/SettingsContext.tsx exactly:
// country, showLatin, catalogSort, textSize, reduceMotion, leadImage,
// tileLabels, tileTap (+ language, which i18next owns separately on the web).

enum class CatalogSort { NAME, SEASON }
enum class TextSizeOpt(val scale: Float) { SMALL(0.9f), DEFAULT(1f), LARGE(1.12f) }
enum class LeadImage { PLATE, PHOTO }
enum class TileTap { VIEWER, DETAIL }

class Settings(context: Context) {
    private val appContext = context.applicationContext
    private val prefs = appContext.getSharedPreferences("settings", Context.MODE_PRIVATE)

    private var languageState by mutableStateOf(
        Language.from(prefs.getString("language", null) ?: detectLanguage())
    )
    // Normalize on read: a persisted id that no longer maps to an available
    // country (dataset changed, corrupt prefs) falls back to the default so
    // the country pill always shows a valid selection — never a phantom id.
    private var countryState by mutableStateOf(
        normalizeCountry(prefs.getString("country", null))
    )
    private var showLatinState by mutableStateOf(prefs.getBoolean("showLatin", true))
    private var catalogSortState by mutableStateOf(
        runCatching { CatalogSort.valueOf(prefs.getString("catalogSort", "NAME")!!) }
            .getOrDefault(CatalogSort.NAME)
    )
    private var textSizeState by mutableStateOf(
        runCatching { TextSizeOpt.valueOf(prefs.getString("textSize", "DEFAULT")!!) }
            .getOrDefault(TextSizeOpt.DEFAULT)
    )
    private var reduceMotionState by mutableStateOf(prefs.getBoolean("reduceMotion", false))
    private var leadImageState by mutableStateOf(
        runCatching { LeadImage.valueOf(prefs.getString("leadImage", "PLATE")!!) }
            .getOrDefault(LeadImage.PLATE)
    )
    private var tileLabelsState by mutableStateOf(prefs.getBoolean("tileLabels", true))
    private var tileTapState by mutableStateOf(
        runCatching { TileTap.valueOf(prefs.getString("tileTap", "VIEWER")!!) }
            .getOrDefault(TileTap.VIEWER)
    )

    var language: Language
        get() = languageState
        set(value) {
            languageState = value
            prefs.edit().putString("language", value.code).apply()
        }

    var countryId: String
        get() = countryState
        set(value) {
            countryState = value
            prefs.edit().putString("country", value).apply()
        }

    var showLatin: Boolean
        get() = showLatinState
        set(value) {
            showLatinState = value
            prefs.edit().putBoolean("showLatin", value).apply()
        }

    var catalogSort: CatalogSort
        get() = catalogSortState
        set(value) {
            catalogSortState = value
            prefs.edit().putString("catalogSort", value.name).apply()
        }

    var textSize: TextSizeOpt
        get() = textSizeState
        set(value) {
            textSizeState = value
            prefs.edit().putString("textSize", value.name).apply()
        }

    // Honor the OS-level "remove animations" accessibility switch in addition
    // to the in-app toggle: when the system animator duration scale is 0, the
    // device is asking every app to drop motion, mirroring the web's
    // prefers-reduced-motion media query. Either source turns motion off.
    var reduceMotion: Boolean
        get() = reduceMotionState || systemReduceMotion()
        set(value) {
            reduceMotionState = value
            prefs.edit().putBoolean("reduceMotion", value).apply()
        }

    private fun systemReduceMotion(): Boolean = runCatching {
        AndroidSettings.Global.getFloat(
            appContext.contentResolver,
            AndroidSettings.Global.ANIMATOR_DURATION_SCALE,
            1f,
        ) == 0f
    }.getOrDefault(false)

    private fun normalizeCountry(raw: String?): String {
        val available = PlantStore.availableCountries.map { it.id }
        return if (raw != null && raw in available) raw else PlantStore.data.defaultCountry
    }

    var leadImage: LeadImage
        get() = leadImageState
        set(value) {
            leadImageState = value
            prefs.edit().putString("leadImage", value.name).apply()
        }

    var tileLabels: Boolean
        get() = tileLabelsState
        set(value) {
            tileLabelsState = value
            prefs.edit().putBoolean("tileLabels", value).apply()
        }

    var tileTap: TileTap
        get() = tileTapState
        set(value) {
            tileTapState = value
            prefs.edit().putString("tileTap", value.name).apply()
        }

    val country: Country get() = PlantStore.country(countryId)

    fun reset() {
        prefs.edit().clear().apply()
        languageState = Language.from(detectLanguage())
        countryState = normalizeCountry(null)
        showLatinState = true
        catalogSortState = CatalogSort.NAME
        textSizeState = TextSizeOpt.DEFAULT
        reduceMotionState = false
        leadImageState = LeadImage.PLATE
        tileLabelsState = true
        tileTapState = TileTap.VIEWER
    }

    companion object {
        /**
         * Mirror the web detector: system language if it's one of ours,
         * otherwise fall back to Sakha (the project's first language).
         */
        fun detectLanguage(): String {
            val sys = Locale.getDefault().language
            return if (Language.entries.any { it.code == sys }) sys else Language.SAH.code
        }
    }
}

val LocalSettings = staticCompositionLocalOf<Settings> { error("Settings not provided") }
