(function () {
  var STORAGE_KEY = 'hedone_cookie_notice_v1';
  var EXPIRY_MS = 365 * 24 * 60 * 60 * 1000; // ricompare dopo 12 mesi
  var notice = document.getElementById('cookieNotice');
  if (!notice) return;
  var btn = document.getElementById('cookieNoticeBtn');

  try {
    var seenAt = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (seenAt && (Date.now() - seenAt) < EXPIRY_MS) return;
  } catch (e) {
    return;
  }

  setTimeout(function () {
    notice.classList.add('is-visible');
  }, 900);

  btn.addEventListener('click', function () {
    notice.classList.remove('is-visible');
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
  });
})();
