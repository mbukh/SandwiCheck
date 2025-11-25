import { createFileRoute } from '@tanstack/react-router';

import { parentIdSchema } from '../schemas/routeParams';
import LoginModal from '../components/Login/LoginModal';

export const Route = createFileRoute('/login/parent/$parentId')({
  validateParams: parentIdSchema,
  component: LoginModal,
});
