import React, { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Eye, Truck } from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierPartner, setCourierPartner] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 20 });
        if (statusFilter !== "all") params.set("status", statusFilter);

        const response = await apiClient.get(
          `/admin/orders?${params.toString()}`,
        );
        setOrders(response.data.orders);
        setTotalPages(response.data.pages);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page, statusFilter]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    try {
      await apiClient.patch(`/admin/orders/${selectedOrder.order_id}/status`, {
        status: newStatus,
        tracking_number: trackingNumber || undefined,
        courier_partner: courierPartner || undefined,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === selectedOrder.order_id
            ? { ...o, fulfillment_status: newStatus }
            : o,
        ),
      );

      toast.success("Order status updated");
      setIsDetailOpen(false);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "status-pending",
      processing: "status-processing",
      shipped: "status-shipped",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    };
    return colors[status] || "";
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.fulfillment_status);
    setTrackingNumber(order.tracking_number || "");
    setCourierPartner(order.courier_partner || "");
    setIsDetailOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6" data-testid="admin-orders">
        <h1 className="text-2xl font-semibold mb-6">Orders</h1>

        {/* Status Tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
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

        {/* Orders Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id}>
                    <td className="font-medium">{order.order_number}</td>
                    <td>
                      <p className="text-sm">
                        {order.shipping_address?.full_name}
                      </p>
                    </td>
                    <td>{order.items.length}</td>
                    <td className="font-medium">
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td>
                      <Badge
                        variant={
                          order.payment_status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        className={getStatusColor(order.fulfillment_status)}
                      >
                        {order.fulfillment_status}
                      </Badge>
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openOrderDetail(order)}
                      >
                        <Eye size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm">
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

        {/* Order Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Order Details - {selectedOrder?.order_number}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-3">Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
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
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ₹{item.total.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <p className="font-medium">
                      {selectedOrder.shipping_address?.full_name}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedOrder.shipping_address?.line1}
                      {selectedOrder.shipping_address?.line2 &&
                        `, ${selectedOrder.shipping_address.line2}`}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedOrder.shipping_address?.city},{" "}
                      {selectedOrder.shipping_address?.state} -{" "}
                      {selectedOrder.shipping_address?.pincode}
                    </p>
                    <p className="text-muted-foreground">
                      Phone: {selectedOrder.shipping_address?.phone}
                    </p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subtotal:</span> ₹
                    {selectedOrder.subtotal?.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Shipping:</span> ₹
                    {selectedOrder.shipping_cost?.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tax:</span> ₹
                    {selectedOrder.tax?.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Discount:</span> ₹
                    {selectedOrder.discount?.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-lg font-semibold">
                    Total: ₹{selectedOrder.total?.toLocaleString()}
                  </div>
                </div>

                {/* Update Status */}
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Truck size={18} />
                    Update Status
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Order Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newStatus === "shipped" && (
                      <>
                        <div>
                          <Label>Tracking Number</Label>
                          <Input
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Enter tracking number"
                          />
                        </div>
                        <div>
                          <Label>Courier Partner</Label>
                          <Input
                            value={courierPartner}
                            onChange={(e) => setCourierPartner(e.target.value)}
                            placeholder="e.g. Delhivery, BlueDart"
                          />
                        </div>
                      </>
                    )}
                    <Button onClick={handleStatusUpdate} className="w-full">
                      Update Status
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;