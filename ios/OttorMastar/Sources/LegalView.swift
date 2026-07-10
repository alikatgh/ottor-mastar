import SwiftUI

/// Legal & Privacy — full trilingual content ported verbatim from the web's
/// LegalPage (disclaimer / privacy / content & copyright).
struct LegalView: View {
    @EnvironmentObject var settings: AppSettings

    private var lang: Language { settings.language }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text(LegalContent.updated[lang] ?? "")
                    .font(.caption.weight(.medium))
                    .tracking(1.2)
                    .textCase(.uppercase)
                    .foregroundStyle(.inkMuted)
                Text(LegalContent.intro[lang] ?? "")
                    .font(.subheadline)
                    .foregroundStyle(.ink)
                    .lineSpacing(5)

                Rectangle().fill(Color.hairline).frame(height: 1)

                sectionCard(
                    heading: LegalContent.disclaimerHeading[lang] ?? "",
                    paragraphs: LegalContent.disclaimerBody[lang] ?? [],
                    warn: true
                )
                sectionCard(
                    heading: LegalContent.privacyHeading[lang] ?? "",
                    paragraphs: LegalContent.privacyBody[lang] ?? []
                )
                sectionCard(
                    heading: LegalContent.contentHeading[lang] ?? "",
                    paragraphs: LegalContent.contentBody[lang] ?? []
                )
            }
            .padding(20)
        }
        .background(Color.cream)
        .navigationTitle(LegalContent.title[lang] ?? "")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func sectionCard(heading: String, paragraphs: [String], warn: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(heading)
                .font(.system(.headline, design: .serif).weight(.semibold))
                .foregroundStyle(.ink)
            ForEach(Array(paragraphs.enumerated()), id: \.offset) { _, para in
                Text(para)
                    .font(.subheadline)
                    .foregroundStyle(.inkLight)
                    .lineSpacing(5)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(warn ? Color.warnBg : Color.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .strokeBorder(warn ? Color.amber.opacity(0.25) : Color.hairline, lineWidth: 1)
        )
    }
}

/// Verbatim trilingual legal copy — single source: src/pages/LegalPage.tsx.
enum LegalContent {
    static let title: [Language: String] = [
        .sah: "Сокуон уонна тус кистэлэҥ",
        .ru: "Правовая информация и конфиденциальность",
        .en: "Legal & Privacy",
    ]
    static let updated: [Language: String] = [
        .sah: "Саҥардылынна: 2026 сыл",
        .ru: "Обновлено: 2026 год",
        .en: "Last updated: 2026",
    ]
    static let intro: [Language: String] = [
        .sah: "Оттор Мастар — үөрэхтээһин уонна култуура бырайыага. Бу сыһыарыыны туһаныаххыт иннинэ бу сирэйи ааҕыҥ.",
        .ru: "«Оттор Мастар» — образовательный и культурный проект. Пожалуйста, ознакомьтесь с этой страницей перед использованием приложения.",
        .en: "Ottor Mastar is an educational and cultural project. Please read this page before using the application.",
    ]

    static let disclaimerHeading: [Language: String] = [
        .sah: "Эппиэтинэһи сүкпэт буолуу", .ru: "Отказ от ответственности", .en: "Disclaimer",
    ]
    static let disclaimerBody: [Language: [String]] = [
        .sah: [
            "Бу сыһыарыы биэрэр иһитиннэриитэ (ааттара, ойуулааһыннара, үүнэр сирдэрэ, норуот эмтиир туттуута) — үөрэхтээһин уонна билии тарҕатар сыаллаах эрэ.",
            "Бу эмчит сүбэтэ БУОЛБАТАХ. Ханнык баҕарар үүнээйини бэлиэтииргэ, хомуйарга, буһарарга эбэтэр сииргэ туһанымаҥ.",
            "Элбэх айылҕа үүнээйитэ дьааттаах, өлөрөр кыахтаах, уонна сиэнэр эбэтэр эмтээх отторго олус майгынныыр. Бу сыһыарыыга олоҕуран туох да үүнээйини сиэмэҥ, тутумаҥ, туттумаҥ — сыыһа быһаарыы ыар охсууга эбэтэр өлүүнү аҕалыан сөп.",
            "Норуот эмтиир туттуута култуура уонна устуоруйа туһугар эрэ суруллубут, сүбэ буолбатах. Доруобуйаҕытыгар туһаныаххыт иннинэ булгуччу бырааска көрдөрүҥ.",
            "Ааптардар уонна кыттыылаахтар бу сыһыарыы иһитиннэриитин туһаныыттан тахсар ханнык баҕарар сүтүккэ, охсууга, ыарыыга, дьааттаныыга эбэтэр алдьаныыга эппиэтинэс сүкпэттэр. Бэйэҕит сэрэниҥ.",
        ],
        .ru: [
            "Вся информация в этом приложении (названия, описания, места обитания, сведения о традиционном и лечебном применении) предоставляется исключительно в общеобразовательных и справочных целях.",
            "Это НЕ является медицинской, лечебной консультацией или советом по безопасности и не должно использоваться для определения, сбора, приготовления или употребления каких-либо растений.",
            "Многие дикорастущие растения ядовиты или смертельно опасны и внешне похожи на съедобные или лекарственные виды. Никогда не употребляйте, не трогайте и не используйте растения, полагаясь на это приложение. Ошибка в определении может привести к тяжёлым отравлениям или смерти.",
            "Сведения о народном и традиционном применении приведены исключительно из культурного и исторического интереса и не являются рекомендацией. Перед любым применением растений в лечебных целях обязательно проконсультируйтесь с квалифицированным врачом.",
            "Авторы и участники проекта не несут никакой ответственности за любой ущерб, вред здоровью, болезнь, отравление или убытки, прямо или косвенно связанные с использованием информации из этого приложения или доверием к ней. Вы используете эту информацию исключительно на свой страх и риск.",
        ],
        .en: [
            "All information in this application (names, descriptions, habitats, and notes on traditional or medicinal use) is provided for general educational and reference purposes only.",
            "It is NOT medical, health, or safety advice, and must not be used to identify, gather, prepare, or consume any plant.",
            "Many wild plants are toxic or deadly and closely resemble edible or medicinal species. Never eat, touch, or use any plant based on this application. Misidentification can cause serious injury or death.",
            "Traditional and folk uses are recorded for cultural and historical interest only and are not a recommendation. Always consult a qualified medical professional before using any plant for health purposes.",
            "The authors and contributors accept no responsibility or liability whatsoever for any loss, injury, illness, poisoning, or damage arising directly or indirectly from the use of, or reliance on, any information in this application. You use this information entirely at your own risk.",
        ],
    ]

    static let privacyHeading: [Language: String] = [
        .sah: "Тус дааннайдары харыстааһын", .ru: "Политика конфиденциальности", .en: "Privacy Policy",
    ]
    static let privacyBody: [Language: [String]] = [
        .sah: [
            "«Оттор Мастар» туох да тус дааннайдары хомуйбат, харайбат уонна ыыппат. Бэлиэтэнии, киирии, реклама эбэтэр кэтээн көрүү суох.",
            "Соҕотох харайыллара — эһиги талбыт тылгыт уонна туруоруугут, ол тэрилгит иһигэр эрэ хараллар. Ол тэрилгититтэн тахсыбат уонна ханнык баҕарар кэмҥэ туруорууларынан сотуллуон сөп.",
            "Кэтээн көрөр cookie туттуллубат. Эһигини билэр аналитика хомуллубат.",
            "Бу сыһыарыы эһиги дааннайгытын таска ыытпат.",
        ],
        .ru: [
            "«Оттор Мастар» не собирает, не хранит и не передаёт никаких персональных данных. Нет учётных записей, входа, рекламы и стороннего отслеживания.",
            "Единственное, что сохраняется, — выбранный вами язык интерфейса и настройки, которые хранятся локально на вашем устройстве, чтобы приложение помнило ваш выбор. Эти данные не покидают ваше устройство и могут быть удалены в любой момент.",
            "Отслеживающие cookie не используются. Аналитика, идентифицирующая вас, не собирается.",
            "Приложение не отправляет внешних сетевых запросов с вашими данными.",
        ],
        .en: [
            "Ottor Mastar does not collect, store, or share any personal data. There are no user accounts, no sign-in, no advertising, and no third-party tracking.",
            "The only thing stored is your chosen interface language and settings, kept locally on your device so the app remembers your preference. This never leaves your device and can be cleared at any time.",
            "No tracking cookies are used. No analytics that identify you are collected.",
            "The app makes no external network requests carrying your data.",
        ],
    ]

    static let contentHeading: [Language: String] = [
        .sah: "Иһинээҕитэ уонна ааптар бырааба", .ru: "Контент и авторские права", .en: "Content & copyright",
    ]
    static let contentBody: [Language: [String]] = [
        .sah: [
            "Ботаника ойуулара уонна хаартыскалара үөрэхтээһин уонна култуура сыалыгар туттуллаллар. Үүнээйилэр быһаарыылара уопсай ботаника билиитин уонна саха норуотун үгэстэрин холбууллар.",
            "Ботаника ойуулара — көрдөрөр сыаллаах эрэ, көмпүүтэринэн оҥоһуллубут стильлээх ойуулар; кинилэргэ көстөр ааттар, дьыллар уонна ыйынньыктар киэргэтии эрэ буолаллар, туспа устуоруйалаах үлэлэри кытта сибээстэспэттэр.",
            "© 2026 Оттор Мастар.",
        ],
        .ru: [
            "Ботанические иллюстрации и фотографии используются в образовательных и культурных целях. Описания растений сочетают общие ботанические сведения и якутскую (саха) народную традицию.",
            "Ботанические иллюстрации представляют собой стилизованные, созданные цифровым способом изображения исключительно для наглядности; приведённые на них подписи, даты и ссылки носят декоративный характер и не отсылают к конкретным историческим изданиям.",
            "© 2026 Оттор Мастар.",
        ],
        .en: [
            "Botanical illustrations and photographs are used for educational and cultural purposes. Plant descriptions combine general botanical knowledge with Yakut (Sakha) folk tradition.",
            "The botanical illustrations are stylised, digitally-created plates for visual reference only; any captions, dates, or citations shown on them are decorative and are not references to specific historical works.",
            "© 2026 Ottor Mastar.",
        ],
    ]
}
