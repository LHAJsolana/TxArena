import {db} from "@/lib/db";
import {env} from "@/lib/env";
import {noStoreJson} from "@/lib/api";
export const dynamic="force-dynamic";
export async function GET(){try{await db.$queryRaw`SELECT 1`;return noStoreJson({status:"ok",mode:env.mode,timestamp:new Date().toISOString()})}catch(error){console.error("Health check failed",error);return noStoreJson({status:"unhealthy",timestamp:new Date().toISOString()},{status:503})}}
