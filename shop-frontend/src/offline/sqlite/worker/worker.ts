import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
let db: any;

export async function initDB() {
    const sqlite3 = await sqlite3InitModule();

    const oo = sqlite3.oo1;

    db = new oo.DB("biztru.db", "c");

    console.log("SQLite initialized");
}

self.onmessage = async (event) => {
    const { id, type , payload } = event.data;

    try {
        if(type === "INIT"){
            await initDB();

            self.postMessage({
                id,
                result: "READY"
            });

            return;
        }

        if (type === "RUN") {
            const { sql, params } = payload;

            const rows: any[] = [];

            db.exec({
                sql,
                bind: params,
                rowMode: "object",
                callback: (row: any) => {
                rows.push(row);
                },
            });

  self.postMessage({
    id,
    result: rows,
  });

  return;
}
        
    } catch (error) {
        self.postMessage({
            id,
            error: error.message
        })
    }
}