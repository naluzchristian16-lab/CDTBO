/* ================= CATEGORIES ================= */
export const categories = [
  "All Products",
  "Hot Drinks",
  "Iced Coffee",
  "Non-Coffee",
  "Matcha Collection",
  "Oatside Series"
];

/* ================= PRODUCTS ================= */
export const products = [

  // ─── HOT DRINKS ───────────────────────────────────────────────────────────
  {
    id: "hot_americano_12oz",
    name: "Hot Americano",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 69 }
  },
  {
    id: "hot_spanish_latte_12oz",
    name: "Hot Spanish Latte",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 79 }
  },
  {
    id: "hot_mocha_12oz",
    name: "Hot Mocha",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 79 }
  },
  {
    id: "hot_caramel_macchiato_12oz",
    name: "Hot Caramel Macchiato",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 89 }
  },
  {
    id: "hot_dirty_matcha_12oz",
    name: "Hot Dirty Matcha",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 89 }
  },
  {
    id: "hot_matcha_latte_12oz",
    name: "Hot Matcha Latte",
    category: "Hot Drinks",
    coffee: false,
    singleSize: true,
    size: { label: "12oz", price: 79 }
  },
  {
    id: "hot_strawberry_dirty_matcha_12oz",
    name: "Hot Strawberry Dirty Matcha",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 99 }
  },
  {
    id: "hot_strawberry_mocha_12oz",
    name: "Hot Strawberry Mocha",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 89 }
  },
  {
    id: "hot_strawberry_latte_12oz",
    name: "Hot Strawberry Latte",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 89 }
  },
  {
    id: "hot_strawberry_matcha_12oz",
    name: "Hot Strawberry Matcha",
    category: "Hot Drinks",
    coffee: false,
    singleSize: true,
    size: { label: "12oz", price: 89 }
  },

  // ─── ICED COFFEE ──────────────────────────────────────────────────────────
  {
    id: "iced_americano",
    name: "Iced Americano",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 89 },
      { label: "Mas Malaki", price: 99 }
    ]
  },
  {
    id: "iced_spanish_latte",
    name: "Iced Spanish Latte",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 89 },
      { label: "Mas Malaki", price: 99 }
    ]
  },
  {
    id: "iced_mocha",
    name: "Iced Mocha",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 89 },
      { label: "Mas Malaki", price: 99 }
    ]
  },
  {
    id: "iced_caramel_macchiato",
    name: "Iced Caramel Macchiato",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  },
  {
    id: "iced_strawberry_latte",
    name: "Iced Strawberry Latte",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  },
  {
    id: "iced_strawberry_mocha",
    name: "Iced Strawberry Mocha",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  },

  // ─── MATCHA COLLECTION ────────────────────────────────────────────────────
  {
    id: "iced_matcha_latte",
    name: "Iced Matcha Latte",
    category: "Matcha Collection",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 89 },
      { label: "Mas Malaki", price: 99 }
    ]
  },
  {
    id: "iced_dirty_matcha",
    name: "Iced Dirty Matcha",
    category: "Matcha Collection",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  },
  {
    id: "iced_strawberry_dirty_matcha",
    name: "Iced Strawberry Dirty Matcha",
    category: "Matcha Collection",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 109 },
      { label: "Mas Malaki", price: 119 }
    ]
  },
  {
    id: "iced_strawberry_matcha",
    name: "Iced Strawberry Matcha",
    category: "Matcha Collection",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  },
  {
    id: "iced_blueberry_matcha",
    name: "Iced Blueberry Matcha",
    category: "Matcha Collection",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  },

  // ─── OATSIDE SERIES ───────────────────────────────────────────────────────
  {
    id: "oatside_spanish_latte",
    name: "Oatside Spanish Latte",
    category: "Oatside Series",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  },
  {
    id: "oatside_matcha_latte",
    name: "Oatside Matcha Latte",
    category: "Oatside Series",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  },
  {
    id: "oatside_strawberry_matcha",
    name: "Oatside Strawberry Matcha",
    category: "Oatside Series",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 109 },
      { label: "Mas Malaki", price: 119 }
    ]
  },
  {
    id: "oatside_strawberry_dirty_matcha",
    name: "Oatside Strawberry Dirty Matcha",
    category: "Oatside Series",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 119 },
      { label: "Mas Malaki", price: 129 }
    ]
  },
  {
    id: "oatside_strawberry_latte",
    name: "Oatside Strawberry Latte",
    category: "Oatside Series",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 109 },
      { label: "Mas Malaki", price: 119 }
    ]
  },
  {
    id: "oatside_caramel_macchiato",
    name: "Oatside Caramel Macchiato",
    category: "Oatside Series",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 109 },
      { label: "Mas Malaki", price: 119 }
    ]
  },
  {
    id: "oatside_dirty_matcha",
    name: "Oatside Dirty Matcha",
    category: "Oatside Series",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 109 },
      { label: "Mas Malaki", price: 119 }
    ]
  },

  // ─── NON-COFFEE ───────────────────────────────────────────────────────────
  {
    id: "strawberry_milk_drink",
    name: "Strawberry Milk Drink",
    category: "Non-Coffee",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 79 },
      { label: "Mas Malaki", price: 89 }
    ]
  },
  {
    id: "blueberry_milk_drink",
    name: "Blueberry Milk Drink",
    category: "Non-Coffee",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 79 },
      { label: "Mas Malaki", price: 89 }
    ]
  },
  {
    id: "strawberry_choco",
    name: "Strawberry Choco",
    category: "Non-Coffee",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 78 },
      { label: "Mas Malaki", price: 89 }
    ]
  },
  {
    id: "green_apple_soda",
    name: "Green Apple Soda",
    category: "Non-Coffee",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 69 },
      { label: "Mas Malaki", price: 79 }
    ]
  },
  {
    id: "blueberry_soda",
    name: "Blueberry Soda",
    category: "Non-Coffee",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 69 },
      { label: "Mas Malaki", price: 79 }
    ]
  }
];
