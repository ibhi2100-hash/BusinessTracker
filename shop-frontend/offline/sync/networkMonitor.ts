import { syncEvent } from "./syncEngine"

window.addEventListener("online", ()=> {
    syncEvent()
})