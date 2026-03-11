import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { useCart, useAuth, apiClient } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Check,
  CreditCard,
  Smartphone,
  Building2,
  Truck,
  Currency,
} from "lucide-react";

// ─── Razorpay loader ──────────────────────────────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Form state
  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.name || "",
    phone: user?.phone || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await apiClient.get("/users/addresses");
        setSavedAddresses(response.data.addresses || []);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    if (user) fetchAddresses();
    // Pre-load Razorpay script in background
    loadRazorpayScript();
  }, [user]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    setSelectedAddressId(null);
  };

  const selectSavedAddress = (address) => {
    setSelectedAddressId(address.address_id);
    setShippingAddress({
      full_name: address.full_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
    });
  };

  const validateShipping = () => {
    const required = [
      "full_name",
      "phone",
      "line1",
      "city",
      "state",
      "pincode",
    ];
    for (const field of required) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`Please fill in ${field.replace("_", " ")}`);
        return false;
      }
    }
    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const response = await apiClient.post("/coupons/validate", {
        code: couponCode,
        cart_total: cart.subtotal,
      });
      setDiscount(response.data.discount);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid coupon code");
      setDiscount(0);
    }
  };

  const shippingCost = cart.subtotal >= 999 ? 0 : 99;
  const tax = Math.round(cart.subtotal * 0.18);
  const total = cart.subtotal + shippingCost + tax - discount;

  // ── Razorpay Payment ─────────────────────────────────────────────────────────
  const openRazorpay = useCallback(
    async (order_id, orderAmount) => {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        return false;
      }

      // Create Payment order on backend
      let rzyOrder;
      try {
        const res = await apiClient.post("/payment/create-order", {
          amount: Math.round(orderAmount * 100), // Convert to paise
          order_id: order_id,
        });
        rzyOrder = res.data;
        console.log(rzyOrder);
        
      } catch (error) {
        toast.error("Could not initiate payment. Please try again.");
        return false;
      }
      console.log(process.env.REACT_APP_RAZORPAY_KEY_ID);
    
      return new Promise((resolve) => {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || "",
          amount: rzyOrder.amount,
          currency: rzyOrder.currency || "INR",
          name: "AayvaRath",
          description: "Home Decor Purchase",
          image: "",
          order_id: rzyOrder.id,
          prefill: {
            name: user?.name || shippingAddress.full_name,
            email: user?.email || "",
            contact: shippingAddress.phone || "",
          },
          theme: { color: "#7A5A3A" },
          modal: {
            ondismiss: () => {
              toast.error("Payment cancelled");
              resolve(false);
            },
          },
          handler: async (response) => {
            try {
              await apiClient.post("/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: order_id,
              });
              resolve(true);
              toast.success("Payment Successful");
            } catch (error) {
              toast.error(
                "Payment verification failed. Please contact support.",
              );
              resolve(false);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          toast.error(
            response.error?.description || "Payment failed. Please try again.",
          );
          resolve(false);
        });
        rzp.open();
      });
    },
    [user, shippingAddress],
  );

  // ── Place Order ──────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      // Save address if requested
      if (saveAddress && !selectedAddressId) {
        await apiClient.post("/users/addresses", {
          ...shippingAddress,
          label: "Home",
        });
      }

      // Create order
      const orderResponse = await apiClient.post("/orders", {
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        coupon_code: couponCode || null,
      });

      const { order_id, order_number, total: orderTotal } = orderResponse.data;

      // Handle payment
      if (paymentMethod === "cod") {
        // Cash on Delivery - order placed directly
        clearCart();
        navigate(`/order-confirmation/${order_id}`);
        return;
      }

      // Online payment - open Razorpay
      const paid = await openRazorpay(order_id, orderTotal);
      if (paid) {
        clearCart();
        navigate(`/order-confirmation/${order_id}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <Layout showFooter={false}>
      <div className="container-custom py-8" data-testid="checkout-page">
        {/* Steps Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`checkout-step ${step > s ? "completed" : step === s ? "active" : "pending"}`}
                >
                  <div className="checkout-step-number">
                    {step > s ? <Check size={16} /> : s}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">
                    {s === 1 ? "Shipping" : s === 2 ? "Payment" : "Review"}
                  </span>
                </div>
                {s < 3 && <div className="w-12 h-0.5 bg-muted" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div
                className="bg-card rounded-xl border border-border p-6"
                data-testid="shipping-step"
              >
                <h2 className="font-semibold text-lg mb-6">
                  Shipping Information
                </h2>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-3">Saved Addresses</p>
                    <div className="grid gap-3">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.address_id}
                          onClick={() => selectSavedAddress(addr)}
                          className={`text-left p-4 rounded-lg border transition-colors ${
                            selectedAddressId === addr.address_id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <p className="font-medium">{addr.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {addr.line1}, {addr.city}, {addr.state} -{" "}
                            {addr.pincode}
                          </p>
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Or enter a new address below
                    </p>
                  </div>
                )}

                {/* Address Form */}
                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={shippingAddress.full_name}
                        onChange={handleAddressChange}
                        placeholder="John Doe"
                        data-testid="shipping-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        placeholder="9876543210"
                        data-testid="shipping-phone"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="line1">Address Line 1 *</Label>
                    <Input
                      id="line1"
                      name="line1"
                      value={shippingAddress.line1}
                      onChange={handleAddressChange}
                      placeholder="House No, Street Name"
                      data-testid="shipping-line1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="line2">Address Line 2</Label>
                    <Input
                      id="line2"
                      name="line2"
                      value={shippingAddress.line2}
                      onChange={handleAddressChange}
                      placeholder="Landmark (Optional)"
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                        data-testid="shipping-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        placeholder="State"
                        data-testid="shipping-state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={shippingAddress.pincode}
                        onChange={handleAddressChange}
                        placeholder="123456"
                        data-testid="shipping-pincode"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <Checkbox
                      checked={saveAddress}
                      onCheckedChange={setSaveAddress}
                    />
                    <span className="text-sm">
                      Save this address for future orders
                    </span>
                  </label>
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={() => {
                    if (validateShipping()) setStep(2);
                  }}
                  data-testid="continue-to-payment"
                >
                  Continue to Payment
                </Button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div
                className="bg-card rounded-xl border border-border p-6"
                data-testid="payment-step"
              >
                <h2 className="font-semibold text-lg mb-6">Payment Method</h2>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="space-y-3">
                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === "upi"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="upi" id="upi" />
                      <Smartphone className="text-muted-foreground" size={20} />
                      <div>
                        <p className="font-medium">UPI</p>
                        <p className="text-sm text-muted-foreground">
                          Pay using Google Pay, PhonePe, Paytm
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="text-muted-foreground" size={20} />
                      <div>
                        <p className="font-medium">Credit / Debit Card</p>
                        <p className="text-sm text-muted-foreground">
                          Visa, Mastercard, Rupay
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === "netbanking"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Building2 className="text-muted-foreground" size={20} />
                      <div>
                        <p className="font-medium">Net Banking</p>
                        <p className="text-sm text-muted-foreground">
                          All major banks supported
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <Truck className="text-muted-foreground" size={20} />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Pay when you receive
                        </p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep(3)}
                    data-testid="continue-to-review"
                  >
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div
                className="bg-card rounded-xl border border-border p-6"
                data-testid="review-step"
              >
                <h2 className="font-semibold text-lg mb-6">
                  Review Your Order
                </h2>

                {/* Shipping Address */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="font-medium">{shippingAddress.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {shippingAddress.line1}
                      {shippingAddress.line2 && `, ${shippingAddress.line2}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {shippingAddress.city}, {shippingAddress.state} -{" "}
                      {shippingAddress.pincode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Phone: {shippingAddress.phone}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Order Items</h3>
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
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
                        <p className="font-medium">
                          ₹{item.total.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Payment Method</h3>
                  <p className="text-muted-foreground">
                    {paymentMethod === "upi" && "UPI Payment"}
                    {paymentMethod === "card" && "Credit/Debit Card"}
                    {paymentMethod === "netbanking" && "Net Banking"}
                    {paymentMethod === "cod" && "Cash on Delivery"}
                  </p>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2 cursor-pointer mb-6">
                  <Checkbox
                    checked={agreedToTerms}
                    onCheckedChange={setAgreedToTerms}
                    className="mt-0.5"
                    data-testid="terms-checkbox"
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the Terms & Conditions and Privacy Policy
                  </span>
                </label>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handlePlaceOrder}
                    disabled={loading || !agreedToTerms}
                    data-testid="place-order-btn"
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>

              <div className="space-y-2 text-sm mb-4">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18% GST)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Coupon */}
              {step < 3 && (
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      placeholder="Coupon code"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
