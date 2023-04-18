import { useState, useEffect, useRef } from "react";

import { log, logResponse } from "../utils/log";

const useUser = () => {
    const [currentUser, setCurrentUser] = useState({});
    const [isCurrentUserReady, setIsCurrentUserReady] = useState(false);

    return { currentUser, setCurrentUser, isCurrentUserReady, setIsCurrentUserReady };
};

export default useUser;
