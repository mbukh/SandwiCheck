import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';
import SignupModal from '@/components/Signup/SignupModal';
import { parentIdSchema } from '@/schemas/routeParams';

export const Route = createFileRoute('/signup/parent/$parentId')({
  params: {
    parse: (raw) => v.parse(parentIdSchema, raw),
  },
  component: SignupModal,
});
