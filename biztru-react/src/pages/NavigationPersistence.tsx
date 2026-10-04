import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";

export function NavigationPersistence() {
    const app = useApplication();
    const location = useLocation();

    useEffect(() => {

        void app.context.save({
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
        });

    }, [
        location.pathname,
        location.search,
        location.hash,
    ]);

    return null;

}