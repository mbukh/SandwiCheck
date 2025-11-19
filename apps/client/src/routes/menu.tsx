import { createFileRoute } from '@tanstack/react-router';

import SandwichGallery from '../components/Sandwich/SandwichGallery';

export const Route = createFileRoute('/menu')({
  component: () => <SandwichGallery galleryType="personal" />,
});

export const MenuRoute = Route;
