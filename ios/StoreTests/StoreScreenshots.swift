import XCTest

final class StoreScreenshots: XCTestCase {
    @MainActor
    func testCurrentStoreScreens() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .portrait
        let output = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("ottor-store")
        try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
        for language in ["en", "ru"] {
            let screens: [(String, [String])] = [
                ("01-gallery", []),
                ("02-catalog", ["-tab", "catalog"]),
                ("03-plant", ["-plant", "daylily"]),
                ("04-mongolia", []),
                ("05-news", [])
            ]
            for (name, arguments) in screens {
                let app = XCUIApplication()
                let country = name == "04-mongolia" ? "mongolia" : "yakutia"
                let screenLanguage = country == "mongolia" ? "en" : language
                app.launchArguments = ["-language", screenLanguage, "-theme", "light", "-country", country] + arguments
                app.launch()
                XCTAssertTrue(app.wait(for: .runningForeground, timeout: 20))
                XCTAssertTrue(app.staticTexts.firstMatch.waitForExistence(timeout: 20))
                if name == "05-news" {
                    let news = app.buttons[language == "ru" ? "Новости" : "News"].firstMatch
                    XCTAssertTrue(news.waitForExistence(timeout: 10))
                    news.tap()
                }
                // Allow native transitions and bundled WebP decoding to settle.
                Thread.sleep(forTimeInterval: 2)
                let screenshot = app.screenshot()
                let path = output.appendingPathComponent("\(language)-\(name).png")
                try screenshot.pngRepresentation.write(to: path)
                print("STORE_SHOT \(path.path)")
                let attachment = XCTAttachment(screenshot: screenshot)
                attachment.name = "\(language)-\(name)"
                attachment.lifetime = .keepAlways
                add(attachment)
                app.terminate()
            }
        }
    }
}
