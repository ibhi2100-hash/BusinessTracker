export function useAddSale(){
    return async (sale: any) => {
        const eventData = {
            id: crypto.randomUUID(),
            type: "SALE_ADDED",
            payload: sale,
            synced: false,
            createdAt: Date.now()
        }
        
        const event = new CustomEvent("SALE_ADDED", { detail: eventData })
        dispatchEvent(event)
    }
}