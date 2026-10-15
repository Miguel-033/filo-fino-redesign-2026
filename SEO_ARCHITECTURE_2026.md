# Filo Fino — SEO Architecture & Implementation 2026

**Обязательный стандарт разработки. Версия 15.10.2026.** Репозиторий `Miguel-033/filo-fino-redesign-2026`. Цель — релевантные обращения и реальные клиенты локальной мастерской, а не число ключевых слов или страниц.

## 1. Решение и границы

Главная — сильный брендовый и многопрофильный узел мастерской. Три услуги — самостоятельные коммерческие страницы. Услуга ножей уже разработана; страницы ножниц и маникюра пока остаются действующими legacy-страницами, для нового дизайна ниже задана спецификация. В этой задаче они не подменяются заглушками и не объявляются разработанными.

Внедрение затрагивает только новый preview и SEO-инструменты в этом репозитории. Не менять действующий `filofino.es`, оригинальный репозиторий, production robots/sitemap/canonical, DNS, CNAME, Pages settings или workflows. Source Draft PR не объединять автоматически. Разрешена публикация статической копии только в существующую `gh-pages-preview`.

Источники истины: `seo/routes.json` — маршруты и метаданные; этот документ — правила; `seo/migration/url-map.csv` — сохранение старых URL. `seo/production/` — неактивные артефакты будущего production, не publishing-корень. Исходники нового дизайна находятся в `design-premium-preview/`; исторические корневые HTML/robots/sitemap не являются текущим preview.

## 2. Исследование Google и практик 2025–2026

Документация проверена 15.10.2026. Не существует отдельной обязательной «плотности ключей 2026». Ниже — конкретные проектные решения, а не обещание индексации, TOP-3 или rich results.

| Основа | Решение для Filo Fino | Источник |
|---|---|---|
| Search Essentials и полезность | Точная услуга, реальные факты и понятное обращение вместо поискового наполнителя | [Essentials](https://developers.google.com/search/docs/essentials), [helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) |
| Crawl → render → index | Основные тексты и настоящие ссылки сразу в HTML; JS улучшает интерфейс | [Как работает поиск](https://developers.google.com/search/docs/fundamentals/how-search-works), [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) |
| Mobile-first | Одинаковое содержание на телефоне и desktop; не загружать важный текст только после касания | [Mobile-first](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing) |
| URL и связи | Сохранить существующие пути; обычные `<a href>` и ясные анкоры | [URL](https://developers.google.com/search/docs/crawling-indexing/url-structure), [ссылки](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) |
| Title и snippets | Уникальные испанские title/description по намерению, без механического перечисления вариантов запроса | [Title](https://developers.google.com/search/docs/appearance/title-link), [snippets](https://developers.google.com/search/docs/appearance/snippet) |
| Canonical | В production self-canonical конечного URL, согласованный со ссылками и sitemap; в тесте canonical отсутствует | [Canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) |
| Управление индексированием | Preview noindex в HTML; не блокировать crawler так, чтобы он не увидел noindex | [Noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing), [robots](https://developers.google.com/search/docs/crawling-indexing/robots/intro) |
| Sitemap | Только конечные индексируемые canonical URL; даты лишь при реальном изменении | [Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) |
| Structured data | Правдивая сущность мастерской, Service как семантика, BreadcrumbList для услуги; без вымышленных цен/рейтингов | [LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business), [политики](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [поддерживаемые возможности](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) |
| Изображения | Реальные img/src, alt по содержимому, размеры и разумная загрузка | [Image SEO](https://developers.google.com/search/docs/appearance/google-images) |
| CWV | Измерять LCP/INP/CLS; отсутствие тяжёлого JS не является доказательством хороших метрик | [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals) |
| Local SEO | Реальные адрес, услуги и маршрут; relevance/distance/prominence нельзя заменить ключевыми словами | [Local ranking](https://support.google.com/business/answer/7091) |
| Миграция | Сначала полная карта старых URL и проверка сигналов, потом отдельное разрешение production | [Миграции](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) |

Дополнительно изучены [Ahrefs Internal Links, обновление 10.03.2026](https://ahrefs.com/blog/internal-links-for-seo/) и [On-page checklist 2026](https://ahrefs.com/blog/on-page-seo-checklist/). Применимы тематические связи, проверка сиротских страниц и естественные анкоры. **Не принимаем их как закон:** фиксированное число ссылок, обязательную абсолютность href, изменение уже работающих URL ради ключа или универсальный эффект на позиции. Google допускает корректные относительные ссылки; измерения локального бизнеса важнее универсальных vendor-советов. Один H1 — наш проверяемый стандарт ясности, не утверждение о наказании Google за второй H1. Длина title/description — редакторское решение, не жёсткий лимит показа.

## 3. Данные GSC и диагноз

Свойство `https://filofino.es/`, Web, **15.07–12.10.2026**, все страны и устройства. API сообщает settled through 13.10; даты Search Console — `America/Los_Angeles`. Это не выборка пользователей только из Валенсии: GSC не предоставляет здесь городской фильтр. Получены 20 page-строк и все 648 возвращённых query×page строк (`hasMore=false`); приватность и ограничения GSC всё равно скрывают часть запросов.

Property total: **182 клика, 12 660 показов**. Page aggregation ниже нельзя просто суммировать и объявить property total: несколько URL в выдаче и методы агрегации отличаются. CTR при расчётах пересчитывать из clicks/impressions; connector возвращает его в процентах.

| Страница production | Клики | Показы | Средняя позиция, все запросы страницы |
|---|---:|---:|---:|
| Главная | 158 | 11 328 | 7,64 |
| Ножи | 10 | 1 085 | 24,27 |
| Ножницы | 0 | 165 | 15,45 |
| Маникюр/педикюр | 2 | 127 | 7,45 |
| `articulos/cuchillo-no-corta.html` | 0 | 297 | 18,20 |

URL Inspection выполнен для главной и трёх услуг 15.10.2026: **все PASS, Submitted and indexed, Google canonical совпадает с собственным URL, crawled as MOBILE**. Последние crawl: главная 09.10; ножи 18.09; ножницы 09.10; маникюр 17.09. Это состояние индекса по API, не live-render тест текущей версии. Нулевые клики ножниц не равны отсутствию индексации.

| Запрос | Главная: клики/показы/позиция | Страница услуги: клики/показы/позиция | Вывод |
|---|---|---|---|
| `afilar cuchillos valencia` | 4 / 41 / 1,90 | ножи: 0 / 22 / 12,36 | Главная полезна и уже сильна; усиливать специализацию услуги, не убирать релевантность главной |
| `afilador de cuchillos cerca de mi` | 0 / 191 / 10,75 | ножи: 0 / 81 / 59,31 | Существенное различие URL; причина низкого результата услуги по одному запросу не доказана |
| `donde afilar tijeras de peluquería` | 1 / 73 / 12,74 | ножницы: 0 / 19 / 34,05 | Нужны полноценная услуга и контекстные связи, а не переименование URL |
| `servicio de afilado de cuchillos` | 0 / 6 / 4,17 | ножи: 0 / 2 / 9,50 | Очень малая выборка, нельзя прогнозировать эффект |

Connector cannibalization scan: `truncated=false`, источник API. Пересечение нескольких страниц — **кандидат на проверку, не доказанный ущерб**. Например, бренд `filo fino` показывает несколько URL — это нормальная навигационная видимость. Для доказательства вреда нужны query×page по неделям, переключения посадочной, intent mismatch и падение результата на сопоставимых периодах. Не складывать page impressions и не выдавать их за уникальные показы запроса.

В GSC также есть показы главной по `afilador de cuchillos electrico` (39, без кликов): это повод чётко объяснять услугу, не начинать оптимизацию под покупку точилок. Слабый SEO маникюрной страницы не описывает весь спрос: владелец подтвердил важную роль русскоязычного Instagram; точная доля клиентов оттуда неизвестна. Не приписывать всех реальных клиентов SEO.

### Приоритетные диагнозы

| Проблема → доказательство | Причина / граница гипотезы | Решение | Ожидаемый эффект и измерение |
|---|---|---|---|
| Сервисные URL часто уступают главной по профильным запросам → таблица выше | Недостаточная специализация/связность — гипотеза, не установленная причина | Самостоятельные услуги, уникальные title/H1, прямые и контекстные ссылки | Более релевантные входы; GSC query×page, подтверждённые обращения, без обещания роста |
| Заголовок нового home был названием прототипа, H1 только слоганом → исходный HTML PR9 | Недостающая явная тема в метаданных нового дизайна | Workshop title/description и видимый контекст внутри H1, сохраняя слоган и стили | Понятность страницы; DOM-тест сейчас, Search Console после production |
| Несколько коммерчески похожих статей → карта 42 URL | Возможное пересечение intent; малое число показов не доказывает бесполезность | Сохранить URL, проверить содержимое/запросы/ссылки перед отдельным решением об объединении | Не потерять старые входы; URL ledger и до/после по каждому URL |
| Расписание HTML/config и старого JSON-LD расходится | Несогласованные факты, не ошибка ранжирования по доказательствам | Подтвердить у владельца, затем единый NAP/часовой источник; пока не добавлять hours в schema | Доверие и отсутствие ложных сведений; факт-проверка перед релизом |

## 4. Поисковый рынок Валенсии

Наблюдения 15.10.2026 по запросам ножей, парикмахерских ножниц, маникюрных инструментов; отдельный поиск с исключением Filo Fino помог не ограничиться собственным сайтом. Это реальная выборка поискового инструмента, **не сертифицированный Google TOP по всему городу, не Maps grid и не персонализированная выдача с GPS Валенсии**. Фиксированные позиции конкурентов не заявляются. Для такого отчёта нужен location-aware SERP/local-rank инструмент с координатами и устройством.

| Найденная страница | Что удалось подтвердить | Полезный принцип / возможность Filo Fino |
|---|---|---|
| [Master Filo, главная](https://www.masterfilo.es/) | Категории инструментов в меню, различение подходов к ножам, адрес/маршрут/запись. В извлечённой странице есть ссылки на другие hosting-домены и неодинаковые контакты/часы | Полезно разделять случаи применения; у Filo Fino единые факты и проверяемые конечные ссылки. Наличие внешнего hosting href ещё не доказывает 404 или причину позиций |
| [CORTÉS Horeca](https://www.corteshoreca.es/) | Сфокусированная B2B-подписка, объяснение предложения, CTA и блоки по задачам кухни; есть переход к shop | Хорошая сегментация профессиональной кухни. Не копировать чужие сроки, сертификаты, подписку и логистику как услуги Filo Fino; общий ножевой сервис должен оставаться доступным частному клиенту |
| [V. Prieto, workshop](https://cuchilleriavprieto.es/taller-de-afilado) | Отдельный workshop URL и коммерческий title в поиске. Главная HTTP 200, но извлечённый HTML не дал полноценного rendered content | Самостоятельная услуга важнее попытки вместить всё на главную. Без рендера не объявлять отсутствие H1/schema на их сайте |
| [Ciceri: ножницы](https://www.cicericlippers.com/blog/noticias/afilado-tijeras-peluqueria-valencia.html) | В выдаче коммерческий service-title, адрес и предложение, хотя путь находится в blog; прямое чтение вернуло 403 | Intent определяется содержанием, не словом blog в URL. Нельзя заявлять полный аудит страницы по сниппету |
| [Nebot: taller afilado](https://www.cuchillerianebot.com/es/content/7-taller-afilado-mejores-afilados-en-valencia) | Релевантный отдельный URL найден; чтение сейчас HTTP 503 / maintenance | Фиксировать фактический сбой доступа, не делать вывод о постоянном отсутствии/потере индексации |
| [Llave de Oro, servicios](https://www.llavedeorovalencia.com/servicios/) | В выдаче смешанные бытовые услуги; прямой HTTP-запрос сейчас 410 | Не считать найденный сниппет доказательством работоспособности посадочной. У Filo Fino проверять финальные href после публикации |

По маникюрным запросам выборка также возвращает карточки продаваемых Staleks: слова «afilado profesional» могут описывать заводской инструмент, а не услугу. Не переносить Product/Offer и покупательские тексты на посадочную заточки. Отзывы, подписки, сертификаты и преимущества конкурентов выше — их заявления/интерфейс, не независимая проверка качества работы.

## 5. Карта URL и поисковых намерений

Полная исходная карта: **42 точных URL** из действующего sitemap в [seo/migration/url-map.csv](seo/migration/url-map.csv), без новых redirects. Sitemap не гарантирует полноту: до production дополнить GSC, backlink/log/crawl-инвентарём.

| URL / класс | Роль | Состояние нового дизайна |
|---|---|---|
| `/` | Мастерская, бренд, общая локальная услуга | Разработан |
| `/servicios/afilado-cuchillos-valencia/` | Ножи: дом, профессиональная кухня, консультация по японским | Разработан |
| `/servicios/afilar-tijeras-peluqueria-valencia/` | Парикмахерские ножницы + полезный подраздел других подтверждённых ножниц | Спецификация; действующий URL не менять |
| `/servicios/herramientas-manicura-pedicura-valencia/` | Инструменты маникюра/педикюра, не косметическая процедура | Спецификация; действующий URL не менять |
| `/servicios/` | Краткий указатель услуг; не ещё одна полная копия home | Сохранить legacy до замены |
| `/servicios/afilado-cuchillos-hosteleria-valencia/` | Реальные задачи ресторанов/партий инструментов | Сохранить; отличать от общей ножевой услуги |
| `/servicios/afilado-cuchillas-maquinas-valencia/` | Подтверждённые ножевые блоки машин | Сохранить legacy |
| `/blog/` и `/articulos/*.html` | Индекс и ответы на вопросы | Сохранить точные существующие пути |
| `/zonas/*/` | Реальная зона обслуживания мастерской в Валенсии | Не выдавать за филиалы; сохранять до индивидуального аудита |
| `/legal/*.html` | Правовая информация | Сохранить |

### Запрос → намерение → целевая страница → входящие связи

| Кластер / примеры | Намерение | Приоритетный URL | Ссылки |
|---|---|---|---|
| `Filo Fino`, `taller de afilado Valencia`, `servicio de afilado Valencia` | Бренд / выбор мастерской | `/` | Логотип, breadcrumbs, контакты, профили |
| `afilado de cuchillos en Valencia`, `afilar cuchillos Valencia`, `servicio de afilado de cuchillos` | Коммерческий ножевой сервис | `/servicios/afilado-cuchillos-valencia/` | Hero shortcuts, карточка ножей, footer, профильные статьи |
| `afilador de cuchillos cerca de mí`, `dónde afilar cuchillos` | Локальная услуга; у афиладор возможна неоднозначность | Та же ножевая услуга | Адрес, маршрут и контекстные ссылки; не отдельная near-me копия |
| `afilado cuchillos japoneses Valencia`, `afilado manual piedras de agua` | Специализированная услуга / mixed informational | Ножевая услуга, `#japoneses` | Из категории и релевантных материалов; новый URL пока не нужен |
| `afilar tijeras peluquería Valencia`, `afilado tijeras profesionales` | Профессиональные ножницы | Существующий `/servicios/afilar-tijeras-peluqueria-valencia/` | Home, статьи о тяге/неравномерном резе, footer |
| `afilar tijeras de costura`, `afilar tijeras domésticas`, `dónde afilar tijeras` | Более широкая услуга ножниц | Пока подраздел той же страницы | Широкая подпись на home и объяснение допустимых моделей |
| `afilado alicates manicura Valencia`, `afilar alicates de uñas`, `afilado tijeras manicura` | Обслуживание инструментов | `/servicios/herramientas-manicura-pedicura-valencia/` | Home, `alicate-ruega.html`, footer |
| `por qué se desafilan los cuchillos`, `cuchillo no corta` | Информация / проблема перед обращением | `/articulos/cuchillo-no-corta.html` | Ножевая услуга ↔ статья ↔ `/blog/` |
| `tijeras tiran del pelo`, `corte no uniforme` | Информация, диагностика без обещания причины | Существующие `tijeras-tiran.html`, `tijeras-no-uniformes.html` | Страница ножниц ↔ статья |
| `alicate desgarra` | Информация о проблеме инструмента | `/articulos/alicate-ruega.html` | Маникюрная услуга ↔ статья |
| `cuchillos hostelería mantenimiento` | B2B-организация обслуживания | Существующая hostelería-страница при подтверждённых условиях | Общая ножевая услуга ↔ специализированная |
| `afilador eléctrico`, `comprar afilador`, `piedra de afilar comprar`, `comprar alicates` | Покупка инструмента | Не целевые коммерческие кластеры мастерской | Не создавать магазин/товарные страницы в этой задаче |
| `manicura a domicilio`, `peluquería cerca de mí` | Косметическая услуга, не заточка | Не целевое намерение | Писать «инструменты/ножницы», не выдавать мастерскую за салон |

Это ownership-карта для разработки, не обещание, что Google всегда выберет именно этот URL. Главная вправе ранжироваться по сервисным запросам. Не ставить ей nofollow на услуги, не убирать полезные упоминания ножей и не canonical-ить её на услугу.

### Широкая категория ножниц

Пока сохраняется парикмахерский URL и его главный intent. Будущие title/H1 подчёркивают парикмахерские ножницы; H2 «Otras tijeras: costura y uso doméstico» раскрывает подтверждённый владельцем охват с осмотром пригодности. Не приписывать промышленную оснастку, садовые/ветеринарные модели без подтверждения. Отдельный широкий hub или новая услуга допустимы позже только при различимом спросе, собственном содержимом и понятной навигации; старый hair-URL нельзя просто заменить или обобщить до потери специализации.

## 6. Внутренние связи и содержание

Главная → каждая основная услуга в один переход: подпись направления, кликабельная карточка, footer. Услуга → home через логотип и breadcrumbs; услуга → связанные услуги при реальной пользе; услуга ↔ подходящая информационная статья. `/blog/` группирует статьи по инструментам, но не меняет их `/articulos/` URL. Без UTM на внутренних переходах и без искусственных квот ссылок.

Preview: разработанные маршруты относительные внутри project base; ещё не разработанные услуги/статьи/правовые страницы ведут на существующий production. Это сознательный смешанный режим, не объявление старых страниц частью нового опубликованного дизайна. После замены каждую из этих ссылок перевести в локальный маршрут и проверить `seo/routes.json`.

### Метаданные и H1

| Страница | Title | H1 / смысл |
|---|---|---|
| Home | `Taller de afilado en Valencia | Filo Fino` | Видимый `Taller de afilado en Valencia` + сохранённый слоган `Cada filo. Su oficio.` внутри одного H1 |
| Ножи | `Afilado de cuchillos en Valencia | Filo Fino` | `Afilado profesional de cuchillos en Valencia` |
| Ножницы, будущая | `Afilar tijeras de peluquería en Valencia | Filo Fino` | `Afilado de tijeras de peluquería en Valencia` |
| Маникюр, будущая | `Afilado de manicura y pedicura en Valencia | Filo Fino` | `Afilado de herramientas de manicura y pedicura en Valencia` |

Descriptions и статус каждой страницы заданы в реестре. Не копировать title/H1 home на услуги. Не добавлять 2026 в коммерческие заголовки ради свежести. Главная коротко представляет направления и мастерскую; полное объяснение ножей остаётся на услуге. H2 — вопросы и разделы; H3 — подвиды/подэтапы, не средство выбора размера шрифта. Кнопки и summary имеют понятные имена; decorative SVG скрыты от assistive tech, содержательные рисунки названы иллюстрациями.

### Стандарт будущей страницы услуги

1. Услуга + Valencia, понятный результат обращения, WhatsApp и маршрут на первом экране.
2. Подтверждённые типы инструментов; отдельные сценарии без вымышленных технологий и моделей.
3. Что проверяется и как согласовываются работа/цена/срок, без непроверенных чисел.
4. Реальные фото и честный контекст до/после; при нехватке — различимая графика, не fake result.
5. Как принести инструмент; мастерская принимает без записи в обычные часы, субботняя оговорка по фактам.
6. Полезные FAQ в доступном HTML, контакты, маршрут, тематические ссылки. Не раздувать ответ для ключей.

Для ножниц обязательны симптомы реза, осмотр настройки и пригодности модели; для маникюра — инструменты и состояние реза/смыкания, а не продажа маникюра. Темы и язык подтверждать владельцем/наблюдаемыми запросами. В рамках customer-research использованы существующие факты и запросы; интервью, персоны, отзывы и статистика обращений не выдумывались.

### Блог и пересечения

В первую очередь содержательно развивать `cuchillo-no-corta.html` (297 показов) и поддержать услугой; затем `tijeras-tiran.html`, `tijeras-no-uniformes.html`, `alicate-ruega.html`. Статьи `afilado-cuchillos-valencia.html`, `afilar-cuchillos-cerca-de-mi.html`, `donde-afilar-cuchillos-valencia.html` и парикмахерские near-me/Valencia материалы проверить на дубли коммерческого intent. В этой задаче их не удалять, не redirect-ить и не canonical-ить наугад. Решение об объединении требует содержимого, query×page, ссылок и собственного полезного назначения. Новые статьи — реальные случаи/объяснения, которых нет в FAQ; не серия одинаковых городских landing pages.

## 7. Единый технический стандарт

- Семантические header/nav/main/section/article/footer, один видимый H1, логичная иерархия. Основной текст и href в исходном HTML.
- Нет click-only div, hash-routing для разных услуг, пустых href и ссылок на `.html`-вариант существующего directory URL.
- Без client-only метаданных, обязательного loader для контента, закрытия текста анимационным CSS или подмены HTML для робота.
- Native disclosures допустимы: ответы существуют в HTML до раскрытия. Меню/галерея — enhancement, не обязательный доступ к услуге.
- Production: HTTPS, прежние слеши/пути, HTTP 200 для конечных страниц, self-canonical абсолютного production URL. Подтверждённые слияния — серверный 301/308 в один переход, не JS/meta-refresh и не массово на home.
- Preview: **noindex, nofollow**, без canonical/og:url/активного production JSON-LD. Noindex не защита конфиденциальности. Не публиковать production sitemap или robots-шаблон на Pages.
- `seo/prepare_metadata.py` генерирует инертные metadata/schema и sitemap-кандидат; `--apply-preview` синхронизирует безопасные title/description/OG в HTML. Сценарий не умеет публиковать production.
- `seo/production/metadata.json`: один стабильный LocalBusiness ID, WebSite и WebPage; на услуге Service + BreadcrumbList. Service — семантическое описание, не отдельное обещание rich result. Нет FAQ-rich-result расчёта, Product/Offer, fake rating, фиктивных филиалов, неподтверждённых geo/часов/цен.
- Перед production согласовать business ID с окончательной общей schema и проверить rendered JSON-LD в подходящем validator/Rich Results Test. Статический curl не доказывает отсутствие JS-injected schema на чужом сайте.
- Sitemap-кандидат сохраняет 42 URL и не содержит тестового домена, искусственных lastmod/priority/changefreq. Он не готов к production, пока не проверены legacy URL; опубликованный новый дизайн пока имеет только две страницы.

## 8. Local SEO, медиа, анимации и измерение

**Единые факты:** Filo Fino, Calle Maestro Guerrero, 4, Valencia, +34 614 00 50 53, [Maps](https://maps.app.goo.gl/Z4WQeCUKKeDbx8Qt7). Не придумывать индекс, парковку, станции, geo, сертификаты или срок ответа. Адресное изображение-ссылка не выдаётся за точную карту улиц.

Текущий customer-facing `site-config.js` и premium: пн–пт 10–14 / 17–20, суббота по записи, воскресенье закрыто. Старый static JSON-LD сообщает 10–17:30. До подтверждения владельца hours отсутствуют в подготовленной schema; production не редактировался. GBP и прочие citations впоследствии синхронизировать после фактической проверки, не создавать дополнительные адреса для соседних городов. Никакие изменения профиля или отзывы в этой задаче не публикуются.

Фото: только разрешённые материалы Filo Fino, фактические alt, размеры и стабильная рамка. Не называть архивный кадр результатом после заточки без доказательства. Hero — eager/fetchpriority high; ниже экрана — lazy/async, реальный img src. Шрифты локальные с лицензиями, `font-display:swap`, preload только критического display. Responsive image variants при необходимости готовить из того же разрешённого фото; не плодить файлы ради формата.

Анимации: только улучшение, content visible по умолчанию, transform/opacity, reduced motion; избегать постоянных scroll-handler/layout reads и тяжёлых библиотек. Реальные mobile и keyboard проверки обязательны перед production. Accessibility — видимый focus, читаемые размеры, безопасные touch targets, zoom не запрещать, содержимое desktop/mobile не расходится.

CWV цели: LCP ≤2,5 с, INP ≤200 мс, CLS ≤0,1 на 75-м перцентиле реальных посещений. Lab Lighthouse — отдельный снимок, не field-pass и не гарантия позиций. В этой задаче метрики CWV/Lighthouse **не измерены**. Размеры ресурсов — только техническая инвентаризация, не latency/LCP. Внутренние бюджеты тестов — проектные предохранители, а не требования Google.

Измерять после разрешённого production: GSC по query×landing page и равным закрытым периодам; контекстные клики WhatsApp/телефона/маршрута отдельно от начатых диалогов и подтверждённых клиентов. Не отправлять номера/тексты сообщений/PII в analytics. Preview не подключает GA/GTM, beacon или новые cookies. Будущий consent/tracking plan требует отдельной проверки; в этой задаче задан стандарт, не включён сбор данных.

## 9. Миграция без потери старых входов

1. До релиза: дополнить ledger всеми обнаруженными URL и assets, снять status/canonical/robots/metadata/link baselines; сохранить GSC исходники и фактические конверсии отдельно. Не считать sitemap исчерпывающим.
2. Сохранить все 42 пути. Две готовые страницы не дают разрешения удалить остальные 40: сохранить legacy и assets на production до готовности или отдельного обоснованного redirect. Особое внимание `/articulos/*.html`, `/zonas/`, hostelería, blades, legal.
3. Подготовить URL-by-URL проверку содержимого и назначения. Старые коммерческие статьи не объединять только из-за имени файла. Массовая смена `/articulos/` на `/blog/` не требуется.
4. На production остаётся тот же домен и те же URL: это замена шаблонов/контента, не повод автоматически делать Change of Address в GSC. Для действительно изменяемых адресов сначала утверждённая 1:1 карта и серверные redirects; проверять отсутствие цепочек/циклов.
5. По отдельному разрешению: снять noindex только с утверждённых production страниц, внедрить согласованные canonical/schema, сохранить assets/правовые ссылки, заменить внешние ссылки на уже перенесённые внутренние. Sitemap и robots проверять на конечном домене; не копировать тестовую конфигурацию.
6. Прогнать реальный браузер 320/390/768/1024/1440, iPhone Safari, no-JS, reduced motion, галерею/меню/контакты, Rich Results и Lighthouse/field context. До этого не объявлять production ready.
7. После релиза: проверить HTTP, индексацию/Google canonical, прежние URL, sitemap errors и URL-level GSC. Наблюдать сопоставимые окна, не приписывать изменение трафика одной правке без анализа сезонности/выдачи. При регрессии — обратимый rollback релиза, не сброс истории и не redirect всего на home.

## 10. Что реально внедрено сейчас

1. Главная: service-oriented title/description/OG вместо title прототипа. Видимый контекст «Taller de afilado en Valencia» включён в один H1 с сохранённым слоганом и прежним масштабом; новый `seo.css` сохраняет различие eyebrow/display. Скрытых ключевых слов нет.
2. Ножи: метаданные/OG синхронизированы с реестром; основной H1 и самостоятельное содержимое сохранены. Добавлена релевантная ссылка на существующую статью `cuchillo-no-corta.html`.
3. Главная получила footer-ссылку на существующий blog; все ссылки трёх услуг проверяются, ножевая ведёт на локальный preview, будущие услуги — на работающие старые страницы.
4. Нижеэкранные фото получили `decoding=async`; изображения, их байты, галереи и существующие animation JS не заменены.
5. Реестр четырёх основных маршрутов, связанный production metadata/schema handoff, сохранение 42 URL и инертные sitemap/robots материалы. Старый knife metadata handoff генерируется из того же реестра, чтобы не расходиться.
6. Автоматические проверки metadata/DOM/links/schema/environment separation и доступный регрессионный DOM-прогон. AGENTS требует этот документ при следующей разработке.

## 11. Обязательный checklist новой страницы

- [ ] Зафиксировать intent, существующий URL и статус в реестре; проверить пересечение с home/услугами/статьями.
- [ ] Подтвердить реальные услуги, NAP, часы, фото, цены/сроки; неизвестное не заполнять выдумкой.
- [ ] Уникальные title/description/H1; H2–H3 полезны клиенту. Контент и ссылки работают без JS.
- [ ] Главная/релевантные страницы ссылаются на услугу; breadcrumbs/home/related links корректны. Нет orphan или staging-host ссылок.
- [ ] `python seo/prepare_metadata.py` и `python seo/verify.py` проходят; source-only production metadata не попадают в тестовую публикацию.
- [ ] Для изменений логики выполнить компонентные тесты и `seo/verify-interactions.cjs`; старые screenshot-файлы не выдавать за новые.
- [ ] Preview noindex и без production canonical/JSON-LD/sitemap/robots. Публикация только по границам текущего разрешения, с проверкой expected branch SHA.
- [ ] Реальный mobile/desktop/Safari/keyboard/no-JS/reduced-motion прогон; отдельно Lighthouse/CWV. Недоступные проверки явно перечислить, не ставить фиктивный PASS.
- [ ] После тестовой публикации сравнить HTML и ресурсы с копией, проверить HTTP/хеши/конечные href и состояние deployment.
- [ ] Перед production отдельное решение владельца, заполненный migration gate для всех legacy URL, rendered schema и rollback.

## 12. Ограничения этой проверки

Доступны GSC API, HTTP, анализ исходного HTML/CSS/JS, local DOM test doubles и статические проверки. Chromium в среде завершался SIGTRAP до рендера; облачный браузер ранее зависал длительно и в этой задаче не запускается повторно. Визуальный рендер нового H1, мобильный overflow, Safari, native focus/swipe, Lighthouse и Rich Results Test не объявляются пройденными. Перед production это открытые P0-проверки. Неуспешное чтение конкурента не доказывает плохую индексацию или причину его позиции.
