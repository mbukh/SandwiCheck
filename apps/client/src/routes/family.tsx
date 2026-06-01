import { createFileRoute } from '@tanstack/react-router';
import Family from '@/pages/Family';

export const Route = createFileRoute('/family')({
  component: Family,
});
