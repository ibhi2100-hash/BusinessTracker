// components/RoutePersistence.tsx


import { useEffect } from "react";
import { useLocation} from "react-router-dom";
import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext"; 
export function RoutePersistence() {
  const { pathname } = useLocation();
  const app = useApplication();

  useEffect(() => {
   
    // Persist to client database
    app.client.repositories.applicationState
      .setLastRoute(pathname)
      .catch(console.error);

  }, [pathname, app]);

  return null;
}