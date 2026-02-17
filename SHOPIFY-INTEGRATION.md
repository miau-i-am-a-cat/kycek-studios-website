# Shopify Cart/Wishlist/Account Integration

## Quick Start for New Pages

To enable cart, wishlist, and account functionality on any page:

### 1. Include the required scripts

Add these before your closing `</body>` tag:

```html
<!-- Shopify Config (API keys and endpoints) -->
<script src="config.js"></script>

<!-- Shared Cart/Wishlist/Account Functions -->
<script src="assets/js/shopify-functions.js"></script>
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
- **assets/js/shopify-functions.js** - Shared cart/wishlist/account logic

## Pages Using This

✅ Homepage (index.html)
✅ Product Page (product-page.html)
⏳ Collections (to be built)
⏳ Cart (to be built)
⏳ Wishlist (to be built)
⏳ Account (to be built)
