// Shopify Storefront API Configuration
const SHOPIFY_CONFIG = {
  domain: 'kycek.myshopify.com',
  storefrontAccessToken: '400c51542e9a076aa2b13cee033ca4f9',
  customerAccountAccessToken: '56cbb062-2b7a-4bee-b560-8c32f8608d3c',
  apiVersion: '2024-01'
};

async function shopifyFetch(query) {
  const response = await fetch(
    `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken
      },
      body: JSON.stringify({ query })
    }
  );
  
  const json = await response.json();
  if (json.errors) {
    console.error('Shopify API Error:', json.errors);
    throw new Error(json.errors[0].message);
  }
  
  return json.data;
}

// Fetch all products
async function getProducts(limit = 10) {
  const query = `{
    products(first: ${limit}) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 3) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                priceV2 {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
        }
      }
    }
  }`;
  
  const data = await shopifyFetch(query);
  return data.products.edges.map(edge => edge.node);
}

// Fetch single product by handle
async function getProductByHandle(handle) {
  const query = `{
    productByHandle(handle: "${handle}") {
      id
      title
      handle
      productType
      description
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            priceV2 {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }`;
  
  const data = await shopifyFetch(query);
  return data.productByHandle;
}

// Search products by title to find color variants
async function getProductsByTitle(title) {
  const query = `{
    products(first: 10, query: "title:'${title}'") {
      edges {
        node {
          id
          title
          handle
          productType
          variants(first: 1) {
            edges {
              node {
                availableForSale
              }
            }
          }
        }
      }
    }
  }`;
  
  const data = await shopifyFetch(query);
  return data.products.edges.map(edge => edge.node);
}

// Cart Management
async function createCart() {
  const query = `
    mutation {
      cartCreate {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  
  const data = await shopifyFetch(query);
  return data.cartCreate.cart;
}

async function addToCart(variantId, quantity = 1) {
  // Get or create cart ID
  let cartId = localStorage.getItem('shopify_cart_id');
  
  if (!cartId) {
    const cart = await createCart();
    cartId = cart.id;
    localStorage.setItem('shopify_cart_id', cartId);
  }
  
  const query = `
    mutation {
      cartLinesAdd(
        cartId: "${cartId}"
        lines: [{
          merchandiseId: "${variantId}"
          quantity: ${quantity}
        }]
      ) {
        cart {
          id
          checkoutUrl
          lines(first: 10) {
            edges {
              node {
                id
                quantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  
  const data = await shopifyFetch(query);
  
  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors[0].message);
  }
  
  return data.cartLinesAdd.cart;
}
