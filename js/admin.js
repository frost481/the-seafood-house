(function () {
  "use strict";

  var TOKEN_KEY = "tsh_admin_token";

  var gate = document.getElementById("adminAuth");
  var panel = document.getElementById("adminPanel");
  var tokenInput = document.getElementById("tokenInput");
  var tokenSave = document.getElementById("tokenSave");
  var authError = document.getElementById("authError");
  var listEl = document.getElementById("adminList");
  var stampEl = document.getElementById("lastUpdated");

  function getToken() { return localStorage.getItem(TOKEN_KEY) || ""; }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  function formatStamp(iso) {
    if (!iso) return "Not updated yet.";
    var d = new Date(iso);
    return "Last updated " + d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
      " at " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) + ".";
  }

  function refreshStamp() {
    stampEl.textContent = formatStamp(TSHCatch.getLastUpdated());
  }

  function showAuthError(message) {
    authError.textContent = message;
    authError.hidden = false;
  }

  function renderList() {
    listEl.innerHTML = "";
    TSHCatch.ITEMS.forEach(function (item) {
      var available = TSHCatch.isAvailable(item.id);

      var row = document.createElement("div");
      row.className = "admin-row";

      var label = document.createElement("span");
      label.className = "admin-row-name";
      label.innerHTML = item.name + (item.note ? " <em>(" + item.note + ")</em>" : "");

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "admin-toggle " + (available ? "is-available" : "is-unavailable");
      btn.textContent = available ? "Available" : "Unavailable";
      btn.setAttribute("aria-pressed", available ? "true" : "false");
      btn.addEventListener("click", function () {
        btn.disabled = true;
        TSHCatch.setAvailable(item.id, !available, getToken())
          .then(function () {
            renderList();
            refreshStamp();
          })
          .catch(function (err) {
            btn.disabled = false;
            if (String(err.message).indexOf("token") !== -1 || String(err.message).indexOf("401") !== -1) {
              signOut();
              showAuthError("That token was rejected by the server — please re-enter it.");
            } else {
              alert("Could not save: " + err.message);
            }
          });
      });

      row.appendChild(label);
      row.appendChild(btn);
      listEl.appendChild(row);
    });
  }

  function loadAndRender() {
    return TSHCatch.fetchState().then(function () {
      renderList();
      refreshStamp();
    });
  }

  function unlock() {
    gate.hidden = true;
    panel.hidden = false;
    authError.hidden = true;
    loadAndRender().catch(function (err) {
      stampEl.textContent = "Couldn't reach the server: " + err.message;
    });
  }

  function signOut() {
    clearToken();
    panel.hidden = true;
    gate.hidden = false;
    tokenInput.value = "";
    tokenInput.focus();
  }

  tokenSave.addEventListener("click", function () {
    var val = tokenInput.value.trim();
    if (!val) return;
    setToken(val);
    unlock();
  });
  tokenInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") tokenSave.click();
  });

  document.getElementById("markAllAvailable").addEventListener("click", function () {
    TSHCatch.setAllAvailable(true, getToken())
      .then(function () { renderList(); refreshStamp(); })
      .catch(function (err) { alert("Could not save: " + err.message); });
  });

  document.getElementById("markAllUnavailable").addEventListener("click", function () {
    TSHCatch.setAllAvailable(false, getToken())
      .then(function () { renderList(); refreshStamp(); })
      .catch(function (err) { alert("Could not save: " + err.message); });
  });

  document.getElementById("signOut").addEventListener("click", signOut);

  if (getToken()) {
    unlock();
  } else {
    gate.hidden = false;
    tokenInput.focus();
  }
})();
