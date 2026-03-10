export const syncEvents = async (events: any )=> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ events })
    })
    if(!res.ok) throw new Error("Sync failed");

    return res.json();
}