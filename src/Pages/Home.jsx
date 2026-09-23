import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const favorites = [
  {
    id: "signature-latte",
    name: "Signature Latte",
    price: 150,
    description:
      "Smooth espresso, silky milk, and a gentle caramel finish.",
    tag: "BEST SELLER",
    type: "drink-latte",
    icon: "☕",
  },
  {
    id: "americano",
    name: "Classic Americano",
    price: 120,
    description:
      "Rich espresso balanced with hot water for a clean finish.",
    tag: "CLASSIC",
    type: "drink-latte",
    icon: "☕",
  },
  {
    id: "matcha-cream",
    name: "Matcha Cream",
    price: 160,
    description:
      "Earthy matcha layered with creamy milk and a soft sweet finish.",
    tag: "CUSTOM FAVORITE",
    type: "drink-matcha",
    icon: "🍵",
  },
  {
    id: "iced-caramel",
    name: "Iced Caramel Coffee",
    price: 165,
    description:
      "Cold brewed coffee with creamy milk and a smooth caramel drizzle.",
    tag: "ICED FAVORITE",
    type: "drink-latte",
    icon: "🧊",
  },
  {
    id: "butter-croissant",
    name: "Butter Croissant",
    price: 120,
    description:
      "Flaky, golden, and baked fresh for a delicate buttery bite.",
    tag: "FRESH BAKED",
    type: "bake-croissant",
    icon: "🥐",
  },
  {
    id: "chocolate-cookie",
    name: "Chocolate Cookie",
    price: 95,
    description:
      "Soft-centered chocolate cookie with crisp golden edges.",
    tag: "SWEET TREAT",
    type: "bake-croissant",
    icon: "🍪",
  },
];

function Home() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const formatPrice = (price) =>
    `₱${price.toLocaleString("en-PH")}`;

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setSubmitted(false);
    setOrderError("");
    setCartOpen(true);
  };

  const increaseCartItem = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseCartItem = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  const closeCart = () => {
    if (!isSubmitting) {
      setCartOpen(false);
    }
  };

  // =====================================================
  // SUPABASE ORDER INSERT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setOrderError("");

    if (!customerName.trim()) {
      setOrderError("Please enter your name.");
      return;
    }

    if (!tableNumber.trim()) {
      setOrderError("Please enter your table number.");
      return;
    }

    if (cart.length === 0) {
      setOrderError("Your order is empty.");
      return;
    }

    setIsSubmitting(true);

    const generatedOrderNumber = `BB-${Date.now()
      .toString()
      .slice(-8)}`;

    const orderItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
    }));

    const orderData = {
      order_number: generatedOrderNumber,
      customer_name: customerName.trim(),
      table_number: tableNumber.trim(),
      items: orderItems,
      total: Number(cartTotal),
      note: orderNote.trim() || null,
      status: "Order Received",
    };

    try {
      console.log("Submitting Brew & Bloom order:", orderData);

      const { error } = await supabase
        .from("orders")
        .insert([orderData]);

      if (error) {
        console.error("Supabase order error:", error);

        setOrderError(
          error.message ||
            "Failed to place your order. Please try again."
        );

        setIsSubmitting(false);
        return;
      }

      console.log(
        "Order successfully saved:",
        generatedOrderNumber
      );

      // Save order locally
      const localOrder = {
        orderNumber: generatedOrderNumber,
        customerName: customerName.trim(),
        tableNumber: tableNumber.trim(),
        status: "Order Received",
        total: Number(cartTotal),
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "brewBloomCurrentOrder",
        JSON.stringify(localOrder)
      );

      // Show success screen
      setOrderNumber(generatedOrderNumber);
      setSubmitted(true);
      setOrderError("");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Unexpected order error:", error);

      setOrderError(
        error?.message ||
          "Failed to connect to the ordering system. Please try again."
      );

      setIsSubmitting(false);
    }
  };

  const startNewOrder = () => {
    setCart([]);
    setCustomerName("");
    setTableNumber("");
    setOrderNote("");
    setSubmitted(false);
    setOrderNumber("");
    setOrderError("");
    setCartOpen(false);
  };

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  return (
    <>
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span />
              YOUR DAILY CUP, MADE WITH CARE
            </div>

            <h1 className="hero-title">
              Good coffee.
              <br />
              <em>Better</em>
              <br />
              <em>moments.</em>
            </h1>

            <p className="hero-description">
              Thoughtfully brewed coffee, freshly baked treats, and a
              cozy place to slow down and enjoy the little things.
            </p>

            <div className="hero-actions">
              <a
                href="#favorites"
                className="hero-primary-button"
              >
                Explore Menu
                <span>↓</span>
              </a>

              <a
                href="#about"
                className="hero-secondary-button"
              >
                Our Story
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orbit" />

            <div className="hero-badge">
              <span>01</span>
              Freshly brewed
            </div>

            <div className="hero-cup">
              <div className="hero-cup-steam steam-one" />
              <div className="hero-cup-steam steam-two" />
              <div className="hero-cup-steam steam-three" />

              <div className="hero-cup-body">
                <div className="hero-cup-coffee" />
                <div className="hero-cup-logo">B</div>
              </div>

              <div className="hero-cup-handle" />
              <div className="hero-saucer" />
            </div>

            <div className="hero-floating-card hero-card-top">
              <strong>Roasted daily</strong>
              <span>Small batch beans</span>
            </div>

            <div className="hero-floating-card hero-card-bottom">
              <strong>Made fresh</strong>
              <span>Every single morning</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SPECIALTIES
      ====================================================== */}

      <section
        className="specialties-section"
        id="specialties"
      >
        <div className="section-container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">WHAT WE DO</span>

              <h2>
                Simple things,
                <br />
                <em>done beautifully.</em>
              </h2>
            </div>

            <p>
              From your first morning cup to a slow afternoon treat,
              everything is prepared with care.
            </p>
          </div>

          <div className="specialties-grid">
            <article className="specialty-card">
              <div className="specialty-number">01</div>
              <div className="specialty-icon">☕</div>

              <h3>Crafted Coffee</h3>

              <p>
                Balanced espresso, smooth milk, and carefully selected
                beans brewed fresh throughout the day.
              </p>

              <span className="specialty-arrow">↗</span>
            </article>

            <article className="specialty-card">
              <div className="specialty-number">02</div>
              <div className="specialty-icon">🥐</div>

              <h3>Fresh Bakes</h3>

              <p>
                Golden pastries and comforting baked treats made to
                pair perfectly with your favorite drink.
              </p>

              <span className="specialty-arrow">↗</span>
            </article>

            <article className="specialty-card">
              <div className="specialty-number">03</div>
              <div className="specialty-icon">🍵</div>

              <h3>Matcha & More</h3>

              <p>
                Creamy matcha, refreshing drinks, and non-coffee
                favorites for every kind of coffee shop day.
              </p>

              <span className="specialty-arrow">↗</span>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================
          MENU
      ====================================================== */}

      <section
        className="favorites-section"
        id="favorites"
      >
        <div className="section-container">
          <div className="favorites-heading">
            <div>
              <span className="eyebrow">OUR MENU</span>

              <h2>
                Something for
                <br />
                <em>every mood.</em>
              </h2>
            </div>

            <p>
              From espresso classics to refreshing matcha and freshly
              baked treats, find something worth slowing down for.
            </p>
          </div>

          <div className="favorites-grid">
            {favorites.map((product) => (
              <article
                className="product-card"
                key={product.id}
              >
                <div className="product-visual">
                  <span className="product-tag">
                    {product.tag}
                  </span>

                  {product.type === "bake-croissant" ? (
                    <div className="croissant-shape">
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : (
                    <div
                      className={`product-cup ${
                        product.type === "drink-matcha"
                          ? "matcha-cup"
                          : ""
                      }`}
                    >
                      <div className="product-liquid" />
                      <div className="product-handle" />
                    </div>
                  )}
                </div>

                <div className="product-content">
                  <div className="product-title-row">
                    <div>
                      <h3 className="product-title">
                        {product.name}
                      </h3>

                      <p>{product.description}</p>
                    </div>

                    <strong className="product-price">
                      {formatPrice(product.price)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="product-button"
                    onClick={() => addToCart(product)}
                  >
                    Add to Order
                    <span>+</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ====================================================== */}

      <section className="about-section" id="about">
        <div className="section-container">
          <div className="about-grid">
            <div className="about-visual">
              <div className="about-circle">
                <span>BREW</span>
                <strong>&</strong>
                <span>BLOOM</span>
              </div>
            </div>

            <div className="about-content">
              <span className="eyebrow">OUR STORY</span>

              <h2>
                More than coffee.
                <br />
                <em>A little pause.</em>
              </h2>

              <p>
                Brew & Bloom started with a simple idea: good coffee
                can make an ordinary day feel a little better.
              </p>

              <p>
                We created a warm neighborhood space where people can
                grab their morning coffee, catch up with friends, or
                simply sit down and enjoy a quiet moment.
              </p>

              <div className="about-signature">
                <span>Made with care,</span>
                <strong>Brew & Bloom</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          VISIT
      ====================================================== */}

      <section className="visit-section" id="visit">
        <div className="section-container">
          <div className="visit-content">
            <span className="eyebrow">COME SAY HELLO</span>

            <h2>
              Your next favorite
              <br />
              <em>coffee spot.</em>
            </h2>

            <p>
              Drop by for a freshly brewed cup, stay for the cozy
              atmosphere.
            </p>

            <div className="visit-details">
              <div>
                <span>LOCATION</span>
                <strong>Dasmariñas, Cavite</strong>
              </div>

              <div>
                <span>OPENING HOURS</span>
                <strong>
                  Monday – Saturday · 8AM – 9PM
                </strong>
              </div>

              <div>
                <span>ORDERING</span>
                <strong>
                  Order directly at your table
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FLOATING CART
      ====================================================== */}

      <button
        type="button"
        className="floating-cart-button"
        onClick={() => {
          setSubmitted(false);
          setOrderError("");
          setCartOpen(true);
        }}
        aria-label="Open your order"
      >
        <span className="cart-icon">🛒</span>

        <span className="cart-text">
          Your Order
        </span>

        <span className="cart-count">
          {cartCount}
        </span>
      </button>

      {/* =====================================================
          CART MODAL
      ====================================================== */}

      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={closeCart}
        >
          <div
            className="cart-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <span className="eyebrow">
                  BREW & BLOOM
                </span>

                <h2>Your Order</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeCart}
                aria-label="Close order"
              >
                ×
              </button>
            </div>

            {submitted ? (
              <div className="order-success">
                <div className="success-icon">✓</div>

                <span className="eyebrow">
                  ORDER RECEIVED
                </span>

                <h2>
                  Thank you, {customerName}!
                </h2>

                <p>
                  Your order has been sent to the café.
                </p>

                <div className="success-order-number">
                  <span>ORDER NUMBER</span>
                  <strong>#{orderNumber}</strong>
                </div>

                <div className="success-summary">
                  <div>
                    <span>Table</span>
                    <strong>{tableNumber}</strong>
                  </div>

                  <div>
                    <span>Items</span>
                    <strong>{cartCount}</strong>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>
                      {formatPrice(cartTotal)}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="success-button"
                  onClick={startNewOrder}
                >
                  Start New Order
                  <span>→</span>
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="empty-cart">
                <div className="success-icon">🛒</div>

                <h3>Your order is empty</h3>

                <p>
                  Choose something from our menu and it will appear
                  here.
                </p>

                <button
                  type="button"
                  className="success-button"
                  onClick={() => {
                    closeCart();

                    setTimeout(() => {
                      document
                        .getElementById("favorites")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }, 100);
                  }}
                >
                  Browse Menu
                  <span>→</span>
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div
                      className="cart-item"
                      key={item.id}
                    >
                      <div className="cart-item-image">
                        {item.icon}
                      </div>

                      <div className="cart-item-info">
                        <div className="cart-item-top">
                          <div>
                            <h3>{item.name}</h3>

                            <span>
                              {formatPrice(item.price)}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="remove-cart-item"
                            onClick={() =>
                              removeCartItem(item.id)
                            }
                            aria-label={`Remove ${item.name}`}
                          >
                            ×
                          </button>
                        </div>

                        <div className="cart-item-bottom">
                          <div className="cart-quantity">
                            <button
                              type="button"
                              onClick={() =>
                                decreaseCartItem(item.id)
                              }
                            >
                              −
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseCartItem(item.id)
                              }
                            >
                              +
                            </button>
                          </div>

                          <strong>
                            {formatPrice(
                              item.price * item.quantity
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="checkout-divider" />

                <form
                  className="checkout-form"
                  onSubmit={handleSubmit}
                >
                  <div className="checkout-form-heading">
                    <span className="eyebrow">
                      TABLE ORDER
                    </span>

                    <h3>
                      Tell us where you're seated.
                    </h3>
                  </div>

                  <div className="form-group">
                    <label htmlFor="customer-name">
                      Customer Name
                    </label>

                    <input
                      id="customer-name"
                      type="text"
                      value={customerName}
                      onChange={(event) =>
                        setCustomerName(event.target.value)
                      }
                      placeholder="Enter your name"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="table-number">
                      Table Number
                    </label>

                    <input
                      id="table-number"
                      type="text"
                      value={tableNumber}
                      onChange={(event) =>
                        setTableNumber(event.target.value)
                      }
                      placeholder="e.g. Table 05"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="order-note">
                      Order Note
                    </label>

                    <textarea
                      id="order-note"
                      value={orderNote}
                      onChange={(event) =>
                        setOrderNote(event.target.value)
                      }
                      placeholder="Optional notes..."
                      rows="3"
                    />
                  </div>

                  {orderError && (
                    <div className="order-error">
                      {orderError}
                    </div>
                  )}

                  <div className="cart-summary">
                    <div className="cart-total-row">
                      <span>Subtotal</span>

                      <strong>
                        {formatPrice(cartTotal)}
                      </strong>
                    </div>

                    <div className="cart-total-row cart-total-main">
                      <span>Total</span>

                      <strong>
                        {formatPrice(cartTotal)}
                      </strong>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      type="button"
                      className="success-button secondary"
                      onClick={closeCart}
                      disabled={isSubmitting}
                    >
                      Continue Shopping
                    </button>

                    <button
                      type="submit"
                      className="success-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Sending Order..."
                        : "Place Order"}

                      {!isSubmitting && <span>→</span>}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Home;