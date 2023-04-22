import { MAX_USER_NAME_LENGTH } from "../constants/user-constants";
import { MAX_NAME_LENGTH, MAX_COMMENT_LENGTH } from "../constants/sandwich-constants";

const validateForm = ({
    email = null,
    name = null,
    firstName = null,
    lastName = null,
    password = null,
    confirmPassword = null,
    role = null,
    sandwichName = null,
    sandwichComment = null,
}) => {
    const errorMessages = [];

    email != null &&
        email.length < 5 &&
        !email.includes("@") &&
        !email.includes(".") &&
        errorMessages.push("Email is invalid");

    name != null &&
        name.length < 3 &&
        errorMessages.push("Please provide a valid full name");
    name != null &&
        name.length > MAX_USER_NAME_LENGTH &&
        errorMessages.push("Full name is too long");

    lastName != null &&
        firstName.length < 3 &&
        errorMessages.push("Please provide a valid first name");

    lastName != null &&
        lastName.length < 3 &&
        errorMessages.push("Please provide a valid last name");

    password != null &&
        password.length < 5 &&
        errorMessages.push("The password is too brief");

    confirmPassword != null &&
        confirmPassword !== password &&
        errorMessages.push("The passwords do not match");

    role != null &&
        role !== "parent" &&
        role !== "child" &&
        errorMessages.push("Please select a valid role: either parent or child");

    sandwichName != null &&
        sandwichName.length > 0 &&
        sandwichName.length < 3 &&
        errorMessages.push("Sandwich name is too brief");
    sandwichName != null &&
        sandwichName.length > MAX_NAME_LENGTH &&
        errorMessages.push("Sandwich name is too long");

    sandwichComment != null &&
        sandwichComment.length > MAX_COMMENT_LENGTH &&
        errorMessages.push("Comment is too long");

    return errorMessages;
};

export default validateForm;
