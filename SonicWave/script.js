
const audio=document.getElementById("audio");
const songsBox=document.getElementById("songs");
let songs=[
 {name:"Sample Song 1",artist:"Local Library",src:"music/song1.mp3"},
 {name:"Sample Song 2",artist:"Local Library",src:"music/song2.mp3"},
 {name:"Sample Song 3",artist:"Local Library",src:"music/song3.mp3"}
];
let index=0;

function formatTime(t){
 if(!Number.isFinite(t))return "0:00";
 return Math.floor(t/60)+":"+String(Math.floor(t%60)).padStart(2,"0");
}

function render(){
 songsBox.innerHTML=songs.map((s,i)=>`
 <div class="song ${i===index?"active":""}">
 <span>${i+1}. ${escapeHTML(s.name)}</span>
 <button onclick="playSong(${i})">Play</button>
 </div>`).join("");
}

function escapeHTML(v){
 return v.replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
 })[c]);
}

function playSong(i){
 if(!songs.length)return;
 index=i;
 audio.src=songs[index].src;
 document.getElementById("songName").textContent=songs[index].name;
 document.getElementById("artist").textContent=songs[index].artist;
 audio.play().then(()=>{
  document.getElementById("play").textContent="Ⅱ";
 }).catch(()=>alert("Audio could not play. Check the music file path."));
 render();
}

document.getElementById("play").onclick=()=>{
 if(!audio.src&&songs.length){playSong(index);return;}
 if(audio.paused){
  audio.play().then(()=>document.getElementById("play").textContent="Ⅱ");
 }else{
  audio.pause();
  document.getElementById("play").textContent="▶";
 }
};

document.getElementById("next").onclick=()=>{
 if(songs.length)playSong((index+1)%songs.length);
};
document.getElementById("previous").onclick=()=>{
 if(songs.length)playSong((index-1+songs.length)%songs.length);
};
audio.addEventListener("ended",()=>document.getElementById("next").click());

audio.addEventListener("timeupdate",()=>{
 document.getElementById("seek").value=audio.duration?
  audio.currentTime/audio.duration*100:0;
 document.getElementById("current").textContent=formatTime(audio.currentTime);
 document.getElementById("duration").textContent=formatTime(audio.duration);
});

document.getElementById("seek").oninput=e=>{
 if(audio.duration)audio.currentTime=audio.duration*e.target.value/100;
};

document.getElementById("volume").oninput=e=>audio.volume=e.target.value;

document.getElementById("fileInput").onchange=e=>{
 const files=[...e.target.files];
 files.forEach(file=>{
  const url=URL.createObjectURL(file);
  songs.push({name:file.name.replace(/\.[^.]+$/,""),artist:"Your Device",src:url});
 });
 render();
 if(songs.length===files.length)playSong(0);
};

document.getElementById("theme").onclick=()=>{
 document.body.classList.toggle("light");
};

render();

// Audio visualizer
let context, analyser, source, data;
const canvas=document.getElementById("visualizer");
const ctx=canvas.getContext("2d");

function draw(){
 requestAnimationFrame(draw);
 const w=canvas.width=canvas.clientWidth*devicePixelRatio;
 const h=canvas.height=canvas.clientHeight*devicePixelRatio;
 ctx.clearRect(0,0,w,h);

 if(!audio.paused){
  try{
   if(!context){
    context=new AudioContext();
    analyser=context.createAnalyser();
    source=context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize=128;
    data=new Uint8Array(analyser.frequencyBinCount);
   }
   if(context.state==="suspended")context.resume();
   analyser.getByteFrequencyData(data);
   const width=w/data.length;
   data.forEach((v,i)=>{
    const height=v/255*h;
    ctx.fillStyle="#a58bff";
    ctx.fillRect(i*width,h-height,width-2,height);
   });
  }catch{}
 }
}
draw();
