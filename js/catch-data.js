/* Shared "Today's Catch" data + backend API client.
   Loaded by both index.html (read-only display) and admin.html (toggle controls). */
(function (global) {
  "use strict";

  var CATCH_ITEMS = [
    { id: "live-crawfish", name: "Live Crawfish" },
    { id: "live-blue-crab", name: "Live Blue Crab", defaultAvailable: false },
    { id: "lump-crab", name: "Lump Crab" },
    { id: "crab-claws-finger", name: "Crab Claws", note: "finger" },
    { id: "dark-claw-meat", name: "Dark Claw Meat" },
    { id: "oysters-pint", name: "Oysters", note: "pint" },
    { id: "oysters-quart", name: "Oysters", note: "quart" },
    { id: "oysters-gallon", name: "Oysters", note: "gallon" },
    { id: "popcorn-shrimp", name: "Popcorn Shrimp" },
    { id: "shrimp-pd-lg-21-25", name: "Peel &amp; Devein Shrimp", note: "large, 21/25 ct." },
    { id: "shrimp-pd-med-31-40", name: "Peel &amp; Devein Shrimp", note: "medium, 31/40 ct." },
    { id: "royal-reds-21-25", name: "Royal Reds", note: "21/25 ct." },
    { id: "shrimp-head-on-med-21-25", name: "Head-On Shrimp", note: "medium, 21/25 ct." },
    { id: "shrimp-head-on-lg-10-15", name: "Head-On Shrimp", note: "large, 10/15 ct." },
    { id: "shrimp-head-off-med-26-30", name: "Head-Off Shrimp", note: "medium, 26/30 ct." },
    { id: "shrimp-head-off-lg-16-20", name: "Head-Off Shrimp", note: "large, 16/20 ct." },
    { id: "swai-filet", name: "Swai Filet", note: "imported" },
    { id: "tilapia-filet", name: "Tilapia Filet", note: "imported" },
    { id: "grouper-filet", name: "Grouper Filet" },
    { id: "red-snapper-filet", name: "Red Snapper Filet" },
    { id: "flounder-whole", name: "Flounder", note: "whole fish" },
    { id: "speckled-trout-whole", name: "Speckled Trout", note: "whole fish" },
    { id: "pompano-whole", name: "Pompano", note: "whole fish" },
    { id: "white-trout-whole", name: "White Trout", note: "whole fish, seasonal", defaultAvailable: false },
    { id: "ground-mullet-whole", name: "Ground Mullet", note: "whole fish, seasonal", defaultAvailable: false }
  ];

  var cache = { availability: {}, updatedAt: null };
  var lastFetchFailed = false;

  function fetchState() {
    return fetch("/api/catch", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("Server responded " + r.status);
        return r.json();
      })
      .then(function (data) {
        cache = data;
        lastFetchFailed = false;
        return data;
      })
      .catch(function (err) {
        lastFetchFailed = true;
        throw err;
      });
  }

  function itemDefault(id) {
    var item = CATCH_ITEMS.filter(function (i) { return i.id === id; })[0];
    return !item || item.defaultAvailable !== false;
  }

  function isAvailable(id) {
    var override = cache.availability[id];
    return typeof override === "boolean" ? override : itemDefault(id);
  }

  function getLastUpdated() {
    return cache.updatedAt;
  }

  function didLastFetchFail() {
    return lastFetchFailed;
  }

  function authHeaders(token) {
    return { "Content-Type": "application/json", "Authorization": "Bearer " + token };
  }

  function setAvailable(id, available, token) {
    return fetch("/api/catch/" + encodeURIComponent(id), {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ available: available })
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status === 401 ? "Wrong admin token" : "Server responded " + r.status);
      return r.json();
    }).then(function (data) {
      cache = data;
      return data;
    });
  }

  function setAllAvailable(available, token) {
    var ids = CATCH_ITEMS.map(function (i) { return i.id; });
    return fetch("/api/catch/bulk", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ ids: ids, available: available })
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status === 401 ? "Wrong admin token" : "Server responded " + r.status);
      return r.json();
    }).then(function (data) {
      cache = data;
      return data;
    });
  }

  global.TSHCatch = {
    ITEMS: CATCH_ITEMS,
    fetchState: fetchState,
    isAvailable: isAvailable,
    getLastUpdated: getLastUpdated,
    didLastFetchFail: didLastFetchFail,
    setAvailable: setAvailable,
    setAllAvailable: setAllAvailable
  };
})(window);
