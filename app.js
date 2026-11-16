const PRONOUNS = ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles'];
const IMPERATIVE_PRONOUNS = ['tu', 'nous', 'vous'];
const TENSES = {
  indicatif: [
    {id:'present', label:'Présent', code:'P', kind:'simple'},
    {id:'imparfait', label:'Imparfait', code:'I', kind:'simple'},
    {id:'passe_simple', label:'Passé simple', code:'J', kind:'simple', literary:true},
    {id:'futur_simple', label:'Futur simple', code:'F', kind:'simple'},
    {id:'passe_compose', label:'Passé composé', aux:'P', kind:'compound'},
    {id:'plus_que_parfait', label:'Plus-que-parfait', aux:'I', kind:'compound'},
    {id:'passe_anterieur', label:'Passé antérieur', aux:'J', kind:'compound', literary:true},
    {id:'futur_anterieur', label:'Futur antérieur', aux:'F', kind:'compound'}
  ],
  conditionnel: [
    {id:'present', label:'Présent', code:'C', kind:'simple'},
    {id:'passe', label:'Passé · 1re forme', aux:'C', kind:'compound'},
    {id:'passe_2e_forme', label:'Passé · 2e forme', aux:'T', kind:'compound', literary:true}
  ],
  subjonctif: [
    {id:'present', label:'Présent', code:'S', kind:'simple'},
    {id:'passe', label:'Passé', aux:'S', kind:'compound'},
    {id:'imparfait', label:'Imparfait', code:'T', kind:'simple', literary:true},
    {id:'plus_que_parfait', label:'Plus-que-parfait', aux:'T', kind:'compound', literary:true}
  ],
  imperatif: [
    {id:'present', label:'Présent', code:'Y', kind:'simple'},
    {id:'passe', label:'Passé', aux:'Y', kind:'compound'}
  ],
  infinitif: [
    {id:'present', label:'Présent', code:'W', kind:'simple'},
    {id:'passe', label:'Passé', aux:'W', kind:'compound'}
  ],
  participe: [
    {id:'present', label:'Présent', code:'G', kind:'simple'},
    {id:'passe', label:'Passé', code:'K', kind:'simple'}
  ],
  gerondif: [
    {id:'present', label:'Présent', code:'G', kind:'simple'},
    {id:'passe', label:'Passé', aux:'G', kind:'compound'}
  ],
  constructions: [
    {id:'futur_proche', label:'Futur proche', kind:'construction'},
    {id:'passe_recent', label:'Passé récent', kind:'construction'},
    {id:'present_progressif', label:'Présent progressif', kind:'construction'}
  ]
};
const LEVELS = {CP:0,CE1:1,CE2:2,CM1:3,CM2:4,'6e':5,'5e':6,'4e':7,'3e':8,lycee:9,adulte:9};
const LEVEL_LABELS = {lycee:'lycée',adulte:'adulte / autre'};
const PERSON_KEYS = ['1s','2s','3s','1p','2p','3p'];
const PERSON_INDEX = Object.fromEntries(PERSON_KEYS.map((key,index)=>[key,index]));
const AUXILIARY_CHOICE_VERBS = new Set(['descendre','monter','passer','rentrer','retourner','sortir','remonter','redescendre','repasser','ressortir']);
const ETRE_VERBS = new Set(['aller','descendre','arriver','deceder','devenir','eclore','entrer','intervenir','monter','mourir','naitre','partir','parvenir','passer','rentrer','rester','retomber','retourner','revenir','sortir','survenir','tomber','venir','repartir','redescendre','remonter','ressortir','ressusciter','advenir','redevenir','echoir']);
const QUICK_VERBS = ['être','avoir','aller','faire','dire','venir','prendre','pouvoir','vouloir','voir','savoir','lire','écrire','mettre','boire','partir','sortir','dormir','ouvrir','offrir','recevoir','devoir','croire','vivre','connaître','naître','mourir','manger','commencer','appeler','payer','aimer','parler','chanter','jouer','dessiner','regarder','marcher','travailler','finir','choisir','grandir','réussir','punir','remplir','vendre','attendre'];
const SIMPLE_DESCRIPTIONS = {
  'ind:pre':'Lexique 4 et Morphalou 3.1, via OMEGA-Ω.',
  'ind:imp':'Lexique 4 et Morphalou 3.1, via OMEGA-Ω.',
  'ind:pas':'Lexique 4 et Morphalou 3.1, via OMEGA-Ω.',
  'ind:fut':'Lexique 4 et Morphalou 3.1, via OMEGA-Ω.',
  'cnd:pre':'Lexique 4 et Morphalou 3.1, via OMEGA-Ω.',
  'sub:pre':'Lexique 4 et Morphalou 3.1, via OMEGA-Ω.',
  'sub:imp':'Lexique 4 et Morphalou 3.1, via OMEGA-Ω.',
  'imp:pre':'Lexique 4 et Morphalou 3.1, via OMEGA-Ω.'
};
let verbData = null;
let quizScore = 0;
let quizQuestion = null;

function normalizeVerb(value){return value.trim().toLocaleLowerCase('fr').replace(/[’]/g,"'").normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function escapeHTML(text){return String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function getVerbRecord(value){return verbData?.verbs?.[normalizeVerb(value)]||null;}
function getArray(record,code){
  if(!record)return null;
  const data=record.f?.[code]||record.o?.[code];
  if(!data)return null;
  if(Array.isArray(data))return data.map(value=>!value||value==='NA'?null:value);
  return null;
}
function getSingle(record,code){return getArray(record,code)?.find(Boolean)||null;}
function cleanPerson(value,index){return index===0&&/^je\s+[aeiouyàâäéèêëîïôöùûüÿh]/i.test(value)?value.replace(/^je\s/,'j’'):value;}
function selectParticiple(record,index,auxiliary,gender){
  const participles=getArray(record,'K');
  if(!participles)return null;
  if(auxiliary!=='être')return participles[0]||null;
  const numberIndex=index>=3?1:0;
  return participles[(gender==='f'?2:0)+numberIndex]||participles[0]||null;
}
function auxiliaryFor(verb,selected='auto'){
  if(selected==='être'||selected==='avoir')return selected;
  const source=normalizeVerb(verb),normalized=source.replace(/^se\s+/,'').replace(/^s'/,'');
  return /^se\s/.test(source)||/^s'/.test(source)||ETRE_VERBS.has(normalized)?'être':'avoir';
}
function simpleLabel(mood){return({indicatif:'indicatif',conditionnel:'conditionnel',subjonctif:'subjonctif',imperatif:'impératif',infinitif:'infinitif',participe:'participe',gerondif:'gérondif',constructions:'construction'})[mood]||mood;}
function rowsFromForms(forms,labels=PRONOUNS){
  if(!forms)return null;
  return forms.map((value,index)=>value?{label:labels[index],value}:null).filter(Boolean);
}
function makeRows(verb,mood,tense,gender='m',auxMode='auto'){
  const key=normalizeVerb(verb),record=getVerbRecord(verb);
  if(!record)return{error:'Ce verbe n’apparaît pas dans la bibliothèque. Vérifie son infinitif ou essaie une autre orthographe.'};
  const info=TENSES[mood]?.find(item=>item.id===tense);
  if(!info)return{error:'Choisis une forme dans la liste.'};
  const full=record.f;
  if(info.kind==='construction'){
    const infinitive=getSingle(record,'W')||record.v||verb;
    const helperName=tense==='futur_proche'?'aller':tense==='passe_recent'?'venir':'être';
    const helper=getVerbRecord(helperName);
    const helperForms=getArray(helper,'P');
    if(!helperForms)return{error:'La forme de l’auxiliaire nécessaire n’est pas disponible.'};
    const middle=tense==='futur_proche'?'':tense==='passe_recent'?'de ':'en train de ';
    return{rows:rowsFromForms(helperForms.map(form=>form?`${form} ${middle}${infinitive}`:null)),footnote:'Ces expressions utilisent un verbe conjugué suivi d’un infinitif. Elles servent souvent à préciser le moment ou le déroulement de l’action.'};
  }
  if(mood==='participe'&&tense==='passe'){
    const forms=getArray(record,'K');
    const note=key==='resoudre'?'Dans le sens courant de « trouver une solution », le participe est « résolu ». « Résous / résoute » existe dans un sens rare de décomposition.':'Le participe passé peut s’accorder selon l’auxiliaire et la place du complément d’objet direct.';
    return forms?{rows:rowsFromForms(forms,['masculin singulier','masculin pluriel','féminin singulier','féminin pluriel']),footnote:note}:{error:'Le participe passé n’est pas fourni dans les données disponibles pour ce verbe.'};
  }
  if(mood==='participe'&&tense==='present'){
    const form=getSingle(record,'G');
    return form?{rows:[{label:'participe présent',value:form}],footnote:'Le participe présent se termine souvent par -ant. Il est invariable lorsqu’il est employé comme verbe.'}:{error:'Le participe présent n’est pas fourni pour ce verbe.'};
  }
  if(mood==='gerondif'&&tense==='present'){
    const form=getSingle(record,'G');
    return form?{rows:[{label:'gérondif présent',value:`en ${form}`}],footnote:'Le gérondif présent se construit avec « en » suivi du participe présent.'}:{error:'Le participe présent n’est pas fourni pour ce verbe.'};
  }
  if(mood==='infinitif'&&tense==='present'){
    const form=getSingle(record,'W')||record.v||verb;
    return{rows:[{label:'infinitif présent',value:form}],footnote:'L’infinitif nomme le verbe sans l’accorder avec une personne.'};
  }
  if(info.kind==='simple'&&!info.aux){
    const forms=getArray(record,info.code);
    if(!forms)return{error:'Cette forme simple n’est pas fournie pour ce verbe.'};
    if(info.code==='G')return{rows:[{label:'participe présent',value:forms.find(Boolean)}],footnote:'Le participe présent se termine souvent par -ant.'};
    if(info.code==='W')return{rows:[{label:'infinitif présent',value:forms.find(Boolean)||record.v}],footnote:'L’infinitif nomme le verbe sans l’accorder avec une personne.'};
    const indexes=mood==='imperatif'?[1,3,4]:[0,1,2,3,4,5];
    const labels=mood==='imperatif'?IMPERATIVE_PRONOUNS:PRONOUNS;
    let footnote=`Forme simple issue des bases de conjugaison ouvertes ${full?'Lefff / Morphalou':'OMEGA-Ω'}.`;
    if(key==='pouvoir'&&info.code==='P')footnote+=' « Je peux » est la forme habituelle ; « je puis » est aussi admis, souvent dans un registre soutenu.';
    return{rows:indexes.map((index,i)=>forms[index]?{label:labels[i],value:forms[index]}:null).filter(Boolean),footnote};
  }
  if(info.kind==='compound'){
    if(!full){
      return{error:'Les temps simples existent pour ce verbe, mais le participe passé et les formes composées ne figurent pas dans la source de conjugaison détaillée.'};
    }
    const auxiliary=auxiliaryFor(verb,auxMode);
    const helper=getVerbRecord(auxiliary);
    const auxiliaryForms=getArray(helper,info.aux);
    if(!auxiliaryForms)return{error:`La forme de l’auxiliaire ${auxiliary} n’est pas disponible pour construire ce temps.`};
    if(mood==='infinitif'){
      const infinitive=getSingle(helper,'W')||auxiliary;
      const pp=selectParticiple(record,0,auxiliary,gender);
      return pp?{rows:[{label:'infinitif passé',value:`${infinitive} ${pp}`}],footnote:'L’infinitif passé associe l’infinitif de l’auxiliaire au participe passé.'}:{error:'Le participe passé n’est pas fourni pour ce verbe.'};
    }
    if(mood==='gerondif'){
      const helperParticiple=getSingle(helper,'G');
      const pp=selectParticiple(record,0,auxiliary,gender);
      return pp&&helperParticiple?{rows:[{label:'gérondif passé',value:`en ${helperParticiple} ${pp}`}],footnote:'Le gérondif passé se construit avec « en ayant » ou « en étant », suivi du participe passé.'}:{error:'Les participes nécessaires à cette forme ne sont pas disponibles.'};
    }
    const indexes=mood==='imperatif'?[1,3,4]:[0,1,2,3,4,5];
    const labels=mood==='imperatif'?IMPERATIVE_PRONOUNS:PRONOUNS;
    const rows=indexes.map((personIndex,i)=>{
      const auxForm=auxiliaryForms[personIndex];
      const pp=selectParticiple(record,personIndex,auxiliary,gender);
      return auxForm&&pp?{label:labels[i],value:cleanPerson(`${auxForm} ${pp}`,personIndex)}:null;
    }).filter(Boolean);
    const agreementNote=auxiliary==='être'?'Avec « être », le participe passé s’accorde avec le sujet dans les emplois concernés. Choisis masculin ou féminin pour voir la forme.':'Avec « avoir », le participe passé s’accorde avec le COD lorsqu’il est placé avant le verbe.';
    const variableNote=AUXILIARY_CHOICE_VERBS.has(key)?'Pour ce verbe, le choix entre « être » et « avoir » dépend du sens et de la construction de la phrase. Vérifie la présence d’un complément direct. ':'';
    return rows.length?{rows,footnote:variableNote+agreementNote}:{error:'Les formes nécessaires à ce temps composé ne sont pas disponibles.'};
  }
  return{error:'Cette forme n’est pas présente dans la bibliothèque pour ce verbe.'};
}
function showError(message){document.getElementById('conjugation-table').innerHTML=`<p class="table-error">${escapeHTML(message)}</p>`;document.getElementById('table-footnote').textContent='';}
function renderConjugation(){
  const raw=document.getElementById('verb-search').value,mood=document.getElementById('mood-select').value,tense=document.getElementById('tense-select').value,gender=document.getElementById('agreement-select').value;
  const verb=raw.trim(),record=getVerbRecord(verb);
  const selectedInfo=TENSES[mood]?.find(item=>item.id===tense);
  const source=normalizeVerb(verb),reflexive=/^(?:se\s|s')/.test(source);
  const auxiliaryControl=document.getElementById('auxiliary-control'),auxiliarySelect=document.getElementById('auxiliary-select');
  const canChooseAuxiliary=Boolean(selectedInfo?.kind==='compound'&&record&&!reflexive&&AUXILIARY_CHOICE_VERBS.has(source));
  auxiliaryControl.hidden=!canChooseAuxiliary;
  const auxiliary=auxiliaryFor(verb,canChooseAuxiliary?auxiliarySelect.value:'auto');
  document.getElementById('agreement-select').parentElement.hidden=!(selectedInfo?.kind==='compound'&&record&&auxiliary==='être');
  if(!verbData){showError('La bibliothèque de conjugaison se charge…');return;}
  if(!record){showError(verb?'Verbe absent de l’index. Essaie un infinitif français connu.':'Saisis un infinitif pour afficher son tableau.');return;}
  const result=makeRows(verb,mood,tense,gender,canChooseAuxiliary?auxiliarySelect.value:'auto');
  if(result.error){showError(result.error);document.getElementById('table-title').innerHTML=`${escapeHTML(record.v||verb)} <span>·</span> ${escapeHTML(simpleLabel(mood))}`;return;}
  const info=TENSES[mood]?.find(item=>item.id===tense);
  const label=info?.label||tense;
  document.getElementById('table-title').innerHTML=`${escapeHTML(record.v||verb)} <span>·</span> ${escapeHTML(simpleLabel(mood))} ${escapeHTML(label.toLocaleLowerCase('fr'))}`;
  document.getElementById('conjugation-table').innerHTML=result.rows.map(row=>{const label=row.label==='je'&&/^[aeiouyàâäéèêëîïôöùûüÿ]/i.test(row.value||'')?'j’':row.label;return`<div class="conj-row"><span class="pronoun">${escapeHTML(label)}</span><strong>${escapeHTML(row.value||'—')}</strong></div>`;}).join('');
  document.getElementById('table-footnote').textContent=result.footnote||'';
  const coverage=record.complete?'Paradigme complet dans les formes répertoriées.':'Entrée partielle : seules les formes disponibles sont affichées.';
  document.getElementById('lookup-hint').textContent=`${coverage} Bibliothèque : ${verbData.meta.indexedVerbCount.toLocaleString('fr-FR')} verbes.`;
}
function showVerbSuggestions(query){
  const box=document.getElementById('verb-suggestions');
  if(!box||!verbData||query.trim().length<2){if(box)box.hidden=true;return;}
  const normalized=normalizeVerb(query),starts=[],contains=[];
  for(const [key,record] of Object.entries(verbData.verbs)){
    if(key.startsWith(normalized)){starts.push(record.v||key);if(starts.length===8)break;}
  }
  if(starts.length<5){for(const [key,record] of Object.entries(verbData.verbs)){if(!key.startsWith(normalized)&&key.includes(normalized)){contains.push(record.v||key);if(contains.length>=5-starts.length)break;}}}
  const results=[...new Set([...starts,...contains])].slice(0,8);
  if(!results.length){box.hidden=true;return;}
  box.innerHTML=results.map((name,index)=>`<button type="button" role="option" aria-selected="${index===0?'true':'false'}" data-verb="${escapeHTML(name)}">${escapeHTML(name)}</button>`).join('');box.hidden=false;
}
function setupConjugueur(){
  const mood=document.getElementById('mood-select'),tense=document.getElementById('tense-select'),search=document.getElementById('verb-search'),suggestions=document.getElementById('verb-suggestions');
  function updateTenses(){tense.innerHTML=TENSES[mood.value].map(item=>`<option value="${item.id}">${item.label}</option>`).join('');renderConjugation();}
  mood.addEventListener('change',updateTenses);
  tense.addEventListener('change',renderConjugation);
  search.addEventListener('input',()=>{showVerbSuggestions(search.value);renderConjugation();});
  search.addEventListener('keydown',event=>{
    const buttons=[...suggestions.querySelectorAll('button')],selected=buttons.findIndex(button=>button.getAttribute('aria-selected')==='true');
    if(event.key==='ArrowDown'&&buttons.length){event.preventDefault();buttons.forEach((button,index)=>button.setAttribute('aria-selected',String(index===Math.min(buttons.length-1,selected+1))));}
    if(event.key==='ArrowUp'&&buttons.length){event.preventDefault();buttons.forEach((button,index)=>button.setAttribute('aria-selected',String(index===Math.max(0,selected-1))));}
    if(event.key==='Enter'&&buttons.length){event.preventDefault();const option=buttons[Math.max(0,selected)];search.value=option.dataset.verb;suggestions.hidden=true;renderConjugation();}
    if(event.key==='Escape')suggestions.hidden=true;
  });
  suggestions.addEventListener('click',event=>{const option=event.target.closest('[data-verb]');if(option){search.value=option.dataset.verb;suggestions.hidden=true;renderConjugation();search.focus();}});
  document.addEventListener('click',event=>{if(!event.target.closest('.search-wrap'))suggestions.hidden=true;});
  document.getElementById('agreement-select').addEventListener('change',renderConjugation);
  document.getElementById('auxiliary-select').addEventListener('change',renderConjugation);
  updateTenses();
  fetch('data/verbs.json').then(response=>{if(!response.ok)throw new Error('Bibliothèque indisponible');return response.json();}).then(data=>{
    verbData=data;
    document.getElementById('verb-count').textContent=data.meta.indexedVerbCount.toLocaleString('fr-FR');
    document.getElementById('full-count').textContent=data.meta.completeVerbCount.toLocaleString('fr-FR');
    for(const verb of QUICK_VERBS){const option=document.createElement('option');option.value=verb;document.getElementById('verb-options').appendChild(option);}
    renderConjugation();
    nextQuiz(true);
  }).catch(()=>{document.getElementById('lookup-hint').textContent='La bibliothèque n’a pas pu se charger. Réessaie dans un instant.';showError('Impossible de charger le dictionnaire de verbes.');});
}

const TIME_GROUPS = [
  {mood:'indicatif',title:'Indicatif',description:'On présente une action, un fait ou une possibilité comme réel.',items:[
    ['present','Présent','Action actuelle, habitude ou vérité générale.','je lis',0,3,'simple'],
    ['imparfait','Imparfait','Décor, habitude ou action qui durait dans le passé.','je lisais',2,5,'simple'],
    ['passe_simple','Passé simple','Action achevée qui fait avancer un récit écrit.','je lus',5,9,'literary'],
    ['futur_simple','Futur simple','Action ou événement situé plus tard.','je lirai',2,5,'simple'],
    ['passe_compose','Passé composé','Action passée présentée comme achevée.','j’ai lu',2,5,'compound'],
    ['plus_que_parfait','Plus-que-parfait','Action passée avant un autre moment passé.','j’avais lu',4,7,'compound'],
    ['passe_anterieur','Passé antérieur','Action achevée avant une autre action dans un récit littéraire.','j’eus lu',8,9,'literary'],
    ['futur_anterieur','Futur antérieur','Action qui sera achevée avant un repère futur.','j’aurai lu',6,9,'compound']
  ]},
  {mood:'conditionnel',title:'Conditionnel',description:'Hypothèse, souhait, information incertaine ou demande polie.',items:[
    ['present','Présent','Hypothèse, souhait ou demande polie.','je lirais',5,8,'simple'],
    ['passe','Passé · 1re forme','Action qui aurait pu se produire.','j’aurais lu',6,9,'compound'],
    ['passe_2e_forme','Passé · 2e forme','Forme littéraire, proche du conditionnel passé.','j’eusse lu',9,9,'literary']
  ]},
  {mood:'subjonctif',title:'Subjonctif',description:'Souhait, doute, nécessité ou émotion dans une proposition.',items:[
    ['present','Présent','Après certaines expressions de souhait ou de nécessité.','que je lise',5,8,'simple'],
    ['passe','Passé','Action déjà accomplie, souvent après un verbe au présent.','que j’aie lu',7,9,'compound'],
    ['imparfait','Imparfait','Forme surtout littéraire, liée à un récit au passé.','que je lusse',9,9,'literary'],
    ['plus_que_parfait','Plus-que-parfait','Forme composée surtout littéraire.','que j’eusse lu',9,9,'literary']
  ]},
  {mood:'imperatif',title:'Impératif',description:'Conseil, consigne, ordre ou invitation, sans sujet exprimé.',items:[
    ['present','Présent','Consigne ou conseil pour une action.','lis !',2,5,'simple'],
    ['passe','Passé','Demande de terminer avant un moment donné.','aie lu !',7,9,'compound']
  ]},
  {mood:'infinitif',title:'Infinitif',description:'La forme du verbe sans personne ni sujet conjugué.',items:[
    ['present','Présent','Forme de base du verbe.','lire',0,3,'simple'],
    ['passe','Passé','Action déjà accomplie dans une construction à l’infinitif.','avoir lu',6,9,'compound']
  ]},
  {mood:'participe',title:'Participe',description:'Forme employée dans les temps composés ou comme adjectif verbal.',items:[
    ['present','Présent','Sert notamment à former le gérondif.','lisant',4,7,'simple'],
    ['passe','Passé','Sert à former les temps composés.','lu / lue',2,5,'compound']
  ]},
  {mood:'gerondif',title:'Gérondif',description:'Souvent introduit par « en », il précise comment se déroule l’action.',items:[
    ['present','Présent','Deux actions se déroulent en même temps.','en lisant',5,8,'simple'],
    ['passe','Passé','Construction composée, pour une action déjà faite.','en ayant lu',8,9,'compound']
  ]}
];
function renderTimeCatalog(){
  const catalog=document.getElementById('time-catalog');
  catalog.innerHTML=TIME_GROUPS.map(group=>`<section class="catalog-group" aria-labelledby="catalog-${group.mood}"><div class="catalog-heading"><span class="catalog-index">${group.items.length.toString().padStart(2,'0')}</span><div><h3 id="catalog-${group.mood}">${group.title}</h3><p>${group.description}</p></div></div><div class="catalog-cards">${group.items.map(([id,label,description,example,min,max,kind])=>`<button class="tense-card ${kind==='literary'?'is-literary':kind==='compound'?'is-compound':'is-simple'}" type="button" data-mood="${group.mood}" data-tense="${id}" data-min="${min}" data-max="${max}"><span class="tense-card-top"><span>${label}</span><span aria-hidden="true">↗</span></span><span class="tense-card-description">${description}</span><strong class="tense-card-example">${example}</strong><span class="tense-level">${kind==='literary'?'plutôt littéraire':kind==='compound'?'temps composé':'temps simple'}</span></button>`).join('')}</div></section>`).join('');
  catalog.addEventListener('click',event=>{
    const card=event.target.closest('.tense-card');if(!card)return;
    document.getElementById('mood-select').value=card.dataset.mood;
    const tenseSelect=document.getElementById('tense-select');tenseSelect.innerHTML=TENSES[card.dataset.mood].map(item=>`<option value="${item.id}">${item.label}</option>`).join('');
    tenseSelect.value=card.dataset.tense;renderConjugation();document.getElementById('conjugueur').scrollIntoView({behavior:'smooth'});
  });
}
function updateCatalogRecommendations(){
  const level=classLevel();
  document.querySelectorAll('.tense-card').forEach(card=>{
    const min=Number(card.dataset.min),max=Number(card.dataset.max),recommended=level>=min&&level<=max;
    card.classList.toggle('is-recommended',recommended);
    if(recommended)card.setAttribute('aria-description','Repère suggéré pour le niveau sélectionné.');else card.removeAttribute('aria-description');
  });
}

const CLASS_PATHS={
  CP:{title:'On commence par le présent ?',description:'Trouve le verbe dans une phrase, puis regarde comment il change avec son sujet.',times:['Présent','Je / tu / il','Le verbe dans la phrase']},
  CE1:{title:'Les verbes bougent avec leur sujet.',description:'On repère le verbe et on observe les terminaisons qui changent.',times:['Présent','Sujet et verbe','Verbes en -er']},
  CE2:{title:'On ouvre la porte des temps.',description:'Découvre comment le présent, l’imparfait et le futur donnent des repères différents.',times:['Présent','Imparfait','Futur simple']},
  CM1:{title:'Tu peux déjà raconter plus précisément.',description:'Compare les temps simples et composés pour donner du rythme à tes phrases.',times:['Imparfait','Passé composé','Futur simple']},
  CM2:{title:'On consolide et on fait des liens.',description:'Repère les régularités, les auxiliaires et les accords du participe passé.',times:['Passé composé','Plus-que-parfait','Conditionnel présent']},
  '6e':{title:'Les temps deviennent des outils de récit.',description:'Observe comment les temps s’organisent et comment ils font avancer un texte.',times:['Présent','Passé simple','Imparfait']},
  '5e':{title:'On affine le choix du temps et du mode.',description:'Le contexte aide à choisir : récit, hypothèse, souhait ou obligation.',times:['Passé simple','Conditionnel','Subjonctif présent']},
  '4e':{title:'Place aux nuances et aux concordances.',description:'Un verbe s’accorde avec son sujet et s’inscrit dans la phrase entière.',times:['Conditionnel','Subjonctif','Temps composés']},
  '3e':{title:'Tu sais choisir le bon temps selon l’effet.',description:'Travaille les nuances, les valeurs des temps et la cohérence du récit.',times:['Concordance','Subjonctif','Récit']},
  lycee:{title:'Les temps donnent une voix au texte.',description:'Explore les valeurs, les concordances et les formes usuelles comme littéraires.',times:['Valeurs des temps','Concordance','Modes']},
  adulte:{title:'On apprend à tout âge.',description:'Reprends les bases, explore les nuances et entraîne-toi à ta façon.',times:['Présent','Temps du récit','Concordance']}
};
function inferredClass(age){return({'6-7':'CP','8-9':'CE2','10-11':'CM1','12-14':'5e','15+':'lycee'})[age]||'CE2';}
function classLevel(){const selected=document.getElementById('class-select').value,age=document.getElementById('age-select').value;return LEVELS[selected||inferredClass(age)]??2;}
function updateProfile(className,age){
  const profile=CLASS_PATHS[className||inferredClass(age)]||CLASS_PATHS.CE2;
  document.getElementById('path-greeting').textContent=profile.title;
  const ageText=age==='6-7'?'On avance avec des phrases courtes et des exemples concrets.':age==='15+'?'Les explications peuvent aller plus loin dans les nuances.':'';
  document.getElementById('path-description').textContent=ageText?`${profile.description} ${ageText}`:profile.description;
  document.getElementById('suggested-pills').innerHTML=profile.times.map(time=>`<span>${escapeHTML(time)}</span>`).join('');
  updateCatalogRecommendations();
}
function setupProfile(){
  const form=document.getElementById('profile-form'),classSelect=document.getElementById('class-select'),ageSelect=document.getElementById('age-select');
  try{const saved=JSON.parse(localStorage.getItem('atelier-profile')||'{}');if(saved.class&&classSelect.querySelector(`option[value="${CSS.escape(saved.class)}"]`))classSelect.value=saved.class;if(saved.age&&ageSelect.querySelector(`option[value="${CSS.escape(saved.age)}"]`))ageSelect.value=saved.age;}catch{}
  updateProfile(classSelect.value,ageSelect.value);
  form.addEventListener('submit',event=>{event.preventDefault();const profile={class:classSelect.value,age:ageSelect.value};try{localStorage.setItem('atelier-profile',JSON.stringify(profile));}catch{}updateProfile(profile.class,profile.age);nextQuiz(true);nextMystery();document.getElementById('parcours').scrollIntoView({behavior:'smooth'});});
  const changeProfile=()=>{updateProfile(classSelect.value,ageSelect.value);nextQuiz(true);nextMystery();};
  classSelect.addEventListener('change',changeProfile);ageSelect.addEventListener('change',changeProfile);
}

const QUIZ_QUESTIONS=[
  {min:0,topic:'present',sentence:'En ce moment, je ___ une histoire.',verb:'lire',answer:'lis',choices:['lis','lirai','lisais'],why:'« En ce moment » indique une action au présent.'},
  {min:0,topic:'present',sentence:'Nous ___ dans la cour.',verb:'jouer',answer:'jouons',choices:['jouons','jouions','jouerons'],why:'Avec « nous », le présent de jouer se termine par -ons.'},
  {min:2,topic:'futur',sentence:'Demain, tu ___ au parc.',verb:'venir',answer:'viendras',choices:['viens','venais','viendras'],why:'« Demain » donne un indice : l’action est à venir.'},
  {min:2,topic:'passe',sentence:'Quand il était petit, il ___ souvent.',verb:'chanter',answer:'chantait',choices:['chante','chantait','chantera'],why:'Une habitude passée se raconte souvent à l’imparfait.'},
  {min:3,topic:'passe',sentence:'Hier, j’___ mon exercice.',verb:'finir',answer:'ai fini',choices:['finis','ai fini','finirai'],why:'Le passé composé associe « avoir » au participe passé « fini ».'},
  {min:4,topic:'passe',sentence:'Nous ___ déjà le livre avant le film.',verb:'lire',answer:'avions lu',choices:['avons lu','avions lu','lirons'],why:'Le plus-que-parfait place l’action avant un autre moment passé.'},
  {min:5,topic:'passe',sentence:'Soudain, le héros ___ dans la forêt.',verb:'partir',answer:'partit',choices:['partait','partit','partira'],why:'Dans un récit, le passé simple peut faire avancer une action.'},
  {min:6,topic:'modes',sentence:'Si j’avais le choix, je ___ voyager.',verb:'pouvoir',answer:'pourrais',choices:['peux','pourrais','pourrai'],why:'Le conditionnel peut exprimer une hypothèse ou un souhait.'},
  {min:7,topic:'modes',sentence:'Il faut que vous ___ attentifs.',verb:'être',answer:'soyez',choices:['êtes','soyez','seriez'],why:'Après « il faut que », on emploie souvent le subjonctif.'},
  {min:8,topic:'futur',sentence:'Quand tu arriveras, nous ___ déjà.',verb:'partir',answer:'serons partis',choices:['partirons','sommes partis','serons partis'],why:'Le futur antérieur présente une action qui sera déjà accomplie.'},
  {min:9,topic:'modes',sentence:'Je souhaitais qu’elle ___ plus tôt.',verb:'venir',answer:'vînt',choices:['vient','vînt','viendra'],why:'Le subjonctif imparfait est une forme surtout littéraire.'}
];
let quizDeck=[],quizDeckIndex=0,quizDeckSignature='';
function shuffle(values){const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
const QUIZ_PRONOUNS=['je','tu','il','nous','vous','ils'];
const QUIZ_TEMPLATES=[
  {min:0,topic:'present',code:'P',prompt:p=>`En ce moment, ${p} ___ (verbe).`,why:'Le présent situe une action actuelle ou une habitude.'},
  {min:3,topic:'passe',code:'I',prompt:p=>`Autrefois, ${p} ___ souvent (verbe).`,why:'L’imparfait exprime souvent une habitude ou un décor passé.'},
  {min:6,topic:'passe',code:'J',prompt:p=>`Dans le récit, soudain, ${p} ___ (verbe).`,why:'Le passé simple raconte souvent une action achevée dans un récit écrit.'},
  {min:2,topic:'futur',code:'F',prompt:p=>`Demain, ${p} ___ (verbe).`,why:'Le futur simple situe l’action après le moment où l’on parle.'},
  {min:6,topic:'modes',code:'C',prompt:p=>`À sa place, ${p} ___ autrement (verbe).`,why:'Le conditionnel peut présenter une hypothèse ou une situation imaginée.'},
  {min:7,topic:'modes',code:'S',prompt:p=>`Il faut que ${p} ___ (verbe).`,why:'Après « il faut que », le subjonctif présent est généralement attendu.'},
  {min:9,topic:'modes',code:'T',prompt:p=>`Il fallait que ${p} ___ (verbe).`,why:'Le subjonctif imparfait est une forme surtout littéraire.'}
];
function generatedQuizQuestions(limit=60){
  if(!verbData?.verbs)return[];
  const records=Object.values(verbData.verbs).filter(record=>record.complete&&record.f);
  const questions=[],seen=new Set();let attempts=0;
  while(questions.length<limit&&attempts<limit*35){
    attempts++;
    const template=QUIZ_TEMPLATES[Math.floor(Math.random()*QUIZ_TEMPLATES.length)];
    const index=Math.floor(Math.random()*6),record=records[Math.floor(Math.random()*records.length)];
    const answer=record.f[template.code]?.[index],key=`${record.v}|${template.code}|${index}`;
    if(!answer||answer==='NA'||seen.has(key))continue;
    const alternatives=[];
    for(const code of ['P','I','J','F','C','S','T','Y']){
      const candidate=record.f[code]?.[index];
      if(candidate&&candidate!=='NA'&&candidate!==answer&&!alternatives.includes(candidate))alternatives.push(candidate);
    }
    if(alternatives.length<2)continue;
    seen.add(key);
    const subject=index===0&&/^[aeiouyàâäéèêëîïôöùûüÿ]/i.test(answer)?'j’':QUIZ_PRONOUNS[index];
    questions.push({min:template.min,topic:template.topic,sentence:template.prompt(subject).replace('(verbe)',record.v),verb:record.v,answer,choices:shuffle([answer,...shuffle(alternatives).slice(0,2)]),why:template.why});
  }
  return questions;
}
function availableQuizQuestions(){
  const level=document.getElementById('quiz-level-select')?.value||'auto',topic=document.getElementById('quiz-topic-select')?.value||'tous',current=classLevel();
  const range=level==='base'?{min:0,max:4}:level==='intermediaire'?{min:2,max:7}:level==='avance'?{min:5,max:9}:{min:0,max:current};
  return [...QUIZ_QUESTIONS,...generatedQuizQuestions()].filter(question=>question.min>=range.min&&question.min<=range.max&&(topic==='tous'||question.topic===topic));
}
function resetQuizDeck(){
  const pool=availableQuizQuestions(),order=document.getElementById('quiz-order-select')?.value||'aleatoire';
  quizDeck=order==='aleatoire'?shuffle(pool):[...pool].sort((a,b)=>a.min-b.min);
  if(order==='aleatoire'&&quizDeck.length>1&&quizDeck[0]===quizQuestion)[quizDeck[0],quizDeck[1]]=[quizDeck[1],quizDeck[0]];
  quizDeckIndex=0;quizDeckSignature=[document.getElementById('quiz-level-select')?.value,classLevel(),document.getElementById('quiz-topic-select')?.value,order].join('|');
}
function renderQuizAnswers(){
  const box=document.getElementById('quiz-answers'),written=document.getElementById('written-answer'),mode=document.getElementById('answer-mode-select')?.value||'qcm';
  box.innerHTML='';box.hidden=mode==='ecrit';written.hidden=mode!=='ecrit';
  if(mode==='ecrit'){const input=document.getElementById('written-response');input.value='';input.disabled=false;input.onkeydown=event=>{if(event.key==='Enter')checkQuiz(null,input.value);};return;}
  shuffle(quizQuestion.choices).forEach(option=>{const button=document.createElement('button');button.type='button';button.className='answer-option';button.textContent=option;button.addEventListener('click',()=>checkQuiz(button,option));box.appendChild(button);});
}
function nextQuiz(forceReset=false){
  const signature=[document.getElementById('quiz-level-select')?.value,classLevel(),document.getElementById('quiz-topic-select')?.value,document.getElementById('quiz-order-select')?.value].join('|');
  if(forceReset||quizDeckSignature!==signature||quizDeckIndex>=quizDeck.length)resetQuizDeck();
  if(!quizDeck.length){quizQuestion=null;document.getElementById('quiz-question').textContent='Aucune question dans ce réglage pour l’instant.';document.getElementById('quiz-answers').innerHTML='';document.getElementById('written-answer').hidden=true;return;}
  quizQuestion=quizDeck[quizDeckIndex++];
  document.getElementById('quiz-question').textContent=quizQuestion.sentence;
  document.getElementById('quiz-feedback').textContent='';document.getElementById('quiz-feedback').className='game-feedback';
  renderQuizAnswers();
}
function normalizeAnswer(answer){return normalizeVerb(answer).replace(/\s+/g,' ').trim();}
function checkQuiz(button,answer){
  if(!quizQuestion)return;
  const buttons=[...document.querySelectorAll('#quiz-answers .answer-option')];buttons.forEach(item=>item.disabled=true);
  document.getElementById('written-response').disabled=true;
  const feedback=document.getElementById('quiz-feedback'),correct=normalizeAnswer(answer)===normalizeAnswer(quizQuestion.answer);
  if(correct){button?.classList.add('correct');quizScore++;feedback.textContent=`Oui ! ${quizQuestion.why}`;feedback.className='game-feedback';}
  else{button?.classList.add('wrong');buttons.find(item=>normalizeAnswer(item.textContent)===normalizeAnswer(quizQuestion.answer))?.classList.add('correct');feedback.textContent=`Presque. La bonne forme est « ${quizQuestion.answer} ». ${quizQuestion.why}`;feedback.className='game-feedback incorrect';}
  document.getElementById('quiz-score').textContent=`${quizScore} bonne${quizScore>1?'s':''} réponse${quizScore>1?'s':''}`;
}
const MYSTERIES=[
  {min:0,clue:'Je raconte ce qui se passe maintenant ou une habitude qui continue.',answer:'Présent',choices:['Présent','Futur simple','Passé simple'],why:'On peut dire : « Je joue », « Le soleil se lève ». '},
  {min:2,clue:'Je raconte souvent une habitude, une description ou un décor dans le passé.',answer:'Imparfait',choices:['Passé composé','Imparfait','Futur simple'],why:'Par exemple : « Le vent soufflait et les arbres bougeaient. »'},
  {min:3,clue:'Je présente une action passée comme terminée, souvent avec avoir ou être.',answer:'Passé composé',choices:['Présent','Passé composé','Conditionnel'],why:'Par exemple : « J’ai fermé la porte. »'},
  {min:2,clue:'Je parle d’une action qui n’a pas encore eu lieu.',answer:'Futur simple',choices:['Imparfait','Futur simple','Passé simple'],why:'Par exemple : « Demain, je partirai. »'},
  {min:4,clue:'Je place une action avant une autre action passée.',answer:'Plus-que-parfait',choices:['Imparfait','Plus-que-parfait','Futur antérieur'],why:'Par exemple : « J’avais déjà terminé quand tu es arrivé. »'},
  {min:5,clue:'Dans les récits, je peux faire avancer une action brève et achevée.',answer:'Passé simple',choices:['Imparfait','Présent','Passé simple'],why:'Par exemple : « Le chevalier ouvrit la porte. »'},
  {min:6,clue:'Je peux exprimer une hypothèse, un souhait ou une demande polie.',answer:'Conditionnel présent',choices:['Conditionnel présent','Indicatif présent','Futur simple'],why:'Par exemple : « Je voudrais un indice. »'},
  {min:7,clue:'Je suis souvent employé après une expression de souhait, de doute ou de nécessité.',answer:'Subjonctif présent',choices:['Passé simple','Subjonctif présent','Indicatif futur'],why:'Par exemple : « Il faut que tu sois prêt. »'},
  {min:8,clue:'Je montre qu’une action sera terminée avant un repère futur.',answer:'Futur antérieur',choices:['Futur simple','Futur antérieur','Passé antérieur'],why:'Par exemple : « Dès que tu auras fini, nous partirons. »'},
  {min:9,clue:'Je suis une forme composée très rare, qu’on rencontre surtout dans la littérature.',answer:'Subjonctif plus-que-parfait',choices:['Subjonctif passé','Subjonctif plus-que-parfait','Conditionnel présent'],why:'Par exemple : « Il eût fallu que tu fusses là. »'}
];
function nextMystery(){const items=MYSTERIES.filter(q=>q.min<=classLevel());const item=items[Math.floor(Math.random()*items.length)];document.getElementById('mystery-clue').textContent=item.clue;document.getElementById('mystery-feedback').textContent='';document.getElementById('mystery-feedback').className='game-feedback';const box=document.getElementById('mystery-answers');box.innerHTML='';[...item.choices].sort(()=>Math.random()-.5).forEach(choice=>{const button=document.createElement('button');button.type='button';button.className='answer-option';button.textContent=choice;button.addEventListener('click',()=>{[...box.children].forEach(b=>b.disabled=true);const feedback=document.getElementById('mystery-feedback');if(choice===item.answer){button.classList.add('correct');feedback.textContent=`Trouvé ! ${item.why}`;feedback.className='game-feedback';}else{button.classList.add('wrong');[...box.children].find(b=>b.textContent===item.answer)?.classList.add('correct');feedback.textContent=`C’était « ${item.answer} ». ${item.why}`;feedback.className='game-feedback incorrect';}});box.appendChild(button);});}
function setupStudySettings(){
  const settings={
    level:document.getElementById('quiz-level-select'),topic:document.getElementById('quiz-topic-select'),order:document.getElementById('quiz-order-select'),
    answer:document.getElementById('answer-mode-select'),reading:document.getElementById('reading-size-select'),palette:document.getElementById('palette-select')
  };
  try{const saved=JSON.parse(localStorage.getItem('atelier-settings')||'{}');for(const [key,select] of Object.entries(settings)){if(saved[key]&&select.querySelector(`option[value="${CSS.escape(saved[key])}"]`))select.value=saved[key];}}catch{}
  function apply(){
    document.documentElement.dataset.palette=settings.palette.value;
    document.documentElement.dataset.readingSize=settings.reading.value;
    document.getElementById('settings-note').textContent=settings.order.value==='aleatoire'?'Tirage au sort sans répétition : chaque question du filtre sort une fois avant un nouveau tour.':'Les questions suivent une progression de difficulté.';
    try{localStorage.setItem('atelier-settings',JSON.stringify(Object.fromEntries(Object.entries(settings).map(([key,select])=>[key,select.value]))));}catch{}
  }
  for(const [key,select] of Object.entries(settings))select.addEventListener('change',()=>{apply();if(['level','topic','order'].includes(key))nextQuiz(true);else if(key==='answer'&&quizQuestion)renderQuizAnswers();});
  apply();
}
function setupGames(){
  document.getElementById('next-question').addEventListener('click',()=>nextQuiz());
  document.getElementById('new-mystery').addEventListener('click',nextMystery);
  document.getElementById('check-written-answer').addEventListener('click',()=>checkQuiz(null,document.getElementById('written-response').value));
  nextQuiz();nextMystery();
}

renderTimeCatalog();
setupProfile();
setupConjugueur();
setupStudySettings();
setupGames();
