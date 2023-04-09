const sendTokenResponse = (statusCode, token, res) => {
    // Set cookie options
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE_IN_DAYS * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
        cookieOptions.secure = true;
    }

    // Set cookie and send response
    res.status(statusCode).cookie("token", token, cookieOptions).json({
        success: true,
        data: { token },
    });
};

export default sendTokenResponse;
