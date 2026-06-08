import { getDb } from '@/src/db';
import React from 'react'

export async function appBootstrap(userId: string){
  const db = getDb(userId);
  const auth = await db.auth.get("current");
  
}

export default appBootstrap