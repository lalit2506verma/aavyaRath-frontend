import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await apiClient.get("/wishlist");
        setWishlistItems(response.data.items || []);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleWishlistToggle = (productId) => {
    setWishlistItems((prev) =>
      prev.filter((item) => item.product_id !== productId),
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom section-padding">
          <h1 className="heading-md mb-8">My Wishlist</h1>
          <ProductGridSkeleton count={4} />
        </div>
      </Layout>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Layout>
        <div className="container-custom section-padding">
          <div className="empty-state max-w-md mx-auto">
            <div className="empty-state-icon">
              <Heart size={32} />
            </div>
            <h2 className="heading-md mb-3">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start saving items you love by clicking the heart icon on
              products.
            </p>
            <Link to="/shop">
              <Button className="gap-2">
                <ShoppingBag size={18} />
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="container-custom section-padding"
        data-testid="wishlist-page"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-md">My Wishlist</h1>
          <p className="text-muted-foreground">{wishlistItems.length} items</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlistItems.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              isWishlisted={true}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default WishlistPage;
