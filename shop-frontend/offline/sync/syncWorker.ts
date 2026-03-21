async function sync() {
  const unsynced = get().queue.filter(e => !e.synced);

  if (!unsynced.length) return;

  const res = await fetch("/sync/events", {
    method: "POST",
    body: JSON.stringify(unsynced)
  });

  if (res.ok) {
    markSynced(unsynced.map(e => e.id));
  