import SwiftUI

/// Web-parity settings — every setting from the web SettingsPage, rendered in
/// the same overline-sectioned, pill-segmented style: language, country,
/// Latin names, catalog order, lead image, text size, reduce motion, gallery
/// tile labels, tile tap behavior, and reset.
struct SettingsView: View {
    @EnvironmentObject var settings: AppSettings

    private var loc: L10n { settings.loc }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                Text(loc.t("settings.title"))
                    .font(.system(.largeTitle, design: .serif).weight(.bold))
                    .foregroundStyle(.ink)
                    .padding(.bottom, 6)
                Text(loc.t("settings.storageNote"))
                    .font(.footnote)
                    .foregroundStyle(.inkMuted)
                    .padding(.bottom, 36)

                sectionHeader(loc.t("settings.sectionRegion"))
                row(loc.t("settings.language")) {
                    Segmented(
                        selection: Binding(
                            get: { settings.language.rawValue },
                            set: { settings.language = Language(rawValue: $0) ?? .sah }
                        ),
                        // Only the active country's languages (Yakutia:
                        // sah/ru/en; Mongolia: mn/zh/en), in the country's order.
                        options: settings.country.languages.map { ($0.rawValue, $0.shortLabel) }
                    )
                }
                divider
                row(loc.t("settings.country"), note: loc.t("settings.countryNote")) {
                    Segmented(
                        selection: Binding(
                            get: { settings.countryId },
                            set: { settings.countryId = $0 }
                        ),
                        options: PlantStore.availableCountries.map {
                            ($0.id, loc.t("settings.country_\($0.id)"))
                        }
                    )
                }

                sectionHeader(loc.t("settings.sectionContent")).padding(.top, 36)
                row(loc.t("settings.showLatin")) {
                    PillToggle(isOn: $settings.showLatin)
                }
                divider
                row(loc.t("settings.catalogSort")) {
                    Segmented(
                        selection: Binding(
                            get: { settings.catalogSort.rawValue },
                            set: { settings.catalogSort = CatalogSort(rawValue: $0) ?? .name }
                        ),
                        options: [
                            (CatalogSort.name.rawValue, loc.t("settings.sortName")),
                            (CatalogSort.season.rawValue, loc.t("settings.sortSeason")),
                        ]
                    )
                }
                divider
                row(loc.t("settings.leadImage")) {
                    Segmented(
                        selection: Binding(
                            get: { settings.leadImage.rawValue },
                            set: { settings.leadImage = LeadImage(rawValue: $0) ?? .plate }
                        ),
                        options: [
                            (LeadImage.plate.rawValue, loc.t("settings.leadPlate")),
                            (LeadImage.photo.rawValue, loc.t("settings.leadPhoto")),
                        ]
                    )
                }

                sectionHeader(loc.t("settings.sectionDisplay")).padding(.top, 36)
                row(loc.t("settings.theme")) {
                    Segmented(
                        selection: Binding(
                            get: { settings.theme.rawValue },
                            set: { settings.theme = ThemeOpt(rawValue: $0) ?? .system }
                        ),
                        options: [
                            (ThemeOpt.system.rawValue, loc.t("settings.themeSystem")),
                            (ThemeOpt.light.rawValue, loc.t("settings.themeLight")),
                            (ThemeOpt.dark.rawValue, loc.t("settings.themeDark")),
                        ]
                    )
                }
                divider
                row(loc.t("settings.textSize")) {
                    Segmented(
                        selection: Binding(
                            get: { settings.textSize.rawValue },
                            set: { settings.textSize = TextSize(rawValue: $0) ?? .default }
                        ),
                        options: [
                            (TextSize.small.rawValue, loc.t("settings.textSmall")),
                            (TextSize.default.rawValue, loc.t("settings.textDefault")),
                            (TextSize.large.rawValue, loc.t("settings.textLarge")),
                        ]
                    )
                }
                divider
                row(loc.t("settings.reduceMotion")) {
                    PillToggle(isOn: $settings.reduceMotionSetting)
                }

                sectionHeader(loc.t("settings.sectionGallery")).padding(.top, 36)
                row(loc.t("settings.tileLabels")) {
                    PillToggle(isOn: $settings.tileLabels)
                }
                divider
                row(loc.t("settings.tileTap")) {
                    Segmented(
                        selection: Binding(
                            get: { settings.tileTap.rawValue },
                            set: { settings.tileTap = TileTap(rawValue: $0) ?? .viewer }
                        ),
                        options: [
                            (TileTap.viewer.rawValue, loc.t("settings.tapViewer")),
                            (TileTap.detail.rawValue, loc.t("settings.tapDetail")),
                        ]
                    )
                }

                sectionHeader(loc.t("settings.sectionData")).padding(.top, 36)
                Button {
                    settings.reset()
                } label: {
                    Text(loc.t("settings.reset"))
                        .font(.footnote.weight(.medium))
                        .foregroundStyle(.inkLight)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 9)
                        .overlay(Capsule().strokeBorder(Color.hairlineStrong, lineWidth: 1))
                }
                .buttonStyle(.plain)
                .padding(.vertical, 14)
            }
            .padding(20)
        }
        .background(Color.cream)
        .navigationTitle(loc.t("settings.title"))
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Color.cream, for: .navigationBar)
    }

    private var divider: some View {
        Rectangle().fill(Color.hairline).frame(height: 1)
    }

    private func sectionHeader(_ title: String) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Rectangle().fill(Color.hairline).frame(height: 1)
            Text(title.uppercased())
                .font(.caption.weight(.semibold))
                .tracking(1.6)
                .foregroundStyle(.inkMuted)
                .padding(.top, 12)
                .padding(.bottom, 4)
        }
    }

    private func row<Content: View>(
        _ label: String, note: String? = nil, @ViewBuilder control: () -> Content
    ) -> some View {
        HStack(alignment: .center, spacing: 16) {
            VStack(alignment: .leading, spacing: 3) {
                Text(label)
                    .font(.subheadline)
                    .foregroundStyle(.ink)
                if let note {
                    Text(note)
                        .font(.caption)
                        .foregroundStyle(.inkMuted)
                        .lineSpacing(2)
                }
            }
            Spacer(minLength: 8)
            control()
        }
        .padding(.vertical, 14)
    }
}

/// Pill segmented control — active state changes only color, never geometry.
struct Segmented: View {
    @EnvironmentObject var settings: AppSettings
    @Binding var selection: String
    let options: [(value: String, label: String)]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(options, id: \.value) { option in
                let active = selection == option.value
                Button {
                    withAnimation(settings.reduceMotion ? nil : .easeOut(duration: 0.18)) {
                        selection = option.value
                    }
                } label: {
                    Text(option.label)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(active ? .white : .inkLight)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(active ? Color.forest : .clear)
                }
                .buttonStyle(.plain)
            }
        }
        .clipShape(Capsule())
        .overlay(Capsule().strokeBorder(Color.hairline, lineWidth: 1))
    }
}

/// Switch with the web's fixed-track geometry, tinted forest.
struct PillToggle: View {
    @EnvironmentObject var settings: AppSettings
    @Binding var isOn: Bool

    var body: some View {
        Button {
            withAnimation(settings.reduceMotion ? nil : .spring(response: 0.25, dampingFraction: 0.8)) {
                isOn.toggle()
            }
        } label: {
            Capsule()
                .fill(isOn ? Color.forest : Color.creamDark)
                .frame(width: 44, height: 26)
                .overlay(
                    Circle()
                        .fill(.white)
                        .shadow(color: .black.opacity(0.15), radius: 1, y: 1)
                        .padding(2)
                        .frame(width: 26, height: 26),
                    alignment: isOn ? .trailing : .leading
                )
                .overlay(
                    Capsule().strokeBorder(
                        isOn ? Color.forest : Color.hairlineStrong, lineWidth: 1)
                )
                // 44×26 visual, ≥44pt hit target.
                .frame(minWidth: 48, minHeight: 44)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
