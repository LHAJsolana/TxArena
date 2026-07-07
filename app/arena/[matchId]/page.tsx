import {BattleClient} from "@/components/battle-client";export default async function Page({params}:{params:Promise<{matchId:string}>}){return <BattleClient id={(await params).matchId}/>}
