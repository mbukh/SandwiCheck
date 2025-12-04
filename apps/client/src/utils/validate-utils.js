import { MAX_COMMENT_LENGTH, MAX_COMMENT_LINES, MAX_NAME_LENGTH } from '../constants/sandwich-constants';
import { MAX_USER_NAME_LENGTH } from '../constants/user-constants';

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

  if (email != null && (email.length < 5 || !email.includes('@') || !email.includes('.'))) {
    errorMessages.push('Email is invalid');
  }

  if (name != null) {
    if (name.length < 3) {
      errorMessages.push('Please provide a valid full name');
    }
    if (name.length > MAX_USER_NAME_LENGTH) {
      errorMessages.push('Full name is too long');
    }
  }

  if (lastName != null && firstName != null) {
    if (firstName.length < 3) {
      errorMessages.push('Please provide a valid first name');
    }
    if (lastName.length < 3) {
      errorMessages.push('Please provide a valid last name');
    }
  }

  if (password != null) {
    if (password.length < 5) {
      errorMessages.push('The password is too brief (minimum 5 characters)');
    }
    if (password.length > 30) {
      errorMessages.push('The password is too long (maximum 30 characters)');
    }
  }

  if (confirmPassword != null && password != null && confirmPassword !== password) {
    errorMessages.push('The passwords do not match');
  }

  if (role != null && role !== 'parent' && role !== 'child') {
    errorMessages.push('Please select a valid role: either parent or child');
  }

  sandwichName != null &&
    sandwichName.length > 0 &&
    sandwichName.length < 3 &&
    errorMessages.push('Sandwich name is too brief');
  sandwichName != null && sandwichName.length > MAX_NAME_LENGTH && errorMessages.push('Sandwich name is too long');

  sandwichComment != null && sandwichComment.length > MAX_COMMENT_LENGTH && errorMessages.push('Comment is too long');

  if (sandwichComment != null && typeof sandwichComment === 'string') {
    const newlineCount = (sandwichComment.match(/\n/g) || []).length;
    if (newlineCount > MAX_COMMENT_LINES - 1) {
      errorMessages.push(
        `Comment cannot contain more than ${MAX_COMMENT_LINES - 1} newlines (${MAX_COMMENT_LINES} lines total)`,
      );
    }
  }

  return errorMessages;
};

export default validateForm;
