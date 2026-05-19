
import { syncService } from "../services/syncService";


export async function syncEngine() {

   await syncService.sync();
}