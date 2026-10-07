import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function statusFor(stock: number, reorder: number) {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= reorder) return "LOW_STOCK";
  return "IN_STOCK";
}

async function main() {
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.supplier.deleteMany({});

  const categories = await Promise.all(
    [
      { name: "Smartphones", description: "Mobile phones and accessories" },
      { name: "Laptops", description: "Notebooks and ultrabooks" },
      { name: "Audio", description: "Headphones, earbuds and speakers" },
      { name: "Shoes", description: "Footwear" },
      { name: "Clothing", description: "Apparel" },
      { name: "Home Appliances", description: "Home and kitchen appliances" },
      { name: "Accessories", description: "Cases, chargers and peripherals" },
    ].map((c) => prisma.category.create({ data: c }))
  );
  const cat = Object.fromEntries(categories.map((c) => [c.name, c]));

  const suppliers = await Promise.all(
    [
      { name: "Electro Distributors", email: "sales@electro-dist.in", phone: "+91-98200-11111", company: "Electro Distributors Pvt Ltd", address: { street: "14 MIDC Road", city: "Mumbai", state: "MH", zip: "400093" } },
      { name: "SoundSource", email: "hello@soundsource.in", phone: "+91-98200-22222", company: "SoundSource", address: { street: "8 Studio Lane", city: "Bengaluru", state: "KA", zip: "560001" } },
      { name: "FootWorld", email: "trade@footworld.in", phone: "+91-98200-33333", company: "FootWorld Traders", address: { street: "22 Market Rd", city: "Delhi", state: "DL", zip: "110001" } },
      { name: "HomeNeeds Co", email: "orders@homeneeds.in", phone: "+91-98200-44444", company: "HomeNeeds Co", address: { street: "5 Industrial Estate", city: "Chennai", state: "TN", zip: "600001" } },
      { name: "GadgetHub", email: "supply@gadgethub.in", phone: "+91-98200-55555", company: "GadgetHub", address: { street: "11 Tech Park", city: "Hyderabad", state: "TS", zip: "500001" } },
      { name: "ApparelLine", email: "b2b@apparelline.in", phone: "+91-98200-66666", company: "ApparelLine", address: { street: "3 Textile Nagar", city: "Surat", state: "GJ", zip: "395001" } },
    ].map((s) => prisma.supplier.create({ data: s }))
  );
  const sup = Object.fromEntries(suppliers.map((s) => [s.name, s]));

  const products: Array<Parameters<typeof prisma.product.create>[0]["data"]> = [
    { name: "Galaxy S25", sku: "SAM-025", description: "Flagship smartphone with 120Hz display", categoryId: cat["Smartphones"].id, supplierId: sup["Electro Distributors"].id, price: 74999, costPrice: 62000, stockQuantity: 42, reorderLevel: 10, status: "IN_STOCK", attributes: { screenSize: "6.7 inch", ram: "12 GB", storage: "256 GB", battery: "5000 mAh" }, tags: ["smartphone", "5g"], images: [] },
    { name: "Pixel 9", sku: "GOO-009", description: "Clean Android experience", categoryId: cat["Smartphones"].id, supplierId: sup["Electro Distributors"].id, price: 79999, costPrice: 66000, stockQuantity: 6, reorderLevel: 10, status: "LOW_STOCK", attributes: { screenSize: "6.3 inch", ram: "12 GB", storage: "128 GB", battery: "4700 mAh" }, tags: ["smartphone"], images: [] },
    { name: "iPhone 16", sku: "APL-016", description: "Latest iPhone", categoryId: cat["Smartphones"].id, supplierId: sup["GadgetHub"].id, price: 89900, costPrice: 74000, stockQuantity: 0, reorderLevel: 5, status: "OUT_OF_STOCK", attributes: { screenSize: "6.1 inch", ram: "8 GB", storage: "128 GB" }, tags: ["smartphone", "ios"], images: [] },
    { name: "ThinkPad X1 Carbon", sku: "LEN-X1C", description: "Business ultrabook", categoryId: cat["Laptops"].id, supplierId: sup["Electro Distributors"].id, price: 145000, costPrice: 120000, stockQuantity: 18, reorderLevel: 5, status: "IN_STOCK", attributes: { processor: "Intel Core Ultra 7", ram: "32 GB", storage: "1 TB SSD", screenSize: "14 inch" }, tags: ["laptop", "business"], images: [] },
    { name: "MacBook Air M3", sku: "APL-MBA3", description: "Thin and light laptop", categoryId: cat["Laptops"].id, supplierId: sup["GadgetHub"].id, price: 114900, costPrice: 95000, stockQuantity: 4, reorderLevel: 6, status: "LOW_STOCK", attributes: { processor: "Apple M3", ram: "16 GB", storage: "512 GB SSD", screenSize: "13.6 inch" }, tags: ["laptop"], images: [] },
    { name: "ZenBook 14", sku: "ASU-Z14", description: "OLED ultraportable", categoryId: cat["Laptops"].id, supplierId: sup["Electro Distributors"].id, price: 89990, costPrice: 74000, stockQuantity: 25, reorderLevel: 8, status: "IN_STOCK", attributes: { processor: "AMD Ryzen 7", ram: "16 GB", storage: "1 TB SSD", screenSize: "14 inch OLED" }, tags: ["laptop"], images: [] },
    { name: "Sony WH-1000XM6", sku: "SON-006", description: "Flagship noise cancelling headphones", categoryId: cat["Audio"].id, supplierId: sup["SoundSource"].id, price: 29999, costPrice: 21000, stockQuantity: 8, reorderLevel: 10, status: "LOW_STOCK", attributes: { type: "Over-ear", noiseCancellation: true, batteryLife: "30 hours", connectivity: "Bluetooth 5.3" }, tags: ["headphones", "anc"], images: [] },
    { name: "AirPods Pro 2", sku: "APL-APP2", description: "Wireless earbuds", categoryId: cat["Audio"].id, supplierId: sup["GadgetHub"].id, price: 24900, costPrice: 18000, stockQuantity: 60, reorderLevel: 15, status: "IN_STOCK", attributes: { type: "In-ear", noiseCancellation: true, batteryLife: "24 hours", connectivity: "Bluetooth 5.3" }, tags: ["earbuds"], images: [] },
    { name: "JBL Flip 6", sku: "JBL-FL6", description: "Portable bluetooth speaker", categoryId: cat["Audio"].id, supplierId: sup["SoundSource"].id, price: 11999, costPrice: 8500, stockQuantity: 0, reorderLevel: 12, status: "OUT_OF_STOCK", attributes: { type: "Speaker", batteryLife: "12 hours", waterproof: "IP67" }, tags: ["speaker"], images: [] },
    { name: "Bose QC Earbuds", sku: "BOS-QCE", description: "Comfortable ANC earbuds", categoryId: cat["Audio"].id, supplierId: sup["SoundSource"].id, price: 26900, costPrice: 19500, stockQuantity: 22, reorderLevel: 8, status: "IN_STOCK", attributes: { type: "In-ear", noiseCancellation: true, batteryLife: "18 hours" }, tags: ["earbuds"], images: [] },
    { name: "Air Max Pulse", sku: "NKE-421", description: "Running shoes", categoryId: cat["Shoes"].id, supplierId: sup["FootWorld"].id, price: 8999, costPrice: 5200, stockQuantity: 0, reorderLevel: 20, status: "OUT_OF_STOCK", attributes: { sizes: [7, 8, 9, 10], material: "Mesh", gender: "Unisex" }, tags: ["shoes", "running"], images: [] },
    { name: "Ultraboost 5", sku: "ADI-UB5", description: "Daily trainer", categoryId: cat["Shoes"].id, supplierId: sup["FootWorld"].id, price: 11999, costPrice: 7000, stockQuantity: 15, reorderLevel: 20, status: "LOW_STOCK", attributes: { sizes: [8, 9, 10, 11], material: "Primeknit", gender: "Men" }, tags: ["shoes"], images: [] },
    { name: "Classic Sneakers", sku: "PUM-CL1", description: "Casual sneakers", categoryId: cat["Shoes"].id, supplierId: sup["FootWorld"].id, price: 4999, costPrice: 2800, stockQuantity: 120, reorderLevel: 30, status: "IN_STOCK", attributes: { sizes: [6, 7, 8, 9, 10], material: "Canvas", gender: "Unisex" }, tags: ["shoes", "casual"], images: [] },
    { name: "Cotton T-Shirt", sku: "APP-TS1", description: "Basic crew neck tee", categoryId: cat["Clothing"].id, supplierId: sup["ApparelLine"].id, price: 799, costPrice: 350, stockQuantity: 300, reorderLevel: 50, status: "IN_STOCK", attributes: { sizes: ["S", "M", "L", "XL"], material: "100% Cotton", gender: "Unisex" }, tags: ["clothing"], images: [] },
    { name: "Denim Jacket", sku: "APP-DJ2", description: "Classic denim jacket", categoryId: cat["Clothing"].id, supplierId: sup["ApparelLine"].id, price: 2499, costPrice: 1400, stockQuantity: 9, reorderLevel: 15, status: "LOW_STOCK", attributes: { sizes: ["M", "L", "XL"], material: "Denim", gender: "Men" }, tags: ["clothing"], images: [] },
    { name: "Hoodie Oversized", sku: "APP-HD3", description: "Fleece hoodie", categoryId: cat["Clothing"].id, supplierId: sup["ApparelLine"].id, price: 1499, costPrice: 800, stockQuantity: 85, reorderLevel: 25, status: "IN_STOCK", attributes: { sizes: ["S", "M", "L"], material: "Fleece", gender: "Women" }, tags: ["clothing"], images: [] },
    { name: "Air Fryer 4L", sku: "HOM-AF4", description: "Digital air fryer", categoryId: cat["Home Appliances"].id, supplierId: sup["HomeNeeds Co"].id, price: 8990, costPrice: 6100, stockQuantity: 34, reorderLevel: 10, status: "IN_STOCK", attributes: { capacity: "4 L", power: "1500 W", warranty: "2 years" }, tags: ["kitchen"], images: [] },
    { name: "Mixer Grinder", sku: "HOM-MG7", description: "750W mixer grinder", categoryId: cat["Home Appliances"].id, supplierId: sup["HomeNeeds Co"].id, price: 5490, costPrice: 3800, stockQuantity: 7, reorderLevel: 12, status: "LOW_STOCK", attributes: { jars: 4, power: "750 W", warranty: "5 years motor" }, tags: ["kitchen"], images: [] },
    { name: "Robot Vacuum", sku: "HOM-RV1", description: "Smart robot vacuum", categoryId: cat["Home Appliances"].id, supplierId: sup["HomeNeeds Co"].id, price: 24990, costPrice: 18000, stockQuantity: 11, reorderLevel: 5, status: "IN_STOCK", attributes: { suction: "4000 Pa", batteryLife: "180 min", connectivity: "Wi-Fi" }, tags: ["cleaning"], images: [] },
    { name: "USB-C Charger 65W", sku: "ACC-CH65", description: "GaN fast charger", categoryId: cat["Accessories"].id, supplierId: sup["GadgetHub"].id, price: 1999, costPrice: 1100, stockQuantity: 200, reorderLevel: 40, status: "IN_STOCK", attributes: { power: "65 W", ports: 2, technology: "GaN" }, tags: ["charger"], images: [] },
    { name: "Phone Case Clear", sku: "ACC-PC1", description: "Transparent phone case", categoryId: cat["Accessories"].id, supplierId: sup["GadgetHub"].id, price: 499, costPrice: 180, stockQuantity: 500, reorderLevel: 100, status: "IN_STOCK", attributes: { material: "TPU", compatible: ["Galaxy S25", "Pixel 9"] }, tags: ["case"], images: [] },
    { name: "Mechanical Keyboard", sku: "ACC-KB9", description: "Hot-swap keyboard", categoryId: cat["Accessories"].id, supplierId: sup["GadgetHub"].id, price: 6999, costPrice: 4600, stockQuantity: 3, reorderLevel: 10, status: "LOW_STOCK", attributes: { switches: "Brown", layout: "75%", connectivity: "Bluetooth + USB-C" }, tags: ["keyboard"], images: [] },
    { name: "Wireless Mouse", sku: "ACC-MS4", description: "Ergonomic mouse", categoryId: cat["Accessories"].id, supplierId: sup["GadgetHub"].id, price: 1499, costPrice: 850, stockQuantity: 140, reorderLevel: 30, status: "IN_STOCK", attributes: { dpi: 4000, batteryLife: "12 months", connectivity: "2.4 GHz + BT" }, tags: ["mouse"], images: [] },
    { name: "Galaxy Tab S9", sku: "SAM-TS9", description: "11 inch tablet", categoryId: cat["Smartphones"].id, supplierId: sup["Electro Distributors"].id, price: 72999, costPrice: 60000, stockQuantity: 16, reorderLevel: 8, status: "IN_STOCK", attributes: { screenSize: "11 inch", ram: "8 GB", storage: "128 GB", battery: "8400 mAh" }, tags: ["tablet"], images: [] },
    { name: "Washing Machine 7kg", sku: "HOM-WM7", description: "Front load washer", categoryId: cat["Home Appliances"].id, supplierId: sup["HomeNeeds Co"].id, price: 32990, costPrice: 24500, stockQuantity: 5, reorderLevel: 6, status: "LOW_STOCK", attributes: { capacity: "7 kg", rpm: 1200, warranty: "10 years motor" }, tags: ["laundry"], images: [] },
    { name: "Kurta Cotton", sku: "APP-KU8", description: "Men's cotton kurta", categoryId: cat["Clothing"].id, supplierId: sup["ApparelLine"].id, price: 1299, costPrice: 650, stockQuantity: 60, reorderLevel: 20, status: "IN_STOCK", attributes: { sizes: ["M", "L", "XL", "XXL"], material: "Cotton", gender: "Men" }, tags: ["clothing"], images: [] },
  ];

  const created: { id: string; stockQuantity: number }[] = [];
  for (const p of products) {
    const sq = (p as { stockQuantity?: number }).stockQuantity ?? 0;
    const rl = (p as { reorderLevel?: number }).reorderLevel ?? 10;
    const doc = await prisma.product.create({ data: { ...p, status: statusFor(sq, rl) } });
    created.push({ id: doc.id, stockQuantity: doc.stockQuantity });
  }

  const reasons = ["Supplier delivery", "Opening stock", "Customer return", "Cycle count correction", "Damaged goods write-off"];
  const types = ["STOCK_IN", "STOCK_OUT", "ADJUSTMENT", "RETURN"];
  const tx: Array<{ productId: string; type: string; quantity: number; previousQuantity: number; newQuantity: number; reason: string; createdAt: Date }> = [];
  created.forEach((c, i) => {
    const n = 1 + (i % 2);
    for (let k = 0; k < n; k++) {
      const qty = 2 + ((i * 3 + k * 7) % 20);
      const type = types[(i + k) % types.length];
      tx.push({
        productId: c.id,
        type,
        quantity: qty,
        previousQuantity: Math.max(0, c.stockQuantity - qty),
        newQuantity: c.stockQuantity,
        reason: reasons[(i + k) % reasons.length],
        createdAt: new Date(Date.now() - (i * 36 + k * 11) * 3600_000),
      });
    }
  });
  for (const t of tx.slice(0, 40)) {
    await prisma.inventoryTransaction.create({ data: t });
  }

  console.log(`Seeded ${categories.length} categories, ${suppliers.length} suppliers, ${created.length} products, ${Math.min(tx.length, 40)} transactions`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
