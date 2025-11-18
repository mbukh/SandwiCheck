import { createFileRoute } from '@tanstack/react-router';
import { valibotValidator } from '@tanstack/valibot-adapter';

import { childIdSchema } from '../schemas/routeParams';
import SandwichGallery from '../components/Sandwich/SandwichGallery';

export const Route = createFileRoute('/family/$childId')({
  validateParams: valibotValidator(childIdSchema),
  component: SandwichGallery,
});

export const FamilyChildRoute = Route;
