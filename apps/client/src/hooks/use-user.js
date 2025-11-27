import { useCallback, useState } from 'react';
import * as apiAuth from '../services/api-auth';
import { logResponse } from '../utils/log';

const useUser = () => {
  const [currentUser, setCurrentUser] = useState({});
  const [parentUser, setParentUser] = useState(null);
  const [actingAsChild, setActingAsChild] = useState(false);
  const [isCurrentUserReady, setIsCurrentUserReady] = useState(false);

  const applySession = useCallback((session) => {
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

  const refreshSession = useCallback(async () => {
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

  const logIn = async ({ email, password, parentId }) => {
    setIsCurrentUserReady(false);
    const res = await apiAuth.login({ email, password, parentId });
    logResponse('🚪 Logging in', res);
    if (!res?.success) {
      setIsCurrentUserReady(true);
      return res;
    }
    localStorage.setItem('loggedIn', JSON.stringify(Date.now()));
    await refreshSession();
    return res;
  };

  const signUp = async ({ email, password, name, role, parentId }) => {
    setIsCurrentUserReady(false);
    const res = await apiAuth.signup({ email, password, name, role, parentId });
    logResponse('🎊 Signing up', res);
    if (!res?.success) {
      setIsCurrentUserReady(true);
      return res;
    }
    /*
     * Only set currentUser and loggedIn if email confirmation is not required
     * Check if response has message about checking email
     */
    const needsEmailConfirmation = res.message && res.message.includes('check your email');
    if (needsEmailConfirmation) {
      applySession(null);
      setIsCurrentUserReady(true);
    } else {
      localStorage.setItem('loggedIn', JSON.stringify(Date.now()));
      await refreshSession();
    }
    return res;
  };

  const logOut = async () => {
    setIsCurrentUserReady(false);
    const res = await apiAuth.logout();
    logResponse('🔓 Logout', res);
    applySession(null);
    localStorage.removeItem('loggedIn');
    setIsCurrentUserReady(true);
    return res;
  };

  const createChild = async ({ name }) => {
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

  const loginChild = async ({ childId }) => {
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

  const switchToParent = async () => {
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
