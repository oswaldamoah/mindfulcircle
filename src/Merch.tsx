import { useMemo, useState } from "react";

const WA_NUMBER = "233599078844";

const buildWhatsAppUrl = (message: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

type CartItem = {
  name: string;
  variant: string;
  qty: number;
};

type Variant = {
  id: string;
  label: string;
  image: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  variants: Variant[];
};

export default function MerchPage() {
  const products = useMemo<Product[]>(
    () => [
      {
        id: "cap",
        name: "Mindful Circle Cap",
        description: "Classic trucker cap with the Mindful Circle mark.",
        variants: [
          { id: "black", label: "Black", image: "/events/cap_black.png" },
          { id: "white", label: "White", image: "/events/cap_white.png" },
        ],
      },
    ],
    []
  );

  const [selectedVariant, setSelectedVariant] = useState<string>("cap:black");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (key: string, name: string, variant: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const existing = next[key];
      next[key] = { name, variant, qty: (existing?.qty ?? 0) + 1 };
      return next;
    });
    setCartOpen(true);
  };

  const updateQty = (key: string, delta: number) => {
    setCart((prev) => {
      const next = { ...prev };
      const existing = next[key];
      if (!existing) return next;
      const nextQty = existing.qty + delta;
      if (nextQty <= 0) {
        delete next[key];
        return next;
      }
      next[key] = { ...existing, qty: nextQty };
      return next;
    });
  };

  const cartItems = Object.entries(cart);
  const cartCount = cartItems.reduce((sum, [, item]) => sum + item.qty, 0);

  const checkoutUrl = useMemo(() => {
    if (cartCount === 0) return "";
    const lines = cartItems.map(([, item]) => `- ${item.name} (${item.variant}) x${item.qty}`);
    return buildWhatsAppUrl(`Hi I want to purchase:\n${lines.join("\n")}`);
  }, [cartItems, cartCount]);

  return (
    <main className="merch-page">
      <section className="merch-hero">
        <div className="merch-hero-inner">
          <p className="merch-kicker">Merch</p>
          <h1 className="merch-title">Mindful Circle Shop</h1>
          <p className="merch-body">Mindful Circle goods that support the work. Add items to your cart and checkout on WhatsApp.</p>
        </div>
      </section>
      <section className="merch-grid-section">
        <div className="merch-collection">
          <div>
            <p className="merch-collection-kicker">Featured</p>
            <h2 className="merch-collection-title">Mindful Circle essentials</h2>
            <p className="merch-collection-body">Caps available now. More drops coming soon.</p>
          </div>
          <div className="merch-collection-count">{products.length} product</div>
        </div>
        <div className="merch-grid">
          {products.map((product) => {
            const activeVariant = product.variants.find((variant) => `${product.id}:${variant.id}` === selectedVariant)
              || product.variants[0];
            const selectionKey = `${product.id}:${activeVariant.id}`;
            const buyNowUrl = buildWhatsAppUrl(
              `Hi I want to purchase the ${product.name} (${activeVariant.label}).`
            );

            return (
              <article className="merch-card" key={product.id} id={product.id}>
                <div className="merch-card-media">
                  <img src={activeVariant.image} alt={`${product.name} ${activeVariant.label}`} loading="lazy" />
                </div>
                <div className="merch-card-body">
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <div className="merch-variants">
                    {product.variants.map((variant) => {
                      const key = `${product.id}:${variant.id}`;
                      const isActive = key === selectedVariant;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          className={`merch-variant${isActive ? " active" : ""}`}
                          onClick={() => setSelectedVariant(key)}
                        >
                          {variant.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="merch-actions">
                    <button
                      className="btn-donate merch-buy"
                      type="button"
                      onClick={() => addToCart(selectionKey, product.name, activeVariant.label)}
                    >
                      Add to cart
                    </button>
                    <a
                      className="merch-buy secondary"
                      href={buyNowUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy now on WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {cartCount > 0 && (
        <button className="merch-cart-fab" type="button" onClick={() => setCartOpen(true)}>
          Cart <span>{cartCount}</span>
        </button>
      )}

      {cartOpen && (
        <div className="merch-cart-modal" onClick={() => setCartOpen(false)}>
          <div className="merch-cart-panel" onClick={(event) => event.stopPropagation()}>
            <button className="merch-cart-close" onClick={() => setCartOpen(false)} aria-label="Close cart">
              &times;
            </button>
            <h3>Checkout</h3>
            <ul className="merch-cart-list">
              {cartItems.map(([key, item]) => (
                <li key={key}>
                  <div>
                    <p className="merch-cart-name">{item.name}</p>
                    <p className="merch-cart-variant">{item.variant}</p>
                  </div>
                  <div className="merch-qty">
                    <button type="button" onClick={() => updateQty(key, -1)} aria-label="Decrease quantity">−</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => updateQty(key, 1)} aria-label="Increase quantity">+</button>
                  </div>
                </li>
              ))}
            </ul>
            <a className="btn-donate merch-checkout" href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              Checkout on WhatsApp
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
