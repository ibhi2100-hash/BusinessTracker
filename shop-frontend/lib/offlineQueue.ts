import localforage from "localforage";

const queue = localforage.createInstance({
  name: "offline-sales",
});

export async function addToQueue(sale: any) {
  const existing = (await queue.getItem("pending")) || [];
  await queue.setItem("pending", [...existing, sale]);
}

export async function getQueue() {
  return (await queue.getItem("pending")) || [];
}

export async function clearQueue() {
  await queue.setItem("pending", []);
}
