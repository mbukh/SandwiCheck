import express from 'express';
import { ROLE } from '@sandwicheck/shared';
import {
  createSandwich,
  deleteSandwich,
  getSandwich,
  getSandwiches,
  updateSandwich,
  voteForSandwich,
} from '#controllers/sandwichesController.ts';
import { authorize, protect } from '#middleware/authMiddleware.ts';

// Include other resource routers
const router = express.Router({ mergeParams: true });

router.route('/').get(getSandwiches).post(protect, createSandwich);

/*
 * Voting requires authentication (but not ownership — you vote on others' sandwiches).
 * A vote also adds the sandwich to the voter's favorites and is idempotent per user,
 * so no per-IP rate limit is needed (and one would penalize a NAT household).
 */
router.route('/:sandwichId/vote').post(protect, voteForSandwich);

router
  .route('/:sandwichId')
  .get(getSandwich)
  .put(protect, authorize(ROLE.user), updateSandwich)
  .delete(protect, authorize(ROLE.user), deleteSandwich);

export default router;
