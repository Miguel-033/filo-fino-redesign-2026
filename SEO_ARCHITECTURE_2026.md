# Filo Fino — актуальная SEO-архитектура

Решение владельца от 2 ноября 2026 заменяет прежнюю архитектуру. Сайт: главная, каталог услуг, пять существующих услуг и три юридические страницы. Точные неизменяемые маршруты, title/description и ожидаемые принятые H1 находятся в `seo/routes.json` (`pages` 7 + `legalPages` 3). `site/` — единственный web source root. Не создавать zonas/blog/articulos или новые коммерческие дубли.

`seo/prepare_metadata.py` готовит metadata 10/10, включая 7/7 основных страниц, общий LocalBusiness/WebSite/WebPage и Service/BreadcrumbList для услуг. Неподтверждённые часы, рейтинги, отзывы, Offer и обещания rich results не добавляются. Цены и сроки — из принятого HTML, их проверяет `seo/verify-services.cjs`. Не возвращать старые 10 €/pieza для Hostelería и старые часы 10–17:30.

Две отдельные сборки `seo/build.py`: preview сохраняет noindex,nofollow без canonical/JSON-LD/og:url/sitemap/robots; production candidate только offline содержит self-canonical https://filofino.es, index,follow, согласованную JSON-LD и sitemap ровно десяти конечных URL. Генератор не публикует, не изменяет удалённые refs и не устанавливает redirects. Dependency closure включает изображения, шрифты/лицензии, CSS URLs, JS-иллюстрации, video source/poster/fallback. Документация, исходные медиа и тесты не копируются в сборки.

Карты миграции — `seo/migration/url-map.csv`: 42 старых sitemap URL + 23 точных дополнительных адреса из аудита 01.11.2026. Все неидентичные решения требуют согласования; зоны и статьи не отправляются массово на главную. Дополнительные repository-only маршруты отдельны. Никакие перенаправления на действующем сайте не устанавливать.

Перед коммитом: `python seo/verify.py`, `python design-system/render_components.py --check`, `node seo/verify-services.cjs`, `node seo/verify-interactions.cjs`. Проверки HTML/CSS/DOM не выдавать за Safari, Lighthouse, Google validation или проверку физического устройства. Принятые Hero и содержимое защищены `seo/accepted-design.json` от коммита b2cf0a7; разрешены только удаления старых ссылок. Новую публикацию production, DNS/hosting, GBP/GSC и основной репозиторий менять запрещено до отдельного задания.

Историческое исследование 15.10.2026 сохранено в `docs/history/SEO_ARCHITECTURE_2026-10-15.md`; его структура, старые статусы и требования сохранить 42 публичные страницы больше не действуют.
