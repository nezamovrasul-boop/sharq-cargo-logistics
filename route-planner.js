// City-centre schematic only: never a road itinerary or live vehicle position.
let selectedDestination=null;
let routeAnimation=0;
let currentGeometry=null;
let destinationMarker=null;
const routeCopy={ru:{destination:'Город получения',choose:'Выберите город',title:'Ваш маршрут',calculate:'Запросить ставку',note:'Схема направления. Возможность перевозки, точный путь и условия подтвердит менеджер.',format:'Формат отправки',unknown:'Укажите города для построения схемы'},uz:{destination:'Yetkazish shahri',choose:'Shaharni tanlang',title:'Sizning yo‘nalishingiz',calculate:'Tarif so‘rash',note:'Yo‘nalish sxemasi. Tashish imkoniyati, aniq yo‘l va shartlarni menejer tasdiqlaydi.',format:'Jo‘natma shakli',unknown:'Sxemani ko‘rish uchun shaharlarni kiriting'}};
const planner=document.createElement('div');planner.className='route-planner';
planner.innerHTML='<div class="planner-heading"></div><strong class="planner-route" aria-live="polite"></strong><label><span class="destination-label"></span><select id="map-destination"></select></label><label><span class="shipment-label"></span><select id="map-shipment"></select></label><p class="planner-mode"></p><a class="button planner-cta" href="#quote"></a><p class="planner-note"></p>';
document.querySelector('.route-console').append(planner);
const destinationSelect=planner.querySelector('#map-destination');
const shipmentSelect=planner.querySelector('#map-shipment');
function refreshRouteCard(){
 if(typeof planner==='undefined')return;
 const t=routeCopy[language],c=copy[language];
 document.querySelectorAll('[data-transport]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.transport===fieldValue('mode'))));
 planner.querySelector('.planner-heading').textContent=t.title;
 planner.querySelector('.planner-route').textContent=(selectedCity?.[language]||fieldValue('origin')||(language==='ru'?'Выберите город отправки':'Jo‘natish shahrini tanlang'))+' → '+(selectedDestination?.[language]||fieldValue('destination')||c.uzbekistan);
 planner.querySelector('.destination-label').textContent=t.destination;
 destinationSelect.replaceChildren(new Option(t.choose,''),...destinationCities.map((city,index)=>new Option(city[language],String(index))));
 destinationSelect.value=selectedDestination?String(destinationCities.indexOf(selectedDestination)):'';
 planner.querySelector('.shipment-label').textContent=t.format;
 shipmentSelect.replaceChildren(...[['help',c.help],['groupage',c.groupage],['full',c.fullLoad]].map(([value,label])=>new Option(label,value)));
 shipmentSelect.value=fieldValue('shipment');
 shipmentSelect.parentElement.hidden=fieldValue('mode')==='air';
 planner.querySelector('.planner-mode').textContent=modeLabel(fieldValue('mode'));
 planner.querySelector('.planner-cta').textContent=t.calculate;
 planner.querySelector('.planner-note').textContent=t.note;
 cityLabels.forEach(({el,city})=>el.classList.toggle('is-muted',!!selectedCity&&city!==selectedCity));
 if(destinationMarker)destinationMarker.getElement().textContent=selectedDestination?.[language]||'';
}
function fitSelectedRoute(animate=true){
 if(!mapReady)return;
 const bounds=currentGeometry?RouteGeometry.bbox(currentGeometry):[54,18,124,54];
 routeMap.fitBounds([[bounds[0],bounds[1]],[bounds[2],bounds[3]]],{padding:{top:70,bottom:70,left:65,right:65},maxZoom:3.8,duration:animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches?650:0});
}
function redrawSelectedRoute(animate=true){
 cancelAnimationFrame(routeAnimation);
 refreshRouteCard();
 if(!mapReady)return;
 const start=selectedCity?.coordinates,end=selectedDestination?.coordinates;
 currentGeometry=start&&end?RouteGeometry.greatCircle(start,end,{npoints:90}):null;
 // Keep known endpoints visible, but do not invent a route for unrecognised input.
 routeMap.getSource('points').setData({type:'FeatureCollection',features:[start,end].filter(Boolean).map(coordinates=>({type:'Feature',properties:{},geometry:{type:'Point',coordinates}}))});
 labels.forEach(({el,key})=>el.hidden=key==='china'?!!start:!!end);
 destinationMarker?.remove();destinationMarker=null;
 if(end){const el=document.createElement('div');el.className='destination-marker';el.textContent=selectedDestination[language];destinationMarker=new maplibregl.Marker({element:el,anchor:'bottom',offset:[0,-14]}).setLngLat(end).addTo(routeMap);}
 if(!currentGeometry){routeMap.getSource('direction').setData({type:'FeatureCollection',features:[]});return;}
 fitSelectedRoute(animate);
 const geometry=currentGeometry;
 if(!animate||matchMedia('(prefers-reduced-motion: reduce)').matches){routeMap.getSource('direction').setData(geometry);return;}
 const started=performance.now(),coords=geometry.geometry.coordinates;
 const frame=now=>{const fraction=Math.min(1,(now-started)/900);const count=Math.max(2,Math.ceil(coords.length*fraction));routeMap.getSource('direction').setData({...geometry,geometry:{type:'LineString',coordinates:coords.slice(0,count)}});if(fraction<1)routeAnimation=requestAnimationFrame(frame);};
 routeAnimation=requestAnimationFrame(frame);
}
function matchCity(value,records){const query=value.trim().toLocaleLowerCase();return records.find(city=>[city.ru,city.uz,city.en,city.id].filter(Boolean).some(name=>name.toLocaleLowerCase()===query))||null;}
function syncRouteFromForm(){selectedCity=matchCity(fieldValue('origin'),cities);selectedDestination=matchCity(fieldValue('destination'),destinationCities);refreshCityChoice();redrawSelectedRoute(true);}
for(const name of ['origin','destination'])form.elements[name].addEventListener('input',syncRouteFromForm);
destinationSelect.addEventListener('change',()=>{selectedDestination=destinationSelect.value===''?null:destinationCities[Number(destinationSelect.value)];form.elements.destination.value=selectedDestination?.[language]||'';form.elements.destination.setCustomValidity('');form.elements.destination.removeAttribute('aria-invalid');redrawSelectedRoute(true);if(currentStep===2)renderReview();});
shipmentSelect.addEventListener('change',()=>{form.elements.shipment.value=shipmentSelect.value;if(currentStep===2)renderReview();});
form.elements.shipment.addEventListener('change',refreshRouteCard);
form.elements.mode.addEventListener('change',refreshRouteCard);
document.querySelectorAll('[data-mode],[data-transport],.route-cta').forEach(el=>el.addEventListener('click',refreshRouteCard));
planner.querySelector('.planner-cta').addEventListener('click',()=>showStep(0,false));
document.addEventListener('languagechange',()=>{if(selectedDestination)form.elements.destination.value=selectedDestination[language];refreshRouteCard();if(currentStep===2)renderReview();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>redrawSelectedRoute(false));
refreshRouteCard();if(mapReady)redrawSelectedRoute(false);
