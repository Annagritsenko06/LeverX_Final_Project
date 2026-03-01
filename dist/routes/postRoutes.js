import express from 'express';
import * as postController from '../controllers/postController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
router.post('/', authenticateToken, postController.createPost);
router.get('/:userId', authenticateToken, postController.getUserPosts);
router.put('/:postId', authenticateToken, postController.updatePost);
router.delete('/:postId', authenticateToken, postController.deletePost);
export default router;
