document.addEventListener("DOMContentLoaded", () => {
  const featuredGrid = document.getElementById("featuredCardsGrid");
  const featuredTitle = document.getElementById("featuredCardsTitle");
  const featuredSubtitle = document.getElementById("featuredCardsSubtitle");
  const categoryButtons = document.querySelectorAll(".blog-tag[data-category]");

  if (!featuredGrid) return;

  const featuredCardsByCategory = {
    all: {
      title: "Afilado en Valencia",
      subtitle: "Acceso rápido a las páginas principales:",
      cards: [
        {
          meta: "Cuchillos",
          title: "Afilado de cuchillos en Valencia",
          cta: "Ver servicio →",
          href: "../articulos/afilado-cuchillos-valencia.html",
        },
        {
          meta: "Cuchillos",
          title: "Afilar cuchillos cerca de mí en Valencia",
          cta: "Ver servicio →",
          href: "../articulos/afilar-cuchillos-cerca-de-mi.html",
        },
        {
          meta: "Cuchillos",
          title: "Dónde afilar cuchillos en Valencia",
          cta: "Ver guía →",
          href: "../articulos/donde-afilar-cuchillos-valencia.html",
        },
        {
          meta: "Peluquería",
          title: "Afilado de tijeras de peluquería en Valencia",
          cta: "Ver servicio →",
          href: "../articulos/afilado-tijeras-peluqueria-valencia.html",
        },
        {
          meta: "Peluquería",
          title: "Afilar tijeras de peluquería cerca de mí en Valencia",
          cta: "Ver servicio →",
          href: "../articulos/afilar-tijeras-peluqueria-cerca-de-mi.html",
        },
      ],
    },

    cuchillos: {
      title: "Cuchillos en Valencia",
      subtitle: "Servicios y casos reales sobre afilado de cuchillos:",
      cards: [
        {
          meta: "Servicio",
          title: "Afilado de cuchillos en Valencia",
          cta: "Ver servicio →",
          href: "../articulos/afilado-cuchillos-valencia.html",
        },
        {
          meta: "Servicio",
          title: "Afilar cuchillos cerca de mí en Valencia",
          cta: "Ver servicio →",
          href: "../articulos/afilar-cuchillos-cerca-de-mi.html",
        },
        {
          meta: "Guía",
          title: "Dónde afilar cuchillos en Valencia",
          cta: "Ver guía →",
          href: "../articulos/donde-afilar-cuchillos-valencia.html",
        },
        {
          meta: "Caso real",
          title: "El cuchillo ya no corta y cocinar se vuelve un suplicio",
          cta: "Ver caso →",
          href: "../articulos/cuchillo-no-corta.html",
        },
        {
          meta: "Caso real",
          title: "Por qué el cuchillo aplasta en cocina profesional",
          cta: "Ver caso →",
          href: "../articulos/cuchillo-aplasta.html",
        },
        {
          meta: "Caso real",
          title: "Después de afilar, el cuchillo corta peor",
          cta: "Ver caso →",
          href: "../articulos/afilado-empeora.html",
        },
      ],
    },

    peluqueria: {
      title: "Tijeras de peluquería en Valencia",
      subtitle: "Servicios y casos reales para profesionales:",
      cards: [
        {
          meta: "Servicio",
          title: "Afilado de tijeras de peluquería en Valencia",
          cta: "Ver servicio →",
          href: "../articulos/afilado-tijeras-peluqueria-valencia.html",
        },
        {
          meta: "Servicio",
          title: "Afilar tijeras de peluquería cerca de mí en Valencia",
          cta: "Ver servicio →",
          href: "../articulos/afilar-tijeras-peluqueria-cerca-de-mi.html",
        },
        {
          meta: "Caso real",
          title: "Las tijeras tiran del pelo y la mano se cansa",
          cta: "Ver caso →",
          href: "../articulos/tijeras-tiran.html",
        },
        {
          meta: "Caso real",
          title: "Después del afilado, el resultado empeora",
          cta: "Ver caso →",
          href: "../articulos/tijeras-despues-afilado.html",
        },
        {
          meta: "Caso real",
          title: "El corte no es uniforme con las tijeras",
          cta: "Ver caso →",
          href: "../articulos/tijeras-no-uniformes.html",
        },
      ],
    },

    maquinas: {
      title: "Máquinas y bloques de corte",
      subtitle: "Casos relacionados con el corte en máquinas:",
      cards: [
        {
          meta: "Caso real",
          title: "La máquina muerde y deja marcas en la piel",
          cta: "Ver caso →",
          href: "../articulos/maquina-muerde.html",
        },
      ],
    },

    manicura: {
      title: "Herramientas de manicura",
      subtitle: "Casos reales de herramientas de manicura:",
      cards: [
        {
          meta: "Caso real",
          title: "El alicate desgarra en lugar de cortar",
          cta: "Ver caso →",
          href: "../articulos/alicate-ruega.html",
        },
      ],
    },

    reparacion: {
      title: "Decisiones y errores comunes",
      subtitle: "Guías y casos para no perder dinero con la herramienta:",
      cards: [
        {
          meta: "Guía",
          title: "Reparar o comprar nuevo: dónde se pierde dinero",
          cta: "Ver guía →",
          href: "../articulos/reparar-o-cambiar.html",
        },
        {
          meta: "Caso real",
          title: "Después de afilar, el cuchillo corta peor",
          cta: "Ver caso →",
          href: "../articulos/afilado-empeora.html",
        },
      ],
    },
  };

  function renderFeaturedCards(category = "all") {
    const config =
      featuredCardsByCategory[category] || featuredCardsByCategory.all;

    if (featuredTitle) featuredTitle.textContent = config.title;
    if (featuredSubtitle) featuredSubtitle.textContent = config.subtitle;

    featuredGrid.innerHTML = config.cards
      .map(
        (card) => `
          <article class="blog-card">
            <a class="blog-card__link" href="${card.href}">
              <div class="blog-card__meta">${card.meta}</div>
              <h3 class="blog-card__title">${card.title}</h3>
              <div class="blog-card__cta">${card.cta}</div>
            </a>
          </article>
        `
      )
      .join("");
  }

  // Делаем функцию доступной для blog-filter.js
  window.renderFeaturedCards = renderFeaturedCards;

  const params = new URLSearchParams(window.location.search);
  const categoryFromUrl = params.get("category") || "all";

  renderFeaturedCards(categoryFromUrl);

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category || "all";
      renderFeaturedCards(category);
    });
  });
});
