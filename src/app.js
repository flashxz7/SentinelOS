// UPTIME + CLOCK
var upSec=22472;
function tickClock(){
  document.getElementById('clock').textContent=new Date().toLocaleTimeString('en-US',{hour12:false})+' CST';
  upSec++;
  var H=Math.floor(upSec/3600),M=Math.floor((upSec%3600)/60),S=upSec%60;
  document.getElementById('h-up').textContent=[H,M,S].map(function(v){return String(v).padStart(2,'0')}).join(':');
}
setInterval(tickClock,1000); tickClock();

// MAP
var map=L.map('map',{zoomControl:true,attributionControl:false}).setView([30.01,-99.80],14);
var loaded=false;
var bn=document.getElementById('tile-bn');
function onLoad(){if(!loaded){loaded=true;bn.classList.add('hidden');setTimeout(function(){bn.style.display='none'},600)}}
var esri=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19}).addTo(map);
esri.on('tileload',onLoad);
L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,opacity:0.35}).addTo(map);
L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,opacity:0.18}).addTo(map);
setTimeout(function(){
  if(!loaded){
    var g=L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{maxZoom:20,subdomains:'0123'}).addTo(map);
    g.on('tileload',onLoad);
  }
},5000);
setTimeout(function(){
  if(!loaded){
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',{maxZoom:20}).addTo(map);
  }
},10000);

var layers=[];
var droneMarkers={};
function clearLayers(){layers.forEach(function(l){map.removeLayer(l)});layers=[];droneMarkers={};}
function addZone(c,col,op){
  var glow=L.polygon(c,{color:col,weight:3,fill:false,opacity:.35,className:'zone-glow'}).addTo(map);
  var fill=L.polygon(c,{color:col,weight:1.6,fillColor:col,fillOpacity:op||.38,opacity:.7,className:'zone-fill'}).addTo(map);
  layers.push(glow);layers.push(fill);
}
function addCritDot(lat,lng,col,pop){
  var h='<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center">'
    +'<div style="position:absolute;inset:0;border-radius:50%;background:'+col+';opacity:.25;animation:ping 2s ease-out infinite"></div>'
    +'<div style="position:absolute;inset:0;border-radius:50%;background:'+col+';opacity:.12;animation:ping 2s ease-out infinite .55s"></div>'
    +'<div style="position:relative;width:14px;height:14px;border-radius:50%;background:'+col+';border:2px solid rgba(255,255,255,.5);box-shadow:0 0 12px '+col+'"></div></div>';
  var m=L.marker([lat,lng],{icon:L.divIcon({html:h,className:'',iconSize:[32,32],iconAnchor:[16,16]})}).addTo(map);
  layers.push(m);
}
function addDot(lat,lng,col,r,pop){
  var c=L.circleMarker([lat,lng],{radius:r,color:col,fillColor:col,fillOpacity:.75,weight:2,opacity:.9}).addTo(map);
  layers.push(c);
}
function addPath(from,to,col){var p=L.polyline([from,to],{color:col||'#7c3aed',weight:1.5,opacity:.5,dashArray:'6,5'}).addTo(map);layers.push(p)}
function addCoverage(lat,lng){var c=L.circle([lat,lng],{radius:175,color:'#7c3aed',fillColor:'#7c3aed',fillOpacity:.035,weight:1,opacity:.18,dashArray:'4,6'}).addTo(map);layers.push(c)}
function addRoute(pts,col,dash,weight){var p=L.polyline(pts,{color:col,weight:weight||2.6,opacity:.85,dashArray:dash||'8,6',lineCap:'round'}).addTo(map);layers.push(p)}
function addPerimeter(pts,col){var p=L.polyline(pts,{color:col,weight:1.6,opacity:.6,dashArray:'2,8'}).addTo(map);layers.push(p)}
function addLabel(lat,lng,label,col){
  var h='<div class="map-label" style="--ml:'+col+'">'+label+'</div>';
  var m=L.marker([lat,lng],{icon:L.divIcon({html:h,className:'',iconSize:[120,24],iconAnchor:[8,12]}),interactive:false}).addTo(map);
  layers.push(m);
}
function addCoverArea(center,scale){
  if(!center||!scale) return;
  var lat=center[0],lng=center[1];
  var sl=scale.lat,sg=scale.lng;
  var pts=[
    [lat+sl*1.2,lng-sg*1.1],
    [lat+sl*1.4,lng+sg*0.4],
    [lat+sl*0.6,lng+sg*1.3],
    [lat-sl*0.5,lng+sg*1.2],
    [lat-sl*1.2,lng-sg*0.2],
    [lat-sl*0.8,lng-sg*1.3]
  ];
  var p=L.polygon(pts,{color:'#86efac',weight:1,fillColor:'#86efac',fillOpacity:0.16,opacity:.35}).addTo(map);
  layers.push(p);
}
function getCoverScale(scene){
  if(scene==='fire') return {lat:0.06,lng:0.08};
  if(scene==='quake') return {lat:0.035,lng:0.05};
  return {lat:0.045,lng:0.06};
}

function droneColor(d){
  if(d.dot==='active') return '#22c55e';
  if(d.dot==='transit') return '#3b82f6';
  if(d.dot==='delivery') return '#f97316';
  if(d.dot==='standby') return '#8b89a0';
  return '#a78bfa';
}
function addDrone(d){
  var col=droneColor(d);
  var rot=(d.hdg||0)+'deg';
  var h='<div class="mini-drone" style="--md:'+col+';--rot:'+rot+'"><span></span></div>';
  var m=L.marker([d.lat,d.lng],{icon:L.divIcon({html:h,className:'drone-marker',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map);
  m.on('click',function(){handleDroneClick(d);});
  droneMarkers[d.id]=m;
  layers.push(m);
}
function updateDroneMarker(d){
  if(d.homeLat==null){d.homeLat=d.lat;d.homeLng=d.lng;}
  var dt=2.5;
  var rad=((d.hdg||0)*Math.PI)/180;
  var drift=((d.spd||6)*dt)/111000;
  var jitter=(Math.random()-.5)*drift*.3;
  var moveLat=Math.cos(rad)*drift+jitter;
  var moveLng=Math.sin(rad)*drift+jitter;
  var nextLat=d.lat+moveLat;
  var nextLng=d.lng+moveLng;
  var maxDist=0.0025;
  if(Math.abs(nextLat-d.homeLat)>maxDist) moveLat*=-0.6;
  if(Math.abs(nextLng-d.homeLng)>maxDist) moveLng*=-0.6;
  d.lat=parseFloat((d.lat+moveLat).toFixed(6));
  d.lng=parseFloat((d.lng+moveLng).toFixed(6));
  var marker=droneMarkers[d.id];
  if(!marker){addDrone(d);marker=droneMarkers[d.id];}
  if(marker){
    marker.setLatLng([d.lat,d.lng]);
    var el=marker.getElement();
    if(el){
      var md=el.querySelector('.mini-drone');
      if(md){
        md.style.setProperty('--rot',(d.hdg||0)+'deg');
        md.style.setProperty('--md',droneColor(d));
      }
    }
  }
}
function updateDroneMarkers(scene){
  var ld=LD[scene];if(!ld)return;
  ld.drones.forEach(updateDroneMarker);
}

// SENSOR HELPERS
function voltFromBatt(b){return (13.6+(b/100)*3.2).toFixed(1)}
function gasFromVoc(v){
  if(v<50) return Math.round(50000-v*580);
  if(v<200) return Math.round(20000-(v-50)*98);
  if(v<500) return Math.round(5100-(v-200)*9.8);
  return Math.max(480,Math.round(2160-(v-500)*1.6));
}
function iaqFromVoc(v){
  if(v<50) return Math.round(v*.8+10);
  if(v<200) return Math.round(50+(v-50)*.8);
  if(v<500) return Math.round(170+(v-200)*.48);
  return Math.min(500,Math.round(314+(v-500)*.22));
}
function rssiFromSig(s){
  var b=s>=4?-61:s>=3?-72:-80;
  return Math.round(b-Math.random()*5);
}
function hexToRgb(hex){hex=hex.replace('#','');return parseInt(hex.slice(0,2),16)+','+parseInt(hex.slice(2,4),16)+','+parseInt(hex.slice(4,6),16)}
function riskColor(s){return s>=90?'#ef4444':s>=75?'#f97316':s>=50?'#eab308':'#22c55e'}
function riskLabel(s){return s>=90?'CRITICAL':s>=75?'HIGH':s>=50?'MODERATE':'LOW'}
function numFlash(el){el.classList.remove('nf');void el.offsetWidth;el.classList.add('nf')}

// LIVE DRONE STATE
var LD={
  flood:{
    score:87,
    drones:[
      {id:'SNT-001',dot:'active',state:'Scanning',  batt:91,alt:62.1,spd:7.2,hdg:142,sig:4,t:84.2,h:97.14,p:29.413,voc:34, lat:30.01350,lng:-99.80200,rssi:-64,cpu:11,mcu_t:40,seq:8247,gas_r:0,iaq:0},
      {id:'SNT-002',dot:'transit',state:'In Transit',batt:83,alt:71.4,spd:9.8,hdg:218,sig:4,t:83.8,h:96.83,p:29.391,voc:31, lat:30.00550,lng:-99.78600,rssi:-67,cpu:13,mcu_t:42,seq:6103,gas_r:0,iaq:0},
      {id:'SNT-003',dot:'active',state:'Scanning',  batt:77,alt:58.8,spd:6.5,hdg:87, sig:3,t:83.5,h:97.41,p:29.402,voc:28, lat:29.99400,lng:-99.78000,rssi:-74,cpu:10,mcu_t:39,seq:5891,gas_r:0,iaq:0},
      {id:'SNT-004',dot:'delivery',state:'Delivering',batt:68,alt:45.2,spd:11.2,hdg:310,sig:4,t:84.0,h:97.02,p:29.381,voc:33,lat:30.00800,lng:-99.81200,rssi:-63,cpu:14,mcu_t:44,seq:7428,gas_r:0,iaq:0},
      {id:'SNT-005',dot:'active',state:'Scanning',  batt:55,alt:74.0,spd:7.8,hdg:195,sig:3,t:84.4,h:97.58,p:29.424,voc:36, lat:30.02100,lng:-99.80600,rssi:-76,cpu:12,mcu_t:41,seq:4812,gas_r:0,iaq:0},
      {id:'SNT-006',dot:'transit',state:'In Transit',batt:72,alt:61.4,spd:8.8,hdg:165,sig:4,t:84.0,h:96.54,p:29.400,voc:30, lat:30.01800,lng:-99.79200,rssi:-68,cpu:13,mcu_t:41,seq:4931,gas_r:0,iaq:0},
      {id:'SNT-007',dot:'active',state:'Scanning',batt:64,alt:52.6,spd:6.9,hdg:102,sig:3,t:84.1,h:97.02,p:29.395,voc:27, lat:30.02650,lng:-99.81800,rssi:-73,cpu:12,mcu_t:40,seq:5202,gas_r:0,iaq:0},
      {id:'SNT-008',dot:'delivery',state:'Delivering',batt:61,alt:48.1,spd:10.4,hdg:284,sig:4,t:83.6,h:96.82,p:29.388,voc:32, lat:30.00200,lng:-99.80000,rssi:-65,cpu:14,mcu_t:43,seq:5350,gas_r:0,iaq:0},
      {id:'SNT-009',dot:'active',state:'Scanning',batt:58,alt:69.0,spd:7.1,hdg:135,sig:3,t:84.3,h:97.18,p:29.419,voc:35, lat:29.98850,lng:-99.79250,rssi:-74,cpu:11,mcu_t:41,seq:4682,gas_r:0,iaq:0},
      {id:'SNT-010',dot:'standby',state:'Standby',batt:96,alt:40.0,spd:3.5,hdg:40, sig:4,t:83.9,h:96.40,p:29.405,voc:29, lat:30.03000,lng:-99.80000,rssi:-62,cpu:9,mcu_t:38,seq:3991,gas_r:0,iaq:0}
    ],
    features:[{n:'Pressure Vel.',v:'-0.18 inHg/hr',hot:true},{n:'Humidity Delta',v:'+4.3%/hr',hot:true},{n:'Gas Resistance',v:'Nominal (48 kOhm)',hot:false},{n:'Wind Shear Est.',v:'Moderate',hot:false}],
    ppFields:{dp:'-0.18 inHg/hr',dh:'+4.3%/hr',dgr:'-2.1 kOhm/hr',th:'0.62 deg',ws:'Moderate'},
    sub:'Flood imminent · 3 critical detections'
  },
  quake:{
    score:79,
    drones:[
      {id:'SNT-011',dot:'active',state:'Scanning',  batt:79,alt:55.3,spd:6.1,hdg:78, sig:4,t:72.4,h:44.83,p:29.882,voc:342,lat:31.04600,lng:-104.83500,rssi:-61,cpu:12,mcu_t:41,seq:9312,gas_r:0,iaq:0},
      {id:'SNT-012',dot:'delivery',state:'Delivering',batt:58,alt:40.1,spd:10.5,hdg:245,sig:3,t:72.1,h:45.21,p:29.891,voc:28, lat:31.04400,lng:-104.82800,rssi:-75,cpu:14,mcu_t:43,seq:7204,gas_r:0,iaq:0},
      {id:'SNT-013',dot:'active',state:'Scanning',  batt:85,alt:68.4,spd:7.3,hdg:132,sig:4,t:72.6,h:44.51,p:29.873,voc:318,lat:31.04200,lng:-104.82500,rssi:-62,cpu:11,mcu_t:40,seq:8801,gas_r:0,iaq:0},
      {id:'SNT-014',dot:'transit',state:'In Transit',batt:66,alt:50.0,spd:9.2,hdg:290,sig:4,t:72.3,h:44.91,p:29.880,voc:31, lat:31.05000,lng:-104.83800,rssi:-65,cpu:13,mcu_t:42,seq:6530,gas_r:0,iaq:0},
      {id:'SNT-015',dot:'active',state:'Scanning',  batt:92,alt:72.2,spd:6.8,hdg:15,  sig:4,t:72.5,h:45.12,p:29.901,voc:15, lat:31.04750,lng:-104.83400,rssi:-60,cpu:10,mcu_t:39,seq:9907,gas_r:0,iaq:0},
      {id:'SNT-016',dot:'transit',state:'In Transit',batt:73,alt:56.9,spd:8.9,hdg:210,sig:4,t:72.2,h:44.92,p:29.887,voc:45, lat:31.03950,lng:-104.84200,rssi:-64,cpu:13,mcu_t:42,seq:6144,gas_r:0,iaq:0},
      {id:'SNT-017',dot:'active',state:'Scanning',batt:69,alt:60.4,spd:6.7,hdg:96, sig:3,t:72.7,h:44.60,p:29.874,voc:280,lat:31.05200,lng:-104.82900,rssi:-72,cpu:12,mcu_t:40,seq:7022,gas_r:0,iaq:0},
      {id:'SNT-018',dot:'delivery',state:'Delivering',batt:62,alt:44.6,spd:10.9,hdg:320,sig:3,t:72.0,h:45.02,p:29.892,voc:60, lat:31.03650,lng:-104.82650,rssi:-74,cpu:15,mcu_t:44,seq:5352,gas_r:0,iaq:0},
      {id:'SNT-019',dot:'active',state:'Scanning',batt:81,alt:66.8,spd:7.1,hdg:150,sig:4,t:72.8,h:44.72,p:29.878,voc:260,lat:31.04050,lng:-104.82050,rssi:-63,cpu:11,mcu_t:40,seq:6422,gas_r:0,iaq:0},
      {id:'SNT-020',dot:'standby',state:'Standby',batt:97,alt:42.0,spd:3.1,hdg:20, sig:4,t:72.3,h:45.20,p:29.890,voc:20, lat:31.05500,lng:-104.83550,rssi:-60,cpu:9,mcu_t:38,seq:3994,gas_r:0,iaq:0}
    ],
    features:[{n:'VOC Spike',v:'342 ppb (GAS LEAK)',hot:true},{n:'Dust / PM2.5',v:'+64 AQI/hr',hot:true},{n:'Aftershock Risk',v:'HIGH (M4.2+)',hot:true},{n:'Gas Resistance',v:'3.2 kOhm (LOW)',hot:true}],
    ppFields:{dp:'-0.05 inHg/hr',dh:'+1.2%/hr',dgr:'-18 kOhm/hr',th:'0.31 deg',ws:'Calm'},
    sub:'M5.8 post-event · 4 gas leak signatures'
  },
  fire:{
    score:94,
    drones:[
      {id:'SNT-021',dot:'active',state:'Scanning',  batt:74,alt:95.4,spd:8.5,hdg:63, sig:3,t:104.3,h:11.24,p:29.621,voc:890, lat:32.40800,lng:-98.83000,rssi:-73,cpu:14,mcu_t:47,seq:11420,gas_r:0,iaq:0},
      {id:'SNT-022',dot:'delivery',state:'Delivering',batt:51,alt:38.2,spd:12.1,hdg:182,sig:3,t:103.8,h:11.53,p:29.604,voc:712, lat:32.40200,lng:-98.81500,rssi:-71,cpu:16,mcu_t:48,seq:8843,gas_r:0,iaq:0},
      {id:'SNT-023',dot:'active',state:'Scanning',  batt:88,alt:110.1,spd:7.9,hdg:118,sig:4,t:104.8,h:10.91,p:29.633,voc:1024,lat:32.41400,lng:-98.82200,rssi:-64,cpu:13,mcu_t:46,seq:12071,gas_r:0,iaq:0},
      {id:'SNT-024',dot:'transit',state:'In Transit',batt:62,alt:72.0,spd:10.8,hdg:335,sig:3,t:103.5,h:11.81,p:29.612,voc:524, lat:32.39600,lng:-98.79200,rssi:-72,cpu:15,mcu_t:46,seq:9214,gas_r:0,iaq:0},
      {id:'SNT-025',dot:'active',state:'Scanning',  batt:80,alt:88.3,spd:8.2,hdg:54,  sig:4,t:104.1,h:11.13,p:29.624,voc:756, lat:32.41400,lng:-98.82200,rssi:-67,cpu:12,mcu_t:45,seq:10388,gas_r:0,iaq:0},
      {id:'SNT-026',dot:'transit',state:'In Transit',batt:68,alt:70.2,spd:9.5,hdg:210,sig:3,t:103.7,h:11.50,p:29.618,voc:680, lat:32.42200,lng:-98.84600,rssi:-71,cpu:14,mcu_t:47,seq:9542,gas_r:0,iaq:0},
      {id:'SNT-027',dot:'active',state:'Scanning',batt:75,alt:96.2,spd:8.0,hdg:88, sig:4,t:104.2,h:11.02,p:29.629,voc:820, lat:32.40400,lng:-98.80400,rssi:-66,cpu:13,mcu_t:45,seq:10412,gas_r:0,iaq:0},
      {id:'SNT-028',dot:'delivery',state:'Delivering',batt:59,alt:42.4,spd:11.4,hdg:260,sig:3,t:103.6,h:11.70,p:29.610,voc:610, lat:32.38600,lng:-98.81000,rssi:-70,cpu:15,mcu_t:47,seq:8866,gas_r:0,iaq:0},
      {id:'SNT-029',dot:'active',state:'Scanning',batt:83,alt:102.0,spd:7.6,hdg:30, sig:4,t:104.5,h:10.98,p:29.632,voc:910, lat:32.43000,lng:-98.83200,rssi:-65,cpu:12,mcu_t:46,seq:11082,gas_r:0,iaq:0},
      {id:'SNT-030',dot:'standby',state:'Standby',batt:98,alt:40.0,spd:3.2,hdg:12, sig:4,t:103.9,h:11.40,p:29.620,voc:540, lat:32.37000,lng:-98.82200,rssi:-61,cpu:9,mcu_t:39,seq:5031,gas_r:0,iaq:0}
    ],
    features:[{n:'Temperature',v:'104.3F (+3.8/hr)',hot:true},{n:'VOC / Smoke',v:'890 ppb (CRIT)',hot:true},{n:'Humidity',v:'11.2% (-4.1/hr)',hot:true},{n:'Gas Resistance',v:'0.84 kOhm (CRIT)',hot:true}],
    ppFields:{dp:'-0.02 inHg/hr',dh:'-4.1%/hr',dgr:'-1.2 kOhm/hr',th:'1.41 deg',ws:'Severe NE'},
    sub:'Active fire front · 94/100 · immediate threat'
  }
};

Object.keys(LD).forEach(function(s){
  LD[s].drones.forEach(function(d){d.gas_r=gasFromVoc(d.voc);d.iaq=iaqFromVoc(d.voc)});
});

var sparkData={};
var frameCounter={};

// RENDER FUNCTIONS
function renderStats(a){document.getElementById('stats').innerHTML=a.map(function(s){return'<div class="sb"><div class="sn" style="color:'+s.c+'">'+s.v+'</div><div class="sl">'+s.l+'</div></div>'}).join('')}
function renderFleet(a){
  document.getElementById('fleet').innerHTML=a.map(function(f){
    var d=null;
    var ld=LD[curScene];
    if(ld) ld.drones.forEach(function(x){if(x.id===f.id)d=x});
    var bc=f.batt>70?'hi':f.batt>40?'md':'lo';
    var bcol=f.batt>70?'#22c55e':f.batt>40?'#eab308':'#ef4444';
    var sub=d?'<div class="fi-sub"><b>'+d.alt.toFixed(0)+'m</b>&nbsp;AGL &nbsp; <b>'+d.spd.toFixed(1)+'</b>&nbsp;m/s &nbsp; <b>'+d.hdg+'deg</b></div>':'';
    var volt=d?'<span style="color:'+bcol+';font-size:8.5px;font-family:JetBrains Mono,monospace">'+voltFromBatt(f.batt)+'V</span> ':''
    return '<div class="fi"><div class="fi-top"><span class="fdot '+f.dot+'"></span><span class="fid">'+f.id+'</span><span class="fst">'+f.state+'</span>'
      +volt
      +'<div class="fbatt-wrap"><div class="fb"><div class="ff '+bc+'" style="width:'+f.batt+'%"></div></div>'
      +'<span class="fv-n" style="color:'+bcol+'">'+Math.round(f.batt)+'%</span></div></div>'
      +sub+'</div>'
  }).join('')
}
function renderAlerts(a){
  var el=document.getElementById('alerts');
  if(!el) return;
  el.innerHTML=a.map(function(x){
    var coords=(x.lat!=null&&x.lng!=null)?'<div class="al-coords">Coords '+formatCoords(x.lat,x.lng)+'</div>':'';
    var idAttr=x.id?' data-id="'+x.id+'"':'';
    var droneAttr=x.drone?' data-drone="'+x.drone+'"':'';
    return '<div class="al s'+x.sev+'"'+idAttr+droneAttr+'><div class="al-top"><span class="al-name">'+x.name+'</span><span class="al-conf '+x.cCls+'">'+x.conf+'</span></div><div class="al-desc">'+x.desc+'</div>'+coords+'<div class="al-foot"><span>'+x.time+'</span><span>'+x.drone+'</span></div></div>'
  }).join('')
}
function renderHud(a){
  document.getElementById('hud').innerHTML=a.map(function(h,i){
    return (i?'<div class="hsep2"></div>':'')+'<div class="hi-item"><div class="hi-val" style="color:'+h.c+'">'+h.v+'</div><div class="hi-lbl">'+h.l+'</div></div>'
  }).join('')
}
function renderWx(a){
  document.getElementById('wx').innerHTML=a.map(function(w){
    return '<div class="wx-c"><div class="wx-l">'+w.l+'</div><div class="wx-v">'+w.v+'<span class="wx-u"> '+w.u+'</span></div><div class="wx-d '+w.dir+'">'+w.d+'</div></div>'
  }).join('')
}
var weatherState={};
var weatherInterval=null;
function parseWxValue(v){
  if(typeof v==='number') return v;
  if(v==null) return NaN;
  var num=parseFloat(String(v).replace(/[^0-9.-]/g,''));
  return Number.isFinite(num)?num:NaN;
}
function weatherBias(scene,label){
  var hot=scene==='fire';
  var humid=scene==='flood';
  if(label.indexOf('Temperature')===0){
    return {min:hot?96:68,max:hot?112:92,drift:hot?0.08:0.03,jitter:0.16,decimals:1,unit:'F'};
  }
  if(label.indexOf('Humidity')===0){
    return {min:hot?6:28,max:humid?100:70,drift:humid?0.12:-0.04,jitter:0.25,decimals:1,unit:'%'};
  }
  if(label.indexOf('Pressure')===0){
    return {min:29.2,max:30.2,drift:humid?-0.005:0.002,jitter:0.01,decimals:2,unit:'inHg'};
  }
  if(label.indexOf('Wind Speed')===0){
    return {min:0,max:hot?75:45,drift:hot?0.25:0.08,jitter:0.6,decimals:1,unit:'mph'};
  }
  if(label.indexOf('Wind Gust')===0){
    return {min:0,max:hot?90:60,drift:hot?0.32:0.1,jitter:0.9,decimals:1,unit:'mph'};
  }
  if(label.indexOf('Rainfall')===0){
    return {min:0,max:humid?6:2.5,drift:humid?0.05:-0.02,jitter:0.12,decimals:2,unit:'in/hr'};
  }
  if(label.indexOf('Visibility')===0){
    return {min:0.1,max:10,drift:humid?-0.04:0.03,jitter:0.08,decimals:1,unit:'mi'};
  }
  if(label.indexOf('PM2.5')===0){
    return {min:0,max:hot?500:250,drift:hot?1.2:0.6,jitter:2.5,decimals:0,unit:'AQI'};
  }
  return {min:0,max:100,drift:0.02,jitter:0.08,decimals:1,unit:''};
}
function formatTrend(delta,decimals,unit){
  if(Math.abs(delta)<0.03) return 'Stable';
  var sign=delta>=0?'+':'';
  return sign+delta.toFixed(decimals)+unit+'/hr';
}
function initWeather(scene){
  var s=S[scene];
  if(!s||!s.wx) return;
  weatherState[scene]=s.wx.map(function(w){
    return {label:w.l,value:parseWxValue(w.v)};
  });
}
function updateWeather(scene){
  var s=S[scene];
  if(!s||!s.wx) return;
  if(!weatherState[scene]) initWeather(scene);
  var state=weatherState[scene]||[];
  s.wx.forEach(function(w,idx){
    var st=state[idx];
    if(!st||!Number.isFinite(st.value)) return;
    var bias=weatherBias(scene,w.l);
    var next=clamp(st.value+bias.drift+(Math.random()-.5)*bias.jitter,bias.min,bias.max);
    var delta=next-st.value;
    st.value=next;
    w.v=next.toFixed(bias.decimals);
    w.dir=delta>0.03?'up':delta<-0.03?'dn':'fl';
    w.d=formatTrend(delta,bias.decimals,bias.unit);
  });
  renderWx(s.wx);
}
function clearWeatherTick(){
  if(weatherInterval){clearInterval(weatherInterval);weatherInterval=null;}
}
function startWeatherTick(scene){
  clearWeatherTick();
  weatherInterval=setInterval(function(){updateWeather(scene);},1200);
}
function getWxSnapshot(scene){
  var out={temp_f:null,humidity_pct:null,pressure_inhg:null,wind_mph:null,gust_mph:null,rain_in_hr:null,visibility_mi:null,pm25_aqi:null};
  var wx=(S[scene]&&S[scene].wx)?S[scene].wx:[];
  wx.forEach(function(w){
    var val=parseWxValue(w.v);
    if(!Number.isFinite(val)) return;
    if(w.l.indexOf('Temperature')===0) out.temp_f=val;
    else if(w.l.indexOf('Humidity')===0) out.humidity_pct=val;
    else if(w.l.indexOf('Pressure')===0) out.pressure_inhg=val;
    else if(w.l.indexOf('Wind Speed')===0) out.wind_mph=val;
    else if(w.l.indexOf('Wind Gust')===0) out.gust_mph=val;
    else if(w.l.indexOf('Rainfall')===0) out.rain_in_hr=val;
    else if(w.l.indexOf('Visibility')===0) out.visibility_mi=val;
    else if(w.l.indexOf('PM2.5')===0) out.pm25_aqi=val;
  });
  return out;
}
function escapeCsv(val){
  if(val==null) return '';
  var str=String(val);
  if(str.indexOf('"')!==-1) str=str.replace(/"/g,'""');
  if(/[",\n]/.test(str)) str='"'+str+'"';
  return str;
}
function downloadCsv(rows,filename){
  var csv=rows.map(function(r){return r.map(escapeCsv).join(',');}).join('\n');
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  var link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download=filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(function(){URL.revokeObjectURL(link.href);link.remove();},0);
}
function buildDataset(scene){
  var ld=LD[scene];
  if(!ld) return;
  var headers=[
    'timestamp','scene','drone_id','lat','lng','temp_f','humidity_pct','pressure_inhg','voc_ppb','gas_resistance_ohm','iaq','alt_m','speed_mps','battery_pct','rssi_dbm','heading_deg','cpu_pct','mcu_temp_c',
    'wx_temp_f','wx_humidity_pct','wx_pressure_inhg','wx_wind_mph','wx_gust_mph','wx_rain_in_hr','wx_visibility_mi','wx_pm25_aqi'
  ];
  var rows=[headers];
  var now=new Date();
  var wxBase=getWxSnapshot(scene);
  for(var m=60;m>=0;m--){
    var ts=new Date(now.getTime()-m*60000);
    var drift=Math.sin((60-m)/8)*0.04;
    var wx={
      temp_f:wxBase.temp_f==null?null:wxBase.temp_f+(Math.random()-.5)*0.6+drift,
      humidity_pct:wxBase.humidity_pct==null?null:clamp(wxBase.humidity_pct+(Math.random()-.5)*1.2+drift*4,0,100),
      pressure_inhg:wxBase.pressure_inhg==null?null:wxBase.pressure_inhg+(Math.random()-.5)*0.02+drift*0.1,
      wind_mph:wxBase.wind_mph==null?null:Math.max(0,wxBase.wind_mph+(Math.random()-.5)*1.4+drift*6),
      gust_mph:wxBase.gust_mph==null?null:Math.max(0,wxBase.gust_mph+(Math.random()-.5)*2.2+drift*8),
      rain_in_hr:wxBase.rain_in_hr==null?null:Math.max(0,wxBase.rain_in_hr+(Math.random()-.5)*0.2+drift*0.6),
      visibility_mi:wxBase.visibility_mi==null?null:Math.max(0.1,wxBase.visibility_mi+(Math.random()-.5)*0.2-drift*2),
      pm25_aqi:wxBase.pm25_aqi==null?null:Math.max(0,wxBase.pm25_aqi+(Math.random()-.5)*6+drift*40)
    };
    ld.drones.forEach(function(d){
      var temp=d.t+(Math.random()-.5)*0.8;
      var hum=clamp(d.h+(Math.random()-.5)*1.2,0,100);
      var pressure=d.p+(Math.random()-.5)*0.02;
      var voc=Math.max(5,Math.round(d.voc+(Math.random()-.5)*8));
      var gas=gasFromVoc(voc);
      var iaq=iaqFromVoc(voc);
      var alt=clamp(d.alt+(Math.random()-.5)*2,20,150);
      var spd=clamp(d.spd+(Math.random()-.5)*0.8,0,18);
      var batt=clamp(d.batt-((60-m)*0.02)+(Math.random()-.5)*0.5,5,100);
      var rssi=d.rssi+Math.round((Math.random()-.5)*4);
      var cpu=clamp(d.cpu+(Math.random()-.5)*4,6,60);
      var mcu=clamp(d.mcu_t+(Math.random()-.5)*2,35,60);
      var lat=d.lat+(Math.random()-.5)*0.00008;
      var lng=d.lng+(Math.random()-.5)*0.00008;
      var row=[
        ts.toISOString(),scene,d.id,
        lat.toFixed(5),lng.toFixed(5),
        temp.toFixed(2),hum.toFixed(2),pressure.toFixed(3),voc,gas,iaq,
        alt.toFixed(1),spd.toFixed(1),batt.toFixed(1),rssi,d.hdg,cpu.toFixed(0),mcu.toFixed(0),
        wx.temp_f==null?'':wx.temp_f.toFixed(2),
        wx.humidity_pct==null?'':wx.humidity_pct.toFixed(2),
        wx.pressure_inhg==null?'':wx.pressure_inhg.toFixed(3),
        wx.wind_mph==null?'':wx.wind_mph.toFixed(1),
        wx.gust_mph==null?'':wx.gust_mph.toFixed(1),
        wx.rain_in_hr==null?'':wx.rain_in_hr.toFixed(2),
        wx.visibility_mi==null?'':wx.visibility_mi.toFixed(2),
        wx.pm25_aqi==null?'':Math.round(wx.pm25_aqi)
      ];
      rows.push(row);
    });
  }
  downloadCsv(rows,'sentinelos_'+scene+'_60min.csv');
}
function renderCmp(a){
  document.getElementById('cmp').innerHTML=
    '<div class="cmp-head"><span style="flex:1"></span><div class="cmp-vs"><span class="cs" style="min-width:60px;text-align:right;font-size:9px">Sentinel</span><span class="ca" style="min-width:60px;text-align:right;font-size:9px">Public API</span></div></div>'+
    a.map(function(r){return '<div class="cmp-row"><span class="cmp-m">'+r.m+'</span><div class="cmp-vs"><span class="cv s">'+r.s+'</span><span class="cv a">'+r.a+'</span></div></div>'}).join('')
}
function makeTicketImage(label,accent){
  var svg='<'+'svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">'
    +'<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#1b1826"/>'
    +'<stop offset="1" stop-color="#0b0a12"/></linearGradient></defs>'
    +'<rect width="640" height="360" fill="url(#g)"/>'
    +'<rect x="40" y="210" width="210" height="70" fill="#191726"/>'
    +'<rect x="280" y="190" width="120" height="90" fill="#151321"/>'
    +'<rect x="420" y="170" width="160" height="110" fill="#10101a"/>'
    +'<line x1="0" y1="250" x2="640" y2="250" stroke="#2b2738" stroke-width="2"/>'
    +'<circle cx="520" cy="120" r="36" fill="#0f0e18" stroke="'+accent+'" stroke-width="2"/>'
    +'<text x="32" y="36" fill="#c9c2e8" font-size="16" font-family="JetBrains Mono,monospace" letter-spacing="2">'+label+'</text>'
    +'<text x="32" y="330" fill="#6a647f" font-size="12" font-family="JetBrains Mono,monospace">SNT-OPTICS · UTC</text>'
    +'</svg>';
  return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
}
function defaultMl(idx){
  if(idx===0){
    return [
      {x:12,y:18,w:28,h:38,label:'person',conf:0.94},
      {x:58,y:26,w:26,h:34,label:'vehicle',conf:0.88}
    ];
  }
  if(idx===1){
    return [
      {x:18,y:22,w:32,h:42,label:'heat',conf:0.91}
    ];
  }
  return [
    {x:26,y:20,w:30,h:40,label:'object',conf:0.86}
  ];
}
function buildTicketMedia(t){
  var accent=t.p==='critical'?'#ef4444':t.p==='high'?'#f97316':'#3b82f6';
  var labels=t.labels||['EO POV','THERMAL','WIDE CONTEXT'];
  var images=t.images||[];
  var fallbacks=[makeTicketImage(labels[0],accent),makeTicketImage(labels[1],accent),makeTicketImage(labels[2],accent)];
  return labels.map(function(lbl,i){
    var src='';
    if(images[i]){
      src=images[i].indexOf('/')>-1?images[i]:'assets/'+images[i];
    } else {
      src=fallbacks[i];
    }
    return {src:src,fallback:fallbacks[i],label:lbl,ml:(t.ml&&t.ml[i])?t.ml[i]:defaultMl(i)};
  });
}
function renderMlOverlay(boxes){
  if(!boxes||!boxes.length) return '';
  return '<div class="tk-ml">'+boxes.map(function(b){
    var conf=typeof b.conf==='number'?b.conf.toFixed(2):b.conf;
    return '<div class="tk-box" style="left:'+b.x+'%;top:'+b.y+'%;width:'+b.w+'%;height:'+b.h+'%"><span class="tk-conf">'+b.label+' '+conf+'</span></div>';
  }).join('')+'</div>';
}
var ticketState={};
function ensureTicketState(scene){
  var tix=(S[scene]&&S[scene].tickets)?S[scene].tickets:[];
  tix.forEach(function(t){
    if(!ticketState[t.id]){
      ticketState[t.id]={age:Math.floor(Math.random()*70)+20,stage:t.stage||1};
    }
  });
}
function formatAge(sec){
  var m=Math.floor(sec/60);
  var s=Math.floor(sec%60);
  return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function formatCoords(lat,lng){
  var latDir=lat>=0?'N':'S';
  var lngDir=lng>=0?'E':'W';
  return Math.abs(lat).toFixed(4)+' '+latDir+', '+Math.abs(lng).toFixed(4)+' '+lngDir;
}
function flashFocus(el,cls){
  if(!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(function(){el.classList.remove(cls);},1400);
}
function focusTicketCard(id){
  var list=document.getElementById('tickets');
  if(!list||!id) return;
  var card=list.querySelector('.tk[data-id="'+id+'"]');
  if(card){
    card.scrollIntoView({block:'center',behavior:'smooth'});
    flashFocus(card,'focus');
  }
}
function focusAlertCard(id){
  var list=document.getElementById('alerts');
  if(!list||!id) return;
  var card=list.querySelector('.al[data-id="'+id+'"]');
  if(card){
    card.scrollIntoView({block:'center',behavior:'smooth'});
    flashFocus(card,'focus');
  }
}
function renderTickets(a){
  a=a||[];
  a.forEach(function(t){
    if(!ticketState[t.id]){
      ticketState[t.id]={age:Math.floor(Math.random()*70)+20,stage:t.stage||1};
    }
  });
  var scol={Dispatched:'#22c55e','En Route':'#3b82f6',Pending:'#8b89a0',Active:'#ef4444'};
  document.getElementById('tickets').innerHTML=a.map(function(t){
    var sc=scol[t.status]||'#8b89a0';
    var sb=t.status==='Dispatched'?'rgba(34,197,94,.12)':t.status==='En Route'?'rgba(59,130,246,.12)':t.status==='Active'?'rgba(239,68,68,.12)':'rgba(255,255,255,.05)';
    var sbr=t.status==='Dispatched'?'rgba(34,197,94,.25)':t.status==='En Route'?'rgba(59,130,246,.25)':t.status==='Active'?'rgba(239,68,68,.28)':'rgba(255,255,255,.1)';
    var st=ticketState[t.id]||{age:0,stage:0};
    var pipeline=t.pipeline||['ingest','analyze','review','dispatch'];
    var stage=Math.min(st.stage||0,pipeline.length-1);
    var progress=Math.round(((stage+1)/pipeline.length)*100);
    var late=t.slaSec?st.age>t.slaSec:false;
    var media=t.media||buildTicketMedia(t);
    var metaLine='<div class="tk-meta-line">'
      +'<span>Captured '+t.captured+'</span>'
      +'<span>Sensor '+t.sensor+'</span>'
      +'<span>Alt '+t.alt+'</span>'
      +'<span>Hdg '+t.heading+'</span>'
      +'<span>Conf '+t.conf+'</span>'
      +'</div>';
    var custody='<div class="tk-custody">Signed · SHA256: '+t.custody+'</div>';
    var sources='<div class="tk-sources">'+(t.sources||[]).map(function(s){return '<span class="tk-src">'+s+'</span>'}).join('')+'</div>';
    var actions='<div class="tk-actions">'+t.actions.map(function(a){return '<span class="tk-act '+a.cls+'">'+a.label+'</span>'}).join('')+'</div>';
    var approval='<div class="tk-approval">'+t.approval.label+'<span>'+t.approval.by+' · '+t.approval.time+'</span></div>';
    var steps=pipeline.map(function(p,i){return '<span class="tk-step'+(i===stage?' on':'')+'">'+p+'</span>'}).join('');
    return '<div class="tk t'+t.p[0]+'" data-id="'+t.id+'"><div class="tk-in">'
      +'<div class="tk-head"><div class="tk-id-w"><span class="tk-id">'+t.id+'</span><span class="tk-pr '+t.p+'">'+t.p+'</span></div>'
      +'<span class="tk-status" style="--stc:'+sc+';--stb:'+sb+';--stbr:'+sbr+'"><span class="tk-sdot"></span>'+t.status+'</span></div>'
      +'<div class="tk-title">'+t.t+'</div><div class="tk-desc">'+t.desc+'</div>'
      +'<div class="tk-subhead">'
      +'<span class="tk-sla'+(late?' late':'')+'">SLA '+t.sla+'</span>'
      +'<span class="tk-live"><span class="tk-live-dot"></span><span>Updated</span><span class="tk-age">'+formatAge(st.age)+' ago</span></span>'
      +'</div>'
      +'<div class="tk-progress"><div class="tk-progress-bar" style="width:'+progress+'%"></div></div>'
      +'<div class="tk-timeline">'+steps+'</div>'
      +'<div class="tk-media">'
      +'<div class="tk-img" data-label="'+media[0].label+'"><img alt="'+media[0].label+'" data-fallback="'+media[0].fallback+'" src="'+media[0].src+'" onerror="this.onerror=null;this.src=this.dataset.fallback;">'+renderMlOverlay(media[0].ml)+'</div>'
      +'<div class="tk-media-col">'
      +'<div class="tk-img" data-label="'+media[1].label+'"><img alt="'+media[1].label+'" data-fallback="'+media[1].fallback+'" src="'+media[1].src+'" onerror="this.onerror=null;this.src=this.dataset.fallback;">'+renderMlOverlay(media[1].ml)+'</div>'
      +'<div class="tk-img" data-label="'+media[2].label+'"><img alt="'+media[2].label+'" data-fallback="'+media[2].fallback+'" src="'+media[2].src+'" onerror="this.onerror=null;this.src=this.dataset.fallback;">'+renderMlOverlay(media[2].ml)+'</div>'
      +'</div></div>'
      +metaLine
      +sources
      +custody
      +'<div class="tk-gps"><svg class="gps-ico" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>'
      +'<div><div class="gps-lbl">GPS Coordinates</div><div class="gps-co">'+t.gps+'</div></div></div>'
      +'<div class="tk-meta"><div class="tm-it"><div class="tm-l">Assigned Drone</div><div class="tm-v" style="color:#a78bfa">'+t.drone+'</div></div>'
      +'<div class="tm-it"><div class="tm-l">ETA to Target</div><div class="tm-v">'+t.eta+'</div></div></div>'
      +'<div class="tk-tags">'+t.tags.map(function(tg){return '<span class="tag">'+tg+'</span>'}).join('')+'</div>'
      +actions
      +approval
      +'</div></div>'
  }).join('')
}

function findTicketById(id){
  var scenes=['flood','quake','fire'];
  for(var i=0;i<scenes.length;i++){
    var s=S[scenes[i]];
    if(!s||!s.tickets) continue;
    for(var j=0;j<s.tickets.length;j++){
      if(s.tickets[j].id===id) return s.tickets[j];
    }
  }
  return null;
}
function findTicketByDrone(scene,droneId){
  var s=S[scene];
  if(!s||!s.tickets) return null;
  for(var i=0;i<s.tickets.length;i++){
    if(s.tickets[i].drone===droneId) return s.tickets[i];
  }
  return null;
}
function findAlertByDrone(scene,droneId){
  var s=S[scene];
  if(!s||!s.alerts) return null;
  for(var i=0;i<s.alerts.length;i++){
    if(s.alerts[i].drone===droneId) return s.alerts[i];
  }
  return null;
}
function findAlertById(scene,id){
  var s=S[scene];
  if(!s||!s.alerts) return null;
  for(var i=0;i<s.alerts.length;i++){
    if(s.alerts[i].id===id) return s.alerts[i];
  }
  return null;
}
function focusMap(lat,lng,zoom){
  if(lat==null||lng==null) return;
  map.setView([lat,lng],zoom||16,{animate:true});
}
function focusAlert(alert){
  if(!alert) return;
  focusMap(alert.lat,alert.lng,16);
  focusAlertCard(alert.id);
  if(alert.drone){
    var t=findTicketByDrone(lastMapScene,alert.drone);
    if(t){openTicketModal(t);focusTicketCard(t.id);}
  }
}
function handleDroneClick(d){
  if(!d) return;
  setNavView('operations',{preserveScene:true});
  var ticket=findTicketByDrone(lastMapScene,d.id);
  if(ticket){
    openTicketModal(ticket);
    focusTicketCard(ticket.id);
  } else {
    var alert=findAlertByDrone(lastMapScene,d.id);
    if(alert) focusAlert(alert);
  }
  focusMap(d.lat,d.lng,16);
}
var alertsBound=false;
function bindAlertClicks(){
  if(alertsBound) return;
  var list=document.getElementById('alerts');
  if(!list) return;
  list.addEventListener('click',function(e){
    var card=e.target.closest('.al');
    if(!card) return;
    var alert=findAlertById(lastMapScene,card.dataset.id);
    if(alert) focusAlert(alert);
  });
  alertsBound=true;
}
function renderTicketModal(t){
  var modalBody=document.getElementById('tk-modal-body');
  var modalTitle=document.getElementById('tk-modal-title');
  var modalKicker=document.getElementById('tk-modal-kicker');
  var modalPrimary=document.getElementById('tk-modal-primary');
  if(!modalBody||!t) return;
  var media=buildTicketMedia(t);
  var st=ticketState[t.id]||{age:0,stage:0};
  var pipeline=t.pipeline||['ingest','analyze','review','dispatch'];
  var stage=Math.min(st.stage||0,pipeline.length-1);
  var progress=Math.round(((stage+1)/pipeline.length)*100);
  var severity=t.p||'high';
  var badges=(t.tags||[]).map(function(tag){return '<span class="tk-badge">'+tag+'</span>'}).join('');
  var sources=(t.sources||[]).map(function(src){return '<span class="tk-badge">'+src+'</span>'}).join('');
  var actions=(t.actions||[]).map(function(a){return '<span class="tk-act '+a.cls+'">'+a.label+'</span>'}).join('');
  var timeline=pipeline.map(function(p,i){return '<span class="'+(i===stage?'on':'')+'">'+p+'</span>'}).join('');
  var hero='<div class="tk-modal-hero"><img alt="'+media[0].label+'" src="'+media[0].src+'">'+renderMlOverlay(media[0].ml)+'</div>';
  var film='<div class="tk-film">'
    +media.map(function(m){
      return '<div class="tk-film-item"><img alt="'+m.label+'" src="'+m.src+'"></div>';
    }).join('')+'</div>';
  var summary='<div class="tk-side-card"><div class="tk-side-title">Mission Summary</div>'
    +'<div class="tk-modal-desc">'+t.desc+'</div>'
    +'<div class="tk-badges">'+badges+'</div>'
    +'<div class="tk-actions">'+actions+'</div>'
    +'</div>';
  var main='<div class="tk-modal-main">'
    +hero
    +'<div class="tk-progress"><div class="tk-progress-bar" style="width:'+progress+'%"></div></div>'
    +film
    +summary
    +'</div>';
  var side='<div class="tk-modal-side">'
    +'<div class="tk-side-card"><div class="tk-side-title">Mission Control</div>'
    +'<div class="tk-side-row"><span>Status</span><b>'+t.status+'</b></div>'
    +'<div class="tk-side-row"><span>SLA</span><b>'+t.sla+'</b></div>'
    +'<div class="tk-side-row"><span>ETA</span><b>'+t.eta+'</b></div>'
    +'<div class="tk-side-row"><span>Assigned Drone</span><b>'+t.drone+'</b></div>'
    +'<div class="tk-side-row"><span>Confidence</span><b>'+t.conf+'</b></div>'
    +'</div>'
    +'<div class="tk-side-card"><div class="tk-side-title">Pipeline</div>'
    +'<div class="tk-timeline-xl">'+timeline+'</div>'
    +'</div>'
    +'<div class="tk-side-card"><div class="tk-side-title">Location + Capture</div>'
    +'<div class="tk-side-row"><span>GPS</span><b>'+t.gps+'</b></div>'
    +'<div class="tk-side-row"><span>Captured</span><b>'+t.captured+'</b></div>'
    +'<div class="tk-side-row"><span>Sensor</span><b>'+t.sensor+'</b></div>'
    +'<div class="tk-side-row"><span>Altitude</span><b>'+t.alt+'</b></div>'
    +'<div class="tk-side-row"><span>Heading</span><b>'+t.heading+'</b></div>'
    +'</div>'
    +'<div class="tk-side-card"><div class="tk-side-title">Evidence Chain</div>'
    +'<div class="tk-side-row"><span>Signed</span><b>'+t.custody+'</b></div>'
    +'<div class="tk-side-row"><span>Approved</span><b>'+t.approval.by+'</b></div>'
    +'<div class="tk-side-row"><span>Timestamp</span><b>'+t.approval.time+'</b></div>'
    +'<div class="tk-side-row"><span>Sources</span><b>Live</b></div>'
    +'<div class="tk-badges">'+sources+'</div>'
    +'</div>'
    +'</div>';
  modalBody.innerHTML=main+side;
  if(modalTitle) modalTitle.textContent=t.t;
  if(modalKicker) modalKicker.textContent=t.id+' - '+severity.toUpperCase();
  if(modalPrimary){
    modalPrimary.textContent=t.status==='Pending'?'Approve Dispatch':t.status==='En Route'?'Track Mission':'Dispatch';
  }
}
function openTicketModal(t){
  var modal=document.getElementById('tk-modal');
  if(!modal||!t) return;
  renderTicketModal(t);
  modal.classList.add('on');
  modal.setAttribute('aria-hidden','false');
}
function closeTicketModal(){
  var modal=document.getElementById('tk-modal');
  if(!modal) return;
  modal.classList.remove('on');
  modal.setAttribute('aria-hidden','true');
}
function bindTicketModal(){
  var modal=document.getElementById('tk-modal');
  var closeBtn=document.getElementById('tk-modal-close');
  if(closeBtn){closeBtn.addEventListener('click',closeTicketModal);}
  if(modal){
    modal.addEventListener('click',function(e){
      if(e.target&&e.target.dataset&&e.target.dataset.close){closeTicketModal();}
    });
  }
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape') closeTicketModal();
  });
  var list=document.getElementById('tickets');
  if(list){
    list.addEventListener('click',function(e){
      var card=e.target.closest('.tk');
      if(!card) return;
      var t=findTicketById(card.dataset.id);
      if(t) openTicketModal(t);
    });
  }
}
function renderSources(s){
  var el=document.getElementById('sources');if(!el||!s||!s.sources)return;
  el.innerHTML=s.sources.map(function(src){
    return '<div class="src-row"><span class="src-tag">'+src.name+'</span><span class="src-link">'+src.detail+'</span></div>';
  }).join('');
}

var telemetrySeries={};
var telemetryLines=[];
var maintState={};

function avg(list,key){
  if(!list||!list.length) return 0;
  var sum=0;list.forEach(function(x){sum+=x[key]||0});
  return sum/list.length;
}
function ensureSeries(scene,key,base){
  if(!telemetrySeries[scene]) telemetrySeries[scene]={};
  if(!telemetrySeries[scene][key]){
    telemetrySeries[scene][key]=[];
    for(var i=0;i<18;i++) telemetrySeries[scene][key].push(base+(Math.random()-.5)*base*0.03);
  }
}
function getSeries(scene,key,base,drift,min,max){
  ensureSeries(scene,key,base);
  var s=telemetrySeries[scene][key];
  var last=s[s.length-1];
  var next=last+(Math.random()-.5)*drift;
  if(min!=null) next=Math.max(min,next);
  if(max!=null) next=Math.min(max,next);
  s.push(next);
  if(s.length>26) s.shift();
  return s;
}
function renderFleetView(scene){
  var ld=LD[scene];if(!ld) return;
  var drones=ld.drones;
  var counts={active:0,transit:0,delivery:0,standby:0};
  drones.forEach(function(d){if(counts[d.dot]!=null) counts[d.dot]+=1});
  var avgBatt=Math.round(avg(drones,'batt'));
  var avgAlt=Math.round(avg(drones,'alt'));
  var avgSpd=avg(drones,'spd').toFixed(1);
  var avgRssi=Math.round(avg(drones,'rssi'));
  var summary=document.getElementById('fleet-summary');
  if(summary){
    summary.innerHTML=''
      +'<span class="stat-chip">Active '+counts.active+'</span>'
      +'<span class="stat-chip">Transit '+counts.transit+'</span>'
      +'<span class="stat-chip">Delivery '+counts.delivery+'</span>'
      +'<span class="stat-chip">Standby '+counts.standby+'</span>';
  }
  var metrics=document.getElementById('fleet-metrics');
  if(metrics){
    metrics.innerHTML=''
      +'<div class="metric-item"><span>Avg Battery</span><b>'+avgBatt+'%</b></div>'
      +'<div class="metric-item"><span>Avg Altitude</span><b>'+avgAlt+' m</b></div>'
      +'<div class="metric-item"><span>Avg Speed</span><b>'+avgSpd+' m/s</b></div>'
      +'<div class="metric-item"><span>Avg Link</span><b>'+avgRssi+' dBm</b></div>';
  }
  var rows=document.getElementById('fleet-rows');
  if(rows){
    rows.innerHTML=drones.map(function(d){
      var col=droneColor(d);
      var batt=Math.round(d.batt);
      var ping=(Math.random()*2+0.3).toFixed(1)+'s';
      return '<div class="fleet-row">'
        +'<div class="fleet-id">'+d.id+'</div>'
        +'<div class="fleet-state"><span class="fleet-dot" style="background:'+col+';box-shadow:0 0 8px '+col+'"></span>'+d.state+'</div>'
        +'<div class="fleet-batt"><div class="fleet-bar"><span style="width:'+batt+'%"></span></div><span>'+batt+'%</span></div>'
        +'<div>'+d.alt.toFixed(0)+' m</div>'
        +'<div>'+d.spd.toFixed(1)+' m/s</div>'
        +'<div>'+d.hdg+' deg</div>'
        +'<div>'+d.rssi+' dBm</div>'
        +'<div>'+ping+'</div>'
        +'</div>';
    }).join('');
  }
  var queue=document.getElementById('fleet-queue');
  if(queue){
    var items=(S[scene]&&S[scene].tickets)?S[scene].tickets.slice(0,3):[];
    queue.innerHTML=items.map(function(t){
      return '<div class="queue-item"><h4>'+t.t+'</h4><p>'+t.desc+'</p>'
        +'<div class="queue-meta"><span>'+t.status+'</span><span>'+t.eta+'</span><span>'+t.drone+'</span></div></div>';
    }).join('');
  }
}
function renderTelemetryView(scene){
  var ld=LD[scene];if(!ld) return;
  var drones=ld.drones;
  var avgTemp=avg(drones,'t');
  var avgHum=avg(drones,'h');
  var avgVoc=avg(drones,'voc');
  var avgIaq=avg(drones,'iaq');
  var anomalies=drones.filter(function(d){return d.iaq>200||d.t>100||d.h<12}).length;
  var kpi=document.getElementById('telemetry-kpis');
  if(kpi){
    kpi.innerHTML=''
      +'<span class="stat-chip">Avg IAQ '+Math.round(avgIaq)+'</span>'
      +'<span class="stat-chip">Avg VOC '+Math.round(avgVoc)+' ppb</span>'
      +'<span class="stat-chip">Anomalies '+anomalies+'</span>'
      +'<span class="stat-chip">Uplink 2.4 Hz</span>';
  }
  var series=document.getElementById('telemetry-series');
  if(series){
    var tempSeries=getSeries(scene,'temp',avgTemp,0.6,avgTemp-6,avgTemp+6);
    var humSeries=getSeries(scene,'hum',avgHum,0.9,0,100);
    var vocSeries=getSeries(scene,'voc',avgVoc,8,0,1200);
    var iaqSeries=getSeries(scene,'iaq',avgIaq,6,0,500);
    series.innerHTML=''
      +'<div class="telemetry-card"><h4>Temperature</h4><div class="telemetry-val">'+avgTemp.toFixed(1)+' F</div>'
      +buildSparkline(tempSeries,'#f59e0b')+'</div>'
      +'<div class="telemetry-card"><h4>Humidity</h4><div class="telemetry-val">'+avgHum.toFixed(1)+'%</div>'
      +buildSparkline(humSeries,'#22d3ee')+'</div>'
      +'<div class="telemetry-card"><h4>VOC Index</h4><div class="telemetry-val">'+Math.round(avgVoc)+' ppb</div>'
      +buildSparkline(vocSeries,'#ef4444')+'</div>'
      +'<div class="telemetry-card"><h4>IAQ</h4><div class="telemetry-val">'+Math.round(avgIaq)+'</div>'
      +buildSparkline(iaqSeries,'#a3e635')+'</div>';
  }
}
function tickTelemetryFeed(scene){
  var line=makeFeedLine(scene);
  telemetryLines.push(line);
  if(telemetryLines.length>40) telemetryLines.shift();
  var feed=document.getElementById('telemetry-feed');
  if(feed) feed.innerHTML=telemetryLines.slice().reverse().join('');
}
function seedTelemetryFeed(scene){
  telemetryLines=[];
  for(var i=0;i<18;i++) telemetryLines.push(makeFeedLine(scene));
  tickTelemetryFeed(scene);
}
function ensureMaint(scene){
  if(!maintState[scene]){
    maintState[scene]={rotor:82,battery:76,sensors:88,rf:92,nav:90,airframe:86};
  }
}
function renderMaintenanceView(scene){
  ensureMaint(scene);
  var ms=maintState[scene];
  Object.keys(ms).forEach(function(k){
    ms[k]=Math.max(58,Math.min(99,ms[k]+(Math.random()-.5)*1.2));
  });
  var list=document.getElementById('maint-list');
  if(list){
    var drones=LD[scene].drones.slice().sort(function(a,b){return a.batt-b.batt}).slice(0,4);
    list.innerHTML=drones.map(function(d,idx){
      var due=(idx+1)*3.2;
      return '<div class="maint-item"><div><h4>'+d.id+' service check</h4>'
        +'<p>Battery '+Math.round(d.batt)+'% · '+d.state+' · Rotor cycle '+(1200+idx*34)+'</p></div>'
        +'<span class="maint-status">Due '+due.toFixed(1)+' h</span></div>';
    }).join('');
  }
  var bars=document.getElementById('maint-bars');
  if(bars){
    bars.innerHTML=''
      +'<div class="maint-bar"><span>Rotor Health</span><div class="bar"><i style="width:'+ms.rotor.toFixed(0)+'%"></i></div></div>'
      +'<div class="maint-bar"><span>Battery Reserve</span><div class="bar"><i style="width:'+ms.battery.toFixed(0)+'%"></i></div></div>'
      +'<div class="maint-bar"><span>Sensor Pack</span><div class="bar"><i style="width:'+ms.sensors.toFixed(0)+'%"></i></div></div>'
      +'<div class="maint-bar"><span>RF Link</span><div class="bar"><i style="width:'+ms.rf.toFixed(0)+'%"></i></div></div>'
      +'<div class="maint-bar"><span>Nav Stack</span><div class="bar"><i style="width:'+ms.nav.toFixed(0)+'%"></i></div></div>'
      +'<div class="maint-bar"><span>Airframe</span><div class="bar"><i style="width:'+ms.airframe.toFixed(0)+'%"></i></div></div>';
  }
  var orders=document.getElementById('maint-orders');
  if(orders){
    var list=LD[scene].drones.slice(0,3).map(function(d,idx){
      var level=idx===0?'high':idx===1?'med':'low';
      return '<div class="maint-order"><div><h4>'+d.id+' vibration audit</h4>'
        +'<p>Rotor imbalance flagged · '+d.state+' · '+d.alt.toFixed(0)+' m AGL</p></div>'
        +'<span class="maint-badge '+level+'">'+level+' priority</span></div>';
    }).join('');
    orders.innerHTML=list;
  }
  var forecast=document.getElementById('maint-forecast');
  if(forecast){
    forecast.innerHTML=''
      +'<div class="forecast-row"><span>Motor failure (72h)</span><b>'+(6+Math.random()*4).toFixed(1)+'%</b></div>'
      +'<div class="forecast-row"><span>Battery swap queue</span><b>'+Math.floor(8+Math.random()*5)+'</b></div>'
      +'<div class="forecast-row"><span>Sensor drift risk</span><b>'+(3+Math.random()*3).toFixed(1)+'%</b></div>'
      +'<div class="forecast-row"><span>Planned downtime</span><b>'+(2+Math.random()*2).toFixed(1)+' h</b></div>';
  }
}
function renderSourcesView(scene){
  var sources=(S[scene]&&S[scene].sources)?S[scene].sources.slice():[];
  sources= sources.concat([
    {name:'AirNow',detail:'PM2.5 + AQI overlay'},
    {name:'PlanetScope',detail:'Optical imagery · 3m'},
    {name:'Local Dispatch',detail:'Responder radio ingest'}
  ]);
  var grid=document.getElementById('source-grid');
  if(grid){
    grid.innerHTML=sources.map(function(s){
      var latency=(Math.random()*1.6+0.4).toFixed(1)+'s';
      return '<div class="source-card"><h4>'+s.name+'</h4>'
        +'<div class="source-meta"><span>'+s.detail+'</span><span>Latency '+latency+'</span></div>'
        +'<span class="source-status">Operational</span></div>';
    }).join('');
  }
  var insights=document.getElementById('source-insights');
  if(insights){
    insights.innerHTML=''
      +'<div class="insight"><h4>Coverage Health</h4><p>All core providers are green. Satellite revisits every 12 minutes with 98% uptime.</p></div>'
      +'<div class="insight"><h4>Latency Budget</h4><p>Median ingest latency is 1.2 seconds across the active stack. Outliers are auto-throttled.</p></div>'
      +'<div class="insight"><h4>Trust Posture</h4><p>Chain-of-custody signatures match. No data integrity drift detected in the last 24 hours.</p></div>';
  }
  var coverage=document.getElementById('source-coverage');
  if(coverage){
    coverage.innerHTML=''
      +'<div class="coverage-row"><span>Satellite imagery</span><b>94% coverage</b></div>'
      +'<div class="coverage-row"><span>Terrestrial sensors</span><b>88% coverage</b></div>'
      +'<div class="coverage-row"><span>Emergency calls</span><b>76% coverage</b></div>'
      +'<div class="coverage-row"><span>Responder radios</span><b>91% coverage</b></div>'
      +'<div class="coverage-row"><span>Weather overlays</span><b>99% coverage</b></div>';
  }
}
function renderSettingsView(scene){
  var region=document.getElementById('settings-region');
  if(region){
    var map={flood:'Central',quake:'Southwest',fire:'West'};
    region.textContent=map[scene]||'Central';
  }
}
function renderWorkViews(scene){
  renderFleetView(scene);
  renderTelemetryView(scene);
  renderMaintenanceView(scene);
  renderSourcesView(scene);
  renderSettingsView(scene);
}

// RISK ENGINE
function renderRisk(scene){
  var ld=LD[scene];if(!ld)return;
  var sc=Math.round(ld.score),col=riskColor(sc),lbl=riskLabel(sc);
  var e=document.getElementById('re-sc'),b=document.getElementById('re-bar'),lv=document.getElementById('re-lv'),ft=document.getElementById('re-feats');
  if(e){e.textContent=sc;e.style.color=col;numFlash(e)}
  if(b){b.style.width=sc+'%';b.style.background=col}
  if(lv){lv.textContent=lbl;lv.style.color=col;lv.style.background='rgba('+hexToRgb(col)+',.1)';lv.style.border='1px solid rgba('+hexToRgb(col)+',.2)'}
  if(ft&&ld.features) ft.innerHTML=ld.features.map(function(f){
    return '<div class="re-feat"><span class="re-fn">'+f.n+'</span><span class="re-fv" style="color:'+(f.hot?col:'var(--t2)')+'">'+f.v+'</span></div>'
  }).join('');
  setPP(scene);
}
function setPP(scene){
  var ld=LD[scene];if(!ld)return;
  var d=ld.drones[0];
  var sc=Math.round(ld.score),col=riskColor(sc),lbl=riskLabel(sc);
  var se=function(id,val,clr){var e=document.getElementById(id);if(e){e.textContent=val;if(clr)e.style.color=clr}};
  var tc=(((d.t-32)*5)/9).toFixed(2);
  var hpa=(d.p*33.8639).toFixed(2);
  var gas=d.gas_r>1000?(d.gas_r/1000).toFixed(1)+' kOhm':d.gas_r+' Ohm';
  se('pp-t',tc+' C / '+d.t.toFixed(1)+' F', d.t>100?'#ef4444':d.t>90?'#f97316':'#c4c2d9');
  se('pp-h',d.h.toFixed(2)+'%', d.h>90?'#3b82f6':d.h<20?'#f97316':'#c4c2d9');
  se('pp-p',hpa+' hPa','#c4c2d9');
  se('pp-g',gas, d.gas_r<2000?'#ef4444':d.gas_r<8000?'#f97316':'#22c55e');
  se('pp-iaq',d.iaq, d.iaq>200?'#ef4444':d.iaq>100?'#f97316':'#22c55e');
  se('pp-a',d.alt.toFixed(1)+' m','#c4c2d9');
  var pf=ld.ppFields;
  se('pp-dp',pf.dp);se('pp-dh',pf.dh);se('pp-dgr',pf.dgr,d.gas_r<2000?'#ef4444':'#8b89a0');
  se('pp-th',pf.th);se('pp-ws',pf.ws);
  var ps=document.getElementById('pp-sc');if(ps){ps.textContent=sc;ps.style.color=col;numFlash(ps)}
  var pb=document.getElementById('pp-bf');if(pb){pb.style.width=sc+'%';pb.style.background=col}
  var pl=document.getElementById('pp-lv');if(pl){pl.textContent=lbl+' RISK';pl.style.color=col}
  var su=document.getElementById('pp-sub');if(su)su.textContent=ld.sub;
  var pi=document.getElementById('pp-inf');if(pi)pi.textContent=document.getElementById('h-inf').textContent;
}

// DRONE CARDS
function renderCards(scene){
  var drones=LD[scene].drones;
  var area=document.getElementById('dc-area');if(!area)return;
  area.innerHTML=drones.map(function(d){
    if(!sparkData[d.id]) sparkData[d.id]=[];
    sparkData[d.id].push(d.iaq);
    if(sparkData[d.id].length>20) sparkData[d.id].shift();
    var bcol=d.batt>70?'#22c55e':d.batt>40?'#eab308':'#ef4444';
    var tCls=d.t>100?'hot':d.t>90?'warn':'dim';
    var hCls=d.h>90?'ok':d.h<20?'hot':'dim';
    var iCls=d.iaq>200?'hot':d.iaq>100?'warn':'ok';
    var gCls=d.gas_r<2000?'hot':d.gas_r<8000?'warn':'ok';
    var gas=d.gas_r>1000?(d.gas_r/1000).toFixed(1)+' kOhm':d.gas_r+' Ohm';
    var tc=(((d.t-32)*5)/9).toFixed(2);
    var hpa=(d.p*33.8639).toFixed(2);
    var volt=voltFromBatt(d.batt);
    var sigH='<div class="sig">'+[1,2,3,4].map(function(i){
      return '<div class="sb2'+(i<=d.sig?' on':'')+(i<=d.sig&&d.sig<=2?' wn':'')+'" style="height:'+(i*2+3)+'px"></div>'
    }).join('')+'</div>';
    var spark=buildSparkline(sparkData[d.id], d.iaq>200?'#ef4444':d.iaq>100?'#f97316':'#a78bfa','IAQ');
    var latStr=d.lat.toFixed(4)+' N';
    var lngStr=Math.abs(d.lng).toFixed(4)+' W';
    return '<div class="dc">'
      +'<div class="dc-h"><span class="dc-id">'+d.id+'</span>'
      +'<div class="dc-sg"><div class="dc-sd '+d.dot+'"></div><span class="dc-st">'+d.state+'</span></div></div>'
      +'<div class="dc-body">'
      +'<div class="dc-r"><span class="dc-k">Temp (C)</span><span class="dc-v '+tCls+'">'+tc+' C</span></div>'
      +'<div class="dc-r"><span class="dc-k">Humidity</span><span class="dc-v '+hCls+'">'+d.h.toFixed(2)+'%</span></div>'
      +'<div class="dc-r"><span class="dc-k">Pressure</span><span class="dc-v dim">'+hpa+' hPa</span></div>'
      +'<div class="dc-r"><span class="dc-k">Gas Resist.</span><span class="dc-v '+gCls+'">'+gas+'</span></div>'
      +'<div class="dc-r"><span class="dc-k">IAQ Index</span><span class="dc-v '+iCls+'">'+d.iaq+'</span></div>'
      +'<div class="dc-r"><span class="dc-k">Alt AGL</span><span class="dc-v hi">'+d.alt.toFixed(1)+' m</span></div>'
      +'</div>'
      +'<div class="dc-ft">'
      +'<div class="dc-meta"><b>'+d.spd.toFixed(1)+'</b>m/s <b>'+d.hdg+'deg</b> <b>'+d.rssi+'</b>dBm</div>'
      +'<div style="display:flex;align-items:center;gap:7px">'
      +sigH
      +'<span style="font-family:JetBrains Mono,monospace;font-size:8.5px;color:'+bcol+'">'+volt+'V</span>'
      +'</div></div>'
      +'<div class="dc-gps"><b>'+latStr+'</b> &nbsp; <b>'+lngStr+'</b> &nbsp; FIX:3D-DGPS</div>'
      +'<div class="dc-spark">'+spark+'</div>'
      +'</div>'
  }).join('');
}
function buildSparkline(data,col){
  if(!data||data.length<2) return '<svg class="dc-svg" viewBox="0 0 100 22"><line x1="0" y1="11" x2="100" y2="11" stroke="#1f1e2e" stroke-width="1"/></svg>';
  var min=Math.min.apply(null,data),max=Math.max.apply(null,data),range=max-min||1;
  var pts=data.map(function(v,i){return ((i/(data.length-1))*97+1)+','+(20-((v-min)/range)*18)});
  var area=pts.map(function(p,i){return(i?'L':'M')+p}).join(' ')+'L98,21 L1,21 Z';
  return '<svg class="dc-svg" viewBox="0 0 100 22" preserveAspectRatio="none">'
    +'<path d="'+area+'" fill="'+col+'" opacity=".07"/>'
    +'<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+col+'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    +'</svg>';
}

// RAW TERMINAL FEED
var feedLines=[],feedCounter={};
function makeFeedLine(scene){
  var drones=LD[scene].drones;
  var d=drones[Math.floor(Math.random()*drones.length)];
  d.seq=(d.seq||0)+1;
  if(!feedCounter[d.id]) feedCounter[d.id]=0;
  var ft=feedCounter[d.id]%3; feedCounter[d.id]++;
  var now=new Date();
  var ts=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0')+':'+now.getSeconds().toString().padStart(2,'0')+'.'+Math.floor(Math.random()*900+100).toString().padStart(3,'0');
  var isAnom=(d.iaq>250||d.t>100||d.h<12);
  var isWarn=(d.iaq>100||d.t>90||d.h<22);
  var cls='fl'+(isAnom?' an':isWarn?' wn':'');
  var line='';
  if(ft===0){
    var tc=(((d.t-32)*5)/9).toFixed(2);
    var hpa=(d.p*33.8639).toFixed(2);
    var gas=d.gas_r>1000?(d.gas_r/1000).toFixed(1)+'kOhm':d.gas_r+'Ohm';
    var tCol=d.t>100?'hot':d.t>90?'warn':'';
    var iCol=d.iaq>200?'hot':d.iaq>100?'warn':'ok';
    var gCol=d.gas_r<2000?'hot':d.gas_r<8000?'warn':'ok';
    line='<div class="'+cls+'">'
      +'<span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">SENS</span>'
      +'  <span class="fk">T:</span><span class="fv'+(tCol?' '+tCol:'')+'">'+tc+' C</span>'
      +' <span class="fk">H:</span><span class="fv">'+d.h.toFixed(2)+'%</span>'
      +' <span class="fk">P:</span><span class="fv">'+hpa+'hPa</span>'
      +' <span class="fk">GAS:</span><span class="fv '+gCol+'">'+gas+'</span>'
      +' <span class="fk">IAQ:</span><span class="fv '+iCol+'">'+d.iaq+'</span>'
      +'</div>';
  } else if(ft===1){
    line='<div class="'+cls+'">'
      +'<span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">NAV</span>'
      +'  <span class="fk">ALT:</span><span class="fv hi">'+d.alt.toFixed(1)+'m</span>'
      +' <span class="fk">GS:</span><span class="fv">'+d.spd.toFixed(1)+'m/s</span>'
      +' <span class="fk">HDG:</span><span class="fv">'+d.hdg+'deg</span>'
      +' <span class="fk">GPS:</span><span class="fv">'+d.lat.toFixed(4)+'N</span>'
      +'</div>';
  } else {
    var volt=voltFromBatt(d.batt);
    var bCol=d.batt<30?'hot':d.batt<50?'warn':'ok';
    line='<div class="'+cls+'">'
      +'<span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">SYS</span>'
      +'  <span class="fk">BATT:</span><span class="fv '+bCol+'">'+volt+'V('+Math.round(d.batt)+'%)</span>'
      +' <span class="fk">RSSI:</span><span class="fv '+(d.rssi<-74?'warn':'')+'">'+d.rssi+'dBm</span>'
      +' <span class="fk">CPU:</span><span class="fv">'+d.cpu+'%</span>'
      +' <span class="fk">MCU:</span><span class="fv">'+d.mcu_t+'C</span>'
      +'</div>';
  }
  return line;
}
function initFeed(scene){
  feedLines=[]; feedCounter={};
  var now=new Date();
  for(var i=60;i>=0;i--){
    var d=LD[scene].drones[Math.floor(Math.random()*LD[scene].drones.length)];
    d.seq=(d.seq||0)+1;
    if(!feedCounter[d.id]) feedCounter[d.id]=0;
    var ft=feedCounter[d.id]%3; feedCounter[d.id]++;
    var t2=new Date(now.getTime()-i*1800);
    var ts=t2.getHours().toString().padStart(2,'0')+':'+t2.getMinutes().toString().padStart(2,'0')+':'+t2.getSeconds().toString().padStart(2,'0')+'.'+Math.floor(Math.random()*900+100).toString().padStart(3,'0');
    var isAnom=(d.iaq>250||d.t>100||d.h<12);
    var isWarn=(d.iaq>100||d.t>90||d.h<22);
    var cls='fl'+(isAnom?' an':isWarn?' wn':'');
    var line='';
    if(ft===0){
      var tc=(((d.t-32)*5)/9).toFixed(2);var hpa=(d.p*33.8639).toFixed(2);
      var gas=d.gas_r>1000?(d.gas_r/1000).toFixed(1)+'kOhm':d.gas_r+'Ohm';
      var tCol=d.t>100?'hot':d.t>90?'warn':'';
      var iCol=d.iaq>200?'hot':d.iaq>100?'warn':'ok';
      var gCol=d.gas_r<2000?'hot':d.gas_r<8000?'warn':'ok';
      line='<div class="'+cls+'"><span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">SENS</span>'
        +'  <span class="fk">T:</span><span class="fv'+(tCol?' '+tCol:'')+'">'+tc+' C</span>'
        +' <span class="fk">H:</span><span class="fv">'+d.h.toFixed(2)+'%</span>'
        +' <span class="fk">P:</span><span class="fv">'+hpa+'hPa</span>'
        +' <span class="fk">GAS:</span><span class="fv '+gCol+'">'+gas+'</span>'
        +' <span class="fk">IAQ:</span><span class="fv '+iCol+'">'+d.iaq+'</span></div>';
    } else if(ft===1){
      line='<div class="'+cls+'"><span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">NAV</span>'
        +'  <span class="fk">ALT:</span><span class="fv hi">'+d.alt.toFixed(1)+'m</span>'
        +' <span class="fk">GS:</span><span class="fv">'+d.spd.toFixed(1)+'m/s</span>'
        +' <span class="fk">HDG:</span><span class="fv">'+d.hdg+'deg</span>'
        +' <span class="fk">GPS:</span><span class="fv">'+d.lat.toFixed(4)+'N</span></div>';
    } else {
      var volt=voltFromBatt(d.batt);var bCol=d.batt<30?'hot':d.batt<50?'warn':'ok';
      line='<div class="'+cls+'"><span class="ft">'+ts+'</span> <span class="fid">'+d.id+'</span> <span class="ftp">SYS</span>'
        +'  <span class="fk">BATT:</span><span class="fv '+bCol+'">'+volt+'V('+Math.round(d.batt)+'%)</span>'
        +' <span class="fk">RSSI:</span><span class="fv '+(d.rssi<-74?'warn':'')+'">'+d.rssi+'dBm</span>'
        +' <span class="fk">CPU:</span><span class="fv">'+d.cpu+'%</span>'
        +' <span class="fk">MCU:</span><span class="fv">'+d.mcu_t+'C</span></div>';
    }
    feedLines.push(line);
  }
}
function pushFeed(scene){
  var line=makeFeedLine(scene);
  feedLines.push(line);
  if(feedLines.length>150) feedLines.shift();
  var rf=document.getElementById('rf-body');
  if(rf) rf.innerHTML=feedLines.slice().reverse().join('');
}

function renderSVHeader(scene){
  var names={flood:'Hill Country Flood Response',quake:'Culberson County M5.8',fire:'Eastland Complex Wildfire'};
  var dc=document.getElementById('sv-cnt');if(dc)dc.textContent=(LD[scene]?LD[scene].drones.length:0)+' Drones Reporting';
  var ds=document.getElementById('sv-sc');if(ds)ds.textContent=names[scene]||'';
  var dt=document.getElementById('sv-ts');if(dt)dt.textContent='Last sync: '+new Date().toLocaleTimeString('en-US',{hour12:false});
}
function sceneLabel(scene){
  var names={flood:'Hill Country Flood',quake:'Culberson County',fire:'Eastland Complex',stream:'Sensor Stream'};
  return names[scene]||'Sentinel Response';
}
var mapFreshSec=0;
function formatFresh(sec){
  var m=Math.floor(sec/60);
  var s=Math.floor(sec%60);
  return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function updateMapFresh(){
  var el=document.getElementById('map-fresh');
  if(el) el.textContent='Data freshness: '+formatFresh(mapFreshSec);
}
function tickTickets(scene){
  ensureTicketState(scene);
  var tix=S[scene].tickets||[];
  tix.forEach(function(t){
    var st=ticketState[t.id];
    st.age+=2.5+Math.random()*1.5;
    if(Math.random()<0.08) st.age=Math.max(4,st.age-(8+Math.random()*15));
    var maxStage=(t.pipeline?t.pipeline.length-1:3);
    if(Math.random()<0.06&&st.stage<maxStage) st.stage+=1;
  });
  renderTickets(tix);
}

// TIMELINE
var TL={
  flood:[
    {t:'09:34:11',d:'#ef4444',tx:'SNT-001 flagged 3 individuals on rooftop - Guadalupe River crossing, confidence 94.3%',b:'CRITICAL',bc:'#ef4444'},
    {t:'09:36:22',d:'#7c3aed',tx:'MSN-041 auto-generated - emergency supply drop, 2.8 kg payload, authorized',b:'MSN-041',bc:'#7c3aed'},
    {t:'09:38:05',d:'#ef4444',tx:'SNT-002 flagged elderly person - porch partially submerged, mobility limited, conf 91.1%',b:'CRITICAL',bc:'#ef4444'},
    {t:'09:39:18',d:'#3b82f6',tx:'RR 1340 southbound submerged 3.5 ft - 4 vehicles stranded, road depth rising 0.4 ft/min',b:'ROAD CLOSED',bc:'#3b82f6'},
    {t:'09:41:44',d:'#3b82f6',tx:'MSN-042 dispatched - SNT-002 en route, ETA 7 min, payload: Med Kit + beacon',b:'EN ROUTE',bc:'#3b82f6'},
    {t:'09:43:02',d:'#eab308',tx:'Pressure drop -0.18 inHg/hr, gas resistance falling - Town Creek flash flood predicted T-20 min',b:'PREDICTION',bc:'#eab308'},
    {t:'09:44:31',d:'#a78bfa',tx:'SNT-005 recon pass initiated - Town Creek sector, altitude 74 m, IAQ nominal',b:'RECON',bc:'#7c3aed'},
    {t:'09:46:09',d:'#22c55e',tx:'MSN-041 delivery confirmed - comm device within 1.8 ft of target, emergency beacon active',b:'DELIVERED',bc:'#22c55e'},
    {t:'09:48:17',d:'#f97316',tx:'FM 1340 bridge debris accumulation detected - load-bearing supports at risk',b:'HIGH',bc:'#f97316'},
    {t:'09:51:33',d:'#22c55e',tx:'Ground rescue team coordinated via delivered comm device - arrival ETA 12 min',b:'RESCUE',bc:'#22c55e'}
  ],
  quake:[
    {t:'11:02:04',d:'#f97316',tx:'M5.8 seismic event - Van Horn, Culberson Co. - Sentinel fleet auto-deployed via geofence trigger',b:'SEISMIC',bc:'#f97316'},
    {t:'11:04:19',d:'#a855f7',tx:'SNT-013 VOC spike 342 ppb, gas resistance 3.2 kOhm - gas rupture confirmed Van Horn Main St',b:'GAS LEAK',bc:'#a855f7'},
    {t:'11:05:31',d:'#ef4444',tx:'SNT-011 flagged 2 individuals - collapsed residential structure, thermal confirmed motion',b:'CRITICAL',bc:'#ef4444'},
    {t:'11:06:48',d:'#ef4444',tx:'SNT-015 confirmed commercial collapse - Broadway Ave - unknown occupant count',b:'CRITICAL',bc:'#ef4444'},
    {t:'11:08:02',d:'#7c3aed',tx:'MSN-078 generated - rescue supply drop, 3.1 kg, comm device + glow markers + first aid',b:'MSN-078',bc:'#7c3aed'},
    {t:'11:09:14',d:'#f97316',tx:'US-90 surface crack detected - both lanes blocked, emergency vehicle re-routing required',b:'ROAD',bc:'#f97316'},
    {t:'11:10:27',d:'#eab308',tx:'Aftershock probability: M4.2+ within 2 hrs, confidence 78% (USGS ML model overlay)',b:'AFTERSHOCK',bc:'#eab308'},
    {t:'11:12:41',d:'#3b82f6',tx:'MSN-078 en route - SNT-011 visual lock maintained, ETA 3 min, RSSI -61 dBm',b:'EN ROUTE',bc:'#3b82f6'}
  ],
  fire:[
    {t:'14:11:07',d:'#ef4444',tx:'Eastland Complex fire front confirmed - 7 zones critical, IAQ 412, Sentinel fleet deployed',b:'CRITICAL',bc:'#ef4444'},
    {t:'14:13:22',d:'#ef4444',tx:'SNT-021 flagged family of 4 - property surrounded by advancing fire, road CR-435 cut off',b:'CRITICAL',bc:'#ef4444'},
    {t:'14:14:09',d:'#f97316',tx:'VOC 890 ppb, gas resistance 0.84 kOhm, IAQ 412 - hazardous visibility, drone thermal required',b:'HAZMAT',bc:'#f97316'},
    {t:'14:15:31',d:'#7c3aed',tx:'MSN-103 generated - N95 (x4), water 4L, comm device, beacon - 4.2 kg total payload',b:'MSN-103',bc:'#7c3aed'},
    {t:'14:16:44',d:'#ef4444',tx:'Fire line advancing NE at 1.2 mi/hr, wind gusts 67 mph - 3 additional properties in path',b:'ADVANCING',bc:'#ef4444'},
    {t:'14:17:58',d:'#ef4444',tx:'SNT-021 flagged lone rancher on ridgeline, conf 87.3% - all descent routes blocked by fire',b:'CRITICAL',bc:'#ef4444'},
    {t:'14:19:11',d:'#22c55e',tx:'MSN-103 dispatched - SNT-021 ETA 2 min, ground speed 8.5 m/s, RSSI -73 dBm',b:'DISPATCHED',bc:'#22c55e'},
    {t:'14:21:03',d:'#22c55e',tx:'MSN-103 delivery confirmed - within 2.1 ft, family comm established, beacon transmitting',b:'DELIVERED',bc:'#22c55e'},
    {t:'14:22:46',d:'#7c3aed',tx:'MSN-104 generated - SNT-022 en route to ridgeline, ETA 8 min, rescue beacon + water',b:'MSN-104',bc:'#7c3aed'},
    {t:'14:24:18',d:'#f97316',tx:'Wind gusts 67 mph sustained NE - fire spread model updated, T-18 min to structure encroachment',b:'WIND',bc:'#f97316'}
  ]
};
function renderTimeline(scene){
  var evs=TL[scene]||[];
  var doubled=evs.concat(evs);
  var el=document.getElementById('tl-inner');if(!el)return;
  el.innerHTML=doubled.map(function(e){
    return '<div class="tl-ev">'
      +'<span class="tl-t">'+e.t+'</span>'
      +'<div class="tl-d" style="background:'+e.d+'"></div>'
      +'<span class="tl-tx">'+e.tx+'</span>'
      +'<span class="tl-bx" style="color:'+e.bc+';background:rgba('+hexToRgb(e.bc)+',.09);border:1px solid rgba('+hexToRgb(e.bc)+',.2)">'+e.b+'</span>'
      +'</div>'
  }).join('');
}

// DRONE MODEL
var DRONE_STATE={
  id:'SNT-AX9',
  mission:'Hill Country Flood',
  battery:86.4,
  cpu:42,
  temp:46,
  link:98,
  rpm:{'prop-fl':4120,'prop-fr':4095,'prop-rl':4052,'prop-rr':4138},
  gps:12,
  rf:-62,
  lidar:14,
  gas:42,
  health:96
};
var droneFault={id:null,level:null,ttl:0};
var droneIntervals=[];
var droneBound=false;
var tiltBound=false;
var droneMode='inspect';
var pinnedPart=null;
var faultOverrides={};
var droneIssues=[];
var lastFaultKey='';
var autoRotateState={active:false,paused:false,base:0,raf:0,speed:0.08};
var droneTiltState=null;
var activeDronePart=null;
var droneRoster=[];
var droneIndex=0;
var droneSwitcherBound=false;
var threeState=null;

function seedFromId(id){
  var sum=0;
  for(var i=0;i<id.length;i++) sum=(sum*31+id.charCodeAt(i))%10000;
  return sum;
}
function makeBasicOrbitControls(camera,dom,target){
  var state={yaw:0.8,pitch:0.55,distance:9,target:target,dragging:false,lastX:0,lastY:0};
  function update(){
    var x=state.target.x+state.distance*Math.cos(state.pitch)*Math.sin(state.yaw);
    var y=state.target.y+state.distance*Math.sin(state.pitch);
    var z=state.target.z+state.distance*Math.cos(state.pitch)*Math.cos(state.yaw);
    camera.position.set(x,y,z);
    camera.lookAt(state.target);
  }
  function onDown(e){
    state.dragging=true;state.lastX=e.clientX;state.lastY=e.clientY;
    if(dom.setPointerCapture) dom.setPointerCapture(e.pointerId);
  }
  function onMove(e){
    if(!state.dragging) return;
    var dx=(e.clientX-state.lastX)*0.005;
    var dy=(e.clientY-state.lastY)*0.005;
    state.yaw-=dx;
    state.pitch=clamp(state.pitch-dy,0.1,Math.PI-0.1);
    state.lastX=e.clientX;state.lastY=e.clientY;
    update();
  }
  function onUp(e){
    state.dragging=false;
    if(dom.releasePointerCapture) dom.releasePointerCapture(e.pointerId);
  }
  function onWheel(e){
    state.distance=clamp(state.distance+e.deltaY*0.01,4.5,16);
    update();
  }
  dom.addEventListener('pointerdown',onDown);
  dom.addEventListener('pointermove',onMove);
  dom.addEventListener('pointerup',onUp);
  dom.addEventListener('pointerleave',onUp);
  dom.addEventListener('wheel',onWheel,{passive:true});
  update();
  return {update:update,target:state.target};
}
function initDrone3d(){
  if(threeState && threeState.renderer) return;
  var container=document.getElementById('dv-3d');
  var dv=document.getElementById('dv');
  if(!container||!dv||!window.THREE) return;
  dv.classList.add('dv-3d-on');
  container.innerHTML='';
  var renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setClearColor(0x0b0c12,1);
  renderer.setPixelRatio(window.devicePixelRatio||1);
  renderer.setSize(container.clientWidth,container.clientHeight);
  if(renderer.outputColorSpace) renderer.outputColorSpace=THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  var scene=new THREE.Scene();
  scene.background=new THREE.Color(0x0b0c12);

  var camera=new THREE.PerspectiveCamera(45,container.clientWidth/container.clientHeight,0.1,100);
  camera.position.set(7,5.2,8.5);

  var target=new THREE.Vector3(0,0.6,0);
  var controls;
  if(THREE.OrbitControls){
    controls=new THREE.OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;
    controls.dampingFactor=0.08;
    controls.minDistance=4.5;
    controls.maxDistance=16;
    controls.minPolarAngle=0.2;
    controls.maxPolarAngle=Math.PI-0.2;
    controls.target.copy(target);
    controls.update();
  } else {
    controls=makeBasicOrbitControls(camera,renderer.domElement,target);
  }

  var ambient=new THREE.AmbientLight(0xffffff,0.55);
  scene.add(ambient);
  var dir=new THREE.DirectionalLight(0xffffff,1.05);
  dir.position.set(6,8,6);
  scene.add(dir);
  var rim=new THREE.DirectionalLight(0x7c3aed,0.35);
  rim.position.set(-6,4,-4);
  scene.add(rim);

  var grid=new THREE.GridHelper(30,30,0x2b2d3c,0x151623);
  grid.position.y=-1.2;
  grid.material.opacity=0.6;
  grid.material.transparent=true;
  scene.add(grid);

  var deckMat=new THREE.MeshStandardMaterial({color:0x1a1f2a,transparent:true,opacity:0.35,metalness:0.1,roughness:0.7});
  var deck=new THREE.Mesh(new THREE.CircleGeometry(6,64),deckMat);
  deck.rotation.x=-Math.PI/2;
  deck.position.y=-1.18;
  scene.add(deck);

  var build=buildDroneMesh();
  var droneGroup=build.group;
  scene.add(droneGroup);

  var hotspots=buildHotspots(droneGroup);

  threeState={
    renderer:renderer,
    scene:scene,
    camera:camera,
    controls:controls,
    group:droneGroup,
    props:build.props,
    orbiters:build.orbiters,
    materials:build.materials,
    container:container,
    hotspots:hotspots,
    animId:0
  };

  function onResize(){
    if(!threeState) return;
    var w=container.clientWidth,h=container.clientHeight;
    if(!w||!h) return;
    camera.aspect=w/h;camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  }
  window.addEventListener('resize',onResize);
  setTimeout(onResize,80);

  function animate(){
    if(!threeState) return;
    threeState.animId=requestAnimationFrame(animate);
    threeState.props.forEach(function(p){p.rotation.y+=0.18;});
    threeState.orbiters.forEach(function(o){
      o.t+=o.speed;
      var x=Math.cos(o.t)*o.radius;
      var z=Math.sin(o.t)*o.radius;
      var y=o.height+Math.sin(o.t*1.3)*0.18;
      o.mesh.position.set(x,y,z);
      o.ring.position.set(x,y,z);
      o.ring.rotation.y+=0.02;
    });
    updateHotspotPositions();
    controls.update();
    renderer.render(scene,camera);
  }
  animate();
}
function buildDroneMesh(){
  var group=new THREE.Group();
  group.position.y=0.4;

  var bodyMat=new THREE.MeshStandardMaterial({color:0x0c0c12,metalness:0.55,roughness:0.35});
  var plateMat=new THREE.MeshStandardMaterial({color:0x10141d,metalness:0.45,roughness:0.5});
  var accentMat=new THREE.MeshStandardMaterial({color:0x7c3aed,emissive:0x2b0f4b,emissiveIntensity:0.7,metalness:0.4,roughness:0.25});
  var accentMat2=new THREE.MeshStandardMaterial({color:0x22d3ee,emissive:0x0b2b33,emissiveIntensity:0.6,metalness:0.4,roughness:0.25});

  var body=new THREE.Mesh(new THREE.BoxGeometry(3.6,0.6,2.4),bodyMat);
  body.position.y=0.2;
  group.add(body);

  var deck=new THREE.Mesh(new THREE.BoxGeometry(1.9,0.2,1.1),accentMat2);
  deck.position.set(0,0.55,0);
  group.add(deck);

  var core=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.2,0.3),accentMat);
  core.position.set(0,-0.05,1.0);
  group.add(core);

  var armMat=new THREE.MeshStandardMaterial({color:0x0b0c12,metalness:0.5,roughness:0.4});
  var armGeo=new THREE.BoxGeometry(2.6,0.14,0.24);
  var armFront=new THREE.Mesh(armGeo,armMat);armFront.position.set(0,0.05,1.05);group.add(armFront);
  var armBack=new THREE.Mesh(armGeo,armMat);armBack.position.set(0,0.05,-1.05);group.add(armBack);
  var armLeft=new THREE.Mesh(new THREE.BoxGeometry(2.1,0.14,0.24),armMat);armLeft.rotation.y=Math.PI/2;armLeft.position.set(-1.45,0.05,0);group.add(armLeft);
  var armRight=new THREE.Mesh(new THREE.BoxGeometry(2.1,0.14,0.24),armMat);armRight.rotation.y=Math.PI/2;armRight.position.set(1.45,0.05,0);group.add(armRight);

  var propMat=new THREE.MeshStandardMaterial({color:0x11131a,metalness:0.35,roughness:0.5});
  var propGeo=new THREE.CylinderGeometry(0.55,0.55,0.06,32);
  var props=[];
  [[-2.2,0.28,1.6],[2.2,0.28,1.6],[-2.2,0.28,-1.6],[2.2,0.28,-1.6]].forEach(function(p){
    var prop=new THREE.Mesh(propGeo,propMat);
    prop.rotation.x=Math.PI/2;
    prop.position.set(p[0],p[1],p[2]);
    group.add(prop);
    props.push(prop);
  });

  var orbMats=[
    new THREE.MeshStandardMaterial({color:0xa7f3d0,metalness:0.25,roughness:0.25,emissive:0x04281f,emissiveIntensity:0.3}),
    new THREE.MeshStandardMaterial({color:0xfef3c7,metalness:0.25,roughness:0.25,emissive:0x3a2a05,emissiveIntensity:0.25}),
    new THREE.MeshStandardMaterial({color:0xfca5a5,metalness:0.25,roughness:0.25,emissive:0x3b1111,emissiveIntensity:0.28})
  ];
  var ringMats=[
    new THREE.MeshStandardMaterial({color:0xa7f3d0,transparent:true,opacity:0.35,metalness:0.1,roughness:0.4}),
    new THREE.MeshStandardMaterial({color:0xfef3c7,transparent:true,opacity:0.35,metalness:0.1,roughness:0.4}),
    new THREE.MeshStandardMaterial({color:0xfca5a5,transparent:true,opacity:0.35,metalness:0.1,roughness:0.4})
  ];
  var orbiters=[];
  var sphereGeo=new THREE.SphereGeometry(0.32,24,24);
  var ringGeo=new THREE.TorusGeometry(0.5,0.05,12,40);
  [
    {r:1.8,s:0.008,h:0.6,mat:0,phase:0.2},
    {r:1.5,s:-0.01,h:0.45,mat:1,phase:2.1},
    {r:1.3,s:0.012,h:0.35,mat:2,phase:1.2},
    {r:2.0,s:-0.007,h:0.25,mat:0,phase:3.2},
    {r:1.7,s:0.009,h:0.15,mat:1,phase:4.0}
  ].forEach(function(o){
    var sphere=new THREE.Mesh(sphereGeo,orbMats[o.mat]);
    var ring=new THREE.Mesh(ringGeo,ringMats[o.mat]);
    ring.rotation.x=Math.PI/2;
    group.add(sphere);group.add(ring);
    orbiters.push({mesh:sphere,ring:ring,radius:o.r,speed:o.s,height:o.h,t:o.phase});
  });

  return {
    group:group,
    props:props,
    orbiters:orbiters,
    materials:{accent:accentMat,accent2:accentMat2,nodeMats:orbMats,ringMats:ringMats}
  };
}
function buildHotspots(group){
  var hotspotMap={
    'core':new THREE.Vector3(0,0.35,0.1),
    'battery':new THREE.Vector3(0,0.2,-0.2),
    'camera':new THREE.Vector3(0,0.05,1.35),
    'lidar':new THREE.Vector3(0,0.62,0),
    'prop-fl':new THREE.Vector3(-2.2,0.28,1.6),
    'prop-fr':new THREE.Vector3(2.2,0.28,1.6),
    'prop-rl':new THREE.Vector3(-2.2,0.28,-1.6),
    'prop-rr':new THREE.Vector3(2.2,0.28,-1.6),
    'rf':new THREE.Vector3(0.8,0.18,0.2),
    'gps':new THREE.Vector3(0.8,0.62,-0.1),
    'sensor':new THREE.Vector3(-0.8,0.18,0.2)
  };
  var out={};
  document.querySelectorAll('.dv-hot').forEach(function(el){
    var key=el.dataset.part;
    if(hotspotMap[key]) out[key]={el:el,pos:hotspotMap[key].clone()};
  });
  return out;
}
function updateHotspotPositions(){
  if(!threeState||!threeState.hotspots) return;
  var container=threeState.container;
  var rect=container.getBoundingClientRect();
  var width=rect.width,height=rect.height;
  if(!width||!height) return;
  Object.keys(threeState.hotspots).forEach(function(k){
    var h=threeState.hotspots[k];
    var p=h.pos.clone().applyMatrix4(threeState.group.matrixWorld).project(threeState.camera);
    var visible=p.z>-1&&p.z<1;
    var x=(p.x*0.5+0.5)*width;
    var y=(-p.y*0.5+0.5)*height;
    h.el.style.left=x+'px';
    h.el.style.top=y+'px';
    h.el.style.opacity=visible?1:0;
    h.el.style.pointerEvents=visible?'auto':'none';
  });
}
function setDroneModelFromLive(d){
  if(!d) return;
  var seed=seedFromId(d.id);
  var base=3800+(seed%240);
  DRONE_STATE.id=d.id;
  DRONE_STATE.mission=sceneLabel(lastMapScene);
  DRONE_STATE.battery=d.batt;
  DRONE_STATE.cpu=d.cpu;
  DRONE_STATE.temp=d.mcu_t;
  DRONE_STATE.rf=d.rssi;
  DRONE_STATE.link=Math.round(clamp(102-Math.abs(d.rssi+60)*1.2,78,99));
  DRONE_STATE.lidar=10+(seed%6);
  DRONE_STATE.gas=d.voc;
  DRONE_STATE.gps=10+(seed%4);
  DRONE_STATE.rpm={
    'prop-fl':base,
    'prop-fr':base+40,
    'prop-rl':base-30,
    'prop-rr':base+20
  };
  DRONE_STATE.health=clamp(96-(100-d.batt)*0.35-Math.abs(d.rssi+60)*0.45,60,98);
  var active=document.getElementById('dv-active');
  if(active) active.textContent=d.id+' · '+d.state;
  applyDroneTheme(seed,d);
}
function applyDroneTheme(seed,d){
  var dv=document.getElementById('dv');
  if(!dv) return;
  var palettes=[
    {accent:'#7c3aed',accent2:'#22d3ee',nodes:['#a7f3d0','#fef3c7','#fca5a5'],orbits:[240,186,144],speeds:[16,12,10],tilts:[12,-18,22]},
    {accent:'#22c55e',accent2:'#3b82f6',nodes:['#bfdbfe','#fca5a5','#fde68a'],orbits:[220,170,136],speeds:[18,13,11],tilts:[-10,16,-24]},
    {accent:'#f97316',accent2:'#a855f7',nodes:['#c7d2fe','#fcd34d','#fecaca'],orbits:[250,190,150],speeds:[15,11,9],tilts:[14,-20,26]},
    {accent:'#0ea5e9',accent2:'#14b8a6',nodes:['#a5f3fc','#f9a8d4','#bbf7d0'],orbits:[230,176,132],speeds:[17,12,10],tilts:[-14,18,-20]}
  ];
  var p=palettes[seed%palettes.length];
  var spd=d&&d.spd?clamp(d.spd/10,0.7,1.4):1;
  var s1=(p.speeds[0]/spd).toFixed(1);
  var s2=(p.speeds[1]/spd).toFixed(1);
  var s3=(p.speeds[2]/spd).toFixed(1);
  dv.style.setProperty('--dv-accent',p.accent);
  dv.style.setProperty('--dv-accent-2',p.accent2);
  dv.style.setProperty('--dv-node-1',p.nodes[0]);
  dv.style.setProperty('--dv-node-2',p.nodes[1]);
  dv.style.setProperty('--dv-node-3',p.nodes[2]);
  dv.style.setProperty('--dv-orbit-1',p.orbits[0]+'px');
  dv.style.setProperty('--dv-orbit-2',p.orbits[1]+'px');
  dv.style.setProperty('--dv-orbit-3',p.orbits[2]+'px');
  dv.style.setProperty('--dv-orbit-1-speed',s1+'s');
  dv.style.setProperty('--dv-orbit-2-speed',s2+'s');
  dv.style.setProperty('--dv-orbit-3-speed',s3+'s');
  dv.style.setProperty('--dv-orbit-1-tilt',p.tilts[0]+'deg');
  dv.style.setProperty('--dv-orbit-2-tilt',p.tilts[1]+'deg');
  dv.style.setProperty('--dv-orbit-3-tilt',p.tilts[2]+'deg');
  updateDrone3dTheme(p);
}
function updateDrone3dTheme(p){
  if(!threeState||!threeState.materials) return;
  var m=threeState.materials;
  if(m.accent){m.accent.color.set(p.accent);m.accent.emissive.set(p.accent);}
  if(m.accent2){m.accent2.color.set(p.accent2);m.accent2.emissive.set(p.accent2);}
  if(m.nodeMats){
    if(m.nodeMats[0]) m.nodeMats[0].color.set(p.nodes[0]);
    if(m.nodeMats[1]) m.nodeMats[1].color.set(p.nodes[1]);
    if(m.nodeMats[2]) m.nodeMats[2].color.set(p.nodes[2]);
  }
  if(m.ringMats){
    if(m.ringMats[0]) m.ringMats[0].color.set(p.nodes[0]);
    if(m.ringMats[1]) m.ringMats[1].color.set(p.nodes[1]);
    if(m.ringMats[2]) m.ringMats[2].color.set(p.nodes[2]);
  }
}
function selectDroneByIndex(idx){
  if(!droneRoster.length) return;
  droneIndex=(idx+droneRoster.length)%droneRoster.length;
  var d=droneRoster[droneIndex];
  setDroneModelFromLive(d);
  renderDroneView();
}
function refreshDroneRoster(scene){
  var ld=LD[scene];
  if(!ld) return;
  droneRoster=ld.drones.slice();
  if(droneIndex>=droneRoster.length) droneIndex=0;
  selectDroneByIndex(droneIndex);
}
function bindDroneSwitcher(){
  if(droneSwitcherBound) return;
  var prev=document.getElementById('dv-prev');
  var next=document.getElementById('dv-next');
  if(prev) prev.addEventListener('click',function(){selectDroneByIndex(droneIndex-1);});
  if(next) next.addEventListener('click',function(){selectDroneByIndex(droneIndex+1);});
  droneSwitcherBound=true;
}

function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function statusLabel(s){return s==='fail'?'FAULT':s==='warn'?'WARN':'OK'}

function partStatus(id){
  if(faultOverrides[id]) return faultOverrides[id];
  if(droneFault.id===id) return droneFault.level;
  if(id==='battery' && DRONE_STATE.battery<30) return 'warn';
  return 'ok';
}
function computeDroneParts(){
  return [
    {id:'core',name:'Flight Core',status:partStatus('core'),metric:'CPU '+DRONE_STATE.cpu+'% · '+DRONE_STATE.temp+'C'},
    {id:'battery',name:'Battery Pack',status:partStatus('battery'),metric:DRONE_STATE.battery.toFixed(1)+'%'},
    {id:'camera',name:'EO Camera',status:partStatus('camera'),metric:'4K 30 fps'},
    {id:'lidar',name:'Lidar',status:partStatus('lidar'),metric:DRONE_STATE.lidar+' Hz sweep'},
    {id:'sensor',name:'Gas Sensor',status:partStatus('sensor'),metric:DRONE_STATE.gas+' ppb VOC'},
    {id:'rf',name:'RF Link',status:partStatus('rf'),metric:DRONE_STATE.rf+' dBm'},
    {id:'gps',name:'GPS',status:partStatus('gps'),metric:DRONE_STATE.gps+' sats'},
    {id:'prop-fl',name:'Propeller FL',status:partStatus('prop-fl'),metric:DRONE_STATE.rpm['prop-fl']+' RPM'},
    {id:'prop-fr',name:'Propeller FR',status:partStatus('prop-fr'),metric:DRONE_STATE.rpm['prop-fr']+' RPM'},
    {id:'prop-rl',name:'Propeller RL',status:partStatus('prop-rl'),metric:DRONE_STATE.rpm['prop-rl']+' RPM'},
    {id:'prop-rr',name:'Propeller RR',status:partStatus('prop-rr'),metric:DRONE_STATE.rpm['prop-rr']+' RPM'}
  ];
}
function computeDroneStreams(){
  return [
    {id:'eo',name:'EO Camera',status:partStatus('camera'),metric:'4K 30 fps · 120 Mbps'},
    {id:'ir',name:'Thermal',status:'ok',metric:'30 fps · 48 Mbps'},
    {id:'lidar',name:'Lidar Cloud',status:partStatus('lidar'),metric:DRONE_STATE.lidar+' Hz · 2.1M pts/s'},
    {id:'gas',name:'Gas Telemetry',status:partStatus('sensor'),metric:DRONE_STATE.gas+' ppb · 2.4 Hz'},
    {id:'nav',name:'Nav + IMU',status:'ok',metric:'Fusion lock · 200 Hz'},
    {id:'rf',name:'RF Link',status:partStatus('rf'),metric:DRONE_STATE.link+'% link quality'}
  ];
}
function computeMaintenance(){
  var rotorLife=DRONE_STATE.battery>30?'ok':'warn';
  var vib=droneFault.id&&droneFault.id.indexOf('prop-')===0?'warn':'ok';
  return [
    {name:'Rotor Cycles',metric:'1,284',status:rotorLife},
    {name:'Motor Hours',metric:'212.6 h',status:'ok'},
    {name:'Vibration',metric:vib==='warn'?'Above baseline':'Nominal',status:vib},
    {name:'Filter Life',metric:'78% remaining',status:'ok'},
    {name:'Next Service',metric:'36.2 h',status:'ok'}
  ];
}
function computeFaults(parts){
  var faults=parts.filter(function(p){return p.status!=='ok'}).map(function(p){
    var msg=p.status==='fail'?'FAULT: '+p.name+' offline':'WARN: '+p.name+' degraded';
    return {msg:msg,ok:false};
  });
  if(!faults.length) faults=[{msg:'All systems nominal',ok:true}];
  return faults;
}
function logDroneIssue(msg,level){
  var ts=new Date().toLocaleTimeString('en-US',{hour12:false});
  droneIssues.unshift({msg:ts+' · '+msg,level:level||'ok'});
  if(droneIssues.length>6) droneIssues.length=6;
}
function renderPinnedPart(parts){
  var el=document.getElementById('dv-pinned');if(!el)return;
  var p=parts.filter(function(x){return x.id===pinnedPart})[0];
  if(!p){el.textContent='None selected';return;}
  el.textContent=p.name+' · '+p.metric+' · '+statusLabel(p.status);
}
function renderIssueLog(){
  var el=document.getElementById('dv-issues');if(!el)return;
  if(!droneIssues.length){el.innerHTML='<div class="dv-issue ok">No recent issues</div>';return;}
  el.innerHTML=droneIssues.map(function(i){
    return '<div class="dv-issue '+i.level+'">'+i.msg+'</div>';
  }).join('');
}
function renderDroneView(){
  var parts=computeDroneParts();
  var streams=computeDroneStreams();
  var maint=computeMaintenance();
  var faults=computeFaults(parts);
  var subEl=document.getElementById('dv-sub');
  if(subEl){
    var ts=new Date().toLocaleTimeString('en-US',{hour12:false});
    subEl.textContent=DRONE_STATE.id+' | '+DRONE_STATE.mission+' | Last update '+ts;
  }
  var partsEl=document.getElementById('dv-parts');
  if(partsEl){
    partsEl.innerHTML=parts.map(function(p){
      return '<div class="dv-item">'
        +'<div class="dv-meta"><div class="dv-name-sm">'+p.name+'</div><div class="dv-val">'+p.metric+'</div></div>'
        +'<span class="dv-status '+p.status+'">'+statusLabel(p.status)+'</span></div>';
    }).join('');
  }
  var streamEl=document.getElementById('dv-stream');
  if(streamEl){
    streamEl.innerHTML=streams.map(function(s){
      return '<div class="dv-flow">'
        +'<div class="dv-meta"><div class="dv-name-sm">'+s.name+'</div><div class="dv-val">'+s.metric+'</div></div>'
        +'<span class="dv-status '+s.status+'">'+statusLabel(s.status)+'</span></div>';
    }).join('');
  }
  var maintEl=document.getElementById('dv-maint');
  if(maintEl){
    maintEl.innerHTML=maint.map(function(m){
      return '<div class="dv-item">'
        +'<div class="dv-meta"><div class="dv-name-sm">'+m.name+'</div><div class="dv-val">'+m.metric+'</div></div>'
        +'<span class="dv-status '+m.status+'">'+statusLabel(m.status)+'</span></div>';
    }).join('');
  }
  var faultEl=document.getElementById('dv-faults-list');
  if(faultEl){
    faultEl.innerHTML=faults.map(function(f){
      return '<div class="dv-fault'+(f.ok?' ok':'')+'">'+f.msg+'</div>';
    }).join('');
  }
  var linkEl=document.getElementById('dv-link');
  if(linkEl){linkEl.textContent='LINK '+DRONE_STATE.link+'%';linkEl.className='dv-badge '+(DRONE_STATE.link>90?'ok':DRONE_STATE.link>80?'warn':'fail')}
  var healthEl=document.getElementById('dv-health');
  if(healthEl){healthEl.textContent='HEALTH '+DRONE_STATE.health+'%';healthEl.className='dv-badge '+(DRONE_STATE.health>90?'ok':DRONE_STATE.health>80?'warn':'fail')}
  var faultsCount=parts.filter(function(p){return p.status!=='ok'}).length;
  var faultsEl=document.getElementById('dv-faults');
  if(faultsEl){
    faultsEl.textContent='FAULTS '+faultsCount;
    faultsEl.className='dv-badge '+(faultsCount===0?'ok':faultsCount>1?'fail':'warn');
  }
  renderPinnedPart(parts);
  renderIssueLog();
  updateDroneHotspots(parts);
  if(activeDronePart) showDroneTip(activeDronePart);
}
function updateDroneHotspots(parts){
  var map={};parts.forEach(function(p){map[p.id]=p});
  document.querySelectorAll('.dv-hot').forEach(function(h){
    var p=map[h.dataset.part];
    h.className='dv-hot '+(p?p.status:'ok');
  });
  document.querySelectorAll('.dv-part').forEach(function(el){
    var p=map[el.getAttribute('data-part')];
    el.classList.toggle('warn',!!p&&p.status==='warn');
    el.classList.toggle('fail',!!p&&p.status==='fail');
  });
}
function showDroneTip(partId){
  var parts=computeDroneParts();
  var p=parts.filter(function(x){return x.id===partId})[0];
  var tip=document.getElementById('dv-tip');
  var canvas=document.getElementById('dv-canvas');
  var hot=canvas?canvas.querySelector('.dv-hot[data-part="'+partId+'"]'):null;
  if(!tip||!canvas||!hot||!p) return;
  var cRect=canvas.getBoundingClientRect();
  var hRect=hot.getBoundingClientRect();
  tip.style.left=(hRect.left-cRect.left+hRect.width/2)+'px';
  tip.style.top=(hRect.top-cRect.top-6)+'px';
  tip.innerHTML='<strong>'+p.name+'</strong><br>'+p.metric+'<br>Status: '+statusLabel(p.status);
  tip.classList.add('show');
  document.querySelectorAll('.dv-part').forEach(function(el){
    el.classList.toggle('active',el.getAttribute('data-part')===partId);
  });
}
function hideDroneTip(){
  var tip=document.getElementById('dv-tip');
  if(tip) tip.classList.remove('show');
  document.querySelectorAll('.dv-part').forEach(function(el){el.classList.remove('active')});
}
function bindDroneHotspots(){
  if(droneBound) return;
  var canvas=document.getElementById('dv-canvas');
  if(!canvas) return;
  canvas.querySelectorAll('.dv-hot').forEach(function(h){
    h.addEventListener('mouseenter',function(){activeDronePart=h.dataset.part;showDroneTip(activeDronePart)});
    h.addEventListener('mouseleave',function(){activeDronePart=null;hideDroneTip()});
    h.addEventListener('click',function(){
      var id=h.dataset.part;
      if(droneMode==='pin'){
        pinnedPart=id;
        renderDroneView();
        logDroneIssue('Pinned '+id,'ok');
      }
      if(droneMode==='fault'){
        var cur=faultOverrides[id]||'ok';
        var next=cur==='ok'?'warn':cur==='warn'?'fail':'ok';
        if(next==='ok'){delete faultOverrides[id];} else {faultOverrides[id]=next;}
        logDroneIssue('Override '+id+' => '+next, next==='fail'?'fail':next==='warn'?'warn':'ok');
        renderDroneView();
      }
    });
  });
  droneBound=true;
}
function bindDroneTilt(){
  if(tiltBound) return;
  var canvas=document.getElementById('dv-canvas');
  var rig=document.getElementById('dv-rig');
  if(!canvas||!rig) return;
  var state={x:0,y:0,base:0,raf:0};
  droneTiltState=state;
  function apply(){
    rig.style.transform='rotateX('+state.x+'deg) rotateY('+(state.y+state.base)+'deg)';
    state.raf=0;
  }
  function onMove(clientX,clientY){
    var rect=canvas.getBoundingClientRect();
    var rx=((clientY-rect.top)/rect.height)-0.5;
    var ry=((clientX-rect.left)/rect.width)-0.5;
    state.x=clamp(-rx*12,-12,12);
    state.y=clamp(ry*18,-18,18);
    if(!state.raf) state.raf=requestAnimationFrame(apply);
  }
  canvas.addEventListener('mouseenter',function(){autoRotateState.paused=true;});
  canvas.addEventListener('mouseleave',function(){autoRotateState.paused=false;state.x=0;state.y=0;if(!state.raf) state.raf=requestAnimationFrame(apply)});
  canvas.addEventListener('mousemove',function(e){onMove(e.clientX,e.clientY)});
  canvas.addEventListener('touchmove',function(e){
    if(e.touches&&e.touches[0]) onMove(e.touches[0].clientX,e.touches[0].clientY);
  },{passive:true});
  canvas.addEventListener('touchend',function(){autoRotateState.paused=false;state.x=0;state.y=0;if(!state.raf) state.raf=requestAnimationFrame(apply)});
  tiltBound=true;
}
function setDroneMode(mode){
  droneMode=mode;
  document.querySelectorAll('.dv-mode').forEach(function(btn){
    btn.classList.toggle('on',btn.dataset.mode===mode);
  });
}
function bindDroneModes(){
  var wrap=document.getElementById('dv-modes');
  if(!wrap) return;
  wrap.querySelectorAll('.dv-mode').forEach(function(btn){
    btn.addEventListener('click',function(){setDroneMode(btn.dataset.mode);});
  });
}
function startDroneAutoRotate(){
  if(autoRotateState.active) return;
  autoRotateState.active=true;
  function tick(){
    if(!autoRotateState.active) return;
    if(droneTiltState && !autoRotateState.paused){
      autoRotateState.base+=autoRotateState.speed;
      droneTiltState.base=autoRotateState.base;
      if(!droneTiltState.raf) droneTiltState.raf=requestAnimationFrame(function(){
        var rig=document.getElementById('dv-rig');
        if(rig){rig.style.transform='rotateX('+droneTiltState.x+'deg) rotateY('+(droneTiltState.y+droneTiltState.base)+'deg)';}
        droneTiltState.raf=0;
      });
    }
    autoRotateState.raf=requestAnimationFrame(tick);
  }
  autoRotateState.raf=requestAnimationFrame(tick);
}
function stopDroneAutoRotate(){
  autoRotateState.active=false;
  if(autoRotateState.raf){cancelAnimationFrame(autoRotateState.raf);autoRotateState.raf=0;}
}
function updateDroneState(){
  DRONE_STATE.battery=clamp(DRONE_STATE.battery-0.12,18,100);
  DRONE_STATE.cpu=Math.round(clamp(DRONE_STATE.cpu+(Math.random()-.5)*6,28,64));
  DRONE_STATE.temp=Math.round(clamp(DRONE_STATE.temp+(Math.random()-.4)*2,40,60));
  DRONE_STATE.link=Math.round(clamp(DRONE_STATE.link+(Math.random()-.45)*2,82,99));
  DRONE_STATE.lidar=Math.round(clamp(DRONE_STATE.lidar+(Math.random()-.4)*2,10,16));
  DRONE_STATE.gas=Math.round(clamp(DRONE_STATE.gas+(Math.random()-.5)*6,28,86));
  Object.keys(DRONE_STATE.rpm).forEach(function(k){
    DRONE_STATE.rpm[k]=Math.round(clamp(DRONE_STATE.rpm[k]+(Math.random()-.5)*120,3700,4400));
  });
  if(droneFault.ttl>0){
    droneFault.ttl--;
  } else if(Math.random()<0.18){
    var picks=['prop-fl','prop-fr','prop-rl','prop-rr','rf','battery'];
    droneFault.id=picks[Math.floor(Math.random()*picks.length)];
    droneFault.level=Math.random()<0.35?'fail':'warn';
    droneFault.ttl=Math.floor(Math.random()*3)+2;
  } else {
    droneFault.id=null;droneFault.level=null;
  }
  var faultKey=(droneFault.id||'none')+'|'+(droneFault.level||'ok');
  if(faultKey!==lastFaultKey){
    if(droneFault.id){
      logDroneIssue((droneFault.level==='fail'?'Fault: ':'Warn: ')+droneFault.id, droneFault.level);
    } else {
      logDroneIssue('All systems nominal','ok');
    }
    lastFaultKey=faultKey;
  }
  var penalty=droneFault.level==='fail'?18:droneFault.level==='warn'?8:0;
  penalty+=DRONE_STATE.battery<25?10:DRONE_STATE.battery<35?5:0;
  DRONE_STATE.health=clamp(96-penalty,60,98);
}
function clearDroneTicks(){droneIntervals.forEach(clearInterval);droneIntervals=[];stopDroneAutoRotate()}
function startDroneTick(){
  clearDroneTicks();
  var t=setInterval(function(){
    updateDroneState();
    renderDroneView();
  },2200);
  droneIntervals.push(t);
}

// SPLASH
function showSplash(scene){
  return;
}

// LIVE TICK
var tickIntervals=[];
var viewTickCounter=0;
function clearTicks(){tickIntervals.forEach(clearInterval);tickIntervals=[]}
var lastMapScene='flood';
function startTick(scene){
  clearTicks();
  var t1=setInterval(function(){
    var ld=LD[scene];if(!ld)return;
    var drones=ld.drones;
    drones.forEach(function(d){
      var fac=scene==='fire'?1.4:scene==='flood'?0.7:0.35;
      d.t=parseFloat((d.t+(Math.random()-.4)*fac*.15).toFixed(2));
      d.h=parseFloat((d.h+(Math.random()-.4)*(scene==='fire'?-0.06:0.1)).toFixed(2));
      d.p=parseFloat((d.p+(Math.random()-.6)*.006).toFixed(3));
      d.voc=Math.max(5,Math.round(d.voc+(Math.random()-.38)*(scene==='fire'?11:scene==='quake'?3.5:.7)));
      d.gas_r=gasFromVoc(d.voc);
      d.iaq=iaqFromVoc(d.voc);
      d.alt=parseFloat(Math.max(30,Math.min(130,d.alt+(Math.random()-.5)*0.8)).toFixed(1));
      d.spd=parseFloat(Math.max(3,Math.min(14,d.spd+(Math.random()-.5)*.3)).toFixed(1));
      d.batt=parseFloat(Math.max(5,d.batt-.025).toFixed(1));
      d.rssi=rssiFromSig(d.sig);
      d.cpu=Math.round(Math.max(6,Math.min(22,d.cpu+(Math.random()-.5)*2)));
      d.mcu_t=Math.round(Math.max(36,Math.min(52,d.mcu_t+(Math.random()-.5))));
    });
    ld.score=Math.max(20,Math.min(99,ld.score+(Math.random()-.45)*.5));
    renderRisk(scene);
    updateDroneMarkers(scene);
    tickTickets(scene);
    var inf=Math.round(130+Math.random()*35);
    var hi=document.getElementById('h-inf');if(hi)hi.textContent=inf+'ms';
    var gps=Math.random()>.05?'4/4':'3/4';
    var hg=document.getElementById('h-gps');if(hg){hg.textContent=gps;hg.className='hv'+(gps==='3/4'?' w':'');}
    var pkr=(10+Math.random()*5).toFixed(1);
    var hp=document.getElementById('h-pkt');if(hp)hp.textContent=pkr;
    mapFreshSec=Math.min(mapFreshSec+2.5,3599);
    updateMapFresh();
    tickTelemetryFeed(scene);
    viewTickCounter=(viewTickCounter+1)%6;
    if(viewTickCounter%2===0) renderWorkViews(scene);
    if(curScene==='stream'){
      pushFeed(lastMapScene);
      renderCards(lastMapScene);
      renderSVHeader(lastMapScene);
      setPP(lastMapScene);
    }
  },2500);
  tickIntervals.push(t1);
  var t2=setInterval(function(){
    var ts=document.getElementById('sv-ts');
    if(ts)ts.textContent='Last sync: '+new Date().toLocaleTimeString('en-US',{hour12:false});
  },5000);
  tickIntervals.push(t2);
}

// SCENARIO DATA
var S={
  flood:{
    center:[30.01,-99.80],zoom:14,
    wxTitle:'Hyperlocal Weather - Blanco Co., TX',
    replay:'Replay · Public datasets · Flood response',
    sources:[
      {name:'NOAA NWS',detail:'Storm reports + rainfall grids'},
      {name:'USGS',detail:'Gauge + flood stage estimates'},
      {name:'OpenStreetMap',detail:'Road closures + basemap'}
    ],
    hud:[{v:'8',l:'Flood Zones',c:'#3b82f6'},{v:'3',l:'Victims Flagged',c:'#ef4444'},{v:'4',l:'Roads Blocked',c:'#f97316'},{v:'10',l:'Drones Active',c:'#a78bfa'}],
    stats:[{v:'10',l:'Active',c:'#22c55e'},{v:'6',l:'Alerts',c:'#a78bfa'},{v:'3',l:'Missions',c:'#f97316'}],
    fleet:[
      {id:'SNT-001',dot:'active',state:'Scanning',batt:91},{id:'SNT-002',dot:'transit',state:'In Transit',batt:83},
      {id:'SNT-003',dot:'active',state:'Scanning',batt:77},{id:'SNT-004',dot:'delivery',state:'Delivering',batt:68},
      {id:'SNT-005',dot:'active',state:'Scanning',batt:55},{id:'SNT-006',dot:'transit',state:'In Transit',batt:72},
      {id:'SNT-007',dot:'active',state:'Scanning',batt:64},{id:'SNT-008',dot:'delivery',state:'Delivering',batt:61},
      {id:'SNT-009',dot:'active',state:'Scanning',batt:58},{id:'SNT-010',dot:'standby',state:'Standby',batt:96}
    ],
    alerts:[
      {id:'ALF-001',name:'Stranded Individuals (3)',sev:'c',conf:'94.3%',cCls:'hi',desc:'3 people on rooftop near Guadalupe River crossing. Water rising at 0.83 ft/hr.',time:'2m 14s ago',drone:'SNT-001',lat:30.0121,lng:-99.7998},
      {id:'ALF-002',name:'Road Submerged: RR 1340',sev:'c',conf:'98.1%',cCls:'hi',desc:'RR 1340 southbound submerged ~3.5 ft. 4 vehicles stranded. Rising 0.4 ft/min.',time:'5m ago',drone:'SNT-003',lat:29.9960,lng:-99.7820},
      {id:'ALF-003',name:'Elderly Person Flagged',sev:'c',conf:'91.1%',cCls:'hi',desc:'Mobility-limited individual on porch, structure partially submerged.',time:'8m ago',drone:'SNT-002',lat:30.0040,lng:-99.7880},
      {id:'ALF-004',name:'Flash Flood Prediction',sev:'h',conf:'88.4%',cCls:'hi',desc:'Pressure drop 0.18 inHg/hr, gas resistance falling. Town Creek sector: T-20 min.',time:'11m ago',drone:'SNT-005',lat:30.0200,lng:-99.8080},
      {id:'ALF-005',name:'Bridge Debris Buildup',sev:'h',conf:'82.7%',cCls:'md',desc:'Debris accumulating on FM 1340 bridge supports. Load-bearing integrity at risk.',time:'14m ago',drone:'SNT-004',lat:30.0100,lng:-99.8140}
    ],
    wx:[{l:'Temperature',v:'84.2',u:'F',d:'+2.1F/hr',dir:'up'},{l:'Humidity',v:'97.1',u:'%',d:'+4.3%/hr',dir:'up'},{l:'Pressure',v:'29.41',u:'inHg',d:'-0.18/hr',dir:'dn'},{l:'Wind Speed',v:'34',u:'mph',d:'+8 mph/hr',dir:'up'},{l:'Rainfall Rate',v:'3.2',u:'in/hr',d:'+1.1/hr',dir:'up'},{l:'Visibility',v:'0.4',u:'mi',d:'-0.3/hr',dir:'dn'}],
    cmp:[{m:'Temperature',s:'84.2F',a:'82F'},{m:'Humidity',s:'97.14%',a:'89%'},{m:'Pressure',s:'29.41 inHg',a:'29.52 inHg'},{m:'Wind',s:'34 mph NE',a:'22 mph N'},{m:'Rainfall',s:'3.2 in/hr',a:'1.8 in/hr'}],
    tickets:[
      {id:'MSN-041',p:'critical',status:'Active',stage:2,pipeline:['ingest','analyze','review','dispatch'],sla:'12m',slaSec:720,
      t:'Emergency Supply Drop - Rooftop Victims',
      desc:'Three individuals confirmed on rooftop 0.4 mi SE of Guadalupe River. Structure partially submerged. SNT-001 has sustained visual lock. Water rising at 0.83 ft/hr.',
      captured:'09:41:12Z',sensor:'EO+IR',alt:'74m',heading:'142deg',conf:'94%',custody:'9F3A-7C12-4D09',
      sources:['UAV','EO','IR'],
      images:['ticket-yard-01.jpg','ticket-thermal-01.jpg','ticket-yard-02.jpg'],
      actions:[{label:'Dispatch Approved',cls:'ok'},{label:'Re-route',cls:'warn'},{label:'Share to Ground',cls:'info'}],
      approval:{label:'Approved',by:'Ops Lead',time:'09:42:10Z'},
      gps:'30.0121 N, 99.7998 W',drone:'SNT-001',eta:'3m 42s',tags:['Comm Device','First Aid Kit','Water 2L','Emergency Beacon']},
      {id:'MSN-042',p:'critical',status:'En Route',stage:1,pipeline:['ingest','analyze','review','dispatch'],sla:'9m',slaSec:540,
      t:'Medical Drop - Elderly Resident',
      desc:'Mobility-limited individual on porch of partially submerged residence. SNT-002 visual lock active. Porch flooding in ~11 min.',
      captured:'09:39:28Z',sensor:'EO',alt:'68m',heading:'218deg',conf:'91%',custody:'2C4E-5A11-91B7',
      sources:['UAV','EO'],
      images:['ticket-warehouse-01.jpg','ticket-night-01.jpg','ticket-perimeter-01.jpg'],
      actions:[{label:'Confirm Visual',cls:'ok'},{label:'Notify EMS',cls:'info'},{label:'Hold Pattern',cls:'warn'}],
      approval:{label:'Approved',by:'Triage Desk',time:'09:40:02Z'},
      gps:'30.0040 N, 99.7880 W',drone:'SNT-002',eta:'7m 08s',tags:['Med Kit','Emergency Beacon','Thermal Blanket']},
      {id:'MSN-043',p:'high',status:'Pending',stage:0,pipeline:['ingest','analyze','review','dispatch'],sla:'20m',slaSec:1200,
      t:'Recon Pass - Town Creek Flood Risk',
      desc:'Pressure velocity and humidity delta indicate flash flood in Town Creek sector within 20 min. SNT-005 assigned for low-altitude recon sweep.',
      captured:'09:36:44Z',sensor:'EO+LIDAR',alt:'82m',heading:'195deg',conf:'88%',custody:'6D8B-2A41-77F0',
      sources:['UAV','LIDAR','EO'],
      images:['ticket-drone-01.jpg','ticket-yard-01.jpg','ticket-thermal-01.jpg'],
      actions:[{label:'Hold Approval',cls:'warn'},{label:'Assign Backup',cls:'info'},{label:'Share to County',cls:'info'}],
      approval:{label:'Review',by:'Flood Desk',time:'09:37:10Z'},
      gps:'30.0200 N, 99.8080 W',drone:'SNT-005',eta:'11m',tags:['Sensor Buoy','Water Marker']}
    ],
    zones:[{c:[[30.018,-99.812],[30.014,-99.798],[30.004,-99.795],[30.000,-99.810],[30.008,-99.818]],col:'#ef4444',o:.45},{c:[[30.002,-99.792],[29.996,-99.780],[29.988,-99.785],[29.990,-99.798]],col:'#ef4444',o:.42},{c:[[30.013,-99.804],[30.010,-99.797],[30.006,-99.799],[30.008,-99.806]],col:'#ef4444',o:.55},{c:[[30.016,-99.790],[30.012,-99.782],[30.006,-99.786],[30.010,-99.794]],col:'#ef4444',o:.48},{c:[[30.024,-99.802],[30.020,-99.794],[30.015,-99.798],[30.018,-99.806]],col:'#ef4444',o:.46},{c:[[29.999,-99.806],[29.995,-99.798],[29.990,-99.802],[29.993,-99.810]],col:'#ef4444',o:.44},{c:[[30.022,-99.820],[30.018,-99.802],[30.010,-99.806],[30.012,-99.822]],col:'#f97316',o:.38},{c:[[29.994,-99.778],[29.988,-99.764],[29.980,-99.770],[29.984,-99.785]],col:'#f97316',o:.38},{c:[[30.006,-99.808],[30.002,-99.798],[29.996,-99.800],[29.998,-99.810]],col:'#f97316',o:.35},{c:[[30.028,-99.808],[30.024,-99.792],[30.018,-99.796],[30.020,-99.812]],col:'#eab308',o:.32},{c:[[29.980,-99.802],[29.976,-99.790],[29.970,-99.795],[29.974,-99.806]],col:'#eab308',o:.30},{c:[[30.032,-99.796],[30.028,-99.782],[30.022,-99.786],[30.025,-99.800]],col:'#22c55e',o:.28},{c:[[29.975,-99.814],[29.971,-99.800],[29.965,-99.805],[29.968,-99.818]],col:'#22c55e',o:.25}],
    perimeters:[{pts:[[30.028,-99.822],[30.022,-99.790],[29.992,-99.776],[29.974,-99.804],[30.000,-99.828]],col:'#3b82f6'}],
    routes:[{pts:[[30.019,-99.816],[30.013,-99.808],[30.006,-99.802],[30.001,-99.796]],col:'#22c55e',dash:'10,6',w:3},{pts:[[30.010,-99.812],[30.004,-99.806],[29.999,-99.800]],col:'#22c55e',dash:'6,8',w:2.4}],
    blocks:[{pts:[[30.008,-99.814],[30.004,-99.810]],col:'#ef4444',dash:'2,8',w:3}],
    sites:[{lat:30.0170,lng:-99.8065,label:'Staging - Med',col:'#3b82f6'},{lat:30.0062,lng:-99.7945,label:'Shelter - High School',col:'#3b82f6'},{lat:30.0148,lng:-99.8202,label:'Critical - Bridge',col:'#a855f7'}],
    crit:[{lat:30.0121,lng:-99.7998,col:'#ef4444',pop:'<strong style="color:#ef4444">CRITICAL: 3 Stranded</strong><br>Rooftop, Guadalupe River area<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">30.0121N, 99.7998W</span><br>Conf: 94.3% · Water +0.83 ft/hr<br><span style="color:#3d3b52">SNT-001 · 2m 14s ago</span>'},{lat:30.0040,lng:-99.7880,col:'#ef4444',pop:'<strong style="color:#ef4444">CRITICAL: Elderly Person</strong><br>Porch, partially submerged<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">30.0040N, 99.7880W</span><br>Conf: 91.1%<br><span style="color:#3d3b52">SNT-002 · 8m ago</span>'}],
    dots:[{lat:29.9960,lng:-99.7820,col:'#3b82f6',r:8,pop:'<strong style="color:#3b82f6">Road Submerged</strong><br>RR 1340 southbound, ~3.5 ft<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">29.9960N, 99.7820W</span><br><span style="color:#3d3b52">SNT-003 · 5m ago</span>'},{lat:30.0100,lng:-99.8140,col:'#3b82f6',r:7,pop:'<strong style="color:#3b82f6">Bridge Debris</strong><br>FM 1340 bridge<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">30.0100N, 99.8140W</span><br><span style="color:#3d3b52">SNT-004 · 14m ago</span>'},{lat:30.0200,lng:-99.8080,col:'#f97316',r:8,pop:'<strong style="color:#f97316">Flash Flood Warning</strong><br>Town Creek sector - T-20 min<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">30.0200N, 99.8080W</span><br>Conf: 88.4%<br><span style="color:#3d3b52">SNT-005 · 11m ago</span>'}],
    paths:[{from:[30.0135,-99.8020],to:[30.0121,-99.7998],col:'#22c55e'},{from:[30.0055,-99.7860],to:[30.0040,-99.7880],col:'#3b82f6'}]
  },
  quake:{
    center:[31.044,-104.832],zoom:15,
    wxTitle:'Hyperlocal Readings - Culberson Co., TX',
    replay:'Replay · Public datasets · Seismic response',
    sources:[
      {name:'USGS',detail:'Event catalog + ShakeMap'},
      {name:'NOAA',detail:'Aftershock probability feed'},
      {name:'OpenStreetMap',detail:'Critical roads + POIs'}
    ],
    hud:[{v:'9',l:'Damage Zones',c:'#f97316'},{v:'5',l:'Victims Flagged',c:'#ef4444'},{v:'4',l:'Gas Leaks',c:'#a855f7'},{v:'10',l:'Drones Active',c:'#a78bfa'}],
    stats:[{v:'10',l:'Active',c:'#22c55e'},{v:'7',l:'Alerts',c:'#a78bfa'},{v:'2',l:'Missions',c:'#f97316'}],
    fleet:[
      {id:'SNT-011',dot:'active',state:'Scanning',batt:79},{id:'SNT-012',dot:'delivery',state:'Delivering',batt:58},
      {id:'SNT-013',dot:'active',state:'Scanning',batt:85},{id:'SNT-014',dot:'transit',state:'In Transit',batt:66},
      {id:'SNT-015',dot:'active',state:'Scanning',batt:92},{id:'SNT-016',dot:'transit',state:'In Transit',batt:73},
      {id:'SNT-017',dot:'active',state:'Scanning',batt:69},{id:'SNT-018',dot:'delivery',state:'Delivering',batt:62},
      {id:'SNT-019',dot:'active',state:'Scanning',batt:81},{id:'SNT-020',dot:'standby',state:'Standby',batt:97}
    ],
    alerts:[
      {id:'ALQ-001',name:'Trapped Individuals (2)',sev:'c',conf:'92.3%',cCls:'hi',desc:'2 people under partial collapse. Thermal imaging confirms motion in east wing rubble.',time:'3m ago',drone:'SNT-011',lat:31.0450,lng:-104.8340},
      {id:'ALQ-002',name:'Gas Leak: Van Horn Main St',sev:'c',conf:'96.4%',cCls:'hi',desc:'VOC spike 342 ppb, gas resistance 3.2 kOhm. Gas rupture confirmed. Evacuate 200m.',time:'6m ago',drone:'SNT-013',lat:31.0430,lng:-104.8260},
      {id:'ALQ-003',name:'Structure Collapse',sev:'c',conf:'97.1%',cCls:'hi',desc:'Commercial building Broadway Ave fully collapsed. Unknown occupant count.',time:'9m ago',drone:'SNT-015',lat:31.0470,lng:-104.8360},
      {id:'ALQ-004',name:'Road Surface Displacement',sev:'h',conf:'89.2%',cCls:'hi',desc:'Major crack across US-90. Both lanes blocked. Emergency vehicles re-routed.',time:'12m ago',drone:'SNT-014',lat:31.0510,lng:-104.8400},
      {id:'ALQ-005',name:'Person on Damaged Balcony',sev:'h',conf:'86.0%',cCls:'md',desc:'Individual on 2nd-floor balcony, load-bearing shear cracks detected.',time:'15m ago',drone:'SNT-011',lat:31.0480,lng:-104.8320}
    ],
    wx:[{l:'Temperature',v:'72.4',u:'F',d:'Stable',dir:'fl'},{l:'Humidity',v:'44.8',u:'%',d:'+1.2%/hr',dir:'fl'},{l:'Pressure',v:'29.88',u:'inHg',d:'-0.05/hr',dir:'fl'},{l:'Wind Speed',v:'8',u:'mph',d:'Calm',dir:'fl'},{l:'PM2.5 AQI',v:'187',u:'AQI',d:'+64/hr',dir:'up'},{l:'Aftershock Risk',v:'HIGH',u:'',d:'M4.2+ likely',dir:'up'}],
    cmp:[{m:'Temperature',s:'72.41F',a:'73F'},{m:'Humidity',s:'44.83%',a:'42%'},{m:'Pressure',s:'29.88 inHg',a:'29.92 inHg'},{m:'PM2.5',s:'187 AQI',a:'120 AQI'},{m:'VOC Index',s:'342 ppb',a:'N/A'}],
    tickets:[
      {id:'MSN-078',p:'critical',status:'En Route',stage:1,pipeline:['ingest','analyze','review','dispatch'],sla:'8m',slaSec:480,
      t:'Rescue Supply Drop - Collapsed Structure',
      desc:'Two individuals trapped under partial collapse. Thermal confirms motion, east wing. Aerial delivery only - aftershock risk HIGH, structure unstable.',
      captured:'11:05:12Z',sensor:'IR+EO',alt:'58m',heading:'078deg',conf:'92%',custody:'8B19-4C03-55A2',
      sources:['UAV','IR','EO'],
      images:['ticket-thermal-01.jpg','ticket-yard-02.jpg','ticket-night-01.jpg'],
      actions:[{label:'Dispatch Approved',cls:'ok'},{label:'Aftershock Alert',cls:'warn'},{label:'Share to USAR',cls:'info'}],
      approval:{label:'Approved',by:'Incident Cmd',time:'11:05:44Z'},
      gps:'31.0450 N, 104.8340 W',drone:'SNT-011',eta:'3m 12s',tags:['Comm Device','Emergency Beacon','First Aid Kit','Glow Marker']},
      {id:'MSN-079',p:'high',status:'Pending',stage:0,pipeline:['ingest','analyze','review','dispatch'],sla:'16m',slaSec:960,
      t:'Supply Drop - Balcony Resident',
      desc:'Individual on 2nd-floor balcony, shear cracks in load-bearing walls. Stairwell not viable. Emergency beacon enables GPS tracking for ground rescue.',
      captured:'11:07:03Z',sensor:'EO',alt:'44m',heading:'245deg',conf:'86%',custody:'1F92-6B81-0C77',
      sources:['UAV','EO'],
      images:['ticket-warehouse-01.jpg','ticket-urban-01.jpg','ticket-perimeter-01.jpg'],
      actions:[{label:'Verify Stability',cls:'warn'},{label:'Notify EMS',cls:'info'},{label:'Queue Dispatch',cls:'info'}],
      approval:{label:'Review',by:'Safety Desk',time:'11:07:40Z'},
      gps:'31.0480 N, 104.8320 W',drone:'SNT-012',eta:'6m',tags:['Emergency Beacon','Water 1L','Thermal Blanket']}
    ],
    zones:[{c:[[31.048,-104.838],[31.046,-104.830],[31.042,-104.831],[31.043,-104.839]],col:'#ef4444',o:.48},{c:[[31.045,-104.828],[31.043,-104.822],[31.040,-104.824],[31.041,-104.830]],col:'#ef4444',o:.45},{c:[[31.0455,-104.8345],[31.044,-104.8305],[31.0415,-104.8315],[31.0425,-104.835]],col:'#ef4444',o:.55},{c:[[31.049,-104.832],[31.046,-104.824],[31.043,-104.826],[31.045,-104.834]],col:'#ef4444',o:.50},{c:[[31.038,-104.834],[31.036,-104.826],[31.033,-104.829],[31.035,-104.836]],col:'#ef4444',o:.46},{c:[[31.052,-104.840],[31.050,-104.832],[31.047,-104.834],[31.049,-104.842]],col:'#ef4444',o:.48},{c:[[31.050,-104.842],[31.048,-104.834],[31.044,-104.836],[31.046,-104.844]],col:'#a855f7',o:.38},{c:[[31.041,-104.836],[31.038,-104.828],[31.035,-104.831],[31.037,-104.838]],col:'#f97316',o:.40},{c:[[31.0445,-104.8285],[31.0425,-104.8245],[31.040,-104.8255],[31.0415,-104.8295]],col:'#f97316',o:.35},{c:[[31.052,-104.836],[31.050,-104.828],[31.047,-104.830],[31.049,-104.838]],col:'#eab308',o:.32},{c:[[31.0395,-104.832],[31.037,-104.826],[31.035,-104.828],[31.037,-104.834]],col:'#eab308',o:.30},{c:[[31.054,-104.830],[31.052,-104.824],[31.049,-104.826],[31.051,-104.832]],col:'#22c55e',o:.28},{c:[[31.056,-104.836],[31.053,-104.830],[31.051,-104.832],[31.053,-104.838]],col:'#22c55e',o:.25}],
    perimeters:[{pts:[[31.053,-104.846],[31.050,-104.820],[31.040,-104.818],[31.036,-104.842]],col:'#f97316'}],
    routes:[{pts:[[31.048,-104.842],[31.044,-104.834],[31.041,-104.830]],col:'#22c55e',dash:'10,6',w:3},{pts:[[31.046,-104.826],[31.050,-104.830],[31.053,-104.836]],col:'#22c55e',dash:'6,8',w:2.4}],
    blocks:[{pts:[[31.049,-104.840],[31.051,-104.842]],col:'#ef4444',dash:'2,8',w:3}],
    sites:[{lat:31.0472,lng:-104.8390,label:'Staging - USAR',col:'#3b82f6'},{lat:31.0410,lng:-104.8250,label:'Field Hospital',col:'#3b82f6'},{lat:31.0438,lng:-104.8275,label:'Critical - Gas Valve',col:'#a855f7'}],
    crit:[{lat:31.0450,lng:-104.8340,col:'#ef4444',pop:'<strong style="color:#ef4444">CRITICAL: 2 Trapped</strong><br>Collapsed structure, thermal confirmed<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">31.0450N, 104.8340W</span><br>Conf: 92.3%<br><span style="color:#3d3b52">SNT-011 · 3m ago</span>'},{lat:31.0430,lng:-104.8260,col:'#a855f7',pop:'<strong style="color:#a855f7">Gas Leak Confirmed</strong><br>VOC 342 ppb - GAS:3.2 kOhm - evacuate 200m<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">31.0430N, 104.8260W</span><br>IAQ: 280<br><span style="color:#3d3b52">SNT-013 · 6m ago</span>'},{lat:31.0470,lng:-104.8360,col:'#f97316',pop:'<strong style="color:#f97316">Structure Collapse</strong><br>Commercial, Broadway Ave<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">31.0470N, 104.8360W</span><br>Conf: 97.1%<br><span style="color:#3d3b52">SNT-015 · 9m ago</span>'}],
    dots:[{lat:31.0510,lng:-104.8400,col:'#eab308',r:7,pop:'<strong style="color:#eab308">Road Cracked</strong><br>US-90 surface displacement<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">31.0510N, 104.8400W</span><br><span style="color:#3d3b52">SNT-014 · 12m ago</span>'},{lat:31.0480,lng:-104.8320,col:'#f97316',r:7,pop:'<strong style="color:#f97316">Stranded Person</strong><br>2nd floor balcony, unstable<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">31.0480N, 104.8320W</span><br>Conf: 86.0%<br><span style="color:#3d3b52">SNT-011 · 15m ago</span>'}],
    paths:[{from:[31.0460,-104.8350],to:[31.0450,-104.8340],col:'#22c55e'},{from:[31.0440,-104.8280],to:[31.0480,-104.8320],col:'#3b82f6'}]
  },
  fire:{
    center:[32.40,-98.82],zoom:13,
    wxTitle:'Hyperlocal Weather - Eastland Co., TX',
    replay:'Replay · Public datasets · Wildfire response',
    sources:[
      {name:'NOAA',detail:'Fire weather + wind models'},
      {name:'AirNow',detail:'PM2.5 + AQI overlays'},
      {name:'USFS',detail:'Perimeter + incident notes'}
    ],
    hud:[{v:'7',l:'Fire Zones',c:'#ef4444'},{v:'4',l:'Victims Flagged',c:'#ef4444'},{v:'6',l:'Smoke Zones',c:'#f97316'},{v:'10',l:'Drones Active',c:'#a78bfa'}],
    stats:[{v:'10',l:'Active',c:'#22c55e'},{v:'6',l:'Alerts',c:'#a78bfa'},{v:'2',l:'Missions',c:'#f97316'}],
    fleet:[
      {id:'SNT-021',dot:'active',state:'Scanning',batt:74},{id:'SNT-022',dot:'delivery',state:'Delivering',batt:51},
      {id:'SNT-023',dot:'active',state:'Scanning',batt:88},{id:'SNT-024',dot:'transit',state:'In Transit',batt:62},
      {id:'SNT-025',dot:'active',state:'Scanning',batt:80},{id:'SNT-026',dot:'transit',state:'In Transit',batt:68},
      {id:'SNT-027',dot:'active',state:'Scanning',batt:75},{id:'SNT-028',dot:'delivery',state:'Delivering',batt:59},
      {id:'SNT-029',dot:'active',state:'Scanning',batt:83},{id:'SNT-030',dot:'standby',state:'Standby',batt:98}
    ],
    alerts:[
      {id:'ALW-001',name:'Family Stranded (4)',sev:'c',conf:'93.2%',cCls:'hi',desc:'Family of 4 surrounded by advancing fire. Road CR-435 fully blocked. T-18 min to structure.',time:'1m ago',drone:'SNT-021',lat:32.4060,lng:-98.8280},
      {id:'ALW-002',name:'VOC / PM2.5 Critical',sev:'c',conf:'99.0%',cCls:'hi',desc:'IAQ 412, gas resistance 0.84 kOhm, VOC 890 ppb. Hazardous. Thermal required.',time:'4m ago',drone:'SNT-023',lat:32.4180,lng:-98.8420},
      {id:'ALW-003',name:'Fire Line Advancing NE',sev:'c',conf:'95.4%',cCls:'hi',desc:'Fire front at 1.2 mi/hr NE. 3 properties in path. Gusts 67 mph.',time:'7m ago',drone:'SNT-025',lat:32.4120,lng:-98.8200},
      {id:'ALW-004',name:'Stranded Rancher',sev:'h',conf:'87.3%',cCls:'md',desc:'Individual on ridgeline, fire blocking all descent routes. Waving confirmed.',time:'10m ago',drone:'SNT-021',lat:32.3960,lng:-98.7980},
      {id:'ALW-005',name:'Power Line Down',sev:'h',conf:'91.1%',cCls:'hi',desc:'Downed line sparking on FM 570. Secondary ignition risk.',time:'13m ago',drone:'SNT-024',lat:32.3920,lng:-98.7900}
    ],
    wx:[{l:'Temperature',v:'104.3',u:'F',d:'+3.8F/hr',dir:'up'},{l:'Humidity',v:'11.2',u:'%',d:'-4.1%/hr',dir:'dn'},{l:'Wind Speed',v:'48',u:'mph',d:'+12 mph/hr',dir:'up'},{l:'Wind Gusts',v:'67',u:'mph',d:'Sustained',dir:'up'},{l:'PM2.5 AQI',v:'412',u:'AQI',d:'Hazardous',dir:'up'},{l:'Visibility',v:'0.2',u:'mi',d:'-0.5/hr',dir:'dn'}],
    cmp:[{m:'Temperature',s:'104.3F',a:'96F'},{m:'Humidity',s:'11.24%',a:'18%'},{m:'Wind',s:'48 mph NE',a:'31 mph N'},{m:'PM2.5',s:'412 AQI',a:'245 AQI'},{m:'VOC / Gas Resist.',s:'890 ppb / 0.84kOhm',a:'N/A'}],
    tickets:[
      {id:'MSN-103',p:'critical',status:'Dispatched',stage:2,pipeline:['ingest','analyze','review','dispatch'],sla:'6m',slaSec:360,
      t:'Emergency Drop - Stranded Family of 4',
      desc:'Family of 4 confirmed at rural property, fire on three sides, road CR-435 blocked. IAQ 412. T-18 min before fire encroachment at current 1.2 mi/hr spread.',
      captured:'14:13:22Z',sensor:'EO+IR',alt:'96m',heading:'063deg',conf:'93%',custody:'4A77-9C02-2D10',
      sources:['UAV','EO','IR'],
      images:['ticket-fire-01.jpg','ticket-thermal-01.jpg','ticket-perimeter-01.jpg'],
      actions:[{label:'Dispatch Approved',cls:'ok'},{label:'Airspace Hold',cls:'warn'},{label:'Share to Fireline',cls:'info'}],
      approval:{label:'Approved',by:'Ops Lead',time:'14:13:48Z'},
      gps:'32.4060 N, 98.8280 W',drone:'SNT-021',eta:'1m 58s',tags:['N95 Masks x4','Water 4L','Comm Device','Emergency Beacon']},
      {id:'MSN-104',p:'high',status:'En Route',stage:1,pipeline:['ingest','analyze','review','dispatch'],sla:'14m',slaSec:840,
      t:'Supply Drop - Ridgeline Rancher',
      desc:'Individual on ridgeline, all descent routes blocked by fire. Visual lock maintained by SNT-021. Emergency beacon enables ground team GPS lock.',
      captured:'14:16:31Z',sensor:'EO',alt:'74m',heading:'182deg',conf:'87%',custody:'7C19-4B88-11EA',
      sources:['UAV','EO'],
      images:['ticket-ridge-01.jpg','ticket-night-01.jpg','ticket-drone-01.jpg'],
      actions:[{label:'Confirm Visual',cls:'ok'},{label:'Notify Sheriff',cls:'info'},{label:'Hold Drop',cls:'warn'}],
      approval:{label:'Approved',by:'Fire Desk',time:'14:17:04Z'},
      gps:'32.3960 N, 98.7980 W',drone:'SNT-022',eta:'8m 22s',tags:['Emergency Beacon','Water 2L','Thermal Blanket','Signal Mirror']}
    ],
    zones:[{c:[[32.415,-98.840],[32.410,-98.820],[32.398,-98.825],[32.400,-98.845]],col:'#ef4444',o:.52},{c:[[32.408,-98.815],[32.402,-98.795],[32.392,-98.802],[32.396,-98.820]],col:'#ef4444',o:.48},{c:[[32.406,-98.832],[32.402,-98.818],[32.396,-98.822],[32.400,-98.836]],col:'#ef4444',o:.58},{c:[[32.414,-98.824],[32.410,-98.816],[32.404,-98.820],[32.408,-98.830]],col:'#ef4444',o:.50},{c:[[32.390,-98.808],[32.386,-98.796],[32.380,-98.802],[32.384,-98.812]],col:'#ef4444',o:.46},{c:[[32.422,-98.846],[32.418,-98.836],[32.412,-98.840],[32.416,-98.850]],col:'#ef4444',o:.48},{c:[[32.422,-98.855],[32.416,-98.835],[32.408,-98.840],[32.412,-98.858]],col:'#f97316',o:.42},{c:[[32.396,-98.798],[32.390,-98.780],[32.382,-98.788],[32.386,-98.804]],col:'#f97316',o:.40},{c:[[32.412,-98.824],[32.406,-98.808],[32.400,-98.812],[32.404,-98.828]],col:'#f97316',o:.38},{c:[[32.428,-98.840],[32.424,-98.822],[32.416,-98.828],[32.420,-98.845]],col:'#eab308',o:.34},{c:[[32.382,-98.810],[32.378,-98.796],[32.372,-98.802],[32.376,-98.815]],col:'#eab308',o:.32},{c:[[32.435,-98.830],[32.430,-98.814],[32.424,-98.820],[32.428,-98.836]],col:'#22c55e',o:.28},{c:[[32.370,-98.820],[32.366,-98.806],[32.360,-98.812],[32.364,-98.825]],col:'#22c55e',o:.25}],
    perimeters:[{pts:[[32.430,-98.860],[32.420,-98.828],[32.396,-98.804],[32.372,-98.820],[32.386,-98.854]],col:'#ef4444'}],
    routes:[{pts:[[32.412,-98.850],[32.406,-98.838],[32.398,-98.828],[32.392,-98.818]],col:'#22c55e',dash:'10,6',w:3},{pts:[[32.404,-98.810],[32.396,-98.804],[32.390,-98.798]],col:'#22c55e',dash:'6,8',w:2.4}],
    blocks:[{pts:[[32.402,-98.818],[32.398,-98.814]],col:'#ef4444',dash:'2,8',w:3}],
    sites:[{lat:32.4205,lng:-98.8440,label:'Helibase',col:'#3b82f6'},{lat:32.3965,lng:-98.8065,label:'Water Point',col:'#3b82f6'},{lat:32.4128,lng:-98.8340,label:'Critical - Power Line',col:'#a855f7'}],
    crit:[{lat:32.4060,lng:-98.8280,col:'#ef4444',pop:'<strong style="color:#ef4444">CRITICAL: Family of 4</strong><br>Surrounded by fire, road cut<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">32.4060N, 98.8280W</span><br>IAQ: 412 · T-18 min to structure<br><span style="color:#3d3b52">SNT-021 · 1m ago</span>'},{lat:32.4120,lng:-98.8200,col:'#ef4444',pop:'<strong style="color:#ef4444">Fire Line Advancing NE</strong><br>1.2 mi/hr · 3 properties in path<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">32.4120N, 98.8200W</span><br>Conf: 95.4%<br><span style="color:#3d3b52">SNT-025 · 7m ago</span>'},{lat:32.3960,lng:-98.7980,col:'#ef4444',pop:'<strong style="color:#ef4444">Stranded Rancher</strong><br>Ridgeline, all descent routes blocked<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">32.3960N, 98.7980W</span><br>Conf: 87.3%<br><span style="color:#3d3b52">SNT-021 · 10m ago</span>'}],
    dots:[{lat:32.4180,lng:-98.8420,col:'#f97316',r:8,pop:'<strong style="color:#f97316">Heavy Smoke Zone</strong><br>IAQ 412 - VOC 890 ppb<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">32.4180N, 98.8420W</span><br>Gas Resist: 0.84 kOhm<br><span style="color:#3d3b52">SNT-023 · 4m ago</span>'},{lat:32.3920,lng:-98.7900,col:'#eab308',r:7,pop:'<strong style="color:#eab308">Downed Power Line</strong><br>FM 570, sparking<br><span style="color:#5c5a6e;font-family:JetBrains Mono,monospace;font-size:9.5px">32.3920N, 98.7900W</span><br><span style="color:#3d3b52">SNT-024 · 13m ago</span>'}],
    paths:[{from:[32.4080,-98.8300],to:[32.4060,-98.8280],col:'#22c55e'},{from:[32.4020,-98.8150],to:[32.3960,-98.7980],col:'#3b82f6'}]
  }
};

// LOAD SCENE
var curScene='flood';
function loadScene(name){
  curScene=name;
  var s=S[name];if(!s)return;
  lastMapScene=name;
  clearLayers();
  map.flyTo(s.center,s.zoom,{duration:1.1,easeLinearity:.4});
  setTimeout(function(){
    addCoverArea(s.center,getCoverScale(name));
    s.zones.forEach(function(z){addZone(z.c,z.col,z.o)});
    if(s.perimeters) s.perimeters.forEach(function(p){addPerimeter(p.pts,p.col)});
    if(s.routes) s.routes.forEach(function(r){addRoute(r.pts,r.col,r.dash,r.w)});
    if(s.blocks) s.blocks.forEach(function(b){addRoute(b.pts,b.col,b.dash||'2,8',b.w||3)});
    LD[name].drones.forEach(function(d){addCoverage(d.lat,d.lng)});
    if(s.paths) s.paths.forEach(function(p){addPath(p.from,p.to,p.col)});
    if(s.crit) s.crit.forEach(function(d){addCritDot(d.lat,d.lng,d.col,d.pop)});
    s.dots.forEach(function(d){addDot(d.lat,d.lng,d.col,d.r,d.pop)});
    LD[name].drones.forEach(function(d){addDrone(d)});
  },500);
  document.getElementById('wx-t').textContent=s.wxTitle;
  renderStats(s.stats);
  renderFleet(s.fleet);
  renderAlerts(s.alerts);
  renderHud(s.hud);
  initWeather(name);
  renderWx(s.wx);
  startWeatherTick(name);
  renderCmp(s.cmp);
  renderSources(s);
  var mr=document.getElementById('map-replay');if(mr)mr.textContent=s.replay||'Replay · Public datasets';
  mapFreshSec=0;updateMapFresh();
  renderTickets(s.tickets);
  renderRisk(name);
  renderTimeline(name);
  renderWorkViews(name);
  seedTelemetryFeed(name);
  startTick(name);
}

// TABS
var layout=document.getElementById('layout');
var sv=document.getElementById('sv');
var dv=document.getElementById('dv');
var navState='operations';
var navCollapsed=false;
function bindNavToggle(){
  var btn=document.getElementById('nav-toggle');
  if(!btn) return;
  btn.addEventListener('click',function(){
    navCollapsed=!navCollapsed;
    document.body.classList.toggle('nav-collapsed',navCollapsed);
    setTimeout(function(){map.invalidateSize();},140);
  });
}
var viewEls={
  fleet:document.getElementById('view-fleet'),
  telemetry:document.getElementById('view-telemetry'),
  maintenance:document.getElementById('view-maintenance'),
  sources:document.getElementById('view-sources'),
  settings:document.getElementById('view-settings')
};
function setToolActive(sc){
  document.querySelectorAll('.tool-item').forEach(function(item){
    item.classList.toggle('on',item.dataset.s===sc);
  });
}
function setActiveScenarioTab(name){
  document.querySelectorAll('.tab').forEach(function(b){
    b.classList.toggle('on',b.dataset.s===name);
  });
}
function setNavView(view,opts){
  opts=opts||{};
  if(view!=='operations' && !viewEls[view]) view='operations';
  navState=view;
  document.querySelectorAll('.nav-item').forEach(function(item){
    item.classList.toggle('on',item.dataset.view===view);
  });
  Object.keys(viewEls).forEach(function(k){
    var el=viewEls[k];
    if(!el) return;
    var on=(k===view);
    el.classList.toggle('on',on);
    el.style.display=on?'block':'none';
  });
  if(view==='operations'){
    layout.style.display='grid';
    sv.classList.remove('on');
    if(dv) dv.classList.remove('on');
    clearDroneTicks();
    setToolActive(null);
    if(!opts.preserveScene){
      setActiveScenarioTab(lastMapScene);
      loadScene(lastMapScene);
    } else {
      renderWorkViews(lastMapScene);
    }
    setTimeout(function(){map.invalidateSize();},140);
    renderTickets((S[lastMapScene]&&S[lastMapScene].tickets)?S[lastMapScene].tickets:[]);
    bindTicketModal();
  } else {
    layout.style.display='none';
    sv.classList.remove('on');
    if(dv) dv.classList.remove('on');
    clearDroneTicks();
    setActiveScenarioTab(lastMapScene);
    renderWorkViews(lastMapScene);
  }
}
document.querySelectorAll('.nav-item').forEach(function(item){
  item.addEventListener('click',function(){
    var view=item.dataset.view||'operations';
    setNavView(view);
  });
});
function switchScenario(sc){
  setNavView('operations',{preserveScene:true});
  if(sc==='stream'){
    setActiveScenarioTab(lastMapScene);
    setToolActive('stream');
    clearDroneTicks();
    layout.style.display='none';
    sv.classList.add('on');
    if(dv) dv.classList.remove('on');
    curScene='stream';
    initFeed(lastMapScene);
    renderCards(lastMapScene);
    renderSVHeader(lastMapScene);
    setPP(lastMapScene);
    renderTimeline(lastMapScene);
    var rf=document.getElementById('rf-body');
    if(rf) rf.innerHTML=feedLines.slice().reverse().join('');
    return;
  }
  if(sc==='drone'){
    setActiveScenarioTab(lastMapScene);
    setToolActive('drone');
    layout.style.display='none';
    sv.classList.remove('on');
    if(dv) dv.classList.add('on');
    curScene='drone';
    initDrone3d();
    refreshDroneRoster(lastMapScene);
    bindDroneSwitcher();
    bindDroneHotspots();
    bindDroneTilt();
    bindDroneModes();
    setDroneMode('inspect');
    startDroneAutoRotate();
    startDroneTick();
    return;
  }
  setToolActive(null);
  setActiveScenarioTab(sc);
  clearDroneTicks();
  sv.classList.remove('on');
  if(dv) dv.classList.remove('on');
  layout.style.display='grid';
  loadScene(sc);
  setTimeout(function(){map.invalidateSize();},140);
}
document.querySelectorAll('.tab').forEach(function(btn){
  btn.addEventListener('click',function(){
    switchScenario(btn.dataset.s);
  });
});
document.querySelectorAll('.tool-item').forEach(function(item){
  item.addEventListener('click',function(){
    switchScenario(item.dataset.s);
  });
});

// INIT
initFeed('flood');
loadScene('flood');
bindTicketModal();
bindAlertClicks();
bindNavToggle();
setNavView('operations',{preserveScene:true});
var exportBtn=document.getElementById('wx-export');
if(exportBtn){
  exportBtn.addEventListener('click',function(){buildDataset(lastMapScene);});
}
var dataExportBtn=document.getElementById('data-export');
if(dataExportBtn){
  dataExportBtn.addEventListener('click',function(){buildDataset(lastMapScene);});
}
