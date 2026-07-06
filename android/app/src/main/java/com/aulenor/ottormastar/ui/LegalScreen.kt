package com.aulenor.ottormastar.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aulenor.ottormastar.data.Language
import com.aulenor.ottormastar.data.LocalSettings

/**
 * Legal & Privacy — full trilingual content ported verbatim from the web's
 * LegalPage (disclaimer / privacy / content & copyright).
 */
@Composable
fun LegalScreen(onBack: () -> Unit) {
    val settings = LocalSettings.current
    val lang = settings.language

    Column(Modifier.fillMaxSize()) {
        // Compact header with back affordance, like the web's sticky header.
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .background(Cream)
                .padding(horizontal = 8.dp, vertical = 6.dp),
        ) {
            Text(
                "←",
                style = MaterialTheme.typography.titleLarge,
                color = InkLight,
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable { onBack() }
                    .padding(12.dp),
            )
            Text(
                LegalContent.title(lang),
                style = MaterialTheme.typography.titleLarge,
                color = Ink,
                modifier = Modifier.padding(start = 4.dp),
            )
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))

        Column(
            Modifier
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            Text(
                LegalContent.updated(lang).uppercase(),
                style = MaterialTheme.typography.labelMedium.copy(letterSpacing = 1.2.sp),
                color = InkMuted,
            )
            Text(
                LegalContent.intro(lang),
                style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 22.sp),
                color = Ink,
            )
            Box(Modifier.fillMaxWidth().height(1.dp).background(Hairline))

            SectionCard(LegalContent.disclaimerHeading(lang), LegalContent.disclaimerBody(lang), warn = true)
            SectionCard(LegalContent.privacyHeading(lang), LegalContent.privacyBody(lang))
            SectionCard(LegalContent.contentHeading(lang), LegalContent.contentBody(lang))
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun SectionCard(heading: String, paragraphs: List<String>, warn: Boolean = false) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(if (warn) WarnBg else Card)
            .border(
                1.dp,
                if (warn) Amber.copy(alpha = 0.25f) else Hairline,
                RoundedCornerShape(16.dp),
            )
            .padding(20.dp),
    ) {
        Text(
            heading,
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            color = Ink,
        )
        for (para in paragraphs) {
            Text(
                para,
                style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 22.sp),
                color = InkLight,
            )
        }
    }
}

/** Verbatim trilingual legal copy — single source: src/pages/LegalPage.tsx. */
object LegalContent {
    fun title(l: Language) = when (l) {
        Language.SAH -> "Сокуон уонна тус кистэлэҥ"
        Language.RU -> "Правовая информация и конфиденциальность"
        Language.EN -> "Legal & Privacy"
    }

    fun updated(l: Language) = when (l) {
        Language.SAH -> "Саҥардылынна: 2026 сыл"
        Language.RU -> "Обновлено: 2026 год"
        Language.EN -> "Last updated: 2026"
    }

    fun intro(l: Language) = when (l) {
        Language.SAH -> "Оттор Мастар — үөрэхтээһин уонна култуура бырайыага. Бу сыһыарыыны туһаныаххыт иннинэ бу сирэйи ааҕыҥ."
        Language.RU -> "«Оттор Мастар» — образовательный и культурный проект. Пожалуйста, ознакомьтесь с этой страницей перед использованием приложения."
        Language.EN -> "Ottor Mastar is an educational and cultural project. Please read this page before using the application."
    }

    fun disclaimerHeading(l: Language) = when (l) {
        Language.SAH -> "Эппиэтинэһи сүкпэт буолуу"
        Language.RU -> "Отказ от ответственности"
        Language.EN -> "Disclaimer"
    }

    fun disclaimerBody(l: Language): List<String> = when (l) {
        Language.SAH -> listOf(
            "Бу сыһыарыы биэрэр иһитиннэриитэ (ааттара, ойуулааһыннара, үүнэр сирдэрэ, норуот эмтиир туттуута) — үөрэхтээһин уонна билии тарҕатар сыаллаах эрэ.",
            "Бу эмчит сүбэтэ БУОЛБАТАХ. Ханнык баҕарар үүнээйини бэлиэтииргэ, хомуйарга, буһарарга эбэтэр сииргэ туһанымаҥ.",
            "Элбэх айылҕа үүнээйитэ дьааттаах, өлөрөр кыахтаах, уонна сиэнэр эбэтэр эмтээх отторго олус майгынныыр. Бу сыһыарыыга олоҕуран туох да үүнээйини сиэмэҥ, тутумаҥ, туттумаҥ — сыыһа быһаарыы ыар охсууга эбэтэр өлүүнү аҕалыан сөп.",
            "Норуот эмтиир туттуута култуура уонна устуоруйа туһугар эрэ суруллубут, сүбэ буолбатах. Доруобуйаҕытыгар туһаныаххыт иннинэ булгуччу бырааска көрдөрүҥ.",
            "Ааптардар уонна кыттыылаахтар бу сыһыарыы иһитиннэриитин туһаныыттан тахсар ханнык баҕарар сүтүккэ, охсууга, ыарыыга, дьааттаныыга эбэтэр алдьаныыга эппиэтинэс сүкпэттэр. Бэйэҕит сэрэниҥ.",
        )
        Language.RU -> listOf(
            "Вся информация в этом приложении (названия, описания, места обитания, сведения о традиционном и лечебном применении) предоставляется исключительно в общеобразовательных и справочных целях.",
            "Это НЕ является медицинской, лечебной консультацией или советом по безопасности и не должно использоваться для определения, сбора, приготовления или употребления каких-либо растений.",
            "Многие дикорастущие растения ядовиты или смертельно опасны и внешне похожи на съедобные или лекарственные виды. Никогда не употребляйте, не трогайте и не используйте растения, полагаясь на это приложение. Ошибка в определении может привести к тяжёлым отравлениям или смерти.",
            "Сведения о народном и традиционном применении приведены исключительно из культурного и исторического интереса и не являются рекомендацией. Перед любым применением растений в лечебных целях обязательно проконсультируйтесь с квалифицированным врачом.",
            "Авторы и участники проекта не несут никакой ответственности за любой ущерб, вред здоровью, болезнь, отравление или убытки, прямо или косвенно связанные с использованием информации из этого приложения или доверием к ней. Вы используете эту информацию исключительно на свой страх и риск.",
        )
        Language.EN -> listOf(
            "All information in this application (names, descriptions, habitats, and notes on traditional or medicinal use) is provided for general educational and reference purposes only.",
            "It is NOT medical, health, or safety advice, and must not be used to identify, gather, prepare, or consume any plant.",
            "Many wild plants are toxic or deadly and closely resemble edible or medicinal species. Never eat, touch, or use any plant based on this application. Misidentification can cause serious injury or death.",
            "Traditional and folk uses are recorded for cultural and historical interest only and are not a recommendation. Always consult a qualified medical professional before using any plant for health purposes.",
            "The authors and contributors accept no responsibility or liability whatsoever for any loss, injury, illness, poisoning, or damage arising directly or indirectly from the use of, or reliance on, any information in this application. You use this information entirely at your own risk.",
        )
    }

    fun privacyHeading(l: Language) = when (l) {
        Language.SAH -> "Тус дааннайдары харыстааһын"
        Language.RU -> "Политика конфиденциальности"
        Language.EN -> "Privacy Policy"
    }

    fun privacyBody(l: Language): List<String> = when (l) {
        Language.SAH -> listOf(
            "«Оттор Мастар» туох да тус дааннайдары хомуйбат, харайбат уонна ыыппат. Бэлиэтэнии, киирии, реклама эбэтэр кэтээн көрүү суох.",
            "Соҕотох харайыллара — эһиги талбыт тылгыт уонна туруоруугут, ол тэрилгит иһигэр эрэ хараллар. Ол тэрилгититтэн тахсыбат уонна ханнык баҕарар кэмҥэ туруорууларынан сотуллуон сөп.",
            "Кэтээн көрөр cookie туттуллубат. Эһигини билэр аналитика хомуллубат.",
            "Бу сыһыарыы эһиги дааннайгытын таска ыытпат.",
        )
        Language.RU -> listOf(
            "«Оттор Мастар» не собирает, не хранит и не передаёт никаких персональных данных. Нет учётных записей, входа, рекламы и стороннего отслеживания.",
            "Единственное, что сохраняется, — выбранный вами язык интерфейса и настройки, которые хранятся локально на вашем устройстве, чтобы приложение помнило ваш выбор. Эти данные не покидают ваше устройство и могут быть удалены в любой момент.",
            "Отслеживающие cookie не используются. Аналитика, идентифицирующая вас, не собирается.",
            "Приложение не отправляет внешних сетевых запросов с вашими данными.",
        )
        Language.EN -> listOf(
            "Ottor Mastar does not collect, store, or share any personal data. There are no user accounts, no sign-in, no advertising, and no third-party tracking.",
            "The only thing stored is your chosen interface language and settings, kept locally on your device so the app remembers your preference. This never leaves your device and can be cleared at any time.",
            "No tracking cookies are used. No analytics that identify you are collected.",
            "The app makes no external network requests carrying your data.",
        )
    }

    fun contentHeading(l: Language) = when (l) {
        Language.SAH -> "Иһинээҕитэ уонна ааптар бырааба"
        Language.RU -> "Контент и авторские права"
        Language.EN -> "Content & copyright"
    }

    fun contentBody(l: Language): List<String> = when (l) {
        Language.SAH -> listOf(
            "Ботаника ойуулара уонна хаартыскалара үөрэхтээһин уонна култуура сыалыгар туттуллаллар. Үүнээйилэр быһаарыылара уопсай ботаника билиитин уонна саха норуотун үгэстэрин холбууллар.",
            "Ботаника ойуулара — көрдөрөр сыаллаах эрэ, көмпүүтэринэн оҥоһуллубут стильлээх ойуулар; кинилэргэ көстөр ааттар, дьыллар уонна ыйынньыктар киэргэтии эрэ буолаллар, туспа устуоруйалаах үлэлэри кытта сибээстэспэттэр.",
            "© 2026 Оттор Мастар.",
        )
        Language.RU -> listOf(
            "Ботанические иллюстрации и фотографии используются в образовательных и культурных целях. Описания растений сочетают общие ботанические сведения и якутскую (саха) народную традицию.",
            "Ботанические иллюстрации представляют собой стилизованные, созданные цифровым способом изображения исключительно для наглядности; приведённые на них подписи, даты и ссылки носят декоративный характер и не отсылают к конкретным историческим изданиям.",
            "© 2026 Оттор Мастар.",
        )
        Language.EN -> listOf(
            "Botanical illustrations and photographs are used for educational and cultural purposes. Plant descriptions combine general botanical knowledge with Yakut (Sakha) folk tradition.",
            "The botanical illustrations are stylised, digitally-created plates for visual reference only; any captions, dates, or citations shown on them are decorative and are not references to specific historical works.",
            "© 2026 Ottor Mastar.",
        )
    }
}
