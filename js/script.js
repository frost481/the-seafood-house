(function () {
  "use strict";

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Sticky header shadow on scroll */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  var navToggle = document.getElementById("navToggle");
  navToggle.addEventListener("click", function () {
    var isOpen = header.classList.toggle("nav-open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  document.querySelectorAll(".main-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      header.classList.remove("nav-open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* Menu tabs */
  var tabs = document.querySelectorAll(".menu-tab");
  var panels = document.querySelectorAll(".menu-panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      panels.forEach(function (p) { p.classList.remove("active"); });

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      var target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add("active");
    });
  });

  /* Hours: Sun=0 .. Sat=6, hours: Mon-Sat 10:30-20:00, Sun 12:00-18:00 */
  var HOURS = {
    0: { open: 12 * 60, close: 18 * 60, label: "12:00 PM – 6:00 PM", closeLabel: "6:00 PM" },
    1: { open: 10 * 60 + 30, close: 20 * 60, label: "10:30 AM – 8:00 PM", closeLabel: "8:00 PM" },
    2: { open: 10 * 60 + 30, close: 20 * 60, label: "10:30 AM – 8:00 PM", closeLabel: "8:00 PM" },
    3: { open: 10 * 60 + 30, close: 20 * 60, label: "10:30 AM – 8:00 PM", closeLabel: "8:00 PM" },
    4: { open: 10 * 60 + 30, close: 20 * 60, label: "10:30 AM – 8:00 PM", closeLabel: "8:00 PM" },
    5: { open: 10 * 60 + 30, close: 20 * 60, label: "10:30 AM – 8:00 PM", closeLabel: "8:00 PM" },
    6: { open: 10 * 60 + 30, close: 20 * 60, label: "10:30 AM – 8:00 PM", closeLabel: "8:00 PM" }
  };

  var now = new Date();
  var day = now.getDay();
  var minutesNow = now.getHours() * 60 + now.getMinutes();
  var today = HOURS[day];
  var isOpenNow = minutesNow >= today.open && minutesNow < today.close;

  var todayText = document.getElementById("todayHoursText");
  if (todayText) {
    todayText.textContent = today.label + (isOpenNow ? " • Open now" : " • Closed now");
  }

  var announceStatus = document.getElementById("announceStatus");
  if (announceStatus) {
    announceStatus.textContent = isOpenNow ? "Open today until " + today.closeLabel : "Closed now";
  }

  var row = document.querySelector('.hours-table tr[data-day="' + day + '"]');
  if (row) row.classList.add("today");

  /* Today's Catch board — fetched live from the backend (js/catch-data.js) */
  var catchBoard = document.getElementById("catchBoard");
  var catchUpdatedAt = document.getElementById("catchUpdatedAt");

  function renderCatchRows() {
    var rowsHtml = "";
    TSHCatch.ITEMS.forEach(function (item) {
      var available = TSHCatch.isAvailable(item.id);
      rowsHtml +=
        '<div class="catch-row">' +
          '<span class="catch-name">' + item.name + (item.note ? ' <em>(' + item.note + ')</em>' : '') + '</span>' +
          '<span class="catch-price">MP</span>' +
          '<span class="catch-status ' + (available ? "is-available" : "is-unavailable") + '">' +
            '<span class="catch-status-label">' + (available ? "Available" : "Unavailable") + '</span>' +
            (available ? '' : '<a href="tel:+12513017964" class="catch-call">Call to confirm</a>') +
          '</span>' +
        '</div>';
    });
    catchBoard.insertAdjacentHTML("beforeend", rowsHtml);

    if (catchUpdatedAt) {
      var stamp = TSHCatch.getLastUpdated();
      catchUpdatedAt.textContent = stamp
        ? "Last updated " + new Date(stamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
          " at " + new Date(stamp).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) + "."
        : "";
    }
  }

  if (catchBoard && window.TSHCatch) {
    TSHCatch.fetchState()
      .then(renderCatchRows)
      .catch(function () {
        catchBoard.insertAdjacentHTML(
          "beforeend",
          '<p class="catch-error">Couldn\'t reach the live stock list right now — showing defaults. Call ' +
          '<a href="tel:+12513017964">(251) 301-7964</a> to confirm what\'s in.</p>'
        );
        renderCatchRows();
      });
  }
})();
