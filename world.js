
function createWorld(canvas){
const T=THREE, scene=new T.Scene(), renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'}), camera=new T.PerspectiveCamera(58,1,.04,450);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
scene.background=new T.Color(0xb8d0e0);scene.fog=new T.FogExp2(0xb8c9d1,.007);
scene.add(new T.HemisphereLight(0xe1efff,0x8c7858,2.1));const sun=new T.DirectionalLight(0xffedcf,3.0);sun.position.set(-18,28,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:.5,far:80});sun.shadow.bias=-.00025;sun.shadow.normalBias=.03;scene.add(sun,sun.target);
const mat=(color,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const paint=mat(0xdba01b,.38,.38),edge=mat(0xbc8012,.55,.35),steel=mat(0x343b3e,.63,.55),track=mat(0x302e29,.9,.35),shoe=mat(0x55534a,.85,.4),rubber=mat(0x15191a,.95),chrome=mat(0xcdd7dd,.19,.85),inner=mat(0x454a46,.9),seatMat=mat(0x272d30,.92),glass=new T.MeshStandardMaterial({color:0x9ab9c8,transparent:true,opacity:.14,roughness:.18,metalness:.1,depthWrite:false,side:T.DoubleSide}),screen=mat(0x193129,.5);
const v=(x,y,z)=>new T.Vector3(x,y,z);function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g}function mesh(parent,geo,m,x=0,y=0,z=0,shadow=true){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;parent.add(o);return o}function box(p,m,x,y,z,w,h,d){return mesh(p,new T.BoxGeometry(w,h,d),m,x,y,z)}function cyl(p,m,x,y,z,r,h,axis='y',r2=r){const o=mesh(p,new T.CylinderGeometry(r,r2,h,16),m,x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o}function segment(p,m,r){return mesh(p,new T.CylinderGeometry(r,r,1,12),m)}function place(o,a,b){o.position.copy(a).add(b).multiplyScalar(.5);const d=b.clone().sub(a);o.scale.y=Math.max(.001,d.length());o.quaternion.setFromUnitVectors(v(0,1,0),d.normalize())}
function extrude(p,m,points,width,x=0,y=0,z=0,bevel=.035){const sh=new T.Shape();points.forEach(([zz,yy],i)=>i?sh.lineTo(zz,yy):sh.moveTo(zz,yy));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:width,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,steps:1});g.translate(0,0,-width/2);g.rotateY(-Math.PI/2);return mesh(p,g,m,x,y,z)}
let seed=9127;function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=512;const tc=texCanvas.getContext('2d');tc.fillStyle='#99866b';tc.fillRect(0,0,512,512);for(let i=0;i<22000;i++){let q=rnd(),n=Math.floor(70+rnd()*65);tc.fillStyle='rgba('+ (n+25)+','+(n+10)+','+n+','+(.10+rnd()*.22)+')';tc.fillRect(rnd()*512,rnd()*512,1+q*5,1+q*3)}for(let i=0;i<350;i++){tc.fillStyle='rgba(57,44,30,.18)';tc.beginPath();tc.ellipse(rnd()*512,rnd()*512,2+rnd()*5,1+rnd()*2,rnd()*6.28,0,6.28);tc.fill()}const dirt=new T.CanvasTexture(texCanvas);dirt.colorSpace=T.SRGBColorSpace;dirt.wrapS=dirt.wrapT=T.RepeatWrapping;dirt.repeat.set(72,72);dirt.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
const terrainSize=44, subdivisions=176, step=terrainSize/subdivisions, half=terrainSize/2, stride=subdivisions+1;
const geo=new T.PlaneGeometry(terrainSize,terrainSize,subdivisions,subdivisions);geo.rotateX(-Math.PI/2);
const pos=geo.attributes.position, initial=new Float32Array(pos.count), heights=new Float32Array(pos.count), colors=new Float32Array(pos.count*3);
const soilColor=new T.Color(), cDry=new T.Color(0xc2ad8d),cWet=new T.Color(0x74604a),cFresh=new T.Color(0xa1825d);
function paintVertex(i){const delta=heights[i]-initial[i], variation=.92+.08*Math.sin(i*17.17);soilColor.copy(cDry).lerp(delta<0?cWet:cFresh,Math.min(.8,Math.abs(delta)*2.4)).multiplyScalar(variation);colors.set([soilColor.r,soilColor.g,soilColor.b],i*3)}
for(let i=0;i<pos.count;i++){let xx=pos.getX(i),zz=pos.getZ(i);let fade=Math.min(1,Math.max(0,(half-Math.max(Math.abs(xx),Math.abs(zz)))/3));let y=(Math.sin(xx*.38)*Math.cos(zz*.32)*.085+Math.sin(xx*1.4+zz*.7)*.025)*fade;initial[i]=heights[i]=y;pos.setY(i,y);paintVertex(i)}
geo.setAttribute('color',new T.BufferAttribute(colors,3));geo.computeVertexNormals();geo.computeBoundingSphere();geo.boundingSphere.radius+=5;
const detail=dirt.clone();detail.repeat.set(terrainSize/3,terrainSize/3);detail.needsUpdate=true;
const groundMaterial=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,map:detail,bumpMap:detail,bumpScale:.045,roughness:.98});
const ground=mesh(scene,geo,groundMaterial,0,0,0,false);
const outerMat=new T.MeshStandardMaterial({map:dirt,roughness:1,color:0xb5a18a});
for(const [xx,zz,ww,dd] of [[0,-101,202,158],[0,101,202,158],[-101,0,158,44],[101,0,158,44]]){const outer=mesh(scene,new T.PlaneGeometry(ww,dd),outerMat,xx,-.015,zz,false);outer.rotation.x=-Math.PI/2}
let dirty=false,lastNormals=0;
function heightAt(xx,zz){let u=(xx+half)/step,w=(zz+half)/step;if(u<0||w<0||u>=subdivisions||w>=subdivisions)return 0;let ix=Math.floor(u),iz=Math.floor(w),dx=u-ix,dz=w-iz,i=iz*stride+ix;return (heights[i]*(1-dx)+heights[i+1]*dx)*(1-dz)+(heights[i+stride]*(1-dx)+heights[i+stride+1]*dx)*dz}
function change(i,y){heights[i]=y;pos.setY(i,y);paintVertex(i);dirty=true}
function brush(xx,zz,r,fn){let ix=Math.round((xx+half)/step),iz=Math.round((zz+half)/step),n=Math.ceil(r/step);for(let j=Math.max(1,iz-n);j<=Math.min(subdivisions-1,iz+n);j++)for(let k=Math.max(1,ix-n);k<=Math.min(subdivisions-1,ix+n);k++){let d=Math.hypot(k*step-half-xx,j*step-half-zz);if(d<r)fn(j*stride+k,1-d/r)}}
function refreshTerrain(){if(!dirty)return;pos.needsUpdate=true;geo.attributes.color.needsUpdate=true;let now=performance.now();if(now-lastNormals>80){geo.computeVertexNormals();lastNormals=now;dirty=false}}

const earth=mat(0x8f785a,1),grass=mat(0x68764b,1),pine=mat(0x405a38,1),bark=mat(0x6a5440,1),stone=mat(0x77766a,1);
for(let i=0;i<26;i++){const angle=i/26*6.283,rad=65+rnd()*33;let hill=mesh(scene,new T.IcosahedronGeometry(1,2),i%3?grass:earth,Math.sin(angle)*rad,-3,Math.cos(angle)*rad,false);hill.scale.set(18+rnd()*20,6+rnd()*13,14+rnd()*20)}
for(let i=0;i<64;i++){const angle=rnd()*6.28,rad=28+rnd()*48,xx=Math.sin(angle)*rad,zz=Math.cos(angle)*rad,h=2.5+rnd()*3;const tree=group(scene,xx,0,zz);cyl(tree,bark,0,h*.28,0,.12,h*.56);for(let j=0;j<3;j++)mesh(tree,new T.ConeGeometry(h*(.27-j*.045),h*.53,9),pine,0,h*(.48+j*.21),0,false)}
for(let i=0;i<8;i++){let xx=15+rnd()*14,zz=-12+rnd()*30;let pile=mesh(scene,new T.IcosahedronGeometry(1,2),earth,xx,-.24,zz);pile.scale.set(2+rnd()*2,1+rnd()*1.2,2+rnd()*2)}
for(let i=0;i<26;i++){let xx=-14,zz=-23+i*1.8;box(scene,steel,xx,.65,zz,.08,1.3,.08);if(i<25){box(scene,edge,xx,.96,zz+.9,.055,.10,1.8);box(scene,edge,xx,.48,zz+.9,.055,.10,1.8)}}
const orange=mat(0xe86b22,.65),white=mat(0xe5e1d6,.7);for(let i=0;i<6;i++){const cone=group(scene,-5+i*2,0,12);box(cone,rubber,0,.035,0,.42,.07,.42);cyl(cone,orange,0,.25,0,.035,.43,'y',.16);cyl(cone,white,0,.29,0,.075,.09,'y',.10)}
const base=group(scene),upper=group(base),cab=group(upper,-.59,1.58,.08);
box(base,steel,0,.46,0,1.25,.39,2.3);cyl(base,steel,0,.83,0,.70,.20);
for(const side of [-1,1]){const tg=group(base,side*.83,0,0);extrude(tg,track,[[-1.48,.31],[-1.25,.09],[1.25,.09],[1.48,.31],[1.48,.49],[1.25,.70],[-1.25,.70],[-1.48,.49]],.54,0,0,0,.025);for(let j=0;j<6;j++){cyl(tg,shoe,0,.28,-1.12+j*.45,.22,.48,'x');cyl(tg,steel,side*.265,.28,-1.12+j*.45,.095,.035,'x')}for(let j=0;j<16;j++){const zz=-1.27+j*.17;box(tg,shoe,0,.73,zz,.63,.065,.145);box(tg,shoe,0,.065,zz,.63,.065,.145)}for(const end of [-1,1])for(let j=0;j<6;j++){let t=-Math.PI/2+j*Math.PI/5;const o=box(tg,shoe,0,.40+Math.sin(t)*.34,end*(1.24+Math.cos(t)*.26),.63,.065,.16);o.rotation.x=end*(Math.PI/2-t)}}
extrude(upper,paint,[[-1.43,1.02],[-1.55,1.23],[-1.55,1.62],[-1.40,1.82],[.53,1.82],[.68,1.56],[.63,1.02]],1.92,0,0,0,.08);
box(upper,steel,0,1.01,-.35,1.98,.12,2.1);box(upper,paint,.61,1.91,-.60,.67,.22,1.30);box(upper,steel,.62,2.04,-.67,.58,.025,.62);for(let i=0;i<9;i++)box(upper,rubber,.965,1.43,-1.14+i*.10,.022,.20,.035);box(upper,steel,.97,1.23,-.24,.025,.09,.35);cyl(upper,steel,.68,2.12,-1.15,.055,.28);box(upper,edge,.37,1.47,.52,.55,.70,.64);
box(cab,inner,0,.03,0,.91,.12,1.36);box(cab,paint,0,1.16,-.02,.98,.11,1.42);box(cab,steel,0,1.09,.02,.92,.045,1.32);
for(const xx of [-.43,.43])for(const zz of [-.61,.61])box(cab,steel,xx,.60,zz,.075,1.1,.075);
for(const xx of [-.43,.43]){box(cab,steel,xx,.14,0,.065,.09,1.25);box(cab,steel,xx,1.06,0,.065,.06,1.25);box(cab,glass,xx,.60,0,.012,.91,1.16)}
box(cab,glass,0,.60,.61,.82,.91,.012);box(cab,glass,0,.60,-.61,.82,.91,.012);box(cab,steel,0,.22,.61,.84,.06,.065);
box(cab,seatMat,-.04,.23,-.13,.51,.18,.54);const back=box(cab,seatMat,-.04,.54,-.39,.49,.56,.13);back.rotation.x=-.10;box(cab,seatMat,-.04,.84,-.43,.31,.18,.13);
for(const xx of [-.30,.29]){box(cab,inner,xx,.30,.03,.16,.34,.53);box(cab,seatMat,xx,.50,-.09,.16,.08,.36);cyl(cab,rubber,xx,.57,.20,.045,.16);box(cab,rubber,xx,.67,.20,.10,.12,.085)}
for(const xx of [-.09,.10]){box(cab,steel,xx,.09,.45,.12,.055,.24);cyl(cab,steel,xx,.24,.49,.018,.28);box(cab,rubber,xx,.39,.49,.075,.09,.055)}
const monitor=group(cab,.32,.64,.48);monitor.rotation.y=-.35;box(monitor,steel,0,0,0,.25,.20,.06);const displayCanvas=document.createElement('canvas');displayCanvas.width=256;displayCanvas.height=192;const dc=displayCanvas.getContext('2d'),displayTex=new T.CanvasTexture(displayCanvas);displayTex.colorSpace=T.SRGBColorSpace;const monitorFace=box(monitor,new T.MeshBasicMaterial({map:displayTex}),0,0,-.034,.22,.16,.006);let lastDisplay='';
const mirrorArm=segment(cab,steel,.018);place(mirrorArm,v(.43,.92,.52),v(.65,.96,.66));box(cab,steel,.65,.96,.66,.15,.20,.045);box(cab,chrome,.65,.96,.63,.12,.17,.015);
const boom=group(upper,.38,1.45,.55),arm=group(boom,0,0,2.25),tool=group(arm,0,0,1.65);
extrude(boom,paint,[[0,-.16],[.53,-.11],[1.30,.10],[2.25,-.11],[2.25,.14],[1.28,.36],[.50,.24],[0,.17]],.30,0,0,0,.035);
extrude(arm,paint,[[0,-.15],[1.55,-.11],[1.65,-.06],[1.65,.10],[.15,.22],[0,.15]],.23,0,0,0,.023);
for(const g of [boom,arm,tool]){cyl(g,steel,0,0,0,.14,.40,'x');for(const side of [-1,1])cyl(g,chrome,side*.215,0,0,.075,.025,'x')}
function cylinder(parent,r){return [segment(parent,steel,r),segment(parent,chrome,r*.52)]}const lift=cylinder(upper,.085),stickCylinder=cylinder(boom,.065),bucketCylinder=cylinder(arm,.05);
function adjust(pair,a,b,f=.58){const mid=a.clone().lerp(b,f);place(pair[0],a,mid);place(pair[1],mid,b)}
const hoses=[];for(let i=0;i<3;i++){const pts=[v(-.12+i*.065,.17,.05),v(-.12+i*.065,.36,.45),v(-.12+i*.065,.42,1.1),v(-.12+i*.065,.25,1.75),v(-.12+i*.065,.16,2.20)];const curve=new T.CatmullRomCurve3(pts);hoses.push(mesh(boom,new T.TubeGeometry(curve,20,.019,6,false),rubber))}
const tools=[];function bucket(w,teeth, skeleton=false){const g=group(tool);const shape=[[-.10,.04],[.06,.28],[.35,.38],[.64,.32],[.79,.18],[.16,-.13]];for(const side of [-1,1])extrude(g,steel,shape,.055,side*(w/2-.028),0,0,.012);for(let i=0;i<shape.length-1;i++){const [z1,y1]=shape[i],[z2,y2]=shape[i+1];if(i===shape.length-2)continue;let o=box(g,steel,0,(y1+y2)/2,(z1+z2)/2,w,.055,Math.hypot(z2-z1,y2-y1));o.rotation.x=-Math.atan2(y2-y1,z2-z1);if(skeleton&&i>0&&i<4){o.visible=false;for(let j=0;j<7;j++){let bar=box(g,steel,(j-3)*w/7,(y1+y2)/2,(z1+z2)/2,.042,.06,Math.hypot(z2-z1,y2-y1));bar.rotation.x=o.rotation.x}}}for(let i=0;i<teeth;i++){let xx=(i-(teeth-1)/2)*w/(teeth+.5);extrude(g,shoe,[[.70,.22],[.97,.26],[.81,.11]],.085,xx,0,0,.012)}box(g,edge,0,-.085,.12,.30,.14,.24);box(g,shoe,0,.18,.79,w,.065,.09);return g}
tools[0]=bucket(.77,5);tools[1]=bucket(1.30,0);tools[2]=bucket(.38,3);const breaker=group(tool);box(breaker,steel,0,0,.44,.30,.34,.92);box(breaker,paint,0,.03,.38,.32,.23,.64);cyl(breaker,chrome,0,0,1.02,.045,.46,'z');tools[3]=breaker;const fork=group(tool);box(fork,steel,0,0,.14,.86,.16,.18);for(const side of [-1,1])box(fork,steel,side*.27,-.12,.55,.11,.09,.91);tools[4]=fork;tools[5]=bucket(.82,5,true);const jaws=[];for(let i=6;i<=7;i++){const g=group(tool),pair=[];box(g,steel,0,0,.16,.48,.30,.37);for(const side of [-1,1]){let j=group(g,side*.17,0,.26);extrude(j,steel,[[0,-.12],[.52,-.15],[.68,.03],[.42,.16],[0,.12]],.13,0,0,0,.02);pair.push(j)}jaws.push(pair);tools[i]=g}

const carried=mesh(tool,new T.IcosahedronGeometry(1,2),new T.MeshStandardMaterial({color:0x856b4c,map:detail,roughness:1}),0,-.07,.35,false);carried.visible=false;
let soil=0, previousTip=null,previousK=null,lastMachine=null,soilTick=0,lastSoilInfo='',dumping=false;
function resetTerrain(){heights.set(initial);for(let i=0;i<pos.count;i++){pos.setY(i,heights[i]);paintVertex(i)}pos.needsUpdate=true;geo.attributes.color.needsUpdate=true;geo.computeVertexNormals();soil=0;previousTip=null;previousK=null;dumping=false;lastMachine=null;carried.visible=false;dirty=false;lastSoilInfo=''}
function soilStep(s){
const dt=Math.max(0,Math.min(.075,s.dt||0));const bucket=[0,1,2,5].includes(s.att),capacity=Math.max(.01,(s.capacity||.25)*([1,1.15,.55,0,0,.8,0,0][s.att]||1));
const tooth=tool.localToWorld(v(0,s.att===1?.18:.26,s.att===1?.79:.97));
const dk=previousK===null?0:s.k-previousK;const movement=previousTip?tooth.distanceTo(previousTip):0;previousK=s.k;
if(s.active&&s.engine&&s.unlocked&&bucket&&dt>0){
const width=([.77,1.30,.38,0,0,.82][s.att]||.77)*s.scale, radius=Math.max(step*.95,width*.57);
const surface=heightAt(tooth.x,tooth.z);
if(dk>0.00005&&s.k>-.48&&tooth.y>surface+.22&&soil>0)dumping=true;
if(dk<-.00005||s.k<-.60)dumping=false;
if(dumping&&soil>0){const drop=tool.localToWorld(v(0,.12,.7)),amount=Math.min(soil,capacity*dt*1.4);let cells=[],weight=0;brush(drop.x,drop.z,Math.max(.46,width*.85),(i,w)=>{cells.push([i,w]);weight+=w});if(weight>0){for(const [i,w] of cells)change(i,heights[i]+amount*w/weight/(step*step));soil-=amount}}
else if(soil<capacity&&tooth.y<surface+.075*s.scale&&movement>.0003&&(dk<0.00005||Math.abs(dk)<.0001)){
let samples=Math.min(6,Math.max(1,Math.ceil(movement/(step*.55))));for(let j=1;j<=samples;j++){let p=previousTip?previousTip.clone().lerp(tooth,j/samples):tooth;brush(p.x,p.z,radius,(i,w)=>{let dep=Math.min(Math.max(0,heights[i]-p.y+.045*s.scale),(.30+movement/Math.max(dt,.01)*.65)*dt*w/samples,Math.max(0,heights[i]+2.8),(capacity-soil)/(step*step));if(dep>0){change(i,heights[i]-dep);soil+=dep*step*step}})}
}
}
previousTip=tooth.clone();carried.visible=bucket&&soil>capacity*.015;let fullness=Math.min(1,soil/capacity),bw=([.77,1.30,.38,0,0,.82][s.att]||.77);carried.scale.set(bw*.43,.025+.18*Math.cbrt(fullness),.30+.09*fullness);carried.position.y=.14-.065*fullness;refreshTerrain();
let info=bucket?'土量 '+Math.round(soil*1000)/1000+' / '+Math.round(capacity*1000)/1000+' m³':'掘削用バケットに交換';if(info!==lastSoilInfo){lastSoilInfo=info;document.getElementById('soilInfo').textContent=info}
}
let width=0,height=0;

function draw(s){const w=canvas.clientWidth,h=canvas.clientHeight;if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.fov=2*Math.atan(Math.max(Math.tan(29*Math.PI/180),Math.tan(27*Math.PI/180)/camera.aspect))*180/Math.PI;camera.fov=Math.min(108,camera.fov);camera.updateProjectionMatrix()}base.position.set(-s.x,heightAt(-s.x,s.z),s.z);base.rotation.y=-s.yaw;base.scale.set(-s.scale,s.scale,s.scale);upper.rotation.y=s.swing;boom.rotation.x=-s.b;arm.rotation.x=-s.a;tool.rotation.x=-s.k;tools.forEach((o,i)=>o.visible=i===s.att);for(const pair of jaws){pair[0].rotation.y=-s.aux*.34;pair[1].rotation.y=s.aux*.34}adjust(lift,v(.38,1.13,.76),v(.38,1.45+Math.sin(s.b)*1.25, .55+Math.cos(s.b)*1.25));adjust(stickCylinder,v(0,.23,.62),v(0,Math.sin(s.a)*.48,2.25+Math.cos(s.a)*.48));adjust(bucketCylinder,v(0,.15,.57),v(0,Math.sin(s.k)*.23,1.65+Math.cos(s.k)*.23));const inside=s.cab&&s.active;
base.updateMatrixWorld(true);soilStep(s);const local=(p,g=upper)=>g.localToWorld(p);if(inside){camera.position.copy(local(v(-.60,2.35,.29)));camera.lookAt(local(v(-.13,1.60,6)))}else{camera.position.copy(local(v(-6.5,4.1,6.8),base));camera.lookAt(local(v(s.active?0:2.9,1.35,.95),base))}camera.updateMatrixWorld();sun.position.set(-s.x-18,28,s.z+12);sun.target.position.set(-s.x,0,s.z);
const status=s.engine+'/'+s.unlocked;if(status!==lastDisplay){lastDisplay=status;dc.fillStyle='#14201c';dc.fillRect(0,0,256,192);dc.fillStyle=s.engine?'#a0e6a4':'#8a9993';dc.font='bold 23px monospace';dc.fillText(s.engine?'ENGINE ON':'STANDBY',15,40);dc.font='19px monospace';dc.fillText(s.unlocked?'HYD READY':'LOCKED',15,79);dc.fillStyle='#64746a';dc.fillRect(15,112,226,18);dc.fillStyle='#d3ba65';dc.fillRect(15,112,s.engine?155:10,18);dc.font='15px monospace';dc.fillText('FUEL    TEMP',15,155);displayTex.needsUpdate=true}
renderer.render(scene,camera)}
return {draw,resetTerrain};
}
