import { createFileRoute } from '@tanstack/react-router';
import SandwichBuilder from '../components/Sandwich/Builder/SandwichBuilder';
import SandwichContextProvider from '../context/SandwichContext';

export const Route = createFileRoute('/create')({
  component: () => (
    <SandwichContextProvider>
      <SandwichBuilder />
    </SandwichContextProvider>
  ),
});
