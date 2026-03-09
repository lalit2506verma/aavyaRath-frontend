import React, { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    min_order_value: "",
    max_discount_cap: "",
    valid_from: "",
    valid_to: "",
    usage_limit: "",
  });

  const fetchCoupons = async () => {
    try {
      const response = await apiClient.get("/admin/coupons");
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiClient.post("/admin/coupons", {
        ...formData,
        code: formData.code.toUpperCase(),
        value: parseFloat(formData.value),
        min_order_value: parseFloat(formData.min_order_value) || 0,
        max_discount_cap: formData.max_discount_cap
          ? parseFloat(formData.max_discount_cap)
          : null,
        usage_limit: formData.usage_limit
          ? parseInt(formData.usage_limit)
          : null,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_to: new Date(formData.valid_to).toISOString(),
        applicable_categories: [],
      });

      toast.success("Coupon created");
      setIsDialogOpen(false);
      setFormData({
        code: "",
        type: "percentage",
        value: "",
        min_order_value: "",
        max_discount_cap: "",
        valid_from: "",
        valid_to: "",
        usage_limit: "",
      });
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to create coupon");
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await apiClient.delete(`/admin/coupons/${couponId}`);
      setCoupons((prev) => prev.filter((c) => c.coupon_id !== couponId));
      toast.success("Coupon deleted");
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6" data-testid="admin-coupons">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Coupons</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} />
                Add Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Coupon</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g. SAVE10"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Discount Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="flat">Flat Amount</SelectItem>
                        <SelectItem value="freeshipping">
                          Free Shipping
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      placeholder={
                        formData.type === "percentage" ? "10" : "100"
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_order_value">Min. Order Value</Label>
                    <Input
                      id="min_order_value"
                      type="number"
                      value={formData.min_order_value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          min_order_value: e.target.value,
                        }))
                      }
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_discount_cap">Max Discount Cap</Label>
                    <Input
                      id="max_discount_cap"
                      type="number"
                      value={formData.max_discount_cap}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          max_discount_cap: e.target.value,
                        }))
                      }
                      placeholder="200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valid_from">Valid From</Label>
                    <Input
                      id="valid_from"
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          valid_from: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="valid_to">Valid Until</Label>
                    <Input
                      id="valid_to"
                      type="date"
                      value={formData.valid_to}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          valid_to: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="usage_limit">Usage Limit</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        usage_limit: e.target.value,
                      }))
                    }
                    placeholder="100 (leave empty for unlimited)"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Coupon
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Coupons Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Valid Until</th>
                <th>Status</th>
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
              ) : coupons.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.coupon_id}>
                    <td className="font-mono font-medium">{coupon.code}</td>
                    <td className="capitalize">{coupon.type}</td>
                    <td>
                      {coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : `₹${coupon.value}`}
                    </td>
                    <td>₹{coupon.min_order_value}</td>
                    <td>
                      {coupon.usage_count || 0}
                      {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                    </td>
                    <td className="text-sm">
                      {new Date(coupon.valid_to).toLocaleDateString()}
                    </td>
                    <td>
                      <Badge
                        variant={coupon.is_active ? "default" : "secondary"}
                      >
                        {coupon.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(coupon.coupon_id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
