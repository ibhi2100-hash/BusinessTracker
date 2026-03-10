"use client";
import { useEffect } from "react";
import { getInventoryProducts } from "@/offline/db/helpers";
import { useInventoryStore } from "@/store/inventoryStore";

const setProducts  = useInventoryStore(s=> s.setProducts);

useEffect(() => {

  const loadSnapshot = async () => {

    const cachedProducts = await getInventoryProducts();

    if (cachedProducts.length) {
      setProducts(cachedProducts);
    }

  };

  loadSnapshot();

}, []);