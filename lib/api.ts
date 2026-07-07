import {NextResponse} from "next/server";
export function noStoreJson<T>(body:T,init?:ResponseInit){const headers=new Headers(init?.headers);headers.set("Cache-Control","no-store");return NextResponse.json(body,{...init,headers})}
export function internalError(error:unknown,message="Internal server error"){console.error(error);return noStoreJson({success:false,error:message},{status:500})}
