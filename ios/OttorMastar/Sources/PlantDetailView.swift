import SwiftUI

/// Web-parity plant page: swipeable image panel on parchment (plate ↔ photo,
/// order follows the "lead image" setting) with frosted paging dots and a zoom
/// affordance, then a white info sheet that rises with a spring — grabber,
/// serif title, badges, description, names table, medicinal uses with the (?)
/// legal note, habitat, blooming season, further reading (Wikipedia), and the
/// amber disclaimer linking to Legal.
struct PlantDetailView: View {
    @EnvironmentObject var settings: AppSettings
    @Environment(\.openURL) private var openURL
    let plant: Plant
    let country: Country

    @State private var slide = 0
    @State private var viewer: ViewerState?
    @State private var sheetUp = false
    @State private var infoTipOpen = false

    private var loc: L10n { settings.loc }
    private var lang: Language { settings.language }

    /// Plate first unless the "lead image" setting flips it; plants without a
    /// plate simply show the photo.
    private var slides: [ImageKind] {
        let plate: [ImageKind] = plant.hasIllustration ? [.plate] : []
        return settings.leadImage == .photo ? [.photo] + plate : plate + [.photo]
    }

    private var viewerItems: [ViewerItem] {
        slides.map { kind in
            ViewerItem(
                country: country, plant: plant, kind: kind,
                title: plant.names[lang],
                subtitle: plant.names.latin,
                kindLabel: loc.t(kind == .plate ? "plant.illustration" : "plant.photograph"),
                badges: plant.categories,
                detailSlug: nil
            )
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                imagePanel
                infoSheet
                    .offset(y: sheetUp || settings.reduceMotion ? 0 : 28)
                    .opacity(sheetUp || settings.reduceMotion ? 1 : 0)
            }
        }
        .ignoresSafeArea(edges: .top)
        .background(Color.white)
        .toolbarBackground(.hidden, for: .navigationBar)
        .onAppear {
            withAnimation(.spring(response: 0.42, dampingFraction: 0.86)) { sheetUp = true }
        }
        .fullScreenCover(item: $viewer) { state in
            ImageViewer(items: viewerItems, index: state.index)
        }
    }

    // MARK: Image panel — swipeable plate/photo pager

    private var imagePanel: some View {
        ZStack(alignment: .bottom) {
            TabView(selection: $slide) {
                ForEach(Array(slides.enumerated()), id: \.offset) { i, kind in
                    Group {
                        if kind == .plate {
                            PlantImageView(
                                country: country, plant: plant, size: .medium,
                                kind: .plate, contentMode: .fit
                            )
                            .padding(.horizontal, 16)
                            .padding(.top, 60)
                            .padding(.bottom, 56)
                            .background(Color.parchment)
                            .shadow(color: .black.opacity(0.15), radius: 10, y: 5)
                        } else {
                            PlantImageView(country: country, plant: plant, size: .medium)
                                .clipped()
                                .overlay(
                                    LinearGradient(
                                        colors: [.black.opacity(0.25), .clear],
                                        startPoint: .bottom, endPoint: .top)
                                )
                        }
                    }
                    .tag(i)
                    .contentShape(Rectangle())
                    .onTapGesture { viewer = ViewerState(index: i) }
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .background(Color.parchment)

            // Frosted paging dots.
            if slides.count > 1 {
                HStack(spacing: 8) {
                    ForEach(0..<slides.count, id: \.self) { i in
                        Circle()
                            .fill(slide == i ? Color.forest : Color.forest.opacity(0.25))
                            .frame(width: 8, height: 8)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(.white.opacity(0.7), in: Capsule())
                .padding(.bottom, 40)
                .animation(.easeOut(duration: 0.2), value: slide)
            }
        }
        .frame(height: 420)
        .overlay(alignment: .topTrailing) {
            Image(systemName: "plus.magnifyingglass")
                .font(.footnote)
                .foregroundStyle(.white)
                .frame(width: 36, height: 36)
                .background(.black.opacity(0.3), in: Circle())
                .padding(.top, 60)
                .padding(.trailing, 16)
                .allowsHitTesting(false)
        }
    }

    // MARK: Info sheet

    private var infoSheet: some View {
        VStack(alignment: .leading, spacing: 0) {
            // iOS sheet grabber.
            Capsule()
                .fill(Color.ink.opacity(0.15))
                .frame(width: 40, height: 5)
                .frame(maxWidth: .infinity)
                .padding(.top, 10)

            VStack(alignment: .leading, spacing: 32) {
                // Title block.
                VStack(alignment: .leading, spacing: 6) {
                    Text(plant.names[lang])
                        .font(.system(.largeTitle, design: .serif).weight(.bold))
                        .foregroundStyle(.ink)
                    Text(plant.names.latin)
                        .font(.body.italic())
                        .foregroundStyle(.inkMuted)
                    HStack(spacing: 6) {
                        ForEach(plant.categories, id: \.self) { cat in
                            CategoryBadge(category: cat)
                        }
                    }
                    .padding(.top, 8)
                }

                Text(plant.description[lang])
                    .font(.subheadline)
                    .foregroundStyle(.inkLight)
                    .lineSpacing(5)

                namesSection
                medicinalSection
                section(loc.t("plant.habitat")) {
                    Text(plant.habitat[lang])
                        .font(.subheadline)
                        .foregroundStyle(.inkLight)
                        .lineSpacing(5)
                }
                section(loc.t("plant.bloomingSeason")) {
                    Text(loc.season(plant.bloomingSeason))
                        .font(.subheadline)
                        .foregroundStyle(.inkLight)
                }
                furtherReading

                DisclaimerBox(onOpenLegal: nil)
                    .background(
                        NavigationLink(value: PushedPage.legal) { Color.clear }
                            .buttonStyle(.plain)
                    )
            }
            .padding(.horizontal, 24)
            .padding(.top, 26)
            .padding(.bottom, 40)
        }
        .frame(maxWidth: .infinity)
        .background(
            UnevenRoundedRectangle(topLeadingRadius: 28, topTrailingRadius: 28, style: .continuous)
                .fill(Color.white)
        )
        .offset(y: -24)
    }

    private func section<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            OverlineLabel(text: title)
            content()
        }
    }

    /// Names table — one row per language plus the Latin binomial.
    private var namesSection: some View {
        section(loc.t("plant.names")) {
            VStack(spacing: 0) {
                nameRow(loc.t("plant.yakutName"), plant.names.sah)
                Rectangle().fill(Color.hairline).frame(height: 1)
                nameRow(loc.t("plant.russianName"), plant.names.ru)
                Rectangle().fill(Color.hairline).frame(height: 1)
                nameRow(loc.t("plant.englishName"), plant.names.en)
                Rectangle().fill(Color.hairline).frame(height: 1)
                nameRow(loc.t("plant.latinName"), plant.names.latin, italic: true)
            }
        }
    }

    private func nameRow(_ label: String, _ value: String, italic: Bool = false) -> some View {
        HStack(alignment: .firstTextBaseline) {
            Text(label)
                .font(.footnote)
                .foregroundStyle(.inkMuted)
            Spacer(minLength: 16)
            Text(value)
                .font(italic ? .footnote.italic() : .footnote.weight(.medium))
                .foregroundStyle(.ink)
                .multilineTextAlignment(.trailing)
        }
        .padding(.vertical, 8)
    }

    /// Medicinal uses with the (?) affordance that reveals the legal note.
    private var medicinalSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Text(loc.t("plant.medicinalUses").uppercased())
                        .font(.caption.weight(.semibold))
                        .tracking(1.6)
                        .foregroundStyle(.inkMuted)
                    Button {
                        withAnimation(
                            settings.reduceMotion ? nil : .spring(response: 0.28, dampingFraction: 0.85)
                        ) {
                            infoTipOpen.toggle()
                        }
                    } label: {
                        Image(systemName: "questionmark.circle")
                            .font(.caption)
                            .foregroundStyle(infoTipOpen ? .forest : .inkMuted)
                            // Small glyph, full-size hit target.
                            .frame(width: 40, height: 40)
                            .contentShape(Rectangle())
                    }
                    .accessibilityLabel(loc.t("plant.medicinalDisclaimerLabel"))
                    Spacer()
                }
                Rectangle().fill(Color.hairline).frame(height: 1)
            }

            if infoTipOpen {
                Text(loc.t("plant.medicinalDisclaimer"))
                    .font(.caption)
                    .foregroundStyle(.inkLight)
                    .lineSpacing(3)
                    .padding(12)
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .strokeBorder(Color.hairline, lineWidth: 1)
                    )
                    .shadow(color: .black.opacity(0.08), radius: 12, y: 4)
                    .transition(
                        settings.reduceMotion
                            ? .opacity
                            : .opacity.combined(with: .move(edge: .top)).combined(with: .scale(scale: 0.98, anchor: .top))
                    )
            }

            Text(plant.medicinalUses[lang])
                .font(.subheadline)
                .foregroundStyle(.inkLight)
                .lineSpacing(5)
        }
    }

    /// Language-matched Wikipedia lookup card.
    private var furtherReading: some View {
        section(loc.t("plant.furtherReading")) {
            Button {
                if let url = plant.wikipediaURL(for: lang) { openURL(url) }
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "arrow.up.right.square")
                        .font(.subheadline)
                        .foregroundStyle(.forest)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(loc.t("plant.readOnWikipedia"))
                            .font(.footnote.weight(.medium))
                            .foregroundStyle(.ink)
                        Text("\(lang.rawValue).wikipedia.org")
                            .font(.caption.monospacedDigit())
                            .foregroundStyle(.inkMuted)
                    }
                    Spacer()
                    Image(systemName: "arrow.up.right")
                        .font(.caption)
                        .foregroundStyle(.inkMuted.opacity(0.6))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(Color.card)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .strokeBorder(Color.hairline, lineWidth: 1)
                )
            }
            .buttonStyle(.plain)
        }
    }
}
