import { createFileRoute } from '@tanstack/react-router';
import SandwichGallery from '@/components/Sandwich/SandwichGallery';

export const Route = createFileRoute('/latest')({
  component: () => <SandwichGallery galleryType="latest" />,
});
