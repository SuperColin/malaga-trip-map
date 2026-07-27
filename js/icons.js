/* Category metadata: color + inline SVG icon (stroke uses currentColor, white). */
const CATEGORY_META = {
  restaurant: {
    label: "Restaurant",
    color: "#c1502e",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2v8a2 2 0 0 0 2 2v10"/><path d="M7 2v6M11 2v6"/><path d="M17 2c-1.5 1.5-2 3.5-2 6s1 4 2 4v10"/></svg>'
  },
  bar: {
    label: "Bar",
    color: "#b6811f",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h14l-6 8v8h3M8 19h6M13 11L5 3"/></svg>'
  },
  cafe: {
    label: "Café",
    color: "#8c5a2b",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M6 3c-.7.7-.7 1.3 0 2M10 3c-.7.7-.7 1.3 0 2"/></svg>'
  },
  market: {
    label: "Market",
    color: "#6f7d3c",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8l1.5-4h13L20 8"/><rect x="4" y="8" width="16" height="12" rx="1"/><path d="M9 12v4M15 12v4"/></svg>'
  },
  beach: {
    label: "Beach",
    color: "#1c9aa6",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5S16 18 18 18s2-1.5 4-1.5"/><path d="M12 13V3M12 3c3 0 5 2 5 5-3 0-5-2-5-5zM12 8c-2.5 0-4.5 2-4.5 4.5C10 12.5 12 10.5 12 8z"/></svg>'
  },
  viewpoint: {
    label: "Viewpoint",
    color: "#1c6e8c",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20l6-11 4 6 3-4 7 9z"/><circle cx="18" cy="6" r="2.4"/></svg>'
  },
  monument: {
    label: "Landmark",
    color: "#93765a",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16"/><path d="M6 21V9M10 21V9M14 21V9M18 21V9"/><path d="M3 9l9-6 9 6"/><path d="M9 9h6v-2a3 3 0 0 0-6 0z"/></svg>'
  },
  park: {
    label: "Garden",
    color: "#4c7a3f",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7"/><path d="M12 15c-4 0-7-3-7-7 4 0 7 3 7 7zM12 15c4 0 7-3 7-7-4 0-7 3-7 7z"/><path d="M12 8c-2.5-1-3-3.5-3-6 2.5 1 3 3.5 3 6zM12 8c2.5-1 3-3.5 3-6-2.5 1-3 3.5-3 6z"/></svg>'
  },
  walk: {
    label: "Walk",
    color: "#3d7a6e",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="5" r="2"/><path d="M14 22l1-6-3-2 1-5"/><path d="M9 22l2-6-2-3 3-4 3 2 2 3"/></svg>'
  }
};
