import { createFileRoute } from '@tanstack/react-router';
import { valibotValidator } from '@tanstack/valibot-adapter';

import { parentIdSchema } from '../schemas/routeParams';
import LoginModal from '../components/Login/LoginModal';

export const Route = createFileRoute('/login/parent/$parentId')({
  validateParams: valibotValidator(parentIdSchema),
  component: LoginModal,
});

export const LoginParentRoute = Route;
