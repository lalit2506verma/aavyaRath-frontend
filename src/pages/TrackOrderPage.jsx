import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Package, Truck, MapPin, Clock, Search } from "lucide-react";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(!!orderId);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchTracking(orderId);
    }
  }, [orderId]);

  const fetchTracking = async (id) => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get(`/orders/${id}/tracking`);
      setTracking(response.data);
    } catch (error) {
      setError("Order not found. Please check the order ID.");
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchOrderId.trim()) {
      fetchTracking(searchOrderId);
    }
  };

  const trackingSteps = [
    { key: "pending", label: "Order Placed", icon: Package },
    { key: "processing", label: "Processing", icon: Clock },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: MapPin },
  ];

  const getStepStatus = (stepKey) => {
    const statusOrder = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(tracking?.fulfillment_status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <Layout>
      <div
        className="container-custom section-padding"
        data-testid="track-order-page"
      >
        <div className="max-w-2xl mx-auto">
          <h1 className="heading-md text-center mb-8">Track Your Order</h1>

          {/* Search Form (if no orderId in URL) */}
          {!orderId && (
            <div className="bg-card rounded-xl border border-border p-6 mb-8">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    value={searchOrderId}
                    onChange={(e) => setSearchOrderId(e.target.value)}
                    placeholder="Enter your order ID"
                    data-testid="track-order-id"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Registered email"
                  />
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Search size={18} />
                  Track Order
                </Button>
              </form>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-60 w-full rounded-xl" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Tracking Info */}
          {tracking && !loading && (
            <>
              {/* Order Summary */}
              <div className="bg-card rounded-xl border border-border p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Order Number
                    </p>
                    <p className="font-semibold">{tracking.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-semibold">
                      {new Date(tracking.created_at).toLocaleDateString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex items-center gap-3 pt-4 border-t border-border overflow-x-auto">
                  {tracking.items.map((item, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0"
                    >
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1628072380604-22bcabb71740"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold mb-6">Shipment Status</h2>

                <div className="tracking-timeline">
                  {trackingSteps.map((step, index) => {
                    const status = getStepStatus(step.key);
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className={`tracking-step ${status}`}>
                        <div className="tracking-step-dot">
                          {status === "completed" ? (
                            <Check size={12} className="text-white" />
                          ) : null}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${status === "pending" ? "text-muted-foreground" : ""}`}
                          >
                            {step.label}
                          </p>
                          {status === "active" && (
                            <p className="text-sm text-primary">
                              Current Status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Courier Info */}
                {tracking.tracking_number && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">
                      Tracking Number
                    </p>
                    <p className="font-mono font-medium">
                      {tracking.tracking_number}
                    </p>
                    {tracking.courier_partner && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Courier: {tracking.courier_partner}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-6">
                <Link to="/account/orders" className="flex-1">
                  <Button variant="outline" className="w-full">
                    View All Orders
                  </Button>
                </Link>
                <Link to="/contact" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Need Help?
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrderPage;
