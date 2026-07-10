import SwiftUI

enum ImageSize: String {
    case thumb, medium, full
}

enum ImageKind {
    case photo, plate

    func fileName(for plant: Plant) -> String {
        self == .plate ? "\(plant.imageId)-ill" : plant.imageId
    }
}

/// Resolves plant imagery: bundled webp first (thumb + medium ship in the
/// app — the guide must work offline, in the field), remote `full` from the
/// deployed site as the only network dependency.
enum ImageResolver {
    static func bundledPath(country: Country, plant: Plant, size: ImageSize, kind: ImageKind) -> String? {
        let base = country.imageBase.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        return Bundle.main.path(
            forResource: kind.fileName(for: plant),
            ofType: "webp",
            inDirectory: "PlantImages/\(base)/\(size.rawValue)"
        )
    }

    static func remoteURL(country: Country, plant: Plant, size: ImageSize, kind: ImageKind) -> URL? {
        URL(string: "\(PlantStore.data.imageHost)\(country.imageBase)/\(size.rawValue)/\(kind.fileName(for: plant)).webp")
    }

    /// Best locally-available image, decoded synchronously (call off-main).
    static func loadBundled(country: Country, plant: Plant, size: ImageSize, kind: ImageKind) -> UIImage? {
        guard let path = bundledPath(country: country, plant: plant, size: size, kind: kind) else {
            return nil
        }
        return UIImage(contentsOfFile: path)
    }
}

/// Decoded-image cache so grid scrolling never re-decodes webp files.
final class ImageMemoryCache {
    static let shared = NSCache<NSString, UIImage>()
}

/// "Ambient" letterbox fill (Photos/Music treatment): the dead space around
/// an aspect-fit image is filled with a blurred, scaled copy of the SAME
/// artwork, so panel margins inherit the plate's own palette instead of
/// sitting flat. The foreground image itself is never cropped or altered —
/// use this as the `.background(...)` of the fitted image.
struct AmbientImageFill: View {
    let country: Country
    let plant: Plant
    var kind: ImageKind = .photo
    /// Extra wash on top of the blur so foreground captions stay readable.
    var wash: Double = 0.2

    var body: some View {
        ZStack {
            Color.parchment
            PlantImageView(country: country, plant: plant, size: .thumb, kind: kind)
                .scaleEffect(1.35)
                .blur(radius: 44)
                .saturation(1.05)
                .opacity(0.85)
            Color.parchment.opacity(wash)
        }
        .clipped()
    }
}

/// Async-loading plant image: bundled file decoded off-main, remote fallback,
/// gentle fade-in. Placeholder is a bare parchment tone (no spinners in lists).
struct PlantImageView: View {
    let country: Country
    let plant: Plant
    let size: ImageSize
    var kind: ImageKind = .photo
    var contentMode: ContentMode = .fill

    @State private var image: UIImage?

    private var cacheKey: NSString {
        "\(country.id)/\(size.rawValue)/\(kind.fileName(for: plant))" as NSString
    }

    var body: some View {
        ZStack {
            Color.parchment
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: contentMode)
                    .transition(.opacity.animation(.easeOut(duration: 0.2)))
            }
        }
        .task(id: cacheKey) {
            if let cached = ImageMemoryCache.shared.object(forKey: cacheKey) {
                image = cached
                return
            }
            let key = cacheKey
            let ctry = country, plnt = plant, sz = size, knd = kind
            let loaded = await Task.detached(priority: .userInitiated) { () -> UIImage? in
                if let img = ImageResolver.loadBundled(country: ctry, plant: plnt, size: sz, kind: knd) {
                    return img
                }
                // Offline-first: thumb/medium ship in the bundle, so a miss there
                // means a genuinely absent asset — show the parchment placeholder,
                // never reach for the network (mirrors ImageViewer). Only `.full`
                // is a deliberate remote dependency.
                guard sz == .full,
                    let url = ImageResolver.remoteURL(country: ctry, plant: plnt, size: sz, kind: knd),
                    let (data, response) = try? await URLSession.shared.data(from: url),
                    (response as? HTTPURLResponse)?.statusCode == 200
                else {
                    return nil
                }
                return UIImage(data: data)
            }.value
            if let loaded {
                ImageMemoryCache.shared.setObject(loaded, forKey: key)
                image = loaded
            }
        }
    }
}
