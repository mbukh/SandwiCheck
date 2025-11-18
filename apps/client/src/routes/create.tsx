import { createFileRoute } from '@tanstack/react-router';

import SandwichContextProvider from '../context/SandwichContext';
import SandwichBuilder from '../components/Sandwich/Builder/SandwichBuilder';

export const Route = createFileRoute('/create')({
  component: () => (
    <SandwichContextProvider>
      <SandwichBuilder />
    </SandwichContextProvider>
  ),
});

export const CreateRoute = Route;

