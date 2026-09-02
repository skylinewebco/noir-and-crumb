// Noir & Crumb — signature catalogue. Images map to processed assets.
const A = './assets/img'

export const PRODUCTS = [
  {
    id: 'dark-choc-sea-salt',
    name: 'Dark Chocolate Sea Salt',
    tagline: 'Bittersweet, bold, balanced.',
    price: 6.5,
    img: `${A}/prod-darkchoc.webp`,
    thumb: `${A}/prod-darkchoc-sm.webp`,
    tags: ['Signature', 'Dark'],
    badge: 'Bestseller',
    flavor: { sweet: 2, rich: 5, salt: 4 },
    profile: 'Deep 70% couverture folded into a fudge-dark crumb, finished with flaked Maldon salt.',
    ingredients: ['70% dark couverture', 'Maldon sea salt', 'Brown butter', 'Madagascar vanilla', 'Cane sugar'],
    calories: 320,
  },
  {
    id: 'salted-caramel',
    name: 'Salted Caramel',
    tagline: 'Molten centre, amber pull.',
    price: 6.9,
    img: `${A}/prod-caramel.webp`,
    thumb: `${A}/prod-caramel-sm.webp`,
    tags: ['Signature', 'Caramel'],
    badge: 'Gooey',
    flavor: { sweet: 4, rich: 4, salt: 3 },
    profile: 'A butter cookie hiding a slow-cooked salted caramel core that stretches on the first break.',
    ingredients: ['Slow-cooked caramel', 'Cultured butter', 'Fleur de sel', 'Golden syrup', 'Vanilla bean'],
    calories: 350,
  },
  {
    id: 'double-chocolate',
    name: 'Double Chocolate',
    tagline: 'For the truly devoted.',
    price: 6.9,
    img: `${A}/prod-double.webp`,
    thumb: `${A}/prod-double-sm.webp`,
    tags: ['Signature', 'Dark'],
    badge: 'Rich',
    flavor: { sweet: 3, rich: 5, salt: 2 },
    profile: 'Cocoa-black dough loaded with milk and dark chunks that stay molten to the last bite.',
    ingredients: ['Dutch cocoa', 'Milk & dark chunks', 'Brown butter', 'Espresso salt', 'Muscovado'],
    calories: 360,
  },
  {
    id: 'pistachio-white',
    name: 'Pistachio White Chocolate',
    tagline: 'Roasted green, creamy gold.',
    price: 7.5,
    img: `${A}/prod-pistachio.webp`,
    thumb: `${A}/prod-pistachio-sm.webp`,
    tags: ['Limited', 'Nut'],
    badge: 'Limited',
    flavor: { sweet: 4, rich: 3, salt: 2 },
    profile: 'Sicilian pistachio and melting white couverture over a soft, buttery centre.',
    ingredients: ['Sicilian pistachio', 'White couverture', 'Brown butter', 'Sea salt', 'Vanilla'],
    calories: 340,
  },
  {
    id: 'biscoff-caramel',
    name: 'Biscoff Caramel',
    tagline: 'Spiced, caramelised, warm.',
    price: 7.2,
    img: `${A}/prod-biscoff.webp`,
    thumb: `${A}/prod-biscoff-sm.webp`,
    tags: ['Limited', 'Caramel'],
    badge: 'New',
    flavor: { sweet: 5, rich: 4, salt: 2 },
    profile: 'Speculoos-spiced dough swirled with caramelised biscuit butter and crushed lotus crumb.',
    ingredients: ['Speculoos spread', 'Caramelised biscuit', 'Cinnamon', 'Brown butter', 'Muscovado'],
    calories: 355,
  },
  {
    id: 'hazelnut-praline',
    name: 'Hazelnut Praline',
    tagline: 'Toasted, nutty, decadent.',
    price: 7.5,
    img: `${A}/prod-hazelnut.webp`,
    thumb: `${A}/prod-hazelnut-sm.webp`,
    tags: ['Limited', 'Nut'],
    badge: 'Chef’s pick',
    flavor: { sweet: 3, rich: 5, salt: 2 },
    profile: 'Whole roasted hazelnuts and gianduja praline drizzle over a dark chocolate base.',
    ingredients: ['Roasted hazelnut', 'Gianduja praline', 'Dark chocolate', 'Brown butter', 'Sea salt'],
    calories: 370,
  },
]

export const FILTERS = ['All', 'Signature', 'Limited', 'Dark', 'Caramel', 'Nut']

// Customisation options for the product modal
export const CUSTOMIZE = {
  size: [
    { key: 'single', label: 'Single', mult: 1, note: '1 cookie' },
    { key: 'half', label: 'Half Dozen', mult: 5.4, note: '6 cookies', tag: 'Popular' },
    { key: 'dozen', label: 'Baker’s Dozen', mult: 10, note: '13 cookies', tag: 'Best value' },
  ],
  chocolate: [
    { key: 'dark', label: 'Dark 70%', price: 0 },
    { key: 'milk', label: 'Milk', price: 0 },
    { key: 'white', label: 'White', price: 0.4 },
    { key: 'ruby', label: 'Ruby', price: 0.8 },
  ],
  addons: [
    { key: 'salt', label: 'Extra Sea Salt', price: 0.3 },
    { key: 'caramel', label: 'Caramel Core', price: 0.9 },
    { key: 'hazelnut', label: 'Toasted Hazelnut', price: 0.8 },
    { key: 'pistachio', label: 'Pistachio Crumb', price: 0.9 },
  ],
}

export const INGREDIENTS = [
  { img: `${A}/ing-chocolate.webp`, name: 'Single-Origin Couverture', note: '70% Ghanaian cacao, stone-conched for 48 hours.' },
  { img: `${A}/ing-caramel.webp`, name: 'Slow-Cooked Caramel', note: 'Copper-kettle caramel, salted with fleur de sel.' },
  { img: `${A}/ing-hazelnut.webp`, name: 'Piedmont Hazelnut', note: 'Dry-roasted daily for depth and crunch.' },
  { img: `${A}/ing-pistachio.webp`, name: 'Sicilian Pistachio', note: 'Bronte green pistachio, milled in-house.' },
  { img: `${A}/ing-vanilla.webp`, name: 'Madagascar Vanilla', note: 'Whole pods, split and scraped.' },
  { img: `${A}/ing-butter.webp`, name: 'Cultured Brown Butter', note: 'Browned to a hazelnut nuttiness.' },
]

export const REVIEWS = [
  { name: 'Isabelle R.', city: 'Paris', text: 'The salted caramel actually stretches. I have never sent a photo of a cookie to five people before.', rating: 5 },
  { name: 'Marcus D.', city: 'London', text: 'This is what a $6 cookie should taste like. The dark chocolate sea salt is dangerously good.', rating: 5 },
  { name: 'Yuki T.', city: 'Tokyo', text: 'Packaging felt like unboxing a watch. Then the cookie was still warm-soft in the centre. Unreal.', rating: 5 },
  { name: 'Sofia M.', city: 'Milan', text: 'The pistachio white chocolate is the most elegant cookie I have tasted. Subtle, not sweet.', rating: 5 },
  { name: 'Daniel K.', city: 'New York', text: 'Ordered a baker’s dozen for the office. They were gone in eleven minutes. Reordered same day.', rating: 5 },
]
