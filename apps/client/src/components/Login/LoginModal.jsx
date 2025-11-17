import Modal from '../Modal/Modal';
import Login from './Login';

const LoginModal = ({ setIsOpenLoginModal, closeLink = '' }) => {
  return (
    <Modal setIsOpenLoginModal={setIsOpenLoginModal} isModalLoading={false} closeLink={closeLink}>
      <Login />
    </Modal>
  );
};

export default LoginModal;
