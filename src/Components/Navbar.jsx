import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const openOrder = () => {
    closeMenu();

    const cartButton = document.querySelector(
      ".floating-cart-button"
    );

    if (cartButton) {
      cartButton.click();
    }
  };

  return (
    <header className="site-navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <Link
          to="/"
          className="cafe-logo"
          onClick={closeMenu}
        >
          <span className="logo-mark">B</span>

          <span className="logo-text">
            <strong>Brew & Bloom</strong>
            <small>COFFEE HOUSE</small>
          </span>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className={`menu-toggle ${
            menuOpen ? "open" : ""
          }`}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {/* NAVIGATION */}
        <nav
          className={`site-nav ${
            menuOpen ? "open" : ""
          }`}
        >
          <a
            href="#"
            className="nav-item active"
            onClick={(event) => {
              event.preventDefault();
              closeMenu();

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
          >
            Home
          </a>

          <a
            href="#specialties"
            onClick={closeMenu}
          >
            Specialties
          </a>

          <a
            href="#favorites"
            onClick={closeMenu}
          >
            Favorites
          </a>

          <a
            href="#about"
            onClick={closeMenu}
          >
            About
          </a>

          <a
            href="#visit"
            onClick={closeMenu}
          >
            Visit Us
          </a>

          {/* ORDER NOW */}
          <button
            type="button"
            className="nav-order"
            onClick={openOrder}
          >
            Order Now
            <span>→</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;