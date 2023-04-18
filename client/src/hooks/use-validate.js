const useValidate = () => {
    const validateForm = ({
        email,
        name,
        firstName,
        lastName,
        password,
        confirmPassword,
        role,
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
        (!role || (role !== "parent" && role !== "child")) &&
            errorMessages.push("Please select a valid role: either parent or child");

        return errorMessages;
    };

    return { validateForm };
};

export default useValidate;
