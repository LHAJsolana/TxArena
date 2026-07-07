import {getTxLineStatus} from "@/lib/txline/ingestion";import {internalError,noStoreJson} from "@/lib/api";
export const dynamic="force-dynamic";
export async function GET(){try{return noStoreJson(await getTxLineStatus())}catch(error){return internalError(error,"TxLINE status unavailable")}}
