import SwiftUI

/// Web-parity About: overline + serif title, intro (serif lead), mission,
/// the three stats computed from the live collection, and the Settings and
/// Legal entry cards, followed by the colophon footer.
struct AboutView: View {
    @EnvironmentObject var settings: AppSettings
    /// Debug/screenshot hook target — see the `-page` launch argument below.
    @State private var debugPage: PushedPage?

    private var loc: L10n { settings.loc }
    private var lang: Language { settings.language }
    private var plants: [Plant] { settings.country.plants }

    private var stats: [(value: String, label: String)] {
        let medicinal = plants.filter { $0.categories.contains("medicinal") }.count
        let labels: [Language: (String, String, String)] = [
            .sah: ("Айылҕа үүнээйилэрэ", "Эмтээх оттор", "Тыллар"),
            .ru: ("Дикорастущих растений", "Лекарственных трав", "Языки"),
            .en: ("Wild plants", "Medicinal herbs", "Languages"),
        ]
        // Fall back to English labels for Mongolia's mn/zh UI — `labels` has no
        // mn/zh key, so force-unwrapping labels[lang] there would crash the page.
        let l = labels[lang] ?? labels[.en]!
        // Real per-country language count, not a hardcoded "3".
        return [(String(plants.count), l.0), (String(medicinal), l.1), (String(settings.country.languages.count), l.2)]
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                VStack(alignment: .leading, spacing: 0) {
                    Text(loc.t("app.subtitle").uppercased())
                        .font(.caption.weight(.semibold))
                        .tracking(1.6)
                        .foregroundStyle(.inkMuted)
                        .padding(.bottom, 8)
                    Text(loc.t("about.title"))
                        .font(.system(.largeTitle, design: .serif).weight(.bold))
                        .foregroundStyle(.ink)
                        .padding(.bottom, 28)

                    Text(loc.t("about.intro"))
                        .font(.system(.title3, design: .serif))
                        .foregroundStyle(.ink)
                        .lineSpacing(5)
                        .padding(.bottom, 14)
                    Text(loc.t("about.mission"))
                        .font(.subheadline)
                        .foregroundStyle(.inkLight)
                        .lineSpacing(5)
                        .padding(.bottom, 36)

                    statsCard.padding(.bottom, 36)

                    entryCard(
                        icon: "gearshape",
                        title: loc.t("settings.title"),
                        note: loc.t("settings.storageNote"),
                        value: PushedPage.settings
                    )
                    .padding(.bottom, 12)
                    entryCard(
                        icon: "questionmark.circle",
                        title: loc.t("help.title"),
                        note: loc.t("help.intro"),
                        value: PushedPage.help
                    )
                    .padding(.bottom, 12)
                    entryCard(
                        icon: "shield",
                        title: loc.t("common.legal"),
                        note: loc.t("common.readDisclaimer"),
                        value: PushedPage.legal
                    )
                }
                .padding(20)
                .padding(.top, 12)

                FooterView()
            }
        }
        .background(Color.cream)
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(for: PushedPage.self) { page in
            switch page {
            case .legal: LegalView()
            case .help: HelpView()
            case .settings: SettingsView()
            }
        }
        .navigationDestination(for: Plant.self) { plant in
            PlantDetailView(plant: plant, country: settings.country)
        }
        .navigationDestination(item: $debugPage) { page in
            switch page {
            case .legal: LegalView()
            case .help: HelpView()
            case .settings: SettingsView()
            }
        }
        .onAppear {
            // Debug/screenshot hook: `simctl launch ... -tab about -page
            // settings|help|legal` pushes that page. No effect without the flag.
            let args = ProcessInfo.processInfo.arguments
            if let i = args.firstIndex(of: "-page"), i + 1 < args.count {
                switch args[i + 1] {
                case "settings": debugPage = .settings
                case "help": debugPage = .help
                case "legal": debugPage = .legal
                default: break
                }
            }
        }
    }

    private var statsCard: some View {
        HStack(spacing: 0) {
            ForEach(Array(stats.enumerated()), id: \.offset) { i, stat in
                if i > 0 { Rectangle().fill(Color.hairline).frame(width: 1) }
                VStack(spacing: 8) {
                    Text(stat.value)
                        .font(.system(.title, design: .serif).weight(.semibold).monospacedDigit())
                        .foregroundStyle(.forest)
                    Text(stat.label)
                        .font(.caption2)
                        .foregroundStyle(.inkMuted)
                        .multilineTextAlignment(.center)
                        .lineSpacing(1)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 20)
                .frame(maxWidth: .infinity)
            }
        }
        .background(Color.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .strokeBorder(Color.hairline, lineWidth: 1)
        )
    }

    private func entryCard(icon: String, title: String, note: String, value: PushedPage) -> some View {
        NavigationLink(value: value) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.body.weight(.medium))
                    .foregroundStyle(.forest)
                    .frame(width: 24)
                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(.ink)
                    Text(note)
                        .font(.caption)
                        .foregroundStyle(.inkMuted)
                        .lineLimit(2)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.inkMuted.opacity(0.6))
            }
            .padding(18)
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
