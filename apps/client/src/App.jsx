import 'normalize.css';
import 'reset-css';
import './styles/App.css';
import './styles/blueprint.css';

import { createRouter, RouterProvider } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

function App() {
  return <RouterProvider router={router} />;
}

export default App;
