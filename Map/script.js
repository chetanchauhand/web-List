
const places = [
 {name:"Manali",info:"Mountains, snow and adventure",lat:32.2432,lng:77.1892},
 {name:"Jaipur",info:"Forts, culture and heritage",lat:26.9124,lng:75.7873},
 {name:"Goa",info:"Beaches and coastal views",lat:15.2993,lng:74.124},
 {name:"Delhi",info:"History, food and monuments",lat:28.6139,lng:77.209},
 {name:"Mumbai",info:"City life and sea views",lat:19.076,lng:72.8777},
 {name:"Srinagar",info:"Lakes and beautiful valleys",lat:34.0837,lng:74.7973}
];

const map = L.map("mapView").setView([22.5,80],4);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
 attribution:"© OpenStreetMap contributors"
}).addTo(map);

places.forEach(p=>{
 L.marker([p.lat,p.lng]).addTo(map).bindPopup(p.name);
});

function renderPlaces(list){
 document.getElementById("destinations").innerHTML=list.map(p=>`
 <article class="destination">
 <h3>${p.name}</h3><p>${p.info}</p>
 <button onclick="selectPlace('${p.name}')">Plan Trip</button>
 </article>`).join("");
}

function selectPlace(name){
 const p=places.find(x=>x.name===name);
 document.getElementById("destination").value=name;
 map.setView([p.lat,p.lng],9);
 L.popup().setLatLng([p.lat,p.lng]).setContent(p.name).openOn(map);
 document.getElementById("planner").scrollIntoView({behavior:"smooth"});
}

function searchPlace(){
 const value=document.getElementById("search").value.trim().toLowerCase();
 const found=places.filter(p=>p.name.toLowerCase().includes(value));
 renderPlaces(found);
 if(found.length===1) selectPlace(found[0].name);
 else if(!found.length) alert("Destination not found in sample list.");
}

function createTrip(){
 const name=document.getElementById("destination").value.trim();
 const days=Number(document.getElementById("days").value);
 const budget=Number(document.getElementById("budget").value);
 if(!name||!Number.isInteger(days)||days<1||!Number.isFinite(budget)||budget<=0){
  alert("Enter a destination, valid days and budget.");
  return;
 }
 const daily=budget/days;
 document.getElementById("itinerary").innerHTML=`
 <h3>${name} Trip Plan</h3>
 <p>Duration: ${days} days</p>
 <p>Total budget: ₹${budget.toLocaleString("en-IN")}</p>
 <p>Daily budget: ₹${daily.toFixed(2)}</p>
 ${Array.from({length:Math.min(days,30)},(_,i)=>`
 <p><b>Day ${i+1}:</b> Explore ${name}, local attractions and food.</p>`).join("")}
 <small>Suggested itinerary only. Verify transport, prices and opening times before travelling.</small>`;
}

renderPlaces(places);
