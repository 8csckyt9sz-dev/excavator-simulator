
function createWorld(canvas){
const T=THREE, scene=new T.Scene(), renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'}), camera=new T.PerspectiveCamera(58,1,.04,450);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;
scene.background=new T.Color(0xb8d0e0);scene.fog=new T.FogExp2(0xb8c9d1,.007);
scene.add(new T.HemisphereLight(0xe1efff,0x8c7858,1.45));const sun=new T.DirectionalLight(0xffedcf,2.65);sun.position.set(-18,28,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:.5,far:80});sun.shadow.bias=-.00025;sun.shadow.normalBias=.03;scene.add(sun,sun.target);
const mat=(color,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const paint=mat(0xe4a622,.43,.23),edge=mat(0xbc8012,.55,.35),steel=mat(0x343b3e,.63,.55),track=mat(0x302e29,.9,.35),shoe=mat(0x55534a,.85,.4),rubber=mat(0x15191a,.95),chrome=mat(0xcdd7dd,.20,.82),inner=mat(0x454a46,.9),seatMat=mat(0x272d30,.92),glass=new T.MeshStandardMaterial({color:0x9ab9c8,transparent:true,opacity:.14,roughness:.18,metalness:.1,depthWrite:false,side:T.DoubleSide}),screen=mat(0x193129,.5);
const v=(x,y,z)=>new T.Vector3(x,y,z);function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g}function mesh(parent,geo,m,x=0,y=0,z=0,shadow=true){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;parent.add(o);return o}function box(p,m,x,y,z,w,h,d){return mesh(p,new T.BoxGeometry(w,h,d),m,x,y,z)}function cyl(p,m,x,y,z,r,h,axis='y',r2=r){const o=mesh(p,new T.CylinderGeometry(r,r2,h,16),m,x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o}function segment(p,m,r){return mesh(p,new T.CylinderGeometry(r,r,1,12),m)}function place(o,a,b){o.position.copy(a).add(b).multiplyScalar(.5);const d=b.clone().sub(a);o.scale.y=Math.max(.001,d.length());o.quaternion.setFromUnitVectors(v(0,1,0),d.normalize())}
function extrude(p,m,points,width,x=0,y=0,z=0,bevel=.035){const sh=new T.Shape();points.forEach(([zz,yy],i)=>i?sh.lineTo(zz,yy):sh.moveTo(zz,yy));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:width,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,steps:1});g.translate(0,0,-width/2);g.rotateY(-Math.PI/2);return mesh(p,g,m,x,y,z)}
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
const base=group(scene),upper=group(base),cab=group(upper,-.59,1.58,.08);
box(base,steel,0,.46,0,1.25,.39,2.3);cyl(base,steel,0,.83,0,.70,.20);
for(const side of [-1,1]){const tg=group(base,side*.83,0,0);extrude(tg,track,[[-1.48,.31],[-1.25,.09],[1.25,.09],[1.48,.31],[1.48,.49],[1.25,.70],[-1.25,.70],[-1.48,.49]],.54,0,0,0,.025);for(let j=0;j<6;j++){cyl(tg,shoe,0,.28,-1.12+j*.45,.22,.48,'x');cyl(tg,steel,side*.265,.28,-1.12+j*.45,.095,.035,'x')}for(let j=0;j<16;j++){const zz=-1.27+j*.17;box(tg,shoe,0,.73,zz,.63,.065,.145);box(tg,shoe,0,.065,zz,.63,.065,.145)}for(const end of [-1,1])for(let j=0;j<6;j++){let t=-Math.PI/2+j*Math.PI/5;const o=box(tg,shoe,0,.40+Math.sin(t)*.34,end*(1.24+Math.cos(t)*.26),.63,.065,.16);o.rotation.x=end*(Math.PI/2-t)}}
extrude(upper,paint,[[-1.43,1.02],[-1.55,1.23],[-1.55,1.59],[-1.46,1.72],[-1.31,1.80],[-.55,1.82],[-.50,1.05]],1.92,0,0,0,.065);
extrude(upper,paint,[[-.61,1.04],[-.61,1.72],[.34,1.72],[.60,1.51],[.63,1.04]],.83,.53,0,0,.045);
box(upper,steel,-.60,1.13,.02,.76,.22,1.18);for(let i=0;i<3;i++)box(upper,shoe,-1.00,1.05+i*.12,.48-i*.20,.24,.05,.22);
for(let i=0;i<3;i++)box(upper,rubber,.98,1.63,-.75+i*.22,.018,.022,.15);
const panelLine=mat(0x6c501f,.8);box(upper,panelLine,.976,1.44,-.49,.013,.45,.018);box(upper,panelLine,.976,1.18,-.75,.013,.015,.53);
for(const xx of [-.69,.69]){box(upper,steel,xx,1.43,-1.55,.21,.13,.035);box(upper,mat(0xb64423,.35),xx,1.43,-1.574,.15,.08,.015)}

box(upper,steel,0,1.01,-.35,1.98,.12,2.1);box(upper,paint,.61,1.91,-.60,.67,.22,1.30);box(upper,steel,.62,2.04,-.67,.58,.025,.62);for(let i=0;i<9;i++)box(upper,rubber,.965,1.43,-1.14+i*.10,.022,.20,.035);box(upper,steel,.97,1.23,-.24,.025,.09,.35);cyl(upper,steel,.68,2.12,-1.15,.055,.28);box(upper,edge,.37,1.47,.52,.55,.70,.64);
box(cab,inner,0,.03,0,.91,.12,1.36);box(cab,paint,0,1.16,-.02,.98,.11,1.42);box(cab,steel,0,1.09,.02,.92,.045,1.32);
for(const xx of [-.43,.43])for(const zz of [-.61,.61])box(cab,steel,xx,.60,zz,.075,1.1,.075);
for(const xx of [-.43,.43]){box(cab,steel,xx,.14,0,.065,.09,1.25);box(cab,steel,xx,1.06,0,.065,.06,1.25);box(cab,glass,xx,.60,0,.012,.91,1.16)}
box(cab,glass,0,.60,.61,.82,.91,.012);box(cab,glass,0,.60,-.61,.82,.91,.012);box(cab,steel,0,.22,.61,.84,.06,.065);box(cab,rubber,-.43,.60,.36,.022,.91,.032);box(cab,steel,-.44,.54,.05,.035,.04,.17);// Park the front wiper against the outside lower window edge.
const wiperPivot=cyl(cab,steel,-.31,.27,.64,.018,.018,'z');
const wiper=segment(cab,rubber,.005);place(wiper,v(-.31,.27,.646),v(.03,.30,.646));
const blade=segment(cab,rubber,.007);place(blade,v(-.12,.305,.65),v(.33,.345,.65));for(let i=0;i<5;i++)box(cab,rubber,0,.087,.10+i*.065,.42,.012,.021);
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
const tools=[];const worn=mat(0x777774,.54,.69),bucketSteel=mat(0x555653,.74,.56);
function curvedPlate(p,points,w,m){const curve=new T.CatmullRomCurve3(points.map(([z,y])=>v(0,y,z)),false,'centripetal');let verts=[],ix=[],normals;const count=22;for(let j=0;j<=count;j++){let q=curve.getPoint(j/count);verts.push(-w/2,q.y,q.z,w/2,q.y,q.z)}for(let j=0;j<count;j++){let i=j*2;ix.push(i,i+1,i+2,i+1,i+3,i+2)}const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(verts,3));geom.setIndex(ix);geom.computeVertexNormals();let mm=m.clone();mm.side=T.DoubleSide;return mesh(p,geom,mm)}
function bucket(w,teeth,skeleton=false){
const g=group(tool);
const profile=[[-.09,.035],[.025,.19],[.16,.32],[.32,.39],[.49,.38],[.63,.31],[.74,.23],[.79,.18]];
// Continuous curved back and open mouth; the side plates taper toward the lip.
const shape=[...profile,[.69,.12],[.49,.015],[.25,-.075],[.12,-.095]];
for(const side of [-1,1]){
 extrude(g,bucketSteel,shape,.038,side*(w/2-.019),0,0,.009);
 const rim=segment(g,worn,.010);place(rim,v(side*w*.5,-.095,.12),v(side*w*.5,.18,.79));
}
if(skeleton){for(let j=0;j<8;j++){let rib=curvedPlate(g,profile,.032,bucketSteel);rib.position.x=(j-3.5)*w/8}}
else {curvedPlate(g,profile,w,bucketSteel);curvedPlate(g,profile.map(([z,y])=>[z,y-.018]),w-.05,worn)}
box(g,bucketSteel,0,-.065,.065,Math.min(.30,w*.78),.11,.18);
const lip=box(g,worn,0,.18,.79,w,.045,.10);lip.rotation.x=.23;
for(let j=0;j<(skeleton?0:3);j++){let strip=curvedPlate(g,[[.05,.23],[.17,.345],[.32,.41],[.49,.40],[.62,.335]],.047,worn);strip.position.x=(j-1)*w/3}
for(let i=0;i<teeth;i++){
 const xx=(i-(teeth-1)/2)*w/(teeth+.5);
 box(g,bucketSteel,xx,.19,.80,.085,.070,.115);
 // tapered tooth: broad adapter, narrow cutting tip
 const vertices=[-.045,.15,.78,.045,.15,.78,.045,.23,.78,-.045,.23,.78,-.019,.25,.97,.019,.25,.97,.019,.265,.97,-.019,.265,.97];
 const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geom.setIndex([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5]);geom.computeVertexNormals();mesh(g,geom,worn,xx,0,0);
}
for(const xx of [-.15,.15]){
 extrude(g,bucketSteel,[[-.08,-.04],[.18,-.12],[.28,.04],[.07,.13]],.052,xx,0,0,.011);
 cyl(g,worn,xx,.015,.03,.065,.075,'x');
}
return g}
tools[0]=bucket(.77,5);tools[1]=bucket(1.30,0);tools[2]=bucket(.38,3);const breaker=group(tool);box(breaker,steel,0,0,.44,.30,.34,.92);box(breaker,paint,0,.03,.38,.32,.23,.64);cyl(breaker,chrome,0,0,1.02,.045,.46,'z');tools[3]=breaker;const fork=group(tool);box(fork,steel,0,0,.14,.86,.16,.18);for(const side of [-1,1])box(fork,steel,side*.27,-.12,.55,.11,.09,.91);tools[4]=fork;tools[5]=bucket(.82,5,true);const jaws=[];for(let i=6;i<=7;i++){const g=group(tool),pair=[];box(g,steel,0,0,.16,.48,.30,.37);for(const side of [-1,1]){let j=group(g,side*.17,0,.26);extrude(j,steel,[[0,-.12],[.52,-.15],[.68,.03],[.42,.16],[0,.12]],.13,0,0,0,.02);pair.push(j)}jaws.push(pair);tools[i]=g}


const soilMat=new T.MeshStandardMaterial({color:0x947454,roughness:1,side:T.DoubleSide});
const carried=mesh(tool,new T.BufferGeometry(),soilMat,0,0,0,false);carried.visible=false;
const clodGeo=new T.IcosahedronGeometry(1,1),clodMat=mat(0x8d6c4e,1);
const intake=new T.InstancedMesh(clodGeo,clodMat,64),falling=new T.InstancedMesh(clodGeo,clodMat,96);
intake.count=falling.count=0;intake.frustumCulled=falling.frustumCulled=false;tool.add(intake);scene.add(falling);
const clodDummy=new T.Object3D(),incoming=[],drops=[];
let pendingCut=0;let soil=0,previousTip=null,previousK=null,previousA=null,lastSoilInfo='',dumping=false,lastFillTime=-1,lastFill=-1,spillDelay=0;
const cavity=[[-.045,.045],[.035,.19],[.17,.315],[.32,.365],[.49,.355],[.62,.29],[.74,.21],[.765,.17],[.12,-.075]];
function area(poly){let sum=0;for(let i=0;i<poly.length;i++){let a=poly[i],b=poly[(i+1)%poly.length];sum+=a[0]*b[1]-a[1]*b[0]}return Math.abs(sum)*.5}
function clipFill(poly,ny,nz,level){let out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a[1]*ny+a[0]*nz-level,db=b[1]*ny+b[0]*nz-level;if(da<=0)out.push(a);if((da<=0)!==(db<=0)){let t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}return out}
function fillPolygon(f,ny,nz){let lo=Infinity,hi=-Infinity;for(const [z,y] of cavity){let h=y*ny+z*nz;lo=Math.min(lo,h);hi=Math.max(hi,h)}let target=area(cavity)*Math.max(0,Math.min(.96,f*.96));for(let i=0;i<15;i++){let mid=(lo+hi)/2;if(area(clipFill(cavity,ny,nz,mid))<target)lo=mid;else hi=mid}return clipFill(cavity,ny,nz,(lo+hi)/2)}
function updateFill(f,bw,ny,nz,now){carried.visible=f>.002;if(!carried.visible)return;if(now-lastFillTime<75&&Math.abs(f-lastFill)<.035)return;lastFillTime=now;lastFill=f;let points=fillPolygon(f,ny,nz);if(points.length<3)return;const sh=new T.Shape();points.forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:Math.max(.08,bw-.10),bevelEnabled:false});g.translate(0,0,-(bw-.10)/2);g.rotateY(-Math.PI/2);g.computeVertexNormals();carried.geometry.dispose();carried.geometry=g}
function spawnIntake(amount,bw,scale,cap,tipY,tipZ){if(amount<=0)return;let n=Math.min(5,Math.max(1,Math.ceil(amount/(cap*.012))));while(n--&&incoming.length<64){let xx=(rnd()-.5)*bw*.80;incoming.push({t:0,life:.22+rnd()*.22,start:v(xx,tipY-.025,tipZ),end:v(xx*.65,.22,.30+rnd()*.16),size:.025+rnd()*.035,amount:amount/Math.min(5,Math.max(1,Math.ceil(amount/(cap*.012))))})}}
function deposit(xx,zz,amount,radius){let cells=[],total=0;brush(xx,zz,radius,(i,w)=>{cells.push([i,w]);total+=w});if(total<=0)return false;for(const [i,w] of cells)change(i,heights[i]+amount*w/total/(step*step));return true}
function launchDrops(amount,bw,s,cap){if(amount<=0||drops.length>=96)return 0;let n=Math.min(96-drops.length,Math.max(1,Math.min(5,Math.ceil(amount/(cap*.018)))));for(let i=0;i<n;i++){let start=tool.localToWorld(v((rnd()-.5)*bw*.76,.10,.74+rnd()*.10));let end=tool.localToWorld(v(0,-.32,.95)),origin=tool.localToWorld(v(0,0,0));let vel=end.sub(origin).normalize().multiplyScalar(.18+rnd()*.45);vel.y-=.15;drops.push({p:start,vel,amount:amount/n,r:Math.max(.025,Math.cbrt(amount/n)*.42),life:0,spread:Math.max(.28,bw*s.scale*.62)})}return amount}
function animateSoil(dt){let transit=0;for(let i=incoming.length-1;i>=0;i--){let p=incoming[i];p.t+=dt;if(p.t>=p.life)incoming.splice(i,1);else transit+=p.amount*(1-p.t/p.life)}intake.count=incoming.length;incoming.forEach((p,i)=>{let t=p.t/p.life,sm=t*t*(3-2*t);clodDummy.position.copy(p.start).lerp(p.end,sm);clodDummy.position.y-=Math.sin(t*Math.PI)*.13;clodDummy.scale.set(p.size,p.size*.8,p.size*.9);clodDummy.rotation.set(t*3,i,t*5);clodDummy.updateMatrix();intake.setMatrixAt(i,clodDummy.matrix)});intake.instanceMatrix.needsUpdate=true;
for(let i=drops.length-1;i>=0;i--){let p=drops[i];p.life+=dt;p.vel.y-=9.81*dt;p.p.addScaledVector(p.vel,dt);if(p.p.y<=heightAt(p.p.x,p.p.z)+p.r*.4||p.life>4){if(!deposit(p.p.x,p.p.z,p.amount,p.spread))deposit(Math.max(-half+.5,Math.min(half-.5,p.p.x)),Math.max(-half+.5,Math.min(half-.5,p.p.z)),p.amount,p.spread);drops.splice(i,1)}}falling.count=drops.length;drops.forEach((p,i)=>{clodDummy.position.copy(p.p);clodDummy.scale.set(p.r,p.r*.85,p.r*.9);clodDummy.rotation.set(p.life*5,i,p.life*3);clodDummy.updateMatrix();falling.setMatrixAt(i,clodDummy.matrix)});falling.instanceMatrix.needsUpdate=true;return transit}
function resetTerrain(){heights.set(initial);for(let i=0;i<pos.count;i++){pos.setY(i,heights[i]);paintVertex(i)}pos.needsUpdate=true;geo.attributes.color.needsUpdate=true;geo.computeVertexNormals();soil=0;pendingCut=0;previousTip=null;previousK=null;previousA=null;dumping=false;spillDelay=0;carried.visible=false;incoming.length=drops.length=0;intake.count=falling.count=0;dirty=false;unstable.clear();lastSoilInfo='';lastFill=-1;lastFillTime=-1}
// Isolate arm/bucket cutting travel from boom, swing and track motion.
function scoopTravel(b,a,k,oldA,oldK,tipY,tipZ){
 if(oldA===null||oldK===null||!(a<oldA-1e-8||k<oldK-1e-8))return 0;
 const point=(aa,kk)=>{const t=b+aa+kk;return [1.65*Math.sin(b+aa)+tipY*Math.cos(t)+tipZ*Math.sin(t),1.65*Math.cos(b+aa)-tipY*Math.sin(t)+tipZ*Math.cos(t)]};
 const p=point(a,k),q=point(oldA,oldK),t=b+a+k;
 const ny=-.9*Math.cos(t)+.44*Math.sin(t),nz=.9*Math.sin(t)+.44*Math.cos(t);
 return Math.max(0,(p[0]-q[0])*ny+(p[1]-q[1])*nz);
}

const bucketWidths=[.77,1.30,.38,0,0,.82,0,0];
const toolSamples=Array.from({length:8},(_,att)=>{
 const points=[],bw=bucketWidths[att];
 if(bw){for(const xx of [-bw*.48,0,bw*.48]){
  for(const [zz,yy] of [[-.09,.035],[.025,.19],[.16,.32],[.32,.39],[.49,.38],[.63,.31],[.74,.23],[.12,-.095]])points.push([xx,yy,zz,0]);
  points.push([xx,.18,.79,1]);if(att!==1)points.push([xx,.26,.97,1]);
 }}else if(att===3){for(const [zz,yy] of [[.05,-.16],[.45,-.17],[.85,-.16],[1.25,0]])points.push([0,yy,zz,0],[.14,yy,zz,0],[-.14,yy,zz,0])}
 else if(att===4){for(const xx of [-.32,.32])for(const zz of [.1,.5,1.0])points.push([xx,-.17,zz,0])}
 else{for(const xx of [-.32,0,.32])for(const zz of [.1,.45,.94])points.push([xx,-.15,zz,0],[xx,.15,zz,0])}
 return points;
});
function collisionDepth(s,cutting){
 const angle=s.b+s.a+s.k,armAngle=s.b+s.a,t=s.yaw+s.swing,cs=Math.cos(t),sn=Math.sin(t),baseY=heightAt(-s.x,s.z),sc=s.scale;
 const hy=1.45+2.25*Math.sin(s.b)+1.65*Math.sin(armAngle),hz=.55+2.25*Math.cos(s.b)+1.65*Math.cos(armAngle);
 let worst=0;
 function sample(xx,yy,zz,allow){
  const lx=.38+xx,wx=-s.x-sc*(lx*cs+zz*sn),wz=s.z+sc*(-lx*sn+zz*cs),wy=baseY+sc*yy;
  worst=Math.max(worst,heightAt(wx,wz)-wy-allow*sc);
 }
 for(const [xx,yy,zz,lip] of toolSamples[s.att]||[]){sample(xx,hy+yy*Math.cos(angle)+zz*Math.sin(angle),hz-yy*Math.sin(angle)+zz*Math.cos(angle),lip?(cutting?.20:.065):(cutting?.09:.025))}
 for(const d of [.3,.7,1.15,1.58]){sample(0,1.45+2.25*Math.sin(s.b)+d*Math.sin(armAngle)-.12,.55+2.25*Math.cos(s.b)+d*Math.cos(armAngle),.015)}
 return worst;
}

function toolPoint(s,xx,yy,zz){
 const angle=s.b+s.a+s.k,armAngle=s.b+s.a,t=s.yaw+s.swing,cs=Math.cos(t),sn=Math.sin(t),sc=s.scale;
 const lx=.38+xx,ly=1.45+2.25*Math.sin(s.b)+1.65*Math.sin(armAngle)+yy*Math.cos(angle)+zz*Math.sin(angle),lz=.55+2.25*Math.cos(s.b)+1.65*Math.cos(armAngle)-yy*Math.sin(angle)+zz*Math.cos(angle);
 return {x:-s.x-sc*(lx*cs+lz*sn),y:heightAt(-s.x,s.z)+sc*ly,z:s.z+sc*(-lx*sn+lz*cs)};
}
// Excavate the swept solid envelope BEFORE collision is evaluated. A vertical touch alone never loads soil.
function preCut(prev,next){
 const bw=bucketWidths[next.att];if(!bw)return 0;
 const ty=next.att===1?.18:.26,tz=next.att===1?.79:.97;
 const a=toolPoint(prev,0,ty,tz),b=toolPoint(next,0,ty,tz);
 const travel=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
 if(travel<1e-7)return 0;
 // Closing the bucket or pulling the arm is an active cut; never infer a cut from contact alone.
 if(!(next.a<prev.a-1e-8||next.k<prev.k-1e-8)||next.k>prev.k+1e-7)return 0;
 const targets=new Map(),radius=step*.92;
 const count=Math.min(6,Math.max(1,Math.ceil(travel/(step*.4))));
 for(let j=1;j<=count;j++){
  const q={...next};for(const key of ['x','z','yaw','swing','b','a','k'])q[key]=prev[key]+(next[key]-prev[key])*j/count;
  for(const [xx,yy,zz,lip] of toolSamples[q.att]){
   const p=toolPoint(q,xx,yy,zz);
   const depth=heightAt(p.x,p.z)-p.y;
   if(depth<.009*q.scale||p.y<heightAt(-q.x,q.z)-2.8*q.scale)continue;
   // The soil immediately surrounding the contact must yield for the shell to advance.
   brush(p.x,p.z,radius,(i,w)=>{
    if(w<=0)return;
    const target=Math.max(-2.8,p.y-.012*q.scale);
    if(heights[i]>target)targets.set(i,Math.min(target,targets.get(i)??Infinity));
   });
  }
 }
 let removed=0;
 for(const [i,target] of targets){
  const old=heights[i],dep=Math.min(old-target,Math.max(.007*next.scale,travel*.9));
  if(dep>0){change(i,old-dep);removed+=dep*step*step}
 }
 if(removed>0){
  const cap=Math.max(.01,(next.capacity||.25)*([1,1.15,.55,0,0,.8,0,0][next.att]||1));
  const collected=Math.min(Math.max(0,cap-soil),removed*.88);
  soil+=collected;pendingCut+=collected;
  const excess=removed-collected,t=next.yaw+next.swing,offset=bw*next.scale*.75+step;
  for(const sign of [-1,1]){
   const x=b.x+Math.cos(t)*offset*sign,z=b.z+Math.sin(t)*offset*sign;
   if(!deposit(x,z,excess*.5,Math.max(step*1.5,bw*next.scale*.4)))deposit(b.x,b.z,excess*.5,step*2);
  }
 }
 return removed;
}

function resolveMotion(prev,next){
 if(!next.active||!next.engine||!next.unlocked)return next;
 const bw=bucketWidths[next.att],cutting=!!bw&&(next.a<prev.a-1e-8||next.k<prev.k-1e-8)&&next.k<=prev.k+1e-7;
 if(cutting)preCut(prev,next);
 const baseline=collisionDepth(prev,cutting),limit=baseline+.00002;
 if(collisionDepth(next,cutting)<=limit)return next;
 const keys=['x','z','yaw','swing','b','a','k'];let lo=0,hi=1;
 for(let i=0;i<12;i++){let mid=(lo+hi)/2,p={...next};for(const key of keys)p[key]=prev[key]+(next[key]-prev[key])*mid;if(collisionDepth(p,cutting)<=limit)lo=mid;else hi=mid}
 let accepted={...next};for(const key of keys)accepted[key]=prev[key]+(next[key]-prev[key])*lo;
 for(const key of ['b','a','k','swing','yaw','x','z']){let candidate={...accepted,[key]:next[key]};if(collisionDepth(candidate,cutting)<=limit)accepted=candidate}
 accepted.contact=true;return accepted;
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
 const mouthUp=-.9*ny+.44*nz;
 if(mouthUp>=.10)return 1;
 const repose=Math.min(.50,Math.max(0,.48*(1+mouthUp)));
 const ey=ny-.9*repose,ez=nz+.44*repose;
 const lip1=cavity[cavity.length-1],lip2=cavity[cavity.length-2];
 const level=Math.min(lip1[1]*ey+lip1[0]*ez,lip2[1]*ey+lip2[0]*ez);
 return Math.max(0,Math.min(1,area(clipFill(cavity,ey,ez,level))/area(cavity)));
}
function soilStep(s){
const dt=Math.max(0,Math.min(.075,s.dt||0));const bucket=[0,1,2,5].includes(s.att),capacity=Math.max(.01,(s.capacity||.25)*([1,1.15,.55,0,0,.8,0,0][s.att]||1));
const tipY=s.att===1?.18:.26,tipZ=s.att===1?.79:.97;
const tooth=tool.localToWorld(v(0,tipY,tipZ));
const dk=previousK===null?0:s.k-previousK;
const scoop=scoopTravel(s.b,s.a,s.k,previousA,previousK,tipY,tipZ)*s.scale;
const mouth=tool.localToWorld(v(0,-.9,.44)).sub(tool.localToWorld(v(0,0,0))).normalize();
const displacement=previousTip?tooth.clone().sub(previousTip):v(0,0,0);
const movement=displacement.length(),cutTravel=Math.min(scoop,Math.max(0,displacement.dot(mouth)));
previousK=s.k;previousA=s.a;
if(s.active&&s.engine&&s.unlocked&&bucket&&dt>0){
const bw=bucketWidths[s.att],width=bw*s.scale,radius=Math.max(step*1.2,width*.55);
const surface=heightAt(tooth.x,tooth.z),angle=s.b+s.a+s.k;
const axis=tool.localToWorld(v(1,0,0)).sub(tool.localToWorld(v(0,0,0)));axis.y=0;axis.normalize();
const isCutting=pendingCut>0||(previousTip&&cutTravel>1e-7&&dk<=.00005&&tooth.y<surface+.025*s.scale);
const stableVolume=capacity*retainedFraction(Math.cos(angle),Math.sin(angle));
const canSpill=mouth.y<-.10&&tooth.y>surface+.08;
spillDelay=canSpill&&!isCutting?spillDelay+dt:0;
dumping=soil>stableVolume+.00001&&canSpill&&!isCutting&&(dk>0.00005||spillDelay>.18);
if(dumping){const amount=Math.min(soil-stableVolume,capacity*dt*(.3+Math.max(0,-mouth.y)*1.6));soil-=launchDrops(amount,bw,s,capacity)}
if(pendingCut>0){spawnIntake(pendingCut,bw,s.scale,capacity,tipY,tipZ);pendingCut=0}
}
previousTip=tooth.clone();
const transit=animateSoil(dt),bw=([.77,1.30,.38,0,0,.82][s.att]||.77),angle=s.b+s.a+s.k;
updateFill(bucket?Math.min(1,Math.max(0,soil-transit)/capacity):0,bw,Math.cos(angle),Math.sin(angle),performance.now());
relaxSoil(dt);refreshTerrain();
let info=bucket?'土量 '+Math.round(soil*1000)/1000+' / '+Math.round(capacity*1000)/1000+' m³':'掘削用バケットに交換';if(s.contact)info+=' / 接地・負荷';if(info!==lastSoilInfo){lastSoilInfo=info;document.getElementById('soilInfo').textContent=info}
}
let width=0,height=0;

function draw(s){const w=canvas.clientWidth,h=canvas.clientHeight;if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.fov=2*Math.atan(Math.max(Math.tan(29*Math.PI/180),Math.tan(27*Math.PI/180)/camera.aspect))*180/Math.PI;camera.fov=Math.min(108,camera.fov);camera.updateProjectionMatrix()}base.position.set(-s.x,heightAt(-s.x,s.z),s.z);base.rotation.y=-s.yaw;base.scale.set(-s.scale,s.scale,s.scale);upper.rotation.y=s.swing;boom.rotation.x=-s.b;arm.rotation.x=-s.a;tool.rotation.x=-s.k;tools.forEach((o,i)=>o.visible=i===s.att);for(const pair of jaws){pair[0].rotation.y=-s.aux*.34;pair[1].rotation.y=s.aux*.34}adjust(lift,v(.38,1.13,.76),v(.38,1.45+Math.sin(s.b)*1.25, .55+Math.cos(s.b)*1.25));adjust(stickCylinder,v(0,.23,.62),v(0,Math.sin(s.a)*.48,2.25+Math.cos(s.a)*.48));adjust(bucketCylinder,v(0,.15,.57),v(0,Math.sin(s.k)*.23,1.65+Math.cos(s.k)*.23));const inside=s.cab&&s.active;
base.updateMatrixWorld(true);soilStep(s);const local=(p,g=upper)=>g.localToWorld(p);if(inside){camera.position.copy(local(v(-.60,2.35,.29)));camera.lookAt(local(v(-.13,1.60,6)))}else{camera.position.copy(local(v(-6.5,4.1,6.8),base));camera.lookAt(local(v(s.active?0:2.9,1.35,.95),base))}camera.updateMatrixWorld();sun.position.set(-s.x-18,28,s.z+12);sun.target.position.set(-s.x,0,s.z);
const status=s.engine+'/'+s.unlocked;if(status!==lastDisplay){lastDisplay=status;dc.fillStyle='#14201c';dc.fillRect(0,0,256,192);dc.fillStyle=s.engine?'#a0e6a4':'#8a9993';dc.font='bold 23px monospace';dc.fillText(s.engine?'ENGINE ON':'STANDBY',15,40);dc.font='19px monospace';dc.fillText(s.unlocked?'HYD READY':'LOCKED',15,79);dc.fillStyle='#64746a';dc.fillRect(15,112,226,18);dc.fillStyle='#d3ba65';dc.fillRect(15,112,s.engine?155:10,18);dc.font='15px monospace';dc.fillText('FUEL    TEMP',15,155);displayTex.needsUpdate=true}
renderer.render(scene,camera)}
return {draw,resetTerrain,resolveMotion};
}
