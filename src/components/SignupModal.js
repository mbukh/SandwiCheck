import { Modal } from "./";

import { Signup } from "./";

const SignupModal = ({ setIsOpenLoginModal, closeLink = "" }) => {
    return (
        <Modal
            setIsOpenLoginModal={setIsOpenLoginModal}
            isModalLoading={false}
            closeLink={closeLink}
        >
            <Signup />
        </Modal>
    );
};

export default SignupModal;
