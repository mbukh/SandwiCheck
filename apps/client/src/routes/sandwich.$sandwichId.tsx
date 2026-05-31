import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';
import SandwichModal from '@/components/Sandwich/SandwichModal';
import { ROUTE_PATHS } from '@/constants/route-paths';
import { sandwichIdSchema } from '@/schemas/routeParams';

export const Route = createFileRoute('/sandwich/$sandwichId')({
  params: {
    parse: (raw) => v.parse(sandwichIdSchema, raw),
  },
  component: () => <SandwichModal closeLink={ROUTE_PATHS.LATEST} />,
});
