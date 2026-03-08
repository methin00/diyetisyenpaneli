;(function () {
  var currentScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script")
      return scripts[scripts.length - 1] || null
    })()

  if (!currentScript) return

  var siteKey = (currentScript.getAttribute("data-site-key") || "").trim()
  if (!siteKey) {
    console.error("[Diyetisyen Embed] data-site-key zorunludur.")
    return
  }

  var srcUrl = currentScript.getAttribute("src") || ""
  var defaultPanelUrl = ""
  try {
    defaultPanelUrl = new URL(srcUrl, window.location.href).origin
  } catch (_e) {
    defaultPanelUrl = window.location.origin
  }

  var panelUrl = (currentScript.getAttribute("data-panel-url") || defaultPanelUrl).replace(/\/+$/, "")
  var targetSelector = currentScript.getAttribute("data-target") || "#diyetisyen-embed"
  var sectionsAttr = (currentScript.getAttribute("data-sections") || "packages,recipes,blogs,appointment").toLowerCase()
  var sections = new Set(
    sectionsAttr
      .split(",")
      .map(function (s) {
        return s.trim()
      })
      .filter(Boolean)
  )

  var maxPackages = parseInt(currentScript.getAttribute("data-max-packages") || "6", 10)
  var maxRecipes = parseInt(currentScript.getAttribute("data-max-recipes") || "6", 10)
  var maxBlogs = parseInt(currentScript.getAttribute("data-max-blogs") || "6", 10)

  if (!isFinite(maxPackages) || maxPackages < 1) maxPackages = 6
  if (!isFinite(maxRecipes) || maxRecipes < 1) maxRecipes = 6
  if (!isFinite(maxBlogs) || maxBlogs < 1) maxBlogs = 6

  var root = document.querySelector(targetSelector)
  if (!root) {
    root = document.createElement("div")
    root.id = targetSelector.replace(/^#/, "") || "diyetisyen-embed"
    currentScript.parentNode.insertBefore(root, currentScript.nextSibling)
  }

  var STYLE_ID = "diyetisyen-embed-style"
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = [
      ".dp-embed{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;line-height:1.5}",
      ".dp-embed *{box-sizing:border-box}",
      ".dp-embed .dp-wrap{max-width:1100px;margin:0 auto;padding:16px}",
      ".dp-embed .dp-header{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:16px}",
      ".dp-embed .dp-title{margin:0;font-size:22px;font-weight:700}",
      ".dp-embed .dp-sub{margin:0;color:#6b7280;font-size:14px}",
      ".dp-embed .dp-section{margin-top:22px}",
      ".dp-embed .dp-section h3{margin:0 0 10px;font-size:18px}",
      ".dp-embed .dp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}",
      ".dp-embed .dp-card{border:1px solid #e5e7eb;border-radius:12px;background:#fff;overflow:hidden}",
      ".dp-embed .dp-card-body{padding:12px}",
      ".dp-embed .dp-card h4{margin:0 0 6px;font-size:16px;line-height:1.3}",
      ".dp-embed .dp-card p{margin:0;color:#4b5563;font-size:14px}",
      ".dp-embed .dp-meta{margin-top:8px;color:#6b7280;font-size:12px}",
      ".dp-embed .dp-image{width:100%;height:150px;object-fit:cover;background:#f3f4f6;display:block}",
      ".dp-embed .dp-empty{border:1px dashed #d1d5db;border-radius:12px;padding:14px;color:#6b7280;font-size:14px}",
      ".dp-embed .dp-error{border:1px solid #fecaca;background:#fef2f2;color:#991b1b;border-radius:12px;padding:12px}",
      ".dp-embed .dp-loading{color:#6b7280;font-size:14px}",
      ".dp-embed .dp-iframe{width:100%;min-height:660px;border:0;border-radius:12px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.05)}",
      ".dp-embed .dp-badge{display:inline-block;padding:3px 8px;border-radius:999px;background:#f3f4f6;color:#374151;font-size:12px;font-weight:600}",
      "@media (max-width:640px){.dp-embed .dp-wrap{padding:10px}.dp-embed .dp-title{font-size:19px}.dp-embed .dp-iframe{min-height:720px}}",
    ].join("")
    document.head.appendChild(style)
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  function formatDate(isoString) {
    if (!isoString) return "-"
    var date = new Date(isoString)
    if (isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })
  }

  function renderError(message) {
    root.innerHTML =
      '<div class="dp-embed"><div class="dp-wrap"><div class="dp-error">' +
      escapeHtml(message || "Beklenmeyen bir hata oluştu.") +
      "</div></div></div>"
  }

  function renderLoading() {
    root.innerHTML =
      '<div class="dp-embed"><div class="dp-wrap"><div class="dp-loading">İçerikler yükleniyor...</div></div></div>'
  }

  function renderSection(title, cardsHtml) {
    if (!cardsHtml) return ""
    return (
      '<section class="dp-section"><h3>' +
      escapeHtml(title) +
      '</h3><div class="dp-grid">' +
      cardsHtml +
      "</div></section>"
    )
  }

  function renderPackages(list) {
    if (!list || !list.length) return '<div class="dp-empty">Henüz paket bulunmuyor.</div>'
    return list
      .slice(0, maxPackages)
      .map(function (p) {
        var description = p.description ? "<p>" + escapeHtml(p.description) + "</p>" : ""
        return (
          '<article class="dp-card"><div class="dp-card-body"><h4>' +
          escapeHtml(p.title || "Paket") +
          '</h4><span class="dp-badge">' +
          escapeHtml(p.session_count || 0) +
          " seans</span>" +
          description +
          '<div class="dp-meta">' +
          escapeHtml(Number(p.price || 0).toLocaleString("tr-TR")) +
          " " +
          escapeHtml(p.currency || "TRY") +
          "</div></div></article>"
        )
      })
      .join("")
  }

  function renderRecipes(list) {
    if (!list || !list.length) return '<div class="dp-empty">Henüz tarif bulunmuyor.</div>'
    return list
      .slice(0, maxRecipes)
      .map(function (r) {
        var image = r.image_url
          ? '<img class="dp-image" loading="lazy" src="' + escapeHtml(r.image_url) + '" alt="' + escapeHtml(r.title || "Tarif") + '"/>'
          : '<div class="dp-image"></div>'
        var description = r.description ? "<p>" + escapeHtml(r.description) + "</p>" : ""
        return (
          '<article class="dp-card">' +
          image +
          '<div class="dp-card-body"><h4>' +
          escapeHtml(r.title || "Tarif") +
          "</h4>" +
          description +
          '<div class="dp-meta">Hazırlık: ' +
          escapeHtml(r.prep_time_minutes || "-") +
          " dk</div></div></article>"
        )
      })
      .join("")
  }

  function renderBlogs(list) {
    if (!list || !list.length) return '<div class="dp-empty">Henüz blog yazısı bulunmuyor.</div>'
    return list
      .slice(0, maxBlogs)
      .map(function (b) {
        var image = b.cover_image_url
          ? '<img class="dp-image" loading="lazy" src="' +
            escapeHtml(b.cover_image_url) +
            '" alt="' +
            escapeHtml(b.title || "Blog") +
            '"/>'
          : '<div class="dp-image"></div>'
        var excerpt = b.excerpt ? "<p>" + escapeHtml(b.excerpt) + "</p>" : ""
        return (
          '<article class="dp-card">' +
          image +
          '<div class="dp-card-body"><h4>' +
          escapeHtml(b.title || "Blog yazısı") +
          "</h4>" +
          excerpt +
          '<div class="dp-meta">' +
          formatDate(b.published_at || b.created_at) +
          "</div></div></article>"
        )
      })
      .join("")
  }

  function renderAppointment(widgetUrl) {
    if (!widgetUrl) return '<div class="dp-empty">Randevu formu şu anda kullanılamıyor.</div>'
    return (
      '<section class="dp-section"><h3>Randevu Formu</h3><iframe class="dp-iframe" loading="lazy" title="Randevu Formu" src="' +
      escapeHtml(widgetUrl) +
      '"></iframe></section>'
    )
  }

  function renderAll(data) {
    var dietitian = data && data.dietitian ? data.dietitian : null
    var fullName = dietitian ? [dietitian.title, dietitian.first_name, dietitian.last_name].filter(Boolean).join(" ") : "Diyetisyen"

    var html =
      '<div class="dp-embed"><div class="dp-wrap"><div class="dp-header"><div><h2 class="dp-title">' +
      escapeHtml(fullName) +
      '</h2><p class="dp-sub">Güncel içerikler otomatik olarak bu panelden çekilir.</p></div></div>'

    if (sections.has("packages")) {
      html += renderSection("Paketler", renderPackages(data.packages || []))
    }
    if (sections.has("recipes")) {
      html += renderSection("Tarifler", renderRecipes(data.recipes || []))
    }
    if (sections.has("blogs")) {
      html += renderSection("Blog Yazıları", renderBlogs(data.blogs || []))
    }
    if (sections.has("appointment")) {
      html += renderAppointment(data.appointment_form && data.appointment_form.widget_url)
    }

    html += "</div></div>"
    root.innerHTML = html
  }

  renderLoading()

  var url = panelUrl + "/api/public/content?site_key=" + encodeURIComponent(siteKey)

  fetch(url, { method: "GET", headers: { Accept: "application/json" } })
    .then(function (res) {
      if (!res.ok) throw new Error("İçerik endpoint yanıtı başarısız: " + res.status)
      return res.json()
    })
    .then(function (data) {
      renderAll(data || {})
    })
    .catch(function (err) {
      console.error("[Diyetisyen Embed]", err)
      renderError("İçerikler yüklenemedi. Lütfen site key ve panel URL bilgisini kontrol edin.")
    })
})()
