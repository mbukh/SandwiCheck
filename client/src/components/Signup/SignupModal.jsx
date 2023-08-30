import Modal from "../Modal/Modal";
import Signup from "./Signup";

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
