import SwiftUI

/// A community news / changelog item. Same shape as the web `news.json`, so the
/// bundled fallback and the over-the-air feed decode with one type.
struct NewsItem: Decodable, Identifiable, Hashable {
    let id: String
    let date: String
    let title: LocalizedText
    let body: LocalizedText
}

private struct NewsFeed: Decodable {
    let version: Int?
    let items: [NewsItem]
}

/// Bundled fallback + best-effort over-the-air refresh, mirroring `PlantStore`:
/// show the bundled list instantly, then replace it if the hosted `news.json`
/// is reachable and non-empty. Never surfaces errors; offline keeps the bundle.
@MainActor
final class NewsStore: ObservableObject {
    @Published private(set) var items: [NewsItem]

    init() { items = Self.bundled() }

    private static func bundled() -> [NewsItem] {
        guard
            let url = Bundle.main.url(forResource: "news", withExtension: "json"),
            let raw = try? Data(contentsOf: url),
            let feed = try? JSONDecoder().decode(NewsFeed.self, from: raw)
        else { return [] }
        return feed.items
    }

    func refresh() {
        guard let url = URL(string: PlantStore.data.imageHost)?.appendingPathComponent("news.json") else { return }
        Task { [weak self] in
            guard
                let (raw, response) = try? await URLSession.shared.data(from: url),
                (response as? HTTPURLResponse)?.statusCode == 200,
                let feed = try? JSONDecoder().decode(NewsFeed.self, from: raw),
                !feed.items.isEmpty
            else { return }
            await MainActor.run { self?.items = feed.items }
        }
    }
}

struct NewsView: View {
    @EnvironmentObject var settings: AppSettings
    @StateObject private var store = NewsStore()

    private func formattedDate(_ iso: String) -> String {
        let parser = ISO8601DateFormatter()
        parser.formatOptions = [.withFullDate]
        guard let date = parser.date(from: iso) else { return iso }
        let f = DateFormatter()
        f.locale = Locale(identifier: settings.language == .sah ? "ru" : settings.language.rawValue)
        f.dateFormat = "d MMMM yyyy"
        return f.string(from: date)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(settings.loc.t("news.title"))
                    .font(.largeTitle.weight(.semibold))
                    .foregroundStyle(.ink)
                    .padding(.bottom, 4)

                if store.items.isEmpty {
                    Text(settings.loc.t("news.empty"))
                        .foregroundStyle(.inkMuted)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.vertical, 40)
                }

                ForEach(store.items) { item in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(formattedDate(item.date).uppercased())
                            .font(.caption2.weight(.medium))
                            .tracking(0.6)
                            .foregroundStyle(.forest)
                        Text(item.title[settings.language])
                            .font(.title3.weight(.semibold))
                            .foregroundStyle(.ink)
                            .fixedSize(horizontal: false, vertical: true)
                        Text(item.body[settings.language])
                            .font(.callout)
                            .foregroundStyle(.inkMuted)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(18)
                    .background(Color.card)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .strokeBorder(Color.hairline, lineWidth: 1)
                    )
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 16)
            .padding(.bottom, 24)
            .frame(maxWidth: 760)
            .frame(maxWidth: .infinity)
        }
        .background(Color.cream)
        .toolbar(.hidden, for: .navigationBar)
        .onAppear { store.refresh() }
    }
}
