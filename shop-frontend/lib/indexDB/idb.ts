import { openDB } from "idb"

export const dbPromise = openDB("shop-db", 1, {
    upgrade(db) {
        db.createObjectStore("sales", {
            keyPath: "id"
        })

        db.createObjectStore("inventory", {
            keyPath: "id"
        })

        db.createObjectStore("syncQueue", {
            keyPath: "id",
            autoIncrement: true
        })
    }
}
)