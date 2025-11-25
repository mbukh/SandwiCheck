import { createFileRoute } from '@tanstack/react-router';

import LoginModal from '../components/Login/LoginModal';

export const Route = createFileRoute('/login')({
  component: LoginModal,
});
