/* Quando la riga legale del footer entra nello schermo, i pulsanti fissi WhatsApp e Chiamaci
   si nascondono (nel footer ci sono già gli stessi contatti): così sotto il footer non serve
   nessuno spazio vuoto per non coprire il testo. */
(function () {
  var legal = document.querySelector('.footer-legal');
  if (!legal || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (entries) {
    document.body.classList.toggle('footer-in-vista', entries[0].isIntersecting);
  }, { threshold: 0 }).observe(legal);
})();
