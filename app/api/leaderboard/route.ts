import {db} from "@/lib/db";import {internalError,noStoreJson} from "@/lib/api";
export const dynamic="force-dynamic";
export async function GET(){try{const data=await db.agentScore.findMany({include:{agent:true},orderBy:{score:"desc"}});return noStoreJson({success:true,data})}catch(error){return internalError(error,"Leaderboard unavailable")}}
