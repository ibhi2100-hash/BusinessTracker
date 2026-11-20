
// src/App.tsx

import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";

import { Providers } from "./providers";

import { PlatformSessionContext } from "./Biztru/services/PlatformSessionContext"; 

import { ServiceWorkerRegistration } from "./components/serviceWorker";

import { RootRouter } from "./router/router";

function App() {
  return (
    <Providers>

      <BrowserRouter>

        {/* Platform identity is available to both planes */}

          {/* Global application services */}

          <ServiceWorkerRegistration />

          {/* Selects the correct application plane */}

          <RootRouter />

          {/* Global notifications */}

          <Toaster
            richColors
            position="top-right"
          />

        

      </BrowserRouter>

    </Providers>
  );
}

export default App;
