import Modal from '@/components/Modal/Modal';
import ForgotPassword from './ForgotPassword';

interface ForgotPasswordModalProps {
  setIsOpenLoginModal?: (isOpen: boolean) => void;
  closeLink?: string;
}

const ForgotPasswordModal = ({ setIsOpenLoginModal, closeLink = '' }: ForgotPasswordModalProps): React.JSX.Element => {
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
