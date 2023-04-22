const validateForm = ({
    email = undefined,
    name = undefined,
    firstName = undefined,
    lastName = undefined,
    password = undefined,
    confirmPassword = undefined,
    role = undefined,
    sandwichName = undefined,
    sandwichComment = undefined,
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

    firstName &&
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

    sandwichComment != null &&
        sandwichComment.length > 100 &&
        errorMessages.push("Comment is too long");

    return errorMessages;
};

export default validateForm;
