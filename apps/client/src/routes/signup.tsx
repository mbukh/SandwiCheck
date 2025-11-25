import { createFileRoute } from '@tanstack/react-router';

import SignupModal from '../components/Signup/SignupModal';

export const Route = createFileRoute('/signup')({
  component: SignupModal,
});
