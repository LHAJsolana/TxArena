import "server-only";
import {db} from "@/lib/db";
import {normalizeOdds,oddsFromProbability} from "@/lib/probability";
import {txline,txLineConfiguration,txLineEndpoints,TxLineFixture,TxLineOdds,TxLineScore,TXLINE_AUTH_ERROR} from "./client";

export type TxLineStatus={mode:"demo"|"live";configured:boolean;baseUrlPresent:boolean;guestJwtPresent:boolean;apiTokenPresent:boolean;apiTokenSource:"TXLINE_API_TOKEN"|"TXLINE_API_KEY fallback"|null;authFlow:"guest-jwt-plus-activated-api-token";lastFetchAt:string|null;endpointUsed:string|null;connectionStatus:"not_configured"|"ready"|"connected"|"error";error?:string};
type SyncResult={fixturesFetched:number;matchesStored:number;snapshotsStored:number;endpointUsed:string;fetchedAt:string};
let activeSync:Promise<SyncResult>|null=null;

function safeMessage(error:unknown){if(error instanceof DOMException&&error.name==="AbortError")return"TxLINE request timed out";if(error instanceof Error&&error.message===TXLINE_AUTH_ERROR)return error.message;if(error instanceof Error&&/^TxLINE .+ returned HTTP \d+$/.test(error.message))return error.message;return"TxLINE ingestion failed; verify credentials, subscription activation, and endpoint configuration"}
function latestOneXTwo(entries:TxLineOdds[]){
 const sorted=[...entries].sort((a,b)=>(b.Ts||0)-(a.Ts||0));
 for(const row of sorted){const names=row.PriceNames?.map(x=>x.toLowerCase())||[];const index=(values:string[])=>names.findIndex(x=>values.includes(x));const hi=index(["1","home","participant1"]),di=index(["x","draw"]),ai=index(["2","away","participant2"]);if(hi<0||di<0||ai<0)continue;
  const pct=[row.Pct?.[hi],row.Pct?.[di],row.Pct?.[ai]].map(Number);if(pct.every(Number.isFinite)){const scale=pct.reduce((a,b)=>a+b,0)<=2?100:1;const probabilities=pct.map(x=>x*scale);const total=probabilities.reduce((a,b)=>a+b,0);if(total>0){const normalized=probabilities.map(x=>x/total*100);const raw=[row.Prices?.[hi],row.Prices?.[di],row.Prices?.[ai]].map(Number);const odds=raw.every(x=>Number.isFinite(x)&&x>1)?raw:normalized.map(oddsFromProbability);return{odds,probabilities:normalized,timestamp:row.Ts,gameState:row.GameState}}}
  const prices=[row.Prices?.[hi],row.Prices?.[di],row.Prices?.[ai]].map(Number);if(prices.every(x=>Number.isFinite(x)&&x>1)){const normalized=normalizeOdds(prices[0],prices[1],prices[2]);return{odds:prices,probabilities:[normalized.homeProbability,normalized.drawProbability,normalized.awayProbability],timestamp:row.Ts,gameState:row.GameState}}
 }
 return null;
}
function scoreValue(value:unknown,participant:"Participant1"|"Participant2"){if(!value||typeof value!=="object")return 0;const side=(value as Record<string,unknown>)[participant];if(!side||typeof side!=="object")return 0;const total=(side as Record<string,unknown>).Total;if(typeof total==="number")return total;if(total&&typeof total==="object"){const score=(total as Record<string,unknown>).Score;return typeof score==="number"?score:0}return 0}
function latestScore(rows:TxLineScore[]){return[...rows].sort((a,b)=>(b.ts||0)-(a.ts||0))[0]}
function statusFromState(gameState?:string){const state=(gameState||"NS").toUpperCase();return["F","FET","FPE"].includes(state)?"FINISHED":["NS","P","C"].includes(state)?"SCHEDULED":"LIVE"}
function orderedTeams(fixture:TxLineFixture){return fixture.Participant1IsHome?[fixture.Participant1,fixture.Participant2]:[fixture.Participant2,fixture.Participant1]}
function txDate(timestamp:number){return new Date(timestamp<1_000_000_000_000?timestamp*1000:timestamp)}

async function record(type:"TXLINE_FETCH"|"SYSTEM",message:string,metadata:Record<string,unknown>){await db.systemLog.create({data:{type,message,metadata:JSON.stringify(metadata)}})}
export async function getTxLineStatus():Promise<TxLineStatus>{
 const config=txLineConfiguration();const latest=await db.systemLog.findFirst({where:{type:"TXLINE_FETCH"},orderBy:{createdAt:"desc"}});let metadata:Record<string,unknown>={};try{metadata=latest?.metadata?JSON.parse(latest.metadata):{}}catch{}
 const success=metadata.success===true,error=typeof metadata.error==="string"?metadata.error:undefined;
 const configError=!config.configured?TXLINE_AUTH_ERROR:undefined;return{...config,lastFetchAt:typeof metadata.fetchedAt==="string"?metadata.fetchedAt:null,endpointUsed:typeof metadata.endpointUsed==="string"?metadata.endpointUsed:null,connectionStatus:!config.configured?"not_configured":success?"connected":error?"error":"ready",...((configError||error)?{error:configError||error}:{})};
}

async function performSync():Promise<SyncResult>{
 const config=txLineConfiguration();
 const fetchedAt=new Date().toISOString();
 try{
  if(!config.configured)throw new Error(TXLINE_AUTH_ERROR);const allFixtures=await txline.getFixtures();const fixtures=allFixtures.filter(x=>/world cup/i.test(x.Competition)).slice(0,16);let matchesStored=0,snapshotsStored=0;
  for(const fixture of fixtures){
   const [oddsResult,scoresResult]=await Promise.allSettled([txline.getOdds(fixture.FixtureId),txline.getScores(fixture.FixtureId)]);const market=oddsResult.status==="fulfilled"?latestOneXTwo(oddsResult.value):null;const score=scoresResult.status==="fulfilled"?latestScore(scoresResult.value):undefined;const[homeTeam,awayTeam]=orderedTeams(fixture);const participant1Score=scoreValue(score?.score,"Participant1"),participant2Score=scoreValue(score?.score,"Participant2");const homeScore=fixture.Participant1IsHome?participant1Score:participant2Score,awayScore=fixture.Participant1IsHome?participant2Score:participant1Score;const gameState=score?.gameState||market?.gameState;const id=`TXLINE_${fixture.FixtureId}`;
   await db.match.upsert({where:{id},create:{id,homeTeam,awayTeam,homeScore,awayScore,minute:Math.max(0,Math.floor((score?.clock?.seconds||0)/60)),status:statusFromState(gameState),marketState:market?"TxLINE Synced":"Awaiting Odds",volatilityLevel:"Monitoring",latestSignal:"TxLINE feed synchronized"},update:{homeTeam,awayTeam,homeScore,awayScore,minute:Math.max(0,Math.floor((score?.clock?.seconds||0)/60)),status:statusFromState(gameState),marketState:market?"TxLINE Synced":"Awaiting Odds",volatilityLevel:"Monitoring"}});matchesStored++;
   if(market){const[homeProbability,drawProbability,awayProbability]=market.probabilities;const timestamp=txDate(market.timestamp);const existing=await db.oddsSnapshot.findFirst({where:{matchId:id,timestamp},select:{id:true}});if(!existing){await db.oddsSnapshot.create({data:{matchId:id,timestamp,minute:Math.max(0,Math.floor((score?.clock?.seconds||0)/60)),homeOdds:market.odds[0],drawOdds:market.odds[1],awayOdds:market.odds[2],homeProbability,drawProbability,awayProbability,source:"txline"}});snapshotsStored++}}
  }
  const result={fixturesFetched:fixtures.length,matchesStored,snapshotsStored,endpointUsed:txLineEndpoints.fixtures,fetchedAt};await record("TXLINE_FETCH",`TxLINE sync completed: ${matchesStored} matches and ${snapshotsStored} new odds snapshots`,{success:true,...result});return result;
 }catch(error){const message=safeMessage(error);await record("TXLINE_FETCH",`TxLINE sync failed: ${message}`,{success:false,error:message,endpointUsed:txLineEndpoints.fixtures,fetchedAt});throw new Error(message)}
}

export function syncTxLine(){if(activeSync)return activeSync;activeSync=performSync().finally(()=>{activeSync=null});return activeSync}
