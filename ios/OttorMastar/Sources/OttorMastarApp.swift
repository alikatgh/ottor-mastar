import SwiftUI

@main
struct OttorMastarApp: App {
    @StateObject private var settings = AppSettings()

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
/// About (Settings and Legal are pushed from About / footers).
enum RootTab: Hashable {
    case gallery, catalog, search, about
}

struct RootView: View {
    @EnvironmentObject var settings: AppSettings
    @State private var tab: RootTab = .gallery
    @Namespace private var zoomNamespace

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
        TabView(selection: $tab) {
            NavigationStack { HomeView(tab: $tab, zoomNamespace: zoomNamespace) }
                .tabItem { Label(settings.loc.t("nav.gallery"), systemImage: "photo.on.rectangle") }
                .tag(RootTab.gallery)
            NavigationStack { CatalogView() }
                .tabItem { Label(settings.loc.t("nav.catalog"), systemImage: "book") }
                .tag(RootTab.catalog)
            NavigationStack { SearchView() }
                .tabItem { Label(settings.loc.t("nav.search"), systemImage: "magnifyingglass") }
                .tag(RootTab.search)
            NavigationStack { AboutView() }
                .tabItem { Label(settings.loc.t("nav.about"), systemImage: "info.circle") }
                .tag(RootTab.about)
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
}
