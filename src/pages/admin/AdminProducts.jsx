import React, { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Add/Edit product dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    price: "",
    compare_at_price: "",
    stock: "",
    category_id: "",
    short_description: "",
    description: "",
    status: "active",
    is_featured: false,
    is_new_arrival: false,
    is_sale: false,
    images: "",
  });

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      sku: "",
      price: "",
      compare_at_price: "",
      stock: "",
      category_id: "",
      short_description: "",
      description: "",
      status: "active",
      is_featured: false,
      is_new_arrival: false,
      is_sale: false,
      images: "",
    });
    setEditingProduct(null);
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/admin/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      const response = await apiClient.get(
        `/admin/products?${params.toString()}`,
      );
      setProducts(response.data.products);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    // Parse images from comma-separated URLs
    const imagesArray = formData.images
      ? formData.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const payload = {
      name: formData.name,
      slug: formData.slug,
      sku: formData.sku,
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price
        ? parseFloat(formData.compare_at_price)
        : null,
      stock: parseInt(formData.stock),
      category_id: formData.category_id || null,
      short_description: formData.short_description,
      description: formData.description,
      status: formData.status,
      is_featured: formData.is_featured,
      is_new_arrival: formData.is_new_arrival,
      is_sale: formData.is_sale,
      images: imagesArray,
    };

    try {
      if (editingProduct) {
        await apiClient.put(
          `/admin/products/${editingProduct.product_id}`,
          payload,
        );
        toast.success("Product updated successfully");
      } else {
        await apiClient.post("/admin/products", payload);
        toast.success("Product created successfully");
      }
      setIsFormDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          (editingProduct
            ? "Failed to update product"
            : "Failed to create product"),
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      slug: product.slug || "",
      sku: product.sku || "",
      price: product.price?.toString() || "",
      compare_at_price: product.compare_at_price?.toString() || "",
      stock: product.stock?.toString() || "",
      category_id: product.category_id || "",
      short_description: product.short_description || "",
      description: product.description || "",
      status: product.status || "active",
      is_featured: product.is_featured || false,
      is_new_arrival: product.is_new_arrival || false,
      is_sale: product.is_sale || false,
      images: product.images?.join(", ") || "",
    });
    setIsFormDialogOpen(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await apiClient.delete(`/admin/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.product_id !== productId));
      toast.success("Product deleted");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()),
      )
    : products;

  return (
    <AdminLayout>
      <div className="p-6" data-testid="admin-products">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Products</h1>

          {/* Add Product Dialog */}
          <Dialog
            open={isFormDialogOpen}
            onOpenChange={(open) => {
              setIsFormDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} />
                Add Product
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {/* Name & Slug */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prod-name">Product Name *</Label>
                    <Input
                      id="prod-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        }))
                      }
                      placeholder="e.g. Ocean Resin Coaster"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="prod-slug">Slug *</Label>
                    <Input
                      id="prod-slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      placeholder="e.g. ocean-resin-coaster"
                      required
                    />
                  </div>
                </div>

                {/* SKU & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prod-sku">SKU *</Label>
                    <Input
                      id="prod-sku"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sku: e.target.value,
                        }))
                      }
                      placeholder="e.g. RC-001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="prod-category">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category_id: value }))
                      }
                    >
                      <SelectTrigger id="prod-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat.category_id}
                            value={cat.category_id}
                          >
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price, Compare Price, Stock */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="prod-price">Price (₹) *</Label>
                    <Input
                      id="prod-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      placeholder="999"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="prod-compare-price">
                      Compare Price (₹)
                    </Label>
                    <Input
                      id="prod-compare-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.compare_at_price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          compare_at_price: e.target.value,
                        }))
                      }
                      placeholder="1299"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prod-stock">Stock *</Label>
                    <Input
                      id="prod-stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          stock: e.target.value,
                        }))
                      }
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <Label htmlFor="prod-short-desc">Short Description</Label>
                  <Input
                    id="prod-short-desc"
                    value={formData.short_description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        short_description: e.target.value,
                      }))
                    }
                    placeholder="One-line product summary"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <Label htmlFor="prod-desc">Description</Label>
                  <Textarea
                    id="prod-desc"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Full product description..."
                    rows={3}
                  />
                </div>

                {/* Images */}
                <div>
                  <Label htmlFor="prod-images">
                    Image URLs{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (comma-separated)
                    </span>
                  </Label>
                  <Textarea
                    id="prod-images"
                    value={formData.images}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        images: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                    rows={2}
                  />
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="prod-status">Active</Label>
                  <Switch
                    id="prod-status"
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: checked ? "active" : "inactive",
                      }))
                    }
                  />
                </div>

                {/* Flags */}
                <div className="grid grid-cols-3 gap-4 pt-1">
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <Label htmlFor="prod-featured" className="cursor-pointer">
                      Featured
                    </Label>
                    <Switch
                      id="prod-featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_featured: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <Label htmlFor="prod-new" className="cursor-pointer">
                      New Arrival
                    </Label>
                    <Switch
                      id="prod-new"
                      checked={formData.is_new_arrival}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_new_arrival: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <Label htmlFor="prod-sale" className="cursor-pointer">
                      On Sale
                    </Label>
                    <Switch
                      id="prod-sale"
                      checked={formData.is_sale}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_sale: checked }))
                      }
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? editingProduct
                      ? "Updating..."
                      : "Creating..."
                    : editingProduct
                      ? "Update Product"
                      : "Create Product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.product_id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={
                              product.images?.[0] ||
                              "https://images.unsplash.com/photo-1628072380604-22bcabb71740"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {product.sku}
                    </td>
                    <td className="font-medium">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={
                          product.stock <= 5 ? "text-amber-600 font-medium" : ""
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <Badge
                        variant={
                          product.status === "active" ? "default" : "secondary"
                        }
                      >
                        {product.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.product_id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
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

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Product Details</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="grid gap-4">
                <div className="flex gap-4">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={
                        selectedProduct.images?.[0] ||
                        "https://images.unsplash.com/photo-1628072380604-22bcabb71740"
                      }
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {selectedProduct.sku}
                    </p>
                    <p className="text-xl font-semibold mt-2">
                      ₹{selectedProduct.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedProduct.description ||
                    selectedProduct.short_description}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Stock:</span>{" "}
                    {selectedProduct.stock}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    {selectedProduct.status}
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

export default AdminProducts;