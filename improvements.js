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
  if(typeof redrawSelectedRoute==='function')redrawSelectedRoute(true);
  refreshCityChoice();if(currentStep===2)renderReview();
}
for(const city of cities){const button=document.createElement('button');button.type='button';button.dataset.city=city.id;button.addEventListener('click',()=>selectCity(city));document.querySelector('#city-options').append(button);}
document.querySelector('.city-quote').addEventListener('click',()=>{showStep(0,false);});

function updateCargoFields(){
  const type=fieldValue('cargoType');
  for(const [id,active] of [['oversized-fields',true],['flammable-fields',fieldValue('danger')==='yes']]){
    const group=document.getElementById(id);group.hidden=!active;
    group.querySelectorAll('input,textarea').forEach(field=>{field.disabled=!active;field.setCustomValidity('');field.removeAttribute('aria-invalid');});
  }
  document.querySelector('#form-error').textContent='';
}
function extraCargoRows(){
  const t=copy[language],type=fieldValue('cargoType');
  const rows=[[t.shipment,fieldValue('mode')==='air'?t.airShipment:t[{help:'help',groupage:'groupage',full:'fullLoad'}[fieldValue('shipment')]]],[t.dangerLabel,t[{unknown:'dangerUnknown',no:'dangerNo',yes:'dangerYes'}[fieldValue('danger')]]],[t.cargoType,t[{general:'cargoGeneral',oversized:'cargoOversized',small:'cargoSmall'}[type]]]];
  rows.push([t.dimensionsSummary,['length','width','height'].map(key=>fieldValue(key)||'—').join(' × ')]);
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
