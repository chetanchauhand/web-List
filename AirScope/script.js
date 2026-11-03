
const weatherCodes={
 0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",
 45:"Fog",48:"Depositing rime fog",51:"Light drizzle",
 53:"Drizzle",55:"Heavy drizzle",61:"Light rain",
 63:"Rain",65:"Heavy rain",71:"Light snow",
 73:"Snow",75:"Heavy snow",80:"Rain showers",
 81:"Rain showers",82:"Heavy showers",95:"Thunderstorm"
};

async function searchCity(){
 const city=document.getElementById("city").value.trim();
 if(!city)return alert("Enter a city name.");

 try{
  const response=await fetch(
   `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );
  const result=await response.json();
  if(!result.results?.length)throw Error("City not found.");
  await loadWeather(result.results[0]);
 }catch(e){alert(e.message||"Could not find city.");}
}

async function useLocation(){
 if(!navigator.geolocation)return alert("Location is not supported.");
 navigator.geolocation.getCurrentPosition(async pos=>{
  try{
   await loadWeather({
    latitude:pos.coords.latitude,
    longitude:pos.coords.longitude,
    name:"Your Location",
    country:""
   });
  }catch{alert("Weather could not be loaded.");}
 },()=>alert("Location permission was not granted."));
}

async function loadWeather(place){
 const {latitude,longitude}=place;

 document.getElementById("location").textContent=
  `${place.name}${place.country?", "+place.country:""}`;

 const base="https://api.open-meteo.com/v1/forecast";
 const url=`${base}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

 const r=await fetch(url);
 if(!r.ok)throw Error("Weather service unavailable.");
 const data=await r.json();
 const c=data.current;

 document.getElementById("temperature").textContent=c.temperature_2m+"°C";
 document.getElementById("condition").textContent=weatherCodes[c.weather_code]||"Weather condition";
 document.getElementById("feels").textContent=c.apparent_temperature+"°C";
 document.getElementById("humidity").textContent=c.relative_humidity_2m+"%";
 document.getElementById("wind").textContent=c.wind_speed_10m+" km/h";
 document.getElementById("updated").textContent="Updated: "+c.time;

 const airURL=`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm2_5,pm10&timezone=auto`;
 try{
  const ar=await fetch(airURL);
  const air=await ar.json();
  document.getElementById("aqi").textContent=
   air.current?.european_aqi??"Unavailable";
 }catch{
  document.getElementById("aqi").textContent="Unavailable";
 }

 document.getElementById("forecast").innerHTML=
 data.daily.time.map((day,i)=>`
 <article class="day">
 <h3>${new Date(day+"T12:00:00").toLocaleDateString("en",{weekday:"short"})}</h3>
 <p>${weatherCodes[data.daily.weather_code[i]]||"Weather"}</p>
 <h3>${data.daily.temperature_2m_max[i]}°</h3>
 <p>Low ${data.daily.temperature_2m_min[i]}°</p>
 </article>`).join("");
}
