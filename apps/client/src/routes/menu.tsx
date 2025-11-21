import { createFileRoute, redirect } from '@tanstack/react-router';

import SandwichGallery from '../components/Sandwich/SandwichGallery';
import { ROUTE_PATHS } from './routes-config';

export const Route = createFileRoute('/menu')({
  beforeLoad: ({ location }) => {
    // Check if user is logged in via localStorage
    const loggedIn = localStorage.getItem('loggedIn');
    
    if (!loggedIn) {
      // User is not authenticated, redirect to login with returnTo parameter
      throw redirect({
        to: ROUTE_PATHS.LOGIN,
        search: {
          returnTo: location.pathname,
        },
        replace: true,
      });
    }
  },
  component: () => <SandwichGallery galleryType="personal" />,
});

export const MenuRoute = Route;
