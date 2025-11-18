import { createFileRoute } from '@tanstack/react-router';

import Error404 from '../pages/Error404';

export const Route = createFileRoute('/$')({
  component: Error404,
});

export const NotFoundRoute = Route;

