import { createFileRoute } from '@tanstack/react-router';
import { valibotValidator } from '@tanstack/valibot-adapter';

import { sandwichIdSchema } from '../schemas/routeParams';
import SandwichModal from '../components/Sandwich/SandwichModal';
import { ROUTE_PATHS } from './routes';

export const Route = createFileRoute('/sandwich/$sandwichId')({
  validateParams: valibotValidator(sandwichIdSchema),
  component: () => <SandwichModal closeLink={ROUTE_PATHS.LATEST} />,
});

export const SandwichRoute = Route;
