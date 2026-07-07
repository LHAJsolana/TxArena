export type Snapshot={id?:string;matchId:string;timestamp:string|Date;minute:number;homeOdds:number;drawOdds:number;awayOdds:number;homeProbability:number;drawProbability:number;awayProbability:number;source:string};
export type MatchInput={id:string;homeTeam:string;awayTeam:string;homeScore:number;awayScore:number;minute:number;status:string;marketState:string;volatilityLevel:string;latestSignal?:string|null};
export type SignalCandidate={agentSlug:string;signalType:string;outcome:string;confidence:number;strength:number;reasoning:string};
export type AgentInput={match:MatchInput;latestSnapshot:Snapshot;previousSnapshots:Snapshot[];allSnapshots:Snapshot[]};
export interface AgentRunner{id:string;name:string;slug:string;strategyType:string;run(input:AgentInput):SignalCandidate[]}
export type ApiResponse<T>={success:boolean;data?:T;error?:string};
