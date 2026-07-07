import type {Config} from "tailwindcss";
export default {content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"],theme:{extend:{colors:{ink:"#05070d",panel:"#0b101b",lime:"#a3ff12",violet:"#8b5cf6",cyan:"#39d9ff"},fontFamily:{sans:["Inter","ui-sans-serif","system-ui","sans-serif"],mono:["JetBrains Mono","Cascadia Code","Consolas","ui-monospace","monospace"]}}},plugins:[]} satisfies Config;
