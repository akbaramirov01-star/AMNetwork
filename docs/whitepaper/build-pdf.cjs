const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+__dirname+'/whitepaper-en.html',{waitUntil:'load'});
const hf='font-family:DejaVu Serif,serif;font-size:7.5pt;color:#6b6b6b;width:100%;margin:0 22mm;';
await p.pdf({path:__dirname+'/../../AM_Network_Whitepaper_v1_EN.pdf',format:'Letter',printBackground:true,displayHeaderFooter:true,
 margin:{top:'22mm',bottom:'22mm',left:'22mm',right:'22mm'},
 headerTemplate:`<div style="${hf}border-bottom:0.6pt solid #B8860B;padding-bottom:3pt">AM NETWORK · WHITEPAPER · VERSION 1.1 · OCTOBER 2026</div>`,
 footerTemplate:`<div style="${hf}border-top:0.6pt solid #B8860B;padding-top:3pt;display:flex;justify-content:space-between"><span>amnetwork.io · contact@amnetwork.io</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`});
await b.close();})();
