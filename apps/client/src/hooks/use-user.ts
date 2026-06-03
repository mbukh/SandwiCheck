import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';
import type { CreateChildDto, LoginChildDto, LoginDto, SignupDto } from '@sandwicheck/shared';
import * as apiAuth from '@/services/api-auth';
import type { ApiResult } from '@/types/api';
import type { Session, User } from '@/types/domain';
import { logResponse } from '@/utils/log';

export interface UseUserResult {
  currentUser: Partial<User>;
  setCurrentUser: Dispatch<SetStateAction<Partial<User>>>;
  parentUser: User | null;
  actingAsChild: boolean;
  isCurrentUserReady: boolean;
  setIsCurrentUserReady: Dispatch<SetStateAction<boolean>>;
  logIn: (params: LoginDto) => Promise<ApiResult<User>>;
  signUp: (params: SignupDto) => Promise<ApiResult<User>>;
  logOut: () => Promise<ApiResult>;
  refreshSession: () => Promise<ApiResult<Session>>;
  createChild: (params: CreateChildDto) => Promise<ApiResult<User>>;
  loginChild: (params: LoginChildDto) => Promise<ApiResult<User>>;
  switchToParent: () => Promise<ApiResult<User>>;
}

const useUser = (): UseUserResult => {
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [parentUser, setParentUser] = useState<User | null>(null);
  const [actingAsChild, setActingAsChild] = useState(false);
  const [isCurrentUserReady, setIsCurrentUserReady] = useState(false);

  const applySession = useCallback((session: Session | null | undefined) => {
    if (!session) {
      setCurrentUser({});
      setParentUser(null);
      setActingAsChild(false);
      return;
    }

    const { activeUser, parentUser: sessionParentUser, actingAsChild: isActingAsChild } = session;
    setCurrentUser(activeUser || {});
    setParentUser(sessionParentUser || null);
    setActingAsChild(Boolean(isActingAsChild));
  }, []);

  const refreshSession = useCallback(async (): Promise<ApiResult<Session>> => {
    setIsCurrentUserReady(false);
    const res = await apiAuth.getSession();
    logResponse('🔄 Refresh session', res);
    if (!res?.success) {
      applySession(null);
      setIsCurrentUserReady(true);
      return res;
    }

    applySession(res.data);
    setIsCurrentUserReady(true);
    return res;
  }, [applySession]);

  const logIn = async ({ email, password, inviteToken }: LoginDto): Promise<ApiResult<User>> => {
    setIsCurrentUserReady(false);
    const res = await apiAuth.login({ email, password, inviteToken });
    logResponse('🚪 Logging in', res);
    if (!res?.success) {
      setIsCurrentUserReady(true);
      return res;
    }
    localStorage.setItem('loggedIn', JSON.stringify(Date.now()));
    await refreshSession();
    return res;
  };

  const signUp = async ({ email, password, name, role, inviteToken }: SignupDto): Promise<ApiResult<User>> => {
    setIsCurrentUserReady(false);
    const res = await apiAuth.signup({ email, password, name, role, inviteToken });
    logResponse('🎊 Signing up', res);
    if (!res?.success) {
      setIsCurrentUserReady(true);
      return res;
    }
    /*
     * Only set currentUser and loggedIn if email confirmation is not required.
     * Check if response has a message about checking email.
     */
    /*
     * Signup never auto-authenticates (email confirmation is required first), so don't
     * trigger a session refresh when the account was created but not logged in — whether
     * confirmation is pending or the confirmation email failed to send.
     */
    const needsEmailConfirmation =
      res.message &&
      (res.message.includes('check your email') || res.message.includes('confirmation email could not be sent'));
    if (needsEmailConfirmation) {
      applySession(null);
      setIsCurrentUserReady(true);
    } else {
      localStorage.setItem('loggedIn', JSON.stringify(Date.now()));
      await refreshSession();
    }
    return res;
  };

  const logOut = async (): Promise<ApiResult> => {
    setIsCurrentUserReady(false);
    const res = await apiAuth.logout();
    logResponse('🔓 Logout', res);
    applySession(null);
    localStorage.removeItem('loggedIn');
    setIsCurrentUserReady(true);
    return res;
  };

  const createChild = async ({ name }: CreateChildDto): Promise<ApiResult<User>> => {
    setIsCurrentUserReady(false);
    const res = await apiAuth.createChild({ name });
    logResponse('🧒 Create child', res);
    if (!res?.success) {
      setIsCurrentUserReady(true);
      return res;
    }
    await refreshSession();
    return res;
  };

  const loginChild = async ({ childId }: LoginChildDto): Promise<ApiResult<User>> => {
    setIsCurrentUserReady(false);
    const res = await apiAuth.loginChild({ childId });
    logResponse('👶 Login as child', res);
    if (!res?.success) {
      setIsCurrentUserReady(true);
      return res;
    }
    localStorage.setItem('loggedIn', JSON.stringify(Date.now()));
    await refreshSession();
    return res;
  };

  const switchToParent = async (): Promise<ApiResult<User>> => {
    setIsCurrentUserReady(false);
    const res = await apiAuth.switchToParent();
    logResponse('🏠 Switch to parent', res);
    if (!res?.success) {
      setIsCurrentUserReady(true);
      return res;
    }
    await refreshSession();
    return res;
  };

  return {
    currentUser,
    setCurrentUser,
    parentUser,
    actingAsChild,
    isCurrentUserReady,
    setIsCurrentUserReady,
    logIn,
    signUp,
    logOut,
    refreshSession,
    createChild,
    loginChild,
    switchToParent,
  };
};

export default useUser;
