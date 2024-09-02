export const setTokenCookie = (token, res) => {
  // Set cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN_DAYS * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'strict',
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Set cookie and send response
  res.cookie(token.name, token.value, cookieOptions);
};

export const removeCookie = (cookieName, res) => {
  // Set cookie options
  const cookieOptions = {
    expires: new Date(Date.now() - 1),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.clearCookie(cookieName, cookieOptions);
};
