import { createFileRoute } from '@tanstack/react-router';
import { valibotValidator } from '@tanstack/valibot-adapter';

import { parentIdSchema } from '../schemas/routeParams';
import SignupModal from '../components/Signup/SignupModal';

export const Route = createFileRoute('/signup/parent/$parentId')({
  validateParams: valibotValidator(parentIdSchema),
  component: SignupModal,
});

export const SignupParentRoute = Route;

