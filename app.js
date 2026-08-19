const data = window.STUDY_DATA || [];
const S = JSON.parse(localStorage.koreanStudyProgress || '{"known":[],"studied":0,"correct":0,"incorrect":0}');
let deck = [...data], i = 0, revealed = false, answered = false;
const $ = x => document.getElementById(x);

$('total').textContent = data.length;
[...new Set(data.flatMap(x => x.tags))].sort().forEach(t => $('filter').append(new Option(t, t)));

function save() {
  localStorage.koreanStudyProgress = JSON.stringify(S);
  stats();
}

function stats() {
  const a = S.studied ? Math.round(S.correct / S.studied * 100) : 0;
  $('known').textContent = S.known.length;
  $('accuracy').textContent = a + '%';
  $('studied').textContent = S.studied;
  $('correct').textContent = S.correct;
  $('incorrect').textContent = S.incorrect;
  $('paccuracy').textContent = a + '%';
  $('bar').style.width = a + '%';
}

function c() { return deck[i % deck.length]; }

function play() {
  const f = c().audio?.[0];
  if (f) new Audio('audio/' + encodeURIComponent(f)).play().catch(() => {});
}

function normalize(s) {
  return (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function render() {
  if (!deck.length) return;
  const x = c(), m = $('mode').value;
  $('tag').textContent = (x.tags[0] || 'VOCABULARY').toUpperCase();
  if (m === 'en-kr' || m === 'type') {
    $('prompt').textContent = x.english;
  } else if (m === 'listen') {
    $('prompt').textContent = '🔊 Listen and identify';
  } else {
    $('prompt').textContent = x.korean;
  }
  $('answer').textContent = (m === 'en-kr' || m === 'type') ? x.korean : x.english;
  $('answer').classList.add('hidden');
  $('typing').classList.toggle('hidden', m !== 'type');
  $('typing').value = '';
  $('typing').classList.remove('correct', 'wrong');
  $('result').textContent = '';
  $('result').className = '';
  $('reveal').textContent = m === 'type' ? 'Check answer' : 'Reveal answer';
  $('wrong').disabled = $('right').disabled = true;
  revealed = answered = false;
  if (m === 'listen') setTimeout(play, 200);
  if (m === 'type') setTimeout(() => $('typing').focus(), 50);
}

function checkTyping() {
  if ($('mode').value !== 'type' || revealed) return;
  const typed = $('typing').value;
  const ok = normalize(typed) === normalize(c().korean);
  $('result').textContent = ok ? '✓ Correct!' : '✕ Try again or reveal';
  $('result').className = ok ? 'ok' : 'bad';
  $('typing').classList.toggle('correct', ok);
  $('typing').classList.toggle('wrong', !ok);
  if (ok) {
    $('answer').classList.remove('hidden');
    revealed = true;
    $('wrong').disabled = $('right').disabled = false;
    // auto rate correct after short delay if user wants
  }
}

function reveal() {
  if ($('mode').value === 'type' && !revealed) {
    checkTyping();
    // if still not correct, force show answer
    if (!revealed) {
      const ok = normalize($('typing').value) === normalize(c().korean);
      $('result').textContent = ok ? '✓ Correct!' : '✕ Answer: ' + c().korean;
      $('result').className = ok ? 'ok' : 'bad';
      $('answer').classList.remove('hidden');
      $('typing').classList.add(ok ? 'correct' : 'wrong');
      revealed = true;
      $('wrong').disabled = $('right').disabled = false;
    }
  } else {
    $('answer').classList.remove('hidden');
    revealed = true;
    $('wrong').disabled = $('right').disabled = false;
  }
}

function rate(ok) {
  if (!revealed || answered) return;
  answered = true;
  S.studied++;
  if (ok) {
    S.correct++;
    if (!S.known.includes(c().id)) S.known.push(c().id);
  } else {
    S.incorrect++;
  }
  save();
  i = Math.floor(Math.random() * deck.length);
  render();
}

$('reveal').onclick = reveal;
$('audioBtn').onclick = play;
$('right').onclick = () => rate(true);
$('wrong').onclick = () => rate(false);
$('shuffle').onclick = () => { deck.sort(() => Math.random() - 0.5); i = 0; render(); };
$('mode').onchange = render;
$('filter').onchange = () => {
  const t = $('filter').value;
  deck = t === 'all' ? [...data] : data.filter(x => x.tags.includes(t));
  i = 0;
  render();
};

$('typing').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (!revealed) {
      checkTyping();
      // if correct, allow Enter again to mark Got it
      if (revealed) rate(true);
    } else {
      rate(true);
    }
  }
});

document.onkeydown = e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') { e.preventDefault(); reveal(); }
  if (e.key === '1') rate(false);
  if (e.key === '2') rate(true);
  if (e.key.toLowerCase() === 'a') play();
};

document.querySelectorAll('nav button').forEach(b => b.onclick = () => {
  document.querySelectorAll('nav button').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
  $(b.dataset.view).classList.add('active');
  if (b.dataset.view === 'browse') list();
});

function list() {
  const q = $('search').value.toLowerCase();
  $('list').innerHTML = data
    .filter(x => (x.korean + ' ' + x.english).toLowerCase().includes(q))
    .map(x => `<div class=item><div class=kr>${x.korean}</div><div class=en>${x.english}</div>${x.audio?.[0] ? `<button onclick="new Audio('audio/${encodeURIComponent(x.audio[0])}').play()">🔊 Listen</button>` : ''}</div>`)
    .join('');
}
$('search').oninput = list;
$('reset').onclick = () => {
  S.known = [];
  S.studied = S.correct = S.incorrect = 0;
  save();
};

stats();
render();
