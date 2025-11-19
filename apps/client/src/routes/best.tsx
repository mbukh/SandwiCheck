import { createFileRoute } from '@tanstack/react-router';

import SandwichGallery from '../components/Sandwich/SandwichGallery';

export const Route = createFileRoute('/best')({
  component: () => <SandwichGallery galleryType="best" />,
});

export const BestRoute = Route;
