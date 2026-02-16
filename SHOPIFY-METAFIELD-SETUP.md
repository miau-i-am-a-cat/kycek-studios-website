# Shopify Metafield Setup for Color Switching

## Overview

Products are kept separate in Shopify (one per color), but appear as one product with color switching on the frontend.

## Setup Instructions

### 1. Create Metafield Definition (One Time)

1. Go to **Shopify Admin → Settings → Custom data**
2. Click **Products** (under Metafields)
3. Click **Add definition**
4. Fill in:
   - **Name:** Related Colors
   - **Namespace and key:** `custom.related_colors`
   - **Type:** JSON
   - **Description:** Maps color names to product handles for color switching

### 2. Add Metafield to Each Product

For each color variant product, add the metafield with related colors:

#### Example: Essential Tee White

1. Go to product: **Essential Tee White**
2. Scroll to **Metafields** section
3. Find **Related Colors** field
4. Enter JSON:
```json
{
  "Black": "essential-tee-black"
}
```

#### Example: Essential Tee Black

1. Go to product: **Essential Tee Black**
2. Find **Related Colors** field
3. Enter JSON:
```json
{
  "White": "essential-tee-white"
}
```

#### Example: Product with Multiple Colors

If you have Grey, Blue, etc:

Product: **Essential Tee White**
```json
{
  "Black": "essential-tee-black",
  "Grey": "essential-tee-grey",
  "Blue": "essential-tee-blue"
}
```

Product: **Essential Tee Black**
```json
{
  "White": "essential-tee-white",
  "Grey": "essential-tee-grey",
  "Blue": "essential-tee-blue"
}
```

## Product Handle Reference

Current products and their handles:

| Product | Handle |
|---------|--------|
| Essential Tee White | `activewear-example-product-3` or rename to `essential-tee-white` |
| Essential Tee Black | `performance-t-shirt` or rename to `essential-tee-black` |
| Training Short White | `activewear-example-product-4` or rename to `training-short-white` |
| Training Short Black | `performance-shorts` or rename to `training-short-black` |
| Limited Edition Hoodie | `limited-edition` |

## How It Works on Frontend

1. User lands on product page (e.g., Essential Tee White)
2. Code reads `related_colors` metafield
3. Generates color swatches: one for current color (active) + one for each related color
4. Clicking a related color navigates to that product's page
5. Smooth transition makes it feel like instant color switching

## Important Notes

- Color is detected from product title or handle (looks for "white", "black", "grey", "blue")
- Supported colors: White, Black, Grey/Gray, Blue
- To add more colors, they'll need to be added to the code
- If metafield is missing, it falls back to showing variants (if any exist)

## Maintenance

When adding a new color:
1. Create the product in Shopify
2. Add metafield pointing to other colors
3. Update existing products' metafields to include the new color
