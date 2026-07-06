import Foundation

/// Trilingual UI strings, loaded from the same locale JSONs the web app uses
/// (bundled as Resources/locale-{sah,ru,en}.json). Keys are dotted paths into
/// the nested JSON: t("plant.habitat").
struct L10n {
    let language: Language
    private let table: [String: String]

    private static var cache: [Language: L10n] = [:]

    static func `for`(_ language: Language) -> L10n {
        if let cached = cache[language] { return cached }
        let loaded = L10n(language: language)
        cache[language] = loaded
        return loaded
    }

    private init(language: Language) {
        self.language = language
        var flat: [String: String] = [:]
        if let url = Bundle.main.url(
            forResource: "locale-\(language.rawValue)", withExtension: "json"),
            let raw = try? Data(contentsOf: url),
            let json = try? JSONSerialization.jsonObject(with: raw) as? [String: Any]
        {
            L10n.flatten(json, prefix: "", into: &flat)
        }
        table = flat
    }

    private static func flatten(_ dict: [String: Any], prefix: String, into out: inout [String: String]) {
        for (key, value) in dict {
            let path = prefix.isEmpty ? key : "\(prefix).\(key)"
            if let nested = value as? [String: Any] {
                flatten(nested, prefix: path, into: &out)
            } else if let str = value as? String {
                out[path] = str
            }
        }
    }

    func t(_ key: String) -> String {
        table[key] ?? key
    }

    /// i18next-style plural lookup: key_one / key_few / key_many / key_other,
    /// with {{count}} interpolation. Russian needs the full CLDR rules.
    func plural(_ key: String, count: Int) -> String {
        let suffix: String
        switch language {
        case .ru:
            let m10 = count % 10, m100 = count % 100
            if m10 == 1 && m100 != 11 { suffix = "one" }
            else if (2...4).contains(m10) && !(12...14).contains(m100) { suffix = "few" }
            else { suffix = "many" }
        default:
            suffix = count == 1 ? "one" : "other"
        }
        // Some keys are un-suffixed single forms (e.g. gallery.photoCount) —
        // fall back to the bare key before giving up.
        let raw = table["\(key)_\(suffix)"] ?? table["\(key)_other"] ?? table["\(key)_one"]
            ?? table[key] ?? key
        return raw.replacingOccurrences(of: "{{count}}", with: String(count))
    }

    /// Blooming-season label: known keys come from seasons.*; unknown ranges
    /// (new datasets) degrade to a humanized version of the raw slug.
    func season(_ slug: String) -> String {
        let key = "seasons.\(slug)"
        if let known = table[key] { return known }
        return slug.replacingOccurrences(of: "-", with: " — ").capitalized
    }
}
