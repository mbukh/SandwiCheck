import { type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction, useState } from 'react';
import { useMatchRoute, useNavigate } from '@tanstack/react-router';
import { ERROR_CODE, type LoginDto, ROLE, type SignupDto, type SignupPendingData } from '@sandwicheck/shared';
import { ROUTE_PATHS } from '@/constants/route-paths';
import { useAuthGlobalContext } from '@/context/AuthGlobalContext';
import { useModalContext } from '@/context/ModalContext';
import { readSandwichFromCache } from '@/services/api-sandwiches';
import type { ApiResult } from '@/types/api';
import type { User } from '@/types/domain';
import { isSafeReturnTo } from '@/utils/auth-utils';
import validateForm from '@/utils/validate-utils';
import useToast from './use-toast.tsx';

interface SignUpResult {
  success: boolean;
  needsEmailConfirmation: boolean;
  /** False when the account was created but the confirmation email could not be sent. */
  emailSent?: boolean;
  email?: string;
  message?: string;
}

interface UseFormResult {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: Dispatch<SetStateAction<string>>;
  errors: string[];
  setErrors: Dispatch<SetStateAction<string[]>>;
  logIn: (params: LoginDto) => Promise<ApiResult<User>>;
  signUp: (params: SignupDto) => Promise<ApiResult<SignupPendingData>>;
  user: Partial<User>;
  /** True after a login was rejected because the account's email is not yet confirmed. */
  loginNeedsEmailConfirmation: boolean;
  LoginHandler: (event: FormEvent, returnTo?: string | null) => Promise<void>;
  signUpHandler: (event: FormEvent, returnTo?: string | null) => Promise<SignUpResult | void>;
  navigate: ReturnType<typeof useNavigate>;
  parentId: string | undefined;
  /** Whether the user consented to redeeming the parent invite token on login. */
  linkConsent: boolean;
  setLinkConsent: Dispatch<SetStateAction<boolean>>;
  role: string;
  setRole: Dispatch<SetStateAction<string>>;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const useForm = (): UseFormResult => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');

  const [errors, setErrors] = useState<string[]>([]);
  const [loginNeedsEmailConfirmation, setLoginNeedsEmailConfirmation] = useState(false);
  // Consent to be linked as a dependent when logging in through a parent invite link.
  const [linkConsent, setLinkConsent] = useState(false);
  const { showToast } = useToast();

  const { logIn, signUp, currentUser: user } = useAuthGlobalContext();
  const { closeActiveModal } = useModalContext();

  const matchRoute = useMatchRoute();
  const loginParentParameters = matchRoute({ to: ROUTE_PATHS.LOGIN_PARENT });
  const signupParentParameters = matchRoute({ to: ROUTE_PATHS.SIGNUP_PARENT });
  const parentId =
    (loginParentParameters && loginParentParameters.parentId) ||
    (signupParentParameters && signupParentParameters.parentId) ||
    undefined;
  const navigate = useNavigate();

  const redirectUser = (returnTo?: string | null, successMessage: string | null = null): void => {
    // Show success toast if a message is provided
    if (successMessage) {
      showToast(successMessage);
    }

    /*
     * Determine destination with priority:
     * 1. If returnTo exists, is not empty, and is NOT an auth route → use it
     * 2. Else if saved sandwich exists → /create
     * 3. Else → /menu
     */
    let destination: string;
    if (isSafeReturnTo(returnTo)) {
      destination = returnTo;
    } else {
      const unExpiredSavedSandwich = readSandwichFromCache();
      destination = unExpiredSavedSandwich ? ROUTE_PATHS.CREATE : ROUTE_PATHS.MENU;
    }

    /*
     * Close any active modal programmatically before navigation.
     * This prevents the modal from trying to navigate back in history.
     */
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

  const LoginHandler = async (event: FormEvent, returnTo?: string | null): Promise<void> => {
    event.preventDefault();
    setErrors([]);

    const errorMessages = validateForm({ email, password });
    if (errorMessages.length > 0) {
      setErrors(errorMessages);
      return;
    }

    /*
     * `parentId` is the route param value, which now carries a parent invite token. Only send it
     * (and the explicit consent flag) when the user ticked the consent checkbox — otherwise log in
     * normally without linking, so an invite link can never silently attach the account to a parent.
     */
    const res = await logIn({
      email,
      password,
      inviteToken: linkConsent ? parentId : undefined,
      acceptInvite: linkConsent ? true : undefined,
    });
    if (res.error) {
      // The server stamps EMAIL_NOT_CONFIRMED so we can offer the resend UI without parsing prose.
      if (res.error.code === ERROR_CODE.emailNotConfirmed) {
        setLoginNeedsEmailConfirmation(true);
        setErrors([res.error.message]);
        return;
      }
      setLoginNeedsEmailConfirmation(false);
      setErrors(['Login failed, try signup instead']);
      return;
    }

    // Login successful - show toast and redirect
    setLoginNeedsEmailConfirmation(false);
    redirectUser(returnTo, 'Login successful!');
  };

  const signUpHandler = async (event: FormEvent, returnTo?: string | null): Promise<SignUpResult | void> => {
    event.preventDefault();
    setErrors([]);

    /*
     * Invite links always create a dependent (child) account — the role select
     * is not rendered in that flow, so the role must be derived here.
     */
    const effectiveRole = parentId ? ROLE.child : role;

    const errorMessages = validateForm({ name, email, password, confirmPassword, role: effectiveRole });
    if (errorMessages.length > 0) {
      setErrors(errorMessages);
      return;
    }

    // `parentId` is the route param value, which now carries a parent invite token.
    const res = await signUp({ name, email, password, role: effectiveRole, inviteToken: parentId });
    if (res.error) {
      setErrors([res.error.message]);
      return;
    }

    /*
     * The server signals a pending account via data.requiresEmailConfirmation (emailSent says
     * whether the confirmation email actually went out), regardless of the human-readable message.
     */
    if (res.data?.requiresEmailConfirmation) {
      // Don't redirect - return success state to show confirmation message
      setErrors([]); // Clear errors
      return {
        success: true,
        needsEmailConfirmation: true,
        emailSent: res.data.emailSent,
        email,
        message: res.message,
      };
    }

    // Signup successful (no email confirmation needed) - show toast and redirect
    redirectUser(returnTo, 'Account created successfully!');
    return { success: true, needsEmailConfirmation: false };
  };

  const handleFileChange = (_event: ChangeEvent<HTMLInputElement>): void => {
    // File upload handling is not currently wired up.
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
    loginNeedsEmailConfirmation,
    LoginHandler,
    signUpHandler,
    navigate,
    parentId,
    linkConsent,
    setLinkConsent,
    role,
    setRole,
    handleFileChange,
  };
};

export default useForm;
