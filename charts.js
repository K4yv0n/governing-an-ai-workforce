/* ============================================================
   Charts: balanced-scorecard radar + gaming convexity curve.
   Lazy-initialized when each canvas enters the viewport so the
   page paints fast. Chart.js is loaded via CDN before this file.
   ============================================================ */
(function () {
  "use strict";
  if (typeof Chart === "undefined") return;
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var GOLD = "#ffd400", CORAL = "#ff7a6b", MUTED = "#888", GRID = "#262626", TEXT = "#f5f5f5", CYAN = "#4ecdc4";
  Chart.defaults.color = MUTED;
  Chart.defaults.font.family = "JetBrains Mono, ui-monospace, monospace";
  var anim = REDUCED ? false : { duration: 900 };

  var built = {};

  function buildScorecard() {
    var el = document.getElementById("scorecardChart");
    if (!el || built.scorecard) return;
    built.scorecard = true;
    new Chart(el, {
      type: "radar",
      data: {
        labels: ["Financial", "Customer / Audience", "Internal Process", "Learning & Growth"],
        datasets: [
          {
            label: "Design intent (target)",
            data: [88, 90, 92, 90],
            borderColor: CORAL,
            backgroundColor: "rgba(255,122,107,0.10)",
            borderWidth: 2,
            pointBackgroundColor: CORAL,
            pointRadius: 3
          },
          {
            label: "Current strength",
            data: [78, 58, 52, 84],
            borderColor: GOLD,
            backgroundColor: "rgba(255,212,0,0.15)",
            borderWidth: 2,
            pointBackgroundColor: GOLD,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: anim,
        plugins: {
          legend: { labels: { color: TEXT, boxWidth: 12, font: { size: 12 } } },
          tooltip: { callbacks: { label: function (c) { return c.dataset.label + ": " + c.formattedValue + " / 100"; } } }
        },
        scales: {
          r: {
            min: 0, max: 100,
            angleLines: { color: GRID },
            grid: { color: GRID },
            pointLabels: { color: TEXT, font: { size: 12 } },
            ticks: { display: false, stepSize: 25 }
          }
        }
      }
    });
  }

  function buildGaming() {
    var el = document.getElementById("gamingChart");
    if (!el || built.gaming) return;
    built.gaming = true;

    var xs = [];
    for (var i = 0; i <= 10; i++) xs.push(i);
    // convex: low then exponential at the top (rare viral hit pays exponentially)
    var convex = xs.map(function (x) { return Math.round(Math.pow(x / 10, 2.6) * 100); });
    // concave: rises fast then flattens (trust accrues with diminishing visible reward)
    var concave = xs.map(function (x) { return Math.round((1 - Math.pow(1 - x / 10, 2.2)) * 100); });
    // linear fair reference
    var linear = xs.map(function (x) { return x * 10; });

    var chart = new Chart(el, {
      type: "line",
      data: {
        labels: xs.map(function (x) { return x === 0 ? "low" : (x === 10 ? "viral" : ""); }),
        datasets: [
          { label: "Convex platform payoff", data: convex, borderColor: GOLD, backgroundColor: "transparent", borderWidth: 2.5, tension: 0.4, pointRadius: 0, _key: "convex" },
          { label: "Concave trust payoff", data: concave, borderColor: CORAL, backgroundColor: "transparent", borderWidth: 2.5, tension: 0.4, pointRadius: 0, _key: "concave" },
          { label: "Linear fair reference", data: linear, borderColor: MUTED, borderDash: [6, 5], backgroundColor: "transparent", borderWidth: 1.5, tension: 0, pointRadius: 0, _key: "linear" }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: anim,
        plugins: {
          legend: { labels: { color: TEXT, boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              title: function (items) { return "Effort or reach: " + items[0].label || "mid"; },
              label: function (c) { return c.dataset.label + ": " + c.formattedValue + " reward"; }
            }
          }
        },
        scales: {
          x: { grid: { color: GRID }, title: { display: true, text: "reach / variance of the swing", color: MUTED, font: { size: 11 } } },
          y: { grid: { color: GRID }, min: 0, max: 100, title: { display: true, text: "reward", color: MUTED, font: { size: 11 } } }
        }
      }
    });

    // toggle curves
    var toggle = document.getElementById("gaming-toggle");
    if (toggle) {
      toggle.addEventListener("click", function (e) {
        var btn = e.target.closest("button"); if (!btn) return;
        var key = btn.getAttribute("data-curve");
        var on = btn.getAttribute("aria-pressed") !== "true";
        btn.setAttribute("aria-pressed", String(on));
        chart.data.datasets.forEach(function (ds, idx) {
          if (ds._key === key) chart.setDatasetVisibility(idx, on);
        });
        chart.update();
      });
    }
  }

  // lazy init via observer
  var obs = new IntersectionObserver(function (entries, o) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      if (e.target.id === "scorecardChart") buildScorecard();
      if (e.target.id === "gamingChart") buildGaming();
      o.unobserve(e.target);
    });
  }, { threshold: 0.25 });

  ["scorecardChart", "gamingChart"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) obs.observe(el);
  });
})();
