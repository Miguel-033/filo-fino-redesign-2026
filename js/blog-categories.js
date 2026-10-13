document.addEventListener("DOMContentLoaded", () => {
  if (!window.BLOG || !BLOG.categories) return;

  const container = document.getElementById("blogCategories");
  if (!container) return;

  const currentCategory =
    document.body.dataset.articleCategory ||
    new URLSearchParams(window.location.search).get("category") ||
    "all";

  container.innerHTML = `
    <button class="blog-tag ${
      currentCategory === "all" ? "active" : ""
    }" data-category="all">
      Todas
    </button>
  `;

  BLOG.categories
    .sort((a, b) => a.priority - b.priority)
    .forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "blog-tag";
      btn.dataset.category = cat.id; // ← ВАЖНО
      btn.textContent = cat.label;

      if (cat.id === currentCategory) {
        btn.classList.add("active");
      }

      container.appendChild(btn);
    });
});
