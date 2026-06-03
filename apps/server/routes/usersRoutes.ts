import express from 'express';
import { ROLE } from '@sandwicheck/shared';
import { deleteUser, getUser, getUsers, updateUser } from '#controllers/usersController.ts';
import { addSandwichToWeekMenu, removeSandwichFromWeekMenu } from '#controllers/userWeekMenuController.ts';
import { authorize, protect } from '#middleware/authMiddleware.ts';
import resizeImage from '#middleware/resizeMiddleware.ts';
import upload from '#middleware/uploadMiddleware.ts';

// Include other resource routers
const router = express.Router({ mergeParams: true });

// Upload image
export const uploadImage = upload.single('profilePicture');

router.route('/').get(protect, authorize(ROLE.admin), getUsers);

router.route('/current').get(protect, getUser);

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
