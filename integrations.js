// Local libraries: no CDN requests or third-party tracking unless configured.
const destinationCities=[
 {coordinates:[69.2401, 41.2995],ru:'Ташкент',uz:'Toshkent',en:'Tashkent'}, {coordinates:[66.9597, 39.6542],ru:'Самарканд',uz:'Samarqand',en:'Samarkand'},
 {coordinates:[64.4286, 39.7747],ru:'Бухара',uz:'Buxoro',en:'Bukhara'}, {coordinates:[72.3442, 40.7821],ru:'Андижан',uz:'Andijon',en:'Andijan'},
 {coordinates:[71.6726, 40.9983],ru:'Наманган',uz:'Namangan',en:'Namangan'}, {coordinates:[71.7864, 40.3864],ru:'Фергана',uz:'Farg‘ona',en:'Fergana'},
 {coordinates:[65.3792, 40.1039],ru:'Навои',uz:'Navoiy',en:'Navoi'}, {coordinates:[59.6103, 42.4602],ru:'Нукус',uz:'Nukus',en:'Nukus'}
];
const cityAliases=['Khorgos Horgos Харгос','Guangzhou','Yiwu','Beijing','Shenzhen'];
const citySuggesters=[];
for(const [name,records] of [['origin',cities],['destination',destinationCities]]){
 const entries=records.map((city,index)=>({city,search:[city.ru,city.uz,city.en||cityAliases[index]||''].join(' ')}));
 const widget=new autoComplete({selector:`[name="${name}"]`,threshold:1,data:{src:entries,keys:['search']},resultsList:{maxResults:8},resultItem:{element:(item,data)=>{item.textContent=data.value.city[language];}},events:{input:{selection:event=>{
   const city=event.detail.selection.value.city;
   if(name==='origin')selectCity(city);else form.elements.destination.value=city[language];
   form.elements[name].dispatchEvent(new Event('input',{bubbles:true}));
 }}}});
 citySuggesters.push(widget);
}
document.addEventListener('languagechange',()=>citySuggesters.forEach(widget=>widget.close()));
form.elements.contactPhone.addEventListener('blur',()=>{
 const field=form.elements.contactPhone;
 if(field.value.trim()){const parsed=libphonenumber.parsePhoneNumberFromString(field.value,'UZ');if(parsed?.isPossible())field.value=parsed.formatInternational();}
});
// Opt-in gallery: add real shipment photos using the documented data attributes.
async function mountShipmentGallery(){
 if(!document.querySelector('[data-shipment-gallery] a[data-pswp-width]'))return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='vendor/photoswipe/photoswipe.css';document.head.append(css);
 const {default:PhotoSwipeLightbox}=await import('./vendor/photoswipe/photoswipe-lightbox.esm.min.js');
 const lightbox=new PhotoSwipeLightbox({gallery:'[data-shipment-gallery]',children:'a[data-pswp-width]',pswpModule:()=>import('./vendor/photoswipe/photoswipe.esm.min.js')});lightbox.init();
}
mountShipmentGallery();
const analytics=window.SHARQ_INTEGRATIONS?.umami;
if(analytics?.scriptUrl&&analytics?.websiteId){
 const url=new URL(analytics.scriptUrl,location.href);
 if(url.protocol==='https:'){
  const script=document.createElement('script');script.src=url.href;script.defer=true;script.dataset.websiteId=analytics.websiteId;document.head.append(script);
  let started=false;
  form.addEventListener('input',()=>{if(!started){window.umami?.track('inquiry-start');started=true;}});
  document.querySelector('#whatsapp-link').addEventListener('click',()=>window.umami?.track('whatsapp-open',{mode:fieldValue('mode'),language}));
 }
}
