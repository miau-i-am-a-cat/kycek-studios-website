# Test Pages with Shopify Integration

## Live URLs

**Base URL:** https://miau-i-am-a-cat.github.io/kycek-studios-website/

### Test Pages (NEW - Shopify Integrated)
- **Homepage Test:** https://miau-i-am-a-cat.github.io/kycek-studios-website/index-test.html
- **Product Page Test:** https://miau-i-am-a-cat.github.io/kycek-studios-website/product-test.html

### Original Pages (REFERENCE - Static)
- **Homepage Original:** https://miau-i-am-a-cat.github.io/kycek-studios-website/index.html
- **Product Pages Original:** 
  - https://miau-i-am-a-cat.github.io/kycek-studios-website/products/essential-tee-white.html
  - https://miau-i-am-a-cat.github.io/kycek-studios-website/products/essential-tee-black.html

## What's Different in Test Pages

### Dynamic Shopify Integration
- Products load from Shopify Storefront API
- Prices pulled from Shopify backend
- Images served from Shopify CDN
- Product availability (sold out) synced in real-time
- All 5 products visible: 4 current SKUs + Limited Edition Hoodie

### Files Added
1. **config.js** - Shopify API configuration and fetch functions
2. **index-test.html** - Dynamic homepage with product grid
3. **product-test.html** - Dynamic product detail page

## Shopify Products (Live Data)

Currently showing 5 products:
1. Origins Performance T-shirt (White) - $50 - SOLD OUT
2. Origins Performance Shorts (White) - $80 - SOLD OUT
3. Origins Performance T-shirt (Black) - $50 - SOLD OUT
4. Origins Performance Shorts (Black) - $80 - SOLD OUT
5. Limited Edition (Hoodie - Heather Grey & Slate Blue) - $89 - SOLD OUT

## Next Steps

1. ✅ Test pages are live and connected to Shopify
2. Preview and verify product data is loading correctly
3. Edit/improve design based on real data
4. When satisfied, replace index.html with final version
5. Connect to Vercel for custom domain
