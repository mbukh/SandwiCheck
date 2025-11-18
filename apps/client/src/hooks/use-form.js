import { useState } from 'react';
import { useNavigate, useMatchRoute } from '@tanstack/react-router';

import { useAuthGlobalContext } from '../context/AuthGlobalContext';
import { ROUTE_PATHS } from '../routes';

import { readSandwichFromCache } from '../services/api-sandwiches';

import validateForm from '../utils/validate-utils';
import useToast from './use-toast';

const useForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  // const [files, setFiles] = useState({});

  const [errors, setErrors] = useState([]);
  const { showToast } = useToast();

  const { logIn, signUp, currentUser: user } = useAuthGlobalContext();

  const matchLoginParent = useMatchRoute({ to: ROUTE_PATHS.LOGIN_PARENT });
  const matchSignupParent = useMatchRoute({ to: ROUTE_PATHS.SIGNUP_PARENT });
  const loginParentParams = matchLoginParent?.({ strict: false });
  const signupParentParams = matchSignupParent?.({ strict: false });
  const parentId = loginParentParams?.parentId || signupParentParams?.parentId;
  const navigate = useNavigate();

  const redirectUser = () => {
    const unExpiredSavedSandwich = readSandwichFromCache();
    if (unExpiredSavedSandwich) {
      navigate({ to: ROUTE_PATHS.CREATE });
    } else {
      navigate({ to: ROUTE_PATHS.MENU });
    }
  };

  const LoginHandler = async (e) => {
    e.preventDefault();
    setErrors([]);

    const errorMessages = validateForm({ email, password });
    if (errorMessages.length) {
      return setErrors(errorMessages);
    }

    const res = await logIn({ email, password, parentId });
    if (res.error) {
      // Check for email confirmation error
      if (res.error.message && res.error.message.includes('confirm your email')) {
        return setErrors([res.error.message]);
      }
      return setErrors(['Login failed, try signup instead']);
    }

    redirectUser();
  };

  const signUpHandler = async (e) => {
    e.preventDefault();
    setErrors([]);

    const errorMessages = validateForm({ name, email, password, confirmPassword });
    if (errorMessages.length) {
      return setErrors(errorMessages);
    }

    const res = await signUp({ name, email, password, role, parentId });
    if (res.error) {
      return setErrors([res.error.message]);
    }

    // Check if email confirmation is required
    // Handle both successful email send and failed email send cases
    if (res.message && (res.message.includes('check your email') || res.message.includes('confirmation email could not be sent'))) {
      // Don't redirect - return success state to show confirmation message
      setErrors([]); // Clear errors
      return { success: true, needsEmailConfirmation: true, email, message: res.message };
    }

    redirectUser();
    return { success: true, needsEmailConfirmation: false };
  };

  const handleFileChange = (event) => {
    // setFiles((prev) => {
    //     return { ...prev, [event.target.name]: event.target.files[0] };
    // });
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    setErrors,
    logIn,
    signUp,
    user,
    LoginHandler,
    signUpHandler,
    navigate,
    parentId,
    role,
    setRole,
    handleFileChange,
  };
};

export default useForm;
