let selectedCity=null;
function refreshCityChoice(){
  const t=copy[language];
  document.querySelectorAll('[data-city]').forEach(button=>{const city=cities.find(c=>c.id===button.dataset.city);button.textContent=city[language];button.setAttribute('aria-pressed',String(city===selectedCity));});
  cityLabels.forEach(({el,city})=>el.setAttribute('aria-pressed',String(city===selectedCity)));
  document.querySelector('#city-status').textContent=selectedCity?t.cityChosen+' '+selectedCity[language]:t.cityDefault;
  document.querySelector('.city-quote').textContent=t.cityCalculate+(selectedCity?' · '+selectedCity[language]:'');
  document.querySelector('.mobile-actions').setAttribute('aria-label',language==='ru'?'Быстрая связь':'Tezkor aloqa');
}
function selectCity(city){
  selectedCity=city;form.elements.origin.value=city[language];form.elements.origin.setCustomValidity('');form.elements.origin.removeAttribute('aria-invalid');
  if(mapReady){
    const [lng,lat]=city.coordinates;
    const route={type:'Feature',properties:{},geometry:{type:'LineString',coordinates:Array.from({length:61},(_,i)=>{const t=i/60;return [lng+(64.5-lng)*t,lat+(41.4-lat)*t+5*Math.sin(Math.PI*t)];})}};
    routeMap.getSource('direction').setData(route);
    routeMap.getSource('points').setData({type:'FeatureCollection',features:[city.coordinates,[64.5,41.4]].map(coordinates=>({type:'Feature',properties:{},geometry:{type:'Point',coordinates}}))});
    labels.filter(l=>l.key==='china').forEach(l=>l.el.hidden=true);
  }
  refreshCityChoice();if(currentStep===2)renderReview();
}
for(const city of cities){const button=document.createElement('button');button.type='button';button.dataset.city=city.id;button.addEventListener('click',()=>selectCity(city));document.querySelector('#city-options').append(button);}
document.querySelector('.city-quote').addEventListener('click',()=>{showStep(0,false);});
form.elements.origin.addEventListener('input',()=>{if(selectedCity&&!Object.values({ru:selectedCity.ru,uz:selectedCity.uz}).includes(fieldValue('origin'))){selectedCity=null;if(mapReady){routeMap.getSource('direction').setData(direction);routeMap.getSource('points').setData({type:'FeatureCollection',features:[[104,35],[64.5,41.4]].map(coordinates=>({type:'Feature',properties:{},geometry:{type:'Point',coordinates}}))});labels.filter(l=>l.key==='china').forEach(l=>l.el.hidden=false);}refreshCityChoice();}});
function updateCargoFields(){
  const type=fieldValue('cargoType');
  for(const [id,active] of [['oversized-fields',type==='oversized'],['flammable-fields',fieldValue('danger')==='yes']]){
    const group=document.getElementById(id);group.hidden=!active;
    group.querySelectorAll('input,textarea').forEach(field=>{field.disabled=!active;field.setCustomValidity('');field.removeAttribute('aria-invalid');});
  }
  document.querySelector('#form-error').textContent='';
}
function extraCargoRows(){
  const t=copy[language],type=fieldValue('cargoType');
  const rows=[[t.shipment,fieldValue('mode')==='air'?t.airShipment:t[{help:'help',groupage:'groupage',full:'fullLoad'}[fieldValue('shipment')]]],[t.dangerLabel,t[{unknown:'dangerUnknown',no:'dangerNo',yes:'dangerYes'}[fieldValue('danger')]]],[t.cargoType,t[{general:'cargoGeneral',oversized:'cargoOversized',small:'cargoSmall'}[type]]]];
  if(type==='oversized')rows.push([t.dimensionsSummary,['length','width','height'].map(key=>fieldValue(key)||'—').join(' × ')]);
  if(fieldValue('danger')==='yes')rows.push([t.hazardSummary,fieldValue('hazard')||t.notSpecified]);
  return rows;
}
form.elements.cargoType.addEventListener('change',updateCargoFields);
document.addEventListener('languagechange',()=>{
  if(selectedCity&&[selectedCity.ru,selectedCity.uz].includes(fieldValue('origin')))form.elements.origin.value=selectedCity[language];
  refreshCityChoice();if(currentStep===2)renderReview();
});
const mobileBar=document.querySelector('.mobile-actions');
new IntersectionObserver(entries=>{mobileBar.classList.toggle('is-hidden',entries[0].isIntersecting);},{threshold:0}).observe(document.querySelector('#quote-form'));
refreshCityChoice();updateCargoFields();
// Defer decorative images outside the first screen until their section approaches.
const backgroundObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('background-ready');backgroundObserver.unobserve(entry.target);}});},{rootMargin:'350px'});
document.querySelectorAll('#services,.process,.quote,.faq,footer,.cargo-types').forEach(section=>backgroundObserver.observe(section));

form.elements.danger.addEventListener('change',updateCargoFields);
function syncShipment(){const air=fieldValue('mode')==='air';document.querySelector('#shipment-field').hidden=air;form.elements.shipment.disabled=air;}
form.elements.mode.addEventListener('change',syncShipment);
document.querySelectorAll('[data-mode],[data-transport],.route-cta').forEach(link=>link.addEventListener('click',()=>{if(link.dataset.shipment&&link.dataset.shipment!=='air')form.elements.shipment.value=link.dataset.shipment;syncShipment();}));
syncShipment();
