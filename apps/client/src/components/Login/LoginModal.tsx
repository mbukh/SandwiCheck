import Modal from '@/components/Modal/Modal';
import Login from './Login';

interface LoginModalProps {
  setIsOpenLoginModal?: (isOpen: boolean) => void;
  closeLink?: string;
}

const LoginModal = ({ setIsOpenLoginModal, closeLink = '' }: LoginModalProps): React.JSX.Element => {
  return (
    <Modal modalId="login" setIsOpenLoginModal={setIsOpenLoginModal} isModalLoading={false} closeLink={closeLink}>
      <Login />
    </Modal>
  );
};

export default LoginModal;
