import SwiftUI

/// Web-parity home: encyclopedia cover (title panel + the collection's finest
/// plate — its LAST entry, Sardaana for Yakutia), the horizontal plates shelf
/// with swipe cue, the field-photo gallery grid, and the colophon footer.
struct HomeView: View {
    @EnvironmentObject var settings: AppSettings
    @Binding var tab: RootTab
    var zoomNamespace: Namespace.ID

    @State private var viewer: ViewerState?
    /// Detail push requested from the viewer's "Details" button — presented
    /// once the fullScreenCover has dismissed.
    @State private var pendingDetail: Plant?

    private var country: Country { settings.country }
    private var loc: L10n { settings.loc }
    private var plants: [Plant] { country.plants }
    private var plated: [Plant] { plants.filter(\.hasIllustration) }

    /// The plant's OWN country (falls back to the active country), so a
    /// cross-country entry opens with its own images.
    private func country(for plant: Plant) -> Country {
        PlantStore.findPlant(slug: plant.slug)?.1 ?? country
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                cover
                if !plated.isEmpty { platesShelf.padding(.top, 36) }
                photoSection.padding(.top, 36)
                FooterView()
            }
        }
        .background(Color.cream)
        // Single guarded detail destination: every plate/photo/viewer tap routes
        // through `pendingDetail`, so a double-tap can't push the same plant twice
        // (SwiftUI's value-based NavigationLink otherwise would). Mirrors the
        // Android side's `launchSingleTop = true`.
        .navigationDestination(item: $pendingDetail) { plant in
            PlantDetailView(plant: plant, country: country(for: plant))
                .zoomTransition(sourceID: plant.slug, in: zoomNamespace, enabled: !settings.reduceMotion)
        }
        .navigationDestination(for: PushedPage.self) { page in
            switch page {
            case .legal: LegalView()
            case .settings: SettingsView()
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .fullScreenCover(item: $viewer) { state in
            ImageViewer(
                items: viewerItems, index: state.index,
                onOpenDetail: { slug in
                    // Cover has dismissed itself; push the resolved plant next.
                    if let plant = PlantStore.findPlant(slug: slug)?.0 { pushDetail(plant) }
                }
            )
        }
    }

    /// Guarded push — ignored while a detail push is already in flight, so a
    /// rapid double-tap can't stack the same page twice.
    private func pushDetail(_ plant: Plant) {
        guard pendingDetail == nil else { return }
        pendingDetail = plant
    }

    /// Full-resolution viewer items for the whole photo wall, like the web's
    /// GalleryGrid — swipe ranges across every field photograph.
    private var viewerItems: [ViewerItem] {
        plants.map { plant in
            ViewerItem(
                country: country(for: plant), plant: plant, kind: .photo,
                title: plant.names[settings.language],
                subtitle: plant.names.latin,
                kindLabel: loc.t("plant.photograph"),
                badges: plant.categories,
                detailSlug: plant.slug
            )
        }
    }

    // MARK: Cover — title panel + hero plate

    private var cover: some View {
        VStack(spacing: 0) {
            // Plate panel first, like the web's mobile order.
            if let hero = plants.last {
                Button {
                    pushDetail(hero)
                } label: {
                    ZStack(alignment: .bottomTrailing) {
                        PlantImageView(
                            country: country, plant: hero, size: .medium,
                            kind: hero.hasIllustration ? .plate : .photo,
                            contentMode: .fit
                        )
                        .padding(.horizontal, 24)
                        .padding(.top, 24)
                        .padding(.bottom, 36)
                        .frame(maxWidth: .infinity)
                        .frame(height: 380)
                        .background(Color.parchment)
                        .shadow(color: .black.opacity(0.14), radius: 12, y: 6)

                        // Frontispiece figure caption.
                        Group {
                            Text(hero.names[settings.language]).italic()
                                + Text(" · ")
                                + Text(hero.names.latin).italic()
                        }
                        .font(.caption2)
                        .foregroundStyle(.inkMuted)
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: 260, alignment: .trailing)
                        .padding(.trailing, 16)
                        .padding(.bottom, 10)
                    }
                }
                .buttonStyle(.plain)
                .zoomSource(id: hero.slug, in: zoomNamespace, enabled: !settings.reduceMotion)
                .overlay(Rectangle().fill(Color.hairline).frame(height: 1), alignment: .bottom)
            }

            // Title panel.
            VStack(alignment: .leading, spacing: 0) {
                Text(
                    (country.id == "yakutia"
                        ? loc.t("app.subtitle") : loc.t("settings.country_\(country.id)")
                    ).uppercased()
                )
                .font(.caption.weight(.semibold))
                .tracking(1.6)
                .foregroundStyle(.inkMuted)
                .padding(.bottom, 16)

                Text(loc.t("app.title"))
                    .font(.system(size: 46, weight: .bold, design: .serif))
                    .foregroundStyle(.ink)
                    .padding(.bottom, 18)

                if country.id == "yakutia" {
                    Text(loc.t("app.description"))
                        .font(.title3.weight(.light))
                        .foregroundStyle(.inkLight)
                        .lineSpacing(3)
                        .padding(.bottom, 34)
                }

                HStack(spacing: 20) {
                    Button {
                        tab = .catalog
                    } label: {
                        HStack(spacing: 8) {
                            Text(loc.t("home.cta"))
                            Image(systemName: "arrow.right")
                        }
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 11)
                        .background(Color.forest)
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    }
                    .buttonStyle(.plain)

                    Text(
                        plated.isEmpty
                            ? loc.plural("gallery.photoCount", count: plants.count)
                            : loc.plural("home.plateCount", count: plated.count)
                    )
                    .font(.subheadline)
                    .foregroundStyle(.inkMuted)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 24)
            .padding(.vertical, 44)
            .overlay(Rectangle().fill(Color.hairline).frame(height: 1), alignment: .bottom)
        }
    }

    // MARK: Plates shelf — the herbarium drawer

    private var platesShelf: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .firstTextBaseline) {
                Text(loc.t("home.platesTitle"))
                    .font(.system(.title3, design: .serif).weight(.semibold))
                    .foregroundStyle(.ink)
                Spacer()
                SwipeHint(text: loc.t("home.swipeHint"))
                Text(loc.plural("home.plateCount", count: plated.count))
                    .font(.footnote.monospacedDigit())
                    .foregroundStyle(.inkMuted)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 2)
            .overlay(
                Rectangle().fill(Color.hairline).frame(height: 1).padding(.horizontal, 16),
                alignment: .bottom
            )

            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(alignment: .top, spacing: 16) {
                    ForEach(Array(plated.enumerated()), id: \.element.slug) { index, plant in
                        Button {
                            pushDetail(plant)
                        } label: {
                            plateTile(plant, index: index)
                        }
                        .buttonStyle(.plain)
                        .zoomSource(id: plant.slug, in: zoomNamespace, enabled: !settings.reduceMotion)
                    }
                }
                .scrollTargetLayout()
                .padding(.horizontal, 16)
            }
            .scrollTargetBehavior(.viewAligned)
        }
    }

    private func plateTile(_ plant: Plant, index: Int) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            // Square plate window with the web's 1.34× figure crop.
            PlantImageView(country: country, plant: plant, size: .thumb, kind: .plate)
                .aspectRatio(1, contentMode: .fit)
                .frame(width: 180, height: 180)
                .plateThumbCrop()
                .background(Color.parchment)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .strokeBorder(Color.hairline, lineWidth: 1)
                )

            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text(plateNumeral(index))
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(.inkMuted)
                VStack(alignment: .leading, spacing: 1) {
                    Text(plant.names[settings.language])
                        .font(.footnote.weight(.medium))
                        .foregroundStyle(.ink)
                        .lineLimit(1)
                    if settings.showLatin {
                        Text(plant.names.latin)
                            .font(.caption.italic())
                            .foregroundStyle(.inkMuted)
                            .lineLimit(1)
                    }
                }
            }
            .padding(.top, 10)
            .frame(width: 180, alignment: .leading)
        }
    }

    // MARK: Field photographs — the gallery wall

    private var photoSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .firstTextBaseline) {
                Text(loc.t("home.photosTitle"))
                    .font(.system(.title3, design: .serif).weight(.semibold))
                    .foregroundStyle(.ink)
                Spacer()
                Text(loc.plural("gallery.photoCount", count: plants.count))
                    .font(.footnote.monospacedDigit())
                    .foregroundStyle(.inkMuted)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 2)
            .overlay(
                Rectangle().fill(Color.hairline).frame(height: 1).padding(.horizontal, 16),
                alignment: .bottom
            )

            GalleryGrid(
                country: country, plants: plants,
                onTapTile: { index in
                    if settings.tileTap == .viewer {
                        viewer = ViewerState(index: index)
                    }
                },
                onOpenDetail: pushDetail
            )
        }
    }
}

/// Identifiable wrapper so fullScreenCover can present at a given index.
struct ViewerState: Identifiable {
    let index: Int
    var id: Int { index }
}

/// The 3-column 2px-gap photo wall. Tiles show a name scrim (Settings:
/// "Names on photos") and open the viewer or the detail page (Settings:
/// "Tapping a photo opens").
struct GalleryGrid: View {
    @EnvironmentObject var settings: AppSettings
    let country: Country
    let plants: [Plant]
    let onTapTile: (Int) -> Void
    /// Guarded detail push (dedupes double-taps); used in "detail" tap mode.
    var onOpenDetail: ((Plant) -> Void)? = nil

    var body: some View {
        LazyVGrid(
            columns: Array(repeating: GridItem(.flexible(), spacing: 2), count: 3),
            spacing: 2
        ) {
            ForEach(Array(plants.enumerated()), id: \.element.slug) { index, plant in
                if settings.tileTap == .detail {
                    Button { onOpenDetail?(plant) } label: { tile(plant) }
                        .buttonStyle(GalleryTileButtonStyle(reduceMotion: settings.reduceMotion))
                } else {
                    Button { onTapTile(index) } label: { tile(plant) }
                        .buttonStyle(GalleryTileButtonStyle(reduceMotion: settings.reduceMotion))
                }
            }
        }
        .padding(2)
    }

    private func tile(_ plant: Plant) -> some View {
        PlantImageView(country: country, plant: plant, size: .thumb)
            .aspectRatio(1, contentMode: .fill)
            .clipped()
            .overlay(alignment: .bottomLeading) {
                if settings.tileLabels {
                    Text(plant.names[settings.language])
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                        .shadow(color: .black.opacity(0.9), radius: 3, y: 1)
                        .padding(.horizontal, 6)
                        .padding(.bottom, 6)
                        .padding(.top, 28)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            LinearGradient(
                                colors: [.black.opacity(0.8), .black.opacity(0.4), .clear],
                                startPoint: .bottom, endPoint: .top)
                        )
                }
            }
            .contentShape(Rectangle())
    }
}

/// Web PlantCard's whileTap={scale:0.97} — press feedback, opacity-stable.
struct GalleryTileButtonStyle: ButtonStyle {
    let reduceMotion: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed && !reduceMotion ? 0.97 : 1)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

/// Drifting chevrons — the web's "keep swiping" cue on the plates shelf.
struct SwipeHint: View {
    @EnvironmentObject var settings: AppSettings
    let text: String
    @State private var drift = false

    var body: some View {
        HStack(spacing: 3) {
            Text(text)
                .font(.caption)
                .foregroundStyle(.forest)
            Image(systemName: "chevron.right.2")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(.forest)
                .opacity(drift ? 1 : 0.5)
                .offset(x: drift ? 3 : 0)
        }
        .onAppear {
            guard !settings.reduceMotion else { return }
            withAnimation(.easeInOut(duration: 0.7).repeatForever(autoreverses: true)) {
                drift = true
            }
        }
    }
}

/// Colophon footer: safety disclaimer + wordmark + © year, like the web's
/// Footer on Home/About.
struct FooterView: View {
    @EnvironmentObject var settings: AppSettings

    private var loc: L10n { settings.loc }

    var body: some View {
        VStack(alignment: .leading, spacing: 28) {
            DisclaimerBox(onOpenLegal: nil)
                .background(
                    NavigationLink(value: PushedPage.legal) { Color.clear }
                        .buttonStyle(.plain)
                )

            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 7) {
                        Image(systemName: "leaf")
                            .font(.subheadline)
                            .foregroundStyle(.forest)
                        Text(loc.t("app.title"))
                            .font(.system(.body, design: .serif).weight(.semibold))
                            .foregroundStyle(.ink)
                    }
                    Text(loc.t("app.description"))
                        .font(.caption)
                        .foregroundStyle(.inkMuted)
                        .lineSpacing(2)
                }
            }

            HStack {
                Text("© 2026 Ottor Mastar")
                Spacer()
                Text(loc.t("app.subtitle"))
            }
            .font(.caption.monospacedDigit())
            .foregroundStyle(.inkMuted)
            .padding(.top, 18)
            .overlay(Rectangle().fill(Color.hairline).frame(height: 1), alignment: .top)
        }
        .padding(20)
        .padding(.top, 28)
        .overlay(Rectangle().fill(Color.hairline).frame(height: 1), alignment: .top)
        .padding(.top, 36)
    }
}

/// Non-plant destinations pushed within a tab's NavigationStack.
enum PushedPage: Hashable {
    case legal
    case settings
}

// MARK: iOS 18 zoom transition helpers (no-ops on iOS 17)

extension View {
    @ViewBuilder
    func zoomSource(id: String, in namespace: Namespace.ID, enabled: Bool) -> some View {
        if #available(iOS 18.0, *), enabled {
            matchedTransitionSource(id: id, in: namespace)
        } else {
            self
        }
    }

    @ViewBuilder
    func zoomTransition(sourceID: String, in namespace: Namespace.ID, enabled: Bool) -> some View {
        if #available(iOS 18.0, *), enabled {
            navigationTransition(.zoom(sourceID: sourceID, in: namespace))
        } else {
            self
        }
    }
}
