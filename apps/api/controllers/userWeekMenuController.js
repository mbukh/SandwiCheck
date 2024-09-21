import expressAsyncHandler from 'express-async-handler';
import createHttpError from 'http-errors';
import User from '../models/UserModel.js';

// @desc    Add a sandwich to the week menu
// @route   PUT /api/users/:userId/week-menu/:day
// @access  Private
export const addSandwichToWeekMenu = expressAsyncHandler(async (req, res, next) => {
  const { userId, day } = req.params;
  const { sandwichId } = req.body;

  if (!sandwichId) {
    return next(createHttpError.BadRequest('Sandwich ID is required'));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(createHttpError.NotFound('User not found'));
  }

  if (!user.weekMenu) {
    user.weekMenu = {};
  }

  if (!user.weekMenu[day]) {
    user.weekMenu[day] = [];
  }

  const sandwichIndex = user.weekMenu[day].findIndex((sandwichEntry) => sandwichEntry.sandwichId.equals(sandwichId));

  if (sandwichIndex === -1) {
    user.weekMenu[day].push({ sandwichId, quantity: 1 });
  } else {
    user.weekMenu[day][sandwichIndex].quantity += 1;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Sandwich added to the week menu',
    data: user.weekMenu[day],
  });
});

// @desc    Remove a sandwich from the week menu
// @route   DELETE /api/users/:userId/week-menu/:day
// @access  Private
export const removeSandwichFromWeekMenu = expressAsyncHandler(async (req, res, next) => {
  const { userId, day } = req.params;
  const { sandwichId } = req.body;

  if (!sandwichId) {
    return next(createHttpError.BadRequest('Sandwich ID is required'));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(createHttpError.NotFound('User not found'));
  }

  if (!user.weekMenu || !user.weekMenu[day]) {
    return next(createHttpError.NotFound('No sandwich found in the week menu for this day'));
  }

  const sandwichIndex = user.weekMenu[day].findIndex((sandwichEntry) => sandwichEntry.sandwichId.equals(sandwichId));

  if (sandwichIndex === -1) {
    return next(createHttpError.BadRequest('Sandwich not found in the week menu for this day'));
  }

  if (user.weekMenu[day][sandwichIndex].quantity > 1) {
    user.weekMenu[day][sandwichIndex].quantity -= 1;
  } else {
    user.weekMenu[day].splice(sandwichIndex, 1);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Sandwich removed from the week menu',
    data: user.weekMenu[day],
  });
});
