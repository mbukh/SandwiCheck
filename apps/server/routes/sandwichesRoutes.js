import express from 'express';
import { ROLE } from '../constants/usersConstants.js';
import {
  createSandwich,
  deleteSandwich,
  getSandwich,
  getSandwiches,
  updateSandwich,
  updateSandwichVotesCount,
} from '../controllers/sandwichesController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

// Include other resource routers
const router = express.Router({ mergeParams: true });

router.route('/').get(getSandwiches).post(protect, createSandwich);

router
  .route('/:sandwichId/vote')
  .post(protect, authorize(ROLE.user), updateSandwichVotesCount)
  .delete(protect, authorize(ROLE.user), updateSandwichVotesCount);

router
  .route('/:sandwichId')
  .get(getSandwich)
  .put(protect, authorize(ROLE.user), updateSandwich)
  .delete(protect, authorize(ROLE.user), deleteSandwich);

export default router;
