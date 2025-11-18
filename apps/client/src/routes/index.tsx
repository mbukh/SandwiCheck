import { createFileRoute } from '@tanstack/react-router';

import SandwichGallery from '../components/Sandwich/SandwichGallery';

export const Route = createFileRoute('/')({
  component: () => <SandwichGallery galleryType="latest" />,
});

export const IndexRoute = Route;

