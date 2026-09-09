// assets/stats.js — striscia "visite/download" in alto sul sito.
// Stesso progetto Supabase già usato dall'app (kvllupuinykufjxgtgsw), tabella public.site_counters
// (due righe fisse: 'visits' e 'downloads'), scrivibile SOLO tramite la funzione RPC
// increment_site_counter(): il client non ha permesso di scrittura diretta sulla tabella.
(function () {
  var SUPABASE_URL = "https://kvllupuinykufjxgtgsw.supabase.co";
  var SUPABASE_KEY = "sb_publishable_X2CpVGgtcBJeMwr74h1jzA_RUamz1hE";

  function fmt(n) {
    if (typeof n !== "number") return "–";
    return n.toLocaleString("it-IT");
  }

  function paint(visits, downloads) {
    var vEl = document.getElementById("stat-visits");
    var dEl = document.getElementById("stat-downloads");
    if (vEl) vEl.textContent = fmt(visits);
    if (dEl) dEl.textContent = fmt(downloads);
  }

  function rest(path, opts) {
    opts = opts || {};
    return fetch(SUPABASE_URL + path, {
      method: opts.method || "GET",
      headers: Object.assign({
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json"
      }, opts.headers || {}),
      body: opts.body
    }).then(function (r) { return r.ok ? r.json() : null; });
  }

  function readCounters() {
    return rest("/rest/v1/site_counters?select=id,count").then(function (rows) {
      if (!rows) return;
      var visits = 0, downloads = 0;
      rows.forEach(function (row) {
        if (row.id === "visits") visits = row.count;
        if (row.id === "downloads") downloads = row.count;
      });
      paint(visits, downloads);
    }).catch(function () { /* contatore non essenziale: nessun avviso all'utente se fallisce */ });
  }

  function bump(counterId) {
    return rest("/rest/v1/rpc/increment_site_counter", {
      method: "POST",
      body: JSON.stringify({ counter_id: counterId })
    }).catch(function () { /* silenzioso: mai bloccare la navigazione per un contatore */ });
  }

  // Una sola visita contata per scheda/sessione di navigazione (sessionStorage), così ricaricare
  // la stessa pagina o passare da una sezione all'altra del sito non gonfia il numero.
  function countVisitOnce() {
    try {
      if (sessionStorage.getItem("fumble_visit_counted")) {
        readCounters();
        return;
      }
      sessionStorage.setItem("fumble_visit_counted", "1");
    } catch (e) { /* storage non disponibile: conta comunque, meglio un doppio conteggio raro che niente */ }
    bump("visits").then(readCounters);
  }

  // Espone una funzione globale richiamata dal pulsante di download APK.
  window.FumbleStats = {
    recordDownload: function () { bump("downloads"); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", countVisitOnce);
  } else {
    countVisitOnce();
  }
})();
