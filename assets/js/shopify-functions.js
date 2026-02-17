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
  // For now, show message. Will build cart drawer/page later
  const cartId = localStorage.getItem('shopify_cart_id');
  
  if (!cartId) {
    alert('Your cart is empty');
    return;
  }
  
  // If on product page, try to open the cart drawer
  if (typeof openCart === 'function') {
    openCart();
  } else {
    // Homepage or other pages - show temporary message
    alert('Cart functionality coming soon! Add items from product pages.');
  }
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
  const wishlist = getWishlist();
  
  if (wishlist.length === 0) {
    alert('Your wishlist is empty');
    return;
  }
  
  // Show count for now - wishlist page to be built
  alert(`You have ${wishlist.length} item${wishlist.length > 1 ? 's' : ''} in your wishlist`);
}

// ===== ACCOUNT FUNCTIONS =====

function openAccountPage() {
  // Check if logged in
  const isLoggedIn = document.cookie.includes('customer_token');
  
  if (isLoggedIn) {
    alert('Account page coming soon!');
  } else {
    alert('Login page coming soon!');
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
