import { createFileRoute } from '@tanstack/react-router';
import * as v from 'valibot';
import SandwichGallery from '@/components/Sandwich/SandwichGallery';
import { childIdSchema } from '@/schemas/routeParams';

export const Route = createFileRoute('/family/$childId')({
  params: {
    parse: (raw) => v.parse(childIdSchema, raw),
  },
  component: SandwichGallery,
});
