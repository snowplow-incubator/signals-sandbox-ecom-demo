import React, { useState, useEffect } from "react";
import {
  initializeSnowplow,
  trackProductViewEvent,
  trackAddToCartEvent,
  resetUserData,
} from "./snowplow";

import {
  addInterventionHandlers,
  Intervention,
} from "@snowplow/signals-browser-plugin";

interface AppConfig {
  collectorUrl: string;
  profilesApiUrl: string;
}

interface Product {
  id: number;
  title: string;
  brand?: string;
  category: string;
  price: number;
  thumbnail: string;
  description: string;
  stock: number;
  rating: number;
}

interface BannerIntervention {
  type: string;
  message: string;
  code?: string;
}

interface WelcomeScreenProps {
  onConfigSubmit: (config: AppConfig) => void;
}

function WelcomeScreen({ onConfigSubmit }: WelcomeScreenProps) {
  const [collectorUrl, setCollectorUrl] = useState(() => {
    return localStorage.getItem("snowplow_collector_url") || "";
  });
  const [profilesApiUrl, setProfilesApiUrl] = useState(() => {
    return localStorage.getItem("snowplow_profiles_api_url") || "";
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (collectorUrl && profilesApiUrl) {
      // Save to localStorage
      localStorage.setItem("snowplow_collector_url", collectorUrl);
      localStorage.setItem("snowplow_profiles_api_url", profilesApiUrl);
      onConfigSubmit({ collectorUrl, profilesApiUrl });
    }
  };

  return (
    <div className="app">
      <div className="welcome-screen">
        <div className="welcome-content">
          <h1>🛍️ Snowplow Signals E-Shop</h1>
          <p className="welcome-subtitle">
            Demo application showcasing Snowplow Signals personalization
          </p>

          <div className="welcome-intro">
            <p>
              Welcome! Please configure your Snowplow settings to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="config-form">
            <div className="form-group">
              <label htmlFor="collectorUrl">Collector URL</label>
              <input
                type="url"
                id="collectorUrl"
                value={collectorUrl}
                onChange={(e) => setCollectorUrl(e.target.value)}
                placeholder="https://collector-example.snowplow.io"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profilesApiUrl">Profiles API URL</label>
              <input
                type="url"
                id="profilesApiUrl"
                value={profilesApiUrl}
                onChange={(e) => setProfilesApiUrl(e.target.value)}
                placeholder="https://your-endpoint.signals.snowplowanalytics.com"
                required
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-large">
              Start Shopping
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

function ProductModal({ product, onClose }: ProductModalProps) {
  const handleAddToCart = () => {
    if (product) {
      trackAddToCartEvent(product);
      alert(`Added ${product.title} to cart!`);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2>Product Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-content">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="product-modal-image"
          />
          <h1 className="product-modal-title">{product.title}</h1>
          <div className="product-modal-price">${product.price}</div>
          <p className="product-modal-description">{product.description}</p>

          <div className="product-modal-details">
            <div className="product-detail">
              <div className="product-detail-label">Category</div>
              <div className="product-detail-value">{product.category}</div>
            </div>
            <div className="product-detail">
              <div className="product-detail-label">Brand</div>
              <div className="product-detail-value">
                {product.brand || "N/A"}
              </div>
            </div>
            <div className="product-detail">
              <div className="product-detail-label">Stock</div>
              <div className="product-detail-value">{product.stock} items</div>
            </div>
            <div className="product-detail">
              <div className="product-detail-label">Rating</div>
              <div className="product-detail-value">⭐ {product.rating}/5</div>
            </div>
          </div>

          <div className="product-modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InterventionBannerProps {
  intervention: BannerIntervention | null;
  onClose: () => void;
}

function InterventionBanner({
  intervention,
  onClose,
}: InterventionBannerProps) {
  const handleClick = () => {
    onClose();
  };

  if (!intervention) return null;

  return (
    <div className={`intervention-banner intervention-${intervention.type}`}>
      <span>{intervention.message}</span>
      {intervention.code && (
        <span>
          {" "}
          Use code: <strong>{intervention.code}</strong>
        </span>
      )}
      <button className="intervention-close" onClick={handleClick}>
        ×
      </button>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
}

function ProductCard({ product, onViewProduct }: ProductCardProps) {
  const handleViewProduct = () => {
    trackProductViewEvent(product);
    onViewProduct(product);
  };

  const handleAddToCart = () => {
    trackAddToCartEvent(product);
    alert(`Added ${product.title} to cart!`);
  };

  return (
    <div className="product-card" onClick={handleViewProduct}>
      <img
        src={product.thumbnail}
        alt={product.title}
        className="product-image"
      />
      <h3 className="product-title">{product.title}</h3>
      <p className="product-description">
        {product.description.substring(0, 100)}...
      </p>
      <div className="product-price">${product.price}</div>
      <button
        className="btn btn-primary"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          handleAddToCart();
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}

interface AppContentProps {
  config: AppConfig;
  onEditConfig: () => void;
}

function AppContent({ config, onEditConfig }: AppContentProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [intervention, setIntervention] = useState<BannerIntervention | null>(
    null,
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Initialize Snowplow tracking
    initializeSnowplow(config.collectorUrl, config.profilesApiUrl);
    // Reset domain_userid on every page reload
    resetUserData();

    fetch("https://dummyjson.com/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });

    addInterventionHandlers({
      handler: (intervention: Intervention) => {
        console.log("intervention received!", intervention);

        if (intervention.name === "cart_abandonment") {
          setIntervention({
            type: "cart_abandonment",
            message: "Don't forget your items in cart!",
          });
        } else if (intervention.name === "discount") {
          setIntervention({
            type: "discount",
            message: "10% off your next purchase!",
            code: "SAVE10",
          });
        } else if (intervention.name === "free_shipping") {
          setIntervention({
            type: "free_shipping",
            message: "Free shipping on orders over $100!",
            code: "FREE",
          });
        } else {
          console.log("unknown intervention", intervention);
        }

        setTimeout(() => {
          setIntervention(null);
        }, 60000);
      },
    });
  }, [config.collectorUrl, config.profilesApiUrl]);

  const closeIntervention = () => {
    setIntervention(null);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const handleResetUserData = () => {
    resetUserData();
    alert(
      "User data has been reset. Attributes will be recalculated and interventions will trigger again.",
    );
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <InterventionBanner
        intervention={intervention}
        onClose={closeIntervention}
      />

      <header className="header">
        <h1>🛍️ Snowplow Signals E-Shop</h1>
        <p>Demo application showcasing Snowplow Signals personalization</p>
        <div className="header-buttons">
          <button className="btn btn-secondary" onClick={onEditConfig}>
            Edit Configuration
          </button>
          <button className="btn btn-reset" onClick={handleResetUserData}>
            Reset User Data
          </button>
        </div>
      </header>

      <div className="main-content">
        <main className="products-section">
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewProduct={handleViewProduct}
              />
            ))}
          </div>
        </main>
      </div>

      <ProductModal product={selectedProduct} onClose={closeProductModal} />
    </div>
  );
}

function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  const handleConfigSubmit = (newConfig: AppConfig) => {
    setConfig(newConfig);
  };

  const handleEditConfig = () => {
    setConfig(null);
  };

  if (!config) {
    return <WelcomeScreen onConfigSubmit={handleConfigSubmit} />;
  }

  return <AppContent config={config} onEditConfig={handleEditConfig} />;
}

export default App;
