import Modal from '@/components/Modal/Modal';
import ResetPassword from './ResetPassword';

interface ResetPasswordModalProps {
  setIsOpenLoginModal?: (isOpen: boolean) => void;
  closeLink?: string;
}

const ResetPasswordModal = ({ setIsOpenLoginModal, closeLink = '' }: ResetPasswordModalProps): React.JSX.Element => {
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
