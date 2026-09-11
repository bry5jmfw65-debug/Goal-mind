// GoalMind AI - robust browser-side demo logic
// Demo only: authentication uses localStorage and predictions are odds-based.

(function () {
  "use strict";

  function byId(id) {
    return document.getElementById(id);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem("gmUser") || "null");
    } catch (e) {
      return null;
    }
  }

  function setUser(user) {
    localStorage.setItem("gmUser", JSON.stringify(user));
  }

  function openAuth(mode) {
    var modal = byId("authModal");
    if (!modal) return;

    modal.classList.add("show");
    modal.style.display = "flex";

    var title = byId("authTitle");
    var submit = byId("authSubmit");
    var name = byId("name");
    var switchText = byId("authSwitch");

    var isLogin = mode === "login";

    if (title) title.textContent = isLogin ? "Welcome back" : "Create your account";
    if (submit) submit.textContent = isLogin ? "Log in" : "Create account";
    if (name) name.style.display = isLogin ? "none" : "block";

    if (switchText) {
      switchText.innerHTML = isLogin
        ? 'New here? <a href="#" onclick="openAuth(\'signup\'); return false;">Create an account</a>'
        : 'Already have an account? <a href="#" onclick="openAuth(\'login\'); return false;">Log in</a>';
    }

    var modeInput = byId("authMode");
    if (modeInput) modeInput.value = isLogin ? "login" : "signup";
  }

  function closeAuth() {
    var modal = byId("authModal");
    if (!modal) return;
    modal.classList.remove("show");
    modal.style.display = "none";
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

    setUser({
      name: name || email.split("@")[0],
      email: email
    });

    window.location.href = "dashboard.html";
    return false;
  }

  function logout() {
    localStorage.removeItem("gmUser");
    window.location.href = "index.html";
  }

  function initDash() {
    var user = getUser();

    if (!user) {
      window.location.href = "index.html";
      return;
    }

    var nameEl = byId("userName");
    var emailEl = byId("userEmail");

    if (nameEl) nameEl.textContent = user.name || "User";
    if (emailEl) emailEl.textContent = user.email || "";

    renderHistory();
    setupImage();
  }

  function setupImage() {
    var input = byId("imageInput");
    var preview = byId("imagePreview");
    if (!input || !preview) return;

    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
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
    });
  }

  function analyze() {
    var homeEl = byId("homeOdds");
    var drawEl = byId("drawOdds");
    var awayEl = byId("awayOdds");

    var home = parseFloat(homeEl ? homeEl.value : "");
    var draw = parseFloat(drawEl ? drawEl.value : "");
    var away = parseFloat(awayEl ? awayEl.value : "");

    if (!(home > 1) || !(draw > 1) || !(away > 1)) {
      alert("Enter valid decimal odds greater than 1.00 for all three outcomes.");
      return;
    }

    var invHome = 1 / home;
    var invDraw = 1 / draw;
    var invAway = 1 / away;
    var total = invHome + invDraw + invAway;

    var probs = {
      home: invHome / total * 100,
      draw: invDraw / total * 100,
      away: invAway / total * 100
    };

    var values = [
      { key: "home", label: "Home win", value: probs.home },
      { key: "draw", label: "Draw", value: probs.draw },
      { key: "away", label: "Away win", value: probs.away }
    ];

    values.sort(function (a, b) {
      return b.value - a.value;
    });

    var result = values[0];

    var resultEl = byId("predictionResult");
    var confidenceEl = byId("confidence");
    var homeProbEl = byId("homeProb");
    var drawProbEl = byId("drawProb");
    var awayProbEl = byId("awayProb");

    if (resultEl) resultEl.textContent = result.label;
    if (confidenceEl) confidenceEl.textContent = result.value.toFixed(1) + "%";

    if (homeProbEl) homeProbEl.textContent = probs.home.toFixed(1) + "%";
    if (drawProbEl) drawProbEl.textContent = probs.draw.toFixed(1) + "%";
    if (awayProbEl) awayProbEl.textContent = probs.away.toFixed(1) + "%";

    var history = [];
    try {
      history = JSON.parse(localStorage.getItem("gmHistory") || "[]");
    } catch (e) {
      history = [];
    }

    history.unshift({
      time: new Date().toLocaleString(),
      prediction: result.label,
      confidence: result.value.toFixed(1) + "%"
    });

    localStorage.setItem("gmHistory", JSON.stringify(history.slice(0, 20)));
    renderHistory();
  }

  function renderHistory() {
    var container = byId("history");
    if (!container) return;

    var history = [];
    try {
      history = JSON.parse(localStorage.getItem("gmHistory") || "[]");
    } catch (e) {
      history = [];
    }

    if (!history.length) {
      container.innerHTML = '<div class="empty">No predictions yet.</div>';
      return;
    }

    container.innerHTML = history.map(function (item) {
      return (
        '<div class="history-item">' +
        '<div><strong>' + escapeHtml(item.prediction) + "</strong>" +
        '<small>' + escapeHtml(item.time) + "</small></div>" +
        '<span>' + escapeHtml(item.confidence) + "</span>" +
        "</div>"
      );
    }).join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Expose functions because the HTML uses onclick attributes.
  window.openAuth = openAuth;
  window.closeAuth = closeAuth;
  window.submitAuth = submitAuth;
  window.logout = logout;
  window.initDash = initDash;
  window.setupImage = setupImage;
  window.analyze = analyze;
  window.renderHistory = renderHistory;

  document.addEventListener("DOMContentLoaded", function () {
    var form = byId("authForm");
    if (form) form.addEventListener("submit", submitAuth);

    var path = window.location.pathname;
    if (path.endsWith("/dashboard.html") || path.endsWith("dashboard.html")) {
      initDash();
    }

    var modal = byId("authModal");
    if (modal) {
      modal.addEventListener("click", function (event) {
        if (event.target === modal) closeAuth();
      });
    }
  });
})();
