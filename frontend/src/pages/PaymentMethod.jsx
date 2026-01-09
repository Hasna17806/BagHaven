import React from 'react';
import toast from 'react-hot-toast';
import { 
  Shield, 
  CheckCircle, 
  Truck,
  Banknote,
  Lock,
  AlertCircle 
} from 'lucide-react';

const PaymentMethod = ({ selectedMethod, onPaymentSelect }) => {
  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: <Truck className="h-6 w-6 text-green-600" />,
      color: 'from-green-500 to-emerald-600',
      badgeColor: 'bg-green-100 text-green-800',
      isPopular: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Secure international payment',
      icon: <Banknote className="h-6 w-6 text-yellow-600" />,
      color: 'from-yellow-500 to-orange-600',
      badgeColor: 'bg-yellow-100 text-yellow-800',
      isPopular: false,
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-white">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl shadow-lg">
            <Lock className="h-6 w-6 text-indigo-600" />
          </div>
          Payment Method
        </h2>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg">
          <Shield className="h-4 w-4" />
          Secure Payment
        </div>
      </div>

      {/* Payment Methods Grid - Only PayPal & COD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => {
              onPaymentSelect(method.id);
              if (method.id === 'cod') {
                toast.success('Cash on Delivery selected! Pay when you receive your order.', {
                  icon: '💰',
                  duration: 4000,
                });
              } else if (method.id === 'paypal') {
                toast.success('PayPal selected! You will pay securely.', {
                  icon: '💳',
                  duration: 4000,
                });
              }
            }}
            className={`group relative p-5 rounded-2xl border-2 transition-all transform hover:-translate-y-1 ${
              selectedMethod === method.id 
                ? `border-amber-500 bg-gradient-to-br ${method.color}/10 shadow-xl` 
                : 'border-gray-200 hover:border-amber-300 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white group-hover:scale-110 transition-transform shadow-md ${
                selectedMethod === method.id ? 'ring-2 ring-amber-500' : ''
              }`}>
                {method.icon}
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{method.name}</h3>
                  {method.isPopular && (
                    <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              
              {selectedMethod === method.id && (
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            
            {method.id === 'cod' && selectedMethod === 'cod' && (
              <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">
                    ₹50 cash handling fee may apply
                  </p>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Payment Details Forms */}
      {selectedMethod === 'paypal' && (
        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 mb-6 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-yellow-600" />
            PayPal Payment
          </h3>
          
          <div className="mb-4 p-4 bg-white/80 rounded-xl border-2 border-yellow-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  You'll be redirected to PayPal to complete payment
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  International cards accepted • Secure payment • Money-back guarantee
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-yellow-200">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Instant Payment</p>
                <p className="text-xs text-gray-600">No waiting for verification</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-yellow-200">
              <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">100% Secure</p>
                <p className="text-xs text-gray-600">Encrypted payment processing</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMethod === 'cod' && (
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 mb-6 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-green-600" />
            Cash on Delivery
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-white/80 rounded-xl border-2 border-green-300">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Pay when you receive</p>
                <p className="text-sm text-green-700">Pay cash to delivery agent</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white/80 rounded-xl border-2 border-green-300">
              <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">100% Safe & Secure</p>
                <p className="text-sm text-green-700">Verify items before payment</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-amber-50/80 rounded-xl border-2 border-amber-300">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900">₹50 cash handling fee</p>
                <p className="text-sm text-amber-700">Applicable for COD orders</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Info */}
      <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white rounded-xl shadow-md">
            <Shield className="h-6 w-6 text-gray-700" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">Your Payment is Secure</h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              🔒 All payments are encrypted with 256-bit SSL security. We never store your payment details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;