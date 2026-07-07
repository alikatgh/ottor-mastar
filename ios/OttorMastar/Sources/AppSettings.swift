import SwiftUI

// Web-parity settings model — mirrors src/context/SettingsContext.tsx exactly:
// country, showLatin, catalogSort, textSize, reduceMotion, leadImage,
// tileLabels, tileTap (+ language, which i18next owns separately on the web).

enum CatalogSort: String, CaseIterable { case name, season }
enum TextSize: String, CaseIterable { case small, `default`, large }
enum LeadImage: String, CaseIterable { case plate, photo }
enum TileTap: String, CaseIterable { case viewer, detail }

final class AppSettings: ObservableObject {
    private var reduceMotionObserver: NSObjectProtocol?

    @AppStorage("language") private var storedLanguage: String = AppSettings.detectLanguage()
    @AppStorage("country") private var storedCountry: String = "yakutia"
    @AppStorage("showLatin") var showLatin: Bool = true
    @AppStorage("catalogSort") private var storedCatalogSort: String = CatalogSort.name.rawValue
    @AppStorage("textSize") private var storedTextSize: String = TextSize.default.rawValue
    @AppStorage("reduceMotion") var reduceMotionSetting: Bool = false
    @AppStorage("leadImage") private var storedLeadImage: String = LeadImage.plate.rawValue
    @AppStorage("tileLabels") var tileLabels: Bool = true
    @AppStorage("tileTap") private var storedTileTap: String = TileTap.viewer.rawValue

    init() {
        // Publish when the OS Reduce Motion preference flips at runtime, so
        // `reduceMotion` (which folds in the live OS value) re-drives the UI
        // instead of only reflecting the setting at each isolated read.
        reduceMotionObserver = NotificationCenter.default.addObserver(
            forName: UIAccessibility.reduceMotionStatusDidChangeNotification,
            object: nil, queue: .main
        ) { [weak self] _ in
            self?.objectWillChange.send()
        }
    }

    deinit {
        if let reduceMotionObserver {
            NotificationCenter.default.removeObserver(reduceMotionObserver)
        }
    }

    // Clamped to the active country's language set: Yakutia offers sah/ru/en,
    // Mongolia offers mn/zh/en. A stored language the current country doesn't
    // offer (after a country switch, or a device language it lacks) resolves to
    // that country's default — so the UI is always in a language the collection
    // actually provides. Web parity: SettingsContext's country→language effect.
    var language: Language {
        get {
            let country = PlantStore.country(storedCountry)
            let stored = Language(rawValue: storedLanguage) ?? country.defaultLanguage
            return country.languages.contains(stored) ? stored : country.defaultLanguage
        }
        set { objectWillChange.send(); storedLanguage = newValue.rawValue }
    }

    var countryId: String {
        get { storedCountry }
        set {
            objectWillChange.send()
            storedCountry = newValue
            // Persist a coherent language too, so switching back is stable.
            let country = PlantStore.country(newValue)
            if !country.languages.contains(Language(rawValue: storedLanguage) ?? country.defaultLanguage) {
                storedLanguage = country.defaultLanguage.rawValue
            }
        }
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
    /// otherwise the OS preference is respected. The OS value is observed live
    /// (see `init`) so a change in system settings re-renders immediately.
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
