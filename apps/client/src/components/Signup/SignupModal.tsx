import Modal from '@/components/Modal/Modal';
import Signup from './Signup';

interface SignupModalProps {
  setIsOpenLoginModal?: (isOpen: boolean) => void;
  closeLink?: string;
}

const SignupModal = ({ setIsOpenLoginModal, closeLink = '' }: SignupModalProps): React.JSX.Element => {
  return (
    <Modal modalId="signup" setIsOpenLoginModal={setIsOpenLoginModal} isModalLoading={false} closeLink={closeLink}>
      <Signup />
    </Modal>
  );
};

export default SignupModal;
