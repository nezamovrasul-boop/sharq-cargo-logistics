/* SHARQ: inquiry-led B2B forwarding. No automatic rates or live tracking. */
const origins=[
 {id:'khorgos',coordinates:[80.4144,44.1256],ru:'Хоргос',uz:'Xorgos',aliases:['Khorgos','Horgos','Харгос']},
 {id:'guangzhou',coordinates:[113.2644,23.1291],ru:'Гуанчжоу',uz:'Guanchjou',aliases:['Guangzhou']},
 {id:'yiwu',coordinates:[120.07,29.3],ru:'Иу',uz:'Iu',aliases:['Yiwu']},
 {id:'beijing',coordinates:[116.4074,39.9042],ru:'Пекин',uz:'Pekin',aliases:['Beijing']},
 {id:'shenzhen',coordinates:[114.0579,22.5431],ru:'Шэньчжэнь',uz:'Shenchjen',aliases:['Shenzhen','Шенжень','Шэньчжень']}
];
const destinations=[
 {id:'tashkent',coordinates:[69.2401,41.2995],ru:'Ташкент',uz:'Toshkent',aliases:['Tashkent']},
 {id:'samarkand',coordinates:[66.9597,39.6542],ru:'Самарканд',uz:'Samarqand',aliases:['Samarkand']},
 {id:'bukhara',coordinates:[64.4286,39.7747],ru:'Бухара',uz:'Buxoro',aliases:['Bukhara']},
 {id:'andijan',coordinates:[72.3442,40.7821],ru:'Андижан',uz:'Andijon',aliases:['Andijan']},
 {id:'namangan',coordinates:[71.6726,40.9983],ru:'Наманган',uz:'Namangan',aliases:[]},
 {id:'fergana',coordinates:[71.7864,40.3864],ru:'Фергана',uz:'Farg‘ona',aliases:['Fergana','Fargona']},
 {id:'navoi',coordinates:[65.3792,40.1039],ru:'Навои',uz:'Navoiy',aliases:['Navoi']},
 {id:'nukus',coordinates:[59.6103,42.4602],ru:'Нукус',uz:'Nukus',aliases:[]}
];
const rateForm=document.querySelector('#rate-form');
const field=name=>rateForm.elements.namedItem(name);
const value=name=>field(name).value.trim();
let language='ru', selectedOrigin=null, selectedDestination=null;
let freightMap=null,mapLoaded=false,animation=0,routeGeometry=null;
const mapMarkers=[];
let destinationMarker=null;
const suggesters=[];
const emptyCollection=()=>({type:'FeatureCollection',features:[]});
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function refreshConditionalFields(){
 for(const [id,name,active] of [['pack-details','packDetails',value('packaging')==='other'],['hazard-details','hazardDetails',value('hazard')==='hazardYes']]){
  document.getElementById(id).hidden=!active;field(name).disabled=!active;field(name).setCustomValidity('');field(name).removeAttribute('aria-invalid');
 }
 const air=value('transport')==='air';document.querySelector('#shipment-field').hidden=air;field('shipment').disabled=air;
}
function matchCity(query,records){const key=query.toLocaleLowerCase().trim();return records.find(city=>[city.ru,city.uz,city.id,...city.aliases].some(x=>x.toLocaleLowerCase()===key))||null;}
function refreshMapUI(){
 const t=siteCopy[language];
 for(const [id,records,selected] of [['map-origin',origins,selectedOrigin],['map-destination',destinations,selectedDestination]]){
  const select=document.getElementById(id);select.replaceChildren(new Option(t.chooseCity,''),...records.map(city=>new Option(city[language],city.id)));select.value=selected?.id||'';
 }
 for(const {element,city} of mapMarkers){element.querySelector('span').textContent=city[language];element.setAttribute('aria-label',city[language]);element.setAttribute('aria-pressed',String(city===selectedOrigin));element.classList.toggle('is-muted',!!selectedOrigin&&selectedOrigin!==city);}
 document.querySelector('#map-status').textContent=selectedOrigin&&selectedDestination?`${selectedOrigin[language]} → ${selectedDestination[language]} · ${t.mapReady}`:'';
 if(destinationMarker)destinationMarker.getElement().textContent=selectedDestination?.[language]||(language==='ru'?'Узбекистан':'O‘zbekiston');
 for(const [selector,key] of [['.maplibregl-ctrl-zoom-in','zoomIn'],['.maplibregl-ctrl-zoom-out','zoomOut'],['.maplibregl-ctrl-attrib-button','sources']]){const el=document.querySelector(selector);if(el){el.setAttribute('aria-label',t[key]);el.setAttribute('title',t[key]);}}
}
function fitMap(animate=false){
 if(!mapLoaded)return;
 const b=routeGeometry&&window.RouteGeometry?RouteGeometry.bbox(routeGeometry):[57,17,126,53];
 freightMap.fitBounds([[b[0],b[1]],[b[2],b[3]]],{padding:{top:40,bottom:55,left:38,right:55},maxZoom:3.5,duration:animate&&!reduced()?600:0});
}
function drawRoute(animate=true){
 cancelAnimationFrame(animation);refreshMapUI();
 if(!mapLoaded)return;
 routeGeometry=selectedOrigin&&selectedDestination&&window.RouteGeometry?RouteGeometry.greatCircle(selectedOrigin.coordinates,selectedDestination.coordinates,{npoints:75}):null;
 freightMap.getSource('endpoints').setData({type:'FeatureCollection',features:[selectedOrigin?.coordinates,selectedDestination?.coordinates].filter(Boolean).map(coordinates=>({type:'Feature',properties:{},geometry:{type:'Point',coordinates}}))});
 destinationMarker?.remove();
 const marker=document.createElement('div');marker.className='destination-marker';marker.textContent=selectedDestination?.[language]||(language==='ru'?'Узбекистан':'O‘zbekiston');
 destinationMarker=new maplibregl.Marker({element:marker,anchor:'bottom',offset:[0,-12]}).setLngLat(selectedDestination?.coordinates||[64.5,41.4]).addTo(freightMap);
 if(!routeGeometry){freightMap.getSource('route').setData(emptyCollection());return;}
 fitMap(animate);
 const fullRoute=routeGeometry;
 if(!animate||reduced()){freightMap.getSource('route').setData(fullRoute);return;}
 const started=performance.now(),coordinates=fullRoute.geometry.coordinates;
 const step=now=>{const fraction=Math.min(1,(now-started)/800);const count=Math.max(2,Math.ceil(coordinates.length*fraction));freightMap.getSource('route').setData({...fullRoute,geometry:{type:'LineString',coordinates:coordinates.slice(0,count)}});if(fraction<1)animation=requestAnimationFrame(step);};
 animation=requestAnimationFrame(step);
}
function selectRouteCity(name,city){
 if(name==='origin')selectedOrigin=city;else selectedDestination=city;
 field(name).value=city?.[language]||'';field(name).setCustomValidity('');field(name).removeAttribute('aria-invalid');drawRoute();
 if(!document.querySelector('#request-review').hidden)renderReview();
}
function initMap(){
 if(!window.maplibregl)return;
 try{
  freightMap=new maplibregl.Map({container:'route-map',style:{version:8,sources:{countries:{type:'geojson',data:'assets/countries.geojson',attribution:'<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a>'},route:{type:'geojson',data:emptyCollection()},endpoints:{type:'geojson',data:emptyCollection()}},layers:[{id:'background',type:'background',paint:{'background-color':'#bddfea'}},{id:'land',type:'fill',source:'countries',paint:{'fill-color':'#d7eef6'}},{id:'focus',type:'fill',source:'countries',filter:['in',['get','iso'],['literal',['CHN','UZB']]],paint:{'fill-color':'#8c9145'}},{id:'borders',type:'line',source:'countries',paint:{'line-color':'#eff7fa','line-width':.7}},{id:'route',type:'line',source:'route',paint:{'line-color':'#2e360d','line-width':2,'line-dasharray':[2,2]}},{id:'endpoints',type:'circle',source:'endpoints',paint:{'circle-color':'#2e360d','circle-radius':5,'circle-stroke-width':3,'circle-stroke-color':'#eff7fa'}}]},center:[91,34],zoom:2,minZoom:1,maxZoom:6,renderWorldCopies:false,scrollZoom:false,dragRotate:false,pitchWithRotate:false,touchPitch:false,cooperativeGestures:true,attributionControl:{compact:true}});
  freightMap.touchZoomRotate.disableRotation();freightMap.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
  freightMap.on('load',()=>{
   mapLoaded=true;document.querySelector('#map-fallback').hidden=true;
   for(const city of origins){const element=document.createElement('button');element.type='button';element.className='city-marker';element.dataset.city=city.id;element.append(document.createElement('span'));element.addEventListener('click',()=>selectRouteCity('origin',city));mapMarkers.push({element,city});new maplibregl.Marker({element}).setLngLat(city.coordinates).addTo(freightMap);}
   drawRoute(false);fitMap(false);
  });
  freightMap.on('error',()=>{if(!mapLoaded)document.querySelector('#map-fallback').hidden=false;});
  new ResizeObserver(()=>{if(mapLoaded){freightMap.resize();fitMap(false);}}).observe(document.querySelector('.map-shell'));
 }catch{document.querySelector('#map-fallback').hidden=false;}
}
function inquiryRows(){
 const t=siteCopy[language],unknown=t.notSpecified;
 const rows=[[t.name,value('name')],[t.company,value('company')],[t.contact,value('contact')],[t.goods,value('goods')],[t.dimensions,['length','width','height'].map(name=>value(name)||'—').join(' × ')],[t.volume,value('volume')||unknown],[t.weight,value('weight')||unknown],[t.packaging,value('packaging')==='other'?(value('packDetails')||t.other):t[value('packaging')]],[t.origin,value('origin')],[t.destination,value('destination')],[t.transport,t[value('transport')]]];
 if(value('transport')!=='air')rows.push([t.shipment,t[value('shipment')]]);
 rows.push([t.hazard,t[value('hazard')]]);
 if(value('hazard')==='hazardYes')rows.push([t.hazardDetails,value('hazardDetails')||unknown]);
 return rows;
}
function renderReview(){
 const summary=document.querySelector('#request-summary');summary.replaceChildren();
 const rows=inquiryRows();
 for(const [label,content] of rows){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=content;row.append(dt,dd);summary.append(row);}
 document.querySelector('#send-request').href='https://wa.me/998900106669?text='+encodeURIComponent(siteCopy[language].greeting+'\n\n'+rows.map(([label,content])=>label+': '+content).join('\n'));
}
function validateInquiry(){
 const t=siteCopy[language];let first=null;
 for(const input of rateForm.querySelectorAll('input,select,textarea')){
  if(input.disabled)continue;
  input.setCustomValidity('');
  if(input.required&&!input.value.trim())input.setCustomValidity(t.requiredError);
  if(input.name==='contact'&&input.value.trim()){
   const text=input.value.trim();const telegram=/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(text);
   const phone=/^\+?[\d\s()\-]+$/.test(text)&&window.libphonenumber?.isPossiblePhoneNumber(text,'UZ');
   if(!telegram&&!phone)input.setCustomValidity(t.phoneError);
  }
  if(input.type==='number'&&input.validity.badInput)input.setCustomValidity(t.numberError);
  const valid=input.checkValidity();input.setAttribute('aria-invalid',String(!valid));if(!valid&&!first)first=input;
 }
 document.querySelector('#form-error').textContent=first?(first.name==='contact'?t.phoneError:first.type==='number'?t.numberError:t.formError):'';
 if(first){first.focus();return false;}
 return true;
}
function setLanguage(lang){
 const previous=language;language=siteCopy[lang]?lang:'ru';const t=siteCopy[language];
 document.documentElement.lang=language;document.title=language==='ru'?'SHARQ — B2B-экспедирование из Китая в Узбекистан':'SHARQ — Xitoydan O‘zbekistonga B2B ekspeditorlik';document.querySelector('meta[name="description"]').content=t.meta;
 document.querySelectorAll('[data-copy]').forEach(el=>el.textContent=t[el.dataset.copy]);
 document.querySelectorAll('[data-placeholder]').forEach(el=>el.placeholder=t[el.dataset.placeholder]);
 document.querySelectorAll('[data-aria]').forEach(el=>el.setAttribute('aria-label',t[el.dataset.aria]));
 document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===language)));
 for(const [name,selected] of [['origin',selectedOrigin],['destination',selectedDestination]])if(selected&&value(name)===selected[previous])field(name).value=selected[language];
 for(const input of rateForm.querySelectorAll('input,select,textarea')){input.setCustomValidity('');input.removeAttribute('aria-invalid');}
 document.querySelector('#form-error').textContent='';refreshMapUI();suggesters.forEach(widget=>widget.close());if(!document.querySelector('#request-review').hidden)renderReview();
 try{localStorage.setItem('sharq-language',language);}catch{}
}
// Form selection and map selection always represent the same route.
for(const [name,records] of [['origin',origins],['destination',destinations]]){
 document.getElementById('map-'+name).addEventListener('change',event=>selectRouteCity(name,records.find(city=>city.id===event.target.value)||null));
 field(name).addEventListener('input',()=>{const city=matchCity(value(name),records);if(name==='origin')selectedOrigin=city;else selectedDestination=city;drawRoute();});
 if(window.autoComplete){
  const data=records.map(city=>({city,search:[city.ru,city.uz,...city.aliases].join(' ')}));
  suggesters.push(new autoComplete({selector:`#rate-form [name="${name}"]`,threshold:1,data:{src:data,keys:['search']},resultsList:{maxResults:8},resultItem:{element:(item,result)=>{item.textContent=result.value.city[language];}},events:{input:{selection:event=>selectRouteCity(name,event.detail.selection.value.city)}}}));
 }
}
document.querySelector('#map-reset').addEventListener('click',()=>{if(mapLoaded){routeGeometry=null;fitMap(true);routeGeometry=selectedOrigin&&selectedDestination?RouteGeometry.greatCircle(selectedOrigin.coordinates,selectedDestination.coordinates,{npoints:75}):null;}});
rateForm.addEventListener('input',event=>{if(event.target.setCustomValidity){event.target.setCustomValidity('');event.target.removeAttribute('aria-invalid');}document.querySelector('#form-error').textContent='';});
rateForm.addEventListener('change',refreshConditionalFields);
field('contact').addEventListener('blur',()=>{const text=value('contact');if(text&&!text.startsWith('@')&&window.libphonenumber){const phone=libphonenumber.parsePhoneNumberFromString(text,'UZ');if(phone?.isPossible())field('contact').value=phone.formatInternational();}});
rateForm.addEventListener('submit',event=>{event.preventDefault();if(!validateInquiry())return;renderReview();rateForm.hidden=true;const review=document.querySelector('#request-review');review.hidden=false;review.focus({preventScroll:true});review.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});});
function editRequest(focus=true){document.querySelector('#request-review').hidden=true;rateForm.hidden=false;if(focus)field('name').focus();}
document.querySelector('#edit-request').addEventListener('click',()=>editRequest());
document.querySelectorAll('[data-mode]').forEach(link=>link.addEventListener('click',()=>{field('transport').value=link.dataset.mode;field('shipment').value=link.dataset.shipment==='air'?'choose':link.dataset.shipment;refreshConditionalFields();editRequest(false);}));
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
const menuButton=document.querySelector('.menu-button'),nav=document.querySelector('#site-nav');
function closeMenu(){nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menuButton.focus();}});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>drawRoute(false));
let savedLanguage;try{savedLanguage=localStorage.getItem('sharq-language');}catch{}
setLanguage(savedLanguage||'ru');refreshConditionalFields();initMap();document.querySelector('#year').textContent=new Date().getFullYear();
// Analytics remains opt-in; never send contact or cargo details as events.
const analytics=window.SHARQ_INTEGRATIONS?.umami;
if(analytics?.scriptUrl&&analytics?.websiteId){
 try{const url=new URL(analytics.scriptUrl,location.href);if(url.protocol==='https:'){
  const script=document.createElement('script');script.src=url.href;script.defer=true;script.dataset.websiteId=analytics.websiteId;document.head.append(script);
  let started=false;rateForm.addEventListener('input',()=>{if(!started&&window.umami){umami.track('inquiry-start');started=true;}});
  document.querySelector('#send-request').addEventListener('click',()=>window.umami?.track('whatsapp-open',{mode:value('transport'),language}));
 }}catch{}
}
