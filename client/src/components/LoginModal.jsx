import { Modal } from ".";

import { Login } from ".";

const LoginModal = ({ setIsOpenLoginModal, closeLink = "" }) => {
    return (
        <Modal
            setIsOpenLoginModal={setIsOpenLoginModal}
            isModalLoading={false}
            closeLink={closeLink}
        >
            <Login />
        </Modal>
    );
};

export default LoginModal;
