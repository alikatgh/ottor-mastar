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

    let items: [ViewerItem]
    @State var index: Int
    var onOpenDetail: ((String) -> Void)?

    @State private var dragY: CGFloat = 0
    @State private var zoomed = false
    @State private var appeared = false

    private var loc: L10n { settings.loc }
    private var reduceMotion: Bool { settings.reduceMotion }
    private var item: ViewerItem { items[min(index, items.count - 1)] }

    private var backdropOpacity: Double { max(0.25, 1 - Double(dragY) / 320) }
    private var chromeOpacity: Double { max(0, 1 - Double(dragY) / 120) }
    private var dragScale: CGFloat { max(0.86, 1 - dragY / 360 * 0.14) }

    var body: some View {
        ZStack {
            backdrop
            pager
            chrome
        }
        .statusBarHidden()
        .opacity(appeared || reduceMotion ? 1 : 0)
        .onAppear {
            withAnimation(reduceMotion ? nil : .easeOut(duration: 0.2)) { appeared = true }
        }
    }

    // MARK: Backdrop — blurred image letterbox fill

    private var backdrop: some View {
        ZStack {
            Color(white: 0.04)
            BundledPlantImage(item: item, size: .medium)
                .scaledToFill()
                .scaleEffect(1.25)
                .blur(radius: 60)
                .opacity(0.6)
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

    private var pager: some View {
        TabView(selection: $index) {
            ForEach(Array(items.enumerated()), id: \.element.id) { i, entry in
                ZoomableImagePage(
                    item: entry,
                    zoomed: $zoomed,
                    appearSpring: !reduceMotion
                )
                .tag(i)
                .padding(.top, 56)
                .padding(.bottom, 120)
            }
        }
        .tabViewStyle(.page(indexDisplayMode: .never))
        .offset(y: dragY)
        .scaleEffect(dragScale)
        .simultaneousGesture(zoomed ? nil : dismissDrag)
        .ignoresSafeArea()
    }

    private var dismissDrag: some Gesture {
        DragGesture(minimumDistance: 18, coordinateSpace: .global)
            .onChanged { value in
                // Vertical intent only; horizontal swipes belong to the pager.
                let dy = value.translation.height
                let dx = value.translation.width
                guard abs(dy) > abs(dx) else { return }
                dragY = max(0, dy * (dy > 0 ? 1 : 0.08))
            }
            .onEnded { value in
                if dragY > 110 || value.predictedEndTranslation.height > 320 {
                    close(flung: true)
                } else {
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
            HStack {
                Text("\(index + 1) / \(items.count)")
                    .font(.subheadline.weight(.medium).monospacedDigit())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(.black.opacity(0.4), in: Capsule())
                Spacer()
                Button {
                    close()
                } label: {
                    Image(systemName: "xmark")
                        .font(.body.weight(.semibold))
                        .foregroundStyle(.white)
                        .frame(width: 40, height: 40)
                        .background(.black.opacity(0.4), in: Circle())
                }
                .accessibilityLabel(loc.t("common.close"))
            }
            .padding(.horizontal, 14)
            .padding(.top, 8)

            Spacer()

            caption
        }
        .opacity(chromeOpacity)
    }

    private var caption: some View {
        HStack(alignment: .bottom, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                if let kindLabel = item.kindLabel {
                    Text(kindLabel.uppercased())
                        .font(.caption2.weight(.semibold))
                        .tracking(1.4)
                        .foregroundStyle(.white.opacity(0.55))
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
                    HStack(spacing: 6) {
                        ForEach(item.badges, id: \.self) { cat in
                            CategoryBadge(category: cat, onDark: true)
                        }
                    }
                    .padding(.top, 6)
                }
            }
            Spacer(minLength: 0)
            if let slug = item.detailSlug, let onOpenDetail {
                Button {
                    dismiss()
                    onOpenDetail(slug)
                } label: {
                    HStack(spacing: 5) {
                        Text(loc.t("plant.details"))
                        Image(systemName: "arrow.up.right")
                    }
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.ink)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(.white, in: Capsule())
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 28)
        .padding(.top, 60)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [.clear, .black.opacity(0.85), .black],
                startPoint: .top, endPoint: .bottom
            )
            .ignoresSafeArea(edges: .bottom)
        )
        .animation(.easeOut(duration: 0.2), value: index)
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
struct ZoomableScrollView: UIViewRepresentable {
    let image: UIImage
    @Binding var zoomed: Bool

    func makeUIView(context: Context) -> UIScrollView {
        let scroll = UIScrollView()
        scroll.minimumZoomScale = 1
        scroll.maximumZoomScale = 6
        scroll.showsVerticalScrollIndicator = false
        scroll.showsHorizontalScrollIndicator = false
        scroll.delegate = context.coordinator
        scroll.contentInsetAdjustmentBehavior = .never
        scroll.backgroundColor = .clear
        scroll.bouncesZoom = true

        let imageView = UIImageView(image: image)
        imageView.contentMode = .scaleAspectFit
        imageView.translatesAutoresizingMaskIntoConstraints = false
        scroll.addSubview(imageView)
        context.coordinator.imageView = imageView

        NSLayoutConstraint.activate([
            imageView.widthAnchor.constraint(equalTo: scroll.frameLayoutGuide.widthAnchor),
            imageView.heightAnchor.constraint(equalTo: scroll.frameLayoutGuide.heightAnchor),
            imageView.centerXAnchor.constraint(equalTo: scroll.contentLayoutGuide.centerXAnchor),
            imageView.centerYAnchor.constraint(equalTo: scroll.contentLayoutGuide.centerYAnchor),
        ])

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
