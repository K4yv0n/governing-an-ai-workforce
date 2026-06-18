/* ============================================================
   Governing an AI Workforce, interactivity
   No framework, no build. Plain DOM.
   ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var AGENTS = window.AGENTS || [];
  var DIMS = window.PROFILE_DIMENSIONS || [];

  /* ---------- mobile nav toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- scroll progress bar ---------- */
  var progress = document.getElementById("progress");
  function onScroll() {
    if (!progress) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.width = pct + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- scrollspy via IntersectionObserver ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var linkMap = {};
  links.forEach(function (a) { linkMap[a.getAttribute("href").slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && linkMap[e.target.id]) {
        links.forEach(function (l) { l.classList.remove("active"); });
        linkMap[e.target.id].classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
  document.querySelectorAll("section[id]").forEach(function (s) { spy.observe(s); });

  /* ---------- reveal on enter ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (REDUCED) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { revObs.observe(el); });
  }

  /* ---------- count-up stats ---------- */
  var counters = document.querySelectorAll(".num[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (REDUCED) { el.textContent = prefix + target + suffix; return; }
    var start = null, dur = 1200;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var countObs = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(function (c) { countObs.observe(c); });

  /* ============================================================
     BOT REGISTER
     ============================================================ */
  var grid = document.getElementById("register-grid");
  var state = { runtime: "all", risks: {}, q: "", sort: "risk" };
  var riskRank = { high: 0, med: 1, low: 2 };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function filteredAgents() {
    var activeRisks = Object.keys(state.risks).filter(function (k) { return state.risks[k]; });
    var list = AGENTS.filter(function (a) {
      if (state.runtime !== "all" && a.runtime !== state.runtime) return false;
      if (activeRisks.length && activeRisks.indexOf(a.riskLevel) === -1) return false;
      if (state.q) {
        var hay = (a.name + " " + a.role + " " + a.runtimeLabel + " " + a.risk).toLowerCase();
        if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
      }
      return true;
    });
    list.sort(function (a, b) {
      if (state.sort === "name") return a.name.localeCompare(b.name);
      if (state.sort === "runtime") return a.runtimeLabel.localeCompare(b.runtimeLabel);
      return riskRank[a.riskLevel] - riskRank[b.riskLevel];
    });
    return list;
  }

  function renderRegister() {
    if (!grid) return;
    var list = filteredAgents();
    if (!list.length) { grid.innerHTML = '<p class="empty">No agents match these filters.</p>'; return; }
    grid.innerHTML = list.map(function (a) {
      return '' +
        '<article class="bot-card ' + (a.riskLevel === "high" ? "is-high" : "") + '">' +
          '<header>' +
            '<span class="dot dot-' + a.riskLevel + '" title="' + a.riskLevel + ' risk"></span>' +
            '<h3>' + escapeHtml(a.name) + '</h3>' +
            '<span class="runtime-chip">' + escapeHtml(a.runtimeLabel) + '</span>' +
          '</header>' +
          '<dl>' +
            '<dt>Job</dt><dd>' + escapeHtml(a.role) + '</dd>' +
            '<dt>In / Out</dt><dd>' + escapeHtml(a.io) + '</dd>' +
            '<dt>Outside</dt><dd>' + escapeHtml(a.outside) + '</dd>' +
            '<dt>Inside</dt><dd>' + escapeHtml(a.inside) + '</dd>' +
            '<dt>Key risk</dt><dd class="risk">' + escapeHtml(a.risk) + '</dd>' +
          '</dl>' +
        '</article>';
    }).join("");
  }

  // runtime chips
  var runtimeWrap = document.getElementById("filter-runtime");
  if (runtimeWrap) {
    runtimeWrap.addEventListener("click", function (e) {
      var btn = e.target.closest("button"); if (!btn) return;
      state.runtime = btn.getAttribute("data-runtime");
      runtimeWrap.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      renderRegister();
    });
  }
  // risk chips (multi-select toggle)
  var riskWrap = document.getElementById("filter-risk");
  if (riskWrap) {
    riskWrap.addEventListener("click", function (e) {
      var btn = e.target.closest("button"); if (!btn) return;
      var r = btn.getAttribute("data-risk");
      state.risks[r] = !state.risks[r];
      btn.setAttribute("aria-pressed", String(!!state.risks[r]));
      renderRegister();
    });
  }
  var search = document.getElementById("register-search");
  if (search) search.addEventListener("input", function () { state.q = search.value; renderRegister(); });
  var sortSel = document.getElementById("register-sort");
  if (sortSel) sortSel.addEventListener("change", function () { state.sort = sortSel.value; renderRegister(); });

  renderRegister();

  /* ============================================================
     BOT ACCOUNTABILITY AUDITOR
     ============================================================ */
  var auditorList = document.getElementById("auditor-list");
  var auditorPanel = document.getElementById("auditor-panel");

  function fillClass(v) { return v >= 75 ? "fill-strong" : (v >= 50 ? "fill-mid" : "fill-weak"); }

  function renderAuditor(agent) {
    if (!auditorPanel) return;
    var meters = DIMS.map(function (d) {
      var v = agent.profile[d.key];
      return '' +
        '<div class="meter">' +
          '<div class="top"><span class="label" title="' + escapeHtml(d.help) + '">' + d.label + '</span><span class="val">' + v + ' / 100</span></div>' +
          '<div class="track"><div class="fill ' + fillClass(v) + '" data-w="' + v + '"></div></div>' +
        '</div>';
    }).join("");

    auditorPanel.innerHTML = '' +
      '<h3>' + escapeHtml(agent.name) + '</h3>' +
      '<p class="role">' + escapeHtml(agent.runtimeLabel) + ' &middot; ' + escapeHtml(agent.model) + '</p>' +
      meters +
      '<div class="auditor-finding">' +
        '<h4>Revenue obligation</h4><p>' + escapeHtml(agent.revenueObligation) + '</p>' +
        '<h4>Held accountable from outside</h4><p>' + escapeHtml(agent.outside) + '</p>' +
        '<h4>Held accountable from inside</h4><p>' + escapeHtml(agent.inside) + '</p>' +
        '<h4>Key risk</h4><p class="' + (agent.riskLevel === "high" ? "risk-flag" : "") + '">' + escapeHtml(agent.risk) + '</p>' +
      '</div>';

    // animate fills next frame
    requestAnimationFrame(function () {
      auditorPanel.querySelectorAll(".fill").forEach(function (f) {
        f.style.width = (REDUCED ? f.getAttribute("data-w") : f.getAttribute("data-w")) + "%";
      });
    });
  }

  if (auditorList && AGENTS.length) {
    auditorList.innerHTML = AGENTS.map(function (a, i) {
      return '<button role="tab" aria-pressed="' + (i === 0) + '" data-id="' + a.id + '">' +
        '<span class="dot dot-' + a.riskLevel + '"></span>' + escapeHtml(a.name) + '</button>';
    }).join("");
    auditorList.addEventListener("click", function (e) {
      var btn = e.target.closest("button"); if (!btn) return;
      var id = btn.getAttribute("data-id");
      var agent = AGENTS.filter(function (a) { return a.id === id; })[0];
      auditorList.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      renderAuditor(agent);
    });
    renderAuditor(AGENTS[0]);
  }
})();
