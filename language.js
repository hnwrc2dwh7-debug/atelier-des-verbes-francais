(() => {
  const QUESTIONS = [
    {id:'a',topic:'orthographe',label:'ORTHOGRAPHE',min:0,prompt:'Dans « Milo ___ trouvé son cahier », choisis la bonne forme.',answer:'a',choices:['a','à','as'],why:'« a » est le verbe avoir : on peut dire « Milo avait trouvé son cahier ».',},
    {id:'a2',topic:'orthographe',label:'ORTHOGRAPHE',min:1,prompt:'« Nous allons ___ la piscine. » Quelle forme faut-il écrire ?',answer:'à',choices:['a','à','as'],why:'Ici, « à » est une préposition. On ne peut pas la remplacer par « avait ».',},
    {id:'sont',topic:'orthographe',label:'ORTHOGRAPHE',min:2,prompt:'« Les enfants ___ dans la cour. »',answer:'sont',choices:['son','sont','sons'],why:'« sont » est le verbe être : on peut dire « les enfants étaient dans la cour ».',},
    {id:'er',topic:'orthographe',label:'ORTHOGRAPHE',min:3,prompt:'« Je vais ___ mon dessin. » Choisis la terminaison correcte.',answer:'terminer',choices:['terminer','terminé','terminait'],why:'Après « vais », le verbe reste à l’infinitif. Essaie le remplacement par « vendre ».',},
    {id:'e',topic:'orthographe',label:'ORTHOGRAPHE',min:4,prompt:'« J’ai ___ mon dessin. » Choisis la terminaison correcte.',answer:'terminé',choices:['terminer','terminé','terminait'],why:'Avec « ai », on forme ici le passé composé : auxiliaire avoir + participe passé « terminé ».',},
    {id:'sujet',topic:'grammaire',label:'GRAMMAIRE',min:0,prompt:'Dans « Le petit chien aboie », quel groupe est sujet ?',answer:'Le petit chien',choices:['Le petit chien','aboie','petit chien aboie'],why:'C’est le groupe qui fait l’action. On demande : « Qui est-ce qui aboie ? »',},
    {id:'nature',topic:'grammaire',label:'GRAMMAIRE',min:2,prompt:'Dans « Elle court rapidement », quelle est la nature de « rapidement » ?',answer:'Un adverbe',choices:['Un nom','Un adjectif','Un adverbe'],why:'« rapidement » précise la manière de courir : c’est un adverbe.',},
    {id:'cod',topic:'grammaire',label:'GRAMMAIRE',min:3,prompt:'Dans « Lina regarde le film », quel groupe est COD ?',answer:'le film',choices:['Lina','regarde','le film'],why:'Lina regarde quoi ? « le film » : le groupe complète directement le verbe.',},
    {id:'nature-fonction',topic:'grammaire',label:'GRAMMAIRE',min:5,prompt:'La nature d’un mot indique surtout…',answer:'ce qu’il est',choices:['ce qu’il est','sa place dans le texte','le nombre de syllabes'],why:'Nom, verbe, adjectif… donnent la nature. Sujet ou COD… indiquent une fonction.',},
    {id:'synonyme',topic:'vocabulaire',label:'VOCABULAIRE',min:0,prompt:'Quel mot est le plus proche de « joyeux » ?',answer:'heureux',choices:['heureux','minuscule','bruyant'],why:'« Heureux » et « joyeux » ont un sens proche : ce sont des synonymes dans beaucoup de contextes.',},
    {id:'contraire',topic:'vocabulaire',label:'VOCABULAIRE',min:2,prompt:'Quel est le contraire de « visible » ?',answer:'invisible',choices:['visiblement','invisible','vision'],why:'Le préfixe « in- » marque ici le contraire : « invisible » signifie qu’on ne peut pas voir.',},
    {id:'prefixe',topic:'vocabulaire',label:'VOCABULAIRE',min:3,prompt:'Dans « relire », que signifie le préfixe « re- » ?',answer:'faire encore une fois',choices:['faire encore une fois','faire moins','faire sans'],why:'Dans ce mot, « re- » indique qu’on lit de nouveau.',},
    {id:'famille',topic:'vocabulaire',label:'VOCABULAIRE',min:4,prompt:'Quel mot appartient à la famille de « jardin » ?',answer:'jardinier',choices:['jardinier','journée','jaune'],why:'« Jardin » et « jardinier » partagent le même radical et une partie de leur sens.',},
    {id:'verbe',topic:'phrase',label:'PHRASE & ANALYSE',min:1,prompt:'Dans « Les élèves écrivent une lettre », quel est le verbe conjugué ?',answer:'écrivent',choices:['élèves','écrivent','lettre'],why:'Le verbe conjugué indique l’action et varie avec le sujet : « ils écrivent ».',},
    {id:'propositions',topic:'phrase',label:'PHRASE & ANALYSE',min:5,prompt:'Combien de verbes conjugués y a-t-il dans « Quand la cloche sonne, les élèves sortent » ?',answer:'Deux',choices:['Un','Deux','Trois'],why:'« sonne » et « sortent » sont deux verbes conjugués : la phrase contient deux propositions.',},
    {id:'cause',topic:'phrase',label:'PHRASE & ANALYSE',min:6,prompt:'Dans « Je prends mon manteau parce qu’il fait froid », « parce que » introduit…',answer:'une cause',choices:['une cause','une opposition','une conséquence'],why:'« Parce qu’il fait froid » explique la raison de l’action : c’est la cause.',},
    {id:'question',topic:'ecriture',label:'ÉCRITURE',min:0,prompt:'Quel signe termine normalement une question directe ?',answer:'?',choices:['.','?','!'],why:'Une question directe se termine par un point d’interrogation.',},
    {id:'opposition',topic:'ecriture',label:'ÉCRITURE',min:3,prompt:'Quel connecteur annonce une opposition ?',answer:'pourtant',choices:['pourtant','parce que','donc'],why:'« Pourtant » indique un contraste ou une opposition entre deux idées.',},
    {id:'consequence',topic:'ecriture',label:'ÉCRITURE',min:4,prompt:'Quel connecteur peut introduire une conséquence ?',answer:'donc',choices:['d’abord','donc','pourtant'],why:'« Donc » peut introduire le résultat ou la conséquence d’une idée.',},
    {id:'indice-lecture',topic:'lecture',label:'LECTURE & TEXTES',min:2,prompt:'Lis : « À la nuit tombée, Mila alluma sa lampe. » À quel moment se passe la scène ?',answer:'Le soir',choices:['Le matin','Le soir','À midi'],why:'« À la nuit tombée » donne un indice de temps : la scène se déroule le soir.',}
  ];

  const questionNode = document.getElementById('language-question');
  const answersNode = document.getElementById('language-answers');
  const feedbackNode = document.getElementById('language-feedback');
  const topicSelect = document.getElementById('language-topic-select');
  const levelSelect = document.getElementById('quiz-level-select');
  const scoreNode = document.getElementById('language-score');
  const labelNode = document.getElementById('language-topic-label');
  const nextButton = document.getElementById('next-language-question');
  if (!questionNode || !answersNode || !feedbackNode || !topicSelect || !nextButton) return;

  let score = 0;
  let deck = [];
  let used = new Set();
  let deckSignature = '';
  let currentQuestion = null;

  function currentRange() {
    const selected = levelSelect?.value || 'auto';
    if (selected === 'base') return {min:0,max:4};
    if (selected === 'intermediaire') return {min:2,max:7};
    if (selected === 'avance') return {min:5,max:9};
    return {min:0,max:typeof window.classLevel === 'function' ? window.classLevel() : 4};
  }

  function availableQuestions() {
    const topic = topicSelect.value;
    const range = currentRange();
    return QUESTIONS.filter(question => question.min >= range.min && question.min <= range.max && (topic === 'tous' || question.topic === topic));
  }

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function signature() {
    return `${topicSelect.value}|${levelSelect?.value || 'auto'}|${JSON.stringify(currentRange())}`;
  }

  function setQuestion(question) {
    currentQuestion = question;
    questionNode.textContent = question.prompt;
    labelNode.textContent = question.label;
    feedbackNode.textContent = '';
    feedbackNode.className = 'language-feedback';
    answersNode.replaceChildren();
    shuffle(question.choices).forEach(choice => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-option';
      button.textContent = choice;
      button.addEventListener('click', () => checkAnswer(button, choice));
      answersNode.appendChild(button);
    });
  }

  function nextQuestion(reset = false) {
    const currentSignature = signature();
    if (reset || currentSignature !== deckSignature) {
      deck = shuffle(availableQuestions());
      used = new Set();
      deckSignature = currentSignature;
    }
    if (!deck.length) {
      currentQuestion = null;
      questionNode.textContent = 'Aucune question ne correspond à ce réglage.';
      answersNode.replaceChildren();
      labelNode.textContent = 'FRANÇAIS';
      feedbackNode.textContent = '';
      return;
    }
    let remaining = deck.filter(question => !used.has(question.id));
    if (!remaining.length) {
      deck = shuffle(availableQuestions());
      used = new Set();
      remaining = deck;
    }
    const question = remaining[0];
    used.add(question.id);
    setQuestion(question);
  }

  function checkAnswer(button, answer) {
    if (!currentQuestion) return;
    [...answersNode.children].forEach(item => { item.disabled = true; });
    const correct = answer === currentQuestion.answer;
    if (correct) {
      button.classList.add('correct');
      score += 1;
      feedbackNode.textContent = `Oui ! ${currentQuestion.why}`;
      feedbackNode.classList.add('is-correct');
    } else {
      button.classList.add('wrong');
      [...answersNode.children].find(item => item.textContent === currentQuestion.answer)?.classList.add('correct');
      feedbackNode.textContent = `La bonne réponse est « ${currentQuestion.answer} ». ${currentQuestion.why}`;
      feedbackNode.classList.add('is-incorrect');
    }
    if (scoreNode) scoreNode.textContent = `${score} bonne${score > 1 ? 's' : ''} réponse${score > 1 ? 's' : ''}`;
  }

  try {
    const saved = localStorage.getItem('atelier-language-topic');
    if (saved && topicSelect.querySelector(`option[value="${CSS.escape(saved)}"]`)) topicSelect.value = saved;
  } catch {}
  topicSelect.addEventListener('change', () => {
    try { localStorage.setItem('atelier-language-topic', topicSelect.value); } catch {}
    nextQuestion(true);
  });
  levelSelect?.addEventListener('change', () => nextQuestion(true));
  document.getElementById('class-select')?.addEventListener('change', () => nextQuestion(true));
  document.getElementById('age-select')?.addEventListener('change', () => nextQuestion(true));
  nextButton.addEventListener('click', () => nextQuestion());
  nextQuestion(true);
})();
