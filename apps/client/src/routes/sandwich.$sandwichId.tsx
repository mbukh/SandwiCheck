import { createFileRoute } from '@tanstack/react-router';
import SandwichModal from '../components/Sandwich/SandwichModal';
import { sandwichIdSchema } from '../schemas/routeParams';
import { ROUTE_PATHS } from './';

export const Route = createFileRoute('/sandwich/$sandwichId')({
  validateParams: sandwichIdSchema,
  component: () => <SandwichModal closeLink={ROUTE_PATHS.LATEST} />,
});
