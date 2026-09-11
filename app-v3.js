// GoalMind AI - v3 robust browser logic
(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  function getUser() {
    try { return JSON.parse(localStorage.getItem("gmUser") || "null"); }
    catch (e) { return null; }
  }

  function setUser(user) {
    localStorage.setItem("gmUser", JSON.stringify(user));
  }

  function getModal() {
    return byId("auth") || byId("authModal");
  }

  function openAuth(mode) {
    var modal = getModal();
    if (!modal) {
      alert("GoalMind: the login window could not be found. Please refresh the page.");
      return false;
    }

    // IMPORTANT: remove the hidden class. CSS may use !important on .hidden.
    modal.classList.remove("hidden");
    modal.classList.add("show");
    modal.style.display = "flex";
    modal.style.visibility = "visible";
    modal.style.opacity = "1";

    var title = byId("authTitle");
    var submit = byId("authSubmit");
    var name = byId("name");
    var switchText = byId("authSwitch");
    var modeInput = byId("authMode");
    var isLogin = mode === "login";

    if (title) title.textContent = isLogin ? "Welcome back" : "Create your account";
    if (submit) submit.textContent = isLogin ? "Log in" : "Create account";
    if (name) {
      name.style.display = isLogin ? "none" : "";
      name.required = !isLogin;
    }
    if (modeInput) modeInput.value = isLogin ? "login" : "signup";

    if (switchText) {
      switchText.innerHTML = isLogin
        ? 'New here? <a href="#" id="switchSignup">Create an account</a>'
        : 'Already have an account? <a href="#" id="switchLogin">Log in</a>';

      var signup = byId("switchSignup");
      var login = byId("switchLogin");
      if (signup) signup.onclick = function (e) { e.preventDefault(); openAuth("signup"); };
      if (login) login.onclick = function (e) { e.preventDefault(); openAuth("login"); };
    }
    return false;
  }

  function closeAuth() {
    var modal = getModal();
    if (!modal) return;
    modal.classList.remove("show");
    modal.classList.add("hidden");
    modal.style.display = "none";
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";
  }

  function submitAuth(event) {
    if (event) event.preventDefault();

    var emailEl = byId("email");
    var nameEl = byId("name");
    var passwordEl = byId("password");
    var modeEl = byId("authMode");

    var email = emailEl ? emailEl.value.trim() : "";
    var name = nameEl ? nameEl.value.trim() : "";
    var password = passwordEl ? passwordEl.value : "";
    var mode = modeEl ? modeEl.value : "signup";

    if (!email || !password || (mode !== "login" && !name)) {
      alert("Please complete the required fields.");
      return false;
    }

    setUser({ name: name || email.split("@")[0], email: email });
    window.location.href = "dashboard.html";
    return false;
  }

  function logout() {
    localStorage.removeItem("gmUser");
    window.location.href = "index.html";
  }

  function setupImage() {
    var input = byId("imageInput");
    var preview = byId("imagePreview");
    if (!input || !preview) return;

    input.onchange = function () {
      var file = input.files && input.files[0];
      if (!file) return;

      if (!file.type || file.type.indexOf("image/") !== 0) {
        alert("Please choose an image file.");
        input.value = "";
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    };
  }

  function analyze() {
    var home = parseFloat(byId("homeOdds") ? byId("homeOdds").value : "");
    var draw = parseFloat(byId("drawOdds") ? byId("drawOdds").value : "");
    var away = parseFloat(byId("awayOdds") ? byId("awayOdds").value : "");

    if (!(home > 1) || !(draw > 1) || !(away > 1)) {
      alert("Enter valid decimal odds greater than 1.00 for all three outcomes.");
      return;
    }

    var a = 1 / home, b = 1 / draw, c = 1 / away, total = a + b + c;
    var probs = { home: a / total * 100, draw: b / total * 100, away: c / total * 100 };
    var values = [
      { label: "Home win", value: probs.home },
      { label: "Draw", value: probs.draw },
      { label: "Away win", value: probs.away }
    ];
    values.sort(function (x, y) { return y.value - x.value; });
    var result = values[0];

    if (byId("predictionResult")) byId("predictionResult").textContent = result.label;
    if (byId("confidence")) byId("confidence").textContent = result.value.toFixed(1) + "%";
    if (byId("homeProb")) byId("homeProb").textContent = probs.home.toFixed(1) + "%";
    if (byId("drawProb")) byId("drawProb").textContent = probs.draw.toFixed(1) + "%";
    if (byId("awayProb")) byId("awayProb").textContent = probs.away.toFixed(1) + "%";

    var history = [];
    try { history = JSON.parse(localStorage.getItem("gmHistory") || "[]"); } catch (e) {}
    history.unshift({
      time: new Date().toLocaleString(),
      prediction: result.label,
      confidence: result.value.toFixed(1) + "%"
    });
    localStorage.setItem("gmHistory", JSON.stringify(history.slice(0, 20)));
    renderHistory();
  }

  function escapeHtml(v) {
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function renderHistory() {
    var box = byId("history");
    if (!box) return;
    var history = [];
    try { history = JSON.parse(localStorage.getItem("gmHistory") || "[]"); } catch (e) {}
    if (!history.length) {
      box.innerHTML = '<div class="empty">No predictions yet.</div>';
      return;
    }
    box.innerHTML = history.map(function (item) {
      return '<div class="history-item"><div><strong>' +
        escapeHtml(item.prediction) + '</strong><small>' +
        escapeHtml(item.time) + '</small></div><span>' +
        escapeHtml(item.confidence) + '</span></div>';
    }).join("");
  }

  function initDash() {
    var user = getUser();
    if (!user) { window.location.href = "index.html"; return; }
    if (byId("userName")) byId("userName").textContent = user.name || "User";
    if (byId("userEmail")) byId("userEmail").textContent = user.email || "";
    renderHistory();
    setupImage();
  }

  function bindButtons() {
    var buttons = document.querySelectorAll("button, a");
    buttons.forEach(function (el) {
      var text = (el.textContent || "").trim().toLowerCase();

      if (text === "log in" || text === "login") {
        el.onclick = function (e) { e.preventDefault(); openAuth("login"); };
      } else if (text.indexOf("get started") !== -1 || text.indexOf("start predicting") !== -1) {
        el.onclick = function (e) { e.preventDefault(); openAuth("signup"); };
      } else if (text.indexOf("see how it works") !== -1) {
        el.onclick = function (e) {
          e.preventDefault();
          var target = document.getElementById("how-it-works") ||
                       document.getElementById("howItWorks");
          if (target) target.scrollIntoView({ behavior: "smooth" });
          else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        };
      } else if (text === "continue" || text === "create account") {
        el.onclick = function (e) { submitAuth(e); };
      }
    });

    var form = byId("authForm");
    if (form) form.onsubmit = submitAuth;

    var modal = getModal();
    if (modal) {
      var close = modal.querySelector(".close");
      if (close) close.onclick = function (e) { e.preventDefault(); closeAuth(); };
      modal.onclick = function (e) {
        if (e.target === modal) closeAuth();
      };
    }

    var analyzeButton = document.querySelector("[onclick*='analyze']");
    if (analyzeButton) analyzeButton.onclick = function (e) { e.preventDefault(); analyze(); };

    var logoutButton = document.querySelector("[onclick*='logout']");
    if (logoutButton) logoutButton.onclick = function (e) { e.preventDefault(); logout(); };
  }

  window.openAuth = openAuth;
  window.closeAuth = closeAuth;
  window.submitAuth = submitAuth;
  window.logout = logout;
  window.setupImage = setupImage;
  window.analyze = analyze;
  window.renderHistory = renderHistory;
  window.initDash = initDash;

  document.addEventListener("DOMContentLoaded", function () {
    bindButtons();
    if (window.location.pathname.indexOf("dashboard.html") !== -1) initDash();
  });
})();
