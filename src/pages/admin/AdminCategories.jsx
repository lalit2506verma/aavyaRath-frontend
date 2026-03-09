import React, { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
  });

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/admin/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await apiClient.put(
          `/admin/categories/${editingCategory.category_id}`,
          formData,
        );
        toast.success("Category updated");
      } else {
        await apiClient.post("/admin/categories", formData);
        toast.success("Category created");
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", slug: "", description: "", status: "active" });
      fetchCategories();
    } catch (error) {
      toast.error(
        editingCategory
          ? "Failed to update category"
          : "Failed to create category",
      );
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      status: category.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      await apiClient.delete(`/admin/categories/${categoryId}`);
      setCategories((prev) => prev.filter((c) => c.category_id !== categoryId));
      toast.success("Category deleted");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete category");
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <AdminLayout>
      <div className="p-6" data-testid="admin-categories">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Categories</h1>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingCategory(null);
                setFormData({
                  name: "",
                  slug: "",
                  description: "",
                  status: "active",
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add Category"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      }));
                    }}
                    placeholder="e.g. Resin Art"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="e.g. resin-art"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Short description"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="status">Active</Label>
                  <Switch
                    id="status"
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: checked ? "active" : "inactive",
                      }))
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.category_id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                          {category.image && (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {category.slug}
                    </td>
                    <td>{category.product_count || 0}</td>
                    <td>
                      <Badge
                        variant={
                          category.status === "active" ? "default" : "secondary"
                        }
                      >
                        {category.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.category_id)}
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
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
