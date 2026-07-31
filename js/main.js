(function () {
  "use strict";

  /* ---------- NAV: trigger circolare (hover su desktop via CSS, tap su touch via JS) ---------- */
  var navFloat = document.getElementById("navFloat");
  var navTrigger = document.getElementById("navTrigger");
  var navPanel = document.getElementById("navPanel");

  if (navFloat && navTrigger && navPanel) {
    navTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = navFloat.classList.toggle("is-open");
      navTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen) navFloat.classList.remove("is-compact");
    });

    document.addEventListener("click", function (e) {
      if (!navFloat.contains(e.target)) {
        navFloat.classList.remove("is-open");
        navTrigger.setAttribute("aria-expanded", "false");
      }
    });

    navPanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navFloat.classList.remove("is-open");
        navTrigger.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navFloat.classList.contains("is-open")) {
        navFloat.classList.remove("is-open");
        navTrigger.setAttribute("aria-expanded", "false");
        navTrigger.focus();
      }
    });

    /* Comprime il pill a icona scorrendo verso il basso (solo mobile) — libera il testo sotto */
    var navLastY = window.scrollY;
    var navTicking = false;
    var navIsMobile = function () { return window.matchMedia("(max-width: 640px)").matches; };
    var updateNavCompact = function () {
      var y = window.scrollY;
      if (!navIsMobile() || navFloat.classList.contains("is-open")) {
        navFloat.classList.remove("is-compact");
      } else if (y < 80) {
        navFloat.classList.remove("is-compact");
      } else if (y - navLastY > 4) {
        navFloat.classList.add("is-compact");
      } else if (y - navLastY < -4) {
        navFloat.classList.remove("is-compact");
      }
      navLastY = y;
      navTicking = false;
    };
    window.addEventListener("scroll", function () {
      if (!navTicking) {
        window.requestAnimationFrame(updateNavCompact);
        navTicking = true;
      }
    }, { passive: true });
  }

  /* ---------- HERO VIDEO: ferma il loop se l'utente preferisce meno movimento ---------- */
  var heroBg = document.getElementById("heroBg");
  if (heroBg && heroBg.tagName === "VIDEO" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroBg.pause();
    heroBg.removeAttribute("autoplay");
  }

  /* ---------- ABOUT BG VIDEO: due copie sfalsate, dissolvenza incrociata ----------
     La clip non è girata per un loop perfetto: un riavvolgimento nativo è pulito ma
     mostra comunque un piccolo scatto di contenuto ogni ciclo. Soluzione: due <video>
     identici, sfalsati di mezza durata, entrambi in loop nativo (nessun seek manuale,
     quindi nessun singhiozzo). A ogni istante, quello dei due che sta per riavvolgersi
     viene reso trasparente mentre l'altro — a metà del proprio ciclo — resta in vista. */
  (function () {
    var vA = document.getElementById("aboutBgVideoA");
    var vB = document.getElementById("aboutBgVideoB");
    if (!vA || !vB) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      vA.pause(); vA.removeAttribute("autoplay");
      vB.pause(); vB.removeAttribute("autoplay");
      return;
    }

    var offsetDone = false;
    var fadeWindow = 0.5; // secondi di dissolvenza a cavallo del punto di loop

    function trySetOffset() {
      if (offsetDone && vA.duration) return;
      if (vA.duration) {
        vB.currentTime = vA.duration / 2;
        offsetDone = true;
      }
    }
    vA.addEventListener("loadedmetadata", trySetOffset);
    if (vA.readyState >= 1) trySetOffset();

    function fadeFactor(v) {
      if (!v.duration) return 1;
      var dist = Math.min(v.currentTime, v.duration - v.currentTime);
      return dist >= fadeWindow ? 1 : Math.max(0, dist / fadeWindow);
    }

    function tick() {
      if (offsetDone) {
        vA.style.opacity = fadeFactor(vA);
        vB.style.opacity = fadeFactor(vB);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- REVEAL ON SCROLL (fallback per browser senza animation-timeline) ---------- */
  var supportsScrollTimeline = CSS && CSS.supports && CSS.supports("animation-timeline: view()");

  if (!supportsScrollTimeline) {
    var revealEls = document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* ---------- LOCATION: meander glow che segue il mouse ---------- */
  var locationSection = document.querySelector(".location");
  if (locationSection) {
    locationSection.addEventListener("mousemove", function (e) {
      var rect = locationSection.getBoundingClientRect();
      locationSection.style.setProperty("--mx", ((e.clientX - rect.left) / rect.width * 100) + "%");
      locationSection.style.setProperty("--my", ((e.clientY - rect.top) / rect.height * 100) + "%");
    });
  }

  /* ---------- CARD BEIGE: glow ambrato che segue il mouse ---------- */
  [".location-info", ".distance-calc"].forEach(function (sel) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.addEventListener("mousemove", function (e) {
      var rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - rect.left) / rect.width * 100) + "%");
      el.style.setProperty("--my", ((e.clientY - rect.top) / rect.height * 100) + "%");
    });
  });

  /* ---------- CHI SIAMO: alone dorato che segue il mouse ---------- */
  var aboutSection = document.querySelector(".about");
  if (aboutSection) {
    aboutSection.addEventListener("mousemove", function (e) {
      var rect = aboutSection.getBoundingClientRect();
      var mx = ((e.clientX - rect.left) / rect.width) * 100;
      var my = ((e.clientY - rect.top) / rect.height) * 100;
      aboutSection.style.setProperty("--mx", mx + "%");
      aboutSection.style.setProperty("--my", my + "%");
    });
    aboutSection.addEventListener("mouseenter", function () {
      aboutSection.classList.add("is-active");
    });
    aboutSection.addEventListener("mouseleave", function () {
      aboutSection.classList.remove("is-active");
    });
  }

  /* ---------- EPIGRAFE A PERGAMENA: hover su desktop, tap su touch ---------- */
  var mythEpigraph = document.querySelector(".myth-epigraph");
  if (mythEpigraph) {
    mythEpigraph.addEventListener("click", function () {
      var isOpen = mythEpigraph.classList.toggle("is-open");
      mythEpigraph.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  /* ---------- SOMMELIER DIGITALE: abbinamento piatto per piatto, cantina reale Hedoné ---------- */

  /* Storie e informazioni per ogni etichetta della cantina */
  var wineDb = {
    "Valdobbiadene Prosecco Spago — Mionetto": {
      tier: 1, uva: "Glera", zona: "Valdobbiadene DOCG, Veneto",
      storia: "Mionetto nasce nel 1887 sulle colline trevigiane Patrimonio UNESCO, dove la Glera cresce su pendii ripidissimi con radici antiche di oltre un secolo. La vinificazione in autoclave a temperatura controllata preserva i profumi floreali e la freschezza che hanno reso questo Prosecco Superiore il calice dell'aperitivo italiano nel mondo."
    },
    "Franciacorta Pas Opéré — Bellavista": {
      tier: 2, uva: "Chardonnay, Pinot Nero, Pinot Bianco", zona: "Franciacorta DOCG, Lombardia",
      storia: "Bellavista nasce nel 1977 quando Vittorio Moretti acquisì le colline moreniche tra Brescia e il lago d'Iseo. Il Pas Opéré — dosaggio zero, senza liqueur d'expédition — è il Franciacorta nella forma più pura: solo vino, bollicine fini del metodo classico e il minerale dei suoli che le glaciazioni pleistoceniche hanno lasciato in questa striscia di Lombardia."
    },
    "Cerasuolo d'Abruzzo": {
      tier: 1, uva: "Montepulciano d'Abruzzo", zona: "Abruzzo DOC",
      storia: "Il nome viene dal dialetto: 'cerasa' è la ciliegia, e il colore di questo rosato è esattamente quello. Nasce dallo stesso vitigno del grande rosso abruzzese ma vinificato con contatto brevissimo sulle bucce, come un bianco. È uno dei pochi rosati italiani con una tradizione documentata di secoli, testimone della viticoltura adriatica."
    },
    "Franciacorta Rosé — Bellavista": {
      tier: 2, uva: "Pinot Nero, Chardonnay", zona: "Franciacorta DOCG, Lombardia",
      storia: "Il Rosé di Bellavista è uno dei Franciacorta più riconoscibili: Pinot Nero in prevalenza, affinato almeno 24 mesi sui lieviti in metodo classico. Il colore cambia leggermente di annata in annata — dal rame al salmone — riflettendo la maturità del Pinot Nero in quella specifica vendemmia. Emblema di una Franciacorta che compete con lo Champagne."
    },
    "Chianti Classico": {
      tier: 2, uva: "Sangiovese", zona: "Chianti Classico DOCG, Toscana",
      storia: "Il Gallo Nero è il simbolo della Lega del Chianti, una confederazione medievale tra Firenze e Siena che controllava questo territorio. La zona tra Greve, Radda, Gaiole e Castellina è la patria del Sangiovese nella versione più elegante: acidità viva, ciliegia fresca, un filo di tabacco nelle versioni più mature. Un territorio di produzione ininterrotta da oltre settecento anni."
    },
    "Amarone della Valpolicella": {
      tier: 3, uva: "Corvina, Rondinella, Molinara", zona: "Valpolicella DOCG, Veneto",
      storia: "L'Amarone è nato per errore: un Recioto dolce lasciato fermentare troppo a lungo divenne secco, potente, 'amaro'. Le uve vengono essiccate 90-120 giorni su graticci di legno nei 'fruttai' delle ville veronesi, perdendo il 30-40% del peso. Il risultato: 15-17% di alcol, frutto maturissimo, cioccolato fondente, vino pensato per invecchiare decenni."
    },
    "Alta Langa Brut Blanc de Blancs — Giulio Cocchi": {
      tier: 2, uva: "Chardonnay", zona: "Alta Langa DOCG, Piemonte",
      storia: "Giulio Cocchi aprì la sua bottega ad Asti nel 1891, diventando famoso per il Barolo Chinato ancora prodotto oggi. L'Alta Langa è la risposta piemontese al grande Champagne: metodo classico da solo Chardonnay, sulle Langhe alte dove il clima fresco preserva acidità e mineralità. La DOCG esiste dal 2002: il progetto ambizioso di produrre il miglior spumante italiano in casa del Nebbiolo."
    },
    "Rosso di Montalcino — Banfi": {
      tier: 2, uva: "Brunello (Sangiovese Grosso)", zona: "Montalcino DOC, Toscana",
      storia: "Banfi arrivò a Montalcino nel 1978 da New York, acquisendo l'ex tenuta di Castel Banfi. Il Rosso di Montalcino è il 'fratello minore' del Brunello: stesso vitigno, stesso terroir, ma affinamento più breve — 6 mesi in legno invece di 4 anni. Pronto prima, più immediato, porta già il DNA inconfondibile di questa collina senese."
    },
    "TONÍ Montepulciano d'Abruzzo": {
      tier: 1, uva: "Montepulciano d'Abruzzo", zona: "Controguerra DOC, Abruzzo",
      storia: "TONÍ è il vino di punta di Illuminati, cantina fondata nel 1890 a Controguerra in provincia di Teramo. Il nome richiama il fondatore Dino Illuminati, detto 'Toní' in dialetto locale. Su suoli argilloso-calcarei a 350m slm, il Montepulciano dà vini con struttura, tannino setoso e un frutto scuro che ha reso questa cantina una delle più premiate d'Abruzzo."
    },
    "Malandrino Montepulciano d'Abruzzo": {
      tier: 1, uva: "Montepulciano d'Abruzzo", zona: "Abruzzo DOC",
      storia: "Malandrino — furbo, vivace, un po' brigante — è la bottiglia quotidiana di Illuminati, realizzata con la stessa cura artigianale della famiglia dal 1890. Più accessibile del Toní, porta però lo stesso clima continentale della costa adriatica e lo stesso vitigno che nel 1800 era già famoso in tutta Italia per struttura e colore."
    },
    "Sassicaia": {
      tier: 3, uva: "Cabernet Sauvignon, Cabernet Franc", zona: "Bolgheri Sassicaia DOC, Toscana",
      storia: "Nel 1944, il Marchese Mario Incisa della Rocchetta piantò Cabernet Sauvignon a Bolgheri, convinto che i suoli sassosi ricordassero quelli di Graves a Bordeaux. Per vent'anni fu vino privato. La prima annata commercializzata fu il 1968; nel 1994 fu creata la DOC 'Bolgheri Sassicaia', unica denominazione italiana riservata a un solo produttore. Il vino italiano più famoso nel mondo."
    },
    "Barolo Della Marmora 2021": {
      tier: 2, uva: "Nebbiolo", zona: "Barolo DOCG, Verduno, Piemonte",
      storia: "Castello di Verduno produce il suo Barolo Della Marmora — omaggio al generale Alfonso Ferrero della Marmora — da Nebbiolo di Verduno, la sottozona più settentrionale del Barolo. I suoli elvetici di Verduno regalano un Barolo dal tannino elegante e femminile rispetto alle zone più austere: rose appassite, ciliegia, catrame. Annata 2021, considerata tra le migliori dell'ultimo decennio."
    },
    "Brunello di Montalcino": {
      tier: 3, uva: "Brunello (Sangiovese Grosso)", zona: "Brunello di Montalcino DOCG, Toscana",
      storia: "Clemente Santi, farmacista senese, isolò nel 1860 il clone di Sangiovese che chiamò 'Brunello' per il colore bruno degli acini. Nel 1980, Brunello di Montalcino ricevette la prima DOCG mai assegnata in Italia. Il disciplinare è il più esigente: 5 anni di affinamento dalla vendemmia (6 per la Riserva), di cui 2 obbligatoriamente in botti di rovere. L'espressione più nobile del Sangiovese."
    },
    "Tignanello": {
      tier: 3, uva: "Sangiovese, Cabernet Sauvignon, Cabernet Franc", zona: "Tenuta Tignanello, Toscana",
      storia: "Nel 1971, Piero Antinori e l'enologo Giacomo Tachis sfidarono il sistema: Sangiovese tagliato con Cabernet, affinamento in barrique di rovere francese invece delle grandi botti tradizionali. Lo vendettero come Vino da Tavola perché fuori dal disciplinare. Fu il primo Super Tuscan della storia, e aprì la strada a una rivoluzione qualitativa che cambiò il mercato del vino italiano nel mondo."
    },
    "Il Bruciato — Antinori": {
      tier: 2, uva: "Cabernet Sauvignon, Merlot, Syrah", zona: "Bolgheri DOC, Toscana",
      storia: "La Tenuta Guado al Tasso di Antinori occupa oltre 1.000 ettari sulla costa toscana. 'Il Bruciato' prende il nome da un campo storicamente coperto di macchia mediterranea scura. È la bottiglia d'ingresso della famiglia Bolgheri di Antinori: stessa filosofia del Sassicaia, più immediatezza e una nota mediterranea caratteristica del mare toscano."
    },
    "Aglianico del Vulture — Teodosio Basilisco": {
      tier: 2, uva: "Aglianico", zona: "Aglianico del Vulture DOC, Basilicata",
      storia: "Il Monte Vulture è un vulcano spento in Basilicata a quasi 1.300m di quota. I suoli vulcanici porosi trattengono acqua e rilasciano minerali in modo unico al mondo. L'Aglianico — il cui nome deriva da 'Hellenico', portato dai Greci — su questo terreno diventa austero, tannico, capace di invecchiare decenni. La famiglia Basilisco è l'interprete più elegante di questa denominazione del profondo Sud."
    },
    "Primitivo di Manduria": {
      tier: 1, uva: "Primitivo (= Zinfandel)", zona: "Primitivo di Manduria DOC, Puglia",
      storia: "Negli anni '90, la ricerca enologica rivelò una sorpresa: il Primitivo pugliese e lo Zinfandel californiano sono geneticamente identici. Il vitigno, portato probabilmente dai Croati nel Settecento, trovò in Puglia il suo habitat perfetto. Le vigne ad alberello di Manduria danno uve con zuccheri altissimi: vini profondi, 14-16% di alcol, frutto rosso-viola intenso che non ha bisogno di presentazioni."
    },
    "Dom Pérignon Rosé": {
      tier: 3, uva: "Chardonnay, Pinot Noir", zona: "Épernay, Champagne AOC, Francia",
      storia: "Il Dom Pérignon Rosé è il più raro della famiglia: esce solo nelle annate che Moët & Chandon giudica eccezionali, con una quota di vino rosso fermo Pinot Noir dell'Abbazia di Hautvillers. Il monaco benedettino Pierre Pérignon vi lavorò dal 1668 al 1715, codificando l'arte dell'assemblage Champagne. Ogni bottiglia affina almeno 8 anni in cantina: il colore, dal salmone al rame, cambia con ogni annata."
    },
    "Prosecco Gold — Bottega": {
      tier: 1, uva: "Glera", zona: "Prosecco DOC, Treviso, Veneto",
      storia: "La bottiglia dorata di Bottega è diventata icona del brindisi italiano nel mondo: riconoscibile a prima vista, presente in oltre 100 paesi. Sandro Bottega fondò l'azienda a Godega di Sant'Urbano (TV) nel 1977. Glera 100%, metodo Charmat con fermentazione in autoclave a temperatura controllata: fruttato e floreale nel packaging più fotografato del pianeta."
    },
    "Dom Pérignon": {
      tier: 3, uva: "Chardonnay, Pinot Noir", zona: "Épernay, Champagne AOC, Francia",
      storia: "Moët & Chandon produce il Dom Pérignon solo nelle annate che giudica eccezionali — non esce ogni anno. Il nome omaggia Pierre Pérignon, cellarer benedettino che codificò le tecniche Champagne nell'Abbazia di Hautvillers nel Seicento. Ogni bottiglia riposa almeno 8 anni sui lieviti in cantina prima di raggiungere il mercato: un processo che pochissimi Champagne al mondo si possono permettere."
    }
  };

  var dishPairings = {
    antipasti: [
      {
        name: "Tagliere di Salumi & Gnocco Fritto",
        photo: "assets/img/piatto-tagliere-salumi.jpg",
        desc: "Crudo di Parma, Pancetta, Salame Felino IGP e Prosciutto cotto, con gnocco fritto caldo.",
        wines: [
          { name: "Cerasuolo d'Abruzzo", tag: "Rosato fresco", desc: "Acidità e frutta croccante sgrassano la sapidità dei salumi e la frittura del gnocco." },
          { name: "Franciacorta Rosé — Bellavista", tag: "Bollicine rosé", desc: "Più corpo del Cerasuolo, regge il crudo di Parma senza coprirlo." },
          { name: "Dom Pérignon Rosé", tag: "Champagne rosé", desc: "Frutto rosso, profondità e bolla finissima: per un tagliere da ricordare." }
        ]
      },
      {
        name: "Tagliere di Formaggi",
        photo: "assets/img/piatto-tagliere-formaggi.png",
        desc: "Parmigiano Reggiano 36 mesi, Taleggio DOP, Brie e pecorino, con confetture.",
        wines: [
          { name: "Prosecco Gold — Bottega", tag: "Bollicine fruttate", desc: "Bollicine fresche per i formaggi più morbidi come il Brie." },
          { name: "Chianti Classico", tag: "Rosso versatile", desc: "Tannino e acidità bilanciano la grassezza di Taleggio e Brie, la confettura fa da ponte." },
          { name: "Amarone della Valpolicella", tag: "Rosso intenso", desc: "Concentrazione e dolcezza di frutta matura: l'abbinamento classico con il Parmigiano 36 mesi." }
        ]
      },
      {
        name: "La Tartare",
        photo: "assets/img/piatto-tartare-manzo.jpg",
        desc: "Fassona piemontese battuta a coltello, capperi di Pantelleria IGP, senape in grani, Taleggio.",
        wines: [
          { name: "Cerasuolo d'Abruzzo", tag: "Rosato fresco", desc: "Alternativa agile, la sapidità dei capperi trova equilibrio nella sua acidità." },
          { name: "Franciacorta Rosé — Bellavista", tag: "Bollicine rosé", desc: "La bolla rosé è l'abbinamento da manuale per una tartare di qualità." },
          { name: "Dom Pérignon Rosé", tag: "Champagne rosé", desc: "Bolla finissima e frutto rosso che esaltano la carne cruda: per una tartare che diventa il piatto della serata." }
        ]
      },
      {
        name: "Manzo Tonnato",
        desc: "Roast-beef di manzo con salsa tonnata della casa.",
        wines: [
          { name: "Valdobbiadene Prosecco Spago — Mionetto", tag: "Bollicine fresche", desc: "La freschezza del Prosecco bilancia la sapidità della salsa tonnata." },
          { name: "Cerasuolo d'Abruzzo", tag: "Rosato fresco", desc: "Rosato strutturato che regge il roast-beef e la cremosità della tonnata." },
          { name: "Dom Pérignon", tag: "Champagne", desc: "Per un antipasto che merita una bollicina importante." }
        ]
      },
      {
        name: "La Caprese",
        desc: "Mozzarella fior di latte su crumble di taralli, pomodori, basilico.",
        wines: [
          { name: "Valdobbiadene Prosecco Spago — Mionetto", tag: "Bollicine fresche", desc: "Freschezza e leggerezza per la Caprese — tutto naturale." },
          { name: "Franciacorta Pas Opéré — Bellavista", tag: "Bollicine secche", desc: "Mineralità e dosaggio zero che esaltano la freschezza della mozzarella." },
          { name: "Dom Pérignon", tag: "Champagne", desc: "La mineralità calcarea del Dom Pérignon con la mozzarella fresca: semplicità che si trasforma." }
        ]
      },
      {
        name: "Nervetti alla Milanese",
        desc: "Classico milanese con cipolla, prezzemolo, aceto.",
        wines: [
          { name: "Malandrino Montepulciano d'Abruzzo", tag: "Rosso rustico", desc: "Un vino di carattere per un piatto di carattere: frutto pieno e tannino gentile." },
          { name: "Chianti Classico", tag: "Rosso versatile", desc: "Acidità che bilancia la grassezza e la nota acetica dei Nervetti alla milanese." },
          { name: "Cerasuolo d'Abruzzo", tag: "Rosato fresco", desc: "Freschezza e struttura per un classico milanese che richiede coraggio." }
        ]
      }
    ],
    primi: [
      {
        name: "Trofiette Verdi",
        photo: "assets/img/piatto-trofie-pesto-burrata.jpg",
        desc: "Trofiette al pesto alla genovese, stracciatella fresca, granella di pistacchio.",
        wines: [
          { name: "Franciacorta Pas Opéré — Bellavista", tag: "Bollicine secche", desc: "Il dosaggio zero taglia la cremosità della stracciatella, le bollicine esaltano il pesto." },
          { name: "Alta Langa Brut Blanc de Blancs — Giulio Cocchi", tag: "Bollicine italiane", desc: "Mineralità e finezza, elegante con le note erbacee del pesto genovese." },
          { name: "Dom Pérignon", tag: "Champagne", desc: "La mineralità del Dom Pérignon incontra il basilico del pesto in modo inatteso e raffinato." }
        ]
      },
      {
        name: "Mezzelune Ricotta e Rucola",
        photo: "assets/img/piatto-ravioli-fiori.jpg",
        desc: "Ravioli ripieni di ricotta fresca e rucola, burro alle erbe, salvia croccante.",
        wines: [
          { name: "Alta Langa Brut Blanc de Blancs — Giulio Cocchi", tag: "Bollicine italiane", desc: "Bollicine fini e agrumi che esaltano il burro alle erbe." },
          { name: "Chianti Classico", tag: "Rosso versatile", desc: "Acidità fresca che bilancia la ricchezza del ripieno di ricotta." },
          { name: "Franciacorta Pas Opéré — Bellavista", tag: "Bollicine secche", desc: "Eleganza e mineralità per una pasta ripiena precisa." }
        ]
      },
      {
        name: "L'Orecchietta",
        desc: "Orecchiette con ragù bolognese.",
        wines: [
          { name: "Malandrino Montepulciano d'Abruzzo", tag: "Rosso rustico", desc: "Frutto pieno e tannino gentile per il ragù: l'abbinamento contadino che funziona sempre." },
          { name: "Chianti Classico", tag: "Rosso versatile", desc: "Acidità e tannino equilibrati: il classico per qualunque ragù di carne." },
          { name: "Brunello di Montalcino", tag: "Rosso classico", desc: "Per un ragù cotto a lungo, il Brunello è la risposta definitiva." }
        ]
      },
      {
        name: "Troccoli alla Norma",
        desc: "Pasta con pomodoro, melanzane fritte, ricotta salata.",
        wines: [
          { name: "TONÍ Montepulciano d'Abruzzo", tag: "Rosso morbido", desc: "Struttura e frutto che dialogano con la melanzana fritta e il pomodoro." },
          { name: "Primitivo di Manduria", tag: "Rosso pieno", desc: "Il Primitivo pugliese ha la stessa mediterraneità della Norma siciliana." },
          { name: "Chianti Classico", tag: "Rosso versatile", desc: "Acidità vivace che bilancia la ricotta salata." }
        ]
      }
    ],
    secondi: [
      {
        name: "Picanha",
        photo: "assets/img/piatto-costata-manzo.jpg",
        desc: "Taglio brasiliano alla griglia, succoso e saporito.",
        wines: [
          { name: "Primitivo di Manduria", tag: "Rosso pieno", desc: "Calore e frutta matura per un taglio dal carattere deciso." },
          { name: "Il Bruciato — Antinori", tag: "Rosso elegante", desc: "Frutto succoso e tannino morbido, sulla stessa lunghezza d'onda della picanha." },
          { name: "Sassicaia", tag: "Rosso importante", desc: "Tannino elegante e lunghezza che accompagnano ogni boccone." }
        ]
      },
      {
        name: "Costata",
        photo: "assets/img/piatto-costata-manzo.jpg",
        desc: "Costata di manzo alla griglia su brace viva.",
        wines: [
          { name: "Barolo Della Marmora 2021", tag: "Rosso strutturato", desc: "Il tannino del Nebbiolo taglia la marezzatura e accompagna la crosta della brace." },
          { name: "Il Bruciato — Antinori", tag: "Rosso elegante", desc: "Super Tuscan che accompagna la brace con tannini vellutati." },
          { name: "Brunello di Montalcino", tag: "Rosso classico", desc: "Struttura e longevità per un taglio che merita rispetto." }
        ]
      },
      {
        name: "Filetto di Manzo",
        desc: "Taglio magro e pregiato, alla griglia o in padella.",
        wines: [
          { name: "Malandrino Montepulciano d'Abruzzo", tag: "Rosso rustico", desc: "Frutto e morbidezza senza coprire la delicatezza del filetto." },
          { name: "Il Bruciato — Antinori", tag: "Rosso elegante", desc: "Bolgheri agile e fruttato, non copre la delicatezza del filetto." },
          { name: "Tignanello", tag: "Rosso importante", desc: "Eleganza e profondità per un taglio altrettanto raffinato." }
        ]
      },
      {
        name: "Costolette di Agnello",
        desc: "Costolette di agnello cotte alla griglia.",
        wines: [
          { name: "Primitivo di Manduria", tag: "Rosso pieno", desc: "Calore e frutto con la nota selvatica dell'agnello." },
          { name: "Aglianico del Vulture — Teodosio Basilisco", tag: "Rosso del sud", desc: "Tannino fitto e speziatura che accompagnano la sapidità della griglia." },
          { name: "Amarone della Valpolicella", tag: "Rosso intenso", desc: "Concentrazione di frutta matura che regge bene la nota selvatica dell'agnello." }
        ]
      },
      {
        name: "Cotoletta Milanese XXL",
        desc: "La grande cotoletta alla milanese, impanata e fritta.",
        wines: [
          { name: "Valdobbiadene Prosecco Spago — Mionetto", tag: "Bollicine fresche", desc: "Le bollicine sgrassano la panatura fritta alla perfezione — l'abbinamento milanese per eccellenza." },
          { name: "Franciacorta Pas Opéré — Bellavista", tag: "Bollicine secche", desc: "Metodo classico elegante che tiene testa alla cotoletta XXL." },
          { name: "Chianti Classico", tag: "Rosso versatile", desc: "Per chi preferisce il rosso: Sangiovese che bilancia la panatura senza coprire la carne." }
        ]
      },
      {
        name: "Fiorentina",
        desc: "Il taglio simbolo della tradizione toscana, alla griglia.",
        wines: [
          { name: "Barolo Della Marmora 2021", tag: "Rosso strutturato", desc: "Il Re dei vini italiani per la Regina della griglia toscana." },
          { name: "Chianti Classico", tag: "Rosso versatile", desc: "Sangiovese toscano per un taglio toscano: l'abbinamento territoriale più classico." },
          { name: "Brunello di Montalcino", tag: "Rosso classico", desc: "Sangiovese in purezza, struttura toscana: il massimo per una Fiorentina." }
        ]
      },
      {
        name: "Grigliata Mista",
        photo: "assets/img/piatto-grigliata-mista.jpg",
        desc: "Pollo, würstel, salsiccia, costolette di agnello, picanha, costine di maiale — tutto sulla brace.",
        wines: [
          { name: "Primitivo di Manduria", tag: "Rosso pieno", desc: "Caldo, fruttato e generoso — nato per accompagnare la grigliata." },
          { name: "Aglianico del Vulture — Teodosio Basilisco", tag: "Rosso del sud", desc: "Potenza e mineralità per reggere la complessità della grigliata mista." },
          { name: "Amarone della Valpolicella", tag: "Rosso intenso", desc: "Un Amarone con la grigliata mista: l'abbinamento coraggioso che non si dimentica." }
        ]
      }
    ],
    dolci: [
      {
        name: "Semifreddi ai Frutti",
        desc: "Dolci a forma di frutta, fatti a mano.",
        wines: [
          { name: "Prosecco Gold — Bottega", tag: "Bollicine fruttate", desc: "Leggero e immediato, accompagna senza appesantire dopo un pasto completo." },
          { name: "Franciacorta Rosé — Bellavista", tag: "Bollicine rosé", desc: "Frutto rosso e bolla elegante che rispecchiano la natura del semifreddo." },
          { name: "Dom Pérignon Rosé", tag: "Champagne rosé", desc: "Per chiudere la cena in un momento da ricordare." }
        ]
      },
      {
        name: "Tiramisù della Casa",
        desc: "La ricetta classica, fatta in casa.",
        wines: [
          { name: "Valdobbiadene Prosecco Spago — Mionetto", tag: "Bollicine fresche", desc: "Bollicine leggere che puliscono il palato tra un cucchiaio e l'altro." },
          { name: "Franciacorta Rosé — Bellavista", tag: "Bollicine rosé", desc: "Corpo e frutto rosso che dialogano con la nota di cacao e caffè." },
          { name: "Dom Pérignon", tag: "Champagne", desc: "Per i momenti che meritano una bottiglia importante, anche a fine pasto." }
        ]
      },
      {
        name: "Torroncino al Pistacchio",
        desc: "Dolce, croccante, al pistacchio.",
        wines: [
          { name: "Prosecco Gold — Bottega", tag: "Bollicine fruttate", desc: "Leggerezza e riconoscibilità: accompagna il torroncino senza impegno." },
          { name: "Alta Langa Brut Blanc de Blancs — Giulio Cocchi", tag: "Bollicine italiane", desc: "Metodo classico piemontese con il pistacchio — un viaggio nell'Italia." },
          { name: "Dom Pérignon Rosé", tag: "Champagne rosé", desc: "Per un dolce che merita un calice all'altezza." }
        ]
      }
    ]
  };

  var tabsContainer = document.getElementById("pairingTabs");
  var dishesContainer = document.getElementById("pairingDishes");
  var resultsContainer = document.getElementById("pairingResults");
  var pairingTool = document.querySelector(".pairing-tool");
  var resizeTimer;

  /* ① Sliding tab indicator */
  var tabInk = null;
  if (tabsContainer) {
    tabInk = document.createElement("span");
    tabInk.className = "pairing-tab-ink";
    tabsContainer.appendChild(tabInk);
  }

  function moveInk(tab) {
    if (!tabInk || !tabsContainer) return;
    var cr = tabsContainer.getBoundingClientRect();
    var tr = tab.getBoundingClientRect();
    tabInk.style.left = (tr.left - cr.left) + "px";
    tabInk.style.top = (tr.top - cr.top) + "px";
    tabInk.style.width = tr.width + "px";
    tabInk.style.height = tr.height + "px";
  }

  /* ③ Mouse glow sulle wine card */
  function attachWineCardGlow() {
    if (!resultsContainer) return;
    resultsContainer.querySelectorAll(".wine-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - rect.left) / rect.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - rect.top) / rect.height * 100) + "%");
      });
    });
  }

  function renderResults(cat, dishIndex) {
    if (!resultsContainer) return;
    var dish = dishPairings[cat][dishIndex];
    if (!dish) return;

    var html =
      '<div class="pairing-dish-detail" style="grid-column:1/-1;">' +
      "<h3>" + dish.name + "</h3>" +
      "<p>" + dish.desc + "</p>" +
      "</div>";
    dish.wines.forEach(function (w, i) {
      var info = wineDb[w.name] || {};
      html +=
        '<div class="wine-card" style="animation-delay:' + (i * 110 + 80) + 'ms">' +
        '<span class="wine-tag">' + w.tag + "</span>" +
        "<h4>" + w.name + "</h4>" +
        "<p>" + w.desc + "</p>" +
        (info.uva ? '<p class="wine-meta">◆ ' + info.uva + (info.zona ? " · " + info.zona : "") + "</p>" : "") +
        (info.storia
          ? '<button type="button" class="wine-story-toggle">La storia <span class="ws-arrow">▾</span></button>' +
            '<div class="wine-story-body">' + info.storia + "</div>"
          : "") +
        "</div>";
    });
    resultsContainer.innerHTML = html;
    attachWineCardGlow();
  }

  function renderDishes(cat) {
    if (!dishesContainer) return;
    var dishes = dishPairings[cat];
    if (!dishes) return;

    dishesContainer.innerHTML = dishes
      .map(function (d, i) {
        return '<button type="button" class="pairing-dish' + (i === 0 ? " is-active" : "") + '" data-dish-index="' + i + '" aria-pressed="' + (i === 0 ? "true" : "false") + '" style="animation-delay:' + (i * 60) + 'ms">' + d.name + "</button>";
      })
      .join("");

    renderResults(cat, 0);
  }

  if (dishesContainer) {
    dishesContainer.addEventListener("click", function (e) {
      var btn = e.target.closest(".pairing-dish");
      if (!btn) return;
      var cat = tabsContainer.querySelector(".pairing-tab.is-active").dataset.cat;

      dishesContainer.querySelectorAll(".pairing-dish").forEach(function (d) {
        d.classList.remove("is-active");
        d.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      /* ④ Pulse glow on tap (WAAPI, non interferisce con dish-enter) */
      if (btn.animate) {
        btn.animate([
          { boxShadow: "0 0 0 0 rgba(212,175,106,0.55)" },
          { boxShadow: "0 0 0 10px rgba(212,175,106,0)" }
        ], { duration: 500, easing: "ease-out" });
      }

      renderResults(cat, Number(btn.dataset.dishIndex));
    });
  }

  if (tabsContainer) {
    tabsContainer.addEventListener("click", function (e) {
      var btn = e.target.closest(".pairing-tab");
      if (!btn) return;

      tabsContainer.querySelectorAll(".pairing-tab").forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      moveInk(btn);
      if (pairingTool) pairingTool.dataset.cat = btn.dataset.cat;

      renderDishes(btn.dataset.cat);
    });

    renderDishes("antipasti");

    /* ① Init ink senza transizione al primo paint */
    var firstTab = tabsContainer.querySelector(".pairing-tab.is-active");
    if (firstTab) {
      moveInk(firstTab);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (tabInk) tabInk.style.transition = "left 0.32s cubic-bezier(.4,0,.2,1), top 0.32s cubic-bezier(.4,0,.2,1), width 0.28s cubic-bezier(.4,0,.2,1), height 0.28s cubic-bezier(.4,0,.2,1)";
        });
      });
    }

    /* ⑤ Init tinta categoria */
    if (pairingTool) pairingTool.dataset.cat = "antipasti";

    /* Reposition ink on resize */
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var active = tabsContainer.querySelector(".pairing-tab.is-active");
        if (active && tabInk) {
          tabInk.style.transition = "none";
          moveInk(active);
          requestAnimationFrame(function () {
            if (tabInk) tabInk.style.transition = "left 0.32s cubic-bezier(.4,0,.2,1), top 0.32s cubic-bezier(.4,0,.2,1), width 0.28s cubic-bezier(.4,0,.2,1), height 0.28s cubic-bezier(.4,0,.2,1)";
          });
        }
      }, 150);
    });
  }

  /* ---------- PIATTI: tilt 3D al mouse + click per espandere ---------- */
  var dishData = {
    tagliere: {
      kicker: "Antipasti",
      name: "Tagliere di Salumi & Gnocco Fritto",
      desc: "Crudo di Parma, Pancetta, Salame Felino IGP e Prosciutto cotto affettati al momento, serviti con gnocco fritto caldo. Il modo migliore per iniziare la serata da Hedoné.",
      imgs: ["assets/img/piatto-tagliere-affettati.jpg", "assets/img/piatto-tagliere-salumi.jpg", "assets/img/piatto-tagliere-misto.jpg"],
      ingredients: ["Crudo di Parma", "Pancetta", "Salame Felino IGP", "Prosciutto cotto", "Gnocco fritto"],
      wines: [
        { name: "Cerasuolo d'Abruzzo", desc: "Freschezza e frutta croccante sgrassano la sapidità dei salumi e la frittura del gnocco." },
        { name: "Franciacorta Rosé — Bellavista", desc: "Bollicine cremose con più corpo, reggono il crudo di Parma senza coprirlo." }
      ]
    },
    tartare: {
      kicker: "Antipasti",
      name: "La Tartare",
      desc: "Fassona piemontese battuta a coltello con capperi di Pantelleria IGP, senape in grani e gocce di Taleggio. Una firma di cucina che racconta identità e precisione.",
      imgs: ["assets/img/piatto-tartare-manzo.jpg", "assets/img/piatto-tartare.png"],
      ingredients: ["Fassona piemontese", "Capperi di Pantelleria IGP", "Senape in grani", "Taleggio"],
      wines: [
        { name: "Franciacorta Rosé — Bellavista", desc: "L'abbinamento da manuale: bollicine e acidità che esaltano la carne cruda." },
        { name: "Cerasuolo d'Abruzzo", desc: "Alternativa fresca, bilancia la sapidità dei capperi di Pantelleria." }
      ]
    },
    trofiette: {
      kicker: "Primi",
      name: "Trofiette Verdi",
      desc: "Trofiette al pesto alla genovese, cuore di stracciatella fresca e granella di pistacchio tostato. Una pasta che racconta il profumo del Mediterraneo.",
      imgs: ["assets/img/piatto-trofie-pesto-burrata.jpg", "assets/img/food-gal-02.png"],
      ingredients: ["Trofiette verdi (grano, spinaci)", "Pesto alla genovese", "Stracciatella", "Granella di pistacchio"],
      wines: [
        { name: "Franciacorta Pas Operé — Bellavista", desc: "Zero dosage che taglia la cremosità della stracciatella ed esalta il pesto." },
        { name: "Alta Langa Bianc 'd Bianc — Giulio Cocchi", desc: "Mineralità e finezza, elegante con le note erbacee del pesto genovese." }
      ]
    },
    mezzelune: {
      kicker: "Primi",
      name: "Mezzelune di Ricotta e Rucola",
      desc: "Ravioli ripieni di ricotta fresca e rucola, mantecati in burro alle erbe con foglie di salvia croccanti. Una pasta che unisce semplicità e tecnica.",
      imgs: ["assets/img/piatto-ravioli-fiori.jpg", "assets/img/food-gal-01.png"],
      ingredients: ["Pasta fresca all'uovo", "Ricotta", "Rucola", "Burro alle erbe", "Salvia croccante"],
      wines: [
        { name: "Alta Langa Bianc 'd Bianc — Giulio Cocchi", desc: "Bollicine fini e agrumi che esaltano il burro alle erbe." },
        { name: "Chianti Classico", desc: "Acidità fresca che bilancia la ricchezza del ripieno di ricotta." }
      ]
    },
    costata: {
      kicker: "Secondi alla griglia",
      name: "Costata",
      desc: "Costata di manzo selezionata, cotta alla griglia su brace viva. Un taglio nobile che porta in tavola tutta la qualità della materia prima — da condividere o gustare da soli.",
      imgs: ["assets/img/piatto-costata-manzo.jpg", "assets/img/food-gal-10.jpg"],
      ingredients: ["Costata di manzo", "Sale grosso", "Pepe nero", "Rosmarino", "Brace viva"],
      wines: [
        { name: "Barolo Della Marmora 2021", desc: "Il Re dei vini italiani per un taglio che merita rispetto." },
        { name: "Il Bruciato — Antinori", desc: "Super Tuscan elegante, tannini vellutati sulla marezzatura." }
      ]
    },
    grigliata: {
      kicker: "Secondi alla griglia",
      name: "Grigliata Mista",
      desc: "Filetto di pollo, würstel, salsiccia, costolette di agnello, picanha e costine di maiale — tutto sulla brace. Una festa del gusto per chi vuole assaggiare il meglio della griglia di Hedoné.",
      imgs: ["assets/img/piatto-grigliata-mista.jpg", "assets/img/piatto-picanha.png"],
      ingredients: ["Filetto di pollo", "Würstel artigianale", "Salsiccia", "Costolette di agnello", "Picanha", "Costine di maiale"],
      wines: [
        { name: "Primitivo di Manduria", desc: "Caldo, fruttato e generoso — nato per accompagnare la griglia." },
        { name: "Aglianico del Vulture", desc: "Potenza e mineralità per reggere la complessità della grigliata mista." }
      ]
    }
  };

  var dishModal = document.getElementById("dishModal");
  var dishModalBackdrop = document.getElementById("dishModalBackdrop");
  var dishModalClose = document.getElementById("dishModalClose");
  var dishModalKicker = document.getElementById("dishModalKicker");
  var dishModalTitle = document.getElementById("dishModalTitle");
  var dishModalDesc = document.getElementById("dishModalDesc");
  var dishModalIngredients = document.getElementById("dishModalIngredients");
  var dishModalPairing = document.getElementById("dishModalPairing");
  var dishModalBody = dishModal ? dishModal.querySelector(".dish-modal-body") : null;
  var galleryTrack = document.getElementById("dishGalleryTrack");
  var galleryDotsEl = document.getElementById("dishGalleryDots");
  var galleryPrevBtn = document.getElementById("dishGalleryPrev");
  var galleryNextBtn = document.getElementById("dishGalleryNext");
  var galleryImgs = [];
  var galleryIndex = 0;
  var lastFocusedDish = null;
  var maxTilt = 2;
  var touchStartX = 0;

  function galleryGoTo(index, animate) {
    if (!galleryTrack) return;
    galleryIndex = Math.max(0, Math.min(index, galleryImgs.length - 1));
    if (animate === false) {
      galleryTrack.style.transition = "none";
      galleryTrack.style.transform = "translateX(-" + (galleryIndex * 100) + "%)";
      requestAnimationFrame(function () { galleryTrack.style.transition = ""; });
    } else {
      galleryTrack.style.transform = "translateX(-" + (galleryIndex * 100) + "%)";
    }
    if (galleryDotsEl) {
      galleryDotsEl.querySelectorAll(".dish-gallery-dot").forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === galleryIndex);
      });
    }
    if (galleryPrevBtn) galleryPrevBtn.disabled = galleryIndex === 0;
    if (galleryNextBtn) galleryNextBtn.disabled = galleryIndex === galleryImgs.length - 1;
  }

  function galleryPrev() { galleryGoTo(galleryIndex - 1, true); }
  function galleryNext() { galleryGoTo(galleryIndex + 1, true); }

  var _autoplayTimer = null;
  function galleryAutoplayNext() {
    var next = (galleryIndex + 1) % galleryImgs.length;
    galleryGoTo(next, true);
  }
  function startAutoplay() {
    stopAutoplay();
    if (galleryImgs.length < 2) return;
    _autoplayTimer = setInterval(galleryAutoplayNext, 3500);
  }
  function stopAutoplay() {
    if (_autoplayTimer) { clearInterval(_autoplayTimer); _autoplayTimer = null; }
  }
  function resetAutoplay() { startAutoplay(); }

  /* Ferma l'autoplay della gallery appena l'utente scrolla la descrizione:
     un cambio foto (transform in transizione) durante lo scroll del testo
     puo' causare un artefatto di compositing su Chromium mobile. */
  if (dishModalBody) {
    dishModalBody.addEventListener("scroll", stopAutoplay, { passive: true });
  }

  function fillDishModal(data) {
    galleryImgs = data.imgs || [];
    galleryIndex = 0;

    if (galleryTrack) {
      galleryTrack.innerHTML = galleryImgs.map(function (src) {
        return '<img src="' + src + '" alt="' + data.name + '" loading="lazy">';
      }).join("");
    }

    var multi = galleryImgs.length > 1;
    if (galleryDotsEl) {
      if (multi) {
        galleryDotsEl.innerHTML = galleryImgs.map(function (_, i) {
          return '<button type="button" class="dish-gallery-dot' + (i === 0 ? " is-active" : "") +
            '" data-gallery-index="' + i + '" aria-label="Foto ' + (i + 1) + '"></button>';
        }).join("");
        galleryDotsEl.style.display = "";
      } else {
        galleryDotsEl.innerHTML = "";
        galleryDotsEl.style.display = "none";
      }
    }
    if (galleryPrevBtn) galleryPrevBtn.style.display = multi ? "" : "none";
    if (galleryNextBtn) galleryNextBtn.style.display = multi ? "" : "none";

    galleryGoTo(0, false);

    dishModalKicker.textContent = data.kicker;
    dishModalTitle.textContent = data.name;
    dishModalDesc.textContent = data.desc;
    dishModalIngredients.innerHTML = data.ingredients
      .map(function (i) { return "<li>" + i + "</li>"; })
      .join("");
    dishModalPairing.innerHTML = data.wines
      ? data.wines.map(function (w) {
          return '<div class="dish-modal-pairing-item"><strong>' + w.name + "</strong><span>" + w.desc + "</span></div>";
        }).join("")
      : "";
  }

  function onDishModalKeydown(e) {
    if (e.key === "Escape") { closeDishModal(); return; }
    if (e.key !== "Tab" || !dishModal) return;
    /* Il focus resta dentro la modale finché è aperta */
    var focusables = dishModal.querySelectorAll("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])");
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function lockBodyScroll() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }
  function unlockBodyScroll() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  function openDishModal(card) {
    var data = dishData[card.dataset.dish];
    if (!data || !dishModal) return;
    lastFocusedDish = card;

    function update() {
      fillDishModal(data);
      dishModal.classList.add("is-open");
      dishModal.setAttribute("aria-hidden", "false");
      startAutoplay();
    }

    lockBodyScroll();

    if (document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }

    document.addEventListener("keydown", onDishModalKeydown);
    setTimeout(function () {
      if (dishModalClose) dishModalClose.focus();
    }, 50);
  }

  function closeDishModal() {
    if (!dishModal) return;
    stopAutoplay();
    dishModal.classList.remove("is-open");
    dishModal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onDishModalKeydown);
    unlockBodyScroll();
    if (lastFocusedDish) lastFocusedDish.focus();
  }

  document.querySelectorAll(".dish-card").forEach(function (card) {
    var glare = card.querySelector(".dish-glare");

    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;
      var rotateY = (px - 0.5) * maxTilt * 2;
      var rotateX = (0.5 - py) * maxTilt * 2;
      card.style.transform =
        "perspective(1200px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) scale(1.012)";
      if (glare) glare.style.backgroundPosition = px * 100 + "% " + py * 100 + "%";
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });

    card.addEventListener("click", function () {
      openDishModal(card);
    });
  });

  if (dishModalClose) dishModalClose.addEventListener("click", closeDishModal);
  if (dishModalBackdrop) dishModalBackdrop.addEventListener("click", closeDishModal);

  if (galleryPrevBtn) galleryPrevBtn.style.display = "none";
  if (galleryNextBtn) galleryNextBtn.style.display = "none";

  /* Story accordion nella sezione pairing principale (event delegation, una sola volta) */
  if (resultsContainer) {
    resultsContainer.addEventListener("click", function (e) {
      var btn = e.target.closest(".wine-story-toggle");
      if (btn) btn.closest(".wine-card").classList.toggle("is-expanded");
    });
  }

  /* ---------- CTA "altri piatti": bagliore che segue il mouse ---------- */
  var dishesCta = document.querySelector(".dishes-cta");
  if (dishesCta) {
    dishesCta.addEventListener("mousemove", function (e) {
      var rect = dishesCta.getBoundingClientRect();
      var mx = ((e.clientX - rect.left) / rect.width) * 100;
      var my = ((e.clientY - rect.top) / rect.height) * 100;
      dishesCta.style.setProperty("--mx", mx + "%");
      dishesCta.style.setProperty("--my", my + "%");
    });
  }
  /* ---------- BARMAN: sommelier interattivo a figura intera ---------- */
  var barmanAvatar  = document.getElementById("barmanAvatar");
  var barmanModal   = document.getElementById("barmanModal");
  var barmanBackdrop = document.getElementById("barmanBackdrop");
  var barmanClose   = document.getElementById("barmanClose");
  var barmanSpeech  = document.getElementById("barmanSpeech");
  var barmanContent = document.getElementById("barmanContent");
  var barmanPanel   = document.getElementById("barmanPanel");

  var barmanCats = {
    antipasti: { label: "Antipasti", speech: "Ottima scelta. Quale antipasto stai ordinando?" },
    primi:     { label: "Primi",     speech: "Perfetto. Quale primo piatto?" },
    secondi:   { label: "Secondi",   speech: "Ottima scelta. Quale secondo stai scegliendo — grigliata, Fiorentina, Filetto?" },
    dolci:     { label: "Dolci",     speech: "Ah, si finisce in dolcezza. Quale dolce?" }
  };

  var barmanPref = null;
  var barmanSpeechTimer = null;

  function barmanSetSpeech(text) {
    if (!barmanSpeech) return;
    if (barmanSpeechTimer) { clearInterval(barmanSpeechTimer); barmanSpeechTimer = null; }
    barmanSpeech.textContent = "";
    var i = 0;
    barmanSpeechTimer = setInterval(function() {
      if (i < text.length) { barmanSpeech.textContent += text[i]; i++; }
      else { clearInterval(barmanSpeechTimer); barmanSpeechTimer = null; }
    }, 22);
  }

  function wineMatchesPref(tag) {
    if (!barmanPref || barmanPref === "sorpresa") return false;
    var t = tag.toLowerCase();
    if (barmanPref === "bollicine") return t.indexOf("bollicine") > -1 || t.indexOf("champagne") > -1;
    if (barmanPref === "rosso")     return t.indexOf("rosso") > -1;
    if (barmanPref === "rosato")    return t.indexOf("rosato") > -1 || t.indexOf("rosé") > -1;
    return false;
  }

  function barmanOpenModal() {
    if (!barmanModal) return;
    barmanPref = null;
    barmanModal.classList.add("is-open");
    barmanModal.setAttribute("aria-hidden", "false");
    barmanShowStep0();
    setTimeout(function () { if (barmanClose) barmanClose.focus(); }, 60);
  }

  function barmanCloseModal() {
    if (!barmanModal) return;
    barmanModal.classList.remove("is-open");
    barmanModal.setAttribute("aria-hidden", "true");
  }

  function barmanSetWinesStep(on) {
    if (barmanPanel) barmanPanel.classList.toggle("step-wines", on);
  }

  function barmanShowPref() {
    barmanSetWinesStep(false);
    barmanSetSpeech("Ciao! Come preferisci il vino stasera?");
    var html = '<p class="barman-step-title">La tua preferenza</p><div class="barman-pref-grid">' +
      '<button class="barman-pref-pill" data-barman-pref="bollicine"><span class="bpp-glyph">◉</span><span class="bpp-label">Bollicine</span><span class="bpp-sub">Fresca e festosa</span></button>' +
      '<button class="barman-pref-pill" data-barman-pref="rosso"><span class="bpp-glyph">◆</span><span class="bpp-label">Rosso</span><span class="bpp-sub">Struttura e corpo</span></button>' +
      '<button class="barman-pref-pill" data-barman-pref="rosato"><span class="bpp-glyph">◇</span><span class="bpp-label">Rosato</span><span class="bpp-sub">Eleganza leggera</span></button>' +
      '<button class="barman-pref-pill" data-barman-pref="sorpresa"><span class="bpp-glyph">✦</span><span class="bpp-label">Sorprendimi</span><span class="bpp-sub">Decidi tu</span></button>' +
      '</div>';
    if (barmanContent) barmanContent.innerHTML = html;
  }

  function barmanShowStep0() {
    barmanSetWinesStep(false);
    var prefLabels = { bollicine: "Bollicine", rosso: "Rosso", rosato: "Rosato", sorpresa: "Sorpresa" };
    barmanSetSpeech(barmanPref && barmanPref !== "sorpresa"
      ? "Perfetto. Cosa mangerai stasera?"
      : "Cosa mangerai stasera?");
    var prefBadge = barmanPref
      ? '<div class="barman-pref-badge"><span class="bpb-dot"></span>' + prefLabels[barmanPref] + '<button class="bpb-reset" data-barman-reset-pref aria-label="Cambia preferenza">✕</button></div>'
      : '';
    var html = prefBadge + '<p class="barman-step-title">Scegli la portata</p><div class="barman-choices">';
    Object.keys(barmanCats).forEach(function (cat) {
      var c = barmanCats[cat];
      var count = dishPairings[cat] ? dishPairings[cat].length : 0;
      html += '<button type="button" class="barman-choice" data-barman-cat="' + cat + '">' +
        '<span class="barman-choice-label">' + c.label + '</span>' +
        '<span class="barman-choice-count">' + count + ' piatti</span>' +
        '<span class="barman-choice-arrow">→</span>' +
        '</button>';
    });
    html += '</div>';
    if (barmanContent) barmanContent.innerHTML = html;
  }

  function barmanShowStep1(cat) {
    barmanSetWinesStep(false);
    barmanSetSpeech(barmanCats[cat] ? barmanCats[cat].speech : "Quale piatto?");
    var dishes = dishPairings[cat] || [];
    var html = '<p class="barman-step-title">Quale piatto?</p><div class="barman-dishes">';
    dishes.forEach(function (d, i) {
      html += '<button type="button" class="barman-dish-btn" data-barman-cat="' + cat + '" data-barman-dish="' + i + '">' +
        '<span class="barman-dish-name">' + d.name + '</span>' +
        '</button>';
    });
    html += '</div><button type="button" class="barman-back" data-barman-back="0">← Cambia portata</button>';
    if (barmanContent) barmanContent.innerHTML = html;
  }

  function barmanShowStep2(cat, dishIndex) {
    barmanSetWinesStep(true);
    var dish = dishPairings[cat] && dishPairings[cat][dishIndex];
    if (!dish) return;
    barmanSetSpeech("Per «" + dish.name + "» un abbinamento per ogni fascia:");

    var tierLabels = { 1: "Accessibile", 2: "Selezionato", 3: "Pregiato" };
    var tierDots   = { 1: "●○○", 2: "●●○", 3: "●●●" };

    var byTier = { 1: [], 2: [], 3: [] };
    dish.wines.forEach(function(w) {
      var t = (wineDb[w.name] || {}).tier || 1;
      if (byTier[t]) byTier[t].push(w);
    });

    var html = '<div class="barman-wine-list">';
    [1, 2, 3].forEach(function(t) {
      var candidates = byTier[t];
      if (!candidates.length) return;

      var picked;
      if (barmanPref === "sorpresa") {
        picked = candidates[Math.floor(Math.random() * candidates.length)];
      } else if (barmanPref) {
        picked = candidates.slice().sort(function(a, b) {
          return (wineMatchesPref(b.tag) ? 1 : 0) - (wineMatchesPref(a.tag) ? 1 : 0);
        })[0];
      } else {
        picked = candidates[0];
      }

      var info = wineDb[picked.name] || {};
      var preferred = wineMatchesPref(picked.tag);

      html += '<div class="barman-tier-section">' +
        '<div class="barman-tier-header">' +
          '<span class="bth-label">' + tierLabels[t] + '</span>' +
          '<span class="bth-sep"></span>' +
          '<span class="bth-dots">' + tierDots[t] + '</span>' +
        '</div>' +
        '<div class="barman-wine' + (preferred ? ' is-preferred' : '') + '">' +
          '<div class="barman-wine-inner">' +
            '<div class="barman-wine-header">' +
              '<span class="barman-wine-tag">' + picked.tag + '</span>' +
              (preferred ? '<span class="barman-wine-match">Per te</span>' : '') +
            '</div>' +
            '<h4>' + picked.name + '</h4>' +
            '<p class="barman-wine-desc">' + picked.desc + '</p>' +
            (info.uva || info.zona
              ? '<div class="barman-wine-meta">' +
                (info.uva  ? '<span>' + info.uva  + '</span>' : '') +
                (info.zona ? '<span>' + info.zona + '</span>' : '') +
                '</div>' : '') +
          '</div>' +
          (info.storia
            ? '<button type="button" class="barman-story-toggle">La storia <span class="b-arrow">▾</span></button>' +
              '<div class="barman-story-body"><p class="barman-story-text">' + info.storia + '</p></div>'
            : '') +
        '</div>' +
      '</div>';
    });

    html += '</div><button type="button" class="barman-back" data-barman-back="1" data-barman-cat="' + cat + '">← Cambia piatto</button>';
    if (barmanContent) barmanContent.innerHTML = html;
  }

  if (barmanContent) {
    barmanContent.addEventListener("click", function (e) {
      var prefBtn = e.target.closest("[data-barman-pref]");
      if (prefBtn) { barmanPref = prefBtn.dataset.barmanPref; barmanShowStep0(); return; }
      var resetBtn = e.target.closest("[data-barman-reset-pref]");
      if (resetBtn) { barmanPref = null; barmanShowPref(); return; }
      var dishBtn = e.target.closest("[data-barman-dish]");
      if (dishBtn) { barmanShowStep2(dishBtn.dataset.barmanCat, Number(dishBtn.dataset.barmanDish)); return; }
      var backBtn = e.target.closest("[data-barman-back]");
      if (backBtn) {
        if (backBtn.dataset.barmanBack === "0") barmanShowStep0();
        else barmanShowStep1(backBtn.dataset.barmanCat);
        return;
      }
      var storyBtn = e.target.closest(".barman-story-toggle");
      if (storyBtn) { storyBtn.closest(".barman-wine").classList.toggle("is-expanded"); return; }
      var catBtn = e.target.closest("[data-barman-cat]");
      if (catBtn) { barmanShowStep1(catBtn.dataset.barmanCat); return; }
    });
  }

  if (barmanAvatar) {
    barmanAvatar.addEventListener("click", barmanOpenModal);
    barmanAvatar.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); barmanOpenModal(); }
    });
  }
  if (barmanBackdrop) barmanBackdrop.addEventListener("click", barmanCloseModal);
  if (barmanClose)    barmanClose.addEventListener("click", barmanCloseModal);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && barmanModal && barmanModal.classList.contains("is-open")) barmanCloseModal();
  });

  /* Sommelier page: init inline (nessun modal) */
  if (document.body.classList.contains("page-sommelier")) {
    barmanShowStep0();
  }

  /* Floating CTA sommelier (homepage): appare dopo 400px di scroll,
     richiudibile dall'utente per il resto della sessione */
  var sommelierFloat = document.getElementById("sommelierFloat");
  if (sommelierFloat) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 400 && sessionStorage.getItem("hedone_sfc_dismissed") !== "1") {
        sommelierFloat.classList.add("is-visible");
      }
    }, { passive: true });
    var sfcClose = document.getElementById("sfcClose");
    if (sfcClose) {
      sfcClose.addEventListener("click", function () {
        sommelierFloat.classList.remove("is-visible");
        sessionStorage.setItem("hedone_sfc_dismissed", "1");
      });
    }
  }

  /* ---------- FOOD GALLERY: drag-to-scroll ---------- */
  var foodGalleryWrap = document.querySelector(".food-gallery-wrap");
  if (foodGalleryWrap) {
    var _fgDrag = false, _fgStartX = 0, _fgScroll = 0;
    foodGalleryWrap.addEventListener("mousedown", function (e) {
      _fgDrag = true;
      _fgStartX = e.pageX - foodGalleryWrap.offsetLeft;
      _fgScroll = foodGalleryWrap.scrollLeft;
    });
    foodGalleryWrap.addEventListener("mouseleave", function () { _fgDrag = false; });
    foodGalleryWrap.addEventListener("mouseup", function () { _fgDrag = false; });
    foodGalleryWrap.addEventListener("mousemove", function (e) {
      if (!_fgDrag) return;
      e.preventDefault();
      foodGalleryWrap.scrollLeft = _fgScroll - (e.pageX - foodGalleryWrap.offsetLeft - _fgStartX);
    });
  }

  /* ---------- RECENSIONI: drag-to-scroll ---------- */
  var reviewsWrap = document.getElementById("reviewsTrackWrap");
  if (reviewsWrap) {
    var _isDragging = false, _startX = 0, _scrollLeft = 0;
    reviewsWrap.addEventListener("mousedown", function (e) {
      _isDragging = true;
      _startX = e.pageX - reviewsWrap.offsetLeft;
      _scrollLeft = reviewsWrap.scrollLeft;
    });
    reviewsWrap.addEventListener("mouseleave", function () { _isDragging = false; });
    reviewsWrap.addEventListener("mouseup", function () { _isDragging = false; });
    reviewsWrap.addEventListener("mousemove", function (e) {
      if (!_isDragging) return;
      e.preventDefault();
      reviewsWrap.scrollLeft = _scrollLeft - (e.pageX - reviewsWrap.offsetLeft - _startX);
    });
  }

  /* ---------- FRUTTI REALISTICI: drag-to-scroll ---------- */
  var fruitGalleryWrap = document.getElementById("fruitGalleryWrap");
  if (fruitGalleryWrap) {
    var _fruitDrag = false, _fruitStartX = 0, _fruitScroll = 0;
    fruitGalleryWrap.addEventListener("mousedown", function (e) {
      _fruitDrag = true;
      _fruitStartX = e.pageX - fruitGalleryWrap.offsetLeft;
      _fruitScroll = fruitGalleryWrap.scrollLeft;
    });
    fruitGalleryWrap.addEventListener("mouseleave", function () { _fruitDrag = false; });
    fruitGalleryWrap.addEventListener("mouseup", function () { _fruitDrag = false; });
    fruitGalleryWrap.addEventListener("mousemove", function (e) {
      if (!_fruitDrag) return;
      e.preventDefault();
      fruitGalleryWrap.scrollLeft = _fruitScroll - (e.pageX - fruitGalleryWrap.offsetLeft - _fruitStartX);
    });

    /* Nasconde l'indicatore "scorri" quando non c'e' altro contenuto a destra */
    function updateFruitScrollHint() {
      var atEnd = fruitGalleryWrap.scrollLeft + fruitGalleryWrap.clientWidth >= fruitGalleryWrap.scrollWidth - 4;
      fruitGalleryWrap.classList.toggle("is-end", atEnd);
    }
    fruitGalleryWrap.addEventListener("scroll", updateFruitScrollHint, { passive: true });
    window.addEventListener("resize", updateFruitScrollHint);
    updateFruitScrollHint();
  }

  /* Il tile video e' solo un'anteprima: non deve portare al menu come le foto */
  var fruitVideoTile = document.querySelector(".fruit-illusion-gallery-video");
  if (fruitVideoTile) {
    fruitVideoTile.addEventListener("click", function (e) { e.preventDefault(); });
  }

  /* ---------- FRUTTI REALISTICI: anteprima ingrandita al passaggio del mouse ---------- */
  var fruitPreview = document.getElementById("fruitPreview");
  var fruitPreviewImg = fruitPreview ? fruitPreview.querySelector("img") : null;
  var fruitPreviewVideo = fruitPreview ? fruitPreview.querySelector("video") : null;
  if (fruitPreview && fruitPreviewImg && fruitPreviewVideo) {
    document.querySelectorAll(".fruit-illusion-gallery a").forEach(function (a) {
      function showPreview() {
        var src = a.getAttribute("data-preview");
        if (!src) return;
        if (/\.mp4(\?|$)/i.test(src)) {
          fruitPreviewImg.style.display = "none";
          fruitPreviewVideo.style.display = "block";
          if (fruitPreviewVideo.getAttribute("src") !== src) fruitPreviewVideo.setAttribute("src", src);
          fruitPreviewVideo.currentTime = 0;
          fruitPreviewVideo.play().catch(function () {});
        } else {
          fruitPreviewVideo.pause();
          fruitPreviewVideo.style.display = "none";
          fruitPreviewImg.style.display = "block";
          fruitPreviewImg.setAttribute("src", src);
          fruitPreviewImg.setAttribute("alt", a.getAttribute("aria-label") || "");
        }
        fruitPreview.classList.add("is-visible");
      }
      function hidePreview() {
        fruitPreview.classList.remove("is-visible");
        fruitPreviewVideo.pause();
      }
      a.addEventListener("mouseenter", showPreview);
      a.addEventListener("mouseleave", hidePreview);
      a.addEventListener("focus", showPreview);
      a.addEventListener("blur", hidePreview);
    });
  }

  /* ---------- RECENSIONI: expand/collapse ---------- */
  document.querySelectorAll(".review-card").forEach(function (card) {
    var text = card.querySelector(".review-text");
    if (!text) return;
    if (text.scrollHeight <= text.clientHeight + 2) return;
    var btn = document.createElement("button");
    btn.className = "review-expand-btn";
    btn.textContent = "Leggi tutta";
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var expanded = text.classList.toggle("is-expanded");
      btn.textContent = expanded ? "Chiudi" : "Leggi tutta";
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
    card.insertBefore(btn, card.querySelector(".review-author"));
  });

  /* ---------- RECENSIONI: count-up numeri grandi ---------- */
  (function () {
    var statNums = document.querySelectorAll('.reviews-stat-num[data-count]');
    if (!statNums.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.dataset.count);
        var decimals = parseInt(el.dataset.decimals || '0', 10);
        var duration = 1400;
        var startTime = null;
        function tick(ts) {
          if (startTime === null) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = (target * eased).toFixed(decimals).replace('.', ',');
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    statNums.forEach(function (el) { obs.observe(el); });
  }());

  /* ---------- BOOKING FORM ---------- */
  var formModeToggle = document.querySelector(".booking-mode-toggle");
  var formReservation = document.getElementById("formReservation");
  var formContact = document.getElementById("formContact");
  var resDateInput = document.getElementById("resDate");

  /* Data minima = oggi */
  if (resDateInput) {
    var todayDate = new Date();
    todayDate.setMinutes(todayDate.getMinutes() - todayDate.getTimezoneOffset());
    resDateInput.min = todayDate.toISOString().slice(0, 10);
  }

  /* Toggle tra i due form */
  if (formModeToggle) {
    formModeToggle.addEventListener("click", function (e) {
      var btn = e.target.closest(".bmt-btn");
      if (!btn) return;
      formModeToggle.querySelectorAll(".bmt-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var mode = btn.dataset.mode;
      if (formReservation) formReservation.classList.toggle("is-active", mode === "reservation");
      if (formContact) formContact.classList.toggle("is-active", mode === "contact");
    });
  }

  /* Invio via FormSubmit.co (AJAX — prima sottomissione richiede conferma email al titolare) */
  function submitBookingForm(form, feedbackId) {
    var feedback = document.getElementById(feedbackId);
    var submitBtn = form.querySelector(".form-submit-btn");
    var originalText = submitBtn.textContent;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Invio in corso…";
    if (feedback) {
      feedback.className = "form-feedback loading";
      feedback.textContent = "Invio in corso…";
    }

    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });
    data["_captcha"] = "false";

    fetch("https://formsubmit.co/ajax/info@hedonevimodrone.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
    .then(function (res) { return res.json(); })
    .then(function (result) {
      if (result.success === "true" || result.success === true) {
        if (feedback) {
          feedback.className = "form-feedback success";
          feedback.textContent = feedbackId === "resFeedback"
            ? "✓ Richiesta inviata! Ti contatteremo presto per confermare il tuo tavolo."
            : "✓ Messaggio inviato! Ti risponderemo al più presto.";
        }
        form.reset();
        if (resDateInput && feedbackId === "resFeedback") {
          var t = new Date();
          t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
          resDateInput.min = t.toISOString().slice(0, 10);
        }
      } else {
        throw new Error("failed");
      }
    })
    .catch(function () {
      if (feedback) {
        feedback.className = "form-feedback error";
        feedback.innerHTML = "Si è verificato un errore. Scrivici a <a href=\"mailto:info@hedonevimodrone.com\">info@hedonevimodrone.com</a>.";
      }
    })
    .finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
  }

  if (formReservation) {
    formReservation.addEventListener("submit", function (e) {
      e.preventDefault();
      submitBookingForm(formReservation, "resFeedback");
    });
  }
  if (formContact) {
    formContact.addEventListener("submit", function (e) {
      e.preventDefault();
      submitBookingForm(formContact, "ctFeedback");
    });
  }

  /* ---------- TEAM CAROUSEL ---------- */
  (function () {
    var imgs = document.querySelectorAll(".about-team-img");
    var dots = document.querySelectorAll(".about-team-dot");
    if (imgs.length < 2) return;
    // La prima foto (scelta insieme) resta sempre l'apertura; il resto dell'ordine
    // viene rimescolato ad ogni caricamento pagina, così il giro non è mai lo stesso.
    var order = [];
    for (var i = 1; i < imgs.length; i++) order.push(i);
    for (var j = order.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = order[j]; order[j] = order[k]; order[k] = tmp;
    }
    order.unshift(0);
    var current = 0;
    var started = false;
    function goTo(n) {
      imgs[order[current]].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = n;
      imgs[order[current]].classList.add("is-active");
      dots[current].classList.add("is-active");
    }
    function startLoop() {
      if (started) return;
      started = true;
      setInterval(function () {
        if (document.hidden) return;
        goTo((current + 1) % imgs.length);
      }, 2500);
    }
    var frame = document.querySelector(".about-team-frame");
    if (!frame) return;
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { startLoop(); obs.disconnect(); }
    }, { threshold: 0.25 });
    obs.observe(frame);
  })();

  /* ---------- FOOTER: anno copyright sempre aggiornato ---------- */
  var footerYear = document.getElementById("footerYear");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

})();
