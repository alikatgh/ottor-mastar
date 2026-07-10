import SwiftUI

/// Web-parity catalog: count in the header, search field, category filter
/// chips (color changes, never geometry), rows numbered by list position with
/// plate thumbs, Latin (per setting) and category badges. Sort follows the
/// "catalog order" setting: locale-aware alphabetical or blooming season.
struct CatalogView: View {
    @EnvironmentObject var settings: AppSettings
    @State private var query = ""
    @State private var activeCategory = "all"

    private static let categoryFilters = ["all", "medicinal", "edible", "ornamental", "poisonous"]

    private var country: Country { settings.country }
    private var loc: L10n { settings.loc }

    private var filtered: [Plant] {
        let lang = settings.language
        var result = country.plants.sorted {
            $0.names[lang].compare($1.names[lang], options: [.caseInsensitive], range: nil, locale: Locale(identifier: lang.rawValue)) == .orderedAscending
        }
        if settings.catalogSort == .season {
            result.sort {
                let (ra, rb) = (SeasonOrder.rank($0.bloomingSeason), SeasonOrder.rank($1.bloomingSeason))
                if ra != rb { return ra < rb }
                // Locale-aware tiebreaker, matching Android's Collator.
                return $0.names[lang].localizedStandardCompare($1.names[lang]) == .orderedAscending
            }
        }
        if activeCategory != "all" {
            result = result.filter { $0.categories.contains(activeCategory) }
        }
        let q = query.trimmingCharacters(in: .whitespaces)
        if !q.isEmpty {
            result = result.filter { plant in
                [plant.names.sah, plant.names.ru, plant.names.en, plant.names.latin,
                 plant.names.mn ?? "", plant.names.zh ?? ""]
                    .contains { $0.range(of: q, options: [.caseInsensitive, .diacriticInsensitive]) != nil }
            }
        }
        return result
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .firstTextBaseline) {
                    Text(loc.t("catalog.title"))
                        .font(.system(.largeTitle, design: .serif).weight(.semibold))
                        .foregroundStyle(.ink)
                    Spacer()
                    Text("\(filtered.count)")
                        .font(.footnote.monospacedDigit())
                        .foregroundStyle(.inkMuted)
                        .contentTransition(.numericText())
                        .animation(
                            settings.reduceMotion ? nil : .snappy(duration: 0.25),
                            value: filtered.count)
                }
                .padding(.horizontal, 16)
                .padding(.top, 16)
                .padding(.bottom, 20)

                searchField
                    .padding(.horizontal, 16)
                    .padding(.bottom, 16)

                categoryChips
                    .padding(.bottom, 20)

                if filtered.isEmpty {
                    Text(loc.t("catalog.noResults"))
                        .font(.subheadline)
                        .foregroundStyle(.inkMuted)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 48)
                } else {
                    // Adaptive grid: 1 column on iPhone width, 2–3 on iPad /
                    // large windows, so the browsable index uses the space
                    // instead of a narrow column (parity with the web catalog).
                    LazyVGrid(
                        columns: [GridItem(.adaptive(minimum: 340), spacing: 12)],
                        spacing: 12
                    ) {
                        ForEach(Array(filtered.enumerated()), id: \.element.slug) { index, plant in
                            NavigationLink(value: plant) {
                                CatalogRow(plant: plant, country: country, index: index)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(Color.card)
                                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                                            .strokeBorder(Color.hairline, lineWidth: 1)
                                    )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }
        }
        .background(Color.cream)
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(for: Plant.self) { plant in
            // Resolve the plant's OWN country so cross-country entries open correctly.
            PlantDetailView(plant: plant, country: PlantStore.findPlant(slug: plant.slug)?.1 ?? country)
        }
        .navigationDestination(for: PushedPage.self) { page in
            switch page {
            case .legal: LegalView()
            case .help: HelpView()
            case .settings: SettingsView()
            }
        }
        .animation(settings.reduceMotion ? nil : .easeOut(duration: 0.22), value: activeCategory)
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .font(.subheadline)
                .foregroundStyle(.inkMuted)
            TextField(loc.t("catalog.searchPlaceholder"), text: $query)
                .font(.subheadline)
                .foregroundStyle(.ink)
                .autocorrectionDisabled()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(Color.card)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .strokeBorder(Color.hairline, lineWidth: 1)
        )
    }

    private var categoryChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Self.categoryFilters, id: \.self) { key in
                    let active = activeCategory == key
                    Button {
                        withAnimation(settings.reduceMotion ? nil : .snappy(duration: 0.28)) {
                            activeCategory = key
                        }
                    } label: {
                        Text(key == "all" ? loc.t("gallery.allPlants") : loc.t("categories.\(key)"))
                            .font(.footnote.weight(.medium))
                            .foregroundStyle(active ? .white : .inkLight)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .modifier(FilterChipBackground(active: active))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 16)
        }
    }
}

/// Herbarium index card: the plate fills the card's full left edge (full
/// bleed, clipped by the card's corners), the specimen number sits in the
/// top-right corner like a catalog stamp, and the badges anchor the bottom —
/// the standard iOS "leading image panel" card anatomy.
struct CatalogRow: View {
    @EnvironmentObject var settings: AppSettings
    let plant: Plant
    let country: Country
    let index: Int

    var body: some View {
        HStack(spacing: 0) {
            PlantImageView(
                country: country, plant: plant, size: .thumb,
                kind: plant.hasIllustration ? .plate : .photo
            )
            .frame(width: 112)
            .clipped()

            VStack(alignment: .leading, spacing: 3) {
                Text(plateNumeral(index))
                    .font(.footnote.monospacedDigit())
                    .foregroundStyle(.inkMuted)
                    .frame(maxWidth: .infinity, alignment: .trailing)

                Spacer(minLength: 0)

                Text(plant.names[settings.language])
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                if settings.showLatin {
                    Text(plant.names.latin)
                        .font(.subheadline.italic())
                        .foregroundStyle(.inkMuted)
                        .lineLimit(1)
                }

                Spacer(minLength: 0)

                BadgeRow(categories: plant.categories)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .frame(height: 124)
        .contentShape(Rectangle())
    }
}
