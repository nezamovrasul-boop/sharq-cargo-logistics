function styleHeadings(){
  document.querySelectorAll('[data-t$="Eyebrow"]').forEach(label=>{
    const text=copy[language][label.dataset.t];
    const match=text.match(/^(\d{2})\s+(.+)$/);
    if(!match)return;
    label.classList.add('section-caption');
    const number=document.createElement('span');number.className='section-number';number.textContent=match[1];
    const title=document.createElement('span');title.className='section-caption-text';title.textContent=match[2];
    label.replaceChildren(number,document.createTextNode(' '),title);
  });
  document.querySelectorAll('h1[data-t],h2[data-t]').forEach(heading=>{
    const lines=copy[language][heading.dataset.t].split('\n');
    heading.replaceChildren(...lines.map(line=>{const span=document.createElement('span');span.className='heading-line';span.textContent=line;return span;}));
  });
}
styleHeadings();
document.addEventListener('languagechange',styleHeadings);
