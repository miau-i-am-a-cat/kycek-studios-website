// Shopify Cart, Wishlist, and Account Management
// Shared across all pages

// ===== CART FUNCTIONS =====

async function updateCartCount() {
  const cartId = localStorage.getItem('shopify_cart_id');
  const cartCount = document.getElementById('cartCount');
  
  if (!cartId || !cartCount) return;
  
  try {
    const query = `{
      cart(id: "${cartId}") {
        lines(first: 50) {
          edges {
            node {
              quantity
            }
          }
        }
      }
    }`;
    
    const data = await shopifyFetch(query);
    if (data.cart && data.cart.lines) {
      const totalItems = data.cart.lines.edges.reduce((sum, {node}) => sum + node.quantity, 0);
      cartCount.textContent = totalItems;
    }
  } catch (error) {
    console.error('Error updating cart count:', error);
  }
}

function openCartPage() {
  // Navigate to cart page when it's built
  window.location.href = 'cart.html';
}

// ===== WISHLIST FUNCTIONS =====

function getWishlist() {
  const wishlist = localStorage.getItem('kycek_wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
}

function saveWishlist(wishlist) {
  localStorage.setItem('kycek_wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
}

function updateWishlistCount() {
  const wishlist = getWishlist();
  const wishlistCountEl = document.getElementById('wishlistCount');
  if (wishlistCountEl) {
    wishlistCountEl.textContent = wishlist.length;
  }
}

function openWishlistPage() {
  // Navigate to wishlist page when it's built
  window.location.href = 'wishlist.html';
}

// ===== ACCOUNT FUNCTIONS =====

function openAccountPage() {
  // Check if logged in
  const isLoggedIn = document.cookie.includes('customer_token');
  
  if (isLoggedIn) {
    window.location.href = 'account.html';
  } else {
    window.location.href = 'login.html';
  }
}

// ===== INIT ON PAGE LOAD =====

document.addEventListener('DOMContentLoaded', () => {
  // Update cart count
  updateCartCount();
  
  // Update wishlist count
  updateWishlistCount();
  
  // Set up header button click handlers
  const headerCartBtn = document.getElementById('headerCartBtn');
  const headerWishlistBtn = document.getElementById('headerWishlistBtn');
  const headerAccountBtn = document.getElementById('headerAccountBtn');
  
  if (headerCartBtn) {
    headerCartBtn.addEventListener('click', openCartPage);
  }
  
  if (headerWishlistBtn) {
    headerWishlistBtn.addEventListener('click', openWishlistPage);
  }
  
  if (headerAccountBtn) {
    headerAccountBtn.addEventListener('click', openAccountPage);
  }
  
  console.log('Shopify functions loaded');
});
