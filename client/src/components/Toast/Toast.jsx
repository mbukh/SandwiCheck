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
                <button className="btn-wrapper ml-1" onClick={() => setVisible(false)}>
                    <span className="text-magenta text-shadow-3  ml-1">X</span>
                </button>
            </div>
        )
    );
};

export default Toast;
