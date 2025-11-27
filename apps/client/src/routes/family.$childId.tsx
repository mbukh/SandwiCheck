import { createFileRoute } from '@tanstack/react-router';
import SandwichGallery from '../components/Sandwich/SandwichGallery';
import { childIdSchema } from '../schemas/routeParams';

export const Route = createFileRoute('/family/$childId')({
  validateParams: childIdSchema,
  component: SandwichGallery,
});
