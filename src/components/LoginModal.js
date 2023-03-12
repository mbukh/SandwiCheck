import { useState } from "react";

import { Modal } from "./";

import { Login } from "./";

const LoginModal = ({ closeLink = "" }) => {
    const [isModalLoading, setIsModalLoading] = useState(false);

    return (
        <Modal isModalLoading={isModalLoading} closeLink={closeLink}>
            <Login />
        </Modal>
    );
};

export default LoginModal;
