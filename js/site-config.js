window.SITE = {
  phone: {
    display: "+34 614 00 50 53",
    raw: "34614005053",
  },

  whatsapp: {
    defaultText: "Hola, tengo una consulta sobre el afilado de herramientas.",
  },

  instagram: "https://www.instagram.com/filofino.es",

  address: {
    text: "Calle Maestro Guerrero, 4, Valencia",
    maps: "https://maps.app.goo.gl/Z4WQeCUKKeDbx8Qt7",
  },

  schedule: {
    weekdays: "Lunes a viernes: ",
    lunch: "10:00 – 14:00 y 17:00 – 20:00",
    saturday: "Sábados: con cita previa",
    sunday: "Domingos: cerrado",
  },

  copyright: {
    brand: "Filo Fino",
    description: "Afilado profesional en Valencia",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const s = window.SITE;

  const buildWhatsAppUrl = (text) => {
    const finalText = encodeURIComponent(text || s.whatsapp.defaultText);
    return `https://wa.me/${s.phone.raw}?text=${finalText}`;
  };

  /* Телефон */
  document.querySelectorAll("[data-phone]").forEach((el) => {
    el.textContent = s.phone.display;
    el.href = `tel:+${s.phone.raw}`;
  });

  /* WhatsApp */
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    const customText = el.dataset.text || s.whatsapp.defaultText;
    const hasOwnText = el.textContent.trim().length > 0;

    if (!hasOwnText) {
      el.textContent = `WhatsApp: ${s.phone.display}`;
    }

    el.href = buildWhatsAppUrl(customText);
  });

  /* Instagram */
  document.querySelectorAll("[data-instagram]").forEach((el) => {
    el.href = s.instagram;
  });

  /* Адрес */
  document.querySelectorAll("[data-address]").forEach((el) => {
    el.textContent = s.address.text;
    el.href = s.address.maps;
  });

  /* Расписание */
  document.querySelectorAll("[data-schedule]").forEach((el) => {
    el.innerHTML = `
      ${s.schedule.weekdays}<br />
      <small>${s.schedule.lunch}</small><br />
      ${s.schedule.saturday}<br />
      ${s.schedule.sunday}
    `;
  });

  /* Footer consistency (phone + Instagram link) */
  const footer = document.querySelector("footer#contacto");
  if (footer) {
    // Ensure Instagram link block exists (some legal pages)
    const hasInstagramLink = footer.querySelector("[data-instagram]");
    const legalBox = footer.querySelector(".footer-legal");

    if (!hasInstagramLink && legalBox) {
      const p = document.createElement("p");
      p.innerHTML = `
        Compartimos ejemplos reales de trabajos, procesos de afilado y resultados antes y después en nuestro
        <a data-instagram target="_blank" rel="noopener noreferrer">Instagram</a>.
      `.trim();
      legalBox.parentElement?.insertBefore(p, legalBox);
    }

    // Ensure phone line exists in contact column (articles/legal/blog often missing)
    const alreadyInjectedPhone =
      footer.querySelector("[data-footer-phone]") !== null;
    const hasPhoneLink = footer.querySelector('a[href^="tel:"]');
    const whatsappLink = footer.querySelector("[data-whatsapp]");
    const scheduleSpan = footer.querySelector("[data-schedule]");

    if (!alreadyInjectedPhone && !hasPhoneLink && whatsappLink) {
      const p = document.createElement("p");
      p.setAttribute("data-footer-phone", "true");
      p.innerHTML = `📞 <a href="tel:+${s.phone.raw}" class="link-text" rel="nofollow">${s.phone.display}</a>`;

      // Put phone before schedule if possible, otherwise after WhatsApp link
      const scheduleP = scheduleSpan?.closest("p");
      if (scheduleP && scheduleP.parentElement) {
        scheduleP.parentElement.insertBefore(p, scheduleP);
      } else {
        const whatsappP = whatsappLink.closest("p");
        if (whatsappP) whatsappP.insertAdjacentElement("afterend", p);
        else footer.appendChild(p);
      }
    }
  }

  /* Legal pages */
  const LEGAL_PAGES = {
    aviso: "/legal/aviso-legal.html",
    privacy: "/legal/politica-privacidad.html",
    cookies: "/legal/politica-cookies.html",
  };

  document.querySelectorAll("[data-legal]").forEach((el) => {
    const key = el.dataset.legal;
    if (LEGAL_PAGES[key]) {
      el.href = LEGAL_PAGES[key];
    }
  });

  /* © Год */
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-copyright]").forEach((el) => {
    el.innerHTML = `&copy; ${year} ${s.copyright.brand} · ${s.copyright.description}`;
  });

  /* Floating contact button */
  const floatingWidget = document.createElement("div");
  floatingWidget.className = "floating-contact";
  floatingWidget.innerHTML = `
    <button class="floating-contact__toggle" type="button" aria-label="Abrir contacto rápido">
      <i class="bi bi-chat-dots-fill"></i>
    </button>

    <div class="floating-contact__panel">
      <a
        class="floating-contact__action"
        href="${buildWhatsAppUrl(
          "Hola, quiero hacer una consulta sobre el afilado de una herramienta."
        )}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i class="bi bi-whatsapp"></i>
        <span>Escribir por WhatsApp</span>
      </a>

      <a
        class="floating-contact__action"
        href="tel:+${s.phone.raw}"
      >
        <i class="bi bi-telephone-fill"></i>
        <span>Llamar ahora</span>
      </a>
    </div>
  `;

  document.body.appendChild(floatingWidget);

  /* Article inline CTA — inject after first .blog-highlight */
  const blogArticle = document.querySelector(".blog-article[data-category]");
  if (blogArticle) {
    const cat = blogArticle.dataset.category;
    const ctaMap = {
      cuchillos: {
        text: "Cuchillos desde <strong>5€</strong>, listos en <strong>15 minutos</strong>.",
        msg: "Hola, quiero afilar cuchillos. ¿Cuándo puedo pasarme?",
      },
      peluqueria: {
        text: "Tijeras de peluquería desde <strong>17€</strong>, listo en el día.",
        msg: "Hola, quiero afilar tijeras de peluquería. ¿Cuándo puedo pasarme?",
      },
      maquinas: {
        text: "Cuchillas de máquina desde <strong>13€</strong>, listo en el día.",
        msg: "Hola, quiero revisar el bloque de mi máquina. ¿Cuándo puedo pasarme?",
      },
      manicura: {
        text: "Herramientas de manicura desde <strong>5€</strong>, listo en el día.",
        msg: "Hola, quiero afilar herramientas de manicura. ¿Cuándo puedo pasarme?",
      },
      reparacion: {
        text: "Evaluación gratuita en taller. Reparaciones <strong>desde 15€</strong>.",
        msg: "Hola, quiero saber si mi herramienta tiene solución. ¿Puedo pasarme?",
      },
      precios: {
        text: "Envíame una foto y te digo el precio <strong>enseguida</strong>.",
        msg: "Hola, ¿me puedes decir cuánto cuesta afilar mi herramienta?",
      },
    };
    const d = ctaMap[cat] || ctaMap["cuchillos"];
    const highlight = blogArticle.querySelector(".blog-highlight");
    if (highlight) {
      const cta = document.createElement("div");
      cta.className = "article-inline-cta";
      cta.innerHTML = `<p class="mb-2">¿Necesitas solucionarlo ya? ${d.text}</p>
        <a href="${buildWhatsAppUrl(
          d.msg
        )}" target="_blank" rel="noopener noreferrer" class="btn-style" style="font-size:0.9rem;padding:10px 22px;">
          <i class="bi bi-whatsapp me-1"></i>Escríbeme por WhatsApp
        </a>`;
      highlight.insertAdjacentElement("afterend", cta);
    }
  }

  const toggleBtn = floatingWidget.querySelector(".floating-contact__toggle");
  const panel = floatingWidget.querySelector(".floating-contact__panel");

  toggleBtn.addEventListener("click", () => {
    floatingWidget.classList.toggle("is-open");
  });

  document.addEventListener("click", (e) => {
    if (!floatingWidget.contains(e.target)) {
      floatingWidget.classList.remove("is-open");
    }
  });
});
