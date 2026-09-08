let cart = [];

// 1. Завантаження меню клієнта (GET /api/menu)
async function loadMenu() {
  const loader = document.getElementById('loader');
  const errorMsg = document.getElementById('error-message');
  const menuGrid = document.getElementById('menu-grid');

  if (!menuGrid) return; // Якщо на сторінці бариста

  try {
    loader.classList.remove('d-none');
    const response = await fetch('/api/menu');
    
    if (!response.ok) throw new Error('Не вдалося завантажити меню з сервера');
    
    const menuItems = await response.json();
    loader.classList.add('d-none');

    menuGrid.innerHTML = '';
    menuItems.forEach(item => {
      menuGrid.innerHTML += `
        <div class="col">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <span class="badge bg-secondary mb-2">${item.category}</span>
              <h5 class="card-title">${item.title}</h5>
              <p class="card-text text-muted small">${item.description || ''}</p>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <span class="fw-bold fs-5 text-success">${item.price} грн</span>
                <button onclick="addToCart(${item.id}, '${item.title}', ${item.price})" class="btn btn-coffee btn-sm">
                  + У кошик
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) {
    loader.classList.add('d-none');
    errorMsg.classList.remove('d-none');
    errorMsg.innerText = err.message;
  }
}

// 2. Логіка кошика
function addToCart(id, title, price) {
  const existing = cart.find(i => i.menu_id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ menu_id: id, title, price, quantity: 1 });
  }
  updateCartUI();
}

function updateCartUI() {
  const cartCount = document.getElementById('cart-count');
  const cartList = document.getElementById('cart-items-list');
  const cartTotal = document.getElementById('cart-total');

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartCount) cartCount.innerText = totalCount;
  if (cartTotal) cartTotal.innerText = totalPrice.toFixed(2) + ' грн';

  if (cartList) {
    cartList.innerHTML = '';
    cart.forEach(item => {
      cartList.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <h6 class="my-0">${item.title}</h6>
            <small class="text-muted">${item.price} грн x ${item.quantity}</small>
          </div>
          <span class="fw-bold">${(item.price * item.quantity).toFixed(2)} грн</span>
        </li>
      `;
    });
  }
}

// 3. Відправка замовлення (POST /api/orders)
const orderForm = document.getElementById('order-form');
if (orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Ваш кошик порожній!');
      return;
    }

    const orderData = {
      customer_name: document.getElementById('cust-name').value,
      customer_phone: document.getElementById('cust-phone').value,
      pickup_time: document.getElementById('cust-time').value,
      comment: document.getElementById('cust-comment').value,
      items: cart
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Дякуємо! ${result.message} № замовлення: ${result.order_id}`);
        cart = [];
        updateCartUI();
        orderForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
      } else {
        alert(`Помилка: ${result.error}`);
      }
    } catch (err) {
      alert("Помилка з'єднання із сервером!");
    }
  });
}

// 4. Логіка Дашборду Бариста (GET /api/orders, PUT status)
async function loadBaristaOrders() {
  const container = document.getElementById('barista-orders-list');
  if (!container) return;

  try {
    const response = await fetch('/api/orders');
    const orders = await response.json();

    container.innerHTML = '';
    orders.forEach(order => {
      const itemsList = order.items.map(i => `<li>${i.title} x${i.quantity}</li>`).join('');
      
      let statusBadge = '<span class="badge bg-warning text-dark">Нове</span>';
      if (order.status === 'IN_PROGRESS') statusBadge = '<span class="badge bg-info">Готується</span>';
      if (order.status === 'READY') statusBadge = '<span class="badge bg-success">Готово</span>';

      container.innerHTML += `
        <div class="col">
          <div class="card card-order h-100 shadow">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Замовлення №${order.id}</h5>
              ${statusBadge}
            </div>
            <div class="card-body">
              <p><strong>Клієнт:</strong> ${order.customer_name} (${order.customer_phone})</p>
              <p><strong>Час самовивозу:</strong> <span class="badge bg-primary fs-6">${order.pickup_time}</span></p>
              <p><strong>Коментар:</strong> ${order.comment || '—'}</p>
              <h6>Склад замовлення:</h6>
              <ul>${itemsList}</ul>
              <h5 class="text-success mt-3">Сума: ${order.total_price} грн</h5>
            </div>
            <div class="card-footer d-flex gap-2">
              <button onclick="changeStatus(${order.id}, 'IN_PROGRESS')" class="btn btn-outline-info btn-sm w-50">В роботу</button>
              <button onclick="changeStatus(${order.id}, 'READY')" class="btn btn-success btn-sm w-50">Готово</button>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error('Помилка завантаження замовлень бариста:', err);
  }
}

async function changeStatus(id, newStatus) {
  try {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    loadBaristaOrders();
  } catch (err) {
    alert('Не вдалося оновити статус');
  }
}

// Ініціалізація завантаження меню при відкритті
document.addEventListener('DOMContentLoaded', loadMenu);