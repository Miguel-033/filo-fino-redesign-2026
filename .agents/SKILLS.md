# Установка профессиональных AI Skills — Filo Fino

Дата: 13 октября 2026. Рабочий репозиторий: `Miguel-033/filo-fino-redesign-2026`.

Установлены 14 сторонних Skills локально в `.agents/skills/`. Редизайн, SEO-оптимизация, исследование клиентов и настройка аналитики не выполнялись. Собственные Skills не создавались.

## Установленные Skills

| Skill | Источник | Версия | Назначение |
| --- | --- | --- | --- |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design) | commit dbd4588f9e10 | Визуальное решение и frontend |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/7246805992a42b7bba37d4cac83b01416f0c6c44/.claude/skills/ui-ux-pro-max) | commit 7246805992a4 | Mobile-first, responsive, анимации, микроинтеракции, доступность, производительность |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/web-design-guidelines) | 1.0.0 | Проверка интерфейса, доступности и производительности |
| `customer-research` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/28e4a81a3464475cbccc3c2bbcfe414bcabae32b/skills/customer-research) | 2.0.4 | Реальные потребности, jobs-to-be-done, voice of customer |
| `marketing-psychology` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/28e4a81a3464475cbccc3c2bbcfe414bcabae32b/skills/marketing-psychology) | 2.0.0 | Клиентская психология и этичная аргументация |
| `product-marketing` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/28e4a81a3464475cbccc3c2bbcfe414bcabae32b/skills/product-marketing) | 2.1.0 | Аудитория и позиционирование услуг |
| `cro` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/28e4a81a3464475cbccc3c2bbcfe414bcabae32b/skills/cro) | 2.0.3 | Конверсия страниц и контактных форм |
| `copywriting` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/28e4a81a3464475cbccc3c2bbcfe414bcabae32b/skills/copywriting) | 2.2.0 | Клиентские тексты |
| `copy-editing` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/28e4a81a3464475cbccc3c2bbcfe414bcabae32b/skills/copy-editing) | 2.1.1 | Редактура и проверка текста |
| `content-strategy` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/28e4a81a3464475cbccc3c2bbcfe414bcabae32b/skills/content-strategy) | 2.1.3 | Контентная стратегия |
| `site-architecture` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/28e4a81a3464475cbccc3c2bbcfe414bcabae32b/skills/site-architecture) | 2.1.0 | Структура сайта, навигация и внутренние ссылки |
| `seo-audit` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/28e4a81a3464475cbccc3c2bbcfe414bcabae32b/skills/seo-audit) | 2.2.0 | Техническое и on-page SEO, local SEO, скорость |
| `schema` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/28e4a81a3464475cbccc3c2bbcfe414bcabae32b/skills/schema) | 2.0.2 | Структурированные данные и JSON-LD |
| `analytics` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/28e4a81a3464475cbccc3c2bbcfe414bcabae32b/skills/analytics) | 2.1.0 | Измерение событий и обращений |

Все четыре исходные библиотеки проверены по текущим default branches и зафиксированы immutable commit SHA. Полные SHA и хеши каждого установленного файла находятся в `skills-lock.json`. Если upstream не объявляет номер версии, версией снимка служит commit SHA.

## Соответствие компетенций и отсутствующие названия

Недоступных необходимых Skills нет. В текущей Marketing Skills используются точные имена `cro`, `schema`, `analytics` и `product-marketing`. Отдельные дубли `On-page SEO`, `Mobile-first`, `Animations` или `Accessibility` не устанавливались: компетенции включены в `seo-audit`, `ui-ux-pro-max` и `web-design-guidelines`. React/Next.js-специфичные Skills Vercel не нужны для подготовки существующего статического HTML/CSS/JS сайта; стек не менялся. Deploy Skills не устанавливались.

## Совместимость с Codex

- Все 14 каталогов имеют читаемый UTF-8 `SKILL.md`, YAML frontmatter с `name` и `description`, совпадающий идентификатор каталога и локальные вспомогательные файлы. Путь `.agents/skills/` соответствует проектной установке Codex и upstream-конфигурации UI/UX Pro Max для Codex.
- В UI/UX Pro Max заменены только Claude plugin-root пути запуска на `.agents/skills/ui-ux-pro-max/scripts/search.py`. Исполняемая логика не изменена. Оригинальные инструкции и официальный `codex.json` сохранены в `skill-support/ui-ux-pro-max/`.
- `WebFetch` в Vercel означает read-only получение текста: в Codex используется доступный web/GitHub-инструмент. Внешние названия инструментов не устанавливаются как зависимости.
- Проверка структуры, хешей, Python syntax и локальных Markdown-ссылок прошла. Поиск `keyboard focus` в `ux` вернул 3 результата. Upstream `validate_data.py` успешно проверил 12 доменных файлов, 22 стека и `ui-reasoning.csv`. Запрос был тестом установки, а не проектированием сайта.
- **Ограничение проверки автоматического обнаружения:** установлен Codex CLI 0.159.2. Попытка `app-server` / `skills/list` остановилась до ответа из-за служебного каталога `/run/codex-environment/codex-home`, доступного только для чтения. Перенос SQLite в scratch не устранил другую ошибку read-only. Поэтому факт обнаружения текущей сессией не подтверждён; не заявляется, что runtime-проверка прошла. В доступной для записи обычной среде следует открыть Codex из корня этого репозитория и проверить список Skills / `skills/list` с `forceReload: true`. Полная проверка поведения модели по каждому навыку не проводилась.

## Файлы и зависимости

- `.agents/skills/<name>/SKILL.md` — инструкции 14 Skills; всего 115 файлов в каталогах Skills, включая лицензии и справочники.
- `ui-ux-pro-max/data/` — CSV/JSON-каталоги, 22 стека, сведения о происхождении данных, лицензиях шрифтов и иконок. Бинарные шрифты и изображения не скачивались.
- `ui-ux-pro-max/scripts/` — `search.py`, `core.py`, `design_system.py`, `reasoning_contract.py`, `validate_data.py`. Python 3; только стандартная библиотека. Проверено с Python 3.12.14. Все runtime-файлы сохранены; upstream development tests/fixtures опущены, поскольку они требуют постороннего tooling исходного репозитория.
- У Marketing Skills сохранены все вложенные `references/` выбранных навыков. У текстовых Skills нет обязательных исполняемых зависимостей.
- `web-design-guidelines/references/` — локальный снимок правил и его MIT-лицензия; источник `vercel-labs/web-interface-guidelines`, commit `434b7f91364665f2f733b310ec54809bf8f37937`. Этот репозиторий является указанной самим Skill вспомогательной зависимостью, а не пятой библиотекой Skills. Перед будущим обзором Skill требует свежие правила; если сеть недоступна, необходимо явно обозначить использование снимка.
- `AGENTS.md` — границы задачи, выбор Skills и восьмиэтапная последовательность будущей работы.
- `.agents/skills-lock.json` — источники, версии, адаптации и SHA-256/Git blob SHA.
- `.agents/skill-support/verify_skills.py` — read-only проверка установки; это утилита документации, не собственный Skill.
- `.agents/skill-support/site-baseline.json` — SHA-256 всех 133 исходных tracked-файлов.

GA4, GTM, GSAP, Tailwind, React, шрифты и сервисы, упомянутые в справочниках, не установлены и не подключены. Внешние analytics integration guides — факультативные ссылки; аккаунты, credentials и сторонние CLI не требуются для чтения Skills.

## Лицензии и проверка безопасности

- Frontend Design: Apache-2.0, сохранён upstream `LICENSE.txt`.
- UI/UX Pro Max и Marketing Skills: MIT, сохранены полные лицензии с copyright notices.
- Vercel Agent Skills: README явно объявляет MIT; отдельного LICENSE в данном снимке нет. Сохранён полный `UPSTREAM-README.md` как свидетельство лицензирования. Вспомогательные Web Interface Guidelines имеют отдельный полный MIT LICENSE, сохранён рядом со снимком правил.
- 124 скачанных файлов выбранных исходных каталогов проверены по Git blob SHA до адаптации и исключения development tests. Установленные файлы имеют отдельные хеши в lock-файле.
- Выполнен статический разбор runtime Python: imports, сетевые/процессные операции и места записи. Сетевых вызовов, запуска shell, `eval`/`exec`, скрытой установки пакетов в runtime-скриптах не обнаружено. `urllib.parse` используется для разбора URL, а не сетевых запросов.
- `design_system.py` умеет писать Markdown при явном `--persist`, а `--force` разрешает замену. Запись использует временный файл и atomic publish; имена нормализуются в безопасный slug. Эта функция не запускалась; её использование сейчас запрещено AGENTS.md.
- CLI installers, `npx skills add`, setup.sh/install.sh и workflows источников не запускались и не установлены. Успешно запущены только проверенные локальные read-only поиск и валидация. Проверка исходников снижает риск, но не является формальным аудитом безопасности.

## Повторная проверка и границы изменений

Из корня рабочего репозитория:

```bash
python3 .agents/skill-support/verify_skills.py
PYTHONDONTWRITEBYTECODE=1 python3 .agents/skills/ui-ux-pro-max/scripts/validate_data.py
```

Все 133 исходных tracked-файла побайтно совпадают с исходным снимком `6a88091306b09372353f2244f51fc6bc5febdb0c`. Изменения ограничены AGENTS.md, Skills, lock-файлом и их документацией. HTML/CSS/JS, изображения, домен, GitHub Pages, workflows и настройки публикации не менялись. Операции записи в `Miguel-033/filo-fino` не выполнялись. После подготовки коммита/PR работа прекращается до следующего задания.
