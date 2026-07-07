import {oddsFromProbability} from "@/lib/probability";
export const agentSeeds=[
 {id:"agent_momentum",name:"Momentum Agent",slug:"momentum",strategyType:"Trend-following",description:"Confirms sustained directional probability movement.",riskStyle:"Directional"},
 {id:"agent_contrarian",name:"Contrarian Agent",slug:"contrarian",strategyType:"Overreaction detection",description:"Detects sharp short-window repricing.",riskStyle:"Counter-trend"},
 {id:"agent_volatility",name:"Volatility Agent",slug:"volatility",strategyType:"Market instability detection",description:"Measures combined market displacement.",riskStyle:"Market-wide"},
 {id:"agent_context",name:"Context Agent",slug:"context",strategyType:"Score + time aware",description:"Combines match state with market movement.",riskStyle:"Contextual"}
];
export const matchSeeds=[
 ["MATCH_001","Morocco","Spain",1,1,76,"Signal Detected","Elevated",[38,34,28]],
 ["MATCH_002","Argentina","France",2,1,68,"Watching","Medium",[57,25,18]],
 ["MATCH_003","Brazil","Germany",0,0,42,"Stable","Low",[46,29,25]],
 ["MATCH_004","England","Portugal",1,2,81,"High Volatility","High",[22,25,53]],
 ["MATCH_005","Netherlands","Italy",1,1,73,"Watching","Medium",[35,38,27]],
 ["MATCH_006","USA","Mexico",0,1,57,"Signal Detected","Elevated",[26,31,43]]
] as const;
export function initialSnapshots(matchId:string,minute:number,base:readonly number[]){return[-10,-5,0].map((offset,i)=>{const h=base[0]+(i-2)*3,d=base[1]+(2-i)*1.5,a=100-h-d;return{matchId,minute:minute+offset,timestamp:new Date(Date.now()+(i-2)*300000),homeOdds:oddsFromProbability(h),drawOdds:oddsFromProbability(d),awayOdds:oddsFromProbability(a),homeProbability:h,drawProbability:d,awayProbability:a,source:"demo"}})}
