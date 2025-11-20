import Modal from '../Modal/Modal';
import ForgotPassword from './ForgotPassword';

const ForgotPasswordModal = ({ setIsOpenLoginModal, closeLink = '' }) => {
  return (
    <Modal
      modalId="forgot-password"
      setIsOpenLoginModal={setIsOpenLoginModal}
      isModalLoading={false}
      closeLink={closeLink}
    >
      <ForgotPassword />
    </Modal>
  );
};

export default ForgotPasswordModal;
