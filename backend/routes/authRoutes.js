import express from 'express';
import { registerUser, loginUser } from '../controllers/user/authController.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

// USER AUTH
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
