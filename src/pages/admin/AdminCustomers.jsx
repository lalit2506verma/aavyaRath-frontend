import React, { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(
          `/admin/customers?page=${page}&limit=20`,
        );
        setCustomers(response.data.customers);
        setTotalPages(response.data.pages);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [page]);

  const filteredCustomers = search
    ? customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : customers;

  return (
    <AdminLayout>
      <div className="p-6" data-testid="admin-customers">
        <h1 className="text-2xl font-semibold mb-6">Customers</h1>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customers Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.user_id}>
                    <td className="font-medium">{customer.name}</td>
                    <td className="text-sm text-muted-foreground">
                      {customer.email}
                    </td>
                    <td className="text-sm">{customer.phone || "-"}</td>
                    <td>{customer.total_orders || 0}</td>
                    <td className="font-medium">
                      ₹{(customer.total_spent || 0).toLocaleString()}
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsDetailOpen(true);
                        }}
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

        {/* Customer Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-primary">
                      {selectedCustomer.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedCustomer.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">
                      {selectedCustomer.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Member Since:</span>
                    <p className="font-medium">
                      {new Date(
                        selectedCustomer.created_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Orders:</span>
                    <p className="font-medium">
                      {selectedCustomer.total_orders || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Spent:</span>
                    <p className="font-medium">
                      ₹{(selectedCustomer.total_spent || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <Mail size={16} />
                  Send Email
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
