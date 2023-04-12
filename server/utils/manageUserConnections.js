import { roles as userRoles } from "../constants/usersConstants.js";

import User from "../models/userModel.js";

export const removeUserConnections = async (user, field, connectionId) => {
    const oppositeField = field === "parents" ? "children" : "parents";
    const connectionRole = field === "parents" ? userRoles.parent : userRoles.parent;
    const selfRole = field === "parents" ? userRoles.parent : userRoles.parent;
    // List of ids from a field or a specific id
    const ids = connectionId ? [connectionId] : user[field];

    // Check if a connection is related to the user
    if (connectionId && !user[field].includes(connectionId)) {
        return {
            error: `The ${connectionRole} that you are attempting to remove may not be related to the user`,
        };
    }

    // Remove connections from the specified field
    const result = await User.updateMany(
        { _id: { $in: ids } },
        {
            $pull: { [oppositeField]: user._id },
        }
    );

    // If any connections were modified, update their roles
    if (result.modifiedCount > 0) {
        const result = await User.updateMany(
            {
                _id: { $in: ids },
                [oppositeField]: { $size: 0 },
            },
            { $pull: { roles: connectionRole } }
        );
    }

    // If a connectionId is provided, update the user object
    if (connectionId) {
        // Remove connection
        user[field] = user[field].filter((value) => value != connectionId);

        // Update role
        if (user[field].length === 0) {
            user.roles = user.roles.filter((role) => role != selfRole);
        }

        await user.save();
    }
};

export const createUserParentsConnections = async (user, parentId) => {
    // Escape adding user a their own parents.
    if (user._id.toString() === parentId) {
        return;
    }

    // Ignore if parentId doesn't exist in database
    const parent = await User.findById(parentId);
    if (!parent) {
        return;
    }

    // Add parent to a user
    if (!user.parents.includes(parentId)) {
        user.parents.push(parentId);
    }
    if (!user.roles.includes(userRoles.parent)) {
        user.roles.push(userRoles.parent);
    }
    await user.save();

    // Update the parent
    if (!parent.children.includes(user._id)) {
        parent.children.push(user._id);
    }

    if (!parent.roles.includes(userRoles.parent)) {
        parent.roles.push(userRoles.parent);
    }
    await parent.save();
};
