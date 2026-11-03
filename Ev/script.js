
const events=[
 {id:1,name:"Indie Music Night",category:"Music",date:"2026-12-12",place:"Ludhiana",description:"An evening of independent music."},
 {id:2,name:"Web Development Summit",category:"Technology",date:"2026-12-18",place:"Delhi",description:"Explore modern web technologies."},
 {id:3,name:"Cricket Championship",category:"Sports",date:"2026-12-20",place:"Chandigarh",description:"A local cricket tournament."},
 {id:4,name:"AI & ML Workshop",category:"Technology",date:"2027-01-05",place:"Bengaluru",description:"Learn about artificial intelligence."},
 {id:5,name:"Photography Exhibition",category:"Education",date:"2027-01-12",place:"Jaipur",description:"Discover creative photography."},
 {id:6,name:"College Music Festival",category:"Music",date:"2027-01-20",place:"Amritsar",description:"Music, performances and culture."}
];

let favorites=JSON.parse(localStorage.getItem("eventFavorites"))||[];

function escapeHTML(s){
 return s.replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
 })[c]);
}

function render(){
 const q=document.getElementById("search").value.toLowerCase();
 const cat=document.getElementById("category").value;

 const filtered=events.filter(e=>
 (cat==="All"||e.category===cat)&&
 (e.name+" "+e.place+" "+e.description).toLowerCase().includes(q)
 );

 document.getElementById("eventList").innerHTML=filtered.map(e=>`
 <article class="event">
 <p class="date">${e.date}</p>
 <h3>${escapeHTML(e.name)}</h3>
 <p>${escapeHTML(e.category)} · ${escapeHTML(e.place)}</p>
 <p>${escapeHTML(e.description)}</p>
 <button onclick="toggleFavorite(${e.id})">
 ${favorites.includes(e.id)?"★ Saved":"☆ Save"}
 </button>
 <button onclick="addCalendar(${e.id})">Add to Calendar</button>
 </article>`).join("")||"<p>No matching events.</p>";

 document.getElementById("favorites").innerHTML=
 favorites.map(id=>events.find(e=>e.id===id)).filter(Boolean).map(e=>`
 <div class="favorite">
 <b>${escapeHTML(e.name)}</b> — ${e.date}, ${escapeHTML(e.place)}
 <button onclick="toggleFavorite(${e.id})">Remove</button>
 </div>`).join("")||"<p>No favorites saved yet.</p>";
}

function toggleFavorite(id){
 favorites=favorites.includes(id)?
 favorites.filter(x=>x!==id):[...favorites,id];

 localStorage.setItem("eventFavorites",JSON.stringify(favorites));
 render();
}

function addCalendar(id){
 const e=events.find(x=>x.id===id);
 const start=e.date.replaceAll("-","");
 const end=new Date(e.date+"T12:00:00");
 end.setDate(end.getDate()+1);
 const finish=end.toISOString().slice(0,10).replaceAll("-","");
 const content=[
 "BEGIN:VCALENDAR","VERSION:2.0","BEGIN:VEVENT",
 "DTSTART;VALUE=DATE:"+start,
 "DTEND;VALUE=DATE:"+finish,
 "SUMMARY:"+e.name.replace(/[,;\\]/g," "),
 "LOCATION:"+e.place.replace(/[,;\\]/g," "),
 "DESCRIPTION:"+e.description.replace(/[,;\\]/g," "),
 "END:VEVENT","END:VCALENDAR"
 ].join("\r\n");

 const blob=new Blob([content],{type:"text/calendar"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;a.download="event.ics";a.click();
 URL.revokeObjectURL(url);
}

document.getElementById("search").addEventListener("input",render);
document.getElementById("category").addEventListener("change",render);
render();
