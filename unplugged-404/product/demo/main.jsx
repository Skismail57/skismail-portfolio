import { createRoot } from 'react-dom/client';
import Unplugged404 from '../src/Unplugged404.jsx';
import '../src/tokens.css';
import '../src/Unplugged404.css';

// In your app, homeHref is your home page and onHome (optional) routes
// client-side. Here the links stay on the demo so you can keep playing.
createRoot(document.getElementById('root')).render(
  <Unplugged404
    homeHref="/"
    secondaryHref="#"
    secondaryLabel="Contact support"
  />
);
