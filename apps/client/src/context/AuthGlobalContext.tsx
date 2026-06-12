import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { LOGGED_IN_USER_TIME_OUT_DAYS } from '@/constants/user-constants';
import useUser, { type UseUserResult } from '@/hooks/use-user';
import { logResponse } from '@/utils/log';
import { readJsonFromStorage } from '@/utils/storage-utils';
import { timeDifference } from '@/utils/utils';

type AuthGlobalContextValue = Omit<UseUserResult, 'setIsCurrentUserReady'> & {
  /** Whether the app-level "please sign up" prompt overlay is open. */
  isSignupPromptOpen: boolean;
  setIsSignupPromptOpen: (open: boolean) => void;
  /** Open the app-level signup prompt (e.g. when a logged-out visitor tries to vote). */
  openSignupPrompt: () => void;
};

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

  // App-level signup prompt, so it can be opened from anywhere (incl. inside another modal).
  const [isSignupPromptOpen, setIsSignupPromptOpen] = useState(false);
  const openSignupPrompt = useCallback(() => setIsSignupPromptOpen(true), []);

  useEffect(() => {
    /*
     * Check whether a user logged in and the time-out window has not passed. Parse once
     * (safely): a corrupt 'loggedIn' value is cleared instead of throwing out of hydration.
     */
    let lastLoginAt = readJsonFromStorage<number>('loggedIn');
    if (lastLoginAt !== null && timeDifference(lastLoginAt, Date.now()).days > LOGGED_IN_USER_TIME_OUT_DAYS) {
      localStorage.removeItem('loggedIn');
      lastLoginAt = null;
    }

    // Skip readCurrentUser for a not-logged-in (or expired) user
    if (lastLoginAt === null) {
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
        isSignupPromptOpen,
        setIsSignupPromptOpen,
        openSignupPrompt,
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
