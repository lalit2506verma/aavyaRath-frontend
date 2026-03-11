import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { useCart, useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

const CartPage = () => {
  const { cart, cartCount, updateQuantity, removeFromCart, loading } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  const shippingCost = cart.subtotal >= 999 ? 0 : 99;
  const total = cart.subtotal + shippingCost;

  if (cartCount === 0) {
    return (
      <Layout>
        <div className="container-custom section-padding">
          <div className="empty-state max-w-md mx-auto">
            <div className="empty-state-icon">
              <ShoppingBag size={32} />
            </div>
            <h2 className="heading-md mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/shop">
              <Button className="gap-2">
                Start Shopping <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom section-padding" data-testid="cart-page">
        <h1 className="heading-md mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.product_id}
                className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                data-testid={`cart-item-${item.product_id}`}
              >
                {/* Image */}
                <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1628072380604-22bcabb71740"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.slug}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    ₹{item.price.toLocaleString()} each
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity */}
                    <div className="quantity-selector">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product_id,
                            item.quantity - 1,
                          )
                        }
                        disabled={item.quantity <= 1 || loading}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.product_id,
                            parseInt(e.target.value) || 1,
                          )
                        }
                        min={1}
                        max={item.stock}
                      />
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product_id,
                            item.quantity + 1,
                          )
                        }
                        disabled={item.quantity >= item.stock || loading}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">
                        ₹{item.total.toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleRemove(item.product_id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        disabled={loading}
                        data-testid={`remove-item-${item.product_id}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <div className="pt-4">
              <Link to="/shop" className="text-sm text-primary hover:underline">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 bg-card rounded-xl border border-border p-6"
              data-testid="order-summary"
            >
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({cartCount} items)
                  </span>
                  <span>₹{cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{999 - cart.subtotal} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-border my-4" />

              {/* Coupon Code */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input placeholder="Coupon code" className="flex-1" />
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>

              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleCheckout}
                data-testid="checkout-btn"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Taxes calculated at checkout
              </p>

              {/* Trust badges */}
              <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-border">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg"
                  alt="Visa"
                  className="h-5 opacity-50"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"
                  alt="Mastercard"
                  className="h-5 opacity-50"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6f/UPI_logo.svg"
                  alt="UPI"
                  className="h-5 opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
