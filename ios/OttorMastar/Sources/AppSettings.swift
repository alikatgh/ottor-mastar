import SwiftUI

// Web-parity settings model — mirrors src/context/SettingsContext.tsx exactly:
// country, showLatin, catalogSort, textSize, reduceMotion, leadImage,
// tileLabels, tileTap (+ language, which i18next owns separately on the web).

enum CatalogSort: String, CaseIterable { case name, season }
enum TextSize: String, CaseIterable { case small, `default`, large }
enum LeadImage: String, CaseIterable { case plate, photo }
enum TileTap: String, CaseIterable { case viewer, detail }

final class AppSettings: ObservableObject {
    @AppStorage("language") private var storedLanguage: String = AppSettings.detectLanguage()
    @AppStorage("country") private var storedCountry: String = "yakutia"
    @AppStorage("showLatin") var showLatin: Bool = true
    @AppStorage("catalogSort") private var storedCatalogSort: String = CatalogSort.name.rawValue
    @AppStorage("textSize") private var storedTextSize: String = TextSize.default.rawValue
    @AppStorage("reduceMotion") var reduceMotionSetting: Bool = false
    @AppStorage("leadImage") private var storedLeadImage: String = LeadImage.plate.rawValue
    @AppStorage("tileLabels") var tileLabels: Bool = true
    @AppStorage("tileTap") private var storedTileTap: String = TileTap.viewer.rawValue

    var language: Language {
        get { Language(rawValue: storedLanguage) ?? .sah }
        set { objectWillChange.send(); storedLanguage = newValue.rawValue }
    }

    var countryId: String {
        get { storedCountry }
        set { objectWillChange.send(); storedCountry = newValue }
    }

    var catalogSort: CatalogSort {
        get { CatalogSort(rawValue: storedCatalogSort) ?? .name }
        set { objectWillChange.send(); storedCatalogSort = newValue.rawValue }
    }

    var textSize: TextSize {
        get { TextSize(rawValue: storedTextSize) ?? .default }
        set { objectWillChange.send(); storedTextSize = newValue.rawValue }
    }

    var leadImage: LeadImage {
        get { LeadImage(rawValue: storedLeadImage) ?? .plate }
        set { objectWillChange.send(); storedLeadImage = newValue.rawValue }
    }

    var tileTap: TileTap {
        get { TileTap(rawValue: storedTileTap) ?? .viewer }
        set { objectWillChange.send(); storedTileTap = newValue.rawValue }
    }

    var country: Country { PlantStore.country(countryId) }

    var loc: L10n { L10n.for(language) }

    /// Same rule as the web's MotionConfig: our toggle forces reduced motion,
    /// otherwise the OS preference is respected.
    var reduceMotion: Bool {
        reduceMotionSetting || UIAccessibility.isReduceMotionEnabled
    }

    /// Root text scale — the whole app's Dynamic Type follows the setting,
    /// like the web's <html data-text-size> rem scaling.
    var dynamicTypeSize: DynamicTypeSize {
        switch textSize {
        case .small: return .medium
        case .default: return .large
        case .large: return .xLarge
        }
    }

    /// Mirror the web detector: system language if it's one of ours,
    /// otherwise fall back to Sakha (the project's first language).
    static func detectLanguage() -> String {
        for pref in Locale.preferredLanguages {
            let code = pref.components(separatedBy: "-")[0]
            if Language(rawValue: code) != nil { return code }
        }
        return Language.sah.rawValue
    }

    func reset() {
        objectWillChange.send()
        storedLanguage = AppSettings.detectLanguage()
        storedCountry = "yakutia"
        showLatin = true
        storedCatalogSort = CatalogSort.name.rawValue
        storedTextSize = TextSize.default.rawValue
        reduceMotionSetting = false
        storedLeadImage = LeadImage.plate.rawValue
        tileLabels = true
        storedTileTap = TileTap.viewer.rawValue
    }
}
