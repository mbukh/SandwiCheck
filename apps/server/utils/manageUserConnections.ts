import type mongoose from 'mongoose';
import { ROLE } from '../constants/usersConstants.ts';
import type { UserDocument } from '../models/UserModel.ts';
import User from '../models/UserModel.ts';

type ConnectionId = mongoose.Types.ObjectId | string;

export const removeUserConnections = async (
  user: UserDocument,
  field: 'parents' | 'children',
  connectionId?: ConnectionId,
): Promise<{ error: string } | undefined> => {
  const oppositeField = field === 'parents' ? 'children' : 'parents';
  const connectionRole = field === 'parents' ? ROLE.parent : ROLE.parent;
  const selfRole = field === 'parents' ? ROLE.parent : ROLE.parent;
  // List of ids from a field or a specific id
  const ids = connectionId ? [connectionId] : user[field];

  // Prevent unlinking a parent from a tethered child (no email)
  if (field === 'parents' && user.isTetheredChild) {
    return {
      error: `This account is connected to the ${connectionRole} you're attempting to unlink. To detach the account, please add an email address`,
    };
  }

  // Stop unlinking a tethered child (no email)
  if (field === 'children' && connectionId) {
    const child = await User.findById(connectionId);
    if (child?.isTetheredChild) {
      return {
        error: `The ${connectionRole} you are trying to unlink is tethered to your account. To remove it, log in as the child and delete the account`,
      };
    }
  }

  // Check if a connection is related to the user
  if (connectionId && !user[field].includes(connectionId as mongoose.Types.ObjectId)) {
    return {
      error: `The ${connectionRole} that you are attempting to unlink may not be related to the user`,
    };
  }

  // Remove connections from the specified field
  const result = await User.updateMany(
    { _id: { $in: ids } },
    {
      $pull: { [oppositeField]: user._id },
    },
  );

  // If any connections were modified, update their roles
  if (result.modifiedCount > 0) {
    await User.updateMany(
      {
        _id: { $in: ids },
        [oppositeField]: { $size: 0 },
      },
      { $pull: { roles: connectionRole } },
    );
  }

  // If a connectionId is provided, update the user object
  if (connectionId) {
    // Remove connection
    (user[field] as mongoose.Types.Array<mongoose.Types.ObjectId>).pull(connectionId);

    // Update role
    if (user[field].length === 0) {
      (user.roles as mongoose.Types.Array<string>).pull(selfRole);
    }

    await user.save();
  }

  return;
};

export const createUserParentsConnections = async (user: UserDocument, parentId: ConnectionId): Promise<void> => {
  // Escape adding user a their own parents.
  if (user._id.equals(parentId)) {
    return;
  }

  // Ignore if parentId doesn't exist in database
  const parent = await User.findById(parentId);
  if (!parent) {
    return;
  }

  // Add parent to a user
  if (!user.parents.includes(parentId as mongoose.Types.ObjectId)) {
    user.parents.push(parentId as mongoose.Types.ObjectId);
  }
  if (!user.roles.includes(ROLE.child)) {
    user.roles.push(ROLE.child);
  }
  await user.save();

  // Update the parent
  if (!parent.children.includes(user._id)) {
    parent.children.push(user._id);
  }

  if (!parent.roles.includes(ROLE.parent)) {
    parent.roles.push(ROLE.parent);
  }
  await parent.save();
};
