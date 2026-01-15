import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest
} from '../controllers/friendController.js';

const router = Router();

router.get('/search', requireAuth, searchUsers);
router.post('/request', requireAuth, sendFriendRequest);
router.get('/requests', requireAuth, getFriendRequests);
router.post('/respond', requireAuth, respondToFriendRequest);

export default router;
