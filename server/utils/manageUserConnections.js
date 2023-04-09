export const removeUserConnections = async ({ Model, user, field, connectionId }) => {
    const oppositeField = field === "parents" ? "children" : "parents";
    const connectionRole = field === "parents" ? "parent" : "child";
    const selfRole = field === "parents" ? "child" : "parent";
    // List of ids from a field or a specific id
    const ids = connectionId ? [connectionId] : user[field];

    // Remove connections from the specified field
    const result = await Model.updateMany(
        { _id: { $in: ids } },
        {
            $pull: { [oppositeField]: user._id },
        }
    );

    // If any connections were modified, update their roles
    if (result.modifiedCount > 0) {
        const result = await Model.updateMany(
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

export const createUserConnections = async ({ Model, user, parentId }) => {
    // Add parent to a user
    const currentUser = await Model.findById(user._id);

    if (!currentUser.parents.includes(parentId)) {
        currentUser.parents.push(parentId);
    }

    if (!currentUser.roles.includes("child")) {
        currentUser.roles.push("child");
    }

    await currentUser.save();

    // Update the parent
    const parent = await Model.findById(parentId);

    if (!parent.children.includes(user._id)) {
        parent.children.push(user._id);
    }

    if (!parent.roles.includes("parent")) {
        parent.roles.push("parent");
    }

    await parent.save();
};
