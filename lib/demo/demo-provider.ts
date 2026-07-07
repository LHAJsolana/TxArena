import {db} from "@/lib/db";
import {agents} from "@/lib/agents";
import {clamp,oddsFromProbability} from "@/lib/probability";
import {evolveScore} from "@/lib/scoring";

export async function runDemoCycle(){
 const matches=await db.match.findMany({where:{status:"LIVE"},include:{snapshots:{orderBy:{timestamp:"asc"}}},orderBy:{id:"asc"}});
 const cycle=Math.floor((await db.oddsSnapshot.count())/Math.max(matches.length,1));let snapshotsCreated=0,signalsGenerated=0,logsCreated=0;
 for(const [index,match] of matches.entries()){
  const previous=match.snapshots.at(-1);if(!previous)continue;
  const sharp=index===1&&cycle%3===0;const context=index===0&&match.minute>=70;const wave=Math.sin((cycle+index)*1.37);
  let homeDelta=sharp?11.6:wave*2.2;let drawDelta=context?5.1:sharp?-4.2:-wave*.75;
  let home=clamp(previous.homeProbability+homeDelta,8,82);let draw=clamp(previous.drawProbability+drawDelta,8,70);let away=100-home-draw;
  if(away<8){away=8;home=100-draw-away}if(away>82){away=82;home=100-draw-away}
  const minute=Math.min(90,match.minute+2);const totalMovement=Math.abs(home-previous.homeProbability)+Math.abs(draw-previous.drawProbability)+Math.abs(away-previous.awayProbability);
  const marketState=totalMovement>15?"High Volatility":totalMovement>8?"Signal Detected":totalMovement>3?"Watching":"Stable";
  const volatilityLevel=totalMovement>22?"Extreme":totalMovement>15?"High":totalMovement>5?"Medium":"Low";
  const scoreEvent=cycle%7===0&&minute>55&&minute<88;const homeScore=match.homeScore+(scoreEvent&&home>away&&index%2===0?1:0);const awayScore=match.awayScore+(scoreEvent&&away>home&&index%2===1?1:0);
  const snapshot=await db.oddsSnapshot.create({data:{matchId:match.id,minute,homeOdds:oddsFromProbability(home),drawOdds:oddsFromProbability(draw),awayOdds:oddsFromProbability(away),homeProbability:home,drawProbability:draw,awayProbability:away,source:"demo"}});snapshotsCreated++;
  const updated={...match,minute,homeScore,awayScore,marketState,volatilityLevel};await db.match.update({where:{id:match.id},data:{minute,homeScore,awayScore,marketState,volatilityLevel}});
  await db.systemLog.createMany({data:[{matchId:match.id,type:"DEMO_REPLAY",message:`Demo replay snapshot generated for ${match.homeTeam} vs ${match.awayTeam} at ${minute}'`},{matchId:match.id,type:"NORMALIZATION",message:`Odds normalized: home ${home.toFixed(1)}%, draw ${draw.toFixed(1)}%, away ${away.toFixed(1)}%`}]});logsCreated+=2;
  const all=[...match.snapshots,snapshot];
  for(const runner of agents){
   const candidates=runner.run({match:updated,latestSnapshot:snapshot,previousSnapshots:all.slice(0,-1),allSnapshots:all});const agent=await db.agent.findUnique({where:{slug:runner.slug}});if(!agent)continue;
   for(const candidate of candidates){const{agentSlug:_,...persisted}=candidate;await db.signal.create({data:{...persisted,matchId:match.id,agentId:agent.id,status:"Pending"}});signalsGenerated++;await db.match.update({where:{id:match.id},data:{latestSignal:`${runner.name}: ${candidate.signalType.replaceAll("_"," ")}`}});await db.systemLog.create({data:{matchId:match.id,agentId:agent.id,type:"AGENT_SIGNAL",message:`${runner.name} detected ${candidate.strength.toFixed(1)} point ${candidate.outcome} movement · ${candidate.confidence.toFixed(0)}% confidence`,metadata:JSON.stringify({signalType:candidate.signalType,outcome:candidate.outcome,strength:candidate.strength})}});logsCreated++}
  }
 }
 const scores=await db.agentScore.findMany();for(const score of scores){const count=await db.signal.count({where:{agentId:score.agentId}});const evolved=evolveScore(score,Math.max(1,count-score.signalsGenerated),cycle);await db.agentScore.update({where:{agentId:score.agentId},data:{...evolved,signalsGenerated:count}})}
 await db.systemLog.create({data:{type:"SCORING_UPDATE",message:`Leaderboard updated after ${signalsGenerated} generated signals`}});logsCreated++;
 return{matchesProcessed:matches.length,snapshotsCreated,signalsGenerated,logsCreated,mode:"demo" as const};
}
