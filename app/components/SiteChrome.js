"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import styles from "../Shop.module.css";
import { useCart } from "./CartProvider";

const THEME_KEY = "common-form-theme";
const themeListeners = new Set();

function getThemeSnapshot() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme || "light";
}

function getServerThemeSnapshot() {
  return "light";
}

function notifyThemeChange() {
  themeListeners.forEach((listener) => listener());
}

function subscribeToTheme(listener) {
  themeListeners.add(listener);

  const handleStorage = (event) => {
    if (event.key !== THEME_KEY && event.key !== null) return;
    const savedTheme = event.key === null ? null : event.newValue;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    document.documentElement.dataset.theme =
      savedTheme === "dark" || savedTheme === "light" ? savedTheme : systemTheme;
    notifyThemeChange();
  };

  window.addEventListener("storage", handleStorage);
  return () => {
    themeListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function ThemeToggle() {
  const [error, setError] = useState("");
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
      setError("");
    } catch (error) {
      console.error("Could not save the theme preference:", error);
      setError("Theme changed, but this preference could not be saved.");
    }
    notifyThemeChange();
  }

  return (
    <>
      <button
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className={styles.themeToggle}
        onClick={toggleTheme}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        type="button"
      >
        {theme === "dark" ? (
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12 2.5v2m0 15v2m9.5-9.5h-2m-15 0h-2m16.2-6.7-1.4 1.4m-10.6 10.6-1.4 1.4m13.4 0-1.4-1.4M6.3 6.3 4.9 4.9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
          </svg>
        ) : (
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path d="M20.2 15.4A8.6 8.6 0 0 1 8.6 3.8 8.7 8.7 0 1 0 20.2 15.4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
          </svg>
        )}
      </button>
      {error && <span className={styles.themeError} role="status">{error}</span>}
    </>
  );
}

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <>
      <div className={styles.announcement}>
        Thoughtful finds for everyday living · Complimentary shipping over $75
      </div>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link aria-label="Common Form home" className={styles.brand} href="/">
            <span aria-hidden="true" className={styles.brandMark}>c.</span>
            <span>common form</span>
          </Link>
          <div className={styles.headerActions}>
            <nav aria-label="Main navigation" className={styles.nav}>
              <Link className={styles.navLink} href="/shop">Shop</Link>
              <Link className={styles.navLink} href="/about">Our story</Link>
            </nav>
            <ThemeToggle />
            <Link
              aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
              className={styles.iconLink}
              href="/cart"
            >
              <span aria-hidden="true">Bag</span>
              <span className={styles.cartCount}>{itemCount}</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} ${styles.footerInner}`}>
        <div className={styles.footerBrand}>
          <strong>common form</strong>
          <span className={styles.footerNote}>Good things, chosen with care.</span>
        </div>
        <nav aria-label="Footer navigation" className={styles.footerLinks}>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/cart">Your bag</Link>
        </nav>
        <span className={styles.footerNote}>© {new Date().getFullYear()} Common Form</span>
      </div>
    </footer>
  );
}
