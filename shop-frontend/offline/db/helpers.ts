import { create } from "domain";
import { getDb } from "./indexDB";
import { TABLES } from "./schema";



export const addEvent= async(event: any)=> {
    const db = await getDb();
    return await db.add(TABLES.EVENTS, event)
}

export const getPendingEvents = async()=> {
    const db = await getDb();
    return await db.getAllFromIndex(TABLES.EVENTS, "by_synced", 0)
}

export const addLedgerEntry = async (entry: any)=> {
    const db = await getDb();
     await db.add(TABLES.LEDGER_ENTRIES, entry)
}
export const getDashboardSnapshots = async()=> {
    const db = await getDb();
    const snapshot = await db.getAll(TABLES.SNAPSHOT)

    return snapshot
}

export const addDashboardSnapshot = async (snapshot: any) => {
  const db = await getDb()

  const id = `dashboard-${new Date().toDateString()}`

  await db.put(TABLES.SNAPSHOT, {
    id,
    ...snapshot,
    createdAt: Date.now()
  })

}

export const addBusinessData = async (businessData: any)=> {
    const db = await getDb();

    await db.put(TABLES.BUSINESSDATA, {
        id: crypto.randomUUID(),
        ...businessData,
        createdAt: Date.now()
    })
}

export const getBusinessData = async ()=> {
    const db = await getDb();

    const businessData = await db.getAll(TABLES.BUSINESSDATA)

    return businessData
}
export const addInventoryProducts  = async (data: any)=> {
    const db = await getDb();
    const tx = db.transaction(TABLES.INVENTORY, "readwrite");

    for (const product of data) {
        await tx.store.put(product);
    }
    await tx.done;
}
export const getInventoryProducts = async ()=> {
    const db = await getDb();

    const ProductData = await db.getAll(TABLES.INVENTORYSTORE, {
        
    })

    return ProductData
}

export const addProducts = async (products: any[]) => {
  const db = await getDb();
  const tx = db.transaction(TABLES.PRODUCT, "readwrite");

  for (const product of products) {
    await tx.store.put(product);
  }

  await tx.done;
};
export const getProducts = async ()=> {
    const db = await getDb();

    const ProductData = await db.getAll(TABLES.PRODUCT, {
        
    })

    return ProductData
}


export const addCategories = async (data: any[])=> {
    const db = await getDb();
    const tx = db.transaction(TABLES.CATEGORIES, "readwrite");

    for (const category of data) {
        await tx.store.put(category);
    }

    await tx.done;
}

export const getCategories = async ()=> {
    const db = await getDb();

    const categories = await db.getAll(TABLES.CATEGORIES)

    return categories
}


export const addBrands = async (data: any[])=> {
    const db = await getDb();
   const tx = db.trasaction(TABLES.BRANDS, "readwrite");

   for( const brand of data ){
    await tx.store.put(brand)
   }
   await tx.done;
}

export const getBrands = async ()=> {
    const db = await getDb();

    const brands = await db.getAll(TABLES.BRANDS)

    return brands
}
