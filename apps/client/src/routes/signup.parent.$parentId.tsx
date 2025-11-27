import { createFileRoute } from '@tanstack/react-router';
import SignupModal from '../components/Signup/SignupModal';
import { parentIdSchema } from '../schemas/routeParams';

export const Route = createFileRoute('/signup/parent/$parentId')({
  validateParams: parentIdSchema,
  component: SignupModal,
});
