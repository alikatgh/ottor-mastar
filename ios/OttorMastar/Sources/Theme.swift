import SwiftUI

// Herbarium tokens — the same palette as src/index.css @theme on the web.
// Hierarchy lives in weight + size, not color; ONE forest accent; hairline
// borders instead of shadows; category colors appear ONLY as 6pt dots.
extension Color {
    init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }

    static let cream = Color(hex: 0xF4F1E8)        // canvas
    static let creamDark = Color(hex: 0xE9E4D5)    // input fill / pressed tint
    static let card = Color.white
    static let parchment = Color(hex: 0xF9F4E9)    // botanical-plate backdrop

    static let ink = Color(hex: 0x201E19)
    static let inkLight = Color(hex: 0x4C4940)
    static let inkMuted = Color(hex: 0x837E70)

    static let forest = Color(hex: 0x2C5A2E)
    static let forestDark = Color(hex: 0x1E421F)

    static let amber = Color(hex: 0xE8963E)
    static let amberWarm = Color(hex: 0xB4691E)
    static let warnBg = Color(hex: 0xFFF7F2)

    static let hairline = Color(hex: 0x201E19).opacity(0.12)
    static let hairlineStrong = Color(hex: 0x201E19).opacity(0.22)

    static func category(_ id: String) -> Color {
        switch id {
        case "medicinal": return Color(hex: 0x3E7B3E)
        case "edible": return Color(hex: 0xB87A1F)
        case "ornamental": return Color(hex: 0x7C64AE)
        case "poisonous": return Color(hex: 0xB23B2E)
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
