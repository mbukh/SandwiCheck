import { createContext, type ReactNode, useContext, useEffect } from 'react';
import { LOGGED_IN_USER_TIME_OUT_DAYS } from '@/constants/user-constants';
import useUser, { type UseUserResult } from '@/hooks/use-user';
import { logResponse } from '@/utils/log';
import { timeDifference } from '@/utils/utils';

type AuthGlobalContextValue = Omit<UseUserResult, 'setIsCurrentUserReady'>;

const AuthGlobalContext = createContext<AuthGlobalContextValue | null>(null);

const AuthGlobalContextProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const {
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
  } = useUser();

  useEffect(() => {
    // Check whether a user logged in and the time-out window has not passed
    const lastLoginAt = JSON.parse(localStorage.getItem('loggedIn') ?? 'null');
    const loggedInFor = timeDifference(lastLoginAt, Date.now()).days;
    if (loggedInFor > LOGGED_IN_USER_TIME_OUT_DAYS) {
      localStorage.removeItem('loggedIn');
    }

    // Skip readCurrentUser for a not-logged-in user
    if (!JSON.parse(localStorage.getItem('loggedIn') ?? 'null')) {
      setIsCurrentUserReady(true);
      return;
    }

    void (async () => {
      const res = await refreshSession();
      logResponse('👽 Session hydration', res);
    })();
  }, [refreshSession, setIsCurrentUserReady]);

  return (
    <AuthGlobalContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        parentUser,
        actingAsChild,
        isCurrentUserReady,
        logIn,
        signUp,
        logOut,
        refreshSession,
        createChild,
        loginChild,
        switchToParent,
      }}
    >
      {children}
    </AuthGlobalContext.Provider>
  );
};

export const useAuthGlobalContext = (): AuthGlobalContextValue => {
  const context = useContext(AuthGlobalContext);
  if (!context) {
    throw new Error('useAuthGlobalContext must be used within an AuthGlobalContextProvider');
  }
  return context;
};

export default AuthGlobalContextProvider;
