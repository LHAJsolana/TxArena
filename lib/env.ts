type AppMode="demo"|"live";
function required(name:string){const value=process.env[name]?.trim();if(!value)throw new Error(`Missing required environment variable: ${name}`);return value}
const rawMode=process.env.NEXT_PUBLIC_APP_MODE?.trim()||"demo";
if(rawMode!=="demo"&&rawMode!=="live")throw new Error("NEXT_PUBLIC_APP_MODE must be either 'demo' or 'live'");
const txlineBaseUrl=process.env.TXLINE_BASE_URL?.trim();if(txlineBaseUrl){try{new URL(txlineBaseUrl)}catch{throw new Error("TXLINE_BASE_URL must be a valid absolute URL")}}
const preferredApiToken=process.env.TXLINE_API_TOKEN?.trim();const fallbackApiToken=process.env.TXLINE_API_KEY?.trim();
export const env={databaseUrl:required("DATABASE_URL"),mode:rawMode as AppMode,txlineBaseUrl,txlineGuestJwt:process.env.TXLINE_GUEST_JWT?.trim(),txlineApiToken:preferredApiToken||fallbackApiToken,txlineApiTokenSource:preferredApiToken?"TXLINE_API_TOKEN" as const:fallbackApiToken?"TXLINE_API_KEY fallback" as const:null,cycleToken:process.env.AGENT_CYCLE_TOKEN?.trim()};
