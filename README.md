# Signals Workshop E-Shop Demo

A comprehensive e-commerce demo application for demonstrating Snowplow Signals integration during workshops. This app showcases how real-time user behavior can trigger personalized interventions based on calculated attributes.

## Repository owner

@snowplow-incubator/com-snowplowanalytics-engineering-digital_analytics

## Features

- 🛍️ Product catalog with modal view fetched from dummyjson.com API
- 📊 Snowplow JavaScript tracker with ecommerce plugin integration
- 🎨 Intervention banners using Snowplow Signals (discount, free shipping, cart abandonment, recommendations)
- 📈 Event tracking for product views, cart actions, and interventions

## Snowplow Signals Overview

### What are Attributes?

**Attributes** are real-time user features calculated from Snowplow events, representing user behavior patterns:

- **`count_product_views`**: Number of product view events (ecommerce actions)
- **`count_add_to_cart`**: Number of add-to-cart events
- **`total_cart_value`**: Sum of prices from add-to-cart events

### What are Interventions?

**Interventions** are real-time personalization triggers that fire when user attributes meet specific criteria:

- **`cart_abandonment`**: Triggers when `count_add_to_cart > 0`
- **`discount`**: Triggers when `count_product_views > 3`
- **`free_shipping`**: Triggers when `total_cart_value > 100`

### How it Works

1. **Events** → User actions (product views, cart additions) are tracked
2. **Attributes** → Real-time calculations based on event patterns
3. **Interventions** → Rules that trigger when attribute thresholds are met
4. **Personalization** → Banners, offers, or content shown to users

## Architecture

- **App**: React TypeScript application with Snowplow tracking
- **Signals Processing**: Real-time attribute calculation and intervention triggering
- **API**: RESTful endpoints + Server-Sent Events for live interventions

## Setup & Installation

### Prerequisites

- Python 3.7+
- Node.js 14+
- npm or yarn

### App Setup

1. Install Node dependencies:

```bash
cd app
npm install
```

2. Start the React development server:

```bash
npm start
```

The app will run on `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Browse products (each view is tracked)
3. Click "Add to Cart" buttons (tracked as cart events)
4. Watch for intervention banners that appear automatically
5. Interventions are simulated and sent via Server-Sent Events every 10-30 seconds

## Snowplow Integration

### Tracker Configuration

- **Collector Endpoint**: `https://collector-sales-aws.snowplow.io`
- **App ID**: `ai_demo`
- **Platform**: `web`
- **Plugins**: Browser tracker + Ecommerce plugin

### Tracked Events

- Page views (automatic)
- Product views (when clicking on products) - Uses ecommerce plugin
- Add to cart actions - Uses ecommerce plugin

## Live Intervention Types

The demo implements three real interventions based on the Signals configuration:

### 1. Cart Abandonment Banner

- **Trigger**: User has added items to cart (`count_add_to_cart > 0`)
- **Message**: "Don't forget your items in cart!"
- **Purpose**: Re-engage users who have items in their cart

### 2. Discount Offer

- **Trigger**: User has viewed many products (`count_product_views > 3`)
- **Message**: "10% off your next purchase!"
- **Code**: `SAVE10`
- **Purpose**: Convert high-intent browsers

### 3. Free Shipping Promotion

- **Trigger**: User has high cart value (`total_cart_value > 100`)
- **Message**: "Free shipping on orders over $100!"
- **Code**: `FREE`
- **Purpose**: Encourage larger purchases

See the `attributes_and_interventions.ipynb` notebook for details on attribute and intervention definition.
