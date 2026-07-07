import "server-only";
import {env} from "@/lib/env";

export type TxLineFixture={Ts:number;StartTime:number;Competition:string;CompetitionId:number;FixtureGroupId:number;Participant1Id:number;Participant1:string;Participant2Id:number;Participant2:string;FixtureId:number;Participant1IsHome:boolean};
export type TxLineOdds={FixtureId:number;MessageId:string;Ts:number;Bookmaker:string;BookmakerId:number;SuperOddsType:string;InRunning:boolean;GameState:string;MarketParameters:string;MarketPeriod:string;PriceNames:string[];Prices:number[];Pct:string[]};
export type TxLineScore={fixtureId:number;gameState?:string;ts?:number;clock?:{running?:boolean;seconds?:number};score?:unknown;data?:unknown};
const FIXTURES_ENDPOINT="/api/fixtures/snapshot";
export const TXLINE_AUTH_ERROR="Live TxLINE sync requires both TXLINE_GUEST_JWT and TXLINE_API_TOKEN. Generate a guest JWT with POST /auth/guest/start, then activate your subscription to obtain the API token.";

export function txLineConfiguration(){return{mode:env.mode,configured:Boolean(env.txlineBaseUrl&&env.txlineGuestJwt&&env.txlineApiToken),baseUrlPresent:Boolean(env.txlineBaseUrl),guestJwtPresent:Boolean(env.txlineGuestJwt),apiTokenPresent:Boolean(env.txlineApiToken),apiTokenSource:env.txlineApiTokenSource,authFlow:"guest-jwt-plus-activated-api-token" as const}}

export class TxLineClient{
 private origin(){if(!env.txlineBaseUrl)throw new Error("TxLINE base URL is not configured");return env.txlineBaseUrl.replace(/\/+$/,"").replace(/\/api$/i,"")}
 private async request(path:string,init:RequestInit,headers:Headers){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);try{const response=await fetch(`${this.origin()}${path}`,{...init,headers,signal:controller.signal,cache:"no-store"});if(!response.ok)throw new Error(`TxLINE ${path} returned HTTP ${response.status}`);return response}finally{clearTimeout(timeout)}}
 async startGuestSession(){const headers=new Headers({Accept:"application/json"});const response=await this.request("/auth/guest/start",{method:"POST"},headers);const body=await response.json() as {token?:unknown};if(typeof body.token!=="string"||!body.token)throw new Error("TxLINE guest session did not return a token");return body.token}
 private async get<T>(path:string){if(!env.txlineGuestJwt||!env.txlineApiToken)throw new Error(TXLINE_AUTH_ERROR);const headers=new Headers({Accept:"application/json",Authorization:`Bearer ${env.txlineGuestJwt}`,"X-Api-Token":env.txlineApiToken});const response=await this.request(path,{method:"GET"},headers);return response.json() as Promise<T>}
 getFixtures(){return this.get<TxLineFixture[]>(FIXTURES_ENDPOINT)}
 getOdds(fixtureId:number){return this.get<TxLineOdds[]>(`/api/odds/snapshot/${fixtureId}`)}
 getScores(fixtureId:number){return this.get<TxLineScore[]>(`/api/scores/snapshot/${fixtureId}`)}
}

export const txline=new TxLineClient();
export async function startTxLineGuestSession(){return txline.startGuestSession()}
export const txLineEndpoints={guestSession:"/auth/guest/start",fixtures:FIXTURES_ENDPOINT,odds:"/api/odds/snapshot/{fixtureId}",scores:"/api/scores/snapshot/{fixtureId}"};
