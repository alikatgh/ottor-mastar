package com.aulenor.ottormastar.data

import android.content.Context
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

/**
 * Trilingual UI strings from the same locale JSONs the web app uses
 * (assets/locale-{sah,ru,en}.json). Keys are dotted paths: t("plant.habitat").
 */
class L10n private constructor(val language: Language, private val table: Map<String, String>) {

    fun t(key: String): String = table[key] ?: key

    /**
     * i18next-style plural lookup: key_one / key_few / key_many / key_other,
     * with {{count}} interpolation. Russian needs the full CLDR rules.
     */
    fun plural(key: String, count: Int): String {
        val suffix = when (language) {
            Language.RU -> {
                val m10 = count % 10
                val m100 = count % 100
                when {
                    m10 == 1 && m100 != 11 -> "one"
                    m10 in 2..4 && m100 !in 12..14 -> "few"
                    else -> "many"
                }
            }
            else -> if (count == 1) "one" else "other"
        }
        // Some keys are un-suffixed single forms (e.g. gallery.photoCount) —
        // fall back to the bare key before giving up.
        val raw = table["${key}_$suffix"] ?: table["${key}_other"] ?: table["${key}_one"]
            ?: table[key] ?: key
        return raw.replace("{{count}}", count.toString())
    }

    /**
     * Blooming-season label: known keys come from seasons.*; unknown ranges
     * (new datasets) degrade to a humanized version of the raw slug.
     */
    fun season(slug: String): String =
        table["seasons.$slug"] ?: slug.replace("-", " — ").replaceFirstChar { it.uppercase() }

    companion object {
        private val cache = mutableMapOf<Language, L10n>()

        fun get(context: Context, language: Language): L10n = cache.getOrPut(language) {
            val raw = context.assets.open("locale-${language.code}.json")
                .bufferedReader().use { it.readText() }
            val flat = mutableMapOf<String, String>()
            flatten(Json.parseToJsonElement(raw) as JsonObject, "", flat)
            L10n(language, flat)
        }

        private fun flatten(obj: JsonObject, prefix: String, out: MutableMap<String, String>) {
            for ((key, value) in obj) {
                val path = if (prefix.isEmpty()) key else "$prefix.$key"
                when (value) {
                    is JsonObject -> flatten(value, path, out)
                    is JsonPrimitive -> if (value.isString) out[path] = value.content
                    else -> Unit
                }
            }
        }
    }
}
