import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
router.post('/', userController.register);
router.post('/login', userController.login);
router.put('/profile', authenticateToken, userController.updateProfile);
router.get('/auth-status', authenticateToken, userController.getAuthStatus);
export default router;
