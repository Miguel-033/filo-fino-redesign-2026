document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const categoryFromUrl = params.get("category") || "all";

  const buttons = document.querySelectorAll(".blog-tag[data-category]");
  const cards = document.querySelectorAll("#blogArticlesGrid .blog-card");

  if (!buttons.length || !cards.length) return;

  function applyFilter(category) {
    buttons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === category);
    });

    cards.forEach((card) => {
      card.style.display =
        category === "all" || card.dataset.category === category
          ? "block"
          : "none";
    });

    if (typeof window.renderFeaturedCards === "function") {
      window.renderFeaturedCards(category);
    }
  }

  applyFilter(categoryFromUrl);

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const category = btn.dataset.category || "all";
      history.replaceState(null, "", `?category=${category}`);
      applyFilter(category);
    });
  });
});
