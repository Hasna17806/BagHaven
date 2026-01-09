import axios from "axios";

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL;
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;

console.log("PAYPAL_BASE_URL:", process.env.PAYPAL_BASE_URL);


// Get PayPal access token
const getAccessToken = async () => {
  const response = await axios({
    url: `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    method: "post",
    auth: {
      username: CLIENT_ID,
      password: SECRET,
    },
    params: {
      grant_type: "client_credentials",
    },
  });
  return response.data.access_token;
};

// Create Order
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Capture Order
export const captureOrder = async (req, res) => {
  try {
    const { orderID } = req.body;
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
