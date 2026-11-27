import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
const root=process.cwd(),out=path.join(root,'verification-output');await fs.mkdir(out,{recursive:true});
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),p=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!p.startsWith(root+path.sep))throw Error('path');const data=await fs.readFile(p);res.setHeader('Content-Type',p.endsWith('.html')?'text/html; charset=utf-8':p.endsWith('.js')?'application/javascript; charset=utf-8':'application/octet-stream');res.end(data)}catch{res.statusCode=404;res.end('not found')}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={ok:false,errors:[],cases:[],checks:[],screenshots:[]};let page;
async function shot(name){const p=path.join(out,name+'.png');const uri=await page.evaluate(()=>earthVerify.screenshot());await fs.writeFile(p,Buffer.from(uri.split(',')[1],'base64'));const stats=await sharp(p).stats();if(stats.channels.slice(0,3).every(c=>c.stdev<3))throw Error('blank render '+name);report.screenshots.push(name+'.png');return p}
function check(d){if(d.screenOverflow>.001||d.invalidBounds||d.tipErrorM>.00001||!d.linkValid||d.webglErrors.length||d.meshCount<10||d.triangles<100)throw Error('Invalid 3D frame '+JSON.stringify(d));report.cases.push(d)}
try{
 page=await browser.newPage({viewport:{width:960,height:440},deviceScaleFactor:1});page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
 // Pin the exact library version to the local npm installation, avoiding a CDN failure during CI.
 await page.route('**/three@0.160.1/build/three.min.js',route=>route.fulfill({path:path.join(root,'node_modules/three/build/three.min.js'),contentType:'application/javascript'}));
 await page.goto('http://127.0.0.1:'+server.address().port+'/?verify=1');await page.waitForFunction(()=>window.earthVerify!==undefined,undefined,{timeout:20000});
 if(!await page.evaluate(()=>earthVerify.ready))throw Error('WebGL initialization failed');report.photos=await page.evaluate(()=>earthVerify.readyPhotos());if(!report.photos)throw Error('vendored photo assets failed');console.log('PHOTO_ASSETS_READY '+report.photos);
 for(let m=0;m<7;m++)for(let a=0;a<8;a++){const d=await page.evaluate(o=>earthVerify.show(o),{machine:m,attachment:a});check(d);if(m===3||a===0)await shot('outside-'+m+'-'+a);if(a===7)console.log('verified machine '+m)}
 for(let m=0;m<7;m++){check(await page.evaluate(o=>earthVerify.show(o),{machine:m,attachment:0,cab:true}));await shot('cab-'+m)}
 for(let a of [0,1,2,5]){const start=await page.evaluate(a=>earthVerify.show({machine:3,attachment:a,cab:true}),a);let touch=await page.evaluate(()=>earthVerify.step({b:-.375},150));if(touch.soil>1e-8)throw Error('soil intake from lowering only');let dig=await page.evaluate(()=>earthVerify.step({a:-.44,k:-.75,b:-.094},110));let stop=await page.evaluate(()=>earthVerify.step({},60));report.checks.push({attachment:a,touch:touch.soil,dug:dig.soil,stationary:stop.soil-dig.soil});if(stop.soil>dig.soil+1e-8)throw Error('soil gained while stationary');await shot('dig-'+a)}
 // Camera pose used for inspection of the bucket mouth and cutting edge.
 check(await page.evaluate(()=>earthVerify.show({machine:3,attachment:1,cab:true,b:.55,a:-2.05,k:-.55})));await shot('cab-close');
 // Actual mobile-portrait layout, as well as landscape.
 await page.setViewportSize({width:440,height:956});check(await page.evaluate(()=>earthVerify.show({machine:3,attachment:1,cab:true,ui:true})));await shot('portrait');
 if(report.errors.length)throw Error('browser errors: '+report.errors.join('; '));report.ok=true;
}catch(e){report.errors.push(String(e.stack||e));if(page)try{await page.screenshot({path:path.join(out,'failure.png')})}catch{}}
finally{await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log('EARTH_VERIFY_REPORT '+JSON.stringify({ok:report.ok,cases:report.cases.length,errors:report.errors,checks:report.checks,photos:report.photos}));const names=['outside-0-0','outside-3-0','outside-5-0','outside-3-1','outside-3-6','cab-3','dig-0','cab-close'];const tiles=[];for(const n of names){try{tiles.push(await sharp(path.join(out,n+'.png')).resize(360,165,{fit:'fill'}).jpeg().toBuffer())}catch{}}if(tiles.length){const cols=2,rows=Math.ceil(tiles.length/cols);const sheet=await sharp({create:{width:720,height:165*rows,channels:3,background:'#111'}}).composite(tiles.map((input,i)=>({input,left:i%cols*360,top:Math.floor(i/cols)*165}))).jpeg({quality:62}).toBuffer();await fs.writeFile(path.join(out,'contact-sheet.jpg'),sheet);const b64=sheet.toString('base64');for(let i=0;i<b64.length;i+=3500)console.log('EARTH_VERIFY_IMAGE '+i+' '+b64.slice(i,i+3500))}await browser.close();server.close();if(!report.ok)process.exitCode=1}
