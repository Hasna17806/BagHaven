import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CheckCircle, AlertCircle, CreditCard, Loader2, Shield, Lock, Globe } from "lucide-react";

const PayPalButton = ({ amount, onSuccess, disabled = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); 
  
  // Safe amount with fallback
  const safeAmount = amount || 1.00; 

  const formatAmount = (amt) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amt);
  };

  const createOrder = (data, actions) => {
    try {
     
      const paymentAmount = parseFloat(safeAmount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        toast.error("Invalid payment amount");
        throw new Error("Invalid amount");
      }

      console.log("Creating PayPal order with amount:", paymentAmount.toFixed(2));
      
      return actions.order.create({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: paymentAmount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: paymentAmount.toFixed(2)
                }
              }
            },
            description: "E-commerce Purchase",
          },
        ],
        application_context: {
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
        },
      });
    } catch (error) {
      console.error("PayPal createOrder error:", error);
      toast.error("Failed to create payment order");
      throw error;
    }
  };

 const onApprove = async (data, actions) => {
  try {
    setIsProcessing(true);
    setPaymentStatus("processing");

    toast.loading("Processing PayPal payment...", {
      id: "paypal-payment",
      duration: 10000,
    });

    console.log("Capturing PayPal order:", data.orderID);

    const details = await actions.order.capture();
    
    console.log("PayPal payment captured:", details);
    
    toast.success(`Payment successful! \nPaid by: ${details.payer.name.given_name}`, {
      id: "paypal-payment",
      icon: "",
      duration: 3000,
    });

    setPaymentStatus("success");
    
    if (onSuccess) {
      onSuccess(data.orderID, details); 
    }

    setTimeout(() => {
      setPaymentStatus(null);
      setIsProcessing(false);
    }, 2000);

  } catch (error) {
    console.error("PayPal capture error:", error);
    
    let errorMessage = "Payment failed. Please try again.";
    
    if (error.message?.includes("insufficient funds")) {
      errorMessage = "Insufficient funds in your PayPal account";
    } else if (error.message?.includes("declined")) {
      errorMessage = "Payment was declined by your bank";
    }
    
    toast.error(errorMessage, {
      id: "paypal-payment",
      icon: "❌",
      duration: 5000,
    });
    
    setPaymentStatus("error");
    setIsProcessing(false);
    
    setTimeout(() => {
      setPaymentStatus(null);
    }, 3000);
  }
};

  const onError = (err) => {
    console.error("PayPal Error:", err);
    
    let errorMessage = "Payment failed. Please try again.";
    
    if (err.message?.includes("popup closed")) {
      errorMessage = "Payment cancelled";
    } else if (err.message?.includes("network")) {
      errorMessage = "Network error. Check your connection.";
    } else if (err.message?.includes("INVALID_REQUEST")) {
      errorMessage = "Invalid payment request";
    }
    
    toast.error(errorMessage, {
      icon: "⚠️",
      duration: 5000,
    });
    
    setPaymentStatus("error");
    
    setTimeout(() => {
      setPaymentStatus(null);
    }, 3000);
  };

  // Log amount changes for debugging
  useEffect(() => {
    console.log("PayPalButton amount:", amount, "Safe amount:", safeAmount);
    if (!amount || amount <= 0) {
      console.warn("PayPal amount is invalid, using default:", safeAmount);
    }
  }, [amount, safeAmount]);

  return (
    <div className="w-full">
      {/* Payment Status Indicator */}
      {paymentStatus === "processing" && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <CreditCard className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900">Processing Payment</p>
              <p className="text-sm text-blue-700">
                {formatAmount(safeAmount)} via PayPal
              </p>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === "success" && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl border-2 border-green-300 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600 animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-green-900">Payment Successful! 🎉</p>
              <p className="text-sm text-green-700">
                Your order is being processed
              </p>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === "error" && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border-2 border-red-300 animate-shake">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-900">Payment Failed</p>
              <p className="text-sm text-red-700">
                Please try again or use another payment method
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Container */}
      <div className={`relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {disabled && (
          <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
            <div className="text-center p-4">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-semibold">Complete your address first</p>
              <p className="text-sm text-gray-500 mt-1">Fill in all required fields above</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Pay with PayPal</h3>
                <p className="text-sm text-gray-600">Fast & secure payment</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Total to pay</p>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {formatAmount(safeAmount)}
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <Shield className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-gray-700">Secure</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <Lock className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">Encrypted</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <Globe className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-gray-700">Global</span>
            </div>
          </div>

          {/* PayPal Button */}
          <div className="rounded-xl overflow-hidden border border-gray-300">
            <PayPalButtons
              style={{
                layout: "vertical",
                color: "gold",
                shape: "pill",
                label: "paypal",
                height: 48,
                tagline: false,
              }}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
              disabled={disabled || isProcessing}
            />
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-amber-100 rounded">
                <span className="text-sm">💡</span>
              </div>
              <p className="text-xs text-amber-900">
                <span className="font-bold">Note:</span> You'll be redirected to PayPal to complete payment
              </p>
            </div>
          </div>

          {/* Accepted Cards */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 text-center mb-2">Accepts all major cards</p>
            <div className="flex justify-center gap-3">
              <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">VISA</span>
              </div>
              <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">MC</span>
              </div>
              <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">AMEX</span>
              </div>
              <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">DISC</span>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
              <div className="text-center p-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20 blur-xl"></div>
                  <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                  <CreditCard className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
                </div>
                <p className="font-semibold text-gray-900 text-lg">Completing Payment</p>
                <p className="text-sm text-gray-600 mt-1">Please wait while we process your payment...</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PayPalButton;