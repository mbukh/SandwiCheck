import type { ParamsDictionary } from 'express-serve-static-core';
import createHttpError from 'http-errors';
import type mongoose from 'mongoose';
import { type DayOfWeek, DAYS_OF_WEEK } from '../constants/daysOfWeek.ts';
import type { IDayMenuItem } from '../models/UserModel.ts';
import User from '../models/UserModel.ts';
import type { ApiResponse } from '../types/api.ts';
import type { WeekMenuItemDto } from '../types/dto.ts';
import asyncHandler from '../utils/asyncHandler.ts';

const DAYS_OF_WEEK_SET = new Set<string>(DAYS_OF_WEEK);

const isDayOfWeek = (value: string | undefined): value is DayOfWeek =>
  value !== undefined && DAYS_OF_WEEK_SET.has(value);

/*
 * @desc    Add a sandwich to the week menu
 * @route   PUT /api/users/:userId/week-menu/:day
 * @access  Private
 */
export const addSandwichToWeekMenu = asyncHandler<ParamsDictionary, ApiResponse<IDayMenuItem[]>, WeekMenuItemDto>(
  async (req, res, next) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const day = Array.isArray(req.params.day) ? req.params.day[0] : req.params.day;
    const { sandwichId } = req.body;

    if (!isDayOfWeek(day)) {
      return next(createHttpError.BadRequest('A valid day of the week is required'));
    }

    if (!sandwichId) {
      return next(createHttpError.BadRequest('Sandwich ID is required'));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(createHttpError.NotFound('User not found'));
    }

    user.weekMenu ??= {};
    const dayMenu = (user.weekMenu[day] ??= []);

    const existingEntry = dayMenu.find((sandwichEntry) => sandwichEntry.sandwichId.equals(sandwichId));

    if (existingEntry) {
      existingEntry.quantity += 1;
    } else {
      dayMenu.push({ sandwichId: sandwichId as unknown as mongoose.Types.ObjectId, quantity: 1 });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Sandwich added to the week menu',
      data: dayMenu,
    });
  },
);

/*
 * @desc    Remove a sandwich from the week menu
 * @route   DELETE /api/users/:userId/week-menu/:day
 * @access  Private
 */
export const removeSandwichFromWeekMenu = asyncHandler<ParamsDictionary, ApiResponse<IDayMenuItem[]>, WeekMenuItemDto>(
  async (req, res, next) => {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const day = Array.isArray(req.params.day) ? req.params.day[0] : req.params.day;
    const { sandwichId } = req.body;

    if (!isDayOfWeek(day)) {
      return next(createHttpError.BadRequest('A valid day of the week is required'));
    }

    if (!sandwichId) {
      return next(createHttpError.BadRequest('Sandwich ID is required'));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(createHttpError.NotFound('User not found'));
    }

    const dayMenu = user.weekMenu?.[day];

    if (!dayMenu) {
      return next(createHttpError.NotFound('No sandwich found in the week menu for this day'));
    }

    const existingEntry = dayMenu.find((sandwichEntry) => sandwichEntry.sandwichId.equals(sandwichId));

    if (!existingEntry) {
      return next(createHttpError.BadRequest('Sandwich not found in the week menu for this day'));
    }

    if (existingEntry.quantity > 1) {
      existingEntry.quantity -= 1;
    } else {
      dayMenu.splice(dayMenu.indexOf(existingEntry), 1);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Sandwich removed from the week menu',
      data: dayMenu,
    });
  },
);
