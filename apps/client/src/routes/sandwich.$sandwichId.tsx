import { createFileRoute } from '@tanstack/react-router';

import { sandwichIdSchema } from '../schemas/routeParams';
import SandwichModal from '../components/Sandwich/SandwichModal';
import { ROUTE_PATHS } from './routes';

export const Route = createFileRoute('/sandwich/$sandwichId')({
  validateParams: sandwichIdSchema,
  component: () => <SandwichModal closeLink={ROUTE_PATHS.LATEST} />,
});
