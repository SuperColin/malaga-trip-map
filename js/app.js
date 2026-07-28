(function () {
  "use strict";

  const APARTMENT = { lat: 36.71885, lng: -4.42410, name: "The apartment", desc: "Calle Sebastián Souviron, next to Mercado de Atarazanas — home base for the week." };
  const MAP_CENTER = [36.7200, -4.4160];
  const MAP_ZOOM = 15;

  const el = (sel) => document.querySelector(sel);
  const FAV_KEY = "malagaMapFavorites";
  const HEART_SVG = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 21s-7.28-4.35-9.9-9.02C.36 8.77 1.7 5 5.4 5c2.02 0 3.42 1.06 4.4 2.6C10.78 6.06 12.18 5 14.2 5c3.7 0 5.04 3.77 3.3 6.98C19.28 16.65 12 21 12 21z" fill="currentColor" fill-opacity="0" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

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

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: "abcd"
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    // Home marker for the apartment
    const homeIcon = L.divIcon({
      className: "",
      html: `<div class="poi-marker home"><div class="poi-pin animate-in" style="background:#241d16"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg></div></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 30]
    });
    const homeMarker = L.marker([APARTMENT.lat, APARTMENT.lng], { icon: homeIcon, zIndexOffset: 1000 }).addTo(map);
    homeMarker.bindTooltip(`<strong>${APARTMENT.name}</strong>`, { direction: "top", offset: [0, -28], className: "home-tip" });
  }

  function bindGlobalUI() {
    el("#sidebarClose").addEventListener("click", closeSidebar);
    scrim.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSidebar(); });

    listToggle.addEventListener("click", () => {
      state.listOpen = !state.listOpen;
      listToggle.setAttribute("aria-pressed", String(state.listOpen));
      listToggle.setAttribute("aria-label", state.listOpen ? "Show map view" : "Show list view");
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
      { key: "all", label: "All", color: "#241d16", count: state.pois.length },
      { key: "saved", label: "Saved", saved: true, count: state.favorites.size },
    ].concat(
      cats.map((c) => ({ key: c, label: CATEGORY_META[c].label, color: CATEGORY_META[c].color, count: counts[c] }))
    );

    filtersEl.innerHTML = "";
    chips.forEach((c) => {
      const btn = document.createElement("button");
      btn.className = "chip" + (c.saved ? " chip-saved" : "") + (c.key === state.activeCategory ? " active" : "");
      btn.dataset.cat = c.key;
      const marker = c.saved
        ? `<span class="chip-heart">${HEART_SVG}</span>`
        : `<span class="dot" style="background:${c.color}"></span>`;
      btn.innerHTML = `${marker}${c.label} <span class="count">${c.count}</span>`;
      btn.addEventListener("click", () => setActiveCategory(c.key));
      filtersEl.appendChild(btn);
    });
  }

  function setActiveCategory(cat) {
    state.activeCategory = cat;
    filtersEl.querySelectorAll(".chip").forEach((b) => b.classList.toggle("active", b.dataset.cat === cat));
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
        iconSize: [34, 34],
        iconAnchor: [17, 30]
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
      ? `<div class="sb-tip"><span class="sb-tip-label">Antonio says</span>${escapeHtml(poi.hostTip)}</div>`
      : "";

    const linksHtml = [
      poi.googleMapsUrl ? `<a class="sb-btn primary" target="_blank" rel="noopener" href="${poi.googleMapsUrl}">Open in Google Maps</a>` : "",
      poi.tripAdvisorUrl ? `<a class="sb-btn secondary" target="_blank" rel="noopener" href="${poi.tripAdvisorUrl}">TripAdvisor</a>` : "",
    ].join("");

    sidebarContent.innerHTML = `
      <div class="sb-hero">
        <img src="${poi.imageUrl || ""}" alt="${escapeHtml(poi.name)}">
        <div class="sb-hero-fade"></div>
        <div class="sb-hero-cat"><span class="swatch" style="background:${meta.color}"></span>${meta.label}</div>
        <button class="sb-fav-btn${isFavorite(poi.id) ? " active" : ""}" data-id="${poi.id}" aria-pressed="${isFavorite(poi.id)}" aria-label="Save to favorites">${HEART_SVG}</button>
      </div>
      <div class="sb-body">
        <h2 class="sb-title">${escapeHtml(poi.name)}</h2>
        <p class="sb-address">${escapeHtml(poi.address || "")}</p>
        <div class="sb-stats">${statsHtml}</div>
        <p class="sb-desc">${escapeHtml(poi.fullDescription || poi.shortDescription || "")}</p>
        ${tipHtml}
        <div class="sb-actions">${linksHtml}</div>
      </div>
    `;
    sidebarContent.querySelector(".sb-fav-btn").addEventListener("click", () => toggleFavorite(poi.id));
    if (poi.imageCredit) {
      const credit = document.createElement("div");
      credit.style.cssText = "font-size:10.5px;color:var(--ink-faint);margin-top:14px;";
      credit.textContent = "Photo: " + poi.imageCredit;
      sidebarContent.querySelector(".sb-body").appendChild(credit);
    }

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
        <img src="${poi.imageUrl || ""}" alt="">
        <div class="list-card-body">
          <div class="list-card-cat" style="color:${meta.color}">${meta.label}</div>
          <div class="list-card-name">${escapeHtml(poi.name)}</div>
          <div class="list-card-desc">${escapeHtml(poi.shortDescription || "")}</div>
        </div>
        <button class="list-fav-btn${isFavorite(poi.id) ? " active" : ""}" data-id="${poi.id}" aria-pressed="${isFavorite(poi.id)}" aria-label="Save to favorites">${HEART_SVG}</button>`;
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
