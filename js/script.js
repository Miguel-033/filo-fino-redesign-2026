document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
     ACTIVE ARTICLE CATEGORY
  =============================== */
  const bodyCategory = document.body.dataset.articleCategory;
  if (bodyCategory) {
    document.querySelectorAll(".blog-tag").forEach((tag) => {
      tag.classList.toggle("active", tag.dataset.category === bodyCategory);
    });
  }

  /* ===============================
     BURGER MENU
  =============================== */
  const burgerToggle = document.getElementById("burgerToggle");
  const burgerMenu = document.getElementById("burgerMenu");
  const closeBurger = document.getElementById("closeBurger");

  const getFocusable = (root) => {
    if (!root) return [];
    const selectors = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    return Array.from(root.querySelectorAll(selectors.join(","))).filter(
      (el) => {
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      }
    );
  };

  let lastFocusBeforeMenu = null;

  const setMenuA11yState = (isOpen) => {
    if (burgerToggle) burgerToggle.setAttribute("aria-expanded", String(isOpen));
    if (burgerMenu) burgerMenu.setAttribute("aria-hidden", String(!isOpen));
  };

  const openBurger = () => {
    if (!burgerMenu) return;
    lastFocusBeforeMenu = document.activeElement;
    burgerMenu.classList.add("open");
    document.body.classList.add("overflow-hidden");
    setMenuA11yState(true);

    // Focus first meaningful control
    const focusables = getFocusable(burgerMenu);
    const first = focusables[0] || burgerMenu;
    requestAnimationFrame(() => first.focus?.());
  };

  const closeBurgerMenu = () => {
    if (!burgerMenu) return;
    burgerMenu.classList.remove("open");
    document.body.classList.remove("overflow-hidden");
    setMenuA11yState(false);

    const toRestore = lastFocusBeforeMenu;
    lastFocusBeforeMenu = null;
    requestAnimationFrame(() => toRestore?.focus?.());
  };

  if (burgerToggle && burgerMenu) {
    burgerToggle.addEventListener("click", () => {
      if (burgerMenu.classList.contains("open")) closeBurgerMenu();
      else openBurger();
    });
  }

  if (closeBurger && burgerMenu) {
    closeBurger.addEventListener("click", () => {
      closeBurgerMenu();
    });
  }

  if (burgerMenu) {
    burgerMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeBurgerMenu();
      });
    });
  }

  // Close on Escape + trap focus while open
  document.addEventListener("keydown", (e) => {
    if (!burgerMenu || !burgerMenu.classList.contains("open")) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeBurgerMenu();
      return;
    }

    if (e.key !== "Tab") return;
    const focusables = getFocusable(burgerMenu);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
      return;
    }

    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ===============================
     NAVBAR SCROLL
  =============================== */
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
  }

  /* ===============================
     CART LOGIC
  =============================== */
  const cartButton = document.getElementById("cartButton");
  const cartCount = document.getElementById("cartCount");
  const cartModalEl = document.getElementById("cartModal");
  const cartItemsContainer = document.getElementById("cart-items");
  const checkoutBtn = document.getElementById("checkoutBtn");

  const cartModal =
    cartModalEl && typeof bootstrap !== "undefined"
      ? new bootstrap.Modal(cartModalEl)
      : null;

  let cart = loadCart();
  updateCartCount();

  function loadCart() {
    try {
      const raw = localStorage.getItem("filofino_cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem("filofino_cart", JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    if (!cartCount) return;
    const total = cart.reduce((s, i) => s + i.qty, 0);
    cartCount.textContent = total;
    cartCount.style.display = total ? "inline-block" : "none";
  }

  function renderCart() {
    if (!cartItemsContainer) return;

    if (!cart.length) {
      cartItemsContainer.innerHTML =
        '<p class="text-center text-muted">Tu carrito está vacío.</p>';
      return;
    }

    let total = 0;

    cartItemsContainer.innerHTML =
      cart
        .map((item) => {
          total += item.price * item.qty;
          return `
          <div class="cart-item">
            <strong>${item.name}</strong>
            <div>
              <button data-dec="${item.id}">−</button>
              <span>${item.qty}</span>
              <button data-inc="${item.id}">+</button>
              <button data-remove="${item.id}">🗑</button>
            </div>
          </div>
        `;
        })
        .join("") +
      `<div class="text-end mt-3"><strong>Total: ${total.toFixed(
        2
      )} €</strong></div>`;
  }

  if (cartButton && cartModal) {
    cartButton.addEventListener("click", () => {
      renderCart();
      cartModal.show();
    });
  }

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (e) => {
      const id =
        e.target.dataset.inc || e.target.dataset.dec || e.target.dataset.remove;
      if (!id) return;

      const item = cart.find((i) => i.id === id);
      if (!item) return;

      if (e.target.dataset.inc) item.qty++;
      if (e.target.dataset.dec) item.qty--;
      if (item.qty <= 0 || e.target.dataset.remove)
        cart = cart.filter((i) => i.id !== id);

      saveCart();
      renderCart();
    });
  }

  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-to-cart]");
    if (!btn) return;

    const product = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: Number(btn.dataset.price),
    };

    if (!product.id || !product.name || isNaN(product.price)) return;

    const existing = cart.find((i) => i.id === product.id);
    existing ? existing.qty++ : cart.push({ ...product, qty: 1 });
    saveCart();
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (!cart.length) return alert("Tu carrito está vacío");

      const text = cart.map((i) => `${i.name} x${i.qty}`).join("%0A");

      window.open(
        `https://wa.me/34614005053?text=Pedido Filofino:%0A${text}`,
        "_blank"
      );
    });
  }
});
