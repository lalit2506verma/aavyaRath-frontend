import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useAuth, useCart, apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const ProductCard = ({
  product,
  onWishlistToggle,
  isWishlisted = false,
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      await addToCart(product.product_id);
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }

    try {
      if (isWishlisted) {
        await apiClient.delete(`/wishlist/${product.product_id}`);
        toast.success("Removed from wishlist");
      } else {
        await apiClient.post(`/wishlist/${product.product_id}`);
        toast.success("Added to wishlist!");
      }
      onWishlistToggle?.(product.product_id);
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const discountPercent = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="product-card group"
      data-testid={`product-card-${product.product_id}`}
    >
      {/* Image */}
      <div className="product-card-image relative">
        <img
          src={
            product.images?.[0] ||
            "https://images.unsplash.com/photo-1628072380604-22bcabb71740"
          }
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new_arrival && (
            <Badge className="badge-new text-xs px-2 py-0.5">New</Badge>
          )}
          {product.is_sale && discountPercent > 0 && (
            <Badge className="badge-sale text-xs px-2 py-0.5">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-white/80 text-muted-foreground hover:bg-white hover:text-red-500"
          } opacity-0 group-hover:opacity-100`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          data-testid={`wishlist-btn-${product.product_id}`}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Quick add button */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            onClick={handleAddToCart}
            className="w-full rounded-full gap-2"
            size="sm"
            disabled={product.stock <= 0}
            data-testid={`add-to-cart-btn-${product.product_id}`}
          >
            <ShoppingBag size={16} />
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category_name && (
          <p className="text-xs text-muted-foreground mb-1">
            {product.category_name}
          </p>
        )}

        {/* Name */}
        <h3 className="font-medium text-sm line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={
                    star <= Math.round(product.rating_average)
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.rating_count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="price-current">
            ₹{product.price.toLocaleString()}
          </span>
          {product.compare_at_price && (
            <span className="price-compare">
              ₹{product.compare_at_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
