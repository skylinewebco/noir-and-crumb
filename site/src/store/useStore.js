import { create } from 'zustand'
import { PRODUCTS, CUSTOMIZE } from '../data/products'

const LS = 'noir-crumb-v1'
const load = () => {
  try { return JSON.parse(localStorage.getItem(LS)) || {} } catch { return {} }
}
const persisted = load()

const save = (state) => {
  try {
    localStorage.setItem(LS, JSON.stringify({
      cart: state.cart, wishlist: state.wishlist, user: state.user, theme: state.theme,
    }))
  } catch {}
}

const getInitialTheme = () => {
  // Dark-first premium brand ("Noir"). Respect a returning visitor's choice.
  if (persisted.theme === 'light' || persisted.theme === 'dark') return persisted.theme
  return 'dark'
}

// price for a configured line item
export const linePrice = (item) => {
  const base = item.price
  const sizeMult = CUSTOMIZE.size.find((s) => s.key === item.size)?.mult ?? 1
  const choc = CUSTOMIZE.chocolate.find((c) => c.key === item.chocolate)?.price ?? 0
  const addons = (item.addons || []).reduce((s, k) => s + (CUSTOMIZE.addons.find((a) => a.key === k)?.price ?? 0), 0)
  return (base * sizeMult + choc + addons) * item.qty
}

const lineKey = (i) => `${i.id}|${i.size}|${i.chocolate}|${[...(i.addons || [])].sort().join(',')}`

export const useStore = create((set, get) => ({
  theme: getInitialTheme(),
  cart: persisted.cart || [],
  wishlist: persisted.wishlist || [],
  user: persisted.user || null,

  // UI
  ui: { cart: false, auth: false, checkout: false, menu: false, product: null },
  toasts: [],
  ready: false,

  setReady: (v) => set({ ready: v }),

  toggleTheme: () => set((s) => {
    const theme = s.theme === 'dark' ? 'light' : 'dark'
    const next = { ...s, theme }; save(next); return { theme }
  }),

  openUI: (key, val = true) => set((s) => ({ ui: { ...s.ui, [key]: val } })),
  closeAll: () => set((s) => ({ ui: { ...s.ui, cart: false, auth: false, checkout: false, menu: false, product: null } })),
  openProduct: (id) => set((s) => ({ ui: { ...s.ui, product: id } })),

  toast: (msg, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { id, msg, kind }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2600)
  },

  addToCart: (config) => set((s) => {
    const base = PRODUCTS.find((p) => p.id === config.id)
    const item = {
      id: config.id, name: base.name, img: base.thumb, price: base.price,
      size: config.size || 'single', chocolate: config.chocolate || 'dark',
      addons: config.addons || [], qty: config.qty || 1,
    }
    const key = lineKey(item)
    const existing = s.cart.find((c) => lineKey(c) === key)
    let cart
    if (existing) cart = s.cart.map((c) => (lineKey(c) === key ? { ...c, qty: c.qty + item.qty } : c))
    else cart = [...s.cart, item]
    const next = { ...s, cart }; save(next)
    return { cart }
  }),

  updateQty: (key, delta) => set((s) => {
    const cart = s.cart
      .map((c) => (lineKey(c) === key ? { ...c, qty: Math.max(0, c.qty + delta) } : c))
      .filter((c) => c.qty > 0)
    const next = { ...s, cart }; save(next); return { cart }
  }),

  removeLine: (key) => set((s) => {
    const cart = s.cart.filter((c) => lineKey(c) !== key)
    const next = { ...s, cart }; save(next); return { cart }
  }),

  clearCart: () => set((s) => { const next = { ...s, cart: [] }; save(next); return { cart: [] } }),

  toggleWishlist: (id) => set((s) => {
    const wishlist = s.wishlist.includes(id) ? s.wishlist.filter((w) => w !== id) : [...s.wishlist, id]
    const next = { ...s, wishlist }; save(next); return { wishlist }
  }),

  signIn: (user) => set((s) => { const next = { ...s, user }; save(next); return { user } }),
  signOut: () => set((s) => { const next = { ...s, user: null }; save(next); return { user: null } }),
}))

export { lineKey }
export const cartCount = (cart) => cart.reduce((n, c) => n + c.qty, 0)
export const cartTotal = (cart) => cart.reduce((n, c) => n + linePrice(c), 0)
