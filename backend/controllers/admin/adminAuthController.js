export const loginAdmin = (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@example.com" && password === "admin1234") {
    return res.status(200).json({
      success: true,
      token: "fake-admin-token-123456",
      admin: { email, name: "Admin User" }
    });
  }

  return res.status(401).json({ success: false, message: "Invalid admin credentials" });
};
