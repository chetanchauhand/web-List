
const $=id=>document.getElementById(id);

function formatJSON(){
 try{
  $("jsonOutput").textContent=
   JSON.stringify(JSON.parse($("jsonInput").value),null,4);
 }catch{
  $("jsonOutput").textContent="Invalid JSON. Check your syntax.";
 }
}

function minifyJSON(){
 try{
  $("jsonOutput").textContent=
   JSON.stringify(JSON.parse($("jsonInput").value));
 }catch{
  $("jsonOutput").textContent="Invalid JSON.";
 }
}

function copyText(id){
 const value=$(id).textContent;
 if(!value)return alert("Nothing to copy.");
 navigator.clipboard.writeText(value)
 .then(()=>alert("Copied!"))
 .catch(()=>alert("Clipboard permission unavailable."));
}

function generatePalette(){
 const hex=$("colorInput").value;
 const r=parseInt(hex.slice(1,3),16);
 const g=parseInt(hex.slice(3,5),16);
 const b=parseInt(hex.slice(5,7),16);

 const rgbToHex=(r,g,b)=>"#"+[r,g,b]
 .map(v=>Math.max(0,Math.min(255,Math.round(v)))
 .toString(16).padStart(2,"0")).join("");

 const colors=[
  hex,
  rgbToHex(r*.8,g*.8,b*.8),
  rgbToHex(r*.6,g*.6,b*.6),
  rgbToHex(r+(255-r)*.25,g+(255-g)*.25,b+(255-b)*.25),
  rgbToHex(r+(255-r)*.5,g+(255-g)*.5,b+(255-b)*.5)
 ];

 $("palette").innerHTML=colors.map(c=>`
 <div class="swatch" style="background:${c};color:${r+g+b>380?"#111":"white"}"
 onclick="navigator.clipboard.writeText('${c}')">${c}</div>
 `).join("");
}

let snippets=JSON.parse(localStorage.getItem("devSnippets"))||[];

function saveSnippet(){
 const title=$("snippetTitle").value.trim();
 const code=$("snippetCode").value;
 if(!title||!code.trim())return alert("Enter title and code.");

 snippets.push({title,code});
 localStorage.setItem("devSnippets",JSON.stringify(snippets));
 $("snippetTitle").value="";
 $("snippetCode").value="";
 renderSnippets();
}

function escapeHTML(s){
 return s.replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
 })[c]);
}

function renderSnippets(){
 $("snippets").innerHTML=snippets.map((s,i)=>`
 <div class="snippet">
 <b>${escapeHTML(s.title)}</b>
 <pre>${escapeHTML(s.code)}</pre>
 <button onclick="copySnippet(${i})">Copy</button>
 <button onclick="deleteSnippet(${i})">Delete</button>
 </div>`).join("");
}

function copySnippet(i){
 navigator.clipboard.writeText(snippets[i].code)
 .then(()=>alert("Code copied!"));
}

function deleteSnippet(i){
 snippets.splice(i,1);
 localStorage.setItem("devSnippets",JSON.stringify(snippets));
 renderSnippets();
}

// Safe basic Markdown preview (no raw HTML execution).
function markdown(text){
 return text.split("\n").map(line=>{
  if(line.startsWith("### "))return "<h3>"+escapeHTML(line.slice(4))+"</h3>";
  if(line.startsWith("## "))return "<h2>"+escapeHTML(line.slice(3))+"</h2>";
  if(line.startsWith("# "))return "<h1>"+escapeHTML(line.slice(2))+"</h1>";
  return "<p>"+escapeHTML(line)
   .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")
   .replace(/\*(.*?)\*/g,"<em>$1</em>")+"</p>";
 }).join("");
}

$("markdownInput").addEventListener("input",()=>{
 $("preview").innerHTML=markdown($("markdownInput").value);
});

generatePalette();
renderSnippets();
