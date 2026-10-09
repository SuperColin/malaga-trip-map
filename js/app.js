(function () {
  "use strict";

  const APARTMENT = { lat: 36.71885, lng: -4.42410, name: "The apartment", desc: "Calle Sebastián Souviron, next to Mercado de Atarazanas — home base for the week." };
  const MAP_CENTER = [36.7200, -4.4160];
  const MAP_ZOOM = 15;

  const el = (sel) => document.querySelector(sel);
  const FAV_KEY = "malagaMapFavorites";
  const ALL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>';
  const HEART_SVG = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="currentColor" fill-opacity="0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function loadFavorites() {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); }
    catch (e) { return new Set(); }
  }

  const state = { pois: [], activeCategory: "all", activePoi: null, listOpen: false, favorites: loadFavorites() };

  const veil = el("#veil");
  const filtersEl = el("#filters");
  const popover = el("#popover");
  const sidebar = el("#sidebar");
  const sidebarContent = el("#sidebarContent");
  const scrim = el("#scrim");
  const listView = el("#listView");
  const listGrid = el("#listGrid");
  const mapEl = el("#map");
  const listToggle = el("#listToggle");

  let map, markersLayer, markerIndex = {};

  init();

  async function init() {
    initMap();
    bindGlobalUI();
    try {
      const res = await fetch("data/pois.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      state.pois = await res.json();
    } catch (err) {
      console.error("Could not load POI data", err);
      el(".veil-sub").textContent = "Couldn't load the places yet — check back soon.";
      return;
    }
    buildFilters();
    renderMarkers();
    renderListView();
    setTimeout(() => veil.classList.add("hidden"), 350);
  }

  function initMap() {
    map = L.map("map", { zoomControl: false, attributionControl: true, tap: true })
      .setView(MAP_CENTER, MAP_ZOOM);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=" + window.CARTO_KEY, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
      subdomains: "abcd"
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    // Home marker for the apartment
    const homeIcon = L.divIcon({
      className: "",
      html: `<div class="poi-marker home"><div class="poi-pin animate-in" style="background:#222"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div></div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });
    const homeMarker = L.marker([APARTMENT.lat, APARTMENT.lng], { icon: homeIcon, zIndexOffset: 1000 }).addTo(map);
    homeMarker.bindTooltip(`<strong>${APARTMENT.name}</strong>`, { direction: "top", offset: [0, -22], className: "home-tip" });
  }

  function bindGlobalUI() {
    el("#sidebarClose").addEventListener("click", closeSidebar);
    scrim.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSidebar(); });

    listToggle.addEventListener("click", () => {
      state.listOpen = !state.listOpen;
      listToggle.setAttribute("aria-pressed", String(state.listOpen));
      listToggle.setAttribute("aria-label", state.listOpen ? "Show map view" : "Show list view");
      listToggle.querySelector(".vt-label").textContent = state.listOpen ? "Map" : "List";
      listView.classList.toggle("open", state.listOpen);
      mapEl.classList.toggle("hidden-under-list", state.listOpen);
      if (state.listOpen) hidePopover();
    });
  }

  function buildFilters() {
    const counts = {};
    state.pois.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
    const cats = Object.keys(CATEGORY_META).filter((c) => counts[c]);

    const chips = [
      { key: "all", label: "All", icon: ALL_SVG, count: state.pois.length },
      { key: "saved", label: "Saved", saved: true, icon: HEART_SVG, count: state.favorites.size },
    ].concat(
      cats.map((c) => ({ key: c, label: CATEGORY_META[c].label, icon: CATEGORY_META[c].icon, count: counts[c] }))
    );

    filtersEl.innerHTML = "";
    chips.forEach((c) => {
      const btn = document.createElement("button");
      btn.className = "chip" + (c.saved ? " chip-saved" : "") + (c.key === state.activeCategory ? " active" : "");
      btn.dataset.cat = c.key;
      btn.setAttribute("aria-pressed", String(c.key === state.activeCategory));
      btn.innerHTML = `${c.icon}<span>${c.label}<span class="count">${c.count}</span></span>`;
      btn.addEventListener("click", () => setActiveCategory(c.key));
      filtersEl.appendChild(btn);
    });
  }

  function setActiveCategory(cat) {
    state.activeCategory = cat;
    filtersEl.querySelectorAll(".chip").forEach((b) => {
      b.classList.toggle("active", b.dataset.cat === cat);
      b.setAttribute("aria-pressed", String(b.dataset.cat === cat));
    });
    renderMarkers();
    renderListView();
  }

  function visiblePois() {
    if (state.activeCategory === "all") return state.pois;
    if (state.activeCategory === "saved") return state.pois.filter((p) => state.favorites.has(p.id));
    return state.pois.filter((p) => p.category === state.activeCategory);
  }

  function isFavorite(id) {
    return state.favorites.has(id);
  }

  function toggleFavorite(id) {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    try { localStorage.setItem(FAV_KEY, JSON.stringify([...state.favorites])); } catch (e) {}

    buildFilters();
    renderMarkers();
    renderListView();

    const sbBtn = sidebarContent.querySelector(".sb-fav-btn");
    if (sbBtn && sbBtn.dataset.id === id) {
      sbBtn.classList.toggle("active", isFavorite(id));
      sbBtn.setAttribute("aria-pressed", String(isFavorite(id)));
    }
  }

  function renderMarkers() {
    markersLayer.clearLayers();
    markerIndex = {};
    visiblePois().forEach((poi, i) => {
      const meta = CATEGORY_META[poi.category] || CATEGORY_META.restaurant;
      const favBadge = isFavorite(poi.id) ? '<div class="pin-fav-badge">' + HEART_SVG + "</div>" : "";
      const icon = L.divIcon({
        className: "",
        html: `<div class="poi-marker" data-id="${poi.id}"><div class="poi-pin animate-in" style="background:${meta.color}; animation-delay:${Math.min(i * 22, 400)}ms">${meta.icon}${favBadge}</div></div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });
      const marker = L.marker([poi.lat, poi.lng], { icon, riseOnHover: true }).addTo(markersLayer);
      markerIndex[poi.id] = marker;

      marker.on("mouseover", (e) => showPopover(poi, e));
      marker.on("mousemove", (e) => positionPopover(e));
      marker.on("mouseout", hidePopover);
      marker.on("click", () => openSidebar(poi));
    });
  }

  function showPopover(poi, e) {
    if (window.matchMedia("(hover: none)").matches) return;
    popover.querySelector("img").src = poi.imageUrl || "";
    popover.querySelector("img").alt = poi.name;
    popover.querySelector(".popover-cat").textContent = (CATEGORY_META[poi.category] || {}).label || poi.category;
    popover.querySelector(".popover-name").textContent = poi.name;
    popover.querySelector(".popover-desc").textContent = poi.shortDescription || "";
    popover.querySelector(".popover-rating").textContent = poi.rating ? poi.rating.toFixed(1) : "";
    popover.querySelector(".popover-price").textContent = poi.priceLevel || "";
    const favEl = popover.querySelector(".popover-fav");
    favEl.innerHTML = HEART_SVG;
    favEl.classList.toggle("visible", isFavorite(poi.id));
    popover.hidden = false;
    requestAnimationFrame(() => popover.classList.add("visible"));
    positionPopover(e);

    document.querySelectorAll(".poi-marker").forEach((m) => m.classList.toggle("active", m.dataset.id === poi.id));
  }

  function positionPopover(e) {
    if (popover.hidden) return;
    const pad = 16;
    const pw = popover.offsetWidth || 248;
    const ph = popover.offsetHeight || 180;
    const pt = e.originalEvent || e;
    let x = (pt.clientX ?? window.innerWidth / 2) + 18;
    let y = (pt.clientY ?? window.innerHeight / 2) - ph - 12;
    if (x + pw + pad > window.innerWidth) x = (pt.clientX ?? 0) - pw - 18;
    if (y < pad) y = (pt.clientY ?? 0) + 18;
    popover.style.left = x + "px";
    popover.style.top = y + "px";
  }

  function hidePopover() {
    popover.classList.remove("visible");
    setTimeout(() => { if (!popover.classList.contains("visible")) popover.hidden = true; }, 160);
    document.querySelectorAll(".poi-marker.active").forEach((m) => m.classList.remove("active"));
  }

  function openSidebar(poi) {
    state.activePoi = poi;
    hidePopover();
    const meta = CATEGORY_META[poi.category] || CATEGORY_META.restaurant;

    const statsHtml = [
      poi.rating ? `<span class="sb-stat rating">${poi.rating.toFixed(1)}</span>` : "",
      poi.priceLevel ? `<span class="sb-stat">${poi.priceLevel}</span>` : "",
    ].join("");

    const tipHtml = poi.hostTip
      ? `<div class="sb-tip"><span class="sb-tip-label">The tip</span><p class="sb-tip-text">${escapeHtml(poi.hostTip)}</p></div>`
      : "";

    const linksHtml = [
      poi.googleMapsUrl ? `<a class="sb-btn primary" target="_blank" rel="noopener" href="${poi.googleMapsUrl}">Open in Google Maps</a>` : "",
      poi.tripAdvisorUrl ? `<a class="sb-btn secondary" target="_blank" rel="noopener" href="${poi.tripAdvisorUrl}">TripAdvisor</a>` : "",
    ].join("");

    sidebarContent.innerHTML = `
      <div class="sb-hero">
        <img src="${poi.imageUrl || ""}" alt="${escapeHtml(poi.name)}">
        <button class="sb-fav-btn${isFavorite(poi.id) ? " active" : ""}" data-id="${poi.id}" aria-pressed="${isFavorite(poi.id)}" aria-label="Save to favorites">${HEART_SVG}</button>
      </div>
      <div class="sb-body">
        <p class="sb-cat"><span class="swatch" style="background:${meta.color}"></span>${meta.label}</p>
        <h2 class="sb-title">${escapeHtml(poi.name)}</h2>
        <p class="sb-address">${escapeHtml(poi.address || "")}</p>
        <div class="sb-stats">${statsHtml}</div>
        ${tipHtml}
        <p class="sb-desc">${escapeHtml(poi.fullDescription || poi.shortDescription || "")}</p>
        ${poi.imageCredit ? `<p class="sb-credit">Photo: ${escapeHtml(poi.imageCredit)}</p>` : ""}
      </div>
      <div class="sb-footer">${linksHtml}</div>
    `;
    sidebarContent.querySelector(".sb-fav-btn").addEventListener("click", () => toggleFavorite(poi.id));
    sidebar.scrollTop = 0;

    sidebar.classList.add("open");
    sidebar.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add("visible"));

    document.querySelectorAll(".poi-marker").forEach((m) => m.classList.toggle("active", m.dataset.id === poi.id));

    if (markerIndex[poi.id] && map.getZoom() < 16) {
      map.flyTo([poi.lat, poi.lng], 16, { duration: 0.6 });
    }
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebar.setAttribute("aria-hidden", "true");
    scrim.classList.remove("visible");
    setTimeout(() => { scrim.hidden = true; }, 300);
    document.querySelectorAll(".poi-marker.active").forEach((m) => m.classList.remove("active"));
    state.activePoi = null;
  }

  function renderListView() {
    listGrid.innerHTML = "";
    visiblePois().forEach((poi) => {
      const card = document.createElement("div");
      card.className = "list-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      const meta = CATEGORY_META[poi.category] || CATEGORY_META.restaurant;
      card.innerHTML = `
        <div class="list-media">
          <img src="${poi.imageUrl || ""}" alt="" loading="lazy">
          <button class="list-fav-btn${isFavorite(poi.id) ? " active" : ""}" data-id="${poi.id}" aria-pressed="${isFavorite(poi.id)}" aria-label="Save ${escapeHtml(poi.name)} to favorites">${HEART_SVG}</button>
        </div>
        <div>
          <div class="list-head">
            <div class="list-card-name">${escapeHtml(poi.name)}</div>
            ${poi.rating ? `<div class="list-rating">${poi.rating.toFixed(1)}</div>` : ""}
          </div>
          <div class="list-card-cat">${meta.label}${poi.priceLevel ? " · " + poi.priceLevel : ""}</div>
          <div class="list-card-desc">${escapeHtml(poi.shortDescription || "")}</div>
        </div>`;
      card.addEventListener("click", () => openSidebar(poi));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSidebar(poi); }
      });
      card.querySelector(".list-fav-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(poi.id);
      });
      listGrid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
})();
