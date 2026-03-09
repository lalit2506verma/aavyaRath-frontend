import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Check, Package, Download, ShoppingBag } from "lucide-react";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiClient.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Layout>
        <div className="container-custom section-padding flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container-custom section-padding text-center">
          <h1 className="heading-md mb-4">Order Not Found</h1>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="container-custom section-padding"
        data-testid="order-confirmation-page"
      >
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-zoom-in">
            <Check className="text-green-600" size={40} />
          </div>

          <h1 className="heading-md mb-3">Thank You for Your Order!</h1>
          <p className="text-muted-foreground mb-8">
            Your order has been placed successfully. We'll send you an email
            confirmation shortly.
          </p>

          {/* Order Details Card */}
          <div className="bg-card rounded-xl border border-border p-6 text-left mb-8">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1628072380604-22bcabb71740"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">₹{item.total.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shipping_cost === 0
                    ? "Free"
                    : `₹${order.shipping_cost}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{order.tax.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Shipping to:</p>
              <p className="font-medium">{order.shipping_address.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {order.shipping_address.line1}
                {order.shipping_address.line2 &&
                  `, ${order.shipping_address.line2}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shipping_address.city}, {order.shipping_address.state} -{" "}
                {order.shipping_address.pincode}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/track-order/${orderId}`}>
              <Button className="gap-2 w-full sm:w-auto">
                <Package size={18} />
                Track Your Order
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <ShoppingBag size={18} />
                Continue Shopping
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmationPage;
