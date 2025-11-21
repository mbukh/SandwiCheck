import { createFileRoute } from '@tanstack/react-router';

import ResetPasswordModal from '../components/ResetPassword/ResetPasswordModal';

export const Route = createFileRoute('/reset-password/$token')({
  component: ResetPasswordModal,
});

export const ResetPasswordRoute = Route;
