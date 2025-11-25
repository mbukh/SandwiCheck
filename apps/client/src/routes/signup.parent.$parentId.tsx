import { createFileRoute } from '@tanstack/react-router';

import { parentIdSchema } from '../schemas/routeParams';
import SignupModal from '../components/Signup/SignupModal';

export const Route = createFileRoute('/signup/parent/$parentId')({
  validateParams: parentIdSchema,
  component: SignupModal,
});
