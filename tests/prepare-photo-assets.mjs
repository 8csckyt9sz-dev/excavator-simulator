import fs from 'node:fs/promises';
import sharp from 'sharp';
const target='models/photo-assets.js';
// Reproduce the exact committed assets when they are already present.
const current=await fs.readFile(target,'utf8').catch(()=> '');
if(current.includes('data:image/jpeg;base64,')){console.log('USING_VENDORED_PHOTOS');process.exit(0)}
async function get(url){const r=await fetch(url,{headers:{'User-Agent':'EARTHWORK simulator visual verification (Poly Haven CC0 assets)'}});if(!r.ok)throw Error(r.status+' '+url);return Buffer.from(await r.arrayBuffer())}
function urls(x,a=[]){if(typeof x==='string'&&x.startsWith('https://'))a.push(x);else if(x&&typeof x==='object')for(const v of Object.values(x))urls(v,a);return a}
async function source(id,suffix,direct){try{return await get(direct)}catch(e){const j=JSON.parse((await get('https://api.polyhaven.com/files/'+id)).toString('utf8'));const url=urls(j).find(v=>v.endsWith(suffix));if(!url)throw e;return get(url)}}
function decodeHDR(buf){
 let p=0;function line(){let a=p;while(p<buf.length&&buf[p]!==10)p++;return buf.subarray(a,p++).toString('ascii').trim()}
 let l;do{l=line();if(p>=buf.length)throw Error('HDR header')}while(l);const m=line().match(/-Y (\d+) \+X (\d+)/);if(!m)throw Error('HDR orientation');const h=+m[1],w=+m[2],rgb=Buffer.alloc(w*h*3),scan=new Uint8Array(w*4);
 for(let y=0;y<h;y++){if(buf[p++]!==2||buf[p++]!==2||((buf[p++]<<8)|buf[p++])!==w)throw Error('HDR scanline');for(let c=0;c<4;c++){let x=0;while(x<w){const n=buf[p++];if(n>128){const count=n-128,v=buf[p++];scan.fill(v,c*w+x,c*w+x+count);x+=count}else{for(let i=0;i<n;i++)scan[c*w+x++]=buf[p++]}}}
 for(let x=0;x<w;x++){const e=scan[3*w+x],f=e?Math.pow(2,e-136):0;for(let c=0;c<3;c++){let v=scan[c*w+x]*f*.85;v=(v*(2.51*v+.03))/(v*(2.43*v+.59)+.14);rgb[(y*w+x)*3+c]=Math.round(255*Math.pow(Math.max(0,Math.min(1,v)),1/2.2))}}}
 return {rgb,w,h}
}
try{
 const g=await source('dirt_aerial_02','dirt_aerial_02_diff_1k.jpg','https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/dirt_aerial_02/dirt_aerial_02_diff_1k.jpg');
 const sky=await source('suburban_field_02','suburban_field_02_1k.hdr','https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/suburban_field_02_1k.hdr');
 const d=decodeHDR(sky);
 const ground=await sharp(g).resize(768,768,{fit:'fill'}).jpeg({quality:82}).toBuffer();
 const panorama=await sharp(d.rgb,{raw:{width:d.w,height:d.h,channels:3}}).resize(1024,512).jpeg({quality:82}).toBuffer();
 const photos={ground:'data:image/jpeg;base64,'+ground.toString('base64'),sky:'data:image/jpeg;base64,'+panorama.toString('base64')};
 const js='/* Poly Haven CC0: dirt_aerial_02 and suburban_field_02. */\nconst EARTH_PHOTOS='+JSON.stringify(photos)+';\n';
 await fs.writeFile(target,js);const b64=Buffer.from(js).toString('base64');for(let i=0;i<b64.length;i+=3000)console.log('EARTH_ASSET '+i+' '+b64.slice(i,i+3000));
}catch(e){console.log('PHOTO_FETCH_FAILED '+String(e));await fs.writeFile(target,'/* Optional real photo assets unavailable. */\n');}
