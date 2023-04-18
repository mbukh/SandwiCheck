import React, { useEffect, useState } from "react";
import "./Toast.css";

const TOAST_TIMEOUT = 10000;

const Toast = ({ message }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, TOAST_TIMEOUT);

        return () => clearTimeout(timer);
    }, []);

    return (
        visible && (
            <div className="toast">
                <p>{message}</p>
                <button onClick={() => setVisible(false)}>X</button>
            </div>
        )
    );
};

export default Toast;
