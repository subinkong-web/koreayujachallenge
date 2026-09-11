/* 좁은 화면에서 머리글 메뉴를 여닫는다.
   언어 버튼은 메뉴 안에 숨기지 않고 머리글에 꺼내 둔다.
   외국 참가자가 첫 화면에서 바로 제 언어를 고를 수 있어야 한다. */
(function () {
  var btn = document.getElementById('menubtn');
  var nav = document.getElementById('nav');
  if (!btn || !nav) return;
  var header = btn.parentElement;
  var lang = nav.querySelector('.lang');
  var narrow = null;   // 지금 언어 버튼이 머리글에 나와 있는가

  function setOpen(on) {
    nav.classList.toggle('open', on);
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-expanded', on ? 'true' : 'false');
  }

  // 화면 폭에 따라 언어 버튼 자리를 옮긴다
  function placeLang() {
    if (!lang) return;
    var isNarrow = innerWidth <= 900;
    if (isNarrow === narrow) return;
    narrow = isNarrow;
    if (isNarrow) { header.insertBefore(lang, btn); lang.classList.add('inhead'); }
    else          { nav.appendChild(lang);          lang.classList.remove('inhead'); }
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!nav.classList.contains('open'));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== btn) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  addEventListener('resize', function () {
    if (innerWidth > 900) setOpen(false);
    placeLang();
  });

  placeLang();
})();

/* 메일 양식 복사.
   navigator.clipboard 는 https 에서만 동작한다. 그렇지 않은 곳에서도 되도록
   옛 방식을 뒤에 둔다. 버튼에 적힌 말을 그대로 쓰므로 언어판마다 제 말이 나온다. */
(function () {
  var btn = document.getElementById('cp');
  var box = document.getElementById('form');
  if (!btn || !box) return;

  function flash(msg) {
    var keep = btn.textContent;
    btn.textContent = msg;
    setTimeout(function () { btn.textContent = keep; }, 1800);
  }

  function oldWay(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  // 복사가 막히면 양식을 선택해 주고, 직접 복사하라고 알린다.
  // 아무 일도 일어나지 않는 버튼이 제일 나쁘다.
  function failed() {
    var sel = getSelection(), r = document.createRange();
    r.selectNodeContents(box);
    sel.removeAllRanges(); sel.addRange(r);
    flash(btn.getAttribute('data-manual') || 'Select and copy');
  }

  btn.addEventListener('click', function () {
    var text = box.innerText;
    var done = btn.getAttribute('data-done') || 'OK';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function () { flash(done); })
        .catch(function () { if (oldWay(text)) flash(done); else failed(); });
    } else {
      if (oldWay(text)) flash(done); else failed();
    }
  });
})();
