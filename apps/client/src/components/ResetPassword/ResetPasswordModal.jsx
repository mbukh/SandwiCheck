import Modal from '../Modal/Modal';
import ResetPassword from './ResetPassword';

const ResetPasswordModal = ({ setIsOpenLoginModal, closeLink = '' }) => {
  return (
    <Modal
      modalId="reset-password"
      setIsOpenLoginModal={setIsOpenLoginModal}
      isModalLoading={false}
      closeLink={closeLink}
    >
      <ResetPassword />
    </Modal>
  );
};

export default ResetPasswordModal;

