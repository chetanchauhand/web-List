
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const planets=[
 {name:"Mercury",size:0.38,distance:5,color:0xaaa39b,diameter:"4,879 km",period:"88 days",description:"The smallest planet and the closest planet to the Sun."},
 {name:"Venus",size:0.65,distance:8,color:0xe5b77d,diameter:"12,104 km",period:"225 days",description:"A very hot planet with a dense atmosphere."},
 {name:"Earth",size:0.7,distance:11,color:0x328bdb,diameter:"12,742 km",period:"365 days",description:"Our home planet, known for liquid water and life."},
 {name:"Mars",size:0.53,distance:14,color:0xc65c3c,diameter:"6,779 km",period:"687 days",description:"The red planet with mountains and ancient river valleys."},
 {name:"Jupiter",size:1.8,distance:20,color:0xd1a77c,diameter:"139,820 km",period:"11.86 years",description:"The largest planet in our solar system."},
 {name:"Saturn",size:1.5,distance:27,color:0xd8c18b,diameter:"116,460 km",period:"29.4 years",description:"A gas giant famous for its spectacular ring system."},
 {name:"Uranus",size:1.1,distance:34,color:0x76c8d0,diameter:"50,724 km",period:"84 years",description:"An ice giant that rotates on a dramatically tilted axis."},
 {name:"Neptune",size:1.08,distance:41,color:0x4269d5,diameter:"49,244 km",period:"165 years",description:"A distant ice giant with powerful atmospheric winds."}
];

const container=document.getElementById("solarSystem");

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x080d20);

const camera=new THREE.PerspectiveCamera(
 55,container.clientWidth/container.clientHeight,0.1,1000
);
camera.position.set(0,32,68);
camera.lookAt(0,0,0);

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(container.clientWidth,container.clientHeight);
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff,1.3));

const sunlight=new THREE.PointLight(0xffffff,180,150);
sunlight.position.set(0,0,0);
scene.add(sunlight);

const sunGeometry=new THREE.SphereGeometry(2.8,48,48);
const sunMaterial=new THREE.MeshBasicMaterial({color:0xffb33e});
const sun=new THREE.Mesh(sunGeometry,sunMaterial);
scene.add(sun);

// Background stars
const starPositions=[];
for(let i=0;i<1200;i++){
 starPositions.push(
  (Math.random()-.5)*180,
  (Math.random()-.5)*100,
  (Math.random()-.5)*180
 );
}
const starGeometry=new THREE.BufferGeometry();
starGeometry.setAttribute("position",
 new THREE.Float32BufferAttribute(starPositions,3)
);
const stars=new THREE.Points(
 starGeometry,
 new THREE.PointsMaterial({color:0xffffff,size:0.16})
);
scene.add(stars);

const planetObjects=[];

planets.forEach((p,index)=>{
 const geometry=new THREE.SphereGeometry(p.size,32,32);
 const material=new THREE.MeshStandardMaterial({
  color:p.color,roughness:0.85
 });
 const mesh=new THREE.Mesh(geometry,material);

 mesh.position.set(p.distance,0,0);
 mesh.userData.index=index;
 scene.add(mesh);

 // Orbit path
 const orbit=new THREE.Mesh(
  new THREE.RingGeometry(p.distance-.035,p.distance+.035,120),
  new THREE.MeshBasicMaterial({
   color:0x64739a,side:THREE.DoubleSide,transparent:true,opacity:.45
  })
 );
 orbit.rotation.x=Math.PI/2;
 scene.add(orbit);

 // Saturn's rings
 if(p.name==="Saturn"){
  const ring=new THREE.Mesh(
   new THREE.RingGeometry(1.9,2.9,64),
   new THREE.MeshStandardMaterial({
    color:0xcbb98c,side:THREE.DoubleSide
   })
  );
  ring.rotation.x=Math.PI/2.4;
  mesh.add(ring);
 }

 planetObjects.push(mesh);
});

let selected=2;
let zoom=68;
let cameraAngle=0;
let dragging=false;
let previousX=0;

const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();

function selectPlanet(index){
 selected=index;
 const p=planets[index];

 document.getElementById("planetName").textContent=p.name;
 document.getElementById("planetDescription").textContent=p.description;
 document.getElementById("diameter").textContent=p.diameter;
 document.getElementById("period").textContent=p.period;
 document.getElementById("distance").textContent=
  (p.distance*13.6).toFixed(1)+" million km (illustrative scale)";

 document.querySelectorAll("#planetButtons button").forEach((b,i)=>{
  b.classList.toggle("active",i===index);
 });
}

const buttons=document.getElementById("planetButtons");

planets.forEach((p,i)=>{
 const button=document.createElement("button");
 button.textContent=p.name;
 button.onclick=()=>selectPlanet(i);
 buttons.appendChild(button);
});

selectPlanet(2);

renderer.domElement.addEventListener("click",event=>{
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
 pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
 raycaster.setFromCamera(pointer,camera);

 const hits=raycaster.intersectObjects(planetObjects);
 if(hits.length)selectPlanet(hits[0].object.userData.index);
});

// Drag to rotate view
renderer.domElement.addEventListener("pointerdown",e=>{
 dragging=true;
 previousX=e.clientX;
 renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener("pointerup",()=>dragging=false);
renderer.domElement.addEventListener("pointermove",e=>{
 if(dragging){
  cameraAngle+=(e.clientX-previousX)*.005;
  previousX=e.clientX;
 }
});

document.getElementById("zoomIn").onclick=()=>{
 zoom=Math.max(25,zoom-7);
};
document.getElementById("zoomOut").onclick=()=>{
 zoom=Math.min(110,zoom+7);
};
document.getElementById("reset").onclick=()=>{
 zoom=68;
 cameraAngle=0;
};

function animate(){
 requestAnimationFrame(animate);

 const time=Date.now()*.0002;

 planetObjects.forEach((mesh,i)=>{
  const p=planets[i];
  const speed=0.5/(i+1);
  const angle=time*speed;
  mesh.position.x=Math.cos(angle)*p.distance;
  mesh.position.z=Math.sin(angle)*p.distance;
  mesh.rotation.y+=.003;
 });

 const target=planetObjects[selected].position;

 camera.position.x=Math.sin(cameraAngle)*zoom;
 camera.position.z=Math.cos(cameraAngle)*zoom;
 camera.position.y=zoom*.47;
 camera.lookAt(target.x*.2,0,target.z*.2);

 renderer.render(scene,camera);
}
animate();

window.addEventListener("resize",()=>{
 const width=container.clientWidth;
 const height=container.clientHeight;
 camera.aspect=width/height;
 camera.updateProjectionMatrix();
 renderer.setSize(width,height);
});
