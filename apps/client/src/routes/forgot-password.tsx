import { createFileRoute } from '@tanstack/react-router';
import ForgotPasswordModal from '../components/ForgotPassword/ForgotPasswordModal';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordModal,
});
