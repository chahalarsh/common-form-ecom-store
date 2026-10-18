"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "../Shop.module.css";
import { useCart } from "./CartProvider";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const heroImage =
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1400&q=85";

const ignoredSearchWords = new Set([
  "a",
  "an",
  "and",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

function searchTerms(query) {
  const words = query
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) ?? [];

  return [...new Set(
    words
      .map((word) => (word.length > 4 && word.endsWith("s") ? word.slice(0, -1) : word))
      .filter((word) => word.length > 1 && !ignoredSearchWords.has(word)),
  )];
}

function matchesSearchTerm(word, term) {
  return word === term || (term.length >= 4 && word.startsWith(term));
}

function findLocalMatches(products, query) {
  const terms = searchTerms(query);
  if (terms.length === 0) return [];

  return products
    .map((product) => {
      const title = searchTerms(product.title || "");
      const category = searchTerms(product.category || "");
      const description = searchTerms(product.description || "");
      const { score, matchedTerms, titleMatch } = terms.reduce(
        (result, term) => {
          if (title.some((word) => matchesSearchTerm(word, term))) {
            result.score += 5;
            result.matchedTerms += 1;
            result.titleMatch = true;
          } else if (category.some((word) => matchesSearchTerm(word, term))) {
            result.score += 3;
            result.matchedTerms += 1;
          } else if (description.some((word) => matchesSearchTerm(word, term))) {
            result.score += 2;
            result.matchedTerms += 1;
          }
          return result;
        },
        { score: 0, matchedTerms: 0, titleMatch: false },
      );

      return { product, score, matchedTerms, titleMatch };
    })
    .filter(
      ({ score, matchedTerms, titleMatch }) =>
        score > 0 && (terms.length === 1 || matchedTerms >= 2 || titleMatch),
    )
    .sort((left, right) => right.score - left.score)
    .slice(0, 10)
    .map(({ product }) => product);
}

function ProductCard({ product }) {
  const id = product._id || product.id;

  return (
    <Link className={styles.productCard} href={`/products/${encodeURIComponent(id)}`}>
      <div className={styles.productMedia}>
        <ProductImage
          alt={product.title || "Product"}
          className={styles.productImage}
          sizes="(max-width: 680px) 48vw, (max-width: 900px) 30vw, 23vw"
          src={product.image}
        />
      </div>
      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{product.title || "Untitled product"}</h3>
        <span className={styles.price}>
          {typeof product.price === "number" ? money.format(product.price) : "Price unavailable"}
        </span>
        <p className={styles.productCategory}>{product.category || "Collection"}</p>
        {product.description && (
          <p className={styles.productDescription}>{product.description}</p>
        )}
      </div>
    </Link>
  );
}

function ProductImage({ src, alt, className, sizes, priority = false }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div aria-label={`${alt}, image unavailable`} className={styles.productFallback} role="img">
        Image coming soon
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      fill
      onError={() => setFailed(true)}
      priority={priority}
      sizes={sizes}
      src={src}
      unoptimized
    />
  );
}

function ProductGrid({ products, emptyTitle, emptyText }) {
  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div>
          <h3>{emptyTitle}</h3>
          <p>{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.productGrid}>
      {products.map((product, index) => (
        <ProductCard key={product._id || product.id || index} product={product} />
      ))}
    </div>
  );
}

export function HomePage({ shopOnly = false }) {
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchNotice, setSearchNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/Products", { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Could not load products (HTTP ${response.status}).`);
        }
        if (!Array.isArray(data)) {
          throw new Error("The product catalog response was invalid.");
        }
        setProducts(data);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the collection. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products],
  );
  const sourceProducts = searchResults ?? products;
  const visibleProducts =
    category === "All"
      ? sourceProducts
      : sourceProducts.filter((product) => product.category === category);

  async function handleSearch(event) {
    event.preventDefault();
    const searchQuery = query.trim();
    if (!searchQuery) return;

    setSearchError("");
    setSearchNotice("");

    const localMatches = findLocalMatches(products, searchQuery);
    setCategory("All");
    if (localMatches.length > 0) {
      setSearchResults(localMatches);
      setSearchNotice("Showing close matches from product details.");
      return;
    }

    setSearching(true);
    setSearchResults(null);

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
        signal: AbortSignal.timeout(8000),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Search failed (HTTP ${response.status}).`);
      }
      if (!Array.isArray(data)) {
        throw new Error("The search response was invalid.");
      }
      if (data.length > 0) {
        setSearchResults(data);
        setSearchNotice("");
      } else {
        setSearchResults(products);
        setSearchNotice("No semantic match found, so we’re showing the full collection.");
      }
    } catch (searchFailure) {
      console.error("Product matching request failed:", searchFailure);
      if (products.length > 0) {
        setSearchResults(products);
        setSearchNotice("Smart matching is unavailable. Browse the full collection.");
      } else {
        setSearchError("Could not match products because the collection is unavailable.");
      }
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setSearchResults(null);
    setQuery("");
    setSearchError("");
    setSearchNotice("");
    setCategory("All");
  }

  return (
    <main className={`${styles.page} ${styles.home} ${shopOnly ? styles.shopPage : ""}`}>
      <div className={styles.container}>
        {!shopOnly && (
          <>
            <section aria-labelledby="hero-title" className={styles.hero}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>A little more considered</p>
                <h1 className={styles.heroTitle} id="hero-title">
                  Everyday things, chosen well.
                </h1>
                <p className={styles.heroText}>
                  Useful, well-made pieces for the rhythm of real life. Discover the
                  small upgrades that make the everyday feel a little better.
                </p>
                <div className={styles.heroActions}>
                  <Link className={`${styles.button} ${styles.buttonDark}`} href="/shop">
                    Explore the collection <span aria-hidden="true">↗</span>
                  </Link>
                  <Link className={`${styles.button} ${styles.buttonLight}`} href="/about">
                    Get to know us
                  </Link>
                </div>
              </div>
              <div className={styles.heroVisual}>
                <Image
                  alt="A calm, sunlit arrangement of books and everyday objects"
                  className={styles.heroImage}
                  fill
                  priority
                  sizes="(max-width: 680px) 94vw, 50vw"
                  src={heroImage}
                  unoptimized
                />
                <div className={styles.heroCaption}>
                  <span>The everyday edit</span>
                  <span>Good things, chosen with care</span>
                </div>
              </div>
            </section>

            <div aria-label="Shopping benefits" className={styles.trustRow}>
              <div className={styles.trustItem}><span aria-hidden="true">✓</span> Thoughtfully selected</div>
              <div className={styles.trustItem}><span aria-hidden="true">↗</span> Easy, everyday staples</div>
              <div className={styles.trustItem}><span aria-hidden="true">♡</span> Free shipping over $75</div>
            </div>
          </>
        )}

        <section aria-labelledby="collection-title" className={styles.section} id="collection">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>The collection</p>
              <h2 className={styles.sectionTitle} id="collection-title">
                Good things, right this way.
              </h2>
              <p className={styles.sectionText}>
                A considered mix of reliable favorites and new finds.
              </p>
            </div>
          </div>

          <div className={styles.catalogTools}>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <input
                aria-label="Describe what you are looking for"
                className={styles.searchInput}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “comfortable shoes for a weekend away”"
                type="search"
                value={query}
              />
              <button className={styles.searchButton} disabled={searching || loading || !query.trim()} type="submit">
                {searching ? "Finding matches…" : "Find a match"}
              </button>
            </form>
            <div aria-label="Filter products by category" className={styles.categories}>
              {categories.map((item) => (
                <button
                  aria-pressed={category === item}
                  className={styles.categoryButton}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {searchError && <p className={styles.alert} role="alert">{searchError}</p>}
          {searchNotice && <p className={styles.searchNotice} role="status">{searchNotice}</p>}
          {error && <p className={styles.alert} role="alert">{error}</p>}
          {loading ? (
            <div aria-label="Loading products" className={styles.productGrid}>
              {Array.from({ length: 4 }, (_, index) => (
                <div className={styles.skeleton} key={index} />
              ))}
            </div>
          ) : (
            <>
              <p aria-live="polite" className={styles.resultCount}>
                {searchResults ? "Matches for your search" : "Selected for you"} · {visibleProducts.length} items
                {searchResults && (
                  <>
                    {" · "}
                    <button className={styles.removeButton} onClick={clearSearch} type="button">
                      Clear search
                    </button>
                  </>
                )}
              </p>
              <ProductGrid
                emptyText={
                  error
                    ? "The catalog needs a connection to MongoDB. Check MONGO_URI, then refresh this page."
                    : searchResults
                      ? "Try a different description or clear your search to browse everything."
                      : "The collection is being refreshed. Please check back shortly."
                }
                emptyTitle={error ? "We couldn’t load the collection" : "Nothing to show just yet"}
                products={visibleProducts}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export function ProductPage({ id }) {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const { addItem, storageError } = useCart();

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        const response = await fetch("/api/Products", { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Could not load the product (HTTP ${response.status}).`);
        }
        if (!Array.isArray(data)) {
          throw new Error("The product catalog response was invalid.");
        }
        setProducts(data);
        setProduct(data.find((item) => String(item._id || item.id) === id) || null);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error ? loadError.message : "Could not load this product.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [id]);

  const recommendations = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (item) =>
          String(item._id || item.id) !== id &&
          item.category?.toLowerCase() === product.category?.toLowerCase(),
      )
      .slice(0, 4);
  }, [id, product, products]);

  function handleAddToBag() {
    try {
      addItem(product);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2200);
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Could not add this item.");
    }
  }

  if (loading) {
    return (
      <main className={`${styles.page} ${styles.productPage}`}>
        <div className={styles.container}>
          <div aria-label="Loading product" className={styles.productLayout}>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className={`${styles.page} ${styles.productPage}`}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <div>
              <h1>{error ? "This page needs a moment" : "We couldn’t find that item"}</h1>
              <p>{error || "It may have moved on. Browse the collection to find something else."}</p>
              <Link className={`${styles.button} ${styles.buttonDark}`} href="/shop">Back to the collection</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${styles.page} ${styles.productPage}`}>
      <div className={styles.container}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/shop">Collection</Link><span aria-hidden="true">/</span>
          <span>{product.title}</span>
        </nav>
        <section aria-labelledby="product-title" className={styles.productLayout}>
          <div className={styles.productGallery}>
            <ProductImage
              alt={product.title || "Product"}
              className={styles.detailImage}
              priority
              sizes="(max-width: 680px) 94vw, 55vw"
              src={product.image}
            />
          </div>
          <div className={styles.productDetails}>
            <Link className={styles.backLink} href="/shop">← Back to the collection</Link>
            <p className={styles.detailCategory}>{product.category || "The collection"}</p>
            <h1 className={styles.detailTitle} id="product-title">{product.title || "Untitled product"}</h1>
            <p className={styles.detailPrice}>
              {typeof product.price === "number" ? money.format(product.price) : "Price unavailable"}
            </p>
            <p className={styles.detailDescription}>
              {product.description || "A thoughtful everyday find, selected for its simple, useful design."}
            </p>
            <hr className={styles.detailsDivider} />
            <div className={styles.detailMeta}>
              <p><span aria-hidden="true">↗</span> Complimentary shipping on orders over $75</p>
              <p><span aria-hidden="true">↺</span> Easy returns within 30 days</p>
            </div>
            {error && <p className={styles.alert} role="alert">{error}</p>}
            {storageError && <p className={styles.alert} role="alert">{storageError}</p>}
            <button
              className={`${styles.button} ${styles.buttonDark} ${styles.addButton}`}
              disabled={typeof product.price !== "number"}
              onClick={handleAddToBag}
              type="button"
            >
              {added ? "Added to your bag ✓" : "Add to bag"}
            </button>
          </div>
        </section>
        {recommendations.length > 0 && (
          <section aria-labelledby="recommendations-title" className={styles.recommendations}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>A few good companions</p>
                <h2 className={styles.sectionTitle} id="recommendations-title">More from {product.category}</h2>
              </div>
            </div>
            <ProductGrid products={recommendations} />
          </section>
        )}
      </div>
    </main>
  );
}

function CartProductImage({ item }) {
  return (
    <ProductImage
      alt={item.title}
      className={styles.productImage}
      sizes="116px"
      src={item.image}
    />
  );
}

export function CartPage() {
  const { items, itemCount, subtotal, ready, storageError, updateQuantity, removeItem } = useCart();
  const freeShippingThreshold = 75;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 6;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  if (!ready) {
    return (
      <main className={`${styles.page} ${styles.cartPage}`}>
        <div className={styles.container}><p>Loading your bag…</p></div>
      </main>
    );
  }

  return (
    <main className={`${styles.page} ${styles.cartPage}`}>
      <div className={styles.container}>
        <header className={styles.cartHeader}>
          <p className={styles.eyebrow}>Your edit</p>
          <h1 className={styles.sectionTitle}>Shopping bag <span>({itemCount})</span></h1>
        </header>
        {storageError && <p className={styles.alert} role="alert">{storageError}</p>}
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <div>
              <h2>Your bag is taking a breather.</h2>
              <p>There’s nothing in it just yet. Find a few good things to bring home.</p>
              <Link className={`${styles.button} ${styles.buttonDark}`} href="/shop">
                Explore the collection
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.cartLayout}>
            <section aria-label="Items in your bag" className={styles.cartItems}>
              {items.map((item) => (
                <article className={styles.cartItem} key={item.id}>
                  <div className={styles.cartItemMedia}><CartProductImage item={item} /></div>
                  <div className={styles.cartItemDetails}>
                    <h2 className={styles.cartItemTitle}>{item.title}</h2>
                    <p className={styles.cartItemMeta}>{item.category}</p>
                    <div className={styles.cartItemControls}>
                      <div aria-label={`Quantity for ${item.title}`} className={styles.quantityControl}>
                        <button
                          aria-label={`Decrease quantity of ${item.title}`}
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          type="button"
                        >
                          −
                        </button>
                        <span aria-live="polite" className={styles.quantityValue}>{item.quantity}</span>
                        <button
                          aria-label={`Increase quantity of ${item.title}`}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <button className={styles.removeButton} onClick={() => removeItem(item.id)} type="button">
                        Remove
                      </button>
                    </div>
                  </div>
                  <span className={styles.cartItemPrice}>{money.format(item.price * item.quantity)}</span>
                </article>
              ))}
            </section>
            <aside aria-label="Order summary" className={styles.summary}>
              <h2 className={styles.summaryTitle}>A quick summary</h2>
              <p className={styles.freeShip}>
                {remaining > 0
                  ? `You’re ${money.format(remaining)} away from complimentary shipping.`
                  : "Good news — shipping is on us."}
                <span aria-hidden="true" className={styles.progressBar}>
                  <span
                    className={styles.progressFill}
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </span>
              </p>
              <div className={styles.summaryLine}><span>Subtotal</span><span>{money.format(subtotal)}</span></div>
              <div className={styles.summaryLine}>
                <span>Shipping</span><span>{shipping === 0 ? "Complimentary" : money.format(shipping)}</span>
              </div>
              <p className={styles.summaryTotal}><span>Estimated total</span><span>{money.format(subtotal + shipping)}</span></p>
              <button className={`${styles.button} ${styles.buttonDark} ${styles.checkout}`} disabled type="button">
                Checkout coming soon
              </button>
              <p className={styles.checkoutNote}>Checkout isn’t enabled in this demo. Your bag is saved on this device.</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
