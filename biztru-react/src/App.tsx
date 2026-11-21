
// src/App.tsx

import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";

import { Providers } from "./providers";
import { ServiceWorkerRegistration } from "./components/serviceWorker";

import { RootRouter } from "./router/router";
import { PlatformSessionProvider } from "./Biztru/services/PlatformSession/PlatformSessionProvider";

function App() {
  return (
    <Providers>

      <BrowserRouter>
        <PlatformSessionProvider>

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

        </PlatformSessionProvider>

      </BrowserRouter>

    </Providers>
  );
}

export default App;
