"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "common-form-cart";
const serverSnapshot = { items: [], ready: false, storageError: "" };
let clientSnapshot = serverSnapshot;
let storageLoaded = false;
const listeners = new Set();

function isCartItem(item) {
  return (
    item &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    Number.isFinite(item.price) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

function readStorage() {
  if (storageLoaded || typeof window === "undefined") return clientSnapshot;

  storageLoaded = true;
  try {
    const savedCart = window.localStorage.getItem(STORAGE_KEY);
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];
    if (!Array.isArray(parsedCart)) {
      throw new Error("Saved cart data was not an item list.");
    }
    clientSnapshot = {
      items: parsedCart.filter(isCartItem),
      ready: true,
      storageError: "",
    };
  } catch (error) {
    console.error("Could not restore the saved cart:", error);
    clientSnapshot = {
      items: [],
      ready: true,
      storageError: "Your saved cart could not be restored on this device.",
    };
  }

  return clientSnapshot;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  if (typeof window === "undefined") return () => listeners.delete(listener);

  const handleStorage = (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    storageLoaded = false;
    readStorage();
    notify();
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot() {
  return readStorage();
}

function getServerSnapshot() {
  return serverSnapshot;
}

function updateCart(updater) {
  const current = readStorage();
  const items = updater(current.items);
  clientSnapshot = { ...current, items, storageError: "" };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Could not save the cart:", error);
    clientSnapshot = {
      ...clientSnapshot,
      storageError: "Your cart could not be saved on this device.",
    };
  }

  notify();
}

function addItem(product) {
  const id = product._id || product.id;
  if (!id || !Number.isFinite(product.price)) {
    throw new Error("This product cannot be added to the cart.");
  }

  const cartProduct = {
    id: String(id),
    title: product.title || "Untitled product",
    price: product.price,
    image: product.image || "",
    category: product.category || "Collection",
  };

  updateCart((items) => {
    const existingItem = items.find((item) => item.id === cartProduct.id);
    if (existingItem) {
      return items.map((item) =>
        item.id === cartProduct.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    }
    return [...items, { ...cartProduct, quantity: 1 }];
  });
}

function updateQuantity(id, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) return;
  updateCart((items) =>
    items.map((item) => (item.id === id ? { ...item, quantity } : item)),
  );
}

function removeItem(id) {
  updateCart((items) => items.filter((item) => item.id !== id));
}

export function CartProvider({ children }) {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = useMemo(
    () => ({
      ...cart,
      itemCount: cart.items.reduce((count, item) => count + item.quantity, 0),
      subtotal: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
    }),
    [cart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider.");
  }
  return context;
}
