import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";

import { Providers } from "./providers";
import { ApplicationProvider } from "./Biztru/services/ApplicationService/ApplicationProvider";
import { BusinessProvider } from "./Biztru/context/BusinessContext";
import { ServiceWorkerRegistration } from "./components/serviceWorker";
import { AppRouter } from "./router";
import { NavigationPersistence } from "./pages/NavigationPersistence";

function App() {
    return (
        <Providers>

            <BrowserRouter>

                <ApplicationProvider>

                    <BusinessProvider>
                            <NavigationPersistence />
                            <ServiceWorkerRegistration />

                            <AppRouter />
                        <Toaster
                            richColors
                            position="top-right"
                        />

                    </BusinessProvider>

                </ApplicationProvider>

            </BrowserRouter>

        </Providers>
    );
}

export default App;