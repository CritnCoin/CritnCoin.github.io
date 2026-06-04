/* =====================================================================
   CritNCoin Studios — blog.js  (JSON-driven dev log)
   No build tools. Add a post by editing posts.json — nothing else.

   Two roles, auto-detected by which container exists on the page:
     * #devlog-list   -> renders the list of post cards
     * #post-article  -> renders one full post from ?id=<slug>

   Each container declares where its data lives via data-posts="posts.json"
   (relative to that HTML page), so paths work at any folder depth.

   Requires a server (Live Server / GitHub Pages) because it uses fetch().
   ===================================================================== */
(function () {
  "use strict";

  var listEl = document.getElementById("devlog-list");
  var articleEl = document.getElementById("post-article");
  if (!listEl && !articleEl) return; /* not a blog page */

  var host = listEl || articleEl;
  var dataUrl = host.getAttribute("data-posts") || "posts.json";

  /* ---- helpers ---------------------------------------------------- */
  function fmtDate(iso) {
    try {
      var d = new Date(iso + "T00:00:00");
      if (isNaN(d)) return iso;
      return d.toLocaleDateString(undefined, {
        year: "numeric", month: "long", day: "numeric"
      });
    } catch (e) { return iso; }
  }
  function catClass(cat) {
    return "category-tag " + String(cat || "").toLowerCase().replace(/[^a-z]/g, "");
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function byDateDesc(a, b) {
    return String(b.date).localeCompare(String(a.date));
  }
  function showError(target, msg) {
    target.innerHTML =
      '<div class="empty-panel"><h3>The pages are sealed</h3>' +
      '<p class="muted">' + escapeHtml(msg) + "</p></div>";
  }

  /* ---- load ------------------------------------------------------- */
  fetch(dataUrl)
    .then(function (r) {
      if (!r.ok) throw new Error("Could not load posts (" + r.status + ").");
      return r.json();
    })
    .then(function (posts) {
      if (!Array.isArray(posts)) throw new Error("Post data is malformed.");
      posts.sort(byDateDesc);
      if (listEl) renderList(posts);
      if (articleEl) renderPost(posts);
    })
    .catch(function (err) {
      var target = listEl || articleEl;
      showError(target, err.message +
        " (A local server is required — open the site through Live Server.)");
    });

  /* ---- list view -------------------------------------------------- */
  function renderList(posts) {
    if (!posts.length) {
      listEl.innerHTML =
        '<div class="empty-panel"><h3>No entries yet</h3>' +
        '<p class="muted">The first dev log entries are being written.</p></div>';
      return;
    }
    var html = posts.map(function (p) {
      var tag = p.category
        ? '<span class="' + catClass(p.category) + '">' + escapeHtml(p.category) + "</span>"
        : "";
      return (
        '<article class="devlog-card">' +
          '<div class="devlog-meta">' +
            '<span class="date-badge">' + escapeHtml(fmtDate(p.date)) + "</span>" +
            tag +
          "</div>" +
          "<h3>" + escapeHtml(p.title) + "</h3>" +
          "<p>" + escapeHtml(p.preview || "") + "</p>" +
          '<div class="card-actions">' +
            '<a class="btn-ornate btn-ornate-gold" href="post.html?id=' +
              encodeURIComponent(p.id) + '">Read More</a>' +
          "</div>" +
        "</article>"
      );
    }).join("");
    listEl.innerHTML = html;
    if (window.CritReveal) window.CritReveal(listEl);
  }

  /* ---- single post view ------------------------------------------ */
  function renderPost(posts) {
    var id = new URLSearchParams(window.location.search).get("id");
    var post = posts.filter(function (p) { return p.id === id; })[0];

    if (!post) {
      articleEl.innerHTML =
        '<div class="empty-panel"><h3>Entry not found</h3>' +
        '<p class="muted">This dev log entry could not be located.</p>' +
        '<div class="card-actions" style="justify-content:center;">' +
        '<a class="btn-ornate btn-ornate-gold" href="index.html">Back to Dev Log</a>' +
        "</div></div>";
      return;
    }

    document.title = post.title + " | Dev Log — Descent Into Darkness";
    var tag = post.category
      ? '<span class="' + catClass(post.category) + '">' + escapeHtml(post.category) + "</span>"
      : "";

    articleEl.innerHTML =
      '<div class="devlog-meta" style="justify-content:center;">' +
        '<span class="date-badge">' + escapeHtml(fmtDate(post.date)) + "</span>" + tag +
      "</div>" +
      '<h1 class="text-center">' + escapeHtml(post.title) + "</h1>" +
      '<div class="section-divider"><span class="diamond">&#9670;</span></div>' +
      '<div class="post-body panel parchment">' + (post.body || "") + "</div>" +
      '<div class="button-row" style="justify-content:center;margin-top:1.5rem;">' +
        '<a class="btn-ornate btn-ornate-gold" href="index.html">Back to Dev Log</a>' +
      "</div>";
    if (window.CritReveal) window.CritReveal(articleEl);
  }
})();
