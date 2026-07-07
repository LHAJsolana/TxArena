import {db} from "../lib/db";
import {runDemoCycle} from "../lib/demo/demo-provider";

async function main(){
 const before={snapshots:await db.oddsSnapshot.count(),signals:await db.signal.count(),logs:await db.systemLog.count()};
 const cycles=[];for(let index=0;index<3;index++)cycles.push(await runDemoCycle());
 const after={snapshots:await db.oddsSnapshot.count(),signals:await db.signal.count(),logs:await db.systemLog.count()};
 const byAgent=await db.signal.groupBy({by:["agentId"],_count:{_all:true}});
 console.log(JSON.stringify({before,cycles,after,byAgent},null,2));
}
main().finally(()=>db.$disconnect());
