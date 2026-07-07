export function normalizeOdds(home:number,draw:number,away:number){const raw=[1/home,1/draw,1/away];const total=raw.reduce((a,b)=>a+b,0);return{homeProbability:raw[0]/total*100,drawProbability:raw[1]/total*100,awayProbability:raw[2]/total*100}}
export const oddsFromProbability=(p:number)=>Number((100/p).toFixed(2));
export const clamp=(n:number,min=0,max=100)=>Math.min(max,Math.max(min,n));
