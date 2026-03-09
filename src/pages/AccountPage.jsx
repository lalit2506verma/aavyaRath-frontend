import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { useAuth, apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Package, Heart, MapPin, Lock, Trash2, Plus } from "lucide-react";

const AccountPage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [addresses, setAddresses] = useState([]);
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await apiClient.get("/users/addresses");
        setAddresses(response.data.addresses || []);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    fetchAddresses();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.patch("/users/profile", {
        name: profile.name,
        phone: profile.phone,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwords.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await apiClient.patch("/users/change-password", {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      });
      toast.success("Password changed successfully");
      setPasswords({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await apiClient.delete(`/users/addresses/${addressId}`);
      setAddresses((prev) => prev.filter((a) => a.address_id !== addressId));
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  return (
    <Layout>
      <div
        className="container-custom section-padding"
        data-testid="account-page"
      >
        <h1 className="heading-md mb-8">My Account</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-primary" />
                  )}
                </div>
                <h3 className="font-medium">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <nav className="space-y-1">
                <Link
                  to="/account/orders"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Package size={18} />
                  My Orders
                </Link>
                <Link
                  to="/account/wishlist"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Heart size={18} />
                  Wishlist
                </Link>
              </nav>

              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={logout}
              >
                Sign Out
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile">
              <TabsList className="mb-6">
                <TabsTrigger value="profile" className="gap-2">
                  <User size={16} />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="addresses" className="gap-2">
                  <MapPin size={16} />
                  Addresses
                </TabsTrigger>
                <TabsTrigger value="password" className="gap-2">
                  <Lock size={16} />
                  Password
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-semibold text-lg mb-6">
                    Profile Information
                  </h2>
                  <form
                    onSubmit={handleProfileUpdate}
                    className="space-y-4 max-w-md"
                  >
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        data-testid="profile-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="9876543210"
                        data-testid="profile-phone"
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </div>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses">
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-lg">Saved Addresses</h2>
                    <Button size="sm" className="gap-2">
                      <Plus size={16} />
                      Add Address
                    </Button>
                  </div>

                  {addresses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No saved addresses yet
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address.address_id}
                          className="p-4 border border-border rounded-lg relative"
                        >
                          {address.is_default && (
                            <span className="absolute top-2 right-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                          <p className="font-medium">{address.full_name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {address.line1}
                            {address.line2 && `, ${address.line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {address.phone}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteAddress(address.address_id)
                              }
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="font-semibold text-lg mb-6">
                    Change Password
                  </h2>
                  <form
                    onSubmit={handlePasswordChange}
                    className="space-y-4 max-w-md"
                  >
                    <div>
                      <Label htmlFor="old_password">Current Password</Label>
                      <Input
                        id="old_password"
                        type="password"
                        value={passwords.old_password}
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            old_password: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwords.new_password}
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            new_password: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm_password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={passwords.confirm_password}
                        onChange={(e) =>
                          setPasswords((prev) => ({
                            ...prev,
                            confirm_password: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;
