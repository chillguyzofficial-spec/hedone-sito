(function () {
  var STORAGE_KEY = 'hedone_cookie_notice_v1';
  var notice = document.getElementById('cookieNotice');
  if (!notice) return;
  var btn = document.getElementById('cookieNoticeBtn');

  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
  } catch (e) {
    return;
  }

  setTimeout(function () {
    notice.classList.add('is-visible');
  }, 900);

  btn.addEventListener('click', function () {
    notice.classList.remove('is-visible');
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  });
})();
