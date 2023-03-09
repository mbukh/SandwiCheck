const useValidate = () => {
    const validateForm = ({ email, name, firstName, lastName, password }) => {
        const errorMessages = [];
        email != null &&
            email.length < 5 &&
            !email.includes("@") &&
            errorMessages.push("Email is invalid");
        name != null &&
            name.length < 3 &&
            errorMessages.push("Enter a valid name");
        firstName &&
            firstName.length < 3 &&
            errorMessages.push("Enter a valid First name");
        lastName != null &&
            lastName.length < 3 &&
            errorMessages.push("Enter a valid Last Name");
        password != null &&
            password.length < 5 &&
            errorMessages.push("Password is too short");
        return errorMessages;
    };

    return { validateForm };
};

export default useValidate;
