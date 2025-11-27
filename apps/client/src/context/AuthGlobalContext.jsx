import { createContext, useContext, useEffect } from 'react';
import { LOGGED_IN_USER_TIME_OUT_DAYS } from '../constants/user-constants';
import useUser from '../hooks/use-user';
import { logResponse } from '../utils/log';
import { timeDifference } from '../utils/utils';

const AuthGlobalContext = createContext();

const AuthGlobalContextProvider = ({ children }) => {
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
    // Check wether a user logged in and time out cookies not passed
    const lastLoginAt = JSON.parse(localStorage.getItem('loggedIn'));
    const loggedInFor = timeDifference(lastLoginAt, Date.now()).days;
    if (loggedInFor > LOGGED_IN_USER_TIME_OUT_DAYS) {
      localStorage.removeItem('loggedIn');
    }

    // Skip readCurrent user for not logged in user
    if (!JSON.parse(localStorage.getItem('loggedIn'))) {
      setIsCurrentUserReady(true);
      return;
    }

    (async () => {
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

export const useAuthGlobalContext = () => useContext(AuthGlobalContext);
export default AuthGlobalContextProvider;
