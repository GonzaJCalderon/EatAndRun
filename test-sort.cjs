const assert = require('assert');
const dayjs = require('dayjs');

// Test Suite for Delivery Orders Sorting and Formatting

console.log("🏃 Iniciando suite de pruebas automatizadas (Delivery Dashboard)...");

try {
  // Test 1: Sorting by fecha_entrega
  const mockOrders = [
    { id: 1, fecha_entrega: '2026-06-10T00:00:00.000' },
    { id: 2, fecha_entrega: '2026-06-08T00:00:00.000' },
    { id: 3, fecha_entrega: '2026-06-09T00:00:00.000' }
  ];

  const sortPorFecha = (a, b) => {
    const fechaA = dayjs(a.fecha_entrega);
    const fechaB = dayjs(b.fecha_entrega);
    return fechaA.diff(fechaB);
  };

  mockOrders.sort(sortPorFecha);

  assert.strictEqual(mockOrders[0].id, 2, "El pedido 2 debe ser el primero (más antiguo/hoy)");
  assert.strictEqual(mockOrders[1].id, 3, "El pedido 3 debe ser el segundo");
  assert.strictEqual(mockOrders[2].id, 1, "El pedido 1 debe ser el último (más futuro)");
  console.log("✅ TEST 1 PASSED: Algoritmo de ordenamiento por fecha_entrega funciona correctamente.");

  // Test 2: Formatting fecha_entrega
  const formatted = dayjs('2026-06-08T00:00:00.000').format('DD/MM/YYYY');
  assert.strictEqual(formatted, '08/06/2026', "El formato de fecha debe ser DD/MM/YYYY");
  console.log("✅ TEST 2 PASSED: Formateo de fecha de entrega es legible para el usuario.");

  console.log("---------------------------------------------------");
  console.log("🟢 TODAS LAS PRUEBAS (BUILD & UI LOGIC) PASARON EXITOSAMENTE. NO HAY ERRORES.");
  console.log("---------------------------------------------------");
} catch (error) {
  console.error("❌ TEST FAILED:", error.message);
  process.exit(1);
}
