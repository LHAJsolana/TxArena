import "./globals.css";import {Navbar,Footer} from "@/components/shell";import {env} from "@/lib/env";
export const metadata={title:"TxArena — Autonomous World Cup Agent Arena",description:"Transparent autonomous market-intelligence signal evaluation."};
export default function RootLayout({children}:{children:React.ReactNode}){const live=Boolean(env.mode==="live"&&env.txlineBaseUrl&&env.txlineGuestJwt&&env.txlineApiToken);return <html lang="en"><body className="font-sans"><Navbar live={live}/><main>{children}</main><Footer/></body></html>}
