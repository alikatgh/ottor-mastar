import SwiftUI

@main
struct OttorMastarApp: App {
    @StateObject private var settings = AppSettings()

    init() {
        // Best-effort over-the-air content sync: fetch the hosted catalog in the
        // background and cache it for the NEXT launch (see PlantStore.refresh).
        // The bundled snapshot renders this launch, so this never blocks startup.
        PlantStore.refresh()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(settings)
                .tint(.forest)
                // Root text scale — the web's data-text-size equivalent.
                .dynamicTypeSize(settings.dynamicTypeSize)
                // Appearance setting: nil follows the system; the Theme.swift
                // tokens are trait-resolved, so the whole app flips with this.
                .preferredColorScheme(settings.colorScheme)
        }
    }
}

/// Same four destinations as the web's bottom nav: Gallery, Catalog, Search,
/// About (Settings and Legal are pushed from About / footers). On the Mac,
/// Settings additionally gets its own dedicated tab in the window toolbar.
enum RootTab: Hashable {
    case gallery, catalog, search, about, settings
}

struct RootView: View {
    @EnvironmentObject var settings: AppSettings
    @State private var tab: RootTab = .gallery
    @Namespace private var zoomNamespace

    // One navigation path per tab so re-tapping the active tab can pop its
    // stack to the root — otherwise a pushed plant page makes the tab button
    // feel dead ("Home stops working").
    @State private var galleryPath = NavigationPath()
    @State private var catalogPath = NavigationPath()
    @State private var searchPath = NavigationPath()
    @State private var aboutPath = NavigationPath()
    @State private var settingsPath = NavigationPath()

    private var tabSelection: Binding<RootTab> {
        Binding(
            get: { tab },
            set: { newValue in
                if newValue == tab { popToRoot(newValue) }
                tab = newValue
            }
        )
    }

    private func popToRoot(_ t: RootTab) {
        switch t {
        case .gallery: galleryPath = NavigationPath()
        case .catalog: catalogPath = NavigationPath()
        case .search: searchPath = NavigationPath()
        case .about: aboutPath = NavigationPath()
        case .settings: settingsPath = NavigationPath()
        }
    }

    /// Debug/screenshot hook: `simctl launch ... -tab catalog|search|about`
    /// opens on that tab. No effect without the argument.
    private static var launchTab: RootTab? {
        guard let i = ProcessInfo.processInfo.arguments.firstIndex(of: "-tab"),
            i + 1 < ProcessInfo.processInfo.arguments.count
        else { return nil }
        switch ProcessInfo.processInfo.arguments[i + 1] {
        case "catalog": return .catalog
        case "search": return .search
        case "about": return .about
        default: return nil
        }
    }

    var body: some View {
        Group {
            if #available(iOS 26.0, *) {
                modernTabs
            } else {
                legacyTabs
            }
        }
        .onAppear {
            if let launchTab = Self.launchTab { tab = launchTab }
            #if targetEnvironment(macCatalyst)
            // A desktop window smaller than this collapses the layouts; the
            // regular-width two-column detail needs the room.
            for scene in UIApplication.shared.connectedScenes.compactMap({ $0 as? UIWindowScene }) {
                scene.sizeRestrictions?.minimumSize = CGSize(width: 980, height: 700)
                scene.titlebar?.titleVisibility = .hidden
            }
            #endif
        }
    }

    /// iOS 26: native Liquid Glass tab bar — Search separated into its own
    /// floating glass pill (`role: .search`), and the bar minimizes away on
    /// scroll so the herbarium content keeps the full screen.
    @available(iOS 26.0, *)
    private var modernTabs: some View {
        TabView(selection: tabSelection) {
            Tab(settings.loc.t("nav.gallery"), systemImage: "photo.on.rectangle", value: RootTab.gallery) {
                NavigationStack(path: $galleryPath) { HomeView(tab: $tab, zoomNamespace: zoomNamespace) }
            }
            Tab(settings.loc.t("nav.catalog"), systemImage: "book", value: RootTab.catalog) {
                NavigationStack(path: $catalogPath) { CatalogView() }
            }
            Tab(settings.loc.t("nav.about"), systemImage: "info.circle", value: RootTab.about) {
                NavigationStack(path: $aboutPath) { AboutView() }
            }
            #if targetEnvironment(macCatalyst)
            Tab(settings.loc.t("settings.title"), systemImage: "gearshape", value: RootTab.settings) {
                NavigationStack(path: $settingsPath) { SettingsView() }
            }
            #endif
            Tab(settings.loc.t("nav.search"), systemImage: "magnifyingglass", value: RootTab.search, role: .search) {
                NavigationStack(path: $searchPath) { SearchView() }
            }
        }
        .tabBarMinimizeBehavior(.onScrollDown)
    }

    private var legacyTabs: some View {
        TabView(selection: tabSelection) {
            NavigationStack(path: $galleryPath) { HomeView(tab: $tab, zoomNamespace: zoomNamespace) }
                .tabItem { Label(settings.loc.t("nav.gallery"), systemImage: "photo.on.rectangle") }
                .tag(RootTab.gallery)
            NavigationStack(path: $catalogPath) { CatalogView() }
                .tabItem { Label(settings.loc.t("nav.catalog"), systemImage: "book") }
                .tag(RootTab.catalog)
            NavigationStack(path: $searchPath) { SearchView() }
                .tabItem { Label(settings.loc.t("nav.search"), systemImage: "magnifyingglass") }
                .tag(RootTab.search)
            NavigationStack(path: $aboutPath) { AboutView() }
                .tabItem { Label(settings.loc.t("nav.about"), systemImage: "info.circle") }
                .tag(RootTab.about)
            #if targetEnvironment(macCatalyst)
            // Dedicated Settings destination on the Mac (text size, appearance,
            // language, country, …) — desktop users expect it in the toolbar,
            // not buried behind About.
            NavigationStack(path: $settingsPath) { SettingsView() }
                .tabItem { Label(settings.loc.t("settings.title"), systemImage: "gearshape") }
                .tag(RootTab.settings)
            #endif
        }
    }
}
