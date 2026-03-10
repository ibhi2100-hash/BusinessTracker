import { useInventoryStore } from "@/store/inventoryStore";
import { useQuery } from "@tanstack/react-query";
import { fetchInventoryProducts } from "@/services/inventory.service";
import { useEffect } from "react";
export const useProducts = (brandId: string) => {

  const setProducts = useInventoryStore((s) => s.setProducts);

  const query =  useQuery({
        queryKey: ["products", brandId],
        queryFn: () => fetchInventoryProducts(brandId),
        enabled: !!brandId,

    });

    useEffect(()=> {
        if(query.data !== undefined){
            setProducts(query.data)
        }
    }, [query.data, setProducts])
    return query;
};