import {runDemoCycle} from "@/lib/demo/demo-provider";
import {runLiveCycle} from "@/lib/txline/run-live-cycle";
import {env} from "@/lib/env";
import {NextResponse} from "next/server";

type CycleResult=Awaited<ReturnType<typeof runDemoCycle>>|Awaited<ReturnType<typeof runLiveCycle>>;
let activeCycle:Promise<CycleResult>|null=null;let lastRun=0;
export async function POST(request:Request){
 const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
 if(env.cycleToken&&token!==env.cycleToken)return NextResponse.json({success:false,error:"Unauthorized"},{status:401});
 if(Date.now()-lastRun<2000)return NextResponse.json({success:false,error:"Please wait before starting another cycle"},{status:429,headers:{"Retry-After":"2"}});
 if(activeCycle)return NextResponse.json({success:false,error:"An agent cycle is already running"},{status:409});
 try{lastRun=Date.now();activeCycle=env.mode==="live"?runLiveCycle():runDemoCycle();return NextResponse.json({success:true,data:await activeCycle})}
 catch(error){console.error("Agent cycle failed",error);return NextResponse.json({success:false,error:"Cycle failed"},{status:500})}
 finally{activeCycle=null}
}
