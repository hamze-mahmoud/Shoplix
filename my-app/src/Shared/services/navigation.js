// Lightweight navigation bridge so non-component modules (toast service,
// contexts mounted outside <Router>) can perform SPA navigation. A component
// rendered *inside* the router registers react-router's navigate via
// setNavigator(); navigateTo() then uses it, falling back to a hard navigation.
let _navigate = null;

export const setNavigator = (fn) => {
  _navigate = fn;
};

export const navigateTo = (to) => {
  if (typeof _navigate === "function") {
    _navigate(to);
  } else {
    window.location.assign(to);
  }
};
