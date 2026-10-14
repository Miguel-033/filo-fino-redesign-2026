# Источники, лицензии и решения об использовании

Проверка: **14.10.2026**. Даты публикаций — только те, которые указаны на источнике. Старый референс не выдаётся за новую работу 2026 года. HTML-извлечение и исходный код не позволяют доказать скорость, rendering или удобство touch на реальном устройстве.

## Все запрошенные платформы исследованы

| Источник | Конкретная проверенная ссылка | Что полезно для Filo Fino | Статус |
| --- | --- | --- | --- |
| Codrops | [Infinite GSAP Gallery, 30.07.2026](https://tympanus.net/codrops/2026/07/30/building-an-infinite-gsap-scroll-gallery-with-parallax-and-flip-transitions/) | Приём перехода от фото к подробностям; пример для критического сравнения | Демо/статья и README прочитаны; бесконечный scroll не рекомендован |
| Codrops | [HAOQI.DESIGN, 15.08.2026](https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/) | Контрпример: технология должна служить задаче | Материал с DOM/WebGL исследован; не включён в основу |
| CodePen | [Stanko Image Comparison](https://codepen.io/stanko/pen/myddXKm), [mrwweb HTML5 comparison](https://codepen.io/mrwweb/pen/QpKBMM) | Range-based сравнение с минимальным JS и keyboard-ориентиром | Опубликованные HTML/описания прочитаны; визуальное тестирование не проведено |
| Awwwards | [Dodivetro](https://www.awwwards.com/sites/dodivetro) | Материал, реальные предметы, gallery и различение desktop/mobile | Запись Honorable Mention от 29.11.2024; источник вдохновения, не performance benchmark |
| Land-book | [workshop](https://land-book.com/websites/59269-workshop) | Фотографии материальной среды, предметные карточки | В listing указан Webflow; full stack не анализировался |
| One Page Love | [New Material, 11.10.2026](https://onepagelove.com/new-material) | Спокойная иерархия, case studies, whitespace | Подтверждён текущий пример 2026; Tailwind указан listing |
| One Page Love | [Digital Meadow, 23.01.2026](https://onepagelove.com/digital-meadow) | Выразительная, но сдержанная среда | Указан Astro; audio/raindrops не переносить на мастерскую |
| GSAP | [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [DrawSVG](https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/) | Управляемая последовательность и SVG, если появится задача | Docs/examples; не устанавливалось |
| Motion | [inView](https://motion.dev/docs/inview), [animate](https://motion.dev/docs/animate), [Press demo](https://examples.motion.dev/js/press) | JS-реализации reveal и обратной связи без React | Docs и example endpoint прочитаны; library LICENSE проверен |
| Magic UI | [Bento Grid](https://magicui.design/docs/components/bento-grid), [Blur Fade](https://magicui.design/docs/components/blur-fade) | Сетка и мягкое появление | Оба TSX source прочитаны, licence проверена; импорт не выполнялся |
| Aceternity UI | [Sidebar](https://ui.aceternity.com/components/sidebar), [Apple Cards](https://ui.aceternity.com/components/apple-cards-carousel), [Compare](https://ui.aceternity.com/components/compare), [Timeline](https://ui.aceternity.com/components/timeline) | Интерактивные ориентиры для меню, фото и процесса | Docs изучены; конкретные free-artifact licenses не подтверждены |

## Дополнительные первичные источники

- [PhotoSwipe demo](https://photoswipe.com/) и [getting started](https://photoswipe.com/getting-started/) — статический HTML, ESM и responsive images; текущая demo-страница обозначает 5.4.4.
- [img-comparison-slider](https://img-comparison-slider.sneas.io/) — независимый web component для сравнения; заявления автора о доступности требуют будущей проверки.
- [Slicey homepage](https://www.slicey.ca/) и [Services](https://www.slicey.ca/services) — реальный сервис заточки, а не только UI-demo. Используется логика объяснения процесса и обращения; не его цены, гарантии, технология или материалы.
- [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) — стандартные браузерные механизмы.
- [WhatsApp click-to-chat](https://faq.whatsapp.com/5913398998672934) — официальная инструкция. URL доступен, но прямой extractor вернул пустой текст; правила формата wa.me и prefilled text подтверждены индексированным текстом того же официального FAQ.
- [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md) — текущая версия прочитана через GitHub. Совместимая часть использована для критериев, без аудита/изменения сайта.
- [Core Web Vitals](https://web.dev/articles/vitals) — определения будущих field-целей.

## Условия использования

| Ресурс | Проверенный статус | Практическое решение |
| --- | --- | --- |
| Magic UI public repository | [MIT](https://github.com/magicuidesign/magicui/blob/main/LICENSE.md) | При будущем заимствовании сохранять copyright/license. Не распространять это утверждение на Magic UI Pro |
| Motion core | [MIT](https://github.com/motiondivision/motion/blob/main/LICENSE.md) | Указанные бесплатные JS API можно оценивать отдельно; Motion+ templates/examples имеют отдельные условия |
| PhotoSwipe | [MIT](https://github.com/dimsemenov/PhotoSwipe/blob/master/LICENSE) | Сохранить notices; лицензии optional plugins проверять отдельно |
| img-comparison-slider | [MIT](https://github.com/sneas/img-comparison-slider/blob/master/LICENSE) | Сохранить notices; проверить конкретную выбранную версию перед подключением |
| Public CodePen Pens | [MIT по правилам CodePen](https://blog.codepen.io/docs/pens/licensing/) | Проверить details/attribution выбранного Pen и вложенные ресурсы; не считать чужое фото автоматически свободным |
| Codrops downloadable demos | [MIT по умолчанию, если не оговорено иное](https://tympanus.net/codrops/licensing/) | Проверить конкретный demo и dependency notices. Для Infinite Gallery README ссылается на MIT, но файл LICENSE в просмотренном tree отсутствует; отдельно сохранить текст лицензии при будущем reuse |
| GSAP | [Standard No Charge](https://gsap.com/community/standard-license/) | Коммерческое использование сайта разрешено; не MIT. Есть ограничение для визуальных animation builders, конкурирующих с Webflow. Условия повторно проверить для выбранной версии |
| Aceternity | [Собственная Licence, страница Pro](https://ui.aceternity.com/licence) | Не заявлять MIT. Конкретный free-компонент: scope лицензии не подтверждён. Только референс; source Items в эту исследовательскую библиотеку не копировать |
| Awwwards/Land-book/One Page Love featured sites, Slicey | Открытая лицензия кода/медиа не выявлена | Анализировать принцип, не копировать изображения, брендинг, тексты или исходники |
| Browser APIs / MDN examples | API не является скачиваемой JS-библиотекой; документация имеет свои условия | Независимая реализация; примеры MDN не копировались |
| WhatsApp | Официальный сервис и брендовые правила, не open-source component | Обычная ссылка не требует chat SDK. Если нужны брендовые assets, следовать отдельным правилам и не перерисовывать официальный button без проверки |

Aceternity page в описании условий охватывает Items для purchase/download, при этом заголовок относится к Pro; применять общий текст ко всем free-components без проверки было бы предположением. Поэтому эти решения оставлены ориентиром. Оплачивать сервисы/шаблоны или подключать аккаунты для исследования не требовалось.

## Зафиксированные лицензионные артефакты

Файлы лицензий прочитаны через GitHub без установки компонентов. SHA ниже — Git blob SHA именно текста лицензии, **не версия пакета** и не commit SHA. Реальные runtime-версии ещё не выбраны. Эти записи также есть в `sources.json`.

| Repository / файл | Git blob SHA |
| --- | --- |
| magicuidesign/magicui / LICENSE.md | `30efc351ba9c469535dc012930ba6ee30c23f957` |
| motiondivision/motion / LICENSE.md | `81110442c72270dd317667cc52181522647401f2` |
| dimsemenov/PhotoSwipe / LICENSE | `5e0ff4d6c825895d919e888b6985caef745bbb74` |
| sneas/img-comparison-slider / LICENSE | `8bffb2812d6511dd15c7937a6197a5d75923725e` |

Проверенные source blobs Magic UI: Bento Grid `7d1062504b2562c4333106a5a9e9e2197f792fe1`, Blur Fade `fe7ca1e575afd280907cca70b55186870c368f13`. Код не vendored; SHA фиксирует то, что было прочитано.

Кандидаты шрифтов — **SIL OFL 1.1**, не установлены: [Source Sans 3](https://github.com/google/fonts/blob/main/ofl/sourcesans3/OFL.txt), [Literata](https://github.com/google/fonts/blob/main/ofl/literata/OFL.txt), [IBM Plex Sans](https://github.com/google/fonts/blob/main/ofl/ibmplexsans/OFL.txt). При будущем self-hosting сохранить лицензию и reserved-font-name ограничения; использовать только согласованные subset/веса. Не заимствовать ABC Favorit из New Material: публичный показ шрифта не даёт права на его файлы.

## Что исключено и почему

1. **Infinite gallery Codrops:** интересный переход к детали, но source статьи выключает native scrolling и использует собственный wheel/touch engine. Для клиента, ищущего услугу/контакт, это лишняя механика. README отмечает Midjourney images: они не являются доказательством реальной работы Filo Fino. Взять идею чёткого увеличения фото, не бесконечный scroll engine.
2. **HAOQI WebGL stage, shader и 3D scenes:** уместны для творческого portfolio; не доказывают качество заточки. Повышают runtime, GPU-нагрузку и complexity. Не включать в базу без конкретной новой задачи.
3. **Cursor-following, hover-only карточки, магнитные кнопки:** не решают touch-задачу и могут скрывать информацию. Применять понятные active/focus states.
4. **Sparkles, aurora, shimmer, glowing borders:** визуально ассоциируются с AI/SaaS больше, чем с точностью мастерской. Непрерывные эффекты конкурируют с реальными инструментами. Не собирать страницу как каталог несвязанных эффектов.
5. **Shoelace как новая dependency:** [официальные docs](https://shoelace.style/components/drawer) сообщают sunset и отсутствие active development; рекомендуют Web Awesome. Для одного mobile menu выбрать собственный dialog, а не автоматически мигрировать на другую UI-библиотеку.
6. **Чужие Pro templates:** paid service не нужен; не покупать, не экспортировать source и не воспроизводить чужую композицию целиком.

Эти отказы относятся к текущей задаче Filo Fino, а не к абсолютному качеству библиотек. Окончательная техническая оценка требует будущего прототипа и измерений.
