
// Reference machine dimensions in metres. Unpublished joint positions and track lengths are approximations.
const MACHINE_PROFILES=[
 {id:'SK10SR',nominal:.03,capacity:.028,width:1.00,height:2.25,shoe:.18,track:1.38,boom:1.48,arm:.85,bucket:.40,tail:.50,deck:.54,pivot:.72,front:.32,mini:true,open:true,cabW:.60,cabD:.81},
 {id:'SK35SR',nominal:.10,capacity:.10,width:1.70,height:2.51,shoe:.30,track:2.14,boom:2.35,arm:1.32,bucket:.60,tail:.85,deck:.83,pivot:1.12,front:.42,mini:true,open:false,cabW:.76,cabD:1.04},
 {id:'SK55SR',nominal:.15,capacity:.15,width:1.96,height:2.53,shoe:.40,track:2.48,boom:2.99,arm:1.69,bucket:.65,tail:1.17,deck:.91,pivot:1.24,front:.48,mini:true,open:false,cabW:.85,cabD:1.18},
 {id:'SK75SR',nominal:.25,capacity:.28,width:2.30,height:2.53,shoe:.45,track:2.85,boom:3.82,arm:1.71,bucket:.75,tail:1.29,deck:1.02,pivot:1.42,front:.55,mini:true,open:false,cabW:.93,cabD:1.36},
 {id:'SK125SR',nominal:.45,capacity:.45,width:2.49,height:2.81,shoe:.50,track:3.53,boom:4.60,arm:2.38,bucket:.85,tail:1.49,deck:1.14,pivot:1.62,front:.67,mini:false,open:false,cabW:.98,cabD:1.42},
 {id:'SK200',nominal:.70,capacity:.80,width:2.80,height:3.01,shoe:.60,track:4.17,boom:5.65,arm:2.94,bucket:1.08,tail:2.75,deck:1.35,pivot:1.85,front:.76,mini:false,open:false,cabW:1.00,cabD:1.48},
 {id:'SK330',nominal:1.20,capacity:1.40,width:3.19,height:3.30,shoe:.60,track:4.95,boom:6.50,arm:3.30,bucket:1.40,tail:3.25,deck:1.49,pivot:2.05,front:.84,mini:false,open:false,cabW:1.05,cabD:1.55}
];
function machineProfile(s){return MACHINE_PROFILES.find(p=>Math.abs(p.nominal-Number(s.capacity))<.0001)||MACHINE_PROFILES[3]}
function rig(s){const p=machineProfile(s),sc=s.scale||1;return {p,sc,B:p.boom/sc,A:p.arm/sc,Y:p.pivot/sc,Z:p.front/sc,X:(p.width*.17)/sc}}


// Common attachment silhouettes; model-specific dimensions are in metres.
// Kobelco parts catalogue: SK75/125/200 standard; SK75/135/200 slope;
// SK35/55/75/135/200 skeleton. Other sizes and pivot offsets are estimates.
const FITS=[
 [.40,.50,.48,.09,.025,.60,.36,.32,.25,.42,3,3,3],
 [.60,.72,.70,.141,.04,.95,.55,.48,.32,.596,4,3,4],
 [.65,.82,.81,.151,.045,1.20,.62,.54,.38,.688,4,3,5],
 [.75,.99,.99,.182,.05,1.50,.74,.625,.40,.836,4,3,4],
 [.913,1.13,1.10,.252,.065,1.80,.90,.738,.55,1.104,4,3,5],
 [1.15,1.35,1.30,.327,.08,2.20,1.10,.85,.65,1.175,5,3,5],
 [1.40,1.60,1.55,.40,.09,2.40,1.25,.99,.80,1.48,5,4,6]
];
const FORMS={
 0:{shell:[[.12,-.15],[.055,.04],[.065,.23],[.18,.43],[.34,.54],[.53,.55],[.69,.48],[.82,.34],[.90,.24]],rim:[[.12,-.15],[.36,-.105],[.62,.025],[.90,.24]],tip:[.24,1.055]},
 1:{shell:[[.10,-.12],[.06,.02],[.09,.20],[.22,.33],[.38,.36],[.56,.31],[.68,.24],[.78,.18]],rim:[[.10,-.12],[.34,-.07],[.58,.07],[.78,.18]],tip:[.18,.84]},
 2:{shell:[[.12,-.15],[.045,.05],[.07,.27],[.21,.50],[.39,.60],[.57,.59],[.73,.47],[.86,.32],[.93,.24]],rim:[[.12,-.15],[.38,-.10],[.68,.055],[.93,.24]],tip:[.24,1.08]},
 5:{shell:[[.12,-.15],[.065,.04],[.08,.23],[.22,.44],[.39,.53],[.56,.53],[.72,.44],[.86,.30],[.91,.24]],rim:[[.12,-.15],[.40,-.10],[.68,.06],[.91,.24]],tip:[.24,1.055]}
};
const CAD_BUCKET_SHELL=[[.10,.058],[-.06,.181],[-.109,.268],[-.087,.356],[.002,.489],[.057,.678],[.185,.824],[.308,.919],[.443,.953],[.581,.936],[.704,.871],[1.032,.611],[1.2268,.45666]];
const BUCKET_CACHE=new Map();
function bucketSpec(s,att=s.att){
 const form=FORMS[att];if(!form)return null;
 const p=machineProfile(s),i=MACHINE_PROFILES.indexOf(p),f=FITS[i],sc=s.scale||1,key=p.id+':'+att+':'+sc;if(BUCKET_CACHE.has(key))return BUCKET_CACHE.get(key);
 const W=(att===1?f[5]:att===2?f[8]:att===5?f[9]:f[0])/sc;
 const D=(att===1?f[6]:f[1]*(att===2?1.04:1))/sc;
 const H=(att===1?f[7]:f[2]*(att===2?1.06:1))/sc;
 const zf=D/(att===1?.88:1.10),yf=H/(att===1?.63:.88);
 const cv=([z,y])=>[z*zf,y*yf];
 const shell=form.shell.map(cv),rim=form.rim.map(cv),lip=shell[shell.length-1],tip=[form.tip[0]*yf,form.tip[1]*zf];
 const gap=f[3]/sc,pin=f[4]/sc,thick=Math.max(.010,.012/sc*Math.sqrt(f[0]/.75));
 // Direction from the shell toward the open mouth, derived from the rim endpoints.
 const dy=lip[1]-rim[0][1],dz=lip[0]-rim[0][0],len=Math.hypot(dy,dz);
 const spec={att,W,D,H,shell,rim,lip,tip,gap,pin,thick,teeth:att===1?0:att===2?f[11]:att===5?f[12]:f[10],normalY:-dz/len,normalZ:dy/len};
 if(att===0||att===2){
  const zScale=D/1.39253,yScale=H/1.15;
  spec.cad=true;spec.cadZ=zScale;spec.cadY=yScale;spec.cadX=W/1.13;
  spec.shell=CAD_BUCKET_SHELL.map(([z,y])=>[z*zScale,y*yScale]);spec.lip=spec.shell[spec.shell.length-1];
  spec.rim=[spec.shell[0],spec.lip];spec.tip=[.32515*yScale,1.39253*zScale];spec.pin2Y=.40597*yScale;spec.pin2Z=-.18838*zScale;
  const dy=spec.lip[1]-spec.rim[0][1],dz=spec.lip[0]-spec.rim[0][0],len=Math.hypot(dy,dz);spec.normalY=-dz/len;spec.normalZ=dy/len;
 }
 BUCKET_CACHE.set(key,spec);return spec;
}


// Closed four-bar linkage: bucket pin, rocker pivot, dogbone and rocker.
// The two links retain fixed lengths for all bucket angles.
function linkGeometry(s,k=s.k){
 const q=bucketSpec(s),{A}=rig(s);
 const pinY=q?(q.pin2Y??-q.H*.085):-.05,pinZ=q?(q.pin2Z??q.D*.23):.18,r=Math.hypot(pinY,pinZ);
 const P={y:r*.45,z:A-r*1.0},Q={y:pinY*Math.cos(k)+pinZ*Math.sin(k),z:A-pinY*Math.sin(k)+pinZ*Math.cos(k)};
 const d=Math.hypot(Q.y-P.y,Q.z-P.z),L1=r*1.25,L2=r*1.22;
 const along=(L1*L1-L2*L2+d*d)/(2*d),perp=Math.sqrt(Math.max(0,L1*L1-along*along));
 const uy=(Q.y-P.y)/d,uz=(Q.z-P.z)/d;
 const C={y:P.y+uy*along-uz*perp,z:P.z+uz*along+uy*perp};
 return {P,Q,C,L1,L2,d,valid:d<=L1+L2+1e-9&&d>=Math.abs(L1-L2)-1e-9};
}

function createWorld(canvas){
const T=THREE, scene=new T.Scene(), renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'}), camera=new T.PerspectiveCamera(58,1,.04,450);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;
scene.background=new T.Color(0xb8d0e0);scene.fog=new T.FogExp2(0xb8c9d1,.007);
scene.add(new T.HemisphereLight(0xe1efff,0x8c7858,1.45));const sun=new T.DirectionalLight(0xffedcf,2.65);sun.position.set(-18,28,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:.5,far:80});sun.shadow.bias=-.00025;sun.shadow.normalBias=.03;scene.add(sun,sun.target);
const mat=(color,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const paint=mat(0x159d9b,.43,.23),edge=mat(0x117b79,.55,.35),steel=mat(0x343b3e,.63,.55),track=mat(0x302e29,.9,.35),shoe=mat(0x55534a,.85,.4),rubber=mat(0x15191a,.95),chrome=mat(0xcdd7dd,.20,.82),inner=mat(0x454a46,.9),seatMat=mat(0x272d30,.92),glass=new T.MeshStandardMaterial({color:0x9ab9c8,transparent:true,opacity:.14,roughness:.18,metalness:.1,depthWrite:false,side:T.DoubleSide}),screen=mat(0x193129,.5);
const v=(x,y,z)=>new T.Vector3(x,y,z);function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g}function mesh(parent,geo,m,x=0,y=0,z=0,shadow=true){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;parent.add(o);return o}function box(p,m,x,y,z,w,h,d){return mesh(p,new T.BoxGeometry(w,h,d),m,x,y,z)}function cyl(p,m,x,y,z,r,h,axis='y',r2=r){const o=mesh(p,new T.CylinderGeometry(r,r2,h,16),m,x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o}function segment(p,m,r){return mesh(p,new T.CylinderGeometry(r,r,1,12),m)}function place(o,a,b){o.position.copy(a).add(b).multiplyScalar(.5);const d=b.clone().sub(a);o.scale.y=Math.max(.001,d.length());o.quaternion.setFromUnitVectors(v(0,1,0),d.normalize())}
function extrude(p,m,points,width,x=0,y=0,z=0,bevel=.035){const sh=new T.Shape();points.forEach(([zz,yy],i)=>i?sh.lineTo(zz,yy):sh.moveTo(zz,yy));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:width,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,steps:1});g.translate(0,0,-width/2);g.rotateY(-Math.PI/2);return mesh(p,g,m,x,y,z)}

// VMC Motion Technologies CET200 (Apache-2.0). Meshes are modified in coordinate,
// scale, color and attachment layout. See models/NOTICE and models/LICENSE.
const cadCache=new Map();
function cadFile(name){
 if(cadCache.has(name))return cadCache.get(name);
 const raw=atob(EARTH_CAD[name]),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 const view=new DataView(bytes.buffer),len=view.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+len))),binary=28+len;
 if(view.getUint32(0,true)!==0x46546c67||view.getUint32(24+len,true)!==0x004e4942)throw Error('Invalid CAD GLB '+name);
 function access(i){const a=json.accessors[i],b=json.bufferViews[a.bufferView],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type],size={5121:1,5123:2,5125:4,5126:4}[a.componentType],offset=binary+(b.byteOffset||0)+(a.byteOffset||0),stride=b.byteStride||n*size,arr=a.componentType===5126?new Float32Array(a.count*n):new Uint32Array(a.count*n);
  for(let j=0;j<a.count;j++)for(let k=0;k<n;k++){let p=offset+j*stride+k*size;arr[j*n+k]=a.componentType===5126?view.getFloat32(p,true):a.componentType===5123?view.getUint16(p,true):a.componentType===5125?view.getUint32(p,true):view.getUint8(p)}return arr}
 const result={json,access};cadCache.set(name,result);return result;
}
function cadMesh(parent,name,index,transform,m,flip=false){
 const {json,access}=cadFile(name);for(const primitive of json.meshes[index].primitives){if(primitive.mode!==undefined&&primitive.mode!==4)continue;const data=access(primitive.attributes.POSITION),verts=new Float32Array(data.length);
 for(let i=0;i<data.length;i+=3){let p=transform(data[i],data[i+1],data[i+2]);verts.set(p,i)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(verts,3));if(primitive.indices!==undefined){let indices=access(primitive.indices);if(flip)for(let i=0;i<indices.length;i+=3){let a=indices[i];indices[i]=indices[i+1];indices[i+1]=a}g.setIndex(new T.BufferAttribute(indices,1))}
 // Transform source normals by the inverse transpose of the linear transform.
 if(primitive.attributes.NORMAL!==undefined){const origin=v(...transform(0,0,0)),x=v(...transform(1,0,0)).sub(origin),y=v(...transform(0,1,0)).sub(origin),z=v(...transform(0,0,1)).sub(origin),nm=new T.Matrix3().getNormalMatrix(new T.Matrix4().makeBasis(x,y,z)),ns=access(primitive.attributes.NORMAL);for(let i=0;i<ns.length;i+=3){let q=v(ns[i],ns[i+1],ns[i+2]).applyMatrix3(nm).normalize();ns.set([q.x,q.y,q.z],i)}g.setAttribute('normal',new T.BufferAttribute(ns,3))}else g.computeVertexNormals();g.computeBoundingSphere();mesh(parent,g,m);
 }}
function cadHierarchy(parent,name,nodeIndex,convert,material,flip=false,matrix=new T.Matrix4()){
 const {json}=cadFile(name),n=json.nodes[nodeIndex];if(/VMCLogo/.test(n.name||''))return;
 const t=n.translation||[0,0,0],r=n.rotation||[0,0,0,1],sc=n.scale||[1,1,1],local=new T.Matrix4().compose(v(...t),new T.Quaternion(...r),v(...sc)),combined=matrix.clone().multiply(local);
 if(n.mesh!==undefined)cadMesh(parent,name,n.mesh,(x,y,z)=>{const p=v(x,y,z).applyMatrix4(combined);return convert(p.x,p.y,p.z)},material(n,json.meshes[n.mesh]),flip);
 for(const i of n.children||[])cadHierarchy(parent,name,i,convert,material,flip,combined);
}
let seed=9127;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}

// A generated outdoor environment gives metal and glazing a sky/ground reflection.
const envCanvas=document.createElement('canvas');envCanvas.width=512;envCanvas.height=256;const ec=envCanvas.getContext('2d');
const skyGrad=ec.createLinearGradient(0,0,0,256);skyGrad.addColorStop(0,'#6c9bc5');skyGrad.addColorStop(.28,'#9dbbd1');skyGrad.addColorStop(.49,'#e5e6da');skyGrad.addColorStop(.51,'#b1a18a');skyGrad.addColorStop(1,'#62584c');ec.fillStyle=skyGrad;ec.fillRect(0,0,512,256);
for(let i=0;i<60;i++){let xx=rnd()*512,yy=35+rnd()*65,rr=12+rnd()*25;const g=ec.createRadialGradient(xx,yy,0,xx,yy,rr);g.addColorStop(0,'rgba(250,250,244,.25)');g.addColorStop(1,'rgba(250,250,244,0)');ec.fillStyle=g;ec.fillRect(xx-rr,yy-rr,rr*2,rr*2)}
const env=new T.CanvasTexture(envCanvas);env.colorSpace=T.SRGBColorSpace;env.mapping=T.EquirectangularReflectionMapping;const pm=new T.PMREMGenerator(renderer);const envTarget=pm.fromEquirectangular(env);scene.environment=envTarget.texture;scene.background=env;pm.dispose();
const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=512;const tc=texCanvas.getContext('2d');const image=tc.createImageData(512,512);let layers=[8,16,32,64].map(n=>({n,a:Array.from({length:n*n},rnd)}));function noise(l,x,y){let u=x*l.n/512,w=y*l.n/512,i=Math.floor(u),j=Math.floor(w),a=u-i,b=w-j;a=a*a*(3-2*a);b=b*b*(3-2*b);const at=(i,j)=>l.a[((j+l.n)%l.n)*l.n+(i+l.n)%l.n];return (at(i,j)*(1-a)+at(i+1,j)*a)*(1-b)+(at(i,j+1)*(1-a)+at(i+1,j+1)*a)*b}
for(let y=0;y<512;y++)for(let x=0;x<512;x++){let n=layers.reduce((v,l,i)=>v+(noise(l,x,y)-.5)*[38,24,15,8][i],0)+(rnd()-.5)*17,p=(y*512+x)*4;image.data[p]=153+n;image.data[p+1]=129+n;image.data[p+2]=99+n;image.data[p+3]=255}tc.putImageData(image,0,0);for(let i=0;i<22000;i++){let q=rnd(),n=Math.floor(70+rnd()*65);tc.fillStyle='rgba('+ (n+25)+','+(n+10)+','+n+','+(.10+rnd()*.22)+')';tc.fillRect(rnd()*512,rnd()*512,1+q*5,1+q*3)}for(let i=0;i<350;i++){tc.fillStyle='rgba(57,44,30,.18)';tc.beginPath();tc.ellipse(rnd()*512,rnd()*512,2+rnd()*5,1+rnd()*2,rnd()*6.28,0,6.28);tc.fill()}const dirt=new T.CanvasTexture(texCanvas);dirt.colorSpace=T.SRGBColorSpace;dirt.wrapS=dirt.wrapT=T.RepeatWrapping;dirt.repeat.set(72,72);dirt.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
const terrainSize=44, subdivisions=176, step=terrainSize/subdivisions, half=terrainSize/2, stride=subdivisions+1;
const geo=new T.PlaneGeometry(terrainSize,terrainSize,subdivisions,subdivisions);geo.rotateX(-Math.PI/2);
const pos=geo.attributes.position, initial=new Float32Array(pos.count), heights=new Float32Array(pos.count), colors=new Float32Array(pos.count*3);
const soilColor=new T.Color(), cDry=new T.Color(0xe0cbb1),cWet=new T.Color(0x74604a),cFresh=new T.Color(0xa1825d);
function paintVertex(i){const delta=heights[i]-initial[i], variation=.92+.08*Math.sin(i*17.17);soilColor.copy(cDry).lerp(delta<0?cWet:cFresh,Math.min(.8,Math.abs(delta)*2.4)).multiplyScalar(variation);colors.set([soilColor.r,soilColor.g,soilColor.b],i*3)}
for(let i=0;i<pos.count;i++){let xx=pos.getX(i),zz=pos.getZ(i);let fade=Math.min(1,Math.max(0,(half-Math.max(Math.abs(xx),Math.abs(zz)))/3));let y=(Math.sin(xx*.38)*Math.cos(zz*.32)*.085+Math.sin(xx*1.4+zz*.7)*.025)*fade;initial[i]=heights[i]=y;pos.setY(i,y);paintVertex(i)}
geo.setAttribute('color',new T.BufferAttribute(colors,3));geo.computeVertexNormals();geo.computeBoundingSphere();geo.boundingSphere.radius+=5;
const detail=dirt.clone();detail.repeat.set(terrainSize/3,terrainSize/3);detail.needsUpdate=true;
const groundMaterial=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,map:detail,bumpMap:detail,bumpScale:.027,roughness:.98});
const ground=mesh(scene,geo,groundMaterial,0,0,0,false);
const outerMat=new T.MeshStandardMaterial({map:dirt,roughness:1,color:0xb5a18a});
for(const [xx,zz,ww,dd] of [[0,-101,202,158],[0,101,202,158],[-101,0,158,44],[101,0,158,44]]){const outer=mesh(scene,new T.PlaneGeometry(ww,dd),outerMat,xx,-.015,zz,false);outer.rotation.x=-Math.PI/2}
let dirty=false,lastNormals=0;const unstable=new Set();
function heightAt(xx,zz){let u=(xx+half)/step,w=(zz+half)/step;if(u<0||w<0||u>=subdivisions||w>=subdivisions)return 0;let ix=Math.floor(u),iz=Math.floor(w),dx=u-ix,dz=w-iz,i=iz*stride+ix;return (heights[i]*(1-dx)+heights[i+1]*dx)*(1-dz)+(heights[i+stride]*(1-dx)+heights[i+stride+1]*dx)*dz}
function change(i,y){if(Math.abs(heights[i]-y)<1e-7)return;heights[i]=y;pos.setY(i,y);paintVertex(i);dirty=true;unstable.add(i)}
function brush(xx,zz,r,fn){let ix=Math.round((xx+half)/step),iz=Math.round((zz+half)/step),n=Math.ceil(r/step);for(let j=Math.max(1,iz-n);j<=Math.min(subdivisions-1,iz+n);j++)for(let k=Math.max(1,ix-n);k<=Math.min(subdivisions-1,ix+n);k++){let d=Math.hypot(k*step-half-xx,j*step-half-zz);if(d<r)fn(j*stride+k,1-d/r)}}
function relaxSoil(dt){
const maxSlope=step*.72;let batch=Array.from(unstable).slice(0,160);
for(const i of batch){unstable.delete(i);let ix=i%stride,iz=Math.floor(i/stride);if(ix<2||ix>subdivisions-2||iz<2||iz>subdivisions-2)continue;
for(const j of [i-1,i+1,i-stride,i+stride]){let d=heights[i]-heights[j];if(Math.abs(d)>maxSlope+.004){let move=(Math.abs(d)-maxSlope)*Math.min(.24,dt*4)*Math.sign(d);change(i,heights[i]-move);change(j,heights[j]+move)}}}}
function refreshTerrain(){if(!dirty)return;pos.needsUpdate=true;geo.attributes.color.needsUpdate=true;let now=performance.now();if(now-lastNormals>80){geo.computeVertexNormals();lastNormals=now;dirty=false}}

const earth=mat(0x8f785a,1),grass=mat(0x68764b,1),pine=mat(0x405a38,1),bark=mat(0x6a5440,1),stone=mat(0x77766a,1);
const gravel=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),stone,700),dummy=new T.Object3D();for(let i=0;i<700;i++){let xx=(rnd()-.5)*42,zz=(rnd()-.5)*42;if(Math.abs(xx)<5&&Math.abs(zz)<7)xx+=xx<0?-5:5;let r=.012+rnd()*.047;dummy.position.set(xx,heightAt(xx,zz)+r*.15,zz);dummy.scale.set(r,r*.55,r*.8);dummy.rotation.set(rnd()*3,rnd()*6,rnd()*3);dummy.updateMatrix();gravel.setMatrixAt(i,dummy.matrix);gravel.setColorAt(i,new T.Color().setHSL(.10,.14,.30+rnd()*.22))}gravel.instanceMatrix.needsUpdate=true;scene.add(gravel);

for(let i=0;i<26;i++){const angle=i/26*6.283,rad=65+rnd()*33;let hill=mesh(scene,new T.IcosahedronGeometry(1,2),i%3?grass:earth,Math.sin(angle)*rad,-3,Math.cos(angle)*rad,false);hill.scale.set(18+rnd()*20,6+rnd()*13,14+rnd()*20)}
for(let i=0;i<64;i++){const angle=rnd()*6.28,rad=28+rnd()*48,xx=Math.sin(angle)*rad,zz=Math.cos(angle)*rad,h=2.5+rnd()*3;const tree=group(scene,xx,0,zz);cyl(tree,bark,0,h*.28,0,.12,h*.56);for(let j=0;j<5;j++){let crown=mesh(tree,new T.IcosahedronGeometry(1,1),pine,(rnd()-.5)*h*.24,h*(.55+j*.105),(rnd()-.5)*h*.24,false);crown.scale.set(h*(.29-j*.033),h*.24,h*(.26-j*.026));crown.rotation.y=rnd()*6.28}}
for(let i=0;i<8;i++){let xx=15+rnd()*14,zz=-12+rnd()*30;let pile=mesh(scene,new T.IcosahedronGeometry(1,2),earth,xx,-.24,zz);pile.scale.set(2+rnd()*2,1+rnd()*1.2,2+rnd()*2)}
for(let i=0;i<26;i++){let xx=-14,zz=-23+i*1.8;box(scene,steel,xx,.65,zz,.08,1.3,.08);if(i<25){box(scene,edge,xx,.96,zz+.9,.055,.10,1.8);box(scene,edge,xx,.48,zz+.9,.055,.10,1.8)}}
const orange=mat(0xe86b22,.65),white=mat(0xe5e1d6,.7);for(let i=0;i<6;i++){const cone=group(scene,-5+i*2,0,12);box(cone,rubber,0,.035,0,.42,.07,.42);cyl(cone,orange,0,.25,0,.035,.43,'y',.16);cyl(cone,white,0,.29,0,.075,.09,'y',.10)}
const base=group(scene),upper=group(base),cab=group(upper,-.59,1.58,.08),undercarriage=group(base),housing=group(upper),trackGroups=[];
box(undercarriage,steel,0,.46,0,1.25,.39,2.3);cyl(undercarriage,steel,0,.83,0,.70,.20);
for(const side of [-1,1]){const tg=group(base,side*.83,0,0);trackGroups.push(tg);extrude(tg,track,[[-1.48,.31],[-1.25,.09],[1.25,.09],[1.48,.31],[1.48,.49],[1.25,.70],[-1.25,.70],[-1.48,.49]],.54,0,0,0,.025);for(let j=0;j<6;j++){cyl(tg,shoe,0,.28,-1.12+j*.45,.22,.48,'x');cyl(tg,steel,side*.265,.28,-1.12+j*.45,.095,.035,'x')}for(let j=0;j<16;j++){const zz=-1.27+j*.17;box(tg,shoe,0,.73,zz,.63,.065,.145);box(tg,shoe,0,.065,zz,.63,.065,.145)}for(const end of [-1,1])for(let j=0;j<6;j++){let t=-Math.PI/2+j*Math.PI/5;const o=box(tg,shoe,0,.40+Math.sin(t)*.34,end*(1.24+Math.cos(t)*.26),.63,.065,.16);o.rotation.x=end*(Math.PI/2-t)}}
extrude(housing,paint,[[-1.43,1.02],[-1.55,1.23],[-1.55,1.59],[-1.46,1.72],[-1.31,1.80],[-.55,1.82],[-.50,1.05]],1.92,0,0,0,.065);
extrude(housing,paint,[[-.61,1.04],[-.61,1.72],[.34,1.72],[.60,1.51],[.63,1.04]],.83,.53,0,0,.045);
box(housing,steel,-.60,1.13,.02,.76,.22,1.18);for(let i=0;i<3;i++)box(housing,shoe,-1.00,1.05+i*.12,.48-i*.20,.24,.05,.22);
for(let i=0;i<3;i++)box(housing,rubber,.98,1.63,-.75+i*.22,.018,.022,.15);
const panelLine=mat(0x164b4b,.8);box(housing,panelLine,.976,1.44,-.49,.013,.45,.018);box(housing,panelLine,.976,1.18,-.75,.013,.015,.53);
for(const xx of [-.69,.69]){box(housing,steel,xx,1.43,-1.55,.21,.13,.035);box(housing,mat(0xb64423,.35),xx,1.43,-1.574,.15,.08,.015)}

box(housing,steel,0,1.01,-.35,1.98,.12,2.1);box(housing,paint,.61,1.91,-.60,.67,.22,1.30);box(housing,steel,.62,2.04,-.67,.58,.025,.62);for(let i=0;i<9;i++)box(housing,rubber,.965,1.43,-1.14+i*.10,.022,.20,.035);box(housing,steel,.97,1.23,-.24,.025,.09,.35);cyl(housing,steel,.68,2.12,-1.15,.055,.28);box(housing,edge,.37,1.47,.52,.55,.70,.64);
const miniBody=group(upper),bladeGroup=group(base),canopy=group(cab),cabShell=group(cab);extrude(miniBody,paint,[[-.80,.03],[-.88,.18],[-.82,.48],[-.65,.58],[-.19,.58],[-.12,.10]],.82,0,0,0,.05);box(miniBody,edge,.28,.31,.08,.36,.52,.55);box(miniBody,steel,0,.04,.04,.82,.10,1.35);for(let i=0;i<6;i++)box(miniBody,rubber,.425,.31,-.65+i*.07,.012,.14,.027);box(bladeGroup,paint,0,.22,0,1,.40,.13);box(bladeGroup,steel,0,.037,.07,1,.075,.10);for(const xx of [-.25,.25])box(bladeGroup,steel,xx,.19,-.25,.09,.12,.50);box(cab,inner,0,.03,0,.91,.12,1.36);box(cab,steel,0,1.16,-.02,.98,.11,1.42);box(cab,steel,0,1.09,.02,.92,.045,1.32);
for(const xx of [-.43,.43])for(const zz of [-.61,.61])box(cabShell,steel,xx,.60,zz,.075,1.1,.075);
for(const xx of [-.43,.43]){box(cabShell,steel,xx,.14,0,.065,.09,1.25);box(cabShell,steel,xx,1.06,0,.065,.06,1.25);box(cabShell,glass,xx,.60,0,.012,.91,1.16)}
box(cabShell,glass,0,.60,.61,.82,.91,.012);box(cabShell,glass,0,.60,-.61,.82,.91,.012);box(cabShell,steel,0,.22,.61,.84,.06,.065);box(cabShell,rubber,-.43,.60,.36,.022,.91,.032);box(cabShell,steel,-.44,.54,.05,.035,.04,.17);// Park the front wiper against the outside lower window edge.
const wiperPivot=cyl(cabShell,steel,-.31,.27,.64,.018,.018,'z');
const wiper=segment(cabShell,rubber,.005);place(wiper,v(-.31,.27,.646),v(.03,.30,.646));
const blade=segment(cabShell,rubber,.007);place(blade,v(-.12,.305,.65),v(.33,.345,.65));for(const xx of [-.43,.43])for(const zz of [-.56,.56])box(canopy,steel,xx,.59,zz,.052,1.09,.052);for(let i=0;i<5;i++)box(cab,rubber,0,.087,.10+i*.065,.42,.012,.021);
box(cab,seatMat,-.04,.23,-.13,.51,.18,.54);const back=box(cab,seatMat,-.04,.54,-.39,.49,.56,.13);back.rotation.x=-.10;box(cab,seatMat,-.04,.84,-.43,.31,.18,.13);
for(const xx of [-.30,.29]){box(cab,inner,xx,.30,.03,.16,.34,.53);box(cab,seatMat,xx,.50,-.09,.16,.08,.36);cyl(cab,rubber,xx,.57,.20,.045,.16);box(cab,rubber,xx,.67,.20,.10,.12,.085)}
for(const xx of [-.09,.10]){box(cab,steel,xx,.09,.45,.12,.055,.24);cyl(cab,steel,xx,.24,.49,.018,.28);box(cab,rubber,xx,.39,.49,.075,.09,.055)}
const monitor=group(cab,.32,.64,.48);monitor.rotation.y=-.35;box(monitor,steel,0,0,0,.25,.20,.06);const displayCanvas=document.createElement('canvas');displayCanvas.width=256;displayCanvas.height=192;const dc=displayCanvas.getContext('2d'),displayTex=new T.CanvasTexture(displayCanvas);displayTex.colorSpace=T.SRGBColorSpace;const monitorFace=box(monitor,new T.MeshBasicMaterial({map:displayTex}),0,0,-.034,.22,.16,.006);let lastDisplay='';
const mirrorArm=segment(cab,steel,.018);place(mirrorArm,v(.43,.92,.52),v(.65,.96,.66));box(cab,steel,.65,.96,.66,.15,.20,.045);box(cab,chrome,.65,.96,.63,.12,.17,.015);
const boom=group(upper,.38,1.45,.55),arm=group(boom,0,0,2.25),tool=group(arm,0,0,1.65),boomVisual=group(boom),armVisual=group(arm);
extrude(boomVisual,paint,[[0,-.16],[.22,-.20],[.48,-.18],[.79,-.06],[1.13,.075],[1.38,.09],[1.78,-.035],[2.12,-.115],[2.25,-.10],[2.25,.13],[2.09,.20],[1.77,.31],[1.43,.46],[1.19,.45],[.92,.36],[.53,.24],[.20,.18],[0,.17]],.30,0,0,0,.035);
extrude(armVisual,paint,[[-.19,.07],[-.10,-.13],[.10,-.19],[.49,-.155],[1.17,-.105],[1.50,-.10],[1.65,-.075],[1.68,.055],[1.52,.105],[.85,.14],[.33,.24],[.05,.26],[-.14,.21]],.23,0,0,0,.023);
for(const g of [boom,arm,tool]){const piv=group(g);cyl(piv,steel,0,0,0,.075,.30,'x');for(const side of [-1,1])cyl(piv,chrome,side*.155,0,0,.047,.018,'x')}
// Replace the simplified boom/arm steelwork with actual CAD solids.
const cadBoom=group(boom),cadArm=group(arm);
const cadAngle=Math.atan2(3.19445,4.71397),cadCos=Math.cos(cadAngle),cadSin=Math.sin(cadAngle),cadBoomLen=Math.hypot(4.71397,3.19445);
const mapBoom=(x,y,z)=>[-y,(z*cadCos-x*cadSin),(x*cadCos+z*cadSin)];
const mapArm=(x,y,z)=>[-y,x,-z];
for(let i=0;i<=8;i++)cadMesh(cadBoom,'boom',i,mapBoom,i<2?steel:i===2?paint:steel,true);
for(let i=0;i<3;i++)cadMesh(cadArm,'arm',i,mapArm,i<2?steel:paint,true);
boomVisual.children[0].visible=false;armVisual.children[0].visible=false;
const cadUnder=group(base);for(let i=0;i<2;i++)cadMesh(cadUnder,'track_frame',i,(x,y,z)=>[-y,z,x],steel,true);
function cylinder(parent,r){return [segment(parent,steel,r),segment(parent,chrome,r*.52)]}

// Hydraulic ram model: fixed barrel, independent piston rod, end-eye and gland.
function realisticRam(parent,r){
 const g=group(parent),body=segment(g,paint,r),rod=segment(g,chrome,r*.53),gland=segment(g,steel,r*1.045),baseEye=group(g),rodEye=group(g);
 for(const [eye,rr] of [[baseEye,r*.81],[rodEye,r*.60]]){cyl(eye,paint,0,0,0,rr,r*1.5,'x');cyl(eye,steel,0,0,0,rr*.55,r*1.68,'x');for(const x of [-1,1])cyl(eye,chrome,x*r*.87,0,0,rr*.38,r*.13,'x')}
 const ports=[];for(let i=0;i<2;i++){const p=group(g);cyl(p,steel,0,0,0,r*.22,r*.9,'x');ports.push(p)}
 return {body,rod,gland,baseEye,rodEye,ports,r};
}
function placeRam(r,a,b,fixed){
 const d=b.clone().sub(a),len=d.length(),axis=d.normalize(),bar=Math.min(fixed,Math.max(.02,len-r.r*.8)),end=a.clone().addScaledVector(axis,bar);
 place(r.body,a,end);place(r.gland,end.clone().addScaledVector(axis,-r.r*.30),end.clone().addScaledVector(axis,r.r*.10));place(r.rod,end,b);
 r.baseEye.position.copy(a);r.rodEye.position.copy(b);
 r.ports[0].position.copy(a).addScaledVector(axis,bar*.17);r.ports[1].position.copy(a).addScaledVector(axis,bar*.88);
}
const lift=realisticRam(upper,.087),stickCylinder=realisticRam(boom,.067),bucketCylinder=realisticRam(arm,.052);
const liftTwin=realisticRam(upper,.087);
const rockerBars=[],dogBars=[],linkPins=[];
for(const side of [-1,1]){rockerBars.push(segment(arm,paint,.034));dogBars.push(segment(arm,steel,.029))}
for(let i=0;i<3;i++){const p=group(arm);cyl(p,steel,0,0,0,.059,.36,'x');for(const side of [-1,1]){cyl(p,paint,side*.142,0,0,.083,.055,'x');cyl(p,chrome,side*.178,0,0,.039,.016,'x')}linkPins.push(p)}
function rotateYZ(y,z,angle){return [y*Math.cos(angle)+z*Math.sin(angle),-y*Math.sin(angle)+z*Math.cos(angle)]}
function ramEnds(s,b=s.b,a=s.a,k=s.k){
 const {B,A,X,Y,Z}=rig(s);
 const [by,bz]=rotateYZ(-.15,B*.49,b),link=linkGeometry(s,k);
 const [ay,az]=rotateYZ(.06458*A/2.9,-.70467*A/2.9,a);
 const stickAnchor=mapBoom(1.59038,0,2.91902),bScale=B/cadBoomLen;
 return {liftA:[X,Y-.47,Z+.13],liftB:[X,Y+by,Z+bz],stickA:[0,stickAnchor[1]*bScale,stickAnchor[2]*bScale],stickB:[0,ay,B+az],bucketA:[0,.55771*A/2.9,.26341*A/2.9],bucketB:[0,link.C.y,link.C.z],link};
}
const ramLengths=new Map();
function minRamLengths(s){
 const key=machineProfile(s).id+':'+s.att;if(ramLengths.has(key))return ramLengths.get(key);
 const mins=[Infinity,Infinity,Infinity];for(let b=-.25;b<=1.381;b+=.025){let e=ramEnds(s,b,-1.2,-.5);mins[0]=Math.min(mins[0],Math.hypot(...e.liftA.map((x,i)=>x-e.liftB[i])))}
 for(let a=-2.4;a<=-.149;a+=.025){let e=ramEnds(s,.5,a,-.5);mins[1]=Math.min(mins[1],Math.hypot(...e.stickA.map((x,i)=>x-e.stickB[i])))}
 for(let k=-1.8;k<=.651;k+=.025){let e=ramEnds(s,.5,-1.2,k);mins[2]=Math.min(mins[2],Math.hypot(...e.bucketA.map((x,i)=>x-e.bucketB[i])))}
 const result=mins.map(x=>x*.82);ramLengths.set(key,result);return result;
}
function updateRams(s){
 const {p,X}=rig(s),e=ramEnds(s),lengths=minRamLengths(s),{P,Q,C}=e.link;
 const twin=p.nominal>=.45,spacing=.13;liftTwin.body.parent.visible=twin;
 const la=v(...e.liftA),lb=v(...e.liftB);if(twin){la.x=X-spacing;lb.x=X-spacing;placeRam(liftTwin,v(X+spacing,la.y,la.z),v(X+spacing,lb.y,lb.z),lengths[0])}
 placeRam(lift,la,lb,lengths[0]);placeRam(stickCylinder,v(...e.stickA),v(...e.stickB),lengths[1]);placeRam(bucketCylinder,v(...e.bucketA),v(...e.bucketB),lengths[2]);
 const q=bucketSpec(s),offset=q?Math.max(.065,q.cad?.215*q.cadX:q.gap*.5+q.thick*1.3):.15;
 for(let i=0;i<2;i++){const x=(i?1:-1)*offset;place(rockerBars[i],v(x,P.y,P.z),v(x,C.y,C.z));place(dogBars[i],v(x,C.y,C.z),v(x,Q.y,Q.z))}
 [P,C,Q].forEach((p,i)=>linkPins[i].position.set(0,p.y,p.z));
}

function adjust(pair,a,b,f=.58){const mid=a.clone().lerp(b,f);place(pair[0],a,mid);place(pair[1],mid,b)}
const hoses=[];for(let i=0;i<4;i++){const x=-.125+i*.080,pts=[v(x,.20,.08),v(x,.32,.45),v(x,.49,1.10),v(x,.51,1.38),v(x,.30,1.86),v(x,.20,2.20)];const curve=new T.CatmullRomCurve3(pts);hoses.push(mesh(boomVisual,new T.TubeGeometry(curve,32,.014,8,false),steel));for(const t of [.18,.42,.76]){let p=curve.getPoint(t);box(boomVisual,steel,p.x,p.y,p.z,.05,.032,.055)}}
const flexHoses=[];for(let i=0;i<3;i++){const o=mesh(boom,new T.BufferGeometry(),rubber);flexHoses.push(o)}let lastHosePose='';
function flexLines(s,B,A){const key=Math.round(s.a*80)+':'+Math.round(B*100);if(key===lastHosePose)return;lastHosePose=key;for(let i=0;i<flexHoses.length;i++){const x=-.085+i*.08;const [ey,ez]=rotateYZ(.23,A*.20,s.a);const curve=new T.CatmullRomCurve3([v(x,.20,B*.90),v(x,.30,B*.99),v(x,.31,B+.10),v(x,ey,B+ez)]);const o=flexHoses[i];o.geometry.dispose();o.geometry=new T.TubeGeometry(curve,14,.016,6,false)}}
const tools=[];const worn=mat(0x777774,.46,.73),bucketSteel=mat(0x555653,.67,.64);
function curvedPlate(p,points,w,m){const curve=new T.CatmullRomCurve3(points.map(([z,y])=>v(0,y,z)),false,'centripetal');let verts=[],ix=[],normals;const count=22;for(let j=0;j<=count;j++){let q=curve.getPoint(j/count);verts.push(-w/2,q.y,q.z,w/2,q.y,q.z)}for(let j=0;j<count;j++){let i=j*2;ix.push(i,i+1,i+2,i+1,i+3,i+2)}const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(verts,3));geom.setIndex(ix);geom.computeVertexNormals();let mm=m.clone();mm.side=T.DoubleSide;return mesh(p,geom,mm)}
// Build continuous thickness steel shell, not a solid block. All parts use the same physical profile.
function cadBucket(spec){
 const g=group(tool),C=Math.cos(.9),S=Math.sin(.9),tf=(x,y,z)=>{let yy=z+.41007984,zz=1.12030852-y;return [x*spec.cadX,(yy*C+zz*S)*spec.cadY,(zz*C-yy*S)*spec.cadZ]};
 for(const i of [0,1,2])cadMesh(g,'bucket',i,tf,i===0?bucketSteel:worn);
 // Side cutters in their original assembled CAD coordinate system.
 for(const [idx,tx,ty,tz] of [[3,-.39529881,.545,-1.06852674],[4,-.39529881,-.545,-1.06852674]])cadMesh(g,'bucket',idx,(x,y,z)=>tf(x+ty,y+tz+1.12030852,z+tx-.41007984),worn);
 // Original tooth / adapter solid translated across the width to match each machine class.
 const source=(.445),teeth=spec.teeth;for(let i=0;i<teeth;i++){const off=(i-(teeth-1)/2)*.89/Math.max(1,teeth-1);for(const idx of [7,12])cadMesh(g,'bucket',idx,(x,y,z)=>tf(x+off,y,z),idx===7?worn:bucketSteel)}
 return g;
}
function bucket(spec){
 if(spec.cad)return cadBucket(spec);
 const {W:w,shell,rim,lip,tip,gap,pin,thick,teeth,att}=spec,skeleton=att===5,g=group(tool);
 const shape=[...shell,...rim.slice(1,-1).reverse()];
 const surfaceCurve=new T.CatmullRomCurve3(shell.map(([z,y])=>v(0,y,z)),false,'centripetal');
 const backMat=bucketSteel,insideMat=mat(0x4d5151,.65,.40);
 function thickShell(){
  const verts=[],idx=[],n=48;
  for(let j=0;j<=n;j++){let t=j/n,q=surfaceCurve.getPoint(t),d=surfaceCurve.getTangent(t);let ny=-d.z,nz=d.y;
   // Inner skin offset toward the cavity, using the local surface normal.
   for(const [x,inner] of [[-w/2,0],[w/2,0],[-w/2+thick,1],[w/2-thick,1]])verts.push(x,q.y+ny*thick*inner,q.z+nz*thick*inner);
  }
  for(let j=0;j<n;j++){const i=j*4,k=i+4;idx.push(i,k,i+1,i+1,k,k+1,i+2,i+3,k+2,i+3,k+3,k+2,i,i+2,k,k,i+2,k+2,i+1,k+1,i+3,i+3,k+1,k+3)}
  idx.push(0,1,2,1,3,2);let e=n*4;idx.push(e,e+2,e+1,e+1,e+2,e+3);
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();let m=backMat.clone();m.side=T.DoubleSide;mesh(g,geo,m);
 }
 for(const sign of [-1,1]){
  extrude(g,backMat,shape,thick*1.5,sign*(w/2-thick*.65),0,0,thick*.2);
  // Side cutting edge follows the actual mouth boundary.
  for(let j=1;j<rim.length;j++){const a=rim[j-1],b=rim[j];const seg=segment(g,worn,thick*.85);place(seg,v(sign*w/2,a[1],a[0]),v(sign*w/2,b[1],b[0]))}
  if(teeth&&att!==5){const z=lip[0],y=lip[1],d=spec.D;extrude(g,worn,[[z-d*.28,y-d*.15],[z-d*.05,y-d*.035],[z+d*.035,y+d*.03],[z-d*.16,y+d*.055]],thick*1.8,sign*(w/2+thick*.5),0,0,thick*.15);for(let j=0;j<2;j++)cyl(g,steel,sign*(w/2+thick*1.6),y-d*.04-j*d*.045,z-d*.07-j*d*.09,thick*1.2,thick*.7,'x')}
 }
 if(skeleton){
  const ribs=Math.max(5,Math.round(w*spec.D/(spec.D*.105)));
  for(let j=1;j<ribs;j++){const x=-w/2+j*w/ribs;const rib=curvedPlate(g,shell,thick*2.0,backMat);rib.position.x=x}
  for(let j=1;j<6;j++){const q=surfaceCurve.getPoint(j/6);cyl(g,backMat,0,q.y,q.z,thick*1.3,w,'x')}
 }else thickShell();
 // Reinforced transverse header, lip, replaceable ground-engaging teeth.
 const top=rim[0];box(g,backMat,0,top[1]+spec.H*.10,top[0]+spec.D*.025,w,thick*3.2,spec.D*.12);
 const edgeLength=att===1?spec.D*.14:spec.D*.095;
 box(g,worn,0,lip[1],lip[0]+edgeLength*.22,w,thick*2.0,edgeLength);
 if(!skeleton){const strips=att===1?4:3;for(let i=0;i<strips;i++){const part=curvedPlate(g,shell.slice(3,-1).map(([z,y])=>[z,y+thick*1.1]),Math.max(thick*2,w*.075),worn);part.position.x=(i-(strips-1)/2)*w/(strips+.3)}}
 for(let i=0;i<teeth;i++){
  const x=(i-(teeth-1)/2)*w/(teeth+.18),tw=Math.min(w/(teeth+1)*.72,spec.D*.105),z0=lip[0]-spec.D*.065,z1=tip[1],y0=lip[1],y1=tip[0],th=thick*2.4;
  box(g,backMat,x,y0,z0,tw*1.12,th*1.8,spec.D*.13);
  const verts=[-tw/2,y0-th,z0,tw/2,y0-th,z0,tw/2,y0+th,z0,-tw/2,y0+th,z0,-tw*.34,y1-th*.15,z1,tw*.34,y1-th*.15,z1,tw*.34,y1+th*.15,z1,-tw*.34,y1+th*.15,z1];
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5]);geo.computeVertexNormals();mesh(g,geo,worn,x,0,0);
 }
 // Two real mounting ears with open pin bores, welded to the reinforced header.
 const pinZ=spec.D*.23,pinY=-spec.H*.085,earT=thick*2.4;
 for(const sign of [-1,1]){
  const sh=new T.Shape();const r=pin*.95;sh.moveTo(-r,-r);sh.quadraticCurveTo(-r*1.3,r,-r*.1,r*1.12);sh.quadraticCurveTo(pinZ*.55,r*1.1,pinZ+r*.65,pinY+r*.80);sh.quadraticCurveTo(pinZ+r*1.15,pinY,pinZ+r*.45,pinY-r);sh.lineTo(top[0]+spec.D*.07,top[1]+spec.H*.13);sh.lineTo(-r,-r);sh.closePath();
  for(const [z,y] of [[0,0],[pinZ,pinY]]){const hole=new T.Path();hole.absarc(z,y,pin*.52,0,Math.PI*2,true);sh.holes.push(hole)}
  const geo=new T.ExtrudeGeometry(sh,{depth:earT,bevelEnabled:false});geo.translate(0,0,-earT/2);geo.rotateY(-Math.PI/2);mesh(g,geo,backMat,sign*(gap/2+earT/2),0,0);
 }
 cyl(g,steel,0,0,0,pin*.50,gap+earT*2,'x');cyl(g,steel,0,pinY,pinZ,pin*.50,gap+earT*2,'x');
 return g;
}
let bucketKey='';
function rebuildBuckets(s){const key=machineProfile(s).id;if(key===bucketKey)return;bucketKey=key;
 for(const att of [0,1,2,5]){if(tools[att]){tool.remove(tools[att]);tools[att].traverse(o=>{if(o.geometry)o.geometry.dispose()})}tools[att]=bucket(bucketSpec(s,att))}
}
const attachmentPaint=mat(0xd65b23,.48,.25),crusherPaint=mat(0x235c87,.48,.27),breakerPaint=mat(0x3f5159,.57,.28),jawSteel=mat(0x4d5355,.65,.55), jawEdge=mat(0x858983,.47,.65);
function mount(g,w=.32){for(const x of [-w/2,w/2]){extrude(g,attachmentPaint,[[-.10,-.07],[.12,-.15],[.24,-.08],[.24,.09],[.06,.12],[-.10,.07]],.065,x,0,0,.016);cyl(g,worn,x,0,0,.082,.076,'x');cyl(g,worn,x,-.05,.18,.065,.076,'x')}cyl(g,chrome,0,0,0,.045,w+.12,'x');cyl(g,chrome,0,-.05,.18,.037,w+.12,'x')}
const breaker=group(tool);mount(breaker,.30);
extrude(breaker,breakerPaint,[[.12,-.15],[.27,-.20],[.82,-.20],[.96,-.12],[.96,.12],[.82,.20],[.27,.20],[.12,.15]],.34,0,0,0,.025);
for(const x of [-.185,.185]){box(breaker,steel,x,0,.53,.035,.34,.62);box(breaker,breakerPaint,x*1.10,0,.43,.02,.20,.38);for(const z of [.32,.72])cyl(breaker,worn,x,0,z,.041,.045,'x')}
for(const x of [-.12,.12]){const hose=new T.CatmullRomCurve3([v(x,-.08,.19),v(x,-.29,.12),v(x,-.33,-.04),v(x,-.16,-.18)]);mesh(breaker,new T.TubeGeometry(hose,14,.016,6,false),rubber)}cyl(breaker,steel,0,0,.91,.10,.13,'z');const chisel=group(breaker,0,0,.96);cyl(chisel,chrome,0,0,.12,.045,.24,'z');cyl(chisel,worn,0,0,.30,.004,.12,'z',.045);tools[3]=breaker;
const mechanisms=[];
function hinge(g,y,z){const j=group(g,0,y,z);cyl(j,chrome,0,0,0,.066,.45,'x');return j}
function jawCylinder(g,x,anchor,j,localEnd){const pair=[segment(g,attachmentPaint,.064),segment(g,chrome,.032)];return {pair,anchor:v(x,anchor[0],anchor[1]),j,end:v(x,localEnd[0],localEnd[1])}}
function updateJawCylinder(c){const end=c.end.clone().applyAxisAngle(v(1,0,0),c.j.rotation.x).add(c.j.position);adjust(c.pair,c.anchor,end,.58)}
// Grasping fork: interleaving two/three tines in a common closing plane.
const fork=group(tool);mount(fork,.31);for(const x of [-.22,.22]){extrude(fork,attachmentPaint,[[.07,-.15],[.27,-.22],[.44,-.15],[.48,.15],[.25,.22],[.07,.15]],.06,x,0,0,.02);for(const y of [-.12,.12])cyl(fork,worn,x,y,.30,.065,.082,'x')}box(fork,attachmentPaint,0,0,.23,.38,.22,.27);
const forkLow=hinge(fork,.12,.30),forkHigh=hinge(fork,-.12,.30);
const tine=[[0,-.06],[.24,-.10],[.47,-.16],[.65,-.25],[.76,-.37],[.70,-.40],[.58,-.30],[.40,-.07],[.18,.08],[0,.08]];
for(const [j,sign,xs] of [[forkLow,1,[-.15,.15]],[forkHigh,-1,[-.29,0,.29]]]){for(const x of xs){extrude(j,attachmentPaint,tine.map(([z,y])=>[z,y*sign]),.095,x,0,0,.012);extrude(j,jawEdge,[[.58,-.30*sign],[.76,-.37*sign],[.70,-.40*sign],[.58,-.33*sign]],.10,x,0,0,.007)}box(j,attachmentPaint,0,0,.13,.58,.12,.12);box(j,attachmentPaint,0,-.13*sign,.47,.58,.09,.08)}
mechanisms.push({att:4,joints:[{j:forkLow,sign:-1,open:.52},{j:forkHigh,sign:1,open:.52}],cylinders:[jawCylinder(fork,0,[-.09,.13],forkHigh,[.03,.21])]});tools[4]=fork;
// Primary demolition crusher: two moving curved jaws, twin hydraulic rams.
const crusher=group(tool);mount(crusher,.34);cyl(crusher,crusherPaint,0,0,.22,.245,.14,'z');for(let i=0;i<10;i++){let t=i*Math.PI/5;cyl(crusher,worn,.20*Math.cos(t),.20*Math.sin(t),.295,.018,.025,'z')}extrude(crusher,crusherPaint,[[.26,-.20],[.43,-.25],[.55,-.15],[.55,.15],[.43,.25],[.26,.20]],.46,0,0,0,.03);
const crusherJaws=[],crusherCyl=[];
for(const sign of [-1,1]){const j=hinge(crusher,sign*.17,.43);const outline=[[0,-.10],[.20,-.15],[.44,-.14],[.70,-.27],[.80,-.35],[.74,-.42],[.60,-.34],[.48,-.23],[.33,-.19],[.16,-.04],[0,.12]].map(([z,y])=>[z,y*sign]);extrude(j,jawSteel,outline,.22,0,0,0,.025);for(const x of [-.125,.125]){extrude(j,crusherPaint,outline.slice(0,4).concat([[.38,-.07*sign],[.12,.07*sign],[0,.10*sign]]),.03,x,0,0,.01);cyl(j,worn,x,0,0,.083,.04,'x')}for(let i=0;i<3;i++){const z=.42+i*.095;extrude(j,jawEdge,[[z,-sign*.16],[z+.07,-sign*.25],[z+.11,-sign*.17]],.22,0,0,0,.009)}crusherJaws.push({j,sign:-sign,open:.48});crusherCyl.push(jawCylinder(crusher,sign*.15,[sign*.15,.25],j,[sign*.08,.23]))}
mechanisms.push({att:6,joints:crusherJaws,cylinders:crusherCyl});tools[6]=crusher;
// Secondary pulverizer: a fixed wide lower jaw and a single hinged upper jaw.
const pulverizer=group(tool);mount(pulverizer,.32);extrude(pulverizer,crusherPaint,[[.12,-.15],[.30,-.20],[.54,-.13],[.62,.11],[.45,.23],[.14,.17]],.44,0,0,0,.025);
const fixed=group(pulverizer,0,.17,.34),moving=hinge(pulverizer,-.12,.46);for(const x of [-.235,.235]){extrude(pulverizer,crusherPaint,[[.25,-.12],[.45,-.20],[.64,-.08],[.66,.09],[.43,.15],[.25,.08]],.04,x,0,0,.014);cyl(pulverizer,worn,x,-.12,.46,.079,.055,'x')}
extrude(fixed,jawSteel,[[0,-.02],[.28,.02],[.60,-.08],[.77,-.24],[.71,-.30],[.44,-.18],[.18,-.08],[0,.12]],.52,0,0,0,.025);
extrude(moving,jawSteel,[[0,-.09],[.24,-.13],[.52,-.03],[.67,.14],[.62,.22],[.40,.14],[.18,.08],[0,.11]],.43,0,0,0,.025);
for(let i=0;i<4;i++)for(let j=0;j<3;j++){const x=(j-1)*.14,z=.30+i*.09;box(fixed,jawEdge,x,-.055-i*.027,z,.092,.095,.073);box(moving,jawEdge,x,.07+i*.014,z,.085,.095,.07)}
mechanisms.push({att:7,joints:[{j:moving,sign:1,open:.70}],cylinders:[jawCylinder(pulverizer,0,[-.13,.22],moving,[-.07,.22])]});tools[7]=pulverizer;
// Use the moving attachment's actual geometry for a compact contact envelope.
// Cache by class and jaw position; all sampled coordinates are in tool-local metres.
const hydraulicCache=new Map();
function hydraulicScale(s,att){const p=machineProfile(s),f=FITS[MACHINE_PROFILES.indexOf(p)],sc=s.scale||1;const ratio=f[3]/.182;const axial=Math.pow(p.capacity/.28,.28)/sc;return [Math.max(.36,ratio/sc),axial,axial]}
function applyHydraulic(s){
 for(const att of [3,4,6,7]){const o=tools[att];o.scale.set(...hydraulicScale(s,att))}
 for(const m of mechanisms){for(const q of m.joints)q.j.rotation.x=q.sign*q.open*(1-(s.aux||0));for(const c of m.cylinders)updateJawCylinder(c)}
}
function hydraulicSamples(s){
 const key=machineProfile(s).id+':'+s.att+':'+(s.aux||0)+':'+s.scale;if(hydraulicCache.has(key))return hydraulicCache.get(key);
 const root=tools[s.att];if(!root)return [];applyHydraulic(s);const points=[];
 function walk(node,m){node.updateMatrix();const mm=m.clone().multiply(node.matrix);const a=node.geometry?.attributes?.position;if(a){for(let i=0;i<a.count;i+=Math.max(1,Math.floor(a.count/45))){const p=v(a.getX(i),a.getY(i),a.getZ(i)).applyMatrix4(mm);points.push(p)}}for(const child of node.children)walk(child,mm)}
 walk(root,new T.Matrix4());const result=[];
 for(let j=0;j<24;j++){const theta=j*Math.PI/12,ny=Math.cos(theta),nz=Math.sin(theta);for(const side of [-1,0,1]){let best=null,score=-Infinity;for(const p of points){const x=p.y*ny+p.z*nz+side*p.x*.35;if(x>score){score=x;best=p}}if(best)result.push([best.x,best.y,best.z,0])}}
 hydraulicCache.set(key,result);return result;
}
const soilMat=new T.MeshStandardMaterial({color:0x947454,roughness:1,side:T.DoubleSide});
const carried=mesh(tool,new T.BufferGeometry(),soilMat,0,0,0,false);carried.visible=false;
const clodGeo=new T.IcosahedronGeometry(1,1),clodMat=mat(0x8d6c4e,1);
const intake=new T.InstancedMesh(clodGeo,clodMat,64),falling=new T.InstancedMesh(clodGeo,clodMat,96);
intake.count=falling.count=0;intake.frustumCulled=falling.frustumCulled=false;tool.add(intake);scene.add(falling);
const clodDummy=new T.Object3D(),incoming=[],drops=[];
let pendingCut=0,workMode='';let soil=0,previousTip=null,previousK=null,previousA=null,lastSoilInfo='',dumping=false,lastFillTime=-1,lastFill=-1,spillDelay=0;
let cavity=[],fillSpec=null;function cavityFor(q){return [...q.shell.map(([z,y])=>[z,y-q.thick*1.2]),...q.rim.slice(1,-1).reverse()]};
function area(poly){let sum=0;for(let i=0;i<poly.length;i++){let a=poly[i],b=poly[(i+1)%poly.length];sum+=a[0]*b[1]-a[1]*b[0]}return Math.abs(sum)*.5}
function clipFill(poly,ny,nz,level){let out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a[1]*ny+a[0]*nz-level,db=b[1]*ny+b[0]*nz-level;if(da<=0)out.push(a);if((da<=0)!==(db<=0)){let t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}return out}
function fillPolygon(f,ny,nz){let lo=Infinity,hi=-Infinity;for(const [z,y] of cavity){let h=y*ny+z*nz;lo=Math.min(lo,h);hi=Math.max(hi,h)}let target=area(cavity)*Math.max(0,Math.min(.96,f*.96));for(let i=0;i<15;i++){let mid=(lo+hi)/2;if(area(clipFill(cavity,ny,nz,mid))<target)lo=mid;else hi=mid}return clipFill(cavity,ny,nz,(lo+hi)/2)}
function updateFill(f,bw,ny,nz,now){carried.visible=f>.002;if(!carried.visible)return;if(now-lastFillTime<40&&Math.abs(f-lastFill)<.01)return;lastFillTime=now;lastFill=f;let points=fillPolygon(f,ny,nz);if(points.length<3)return;const sh=new T.Shape();points.forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y));sh.closePath();const innerW=Math.max(.04,bw-(fillSpec?.thick||.02)*3);const g=new T.ExtrudeGeometry(sh,{depth:innerW,bevelEnabled:false});g.translate(0,0,-innerW/2);g.rotateY(-Math.PI/2);g.computeVertexNormals();carried.geometry.dispose();carried.geometry=g}
function deposit(xx,zz,amount,radius){let cells=[],total=0;brush(xx,zz,radius,(i,w)=>{cells.push([i,w]);total+=w});if(total<=0)return false;for(const [i,w] of cells)change(i,heights[i]+amount*w/total/(step*step));return true}
function launchDrops(amount,bw,s,cap){if(amount<=0||drops.length>=96)return 0;let n=Math.min(96-drops.length,Math.max(1,Math.min(5,Math.ceil(amount/(cap*.018)))));for(let i=0;i<n;i++){let start=tool.localToWorld(v((rnd()-.5)*bw*.76,fillSpec?fillSpec.lip[1]:.10,fillSpec?fillSpec.lip[0]:.74));let end=tool.localToWorld(v(0,fillSpec?fillSpec.lip[1]+fillSpec.normalY*.5:-.32,fillSpec?fillSpec.lip[0]+fillSpec.normalZ*.5:.95)),origin=tool.localToWorld(v(0,0,0));let vel=end.sub(origin).normalize().multiplyScalar(.18+rnd()*.45);vel.y-=.15;drops.push({p:start,vel,amount:amount/n,r:Math.max(.025,Math.cbrt(amount/n)*.42),life:0,spread:Math.max(.28,bw*s.scale*.62)})}return amount}
function animateSoil(dt){intake.count=0;incoming.length=0;
for(let i=drops.length-1;i>=0;i--){let p=drops[i];p.life+=dt;p.vel.y-=9.81*dt;p.p.addScaledVector(p.vel,dt);if(p.p.y<=heightAt(p.p.x,p.p.z)+p.r*.4||p.life>4){if(!deposit(p.p.x,p.p.z,p.amount,p.spread))deposit(Math.max(-half+.5,Math.min(half-.5,p.p.x)),Math.max(-half+.5,Math.min(half-.5,p.p.z)),p.amount,p.spread);drops.splice(i,1)}}falling.count=drops.length;drops.forEach((p,i)=>{clodDummy.position.copy(p.p);clodDummy.scale.set(p.r,p.r*.85,p.r*.9);clodDummy.rotation.set(p.life*5,i,p.life*3);clodDummy.updateMatrix();falling.setMatrixAt(i,clodDummy.matrix)});falling.instanceMatrix.needsUpdate=true;}
function resetTerrain(){heights.set(initial);for(let i=0;i<pos.count;i++){pos.setY(i,heights[i]);paintVertex(i)}pos.needsUpdate=true;geo.attributes.color.needsUpdate=true;geo.computeVertexNormals();soil=0;pendingCut=0;workMode='';previousTip=null;previousK=null;previousA=null;dumping=false;spillDelay=0;carried.visible=false;incoming.length=drops.length=0;intake.count=falling.count=0;dirty=false;unstable.clear();lastSoilInfo='';lastFill=-1;lastFillTime=-1}
// Isolate arm/bucket cutting travel from boom, swing and track motion.
function scoopTravel(b,a,k,oldA,oldK,tipY,tipZ){
 if(oldA===null||oldK===null||!(a<oldA-1e-8||k<oldK-1e-8))return 0;
 const point=(aa,kk)=>{const t=b+aa+kk;return [1.65*Math.sin(b+aa)+tipY*Math.cos(t)+tipZ*Math.sin(t),1.65*Math.cos(b+aa)-tipY*Math.sin(t)+tipZ*Math.cos(t)]};
 const p=point(a,k),q=point(oldA,oldK),t=b+a+k;
 const ny=-.9*Math.cos(t)+.44*Math.sin(t),nz=.9*Math.sin(t)+.44*Math.cos(t);
 return Math.max(0,(p[0]-q[0])*ny+(p[1]-q[1])*nz);
}

const bucketWidths=[.77,1.30,.38,0,0,.82,0,0];
function samplesFor(s){const q=bucketSpec(s);if(!q)return hydraulicSamples(s);const points=[];for(const x of [-q.W*.49,0,q.W*.49]){for(const [z,y] of q.shell.slice(0,-1))points.push([x,y,z,0]);points.push([x,q.lip[1],q.lip[0],1],[x,q.tip[0],q.tip[1],1]);}return points}
const toolSamples=Array.from({length:8},(_,att)=>{
 const points=[],bw=bucketWidths[att];
 if(bw){for(const xx of [-bw*.48,0,bw*.48]){
  for(const [zz,yy] of [[-.09,.035],[.025,.19],[.16,.32],[.32,.39],[.49,.38],[.63,.31],[.74,.23],[.12,-.095]])points.push([xx,yy,zz,0]);
  points.push([xx,.18,.79,1]);if(att!==1)points.push([xx,.26,.97,1]);
 }}else if(att===3){for(const [zz,yy] of [[.12,-.15],[.45,-.20],[.85,-.20],[.96,-.12],[1.32,0]])points.push([0,yy,zz,0],[.17,yy,zz,0],[-.17,yy,zz,0])}
 else if(att===4){for(const xx of [-.29,0,.29])for(const zz of [.2,.5,.95])points.push([xx,-.30,zz,0],[xx,.30,zz,0])}
 else if(att===6){for(const xx of [-.12,0,.12])for(const zz of [.4,.8,1.20])points.push([xx,-.40,zz,0],[xx,.40,zz,0])}
 else{for(const xx of [-.26,0,.26])for(const zz of [.35,.65,1.10])points.push([xx,-.28,zz,0],[xx,.25,zz,0])}
 return points;
});
function collisionDepth(s,cutting){
 const {B,A,X,Y,Z}=rig(s);const angle=s.b+s.a+s.k,armAngle=s.b+s.a,t=s.yaw+s.swing,cs=Math.cos(t),sn=Math.sin(t),baseY=heightAt(-s.x,s.z),sc=s.scale;
 const hy=Y+B*Math.sin(s.b)+A*Math.sin(armAngle),hz=Z+B*Math.cos(s.b)+A*Math.cos(armAngle);
 let worst=0;
 function sample(xx,yy,zz,allow){
  const lx=X+xx,wx=-s.x-sc*(lx*cs+zz*sn),wz=s.z+sc*(-lx*sn+zz*cs),wy=baseY+sc*yy;
  worst=Math.max(worst,heightAt(wx,wz)-wy-allow*sc);
 }
 for(const [xx,yy,zz,lip] of samplesFor(s)){sample(xx,hy+yy*Math.cos(angle)+zz*Math.sin(angle),hz-yy*Math.sin(angle)+zz*Math.cos(angle),lip?(cutting?.12:.035):.018)}
 for(const frac of [.18,.42,.70,.96]){const d=A*frac;sample(0,Y+B*Math.sin(s.b)+d*Math.sin(armAngle)-.12,Z+B*Math.cos(s.b)+d*Math.cos(armAngle),.015)}
 return worst;
}

function toolPoint(s,xx,yy,zz){
 const {B,A,X,Y,Z}=rig(s);const angle=s.b+s.a+s.k,armAngle=s.b+s.a,t=s.yaw+s.swing,cs=Math.cos(t),sn=Math.sin(t),sc=s.scale;
 const lx=X+xx,ly=Y+B*Math.sin(s.b)+A*Math.sin(armAngle)+yy*Math.cos(angle)+zz*Math.sin(angle),lz=Z+B*Math.cos(s.b)+A*Math.cos(armAngle)-yy*Math.sin(angle)+zz*Math.cos(angle);
 return {x:-s.x-sc*(lx*cs+lz*sn),y:heightAt(-s.x,s.z)+sc*ly,z:s.z+sc*(-lx*sn+lz*cs)};
}

 // Lip, belly and rigid sides are separate contact surfaces.
function contactProfile(s){
 const q=bucketSpec(s);if(!q)return null;const bw=q.W,[ty,tz]=q.tip;
 const lip=toolPoint(s,0,ty,tz),back=toolPoint(s,0,q.shell[4][1],q.shell[4][0]);
 const t=s.yaw+s.swing,axis={x:-Math.cos(t),z:-Math.sin(t)};
 let edgeGap=Infinity,backGap=Infinity,lowestBack=back;
 for(const f of [-.47,0,.47]){
  const p=toolPoint(s,bw*f,ty,tz);edgeGap=Math.min(edgeGap,p.y-heightAt(p.x,p.z));
  for(const [z,y] of q.shell.slice(1,-1)){const pt=toolPoint(s,bw*f,y,z),gap=pt.y-heightAt(pt.x,pt.z);if(gap<backGap){backGap=gap;lowestBack=pt}}
 }
 const angle=s.b+s.a+s.k,backDown=Math.cos(angle)<-.10;
 return {bw,lip,back:lowestBack,axis,edgeGap,backGap,backDown,ny:q.normalY,nz:q.normalZ};
}
function redistribute(p,axis,width,amount,dx,dz){
 if(amount<=0)return;
 let length=Math.hypot(dx,dz);if(length<1e-8){dx=-axis.z;dz=axis.x;length=1}
 const r=Math.max(step*1.45,width*.34),off=width*.58+step*.65;
 for(const sign of [-1,1]){
  const xx=p.x+axis.x*off*sign+dx/length*step*.6,zz=p.z+axis.z*off*sign+dz/length*step*.6;
  if(!deposit(xx,zz,amount*.5,r))deposit(p.x,p.z,amount*.5,step*2);
 }
}
function editStrip(p,axis,width,floor,limit,depth){
 const {cells}=edgeWeights(p.x,p.z,axis.x,axis.z,width,Math.max(step*.65,depth));
 let volume=0;
 for(const [i,w] of cells){const old=heights[i],d=Math.min(Math.max(0,old-Math.max(-2.8,floor)),limit*w);if(d>0){change(i,old-d);volume+=d*step*step}}
 return volume;
}
function preCut(prev,next){
 const old=contactProfile(prev),p=contactProfile(next);if(!p)return '';
 const dx=p.lip.x-old.lip.x,dz=p.lip.z-old.lip.z,dy=p.lip.y-old.lip.y;
 const horiz=Math.hypot(dx,dz),travel=Math.hypot(horiz,dy),width=p.bw*next.scale;
 const actuated=Math.abs(next.a-prev.a)+Math.abs(next.k-prev.k)>1e-8;
 const closing=next.k<prev.k-1e-8,pulling=next.a<prev.a-1e-8;
 const angle=next.b+next.a+next.k;
 const mouthZ=-p.ny*Math.sin(angle)+p.nz*Math.cos(angle),t=next.yaw+next.swing;
 const leading=(-Math.sin(t)*dx+Math.cos(t)*dz)*mouthZ;
 // A low back is a solid contact, not a cutting edge. Shallow horizontal
 // sliding on the belly may shave humps; it can never collect soil.
 const backFirst=p.backGap<=p.edgeGap+.015*next.scale&&p.backGap<.035*next.scale;
 const movingAgainstMouth=horiz>1e-7&&leading< -horiz*.15;
 const grading=backFirst||(p.backDown&&p.backGap<.06*next.scale&&p.edgeGap>p.backGap-.025*next.scale)||(movingAgainstMouth&&p.backGap<.07*next.scale);
 if(grading){
  const gx=p.back.x-old.back.x,gz=p.back.z-old.back.z,gy=p.back.y-old.back.y,slide=Math.hypot(gx,gz);
  if(p.backGap>-.12*next.scale&&slide>1e-6&&Math.abs(gy)<slide*.85&&actuated){
   const removed=editStrip(p.back,p.axis,width,p.back.y,Math.min(.035*next.scale,slide*.85),slide);
   redistribute(p.back,p.axis,width,removed,gx,gz);
   return removed>0?'整地':'背面接地';
  }
  return '背面接地';
 }
 if(backFirst||p.edgeGap>.025*next.scale||travel<1e-7||!actuated)return '';
 // Use the actual lip only; a closed bucket back or side cannot excavate.
 const mouthY=p.ny*Math.cos(angle)+p.nz*Math.sin(angle);const intoMouth=leading+dy*mouthY;
 const cut=(closing||pulling)&&intoMouth>travel*.08&&!movingAgainstMouth;
 if(!cut)return '';
 const shallow=Math.abs(dy)<horiz*.65&&p.edgeGap>-.12*next.scale;
 let removed=0,swept=0,count=Math.min(6,Math.max(1,Math.ceil(travel/(step*.4))));
 for(let j=1;j<=count;j++){
  const q={...next};for(const key of ['x','z','yaw','swing','b','a','k'])q[key]=prev[key]+(next[key]-prev[key])*j/count;
  const pt=contactProfile(q);if((pt.backGap<=pt.edgeGap+.015*q.scale&&pt.backGap<.035*q.scale)||(pt.backDown&&pt.backGap<.06*q.scale&&pt.edgeGap>pt.backGap-.025*q.scale)||pt.edgeGap>.025*q.scale)continue;
  let penetration=0;for(let n=0;n<7;n++){const off=(n/6-.5)*width;penetration+=Math.max(0,heightAt(pt.lip.x+pt.axis.x*off,pt.lip.z+pt.axis.z*off)-pt.lip.y)}
  penetration/=7;if(penetration<.001*q.scale)continue;
  swept+=width*Math.max(0,intoMouth/count)*Math.min(penetration,.35*q.scale);
  removed+=editStrip(pt.lip,pt.axis,width,pt.lip.y,travel*.95/count,travel/count);
 }
 if(removed<=0)return '';
 const cap=Math.max(.01,machineProfile(next).capacity*([1,1.15,.55,0,0,.8,0,0][next.att]||1));
 const collected=Math.min(Math.max(0,cap-soil),removed,swept);
 soil+=collected;pendingCut+=collected;redistribute(p.lip,p.axis,width,removed-collected,dx,dz);
 return shallow?'鋤取り':'掘削';
}
function resolveMotion(prev,next){
 if(!next.active||!next.engine||!next.unlocked)return next;
 const before=soil;workMode=preCut(prev,next);const cutting=workMode==='掘削'||workMode==='鋤取り';
 function reconcile(accepted){
  if(cutting&&soil>before){const p=contactProfile(prev),q=contactProfile(next),r=contactProfile(accepted),d=Math.hypot(q.lip.x-p.lip.x,q.lip.y-p.lip.y,q.lip.z-p.lip.z),actual=Math.hypot(r.lip.x-p.lip.x,r.lip.y-p.lip.y,r.lip.z-p.lip.z);
   const rejected=(soil-before)*(1-Math.min(1,actual/Math.max(d,1e-9)));if(rejected>0){soil-=rejected;pendingCut=Math.max(0,pendingCut-rejected);redistribute(r.lip,r.axis,r.bw*accepted.scale,rejected,r.lip.x-p.lip.x,r.lip.z-p.lip.z)}
  }
  return accepted;
 }
 const baseline=collisionDepth(prev,cutting),limit=baseline+.00002;
 if(collisionDepth(next,cutting)<=limit)return reconcile(next);
 const keys=['x','z','yaw','swing','b','a','k'];let lo=0,hi=1;
 for(let i=0;i<12;i++){let mid=(lo+hi)/2,p={...next};for(const key of keys)p[key]=prev[key]+(next[key]-prev[key])*mid;if(collisionDepth(p,cutting)<=limit)lo=mid;else hi=mid}
 let accepted={...next};for(const key of keys)accepted[key]=prev[key]+(next[key]-prev[key])*lo;
 for(const key of ['b','a','k','swing','yaw','x','z']){let candidate={...accepted,[key]:next[key]};if(collisionDepth(candidate,cutting)<=limit)accepted=candidate}
 accepted.contact=true;return reconcile(accepted);
}


function edgeWeights(cx,cz,ax,az,width,depth){
 const reach=Math.hypot(width*.5,depth*.5)+step;
 let cells=[],total=0;
 brush(cx,cz,reach,(i)=>{
  const rx=pos.getX(i)-cx,rz=pos.getZ(i)-cz;
  const along=Math.abs(rx*ax+rz*az),forward=Math.abs(-rx*az+rz*ax);
  const weight=Math.max(0,Math.min(1,(width*.5+step*.55-along)/step))*Math.max(0,Math.min(1,(depth*.5+step*.55-forward)/step));
  if(weight>0){cells.push([i,weight]);total+=weight}
 });
 return {cells,total};
}
function cutEdge(center,axis,width,travel,scale,bite){
 let penetration=0;
 for(let j=0;j<5;j++){const off=(j/4-.5)*width;penetration+=Math.max(0,heightAt(center.x+axis.x*off,center.z+axis.z*off)-center.y-bite)}
 penetration/=5;if(penetration<=0||travel<=0)return 0;
 const {cells,total}=edgeWeights(center.x,center.z,axis.x,axis.z,width,Math.max(step*.55,travel));
 if(!total)return 0;
 const target=width*travel*Math.min(penetration,.22*scale)*.94;
 let removed=0;
 for(const [i,w] of cells){const available=Math.max(0,heights[i]-center.y-bite);const dep=Math.min(available,target*w/total/(step*step),Math.max(0,heights[i]+2.8));if(dep>0){change(i,heights[i]-dep);removed+=dep*step*step}}
 return removed;
}
function retainedFraction(ny,nz){
 const mouthUp=(fillSpec?.normalY??-.9)*ny+(fillSpec?.normalZ??.44)*nz;
 if(mouthUp>=.10)return 1;
 const repose=Math.min(.50,Math.max(0,.48*(1+mouthUp)));
 const ey=ny-.9*repose,ez=nz+.44*repose;
 const lip1=fillSpec.rim[0],lip2=fillSpec.lip;
 const level=Math.min(lip1[1]*ey+lip1[0]*ez,lip2[1]*ey+lip2[0]*ez);
 return Math.max(0,Math.min(1,area(clipFill(cavity,ey,ez,level))/area(cavity)));
}
function soilStep(s){
const dt=Math.max(0,Math.min(.075,s.dt||0));const bucket=[0,1,2,5].includes(s.att),capacity=Math.max(.01,machineProfile(s).capacity*([1,1.15,.55,0,0,.8,0,0][s.att]||1));
const spec=bucketSpec(s);if(spec){fillSpec=spec;cavity=cavityFor(spec)}const tipY=spec?.tip[0]??.26,tipZ=spec?.tip[1]??.97;
const tooth=tool.localToWorld(v(0,tipY,tipZ));
const dk=previousK===null?0:s.k-previousK;
const scoop=scoopTravel(s.b,s.a,s.k,previousA,previousK,tipY,tipZ)*s.scale;
const mouth=tool.localToWorld(v(0,spec?.normalY??-.9,spec?.normalZ??.44)).sub(tool.localToWorld(v(0,0,0))).normalize();
const displacement=previousTip?tooth.clone().sub(previousTip):v(0,0,0);
const movement=displacement.length(),cutTravel=Math.min(scoop,Math.max(0,displacement.dot(mouth)));
previousK=s.k;previousA=s.a;
if(s.active&&s.engine&&s.unlocked&&bucket&&dt>0){
const bw=spec.W,width=bw*s.scale,radius=Math.max(step*1.2,width*.55);
const surface=heightAt(tooth.x,tooth.z),angle=s.b+s.a+s.k;
const axis=tool.localToWorld(v(1,0,0)).sub(tool.localToWorld(v(0,0,0)));axis.y=0;axis.normalize();
const isCutting=pendingCut>0||(previousTip&&cutTravel>1e-7&&dk<=.00005&&tooth.y<surface+.025*s.scale);
const stableVolume=capacity*retainedFraction(Math.cos(angle),Math.sin(angle));
const canSpill=mouth.y<-.10&&tooth.y>surface+.08;
spillDelay=canSpill&&!isCutting?spillDelay+dt:0;
dumping=soil>stableVolume+.00001&&canSpill&&!isCutting&&(dk>0.00005||spillDelay>.18);
if(dumping){const amount=Math.min(soil-stableVolume,capacity*dt*(.3+Math.max(0,-mouth.y)*1.6));soil-=launchDrops(amount,bw,s,capacity)}
pendingCut=0;
}
previousTip=tooth.clone();
animateSoil(dt);const bw=spec?.W??.77,angle=s.b+s.a+s.k;
updateFill(bucket?Math.min(1,Math.max(0,soil)/capacity):0,bw,Math.cos(angle),Math.sin(angle),performance.now());
relaxSoil(dt);refreshTerrain();
let info=bucket?'土量 '+Math.round(soil*1000)/1000+' / '+Math.round(capacity*1000)/1000+' m³':'掘削用バケットに交換';if(workMode)info+=' / '+workMode;if(s.contact)info+=' / 接地・負荷';if(info!==lastSoilInfo){lastSoilInfo=info;document.getElementById('soilInfo').textContent=info}
}
let width=0,height=0,profileKey='';

function draw(s){const w=canvas.clientWidth,h=canvas.clientHeight;if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.fov=2*Math.atan(Math.max(Math.tan(29*Math.PI/180),Math.tan(27*Math.PI/180)/camera.aspect))*180/Math.PI;camera.fov=Math.min(108,camera.fov);camera.updateProjectionMatrix()}const {p,sc,B,A,X,Y,Z}=rig(s);
if(profileKey!==p.id){profileKey=p.id;rebuildBuckets(s);lastFill=-1;lastFillTime=-1;
 const deck=p.deck/sc,roof=p.height/sc,bodyW=p.width/sc;
 undercarriage.scale.set(bodyW/2.29,deck/1.02,p.track/sc/3.0);
 for(let i=0;i<trackGroups.length;i++){const tg=trackGroups[i];tg.position.x=(i?1:-1)*(p.width-p.shoe)/2/sc;tg.scale.set(p.shoe/sc/.63,deck/1.02,p.track/sc/3.0)}
 housing.visible=!p.open;miniBody.visible=p.open;housing.scale.set(bodyW/2.1,deck/1.02,Math.max(.6,p.tail/sc/1.55));miniBody.position.y=deck;miniBody.scale.set(bodyW/.95,.60/sc,p.tail/sc/.88);
 bladeGroup.visible=p.mini;bladeGroup.position.set(0,0,p.track/sc*.57);bladeGroup.scale.set(bodyW,.35/sc,1/sc);
 const cabFloor=p.open?p.deck:p.deck+.28;
 cab.position.set(p.open?-.08/sc:-(p.width*.25)/sc,cabFloor/sc,.08/sc);
 cab.scale.set(p.cabW/sc/.91,(p.height-cabFloor)/sc/1.22,p.cabD/sc/1.36);
 cabShell.visible=!p.open;canopy.visible=p.open;
 boom.position.set(X,Y,Z);arm.position.z=B;tool.position.z=A;boomVisual.scale.z=B/2.25;armVisual.scale.z=A/1.65;
 const bScale=B/cadBoomLen,aScale=A/2.9;cadBoom.scale.set(p.width/sc/2.8,bScale,bScale);cadArm.scale.set(p.width/sc/2.8,aScale,aScale);
 undercarriage.visible=false;cadUnder.scale.set(p.width/sc/2.8,deck, p.track/sc/3.8244);
}
base.position.set(-s.x,heightAt(-s.x,s.z),s.z);base.rotation.y=-s.yaw;base.scale.set(-s.scale,s.scale,s.scale);upper.rotation.y=s.swing;boom.rotation.x=-s.b;arm.rotation.x=-s.a;tool.rotation.x=-s.k;tools.forEach((o,i)=>o.visible=i===s.att);applyHydraulic(s);chisel.position.z=.96;updateRams(s);flexLines(s,B,A);const inside=s.cab&&s.active;
base.updateMatrixWorld(true);soilStep(s);const local=(p,g=upper)=>g.localToWorld(p);if(inside){camera.position.copy(local(v(-.04,.79,.04),cab));camera.lookAt(camera.position.clone().add(local(v(0,-.10,1),upper).sub(local(v(0,0,0),upper)).multiplyScalar(7)))}else{const distance=Math.max(6.8,p.boom+p.arm+1.5)/sc;camera.position.copy(local(v(-distance*.85,distance*.58,distance*.94),base));camera.lookAt(local(v(s.active?0:2.1/sc,p.height*.48/sc,p.boom*.35/sc),base))}camera.updateMatrixWorld();sun.position.set(-s.x-18,28,s.z+12);sun.target.position.set(-s.x,0,s.z);
const status=s.engine+'/'+s.unlocked;if(status!==lastDisplay){lastDisplay=status;dc.fillStyle='#14201c';dc.fillRect(0,0,256,192);dc.fillStyle=s.engine?'#a0e6a4':'#8a9993';dc.font='bold 23px monospace';dc.fillText(s.engine?'ENGINE ON':'STANDBY',15,40);dc.font='19px monospace';dc.fillText(s.unlocked?'HYD READY':'LOCKED',15,79);dc.fillStyle='#64746a';dc.fillRect(15,112,226,18);dc.fillStyle='#d3ba65';dc.fillRect(15,112,s.engine?155:10,18);dc.font='15px monospace';dc.fillText('FUEL    TEMP',15,155);displayTex.needsUpdate=true}
renderer.render(scene,camera)}
return {draw,resetTerrain,resolveMotion};
}
