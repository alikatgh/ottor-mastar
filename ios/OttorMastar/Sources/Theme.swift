import SwiftUI

// Herbarium tokens — the same palette as src/index.css @theme on the web,
// in light AND dark. Hierarchy lives in weight + size, not color; ONE forest
// accent; hairline borders instead of shadows; category colors appear ONLY as
// 6pt dots.
//
// Every token is a dynamic color resolved per trait collection, so the whole
// app flips with the system (or the in-app Appearance setting, applied as
// .preferredColorScheme at the root) with zero call-site changes.
extension UIColor {
    convenience init(hex: UInt32, alpha: CGFloat = 1) {
        self.init(
            red: CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255,
            alpha: alpha
        )
    }
}

extension Color {
    init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }

    /// Trait-resolved token: light/dark hex (+ per-mode alpha for hairlines).
    private static func dynamic(
        _ light: UInt32, _ dark: UInt32,
        lightAlpha: CGFloat = 1, darkAlpha: CGFloat = 1
    ) -> Color {
        Color(UIColor { trait in
            trait.userInterfaceStyle == .dark
                ? UIColor(hex: dark, alpha: darkAlpha)
                : UIColor(hex: light, alpha: lightAlpha)
        })
    }

    static let cream = dynamic(0xF4F1E8, 0x1A1914)        // canvas
    static let creamDark = dynamic(0xE9E4D5, 0x2A2820)    // input fill / pressed tint
    static let card = dynamic(0xFFFFFF, 0x23211B)
    static let parchment = dynamic(0xF9F4E9, 0x26231B)    // botanical-plate backdrop

    static let ink = dynamic(0x201E19, 0xECE8DC)
    static let inkLight = dynamic(0x4C4940, 0xC7C2B2)
    static let inkMuted = dynamic(0x837E70, 0x928C7B)

    static let forest = dynamic(0x2C5A2E, 0x7DB380)
    static let forestDark = dynamic(0x1E421F, 0x5E9861)

    static let amber = dynamic(0xE8963E, 0xE8A35C)
    static let amberWarm = dynamic(0xB4691E, 0xDFA05B)
    static let warnBg = dynamic(0xFFF7F2, 0x2C2318)

    static let hairline = dynamic(0x201E19, 0xECE8DC, lightAlpha: 0.12, darkAlpha: 0.14)
    static let hairlineStrong = dynamic(0x201E19, 0xECE8DC, lightAlpha: 0.22, darkAlpha: 0.26)

    static func category(_ id: String) -> Color {
        switch id {
        case "medicinal": return dynamic(0x3E7B3E, 0x6FAE6F)
        case "edible": return dynamic(0xB87A1F, 0xD9A452)
        case "ornamental": return dynamic(0x7C64AE, 0xA796D8)
        case "poisonous": return dynamic(0xB23B2E, 0xD97A6C)
        default: return .inkMuted
        }
    }
}

/// Letterspaced-uppercase section label over a hairline rule — the app's one
/// section-header idiom (never icon-next-to-heading).
struct OverlineLabel: View {
    let text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(text.uppercased())
                .font(.caption.weight(.semibold))
                .tracking(1.6)
                .foregroundStyle(.inkMuted)
            Rectangle().fill(Color.hairline).frame(height: 1)
        }
    }
}

extension ShapeStyle where Self == Color {
    static var cream: Color { .cream }
    static var parchment: Color { .parchment }
    static var ink: Color { .ink }
    static var inkLight: Color { .inkLight }
    static var inkMuted: Color { .inkMuted }
    static var forest: Color { .forest }
    static var hairline: Color { .hairline }
}

/// Hairline-bordered parchment surface for botanical plates.
struct PlateCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Color.parchment)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(Color.hairline, lineWidth: 1)
            )
    }
}

extension View {
    func plateCard() -> some View { modifier(PlateCard()) }

    /// Web `.plate-thumb`: source plates are square scans with wide aged-paper
    /// margins, so a plain fill leaves the drawing small and floaty. Zoom into
    /// the figure (1.34×, origin slightly above center) inside the clip.
    func plateThumbCrop() -> some View {
        scaleEffect(1.34, anchor: UnitPoint(x: 0.5, y: 0.38)).clipped()
    }
}

/// Category chip: hairline border + 6pt status dot; color carries the
/// category as a small signal, the text stays ink. `onDark` is the
/// white-outline variant for the full-screen viewer.
struct CategoryBadge: View {
    @EnvironmentObject var settings: AppSettings
    let category: String
    var onDark: Bool = false

    var body: some View {
        HStack(spacing: 5) {
            Circle().fill(Color.category(category)).frame(width: 6, height: 6)
            Text(settings.loc.t("categories.\(category)"))
                .font(.caption2.weight(.medium))
                .foregroundStyle(onDark ? Color.white.opacity(0.85) : .inkLight)
                // A pill must never break into two lines — long Sakha labels
                // ("Эмтээх оттор") were wrapping inside tight rows.
                .lineLimit(1)
        }
        .padding(.horizontal, 9)
        .padding(.vertical, 4)
        .background(
            Capsule().strokeBorder(
                onDark ? Color.white.opacity(0.3) : Color.hairline, lineWidth: 1)
        )
    }
}

/// Minimal flow layout: children keep their intrinsic size and wrap onto the
/// next line when the row is full — so category pills stay whole instead of
/// compressing/overflowing in an HStack (mirrors the web/Android chip rows).
struct FlowLayout: Layout {
    var spacing: CGFloat = 6

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var x: CGFloat = 0, y: CGFloat = 0, rowHeight: CGFloat = 0, maxX: CGFloat = 0
        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x > 0, x + spacing + size.width > maxWidth {
                x = 0; y += rowHeight + spacing; rowHeight = 0
            }
            if x > 0 { x += spacing }
            x += size.width
            maxX = max(maxX, x)
            rowHeight = max(rowHeight, size.height)
        }
        return CGSize(width: proposal.width ?? maxX, height: y + rowHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x: CGFloat = 0, y: CGFloat = 0, rowHeight: CGFloat = 0
        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x > 0, x + spacing + size.width > bounds.width {
                x = 0; y += rowHeight + spacing; rowHeight = 0
            }
            if x > 0 { x += spacing }
            view.place(at: CGPoint(x: bounds.minX + x, y: bounds.minY + y), proposal: .unspecified)
            x += size.width
            rowHeight = max(rowHeight, size.height)
        }
    }
}

// MARK: Liquid Glass adapters (iOS 26+, graceful fallback below)

extension View {
    /// Liquid Glass chrome in `shape` on iOS 26; below that, `fallback` (or
    /// ultra-thin material when nil). `tint` colors the glass for prominent
    /// actions; `interactive` adds the touch response for tappable chrome.
    @ViewBuilder
    func glassChrome<S: Shape>(
        in shape: S,
        tint: Color? = nil,
        interactive: Bool = false,
        fallback: Color? = nil
    ) -> some View {
        if #available(iOS 26.0, *) {
            glassEffect(.chrome(tint: tint, interactive: interactive), in: shape)
        } else if let fallback {
            background(fallback, in: shape)
        } else {
            background(.ultraThinMaterial, in: shape)
        }
    }
}

@available(iOS 26.0, *)
extension Glass {
    static func chrome(tint: Color?, interactive: Bool) -> Glass {
        var glass: Glass = .regular
        if let tint { glass = glass.tint(tint) }
        if interactive { glass = glass.interactive() }
        return glass
    }
}

/// Groups adjacent Liquid Glass elements so they blend/morph as one fluid
/// surface on iOS 26; transparent passthrough below.
struct GlassGroup<Content: View>: View {
    var spacing: CGFloat = 10
    @ViewBuilder var content: Content

    var body: some View {
        if #available(iOS 26.0, *) {
            GlassEffectContainer(spacing: spacing) { content }
        } else {
            content
        }
    }
}

// MARK: Button design system
// All tappable chrome uses these two styles (never the platform default —
// on Mac Catalyst the system bezel would override custom backgrounds and
// render gray blobs). Pills never change geometry on press, only tint.
// On iOS 26 both render as Liquid Glass capsules.

/// Secondary action: Liquid Glass capsule (26+) / hairline capsule with
/// pressed tint below.
struct PillButtonStyle: ButtonStyle {
    var onDark: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        let label = configuration.label
            .font(.subheadline.weight(.medium))
            .foregroundStyle(onDark ? Color.white : Color.ink)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
        return Group {
            if #available(iOS 26.0, *) {
                label.glassEffect(.chrome(tint: nil, interactive: true), in: Capsule())
            } else {
                label
                    .background(
                        Capsule().fill(
                            onDark
                                ? Color.white.opacity(configuration.isPressed ? 0.22 : 0.10)
                                : Color.creamDark.opacity(configuration.isPressed ? 1 : 0)
                        )
                    )
                    .overlay(
                        Capsule().strokeBorder(
                            onDark ? Color.white.opacity(0.28) : Color.hairline, lineWidth: 1)
                    )
            }
        }
        .contentShape(Capsule())
    }
}

/// Primary action: forest-tinted Liquid Glass capsule (26+) / solid forest
/// capsule below, white text on both.
struct ProminentPillButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        let label = configuration.label
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 18)
            .padding(.vertical, 11)
        return Group {
            if #available(iOS 26.0, *) {
                label.glassEffect(.chrome(tint: .forest, interactive: true), in: Capsule())
            } else {
                label.background(
                    Capsule().fill(configuration.isPressed ? Color.forestDark : Color.forest)
                )
            }
        }
        .contentShape(Capsule())
    }
}

/// Catalog filter chip background: forest-tinted Liquid Glass when active,
/// clear interactive glass when idle (26+); forest fill / hairline outline
/// below. Selection changes tint only — never geometry.
struct FilterChipBackground: ViewModifier {
    let active: Bool

    func body(content: Content) -> some View {
        if #available(iOS 26.0, *) {
            content.glassEffect(
                .chrome(tint: active ? .forest : nil, interactive: true), in: Capsule())
        } else {
            content
                .background(active ? Color.forest : .clear, in: Capsule())
                .overlay(
                    Capsule().strokeBorder(
                        active ? Color.forest : Color.hairline, lineWidth: 1)
                )
        }
    }
}

/// Chip row for category badges: whole pills that wrap to the next line.
struct BadgeRow: View {
    let categories: [String]
    var onDark: Bool = false

    var body: some View {
        FlowLayout(spacing: 6) {
            ForEach(categories, id: \.self) { cat in
                CategoryBadge(category: cat, onDark: onDark)
            }
        }
    }
}

/// Amber safety-note box with a link into the Legal page — the web's
/// footer/detail disclaimer card.
struct DisclaimerBox: View {
    @EnvironmentObject var settings: AppSettings
    var onOpenLegal: (() -> Void)?

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "info.circle")
                .font(.footnote)
                .foregroundStyle(.amberWarm)
                .padding(.top, 2)
            VStack(alignment: .leading, spacing: 6) {
                Text(settings.loc.t("common.disclaimerShort"))
                    .font(.caption)
                    .foregroundStyle(.inkLight)
                    .lineSpacing(3)
                if let onOpenLegal {
                    Button(settings.loc.t("common.readDisclaimer")) { onOpenLegal() }
                        .buttonStyle(.plain)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(.forest)
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.warnBg)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .strokeBorder(Color.amber.opacity(0.25), lineWidth: 1)
        )
    }
}

extension ShapeStyle where Self == Color {
    static var amberWarm: Color { .amberWarm }
    static var creamDark: Color { .creamDark }
}
