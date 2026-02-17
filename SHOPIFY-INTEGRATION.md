# Shopify Cart/Wishlist/Account Integration

## Quick Start for New Pages

To enable cart, wishlist, and account functionality on any page:

### 1. Add Cart Drawer CSS

Add the cart drawer styles from `product-page.html` (lines 1093-1272) or copy from `index.html` (search for "/* Cart Drawer */").

### 2. Add Cart Drawer HTML

Add after `</header>`:

```html
<!-- Cart Drawer -->
<div class="cart-drawer" id="cartDrawer">
  <div class="cart-drawer-header">
    <div class="cart-drawer-title">CART</div>
    <button class="cart-drawer-close" id="closeCart">×</button>
  </div>
  <div class="cart-drawer-body" id="cartBody">
    <div class="cart-empty">Your cart is empty</div>
  </div>
  <div class="cart-drawer-footer" id="cartFooter" style="display: none;">
    <div class="cart-subtotal">
      <span>Subtotal</span>
      <span id="cartSubtotal">$0.00</span>
    </div>
    <div class="cart-discount" id="cartDiscount" style="display: none;">
      <span id="cartDiscountLabel">Discount</span>
      <span id="cartDiscountAmount">-$0.00</span>
    </div>
    <div class="cart-total">
      <span>Total</span>
      <span id="cartTotal">$0.00</span>
    </div>
    <button class="cart-checkout-btn" id="cartCheckoutBtn">Checkout</button>
  </div>
</div>
```

### 3. Include the required scripts

Add these before your closing `</body>` tag:

```html
<!-- Shopify Config (API keys and endpoints) -->
<script src="config.js"></script>

<!-- Full Cart/Wishlist/Account Functionality -->
<script src="assets/js/cart-wishlist-account-full.js"></script>
```

### 2. Header Buttons Structure

Make sure your header has these button IDs:

```html
<button class="header-icon" id="headerCartBtn">
  <!-- Cart icon -->
  <span id="cartCount">0</span>
</button>

<button class="header-icon" id="headerWishlistBtn">
  <!-- Wishlist icon -->
  <span id="wishlistCount">0</span>
</button>

<button class="header-icon" id="headerAccountBtn">
  <!-- Account icon -->
</button>
```

### 3. That's it!

The shared functions will automatically:
- Update cart count from Shopify on page load
- Update wishlist count from localStorage
- Handle button clicks (navigate to cart/wishlist/account pages)
- Sync cart state across all pages

## How It Works

### Cart
- Syncs with Shopify cart via `shopify_cart_id` in localStorage
- Fetches real cart count from Shopify GraphQL API
- Clicking cart button → navigates to `cart.html`

### Wishlist  
- Stored in localStorage as `kycek_wishlist`
- Count updates automatically on page load
- Clicking wishlist button → navigates to `wishlist.html`

### Account
- Checks for customer login via cookies
- Logged in → navigates to `account.html`
- Not logged in → navigates to `login.html`

## Files

- **config.js** - Shopify API credentials and `shopifyFetch()` function
- **assets/js/cart-wishlist-account-full.js** - Complete cart/wishlist/account functionality (529 lines)
  - Cart drawer management with Shopify GraphQL API
  - Wishlist popup with localStorage persistence
  - Account management (login check, token storage)

## Pages Using This

✅ Homepage (index.html) - Full functionality
✅ Product Page (product-page.html) - Full functionality
⏳ Collections (to be built) - Add 3 components above
⏳ Terms/About (to be built) - Add 3 components above
