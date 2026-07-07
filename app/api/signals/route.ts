import {db} from "@/lib/db";import {internalError,noStoreJson} from "@/lib/api";
export const dynamic="force-dynamic";
export async function GET(){try{const data=await db.signal.findMany({include:{match:true,agent:true},orderBy:{createdAt:"desc"},take:100});return noStoreJson({success:true,data})}catch(error){return internalError(error,"Signals unavailable")}}
