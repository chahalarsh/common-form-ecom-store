"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [error, setError] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();
    setSearching(true);
    setSearchError("");

    let aiSearch =  document.getElementById('search-with-AI').checked; 

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, aiSearch }),
      });
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(`Search endpoint returned an unexpected response (HTTP ${response.status}).`);
      }
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Search failed (HTTP ${response.status}).`);
      }
      if (!Array.isArray(data)) {
        throw new Error("The search response was invalid.");
      }

      setProducts(data);
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : "Could not search products.",
      );
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/Products", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            `Could not load products (HTTP ${response.status}). Check the server logs for the API or database error.`,
          );
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The products response was invalid.");
        }
        setProducts(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "Could not load products. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            The everyday edit
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Shop footwear
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Find your next favorite pair from our latest collection.
          </p>
        </header>

        <form onSubmit={handleSearch} className="mb-8 flex max-w-xl gap-3">
          <input
            value={query}
            type="search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search footwear"
            aria-label="Search products"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
           <input 
    type="checkbox" 
    id="search-with-AI" 
    class="w-4 h-4 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-500 accent-blue-600 cursor-pointer"
  />
  <label for="remember-me" class="text-sm font-medium text-gray-700 cursor-pointer select-none">
    Search with AI?
  </label>

          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {searching ? "Searching…" : "Search"}
          </button>
        </form>
        {searchError && (
          <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {searchError}
          </p>
        )}

        {loading ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            Loading products…
          </p>
        ) : error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            No products are available right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product._id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title || "Product"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No image available
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    {product.category || "Collection"}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    {product.title || "Untitled product"}
                  </h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                    {product.description || "A great addition to your collection."}
                  </p>
                  <p className="mt-4 text-lg font-bold text-slate-900">
                    {typeof product.price === "number"
                      ? `$${product.price.toFixed(2)}`
                      : "Price unavailable"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}