import { syncEvents } from "./syncEngine"

window.addEventListener("online", ()=> {
    syncEvents()
})