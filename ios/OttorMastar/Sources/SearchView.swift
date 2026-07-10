import SwiftUI

/// Web-parity search tab: a big autofocused field that searches deeper than
/// the catalog — names and Latin plus descriptions and medicinal uses in the
/// current language. Empty state shows the browse prompt.
struct SearchView: View {
    @EnvironmentObject var settings: AppSettings
    @State private var query = ""
    @FocusState private var focused: Bool

    private var country: Country { settings.country }
    private var loc: L10n { settings.loc }
    private var lang: Language { settings.language }

    private var results: [Plant] {
        let q = query.trimmingCharacters(in: .whitespaces)
        guard !q.isEmpty else { return [] }
        return country.plants.filter { plant in
            let haystacks = [
                plant.names.sah, plant.names.ru, plant.names.en, plant.names.latin,
                // Optional Mongolian/Chinese names, so a Mongolia plant is
                // findable by its mn/zh name too, not just sah/ru/en/latin.
                plant.names.mn ?? "", plant.names.zh ?? "",
                plant.description[lang], plant.medicinalUses[lang],
            ]
            return haystacks.contains {
                $0.range(of: q, options: [.caseInsensitive, .diacriticInsensitive]) != nil
            }
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                searchField
                    .padding(16)
                    .padding(.top, 12)

                let trimmed = query.trimmingCharacters(in: .whitespaces)
                if trimmed.isEmpty {
                    emptyState
                } else if results.isEmpty {
                    Text(loc.t("catalog.noResults"))
                        .font(.subheadline)
                        .foregroundStyle(.inkMuted)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                } else {
                    // Adaptive grid — 1 column on iPhone, 2–3 on iPad / large
                    // windows (parity with the web search results).
                    LazyVGrid(
                        columns: [GridItem(.adaptive(minimum: 340), spacing: 12)],
                        spacing: 12
                    ) {
                        ForEach(results) { plant in
                            NavigationLink(value: plant) {
                                SearchRow(plant: plant, country: country)
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
            PlantDetailView(plant: plant, country: country)
        }
        .navigationDestination(for: PushedPage.self) { page in
            switch page {
            case .legal: LegalView()
            case .help: HelpView()
            case .settings: SettingsView()
            }
        }
        .onAppear { focused = true }
    }

    private var searchField: some View {
        HStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .font(.body)
                .foregroundStyle(.inkMuted)
            TextField(loc.t("catalog.searchPlaceholder"), text: $query)
                .font(.body)
                .foregroundStyle(.ink)
                .focused($focused)
                .autocorrectionDisabled()
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 15)
        .background(Color.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .strokeBorder(Color.hairline, lineWidth: 1)
        )
    }

    private var emptyState: some View {
        VStack(spacing: 14) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 44))
                .foregroundStyle(.inkMuted.opacity(0.3))
            Text(loc.t("catalog.searchPlaceholder"))
                .font(.footnote)
                .foregroundStyle(.inkMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }
}

/// Same full-bleed leading-image card anatomy as CatalogRow, sized for the
/// lighter search result (no index stamp, no badges).
private struct SearchRow: View {
    @EnvironmentObject var settings: AppSettings
    let plant: Plant
    let country: Country

    var body: some View {
        HStack(spacing: 0) {
            PlantImageView(
                country: country, plant: plant, size: .thumb,
                kind: plant.hasIllustration ? .plate : .photo
            )
            .frame(width: 88)
            .scaleEffect(plant.hasIllustration ? 1.14 : 1)
            .clipped()

            VStack(alignment: .leading, spacing: 3) {
                Text(plant.names[settings.language])
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                if settings.showLatin {
                    Text(plant.names.latin)
                        .font(.subheadline.italic())
                        .foregroundStyle(.inkMuted)
                        .lineLimit(1)
                }
            }
            .padding(.horizontal, 16)

            Spacer(minLength: 0)
        }
        .frame(height: 84)
        .contentShape(Rectangle())
    }
}
