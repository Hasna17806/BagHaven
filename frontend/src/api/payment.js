import API from "./axios";

// Create Razorpay order
export const createRazorpayOrder = () => {
  return API.post("/payment/razorpay");
};

// Verify Razorpay payment
export const verifyPayment = (data) => {
  return API.post("/payment/verify", data);
};
