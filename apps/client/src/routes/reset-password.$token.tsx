import { createFileRoute } from '@tanstack/react-router';

import ResetPassword from '../components/ResetPassword/ResetPassword';

export const Route = createFileRoute('/reset-password/$token')({
  component: ResetPassword,
});

export const ResetPasswordRoute = Route;
