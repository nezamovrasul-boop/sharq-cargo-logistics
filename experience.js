/* MapLibre powers a country-level direction diagram, not live tracking. */
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const form = document.querySelector('#quote-form');
const panels = [...document.querySelectorAll('[data-step]')];
let currentStep = 0;
let selectedTransport = 'road';
let routeMap;
let mapReady = false;
const labels = [];
// City centres: GeoNames; Yiwu also verified against UNGEGN city 2509.
const cities = [
  {id:'khorgos',coordinates:[80.4144,44.1256],ru:'Хоргос',uz:'Xorgos'},
  {id:'guangzhou',coordinates:[113.2644,23.1291],ru:'Гуанчжоу',uz:'Guanchjou'},
  {id:'yiwu',coordinates:[120.07,29.3],ru:'Иу',uz:'Iu'},
  {id:'beijing',coordinates:[116.4074,39.9042],ru:'Пекин',uz:'Pekin'},
  {id:'shenzhen',coordinates:[114.0579,22.5431],ru:'Шэньчжэнь',uz:'Shenchjen'}
];
const cityLabels = [];
const modeColors = {road:'#d7eef6', air:'#72b4d6', rail:'#d5d99c'};
const mapBounds = [[54, 18], [124, 54]];
const direction = {type:'Feature',properties:{},geometry:{type:'LineString',coordinates:Array.from({length:61},(_,i)=>{const t=i/60;return [104+(64.5-104)*t,35+(41.4-35)*t+5*Math.sin(Math.PI*t)];})}};
function fitRoute(){if(routeMap)routeMap.fitBounds(mapBounds,{padding:{top:45,bottom:50,left:36,right:36},duration:reducedMotion?0:650});}
function updateTransport(mode, syncForm = true){
  if(!modeColors[mode])return;
  selectedTransport=mode;
  document.querySelectorAll('[data-transport]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.transport===mode)));
  document.querySelector('#selected-title').textContent=copy[language][mode+'Title'];
  document.querySelector('#selected-description').textContent=copy[language][mode+'Detail'];
  document.querySelector('.route-explorer').style.setProperty('--route-accent',modeColors[mode]);
  if(syncForm)form.elements.mode.value=mode;
  if(mapReady){routeMap.setPaintProperty('direction','line-color',modeColors[mode]);routeMap.setPaintProperty('endpoints','circle-color',modeColors[mode]);}
  if(currentStep===2)renderReview();
}
function updateMapLabels(){cityLabels.forEach(({el,city})=>{el.querySelector('span').textContent=city[language];el.setAttribute('aria-label',city[language]);});const locale=language==='ru'?['Увеличить карту','Уменьшить карту','Источники карты','Шаги заявки']:['Xaritani kattalashtirish','Xaritani kichraytirish','Xarita manbalari','So‘rov bosqichlari'];['.maplibregl-ctrl-zoom-in','.maplibregl-ctrl-zoom-out','.maplibregl-ctrl-attrib-button'].forEach((selector,i)=>{const control=document.querySelector(selector);if(control){control.setAttribute('aria-label',locale[i]);control.setAttribute('title',locale[i]);}});document.querySelector('.wizard-progress').setAttribute('aria-label',locale[3]);labels.forEach(({el,key,caption})=>{el.querySelector('small').textContent=copy[language][caption];el.querySelector('strong').textContent=copy[language][key];});}
function initMap(){
  if(!window.maplibregl)return;
  try{
    routeMap=new maplibregl.Map({container:'route-map',style:{version:8,sources:{countries:{type:'geojson',data:'assets/countries.geojson',attribution:'<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a>'},direction:{type:'geojson',data:direction},points:{type:'geojson',data:{type:'FeatureCollection',features:[[104,35],[64.5,41.4]].map(coordinates=>({type:'Feature',properties:{},geometry:{type:'Point',coordinates}}))}}},layers:[{id:'background',type:'background',paint:{'background-color':'#72b4d6'}},{id:'land',type:'fill',source:'countries',paint:{'fill-color':'#a8d2e5'}},{id:'focus',type:'fill',source:'countries',filter:['in',['get','iso'],['literal',['CHN','UZB']]],paint:{'fill-color':'#777c2c'}},{id:'borders',type:'line',source:'countries',paint:{'line-color':'#d7eef6','line-opacity':0.28,'line-width':0.8}},{id:'direction-shadow',type:'line',source:'direction',paint:{'line-color':'#d7eef6','line-opacity':0.07,'line-width':14}},{id:'direction',type:'line',source:'direction',paint:{'line-color':modeColors[selectedTransport],'line-width':2.4,'line-dasharray':[2,2]}},{id:'endpoints',type:'circle',source:'points',paint:{'circle-color':modeColors[selectedTransport],'circle-radius':5,'circle-stroke-width':7,'circle-stroke-color':'#d7eef6','circle-stroke-opacity':0.15}}]},center:[89,36],zoom:2.7,minZoom:1.5,maxZoom:5,renderWorldCopies:false,dragRotate:false,pitchWithRotate:false,touchPitch:false,attributionControl:{compact:true},scrollZoom:false});
    routeMap.touchZoomRotate.disableRotation();
    routeMap.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
    routeMap.on('load',()=>{
      mapReady=true;
      document.querySelector('#map-fallback').hidden=true;
      document.querySelector('#route-map').classList.add('ready');
      for(const [key,caption,coordinates,anchor] of [['china','countryFrom',[104,35],'bottom-right'],['uzbekistan','countryTo',[64.5,41.4],'bottom']]){
        const el=document.createElement('div');el.className='country-marker';el.append(document.createElement('small'),document.createElement('strong'));
        labels.push({el,key,caption});new maplibregl.Marker({element:el,anchor,offset:key==='china'?[-12,-12]:[0,-15]}).setLngLat(coordinates).addTo(routeMap);
      }
      cities.forEach(city=>{
        const el=document.createElement('button');el.type='button';
        el.className='city-marker city-'+city.id;
        el.setAttribute('aria-pressed','false');el.addEventListener('click',()=>selectCity(city));
        el.append(document.createElement('span'));
        cityLabels.push({el,city});
        new maplibregl.Marker({element:el,anchor:'center'}).setLngLat(city.coordinates).addTo(routeMap);
      });
      updateMapLabels();fitRoute();if(typeof selectedCity!=='undefined'&&selectedCity)selectCity(selectedCity);
    });
    routeMap.on('error',()=>{if(!mapReady)document.querySelector('#map-fallback').hidden=false;});
    new ResizeObserver(()=>{if(mapReady){routeMap.resize();routeMap.fitBounds(mapBounds,{padding:35,duration:0});}}).observe(document.querySelector('.map-shell'));
  }catch{document.querySelector('#map-fallback').hidden=false;}
}
function modeLabel(value){return copy[language][value==='help'?'help':value+'Title'];}
function fieldValue(name){return form.elements.namedItem(name).value.trim();}
function reviewRows(){const t=copy[language];return [[t.from,fieldValue('origin')],[t.to,fieldValue('destination')],[t.mode,modeLabel(fieldValue('mode'))],[t.cargo,fieldValue('cargo')],[t.weightLabel,fieldValue('weight')||t.notSpecified],[t.volumeLabel,fieldValue('volume')||t.notSpecified],[t.dateLabel,fieldValue('date')||t.notSpecified],...extraCargoRows()];}
function buildInquiry(){return copy[language].greeting+'\n\n'+reviewRows().map(([label,value])=>label+': '+value).join('\n');}
function renderReview(){
  const summary=document.querySelector('#quote-summary');summary.replaceChildren();
  reviewRows().forEach(([label,value])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);summary.append(row);});
  document.querySelector('#whatsapp-link').href='https://wa.me/998900106669?text='+encodeURIComponent(buildInquiry());
}
function showStep(step,focus=true){
  currentStep=step;
  panels.forEach((panel,index)=>panel.hidden=index!==step);
  document.querySelectorAll('[data-step-indicator]').forEach((el,index)=>{if(index===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');el.classList.toggle('complete',index<step);});
  document.querySelector('#previous-step').hidden=step===0;
  document.querySelector('#next-step').hidden=step===2;
  document.querySelector('#whatsapp-link').hidden=step!==2;
  document.querySelector('#form-error').textContent='';
  if(step===2)renderReview();
  if(focus)panels[step].querySelector('h3').focus({preventScroll:true});
}
function validateStep(){
  let invalid;
  for(const field of panels[currentStep].querySelectorAll('input,textarea,select')){
    if(field.disabled)continue;
    field.setCustomValidity('');
    if(field.required&&!field.value.trim())field.setCustomValidity(copy[language].requiredError);
    const valid=field.checkValidity();field.setAttribute('aria-invalid',String(!valid));if(!valid&&!invalid)invalid=field;
  }
  if(invalid){document.querySelector('#form-error').textContent=invalid.type==='number'?copy[language].numberError:invalid.type==='date'?copy[language].invalidDate:copy[language].requiredError;invalid.focus();return false;}
  return true;
}
form.addEventListener('submit',event=>{event.preventDefault();if(currentStep<2&&validateStep())showStep(currentStep+1);});
document.querySelector('#previous-step').addEventListener('click',()=>showStep(currentStep-1));
form.addEventListener('input',event=>{if(event.target.setCustomValidity){event.target.setCustomValidity('');event.target.removeAttribute('aria-invalid');}document.querySelector('#form-error').textContent='';});
form.elements.mode.addEventListener('change',()=>updateTransport(form.elements.mode.value,false));
document.querySelectorAll('[data-transport]').forEach(button=>button.addEventListener('click',()=>updateTransport(button.dataset.transport)));
document.querySelectorAll('[data-mode]').forEach(link=>link.addEventListener('click',()=>{updateTransport(link.dataset.mode);showStep(0,false);}));
document.querySelector('.route-cta').addEventListener('click',()=>{updateTransport(selectedTransport);showStep(0,false);});
document.querySelector('.map-reset').addEventListener('click',fitRoute);
document.addEventListener('languagechange',()=>{updateTransport(selectedTransport,false);updateMapLabels();form.querySelectorAll('input,textarea').forEach(el=>el.setCustomValidity(''));document.querySelector('#form-error').textContent='';if(currentStep===2)renderReview();});
const today=new Date();form.elements.date.min=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
updateTransport('road',false);showStep(0,false);updateMapLabels();initMap();
