import express from 'express';
import { ROLE } from '../constants/usersConstants.js';
import { deleteUser, getUser, getUsers, updateFavoriteSandwiches, updateUser } from '../controllers/usersController.js';
import { addSandwichToWeekMenu, removeSandwichFromWeekMenu } from '../controllers/userWeekMenuController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import resizeImage from '../middleware/resizeMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// Include other resource routers
const router = express.Router({ mergeParams: true });

// Upload image
export const uploadImage = upload.single('profilePicture');

router.route('/').get(protect, authorize(ROLE.admin), getUsers);

router.route('/current').get(protect, getUser);

router
  .route('/:userId/favorite-sandwiches/:sandwichId')
  .post(protect, authorize(ROLE.user), updateFavoriteSandwiches)
  .delete(protect, authorize(ROLE.user), updateFavoriteSandwiches);

router
  .route('/:userId/week-menu/:day')
  .put(protect, authorize(ROLE.user, ROLE.parent), addSandwichToWeekMenu)
  .delete(protect, authorize(ROLE.user, ROLE.parent), removeSandwichFromWeekMenu);

router
  .route('/:userId')
  .get(protect, authorize(ROLE.user, ROLE.parent), getUser)
  .put(protect, authorize(ROLE.user, ROLE.parent), uploadImage, resizeImage, updateUser)
  .delete(protect, authorize(ROLE.user), deleteUser);

export default router;
