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
                return $0.names[lang] < $1.names[lang]
            }
        }
        if activeCategory != "all" {
            result = result.filter { $0.categories.contains(activeCategory) }
        }
        let q = query.trimmingCharacters(in: .whitespaces)
        if !q.isEmpty {
            result = result.filter { plant in
                [plant.names.sah, plant.names.ru, plant.names.en, plant.names.latin]
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
                    LazyVStack(spacing: 0) {
                        Rectangle().fill(Color.hairline).frame(height: 1)
                        ForEach(Array(filtered.enumerated()), id: \.element.slug) { index, plant in
                            NavigationLink(value: plant) {
                                CatalogRow(plant: plant, country: country, index: index)
                            }
                            .buttonStyle(.plain)
                            Rectangle().fill(Color.hairline).frame(height: 1)
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }
        }
        .background(Color.cream)
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(for: Plant.self) { plant in
            PlantDetailView(plant: plant, country: country)
        }
        .navigationDestination(for: PushedPage.self) { page in
            switch page {
            case .legal: LegalView()
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
                        activeCategory = key
                    } label: {
                        Text(key == "all" ? loc.t("gallery.allPlants") : loc.t("categories.\(key)"))
                            .font(.footnote.weight(.medium))
                            .foregroundStyle(active ? .white : .inkLight)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(active ? Color.forest : .clear, in: Capsule())
                            .overlay(
                                Capsule().strokeBorder(
                                    active ? Color.forest : Color.hairline, lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 16)
        }
    }
}

struct CatalogRow: View {
    @EnvironmentObject var settings: AppSettings
    let plant: Plant
    let country: Country
    let index: Int

    var body: some View {
        HStack(spacing: 14) {
            Text(plateNumeral(index))
                .font(.caption.monospacedDigit())
                .foregroundStyle(.inkMuted)
                .frame(width: 28, alignment: .trailing)

            PlantImageView(
                country: country, plant: plant, size: .thumb,
                kind: plant.hasIllustration ? .plate : .photo
            )
            .frame(width: 56, height: 56)
            .modifier(ConditionalPlateThumb(isPlate: plant.hasIllustration))
            .background(Color.parchment)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .strokeBorder(Color.hairline, lineWidth: 1)
            )

            VStack(alignment: .leading, spacing: 2) {
                Text(plant.names[settings.language])
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.ink)
                    .lineLimit(1)
                if settings.showLatin {
                    Text(plant.names.latin)
                        .font(.caption.italic())
                        .foregroundStyle(.inkMuted)
                        .lineLimit(1)
                }
                HStack(spacing: 6) {
                    ForEach(plant.categories, id: \.self) { cat in
                        CategoryBadge(category: cat)
                    }
                }
                .padding(.top, 4)
            }

            Spacer(minLength: 0)
        }
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
}

/// Applies the web's plate-thumb figure crop only to plates; photos fill.
struct ConditionalPlateThumb: ViewModifier {
    let isPlate: Bool

    func body(content: Content) -> some View {
        if isPlate {
            content.plateThumbCrop()
        } else {
            content.clipped()
        }
    }
}
