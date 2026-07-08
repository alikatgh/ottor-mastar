import SwiftUI

/// Help — the same short guide as the web's /help, from the shared `help.*`
/// locale keys (all five languages): browsing, viewer gestures, languages &
/// collections, offline note, and the safety pointer into Legal.
struct HelpView: View {
    @EnvironmentObject var settings: AppSettings

    private var loc: L10n { settings.loc }

    private var sections: [(title: String, body: String)] {
        [
            (loc.t("help.browseTitle"), loc.t("help.browseBody")),
            (loc.t("help.viewerTitle"), loc.t("help.viewerBody")),
            (loc.t("help.langTitle"), loc.t("help.langBody")),
            (loc.t("help.appTitle"), loc.t("help.appBody")),
            (loc.t("help.safetyTitle"), loc.t("help.safetyBody")),
        ]
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                Text(loc.t("app.title").uppercased())
                    .font(.caption.weight(.semibold))
                    .tracking(1.6)
                    .foregroundStyle(.inkMuted)
                    .padding(.bottom, 8)
                Text(loc.t("help.title"))
                    .font(.system(.largeTitle, design: .serif).weight(.bold))
                    .foregroundStyle(.ink)
                    .padding(.bottom, 10)
                Text(loc.t("help.intro"))
                    .font(.subheadline)
                    .foregroundStyle(.inkLight)
                    .lineSpacing(4)
                    .padding(.bottom, 28)

                ForEach(Array(sections.enumerated()), id: \.offset) { i, section in
                    if i > 0 { Spacer().frame(height: 26) }
                    OverlineLabel(text: section.title)
                        .padding(.bottom, 10)
                    Text(section.body)
                        .font(.subheadline)
                        .foregroundStyle(.inkLight)
                        .lineSpacing(5)
                }

                // Safety pointer → Legal & Privacy
                NavigationLink(value: PushedPage.legal) {
                    Text(loc.t("help.safetyLink"))
                        .font(.footnote.weight(.medium))
                        .foregroundStyle(.forest)
                }
                .buttonStyle(.plain)
                .padding(.top, 12)
            }
            .padding(20)
            .padding(.bottom, 40)
        }
        .background(Color.cream)
        .navigationTitle(loc.t("help.title"))
        .navigationBarTitleDisplayMode(.inline)
    }
}
