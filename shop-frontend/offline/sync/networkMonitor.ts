import { syncEvent } from "./syncEngine"

window.addEventListener("online", ()=> {
    setInterval(syncEvent, 20000)
})