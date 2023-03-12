import { useState } from "react";

import { Modal } from "./";

import { Signup } from "./";

const SignupModal = ({ closeLink = "" }) => {
    const [isModalLoading, setIsModalLoading] = useState(false);

    return (
        <Modal isModalLoading={isModalLoading} closeLink={closeLink}>
            <Signup />
        </Modal>
    );
};

export default SignupModal;
