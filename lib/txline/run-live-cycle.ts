import "server-only";
import {db} from "@/lib/db";
import {agents} from "@/lib/agents";
import {evolveScore} from "@/lib/scoring";

export async function runLiveCycle(){
 const matches=await db.match.findMany({where:{id:{startsWith:"TXLINE_"},status:"LIVE"},include:{snapshots:{orderBy:{timestamp:"asc"}}},orderBy:{id:"asc"}});
 let signalsGenerated=0,logsCreated=0;
 for(const match of matches){
  const latestSnapshot=match.snapshots.at(-1);if(!latestSnapshot)continue;
  for(const runner of agents){
   const agent=await db.agent.findUnique({where:{slug:runner.slug}});if(!agent)continue;
   const candidates=runner.run({match,latestSnapshot,previousSnapshots:match.snapshots.slice(0,-1),allSnapshots:match.snapshots});
   for(const candidate of candidates){const{agentSlug:_,...data}=candidate;await db.signal.create({data:{...data,matchId:match.id,agentId:agent.id,status:"Pending"}});signalsGenerated++;await db.match.update({where:{id:match.id},data:{latestSignal:`${runner.name}: ${candidate.signalType.replaceAll("_"," ")}`}});await db.systemLog.create({data:{matchId:match.id,agentId:agent.id,type:"AGENT_SIGNAL",message:`${runner.name} analyzed stored TxLINE data and detected ${candidate.strength.toFixed(1)} point ${candidate.outcome} movement · ${candidate.confidence.toFixed(0)}% confidence`,metadata:JSON.stringify({source:"txline",signalType:candidate.signalType,outcome:candidate.outcome,strength:candidate.strength})}});logsCreated++}
  }
 }
 const scores=await db.agentScore.findMany();for(const score of scores){const count=await db.signal.count({where:{agentId:score.agentId}});const evolved=evolveScore(score,Math.max(1,count-score.signalsGenerated),Math.max(1,matches.length));await db.agentScore.update({where:{agentId:score.agentId},data:{...evolved,signalsGenerated:count}})}
 await db.systemLog.create({data:{type:"SCORING_UPDATE",message:`Live TxLINE cycle evaluated ${matches.length} stored matches and generated ${signalsGenerated} signals`,metadata:JSON.stringify({source:"txline",matchesProcessed:matches.length,signalsGenerated})}});logsCreated++;
 return{matchesProcessed:matches.length,snapshotsCreated:0,signalsGenerated,logsCreated,mode:"live" as const};
}
