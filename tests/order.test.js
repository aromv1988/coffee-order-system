// Набір Unit-тестів для бізнес-логіки "CoffeeOrder Web System"

// 1. Функція розрахунку суми кошика (Front-end/Back-end logic)
function calculateTotal(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// 2. Валідатор номера телефону (UA format)
function isValidPhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^(\+380|380|0)\d{9}$/;
  return phoneRegex.test(phone.trim());
}

// 3. Валідатор статусу замовлення
function isValidStatus(status) {
  const allowedStatuses = ['NEW', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'];
  return allowedStatuses.includes(status);
}

// Додаткова функція валідації часу самовивозу
function isValidPickupTime(timeStr) {
  if (!timeStr) return false;
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
}

describe('Розширене Unit-тестування (ПЗ 21)', () => {
  test('isValidPickupTime() має правильно валідувати формат часу HH:MM', () => {
    expect(isValidPickupTime('12:45')).toBe(true);
    expect(isValidPickupTime('09:05')).toBe(true);
    expect(isValidPickupTime('25:00')).toBe(false); // Неіснуючий час
    expect(isValidPickupTime('12-45')).toBe(false); // Невірний роздільник
  });
});

// Тестова сюїта (Jest Unit Tests)
describe('Unit-тестування модулів системи CoffeeOrder', () => {

  // Тест 1: Розрахунок кошика
  test('calculateTotal() має правильно підраховувати загальну суму товарів', () => {
    // Arrange (Підготовка)
    const cartItems = [
      { price: 45, quantity: 2 }, // 90
      { price: 55, quantity: 1 }  // 55
    ];

    // Act (Дія)
    const result = calculateTotal(cartItems);

    // Assert (Перевірка)
    expect(result).toBe(145);
  });

  test('calculateTotal() має повертати 0 для порожнього кошика', () => {
    expect(calculateTotal([])).toBe(0);
  });

  // Тест 2: Валідація телефону
  test('isValidPhone() має повертати true для коректних українських номерів', () => {
    // Arrange & Act & Assert
    expect(isValidPhone('+380937104559')).toBe(true);
    expect(isValidPhone('0937104559')).toBe(true);
  });

  test('isValidPhone() має повертати false для некоректних номерів', () => {
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('abc')).toBe(false);
  });

  // Тест 3: Валідація статусу
  test('isValidStatus() має схвалювати лише допустимі статуси', () => {
    expect(isValidStatus('IN_PROGRESS')).toBe(true);
    expect(isValidStatus('INVALID_STATUS')).toBe(false);
  });

});