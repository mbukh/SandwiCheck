/**
 * Email Confirmation Fields Migration Script
 * 
 * PURPOSE:
 * This script migrates existing user records to include email confirmation fields
 * and ensures all users are set to unconfirmed status. It's designed for one-time
 * use when adding email confirmation functionality to an existing database.
 * 
 * WHAT IT DOES:
 * 1. Sets all users to emailConfirmed: false (ensures no one can login until they confirm)
 * 2. Adds emailConfirmationResendCount: 0 for users missing this field
 * 3. Ensures all users have roles: ['user'] if missing
 * 
 * WHEN TO USE:
 * - After deploying email confirmation feature to production with existing users
 * - When importing user data from another system
 * - When you need to reset all users to unconfirmed status
 * 
 * WHEN NOT TO USE:
 * - If you're starting with a fresh database (new users get defaults automatically)
 * - If all users are already properly configured
 * 
 * USAGE:
 *   node apps/server/service/migrateEmailConfirmationFields.js
 * 
 * SAFETY:
 * - This script is idempotent (safe to run multiple times)
 * - It only adds missing fields, doesn't overwrite existing values (except emailConfirmed)
 * - Always verify the output before considering migration complete
 * 
 * WARNING:
 * - This will set ALL users to unconfirmed, requiring them to confirm their email again
 * - Make sure to notify users before running this in production
 * - Consider running during maintenance window
 */

import path from 'path';
import { CONFIG_DIR } from '../config/dir.js';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(CONFIG_DIR, '.env') });

import logger from '../utils/logger.js';
import connectDB from '../config/db.js';
import User from '../models/UserModel.js';

const migrateEmailConfirmationFields = async () => {
  try {
    await connectDB();

    logger.info('Starting email confirmation fields migration...');
    logger.info('Adding missing default field values to all users...');
    logger.info('Setting all users to unconfirmed (emailConfirmed: false)');

    // First, set emailConfirmed to false for all users (ensuring they stay unconfirmed)
    const emailConfirmedResult = await User.updateMany(
      {},
      {
        $set: {
          emailConfirmed: false,
        },
      },
    );

    // Then, set default values for fields that don't exist
    const resendCountResult = await User.updateMany(
      {
        emailConfirmationResendCount: { $exists: false },
      },
      {
        $set: {
          emailConfirmationResendCount: 0,
        },
      },
    );

    // Ensure roles default is set if missing (though it should always exist)
    const rolesResult = await User.updateMany(
      {
        $or: [{ roles: { $exists: false } }, { roles: { $size: 0 } }],
      },
      {
        $set: {
          roles: ['user'],
        },
      },
    );

    logger.info(
      `Migration completed successfully:\n  - Set emailConfirmed: false for ${emailConfirmedResult.modifiedCount} users\n  - Added emailConfirmationResendCount: 0 for ${resendCountResult.modifiedCount} users\n  - Added roles: ['user'] for ${rolesResult.modifiedCount} users`,
    );

    // Verify the migration
    const totalUsers = await User.countDocuments({});
    const unconfirmedUsers = await User.countDocuments({ emailConfirmed: false });
    const usersWithResendCount = await User.countDocuments({ emailConfirmationResendCount: { $exists: true } });

    logger.info(`Verification:\n  - Total users: ${totalUsers}\n  - Unconfirmed users: ${unconfirmedUsers}\n  - Users with resend count field: ${usersWithResendCount}`);

    if (unconfirmedUsers === totalUsers) {
      logger.info('✓ All users are unconfirmed as required.');
    } else {
      logger.warn('⚠ Warning: Some users may still be confirmed.');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateEmailConfirmationFields();

