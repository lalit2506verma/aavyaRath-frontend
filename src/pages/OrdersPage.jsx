import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Eye, ShoppingBag } from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasAnyOrders, setHasAnyOrders] = useState(null); // null = unknown, true/false after first "all" fetch

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 10 });
        if (statusFilter !== "all") params.set("status", statusFilter);

        const response = await apiClient.get(`/orders?${params.toString()}`);
        const fetchedOrders = response.data.orders;
        setOrders(fetchedOrders);
        setTotalPages(response.data.pages);

        // Track whether the user has ANY orders at all (based on "all" tab)
        if (statusFilter === "all") {
          setHasAnyOrders(fetchedOrders.length > 0 || response.data.total > 0);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter, page]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "status-pending",
      processing: "status-processing",
      shipped: "status-shipped",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    };
    return <Badge className={styles[status] || ""}>{status}</Badge>;
  };

  // Only show the full empty state (no orders at all) on initial load of "all" tab
  if (hasAnyOrders === false && statusFilter === "all" && !loading) {
    return (
      <Layout>
        <div className="container-custom section-padding">
          <div className="empty-state max-w-md mx-auto">
            <div className="empty-state-icon">
              <Package size={32} />
            </div>
            <h2 className="heading-md mb-3">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping to see your
              orders here.
            </p>
            <Link to="/shop">
              <Button className="gap-2">
                <ShoppingBag size={18} />
                Start Shopping
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
        data-testid="orders-page"
      >
        <h1 className="heading-md mb-8">My Orders</h1>

        {/* Status Filter — always visible */}
        <Tabs
          value={statusFilter}
          onValueChange={handleFilterChange}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading skeletons */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty state for a specific status tab */
          <div className="text-center py-16">
            <div className="empty-state-icon mx-auto mb-4">
              <Package size={32} />
            </div>
            <p className="text-muted-foreground">
              No <span className="font-medium">{statusFilter}</span> orders
              found.
            </p>
          </div>
        ) : (
          <>
            {/* Orders List */}
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-card rounded-xl border border-border p-4 md:p-6"
                  data-testid={`order-${order.order_id}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="font-semibold">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.fulfillment_status)}
                      <Link to={`/track-order/${order.order_id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye size={14} />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {order.items.slice(0, 4).map((item, index) => (
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
                    {order.items.length > 4 && (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm text-muted-foreground">
                          +{order.items.length - 4}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </p>
                    <p className="font-semibold">
                      ₹{order.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
