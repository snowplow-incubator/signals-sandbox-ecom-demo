import {
  newTracker,
  setUserId,
  clearUserData,
  BrowserTracker,
} from "@snowplow/browser-tracker";
import {
  SnowplowEcommercePlugin,
  trackAddToCart,
  trackProductView,
} from "@snowplow/browser-plugin-snowplow-ecommerce";
import {
  SignalsInterventionsPlugin,
  subscribeToInterventions,
} from "@snowplow/signals-browser-plugin";

interface Product {
  id: number;
  title: string;
  brand?: string;
  category: string;
  price: number;
}

let isInitialized = false;
export let tracker: BrowserTracker | undefined | null = undefined;

export const initializeSnowplow = (
  collectorUrl: string,
  signalsApiUrl: string,
  userId?: string,
) => {
  if (!isInitialized) {
    tracker = newTracker("sp", collectorUrl, {
      appId: "ai_demo",
      discoverRootDomain: true,
      cookieSameSite: "Lax",
      contexts: {
        webPage: true,
      },
      plugins: [SnowplowEcommercePlugin(), SignalsInterventionsPlugin()],
    });

    subscribeToInterventions({
      endpoint: signalsApiUrl,
    });

    isInitialized = true;
  }

  // Set user ID if provided
  if (userId) {
    setUserId(userId);
  }
};

export const updateSnowplowUser = (userId: string, userEmail?: string) => {
  console.log("Updating Snowplow user:", userId);

  // Clear previous user data
  clearUserData();

  // Set new user ID
  setUserId(userId);
};

export const resetUserData = () => {
  console.log("Resetting user data");
  clearUserData();
};

export const trackProductViewEvent = (product: Product) => {
  console.log("trackProductView", product);
  trackProductView({
    id: String(product.id),
    name: product.title,
    brand: product.brand || "N/A",
    category: product.category,
    price: product.price,
    currency: "USD",
  });
};

export const trackAddToCartEvent = (product: Product) => {
  console.log("trackAddToCart", product);
  trackAddToCart({
    products: [
      {
        id: String(product.id),
        name: product.title,
        brand: product.brand || "N/A",
        category: product.category,
        price: product.price,
        currency: "USD",
      },
    ],
    total_value: product.price,
    currency: "USD",
  });
};
