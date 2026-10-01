
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function RoutePrefetcher() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard");
    navigate("/inventory");
    navigate("/sales");
  }, []);

  return null;
}