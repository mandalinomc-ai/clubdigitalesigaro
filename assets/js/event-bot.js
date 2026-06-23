(function () {
  'use strict';

  var BUSINESS_NUMBER = '393483470654';

  var STEPS = [
    {
      id: 'tipo',
      bot: 'Benvenuto nel configuratore eventi Club Digitale. Che tipo di evento stai organizzando?',
      options: [
        'Matrimonio',
        'Corporate / Business',
        'Serata privata in salotto',
        'Degustazione distillati',
        'Fiera / Roadshow',
        'Anniversario o gala',
        'Altro',
        'Non lo so',
      ],
    },
    {
      id: 'ospiti',
      bot: 'Quanti ospiti circa prevedi?',
      options: ['Fino a 30', '30 – 80', '80 – 150', '150+', 'Non lo so'],
    },
    {
      id: 'budget',
      bot: 'Budget indicativo per l\'allestimento (sigari, spirits, accessori)?',
      options: [
        'Essential · fino a €1.500',
        'Prestige · €1.500 – 4.000',
        'Signature · €4.000 – 8.000',
        'Bespoke · oltre €8.000',
        'Da definire insieme',
        'Non lo so',
      ],
    },
    {
      id: 'sigari',
      bot: 'Preferenze sul corner sigari / humidor?',
      options: [
        'Sì — alta gamma e selezione premium',
        'Sì — selezione equilibrata',
        'Solo corner informativo',
        'No corner sigari',
        'Non lo so',
      ],
    },
    {
      id: 'distillati',
      bot: 'Quali distillati vorresti in evidenza?',
      options: [
        'Whisky / Bourbon',
        'Rum & Cognac',
        'Amari e rosoli',
        'Champagne & bollicine',
        'Mix premium su misura',
        'Non lo so',
      ],
    },
    {
      id: 'accessori',
      bot: 'Accessori e abbinamenti desiderati?',
      options: [
        'Humidor da tavolo',
        'Cioccolato fondente',
        'Candele & fiammiferi premium',
        'Calici cristallo',
        'Kit completo lounge',
        'Non lo so',
      ],
    },
    {
      id: 'extra',
      bot: 'Servizi digitali e supporto extra?',
      options: [
        'Landing page RSVP',
        'CRM ospiti VIP',
        'Reel / contenuti social',
        'Specialist in loco',
        'Solo allestimento fisico',
        'Non lo so',
      ],
    },
    {
      id: 'timing',
      bot: 'Quando avrebbe luogo l\'evento?',
      options: [
        'Entro 1 mese',
        '1 – 3 mesi',
        '3 – 6 mesi',
        'Oltre 6 mesi',
        'Data da definire',
        'Non lo so',
      ],
    },
    {
      id: 'citta',
      bot: 'In quale città o zona si terrà?',
      type: 'text',
      placeholder: 'Es. Milano, Roma, Firenze...',
    },
    {
      id: 'contatto',
      bot: 'Ultimo passo: come possiamo ricontattarti?',
      type: 'contact',
    },
  ];

  var LABELS = {
    tipo: 'Tipo evento',
    ospiti: 'Ospiti',
    budget: 'Budget',
    sigari: 'Corner sigari',
    distillati: 'Distillati',
    accessori: 'Accessori',
    extra: 'Servizi extra',
    timing: 'Timing',
    citta: 'Città',
    contatto: 'Contatto',
  };

  var panel = document.getElementById('event-bot-panel');
  var fab = document.getElementById('event-bot-fab');
  var messagesEl = document.getElementById('event-bot-messages');
  var optionsEl = document.getElementById('event-bot-options');
  var inputWrap = document.getElementById('event-bot-input-wrap');
  var progressEl = document.getElementById('event-bot-progress');
  var closeBtn = document.getElementById('event-bot-close');

  if (!panel || !fab || !messagesEl || !optionsEl) return;

  var open = false;
  var stepIndex = 0;
  var answers = {};
  var history = [];

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function updateProgress() {
    if (!progressEl) return;
    var pct = Math.min(100, Math.round((stepIndex / STEPS.length) * 100));
    progressEl.style.width = pct + '%';
  }

  function addBubble(text, type) {
    var div = document.createElement('div');
    div.className = type === 'user' ? 'event-bot-bubble event-bot-bubble--user' : 'event-bot-bubble event-bot-bubble--bot';
    div.textContent = text;
    messagesEl.appendChild(div);
    scrollBottom();
  }

  function buildWhatsAppMessage() {
    var lines = ['Ciao! Ho configurato il mio evento con Club Digitale:', ''];
    STEPS.forEach(function (step) {
      var val = answers[step.id];
      if (!val) return;
      if (step.id === 'contatto') {
        lines.push(LABELS.contatto + ': ' + (val.nome || '') + ' · ' + (val.tel || ''));
      } else {
        lines.push((LABELS[step.id] || step.id) + ': ' + val);
      }
    });
    lines.push('', 'Attendo un preventivo / consulenza gratuita.');
    return lines.join('\n');
  }

  function showDone() {
    optionsEl.innerHTML = '';
    inputWrap.innerHTML = '';
    inputWrap.classList.add('hidden');

    addBubble(
      'Perfetto! Abbiamo tutto per prepararti una proposta su misura. Invia il riepilogo su WhatsApp o torna alla sezione Eventi.',
      'bot'
    );

    var wa = document.createElement('a');
    wa.href = 'https://wa.me/' + BUSINESS_NUMBER + '?text=' + encodeURIComponent(buildWhatsAppMessage());
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.className = 'event-bot-wa-btn';
    wa.textContent = '💬 Invia su WhatsApp';

    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'event-bot-secondary-btn';
    reset.textContent = '↺ Ricomincia';
    reset.addEventListener('click', function () {
      answers = {};
      stepIndex = 0;
      messagesEl.innerHTML = '';
      history = [];
      renderStep();
    });

    var anchor = document.createElement('a');
    anchor.href = '#eventi';
    anchor.className = 'event-bot-secondary-btn';
    anchor.textContent = 'Vedi sezione Eventi';
    anchor.addEventListener('click', function () { setOpen(false); });

    optionsEl.appendChild(wa);
    optionsEl.appendChild(reset);
    optionsEl.appendChild(anchor);
    updateProgress();
    progressEl.style.width = '100%';
  }

  function advance(answerText, rawValue) {
    var step = STEPS[stepIndex];
    answers[step.id] = rawValue !== undefined ? rawValue : answerText;
    addBubble(answerText, 'user');
    stepIndex += 1;
    if (stepIndex >= STEPS.length) {
      showDone();
      return;
    }
    renderStep();
  }

  function renderStep() {
    updateProgress();
    optionsEl.innerHTML = '';
    inputWrap.innerHTML = '';
    inputWrap.classList.remove('hidden');

    var step = STEPS[stepIndex];
    if (!step) { showDone(); return; }

    addBubble(step.bot, 'bot');

    if (step.type === 'text') {
      var field = document.createElement('input');
      field.type = 'text';
      field.className = 'event-bot-text-input';
      field.placeholder = step.placeholder || '';
      field.id = 'event-bot-text-field';

      var row = document.createElement('div');
      row.className = 'event-bot-input-row';

      var go = document.createElement('button');
      go.type = 'button';
      go.className = 'event-bot-option-btn event-bot-option-btn--primary';
      go.textContent = 'Continua';
      go.addEventListener('click', function () {
        var v = field.value.trim() || 'Non lo so';
        advance(v);
      });

      var unk = document.createElement('button');
      unk.type = 'button';
      unk.className = 'event-bot-option-btn';
      unk.textContent = 'Non lo so';
      unk.addEventListener('click', function () { advance('Non lo so'); });

      row.appendChild(field);
      row.appendChild(go);
      optionsEl.appendChild(row);
      optionsEl.appendChild(unk);
      inputWrap.appendChild(document.createComment(''));
      setTimeout(function () { field.focus(); }, 80);
      return;
    }

    if (step.type === 'contact') {
      inputWrap.classList.add('hidden');
      var nome = document.createElement('input');
      nome.type = 'text';
      nome.className = 'event-bot-text-input';
      nome.placeholder = 'Nome e cognome *';
      nome.id = 'event-bot-nome';

      var tel = document.createElement('input');
      tel.type = 'tel';
      tel.className = 'event-bot-text-input';
      tel.placeholder = 'Telefono / WhatsApp *';
      tel.id = 'event-bot-tel';

      var send = document.createElement('button');
      send.type = 'button';
      send.className = 'event-bot-option-btn event-bot-option-btn--primary';
      send.textContent = 'Completa configurazione';
      send.addEventListener('click', function () {
        if (!nome.value.trim() || !tel.value.trim()) {
          addBubble('Inserisci nome e telefono per procedere, oppure usa WhatsApp diretto.', 'bot');
          return;
        }
        advance(nome.value.trim() + ' · ' + tel.value.trim(), { nome: nome.value.trim(), tel: tel.value.trim() });
      });

      optionsEl.appendChild(nome);
      optionsEl.appendChild(tel);
      optionsEl.appendChild(send);
      return;
    }

    inputWrap.classList.add('hidden');
    step.options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'event-bot-option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', function () { advance(opt); });
      optionsEl.appendChild(btn);
    });
  }

  function setOpen(value) {
    open = value;
    panel.classList.toggle('event-bot-panel--open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && messagesEl.childElementCount === 0) renderStep();
    if (open) scrollBottom();
  }

  fab.addEventListener('click', function () { setOpen(!open); });
  closeBtn && closeBtn.addEventListener('click', function () { setOpen(false); });

  document.querySelectorAll('[data-open-event-bot]').forEach(function (btn) {
    btn.addEventListener('click', function () { setOpen(true); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) setOpen(false);
  });
})();
