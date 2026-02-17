// ==================== CART MANAGEMENT ====================
const cartDrawer = document.getElementById('cartDrawer');
const closeCart = document.getElementById('closeCart');
const cartBody = document.getElementById('cartBody');
const cartFooter = document.getElementById('cartFooter');
const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
const headerCartBtn = document.getElementById('headerCartBtn');
const cartCount = document.getElementById('cartCount');

closeCart.addEventListener('click', () => {
  cartDrawer.classList.remove('active');
});

if (headerCartBtn) {
  headerCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  });
}

// Update cart count on page load
updateCartCount();

async function openCart() {
  console.log('Opening cart...');
  cartDrawer.classList.add('active');
  await refreshCart();
}

window.removeFromCart = async function(lineId) {
  const cartId = localStorage.getItem('shopify_cart_id');
  if (!cartId) return;
  
  try {
    const query = `
      mutation {
        cartLinesRemove(
          cartId: "${cartId}"
          lineIds: ["${lineId}"]
        ) {
          cart {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    
    const data = await shopifyFetch(query);
    
    if (data.cartLinesRemove.userErrors.length > 0) {
      throw new Error(data.cartLinesRemove.userErrors[0].message);
    }
    
    await refreshCart();
  } catch (error) {
    console.error('Remove from cart error:', error);
    alert('Error removing item: ' + error.message);
  }
}

async function updateCartCount() {
  const cartId = localStorage.getItem('shopify_cart_id');
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

window.updateQuantity = async function(lineId, newQuantity) {
  const cartId = localStorage.getItem('shopify_cart_id');
  if (!cartId || newQuantity < 1) return;
  
  try {
    const query = `
      mutation {
        cartLinesUpdate(
          cartId: "${cartId}"
          lines: [{
            id: "${lineId}"
            quantity: ${newQuantity}
          }]
        ) {
          cart {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    
    const data = await shopifyFetch(query);
    
    if (data.cartLinesUpdate.userErrors.length > 0) {
      throw new Error(data.cartLinesUpdate.userErrors[0].message);
    }
    
    await refreshCart();
  } catch (error) {
    console.error('Update quantity error:', error);
    alert('Error updating quantity: ' + error.message);
  }
}

async function refreshCart() {
  const cartId = localStorage.getItem('shopify_cart_id');
  console.log('Cart ID:', cartId);
  
  if (!cartId) {
    cartBody.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
    cartFooter.style.display = 'none';
    if (cartCount) cartCount.textContent = '0';
    return;
  }
  
  try {
    const query = `{
      cart(id: "${cartId}") {
        id
        checkoutUrl
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                }
                compareAtAmountPerQuantity {
                  amount
                }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  image {
                    url
                  }
                  priceV2 {
                    amount
                    currencyCode
                  }
                  product {
                    title
                  }
                }
              }
            }
          }
        }
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        discountAllocations {
          discountedAmount {
            amount
          }
        }
        discountCodes {
          code
          applicable
        }
      }
    }`;
    
    console.log('Fetching cart data...');
    const data = await shopifyFetch(query);
    console.log('Cart data received:', data);
    const cart = data.cart;
    
    if (!cart) {
      console.log('Cart not found');
      cartBody.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
      cartFooter.style.display = 'none';
      if (cartCount) cartCount.textContent = '0';
      return;
    }
    
    if (cart.lines.edges.length === 0) {
      console.log('Cart is empty');
      cartBody.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
      cartFooter.style.display = 'none';
      if (cartCount) cartCount.textContent = '0';
      return;
    }
    
    // Display cart items
    let itemsHTML = '';
    cart.lines.edges.forEach(({node}) => {
      const product = node.merchandise.product.title;
      const variant = node.merchandise.title !== 'Default Title' ? node.merchandise.title : '';
      const unitPrice = parseFloat(node.merchandise.priceV2.amount);
      const totalCost = parseFloat(node.cost.totalAmount.amount);
      const image = node.merchandise.image?.url || '';
      
      // Check if there's a discount
      const expectedTotal = unitPrice * node.quantity;
      const hasDiscount = totalCost < expectedTotal;
      
      let priceHTML = '';
      if (hasDiscount) {
        priceHTML = `
          <div style="text-decoration: line-through; color: var(--gray); font-size: 12px;">$${expectedTotal.toFixed(2)}</div>
          <div style="color: var(--red); font-weight: 600;">$${totalCost.toFixed(2)}</div>
        `;
      } else {
        priceHTML = `<div>$${totalCost.toFixed(2)}</div>`;
      }
      
      itemsHTML += `
        <div class="cart-item" data-line-id="${node.id}">
          <div class="cart-item-image">
            ${image ? `<img src="${image}" alt="${product}">` : ''}
          </div>
          <div class="cart-item-details">
            <div class="cart-item-title">${product}</div>
            ${variant ? `<div style="font-size: 12px; color: var(--gray); margin-top: 4px;">${variant}</div>` : ''}
            <div class="cart-item-variant" style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
              <button class="cart-qty-btn" onclick="updateQuantity('${node.id}', ${node.quantity - 1})" ${node.quantity <= 1 ? 'disabled' : ''}>−</button>
              <span>${node.quantity}</span>
              <button class="cart-qty-btn" onclick="updateQuantity('${node.id}', ${node.quantity + 1})">+</button>
            </div>
            <div class="cart-item-price">${priceHTML}</div>
            <button class="cart-item-remove" onclick="removeFromCart('${node.id}')">Remove</button>
          </div>
        </div>
      `;
    });
    
    cartBody.innerHTML = itemsHTML;
    
    // Update cart count
    const totalItems = cart.lines.edges.reduce((sum, {node}) => sum + node.quantity, 0);
    if (cartCount) {
      cartCount.textContent = totalItems;
    }
    
    // Display totals
    const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
    const total = parseFloat(cart.cost.totalAmount.amount);
    const discount = subtotal - total;
    
    console.log('Discount data:', {
      subtotal,
      total,
      discount,
      discountAllocations: cart.discountAllocations,
      discountCodes: cart.discountCodes
    });
    
    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
    
    if (discount > 0 || (cart.discountCodes && cart.discountCodes.length > 0)) {
      const discountCode = cart.discountCodes?.find(d => d.applicable)?.code || 'Discount';
      document.getElementById('cartDiscount').style.display = 'flex';
      document.getElementById('cartDiscountLabel').textContent = discountCode;
      document.getElementById('cartDiscountAmount').textContent = discount > 0 ? `-$${discount.toFixed(2)}` : 'Applied at checkout';
    } else {
      document.getElementById('cartDiscount').style.display = 'none';
    }
    
    cartFooter.style.display = 'block';
    
    // Set checkout URL
    cartCheckoutBtn.onclick = () => {
      window.open(cart.checkoutUrl, '_blank');
    };
    
  } catch (error) {
    console.error('Failed to load cart:', error);
    cartBody.innerHTML = '<div class="cart-empty">Error loading cart</div>';
    cartFooter.style.display = 'none';
  }
}

// ==================== WISHLIST MANAGEMENT ====================
const headerWishlistBtn = document.getElementById('headerWishlistBtn');
const wishlistCountEl = document.getElementById('wishlistCount');

// Wishlist stored in localStorage with Shopify customer sync
function getWishlist() {
  const wishlist = localStorage.getItem('kycek_wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
}

function saveWishlist(wishlist) {
  localStorage.setItem('kycek_wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
  
  // Sync to Shopify if logged in
  if (isLoggedIn()) {
    syncWishlistToShopify(wishlist);
  }
}

async function syncWishlistToShopify(wishlist) {
  try {
    const handles = wishlist.map(item => item.handle).join(',');
    
    const mutation = `
      mutation {
        customerUpdate(customer: {
          metafields: [
            {
              namespace: "custom"
              key: "wishlist"
              value: "${handles}"
              type: "single_line_text_field"
            }
          ]
        }) {
          customer {
            id
          }
          customerUserErrors {
            message
          }
        }
      }
    `;
    
    await customerFetch(mutation);
  } catch (error) {
    console.error('Failed to sync wishlist:', error);
  }
}

async function loadWishlistFromShopify() {
  if (!isLoggedIn()) return;
  
  try {
    const query = `{
      customer {
        metafield(namespace: "custom", key: "wishlist") {
          value
        }
      }
    }`;
    
    const data = await customerFetch(query);
    if (data.customer?.metafield?.value) {
      const handles = data.customer.metafield.value.split(',');
      
      // Fetch product details for each handle
      const products = await Promise.all(
        handles.map(handle => getProductByHandle(handle).catch(() => null))
      );
      
      const wishlist = products.filter(p => p).map(product => ({
        handle: product.handle,
        title: product.title,
        image: product.images.edges[0]?.node?.url || '',
        price: parseFloat(product.priceRange.minVariantPrice.amount).toFixed(0)
      }));
      
      localStorage.setItem('kycek_wishlist', JSON.stringify(wishlist));
      updateWishlistCount();
    }
  } catch (error) {
    console.error('Failed to load wishlist from Shopify:', error);
  }
}

function updateWishlistCount() {
  if (!wishlistCountEl) return;
  const wishlist = getWishlist();
  wishlistCountEl.textContent = wishlist.length;
}

window.toggleWishlist = function(productHandle, productTitle, productImage, productPrice) {
  const wishlist = getWishlist();
  const index = wishlist.findIndex(item => item.handle === productHandle);
  
  if (index > -1) {
    wishlist.splice(index, 1);
    saveWishlist(wishlist);
  } else {
    wishlist.push({
      handle: productHandle,
      title: productTitle,
      image: productImage,
      price: productPrice
    });
    saveWishlist(wishlist);
  }
}

// Header wishlist button - show modal
if (headerWishlistBtn) {
  headerWishlistBtn.addEventListener('click', () => {
    const wishlist = getWishlist();
    
    if (wishlist.length === 0) {
      alert('Your wishlist is empty');
      return;
    }
    
    let html = '<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">';
    html += '<div style="background: var(--dark); border: 1px solid var(--dark-border); padding: clamp(20px, 5vw, 40px); max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;">';
    html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;"><h2 style="font-size: 24px;">Your Wishlist</h2><button onclick="this.closest(\'.wishlist-modal\').remove()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button></div>';
    
    wishlist.forEach(item => {
      html += `
        <div style="display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--dark-border); align-items: center;">
          <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; flex-shrink: 0;">
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; margin-bottom: 4px;">${item.title}</div>
            <div style="color: var(--gray);">$${item.price}</div>
          </div>
          <a href="product-page.html?handle=${item.handle}" style="padding: 8px 12px; background: var(--red); color: white; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; flex-shrink: 0;">View</a>
          <button onclick="toggleWishlist('${item.handle}', '${item.title}', '${item.image}', '${item.price}'); this.closest('.wishlist-modal').remove();" style="padding: 8px 12px; background: none; border: 1px solid var(--dark-border); color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; flex-shrink: 0;">Remove</button>
        </div>
      `;
    });
    
    html += '</div></div>';
    
    const modal = document.createElement('div');
    modal.className = 'wishlist-modal';
    modal.innerHTML = html;
    document.body.appendChild(modal);
  });
}

// Update count and button state on load
updateWishlistCount();
loadWishlistFromShopify();

// ==================== CUSTOMER ACCOUNT MANAGEMENT ====================
const accountBtn = document.getElementById('headerAccountBtn');

// Check if customer is logged in
function isLoggedIn() {
  return !!localStorage.getItem('shopify_customer_token');
}

function getCustomerToken() {
  return localStorage.getItem('shopify_customer_token');
}

function setCustomerToken(token) {
  localStorage.setItem('shopify_customer_token', token);
}

window.logout = function() {
  localStorage.removeItem('shopify_customer_token');
  localStorage.removeItem('shopify_customer_data');
  alert('Logged out successfully');
  location.reload();
}

// Customer Account API calls
async function customerFetch(query) {
  const token = getCustomerToken();
  if (!token) {
    throw new Error('Not logged in');
  }
  
  const response = await fetch(
    `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken,
        'X-Shopify-Customer-Access-Token': token
      },
      body: JSON.stringify({ query })
    }
  );
  
  const json = await response.json();
  if (json.errors) {
    console.error('Customer API Error:', json.errors);
    throw new Error(json.errors[0].message);
  }
  
  return json.data;
}

async function getCustomerData() {
  const query = `{
    customer {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        address1
        city
        province
        country
        zip
      }
    }
  }`;
  
  return await customerFetch(query);
}

// Account button click handler
if (accountBtn) {
  accountBtn.addEventListener('click', async () => {
    if (!isLoggedIn()) {
      showLoginModal();
    } else {
      try {
        const data = await getCustomerData();
        showAccountModal(data.customer);
      } catch (error) {
        console.error('Failed to load customer data:', error);
        // Token might be expired, show login
        logout();
        showLoginModal();
      }
    }
  });
}

function showLoginModal() {
  const html = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: var(--dark); border: 1px solid var(--dark-border); padding: 40px; max-width: 400px; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="font-size: 24px;">Account</h2>
          <button onclick="this.closest('.account-modal').remove()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
        </div>
        <div style="margin-bottom: 16px;">
          <input type="email" id="loginEmail" placeholder="Email" style="width: 100%; padding: 12px; background: var(--black); border: 1px solid var(--dark-border); color: white; font-family: inherit; font-size: 14px; margin-bottom: 12px;">
          <input type="password" id="loginPassword" placeholder="Password" style="width: 100%; padding: 12px; background: var(--black); border: 1px solid var(--dark-border); color: white; font-family: inherit; font-size: 14px;">
        </div>
        <button onclick="handleLogin()" style="width: 100%; padding: 16px; background: var(--red); color: white; border: none; font-family: inherit; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; margin-bottom: 12px;">Log In</button>
        <div style="text-align: center; color: var(--gray); font-size: 12px;">
          Don't have an account? <a href="https://kycek.myshopify.com/account/register" target="_blank" style="color: var(--white); text-decoration: underline;">Sign up</a>
        </div>
      </div>
    </div>
  `;
  
  const modal = document.createElement('div');
  modal.className = 'account-modal';
  modal.innerHTML = html;
  document.body.appendChild(modal);
}

function showAccountModal(customer) {
  const html = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: var(--dark); border: 1px solid var(--dark-border); padding: 40px; max-width: 500px; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="font-size: 24px;">My Account</h2>
          <button onclick="this.closest('.account-modal').remove()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
        </div>
        <div style="margin-bottom: 24px;">
          <div style="margin-bottom: 16px;">
            <div style="color: var(--gray); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Name</div>
            <div style="font-size: 16px;">${customer.firstName} ${customer.lastName}</div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="color: var(--gray); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Email</div>
            <div style="font-size: 16px;">${customer.email}</div>
          </div>
          ${customer.defaultAddress ? `
            <div style="margin-bottom: 16px;">
              <div style="color: var(--gray); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Default Address</div>
              <div style="font-size: 14px; line-height: 1.6;">
                ${customer.defaultAddress.address1}<br>
                ${customer.defaultAddress.city}, ${customer.defaultAddress.province} ${customer.defaultAddress.zip}<br>
                ${customer.defaultAddress.country}
              </div>
            </div>
          ` : ''}
        </div>
        <a href="https://kycek.myshopify.com/account" target="_blank" style="display: block; width: 100%; padding: 16px; background: var(--red); color: white; border: none; font-family: inherit; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; text-align: center; text-decoration: none; margin-bottom: 12px;">Manage Account</a>
        <button onclick="logout()" style="width: 100%; padding: 16px; background: none; border: 1px solid var(--dark-border); color: white; font-family: inherit; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;">Log Out</button>
      </div>
    </div>
  `;
  
  const modal = document.createElement('div');
  modal.className = 'account-modal';
  modal.innerHTML = html;
  document.body.appendChild(modal);
}

window.handleLogin = async function() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  
  try {
    const mutation = `
      mutation {
        customerAccessTokenCreate(input: {
          email: "${email}"
          password: "${password}"
        }) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            message
          }
        }
      }
    `;
    
    const response = await fetch(
      `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken
        },
        body: JSON.stringify({ query: mutation })
      }
    );
    
    const json = await response.json();
    
    if (json.data.customerAccessTokenCreate.customerUserErrors.length > 0) {
      alert(json.data.customerAccessTokenCreate.customerUserErrors[0].message);
      return;
    }
    
    const token = json.data.customerAccessTokenCreate.customerAccessToken.accessToken;
    setCustomerToken(token);
    
    document.querySelector('.account-modal').remove();
    alert('Logged in successfully!');
    
    // Refresh to load customer data
    const data = await getCustomerData();
    showAccountModal(data.customer);
    
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + error.message);
  }
};
