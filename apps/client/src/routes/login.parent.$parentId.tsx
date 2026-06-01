import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';
import LoginModal from '@/components/Login/LoginModal';
import { parentIdSchema } from '@/schemas/routeParams';

export const Route = createFileRoute('/login/parent/$parentId')({
  params: {
    parse: (raw) => v.parse(parentIdSchema, raw),
  },
  component: LoginModal,
});
