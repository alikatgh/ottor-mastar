import SwiftUI
import UIKit

/// One viewer entry: which image, plus the editorial caption fields
/// (kind overline, serif title, italic Latin, category badges, Details link).
struct ViewerItem: Identifiable {
    let country: Country
    let plant: Plant
    let kind: ImageKind
    let title: String
    let subtitle: String?
    let kindLabel: String?
    let badges: [String]
    var detailSlug: String?

    var id: String { "\(plant.slug)-\(kind == .plate ? "plate" : "photo")" }
}

/// Full-screen viewer with iOS-Photos motion, 1:1 with the web ImageViewer:
/// - blurred copy of the image fills the letterbox over a near-black base
/// - springy scale-up on open; swipe DOWN (not zoomed) drags the image with
///   the finger while backdrop and chrome fade — release past the threshold
///   dismisses, otherwise it springs back
/// - horizontal paging across items, pinch/double-tap zoom per page
/// - counter chip, close button, always-visible caption panel.
struct ImageViewer: View {
    @EnvironmentObject var settings: AppSettings
    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL
    @Environment(\.horizontalSizeClass) private var hSizeClass

    let items: [ViewerItem]
    @State var index: Int
    var onOpenDetail: ((String) -> Void)?

    @State private var dragY: CGFloat = 0
    @State private var zoomed = false
    @State private var appeared = false

    private var loc: L10n { settings.loc }
    private var reduceMotion: Bool { settings.reduceMotion }
    private var lang: Language { settings.language }
    /// Regular width (iPad, large multitasking) shows the "museum placard"
    /// two-column layout — image beside a metadata panel, 1:1 with the web
    /// desktop viewer. Compact (iPhone) keeps the single-column bottom caption.
    private var isWide: Bool { hSizeClass == .regular }
    /// Nil only if presented with no items — the body dismisses in that case,
    /// so downstream chrome never indexes an empty array.
    private var item: ViewerItem? {
        guard !items.isEmpty else { return nil }
        return items[min(max(index, 0), items.count - 1)]
    }

    private var backdropOpacity: Double { max(0.25, 1 - Double(dragY) / 320) }
    private var chromeOpacity: Double { max(0, 1 - Double(dragY) / 120) }
    private var dragScale: CGFloat { max(0.86, 1 - dragY / 360 * 0.14) }

    var body: some View {
        ZStack {
            if item != nil {
                backdrop
                if isWide {
                    // Museum placard: image region + metadata panel beside it.
                    HStack(spacing: 0) {
                        pager
                        placardPanel
                    }
                } else {
                    pager
                }
            } else {
                // Defensive: never present the viewer with no images.
                Color.black.ignoresSafeArea()
            }
        }
        // Chrome rides as an overlay pinned to the container's bounds — as a
        // plain ZStack sibling it silently failed to render on regular width
        // (the iPad viewer shipped with no close button).
        .overlay {
            if item != nil { chrome }
        }
        .statusBarHidden()
        .opacity(appeared || reduceMotion ? 1 : 0)
        .onAppear {
            guard item != nil else { dismiss(); return }
            withAnimation(reduceMotion ? nil : .spring(response: 0.35, dampingFraction: 0.85)) {
                appeared = true
            }
        }
        // Paging to another image resets any pinch-zoom, so the swipe-down
        // dismiss gesture re-arms on the fresh page.
        .onChange(of: index) { zoomed = false }
        // Zooming mid-drag must never strand a half-dismissed layout: the
        // drag gesture stays attached (it self-guards), and any leftover
        // offset springs home the moment zoom starts.
        .onChange(of: zoomed) {
            if zoomed, dragY != 0 {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) { dragY = 0 }
            }
        }
        // Photos-style paging tick.
        .sensoryFeedback(.impact(weight: .light), trigger: index)
    }

    // MARK: Backdrop — blurred image letterbox fill

    private var backdrop: some View {
        ZStack {
            // The blurred fill hangs off an .overlay of the Color so its
            // scaledToFill size can NEVER inflate this ZStack's layout —
            // an unclipped fill here grew the whole viewer past the screen
            // bounds on iPad, shoving the top chrome (close button) offscreen.
            Color(white: 0.04)
                .overlay {
                    if let item {
                        BundledPlantImage(item: item, size: .medium)
                            .scaledToFill()
                            .scaleEffect(1.25)
                            .blur(radius: 60)
                            .opacity(0.6)
                    }
                }
                .clipped()
            LinearGradient(
                stops: [
                    .init(color: .black.opacity(0.45), location: 0),
                    .init(color: .black.opacity(0.25), location: 0.5),
                    .init(color: .black.opacity(0.7), location: 1),
                ],
                startPoint: .top, endPoint: .bottom
            )
        }
        .ignoresSafeArea()
        .opacity(backdropOpacity)
        .animation(.easeOut(duration: 0.25), value: index)
    }

    // MARK: Pager — swipe between items, zoom within one, drag down to close

    @ViewBuilder
    private var pager: some View {
        #if targetEnvironment(macCatalyst)
        // UIPageViewController paging (TabView .page) is broken under the Mac
        // idiom — pages render mispositioned or not at all. Show the current
        // item directly and page with arrow buttons / arrow keys instead.
        ZStack {
            if let item {
                ZoomableImagePage(
                    item: item,
                    zoomed: $zoomed,
                    appearSpring: !reduceMotion
                )
                .id(index) // fresh page (and zoom reset) per item
                .padding(.top, 56)
                .padding(.bottom, isWide ? 40 : 120)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .overlay(alignment: .leading) {
            if index > 0 { pageArrow(systemName: "chevron.left") { index -= 1 } }
        }
        .overlay(alignment: .trailing) {
            if index < items.count - 1 { pageArrow(systemName: "chevron.right") { index += 1 } }
        }
        .offset(y: dragY)
        .scaleEffect(dragScale)
        .simultaneousGesture(dismissDrag)
        .ignoresSafeArea()
        #else
        TabView(selection: $index) {
            ForEach(Array(items.enumerated()), id: \.element.id) { i, entry in
                ZoomableImagePage(
                    item: entry,
                    zoomed: $zoomed,
                    appearSpring: !reduceMotion
                )
                .tag(i)
                .padding(.top, 56)
                // Wide mode's metadata lives in the side panel, so the image
                // only needs the top-bar reserve. Compact reserves the whole
                // filmstrip + caption zone so the photo never underlaps the
                // scrubber (thumbs over a bright photo are unreadable).
                .padding(.bottom, isWide ? 40 : (items.count > 1 ? 196 : 140))
            }
        }
        .tabViewStyle(.page(indexDisplayMode: .never))
        // Fill the remaining width so, beside the fixed-width placard in the
        // wide HStack, the TabView doesn't collapse or over-size.
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .offset(y: dragY)
        .scaleEffect(dragScale)
        .simultaneousGesture(dismissDrag)
        .ignoresSafeArea()
        #endif
    }

    /// Round paging chevron (Mac pager). Plain style — never the system bezel.
    private func pageArrow(systemName: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.title3.weight(.semibold))
                .foregroundStyle(.white)
                .frame(width: 44, height: 44)
                .glassChrome(in: Circle(), interactive: true, fallback: .black.opacity(0.4))
        }
        .buttonStyle(.plain)
        .padding(.horizontal, 16)
    }

    /// Always attached (never swapped out mid-flight — detaching a live
    /// gesture skips onEnded and strands dragY); guards on `zoomed` inside.
    private var dismissDrag: some Gesture {
        DragGesture(minimumDistance: 18, coordinateSpace: .global)
            .onChanged { value in
                guard !zoomed else { return }
                // Vertical intent only; horizontal swipes belong to the pager.
                let dy = value.translation.height
                let dx = value.translation.width
                guard abs(dy) > abs(dx) else { return }
                dragY = max(0, dy * (dy > 0 ? 1 : 0.08))
            }
            .onEnded { value in
                if !zoomed, dragY > 110 || value.predictedEndTranslation.height > 320 {
                    close(flung: true)
                } else if dragY != 0 {
                    withAnimation(.spring(response: 0.32, dampingFraction: 0.82)) { dragY = 0 }
                }
            }
    }

    private func close(flung: Bool = false) {
        if reduceMotion {
            dismiss()
            return
        }
        withAnimation(.easeOut(duration: 0.22)) {
            appeared = false
            if flung { dragY += 320 }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.22) { dismiss() }
    }

    // MARK: Chrome — counter, close, caption

    private var chrome: some View {
        VStack {
            // Plain HStack, deliberately not a GlassEffectContainer: the
            // counter and close sit at opposite screen edges (nothing to
            // morph), and the container collapsed the bar on regular width —
            // the iPad viewer shipped with NO close button.
            HStack {
                // Wide mode carries the counter in the placard, so the top bar
                // stays clean with just the close button (matches web desktop).
                if !isWide {
                    Text("\(index + 1) / \(items.count)")
                        .font(.subheadline.weight(.medium).monospacedDigit())
                        .foregroundStyle(.white)
                        .contentTransition(.numericText())
                        .animation(reduceMotion ? nil : .snappy(duration: 0.25), value: index)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .glassChrome(in: Capsule(), fallback: .black.opacity(0.4))
                }
                Spacer()
                Button {
                    close()
                } label: {
                    Image(systemName: "xmark")
                        .font(.body.weight(.semibold))
                        .foregroundStyle(.white)
                        .frame(width: 40, height: 40)
                        .glassChrome(in: Circle(), interactive: true, fallback: .black.opacity(0.4))
                }
                .buttonStyle(.plain)
                .accessibilityLabel(loc.t("common.close"))
            }
            .padding(.horizontal, 14)
            .padding(.top, 8)

            Spacer()

            if !isWide {
                // Filmstrip + caption share one gradient scrim so the strip
                // reads against busy photos instead of floating bare. Identity
                // swaps with the item so text never frame-morphs across pages.
                VStack(spacing: 2) {
                    if items.count > 1 { filmstrip }
                    caption
                }
                .id(item?.id)
                // Top inset gives the scrim room to ramp up before the
                // filmstrip, so thumbs never melt into a bright photo.
                .padding(.top, 28)
                .background(
                    LinearGradient(
                        stops: [
                            .init(color: .clear, location: 0),
                            .init(color: .black.opacity(0.55), location: 0.28),
                            .init(color: .black.opacity(0.92), location: 1),
                        ],
                        startPoint: .top, endPoint: .bottom
                    )
                    .ignoresSafeArea(edges: .bottom)
                )
            }
        }
        // Zoomed = immersive: all chrome yields to the image (Photos rule);
        // drag-to-dismiss fades it proportionally otherwise.
        .opacity(zoomed ? 0 : chromeOpacity)
        .animation(.easeOut(duration: 0.2), value: zoomed)
        .allowsHitTesting(!zoomed)
    }

    /// Photos-style thumbnail scrubber: tap to jump, auto-centers on the
    /// current page. Selection changes only opacity and ring — never geometry.
    private var filmstrip: some View {
        ScrollViewReader { proxy in
            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 4) {
                    ForEach(Array(items.enumerated()), id: \.element.id) { i, entry in
                        Button {
                            withAnimation(reduceMotion ? nil : .snappy(duration: 0.25)) {
                                index = i
                            }
                        } label: {
                            BundledPlantImage(item: entry, size: .thumb)
                                .scaledToFill()
                                .frame(width: 34, height: 46)
                                .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))
                                .opacity(index == i ? 1 : 0.45)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 7, style: .continuous)
                                        .strokeBorder(
                                            .white.opacity(index == i ? 0.9 : 0), lineWidth: 1.5)
                                )
                        }
                        .buttonStyle(.plain)
                        .id(i)
                    }
                }
                .padding(.horizontal, 20)
            }
            .frame(height: 50)
            .onChange(of: index) {
                withAnimation(reduceMotion ? nil : .snappy(duration: 0.3)) {
                    proxy.scrollTo(index, anchor: .center)
                }
            }
            .onAppear { proxy.scrollTo(index, anchor: .center) }
        }
    }

    private var caption: some View {
        // `item` is optional only to guard the empty-viewer case; the body
        // renders chrome only when non-nil, so unwrap once here.
        Group {
            if let item {
                HStack(alignment: .center, spacing: 16) {
                    VStack(alignment: .leading, spacing: 5) {
                        if let kindLabel = item.kindLabel {
                            Text(kindLabel.uppercased())
                                .font(.caption2.weight(.semibold))
                                .tracking(1.4)
                                .foregroundStyle(.white.opacity(0.55))
                                .padding(.bottom, 3)
                        }
                        Text(item.title)
                            .font(.system(.title2, design: .serif).weight(.semibold))
                            .foregroundStyle(.white)
                        if let subtitle = item.subtitle {
                            Text(subtitle)
                                .font(.subheadline.italic())
                                .foregroundStyle(.white.opacity(0.65))
                                .lineLimit(1)
                        }
                        if !item.badges.isEmpty {
                            BadgeRow(categories: item.badges, onDark: true)
                                .padding(.top, 9)
                        }
                    }

                    Spacer(minLength: 12)

                    // ONE action, centered beside the text — two stacked arrow
                    // buttons on the baseline read as duplicates and crowded
                    // the bottom edge. Details wins; the Wikipedia pill only
                    // appears where Details isn't available (detail-page
                    // viewer, where Wikipedia lives on the page below anyway).
                    if let slug = item.detailSlug, let onOpenDetail {
                        Button {
                            dismiss()
                            onOpenDetail(slug)
                        } label: {
                            HStack(spacing: 5) {
                                Text(loc.t("plant.details"))
                                    .lineLimit(1)
                                Image(systemName: "arrow.up.right")
                            }
                            // A pill never wraps ("Сиһилии" was breaking in two).
                            .fixedSize()
                        }
                        .buttonStyle(ProminentPillButtonStyle())
                    } else if let wiki = item.plant.wikipediaURL(for: lang) {
                        Button {
                            openURL(wiki)
                        } label: {
                            HStack(spacing: 5) {
                                Text(verbatim: "Wikipedia")
                                    .lineLimit(1)
                                Image(systemName: "arrow.up.right")
                            }
                            .fixedSize()
                        }
                        .buttonStyle(PillButtonStyle(onDark: true))
                        .accessibilityLabel(loc.t("plant.readOnWikipedia"))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                // Generous floor clearance — badges were grazing the screen
                // edge whenever the title or badge row wrapped to two lines.
                .padding(.bottom, 48)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    // MARK: Placard panel (wide layouts) — the metadata column beside the image

    private var placardPanel: some View {
        Group {
            if let item {
                VStack(alignment: .leading, spacing: 0) {
                    Spacer(minLength: 0)

                    if let kindLabel = item.kindLabel {
                        Text(kindLabel.uppercased())
                            .font(.caption.weight(.semibold))
                            .tracking(1.6)
                            .foregroundStyle(.white.opacity(0.5))
                            .padding(.bottom, 12)
                    }
                    Text(item.title)
                        .font(.system(size: 42, weight: .semibold, design: .serif))
                        .foregroundStyle(.white)
                        .fixedSize(horizontal: false, vertical: true)
                    if let subtitle = item.subtitle {
                        Text(subtitle)
                            .font(.title3.italic())
                            .foregroundStyle(.white.opacity(0.6))
                            .padding(.top, 8)
                    }
                    if !item.badges.isEmpty {
                        BadgeRow(categories: item.badges, onDark: true)
                            .padding(.top, 22)
                    }

                    if item.plant.wikipediaURL(for: lang) != nil
                        || (item.detailSlug != nil && onOpenDetail != nil) {
                        Rectangle()
                            .fill(.white.opacity(0.1))
                            .frame(height: 1)
                            .padding(.top, 28)
                            .padding(.bottom, 20)

                        if let wiki = item.plant.wikipediaURL(for: lang) {
                            Button { openURL(wiki) } label: {
                                HStack(spacing: 12) {
                                    Image(systemName: "arrow.up.right.square")
                                        .font(.body.weight(.medium))
                                        .foregroundStyle(.white.opacity(0.7))
                                    VStack(alignment: .leading, spacing: 1) {
                                        Text(loc.t("plant.readOnWikipedia"))
                                            .font(.subheadline.weight(.medium))
                                            .foregroundStyle(.white)
                                        Text("\(lang.rawValue).wikipedia.org")
                                            .font(.caption.monospacedDigit())
                                            .foregroundStyle(.white.opacity(0.45))
                                    }
                                    Spacer(minLength: 0)
                                    Image(systemName: "arrow.up.right")
                                        .font(.caption)
                                        .foregroundStyle(.white.opacity(0.4))
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 12)
                                .background(.white.opacity(0.05), in: RoundedRectangle(cornerRadius: 12))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(.white.opacity(0.15), lineWidth: 1)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                        if let slug = item.detailSlug, let onOpenDetail {
                            Button {
                                dismiss()
                                onOpenDetail(slug)
                            } label: {
                                HStack(spacing: 6) {
                                    Text(loc.t("plant.details"))
                                    Image(systemName: "arrow.up.right")
                                }
                                .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(ProminentPillButtonStyle())
                            .padding(.top, 10)
                        }
                    }

                    Text("\(String(format: "%02d", index + 1)) / \(String(format: "%02d", items.count))")
                        .font(.caption.monospacedDigit())
                        .tracking(2)
                        .foregroundStyle(.white.opacity(0.35))
                        .padding(.top, 28)

                    Spacer(minLength: 0)
                }
                .frame(width: 360, alignment: .leading)
                .frame(maxHeight: .infinity)
                .padding(.horizontal, 36)
                .background(.black.opacity(0.55))
                .overlay(alignment: .leading) {
                    Rectangle().fill(.white.opacity(0.1)).frame(width: 1)
                }
                .ignoresSafeArea()
            }
        }
    }
}

/// Synchronously-bundled image (medium), used for the blurred backdrop where
/// async loading would flash.
private struct BundledPlantImage: View {
    let item: ViewerItem
    let size: ImageSize

    var body: some View {
        if let ui = ImageResolver.loadBundled(
            country: item.country, plant: item.plant, size: size, kind: item.kind)
        {
            Image(uiImage: ui).resizable()
        } else {
            Color(white: 0.08)
        }
    }
}

/// One zoomable page: bundled medium shows instantly, the remote full-res
/// file swaps in silently when it arrives. Pinch + double-tap via UIScrollView
/// (the reliable way), with a Photos-style settle spring on first appear.
private struct ZoomableImagePage: View {
    let item: ViewerItem
    @Binding var zoomed: Bool
    let appearSpring: Bool

    @State private var image: UIImage?
    @State private var settled = false

    var body: some View {
        Group {
            if let image {
                ZoomableScrollView(image: image, zoomed: $zoomed)
                    .scaleEffect(settled || !appearSpring ? 1 : 0.94)
                    .opacity(settled || !appearSpring ? 1 : 0)
            } else {
                ProgressView().tint(.white)
            }
        }
        .task {
            let it = item
            let bundled = await Task.detached(priority: .userInitiated) {
                ImageResolver.loadBundled(country: it.country, plant: it.plant, size: .medium, kind: it.kind)
            }.value
            if let bundled { image = bundled }
            withAnimation(.spring(response: 0.3, dampingFraction: 0.85)) { settled = true }

            if let url = ImageResolver.remoteURL(country: it.country, plant: it.plant, size: .full, kind: it.kind),
                let (data, response) = try? await URLSession.shared.data(from: url),
                (response as? HTTPURLResponse)?.statusCode == 200,
                let full = UIImage(data: data)
            {
                image = full
            }
        }
    }
}

/// UIScrollView-backed pinch/double-tap zoom with correct centering.
///
/// Layout is FRAME-based inside `layoutSubviews`, not Auto Layout: pinning the
/// image view to the scroll view's layout guides resolves against stale/zero
/// bounds under Mac Catalyst, leaving the image tiny in the top-left corner.
/// Frame-based sizing tracks every resize (including live window resizing on
/// the Mac) and behaves identically on iOS.
final class FitZoomScrollView: UIScrollView {
    let imageView = UIImageView()

    override func layoutSubviews() {
        super.layoutSubviews()
        // At rest (no zoom), the image view always fills the current bounds.
        if zoomScale == 1, imageView.frame.size != bounds.size {
            imageView.frame = CGRect(origin: .zero, size: bounds.size)
            contentSize = bounds.size
        }
        centerContent()
    }

    /// Keep the (aspect-fit) content centered while it is smaller than bounds.
    func centerContent() {
        let dx = max(0, (bounds.width - contentSize.width) / 2)
        let dy = max(0, (bounds.height - contentSize.height) / 2)
        contentInset = UIEdgeInsets(top: dy, left: dx, bottom: dy, right: dx)
    }
}

struct ZoomableScrollView: UIViewRepresentable {
    let image: UIImage
    @Binding var zoomed: Bool

    func makeUIView(context: Context) -> UIScrollView {
        let scroll = FitZoomScrollView()
        scroll.minimumZoomScale = 1
        scroll.maximumZoomScale = 6
        scroll.showsVerticalScrollIndicator = false
        scroll.showsHorizontalScrollIndicator = false
        scroll.delegate = context.coordinator
        scroll.contentInsetAdjustmentBehavior = .never
        scroll.backgroundColor = .clear
        scroll.bouncesZoom = true

        scroll.imageView.image = image
        scroll.imageView.contentMode = .scaleAspectFit
        scroll.addSubview(scroll.imageView)
        context.coordinator.imageView = scroll.imageView

        let doubleTap = UITapGestureRecognizer(
            target: context.coordinator, action: #selector(Coordinator.handleDoubleTap(_:)))
        doubleTap.numberOfTapsRequired = 2
        scroll.addGestureRecognizer(doubleTap)
        return scroll
    }

    func updateUIView(_ scroll: UIScrollView, context: Context) {
        context.coordinator.imageView?.image = image
        context.coordinator.onZoomChange = { zoomed = $0 }
    }

    func makeCoordinator() -> Coordinator { Coordinator() }

    final class Coordinator: NSObject, UIScrollViewDelegate {
        var imageView: UIImageView?
        var onZoomChange: ((Bool) -> Void)?

        func viewForZooming(in scrollView: UIScrollView) -> UIView? { imageView }

        func scrollViewDidZoom(_ scrollView: UIScrollView) {
            (scrollView as? FitZoomScrollView)?.centerContent()
            onZoomChange?(scrollView.zoomScale > 1.02)
        }

        @objc func handleDoubleTap(_ gesture: UITapGestureRecognizer) {
            guard let scroll = gesture.view as? UIScrollView else { return }
            if scroll.zoomScale > 1 {
                scroll.setZoomScale(1, animated: true)
            } else {
                let point = gesture.location(in: imageView)
                let size = CGSize(
                    width: scroll.bounds.width / 2.4, height: scroll.bounds.height / 2.4)
                scroll.zoom(
                    to: CGRect(
                        x: point.x - size.width / 2, y: point.y - size.height / 2,
                        width: size.width, height: size.height),
                    animated: true)
            }
        }
    }
}
