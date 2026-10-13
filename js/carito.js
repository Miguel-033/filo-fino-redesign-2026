const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartModal = new bootstrap.Modal(document.getElementById("cartModal"));
const cartItemsContainer = document.getElementById("cart-items");
let cart = [];

// Добавить товар
function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartUI();
}

// Удалить товар
function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  updateCartUI();
}

// Изменить количество
function changeQuantity(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) removeFromCart(id);
  }
  updateCartUI();
}

// Обновить интерфейс
function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  cartCount.textContent = count;
  cartCount.style.display = count > 0 ? "inline-block" : "none";
  cartButton.classList.toggle("active", count > 0);

  if (count === 0) {
    cartItemsContainer.innerHTML = `<p class="text-center text-muted">Tu carrito está vacío.</p>`;
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <div class="d-flex align-items-center gap-3">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <strong>${item.name}</strong><br>
            <small>${item.price.toFixed(2)} €</small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button onclick="changeQuantity(${item.id}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity(${item.id}, 1)">+</button>
          <button onclick="removeFromCart(${
            item.id
          })"><i class="bi bi-trash"></i></button>
        </div>
      </div>`
    )
    .join("");

  total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartItemsContainer.innerHTML += `
    <div class="text-end mt-4">
      <h5>Total: <strong>${total.toFixed(2)} €</strong></h5>
    </div>`;
}

// Открытие корзины
cartButton.addEventListener("click", () => cartModal.show());
