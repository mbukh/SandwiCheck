import { createFileRoute } from '@tanstack/react-router';
import LoginModal from '../components/Login/LoginModal';
import { parentIdSchema } from '../schemas/routeParams';

export const Route = createFileRoute('/login/parent/$parentId')({
  validateParams: parentIdSchema,
  component: LoginModal,
});
