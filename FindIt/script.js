
let reports=JSON.parse(localStorage.getItem("finditReports"))||[];

const form=document.getElementById("itemForm");

function safe(value){
 return value.replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
 })[c]);
}

form.addEventListener("submit",e=>{
 e.preventDefault();

 const file=document.getElementById("photo").files[0];
 if(file && file.size>1024*1024){
  alert("Please choose an image smaller than 1 MB.");
  return;
 }

 const addReport=image=>{
  reports.unshift({
   id:crypto.randomUUID(),
   name:document.getElementById("itemName").value.trim(),
   category:document.getElementById("category").value,
   status:document.getElementById("status").value,
   location:document.getElementById("location").value.trim(),
   description:document.getElementById("description").value.trim(),
   image,
   date:new Date().toLocaleDateString()
  });
  try{
   localStorage.setItem("finditReports",JSON.stringify(reports));
  }catch{
   alert("Storage is full. Try a smaller image.");
   reports.shift();
   return;
  }
  form.reset();
  render();
 };

 if(file){
  const reader=new FileReader();
  reader.onload=()=>addReport(reader.result);
  reader.onerror=()=>alert("Could not read image.");
  reader.readAsDataURL(file);
 }else addReport("");
});

function render(){
 const query=document.getElementById("search").value.toLowerCase();
 const filter=document.getElementById("filter").value;

 const filtered=reports.filter(x=>
  (filter==="All"||x.status===filter)&&
  (x.name+" "+x.location+" "+x.category).toLowerCase().includes(query)
 );

 document.getElementById("items").innerHTML=filtered.map(x=>`
 <article class="item">
 ${x.image?`<img src="${x.image}" alt="Reported item">`:""}
 <h3>${safe(x.name)}</h3>
 <p><b>${safe(x.status)}</b> · ${safe(x.category)}</p>
 <p>Location: ${safe(x.location)}</p>
 <p>${safe(x.description)}</p>
 <p>Reported: ${safe(x.date)}</p>
 <button onclick="removeReport('${x.id}')">Remove</button>
 </article>`).join("")||"<p>No matching reports found.</p>";
}

function removeReport(id){
 reports=reports.filter(x=>x.id!==id);
 localStorage.setItem("finditReports",JSON.stringify(reports));
 render();
}

document.getElementById("search").addEventListener("input",render);
document.getElementById("filter").addEventListener("change",render);
render();
