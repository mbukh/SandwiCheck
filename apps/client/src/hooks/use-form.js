import { useState } from 'react';
import { useNavigate, useMatchRoute } from '@tanstack/react-router';

import { useAuthGlobalContext } from '../context/AuthGlobalContext';
import { ROUTE_PATHS } from '../routes';

import { readSandwichFromCache } from '../services/api-sandwiches';

import validateForm from '../utils/validate-utils';
import useToast from './use-toast';
import { useModalContext } from '../context/ModalContext';
import { isAuthRoute } from '../utils/auth-utils';

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
  const { closeActiveModal } = useModalContext();

  const matchLoginParent = useMatchRoute({ to: ROUTE_PATHS.LOGIN_PARENT });
  const matchSignupParent = useMatchRoute({ to: ROUTE_PATHS.SIGNUP_PARENT });
  const loginParentParameters = matchLoginParent?.({ strict: false });
  const signupParentParameters = matchSignupParent?.({ strict: false });
  const parentId = loginParentParameters?.parentId || signupParentParameters?.parentId;
  const navigate = useNavigate();

  const redirectUser = (returnTo, successMessage = null) => {
    // Show success toast if message provided
    if (successMessage) {
      showToast(successMessage);
    }

    /*
     * Determine destination with priority:
     * 1. If returnTo exists, is not empty, and is NOT an auth route → use it
     * 2. Else if saved sandwich exists → /create
     * 3. Else → /menu
     */
    let destination;
    if (returnTo && returnTo.trim() && !isAuthRoute(returnTo)) {
      destination = returnTo;
    } else {
      const unExpiredSavedSandwich = readSandwichFromCache();
      destination = unExpiredSavedSandwich ? ROUTE_PATHS.CREATE : ROUTE_PATHS.MENU;
    }

    // Close any active modal programmatically before navigation
    // This prevents the modal from trying to navigate back in history
    const modalWasClosed = closeActiveModal();

    if (modalWasClosed) {
      // If a modal was closed, wait a bit for it to close visually, then navigate
      setTimeout(() => {
        navigate({ to: destination, replace: true });
      }, 200);
    } else {
      // No modal was active, navigate immediately
      navigate({ to: destination, replace: true });
    }
  };

  const LoginHandler = async (e, returnTo) => {
    e.preventDefault();
    setErrors([]);

    const errorMessages = validateForm({ email, password });
    if (errorMessages.length > 0) {
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

    // Login successful - show toast and redirect
    redirectUser(returnTo, 'Login successful!');
  };

  const signUpHandler = async (e, returnTo) => {
    e.preventDefault();
    setErrors([]);

    const errorMessages = validateForm({ name, email, password, confirmPassword });
    if (errorMessages.length > 0) {
      return setErrors(errorMessages);
    }

    const res = await signUp({ name, email, password, role, parentId });
    if (res.error) {
      return setErrors([res.error.message]);
    }

    /*
     * Check if email confirmation is required
     * Handle both successful email send and failed email send cases
     */
    if (
      res.message &&
      (res.message.includes('check your email') || res.message.includes('confirmation email could not be sent'))
    ) {
      // Don't redirect - return success state to show confirmation message
      setErrors([]); // Clear errors
      return { success: true, needsEmailConfirmation: true, email, message: res.message };
    }

    // Signup successful (no email confirmation needed) - show toast and redirect
    redirectUser(returnTo, 'Account created successfully!');
    return { success: true, needsEmailConfirmation: false };
  };

  const handleFileChange = (event) => {
    /*
     * setFiles((prev) => {
     *     return { ...prev, [event.target.name]: event.target.files[0] };
     * });
     */
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
