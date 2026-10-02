let properties = [
  { id: "RPM-1001", name: "Casa Encino", type: "Casa", zone: "Mirador del Valle, Tepatitlán", price: "$2,850,000", meta: "3 recámaras · 2 baños", status: "Venta", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80" },
  { id: "RPM-1002", name: "Terreno Los Olivos", type: "Terreno", zone: "Los Olivos, Tepatitlán", price: "$980,000", meta: "420 m² · servicios", status: "Venta", imageUrl: "https://assets.easybroker.com/property_images/4488694/75166387/EB-QF8694.jpeg?version=1715970199" },
  { id: "RPM-1003", name: "Casa Centro", type: "Casa", zone: "Centro, Tepatitlán", price: "$12,500 / mes", meta: "2 recámaras · amueblada", status: "Renta", imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80" },
  { id: "RPM-1004", name: "Lote La Hacienda", type: "Terreno", zone: "La Hacienda, Arandas", price: "$735,000", meta: "250 m² · acceso controlado", status: "Venta", imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80" },
  { id: "RPM-1005", name: "Residencia Los Altos", type: "Casa", zone: "El Carmen, San Juan de los Lagos", price: "$4,250,000", meta: "4 recámaras · jardín", status: "Venta", imageUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80" },
  { id: "RPM-1006", name: "Terreno El Refugio", type: "Terreno", zone: "El Refugio, Tepatitlán", price: "$1,420,000", meta: "600 m² · esquina", status: "Publicado", imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80" },
  { id: "RPM-1007", name: "Casa Campestre", type: "Casa", zone: "Capilla de Guadalupe", price: "$2,180,000", meta: "3 recámaras · terraza", status: "Venta", imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80" },
  { id: "RPM-1008", name: "Lote Vista Norte", type: "Terreno", zone: "Vista Hermosa, Tepatitlán", price: "$1,050,000", meta: "360 m² · vista panorámica", status: "Apartado", imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80" },
];

const localAssetPrefix = window.location.pathname.includes("/rpm/") ? "../" : "";

const demoDevelopment = {
  id: "demo-terraser",
  name: "TERRASER Residencias & Hotel",
  type: "Mixto",
  city: "Tepatitlán",
  location: "Tepatitlán, Jalisco",
  price: "$1,200,000",
  units: 10,
  suites: 24,
  amenitiesCount: 17,
  coverUrl: `${localAssetPrefix}assets/terraser-cover.png`,
  description: "Desarrollo con residencias de lujo, suites de hotel, plaza comercial, restaurantes y amenidades para residentes e inversionistas.",
  amenities: ["Sky bar", "Piscina", "Restaurante", "Plaza comercial", "Conserjería 24/7", "Seguridad 24/7"],
  published: true,
  active: true,
  demo: true,
};
let developments = [demoDevelopment];

const propertyGrid = document.querySelector("#propertyGrid");
const searchInput = document.querySelector("#propertySearch");
const typeSelect = document.querySelector("#propertyType");
const toast = document.querySelector("#toast");
const defaultLogoUrl = /\/(rpm|portal)\/?(?:index\.html)?$/.test(window.location.pathname) ? "../assets/logo-altosfilm.png" : "assets/logo-altosfilm.png";
const logoStorageKey = "rpm.logoUrl";
const rememberedEmailKey = "rpm.rememberedEmail";
const rememberUntilKey = "rpm.rememberUntil";
const rememberWindowMs = 7 * 24 * 60 * 60 * 1000;
const themeStorageKey = "rpm.theme";

function initializeFirebaseTestConnection() {
  const indicator = document.querySelector("#firebaseIndicator");
  const status = document.querySelector("#firebaseStatus");
  if (!window.firebase || !window.RPM_FIREBASE_CONFIG || window.RPM_FIREBASE_CONFIG.apiKey.startsWith("REEMPLAZAR")) {
    if (status) status.textContent = "Firebase pendiente de configuración";
    if (indicator) setFirebaseIndicator("offline", "Firebase pendiente de configuración");
    return;
  }
  try {
    const app = window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(window.RPM_FIREBASE_CONFIG);
    window.rpmFirebaseApp = app;
    window.rpmDb = window.firebase.firestore(app);
    window.RPM_FIREBASE_READY = true;
    if (status) status.textContent = `Firebase de pruebas conectado · ${window.RPM_FIREBASE_CONFIG.projectId}`;
    checkFirebaseConnection();
  } catch (error) {
    window.RPM_FIREBASE_READY = false;
    if (status) status.textContent = "No se pudo conectar con Firebase de pruebas";
    if (indicator) setFirebaseIndicator("offline", "Firebase no disponible");
    console.error("Firebase initialization error", error);
  }
}

function setFirebaseIndicator(state, message) {
  const indicator = document.querySelector("#firebaseIndicator");
  if (!indicator) return;
  indicator.className = `firebase-indicator ${state}`;
  indicator.title = message;
  indicator.setAttribute("aria-label", message);
}

async function checkFirebaseConnection() {
  if (!window.rpmDb) return;
  setFirebaseIndicator("checking", "Comprobando conexión con Firebase");
  try {
    await window.rpmDb.collection("zones").limit(1).get({ source: "server" });
    setFirebaseIndicator("online", "Firebase conectado");
  } catch (error) {
    setFirebaseIndicator("offline", "Firebase desconectado o reglas pendientes");
    console.warn("Firebase connection check failed", error);
  }
}

function authMessage(error) {
  const messages = {
    "auth/invalid-credential": "El correo o la contraseña no son correctos.",
    "auth/wrong-password": "La contraseña no es correcta.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/invalid-email": "Escribe un correo electrónico válido.",
    "auth/user-disabled": "Esta cuenta está deshabilitada.",
    "auth/too-many-requests": "Demasiados intentos. Espera un momento y vuelve a intentarlo.",
  };
  return messages[error?.code] || "No fue posible iniciar sesión. Revisa tu conexión e inténtalo nuevamente.";
}

function initializeRpmAuth() {
  if (!document.body.classList.contains("confi-mode")) return;
  const gate = document.querySelector("#authGate");
  const form = document.querySelector("#loginForm");
  const errorBox = document.querySelector("#authError");
  const sessionUser = document.querySelector("#sessionUser");
  const sessionStatus = document.querySelector("#sessionStatus");
  const logoutButton = document.querySelector("#logoutDemo");
  if (!gate || !form || !window.firebase?.auth) return;

  const auth = window.firebase.auth();
  window.rpmAuth = auth;
  const rememberedEmail = localStorage.getItem(rememberedEmailKey);
  const rememberUntil = Number(localStorage.getItem(rememberUntilKey) || 0);
  if (rememberedEmail && rememberUntil > Date.now()) {
    form.email.value = rememberedEmail;
    form.remember.checked = true;
  } else if (rememberUntil && rememberUntil <= Date.now()) {
    localStorage.removeItem(rememberedEmailKey);
    localStorage.removeItem(rememberUntilKey);
  }
  document.body.classList.add("rpm-locked");
  gate.classList.add("open");
  gate.setAttribute("aria-hidden", "false");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.textContent = "Validando acceso…";
    const email = form.email.value.trim();
    const password = form.password.value;
    try {
      await auth.setPersistence(form.remember.checked ? window.firebase.auth.Auth.Persistence.LOCAL : window.firebase.auth.Auth.Persistence.SESSION);
      await auth.signInWithEmailAndPassword(email, password);
      if (form.remember.checked) {
        localStorage.setItem(rememberedEmailKey, email);
        localStorage.setItem(rememberUntilKey, String(Date.now() + rememberWindowMs));
      } else {
        localStorage.removeItem(rememberedEmailKey);
        localStorage.removeItem(rememberUntilKey);
      }
      form.reset();
    } catch (error) {
      errorBox.textContent = authMessage(error);
    }
  });

  logoutButton.addEventListener("click", async () => {
    await auth.signOut();
    showToast("Sesión cerrada correctamente.");
  });

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      document.body.classList.add("rpm-locked");
      gate.classList.add("open");
      gate.setAttribute("aria-hidden", "false");
      sessionUser.textContent = "Sin sesión activa";
      sessionStatus.textContent = "Acceso protegido";
      return;
    }

    const rememberUntil = Number(localStorage.getItem(rememberUntilKey) || 0);
    if (rememberUntil && rememberUntil <= Date.now()) {
      localStorage.removeItem(rememberedEmailKey);
      localStorage.removeItem(rememberUntilKey);
      await auth.signOut();
      errorBox.textContent = "Tu periodo de 7 días terminó. Ingresa nuevamente tu contraseña.";
      return;
    }

    try {
      const profile = await window.rpmDb.collection("users").doc(user.uid).get();
      if (!profile.exists) {
        errorBox.textContent = "La cuenta existe, pero todavía no tiene un perfil autorizado en el RPM.";
        await auth.signOut();
        return;
      }
      const role = profile.data().role;
      const allowedRoles = ["admin", "direccion", "asesor", "cobranza", "consulta"];
      if (!allowedRoles.includes(role)) {
        errorBox.textContent = "Tu cuenta no tiene un rol autorizado para entrar al RPM.";
        await auth.signOut();
        return;
      }
      sessionUser.textContent = profile.data().name || user.email;
      sessionStatus.textContent = `Sesión activa · ${role}`;
      errorBox.textContent = "";
      await loadRpmProperties();
      await loadDevelopments();
      gate.classList.remove("open");
      gate.setAttribute("aria-hidden", "true");
      document.body.classList.remove("rpm-locked");
    } catch (error) {
      errorBox.textContent = "No se pudo validar el perfil. Confirma que las reglas de Firestore estén publicadas.";
      console.error("RPM profile validation error", error);
    }
  });
}

function renderProperties() {
  const query = searchInput.value.toLowerCase().trim();
  const type = typeSelect.value;
  const filtered = properties.filter((property) => {
    if (property.active === false) return false;
    const matchesQuery = `${property.name} ${property.zone}`.toLowerCase().includes(query);
    return matchesQuery && (type === "all" || property.type === type);
  });
  propertyGrid.innerHTML = filtered.length ? filtered.map((property) => `
    <article class="property-card">
      <div class="property-visual ${property.type === "Terreno" ? "visual-terrain" : ""}" style="background-image:url('${normalizeImageUrl(property.imageUrl)}')">
        <span class="property-badge">${property.status}</span>
      </div>
      <div class="property-body">
        <h4>${property.name}</h4>
        <p>${property.zone} · ${property.meta}</p>
        <div class="property-meta"><span class="property-price">${property.price}</span><button class="text-button interest-button" data-property="${property.name}">Me interesa →</button></div>
      </div>
    </article>`).join("") : `<div class="empty-state glass-panel"><h3>No encontramos coincidencias</h3><p>Prueba con otra zona o tipo de inmueble.</p></div>`;
  document.querySelectorAll(".interest-button").forEach((button) => button.addEventListener("click", () => openLeadModal(button.dataset.property)));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function propertyTagClass(status) {
  if (["Vendido", "Rentado"].includes(status)) return "orange";
  if (["Publicado", "Apartado"].includes(status)) return "blue";
  return "green";
}

function renderRpmProperties() {
  const body = document.querySelector("#rpmPropertiesBody");
  if (!body) return;
  const query = (document.querySelector("#rpmPropertySearch")?.value || "").toLowerCase().trim();
  const status = document.querySelector("#rpmPropertyStatus")?.value || "all";
  const filtered = properties.filter((property) => {
    if (property.active === false) return false;
    const searchable = `${property.id} ${property.name} ${property.zone} ${property.municipality || ""} ${property.owner || ""} ${property.advisor || ""}`.toLowerCase();
    return searchable.includes(query) && (status === "all" || property.status === status);
  });
  body.innerHTML = filtered.length ? filtered.map((property) => `
    <tr>
      <td>${escapeHtml(property.id)}</td>
      <td><strong>${escapeHtml(property.name)}</strong><small>${escapeHtml(property.type)} · ${escapeHtml(property.area || property.meta || "Sin superficie")}</small></td>
      <td>${escapeHtml(property.zone)}</td>
      <td>${escapeHtml(property.operation || property.status)} · ${escapeHtml(property.price)}</td>
      <td><strong>${escapeHtml(property.owner || "Sin propietario")}</strong><small>${escapeHtml(property.advisor || "Sin asesor")}</small></td>
      <td><span class="tag ${propertyTagClass(property.status)}">${escapeHtml(property.status)}</span></td>
      <td><div class="row-actions"><button class="text-button edit-property" data-id="${escapeHtml(property.id)}">Editar</button><button class="text-button delete-property" data-id="${escapeHtml(property.id)}">Desactivar</button></div></td>
    </tr>`).join("") : `<tr><td colspan="7"><div class="empty-state"><h3>No hay propiedades con esos filtros</h3><p>Registra un inmueble nuevo o modifica la búsqueda.</p></div></td></tr>`;
  body.querySelectorAll(".edit-property").forEach((button) => button.addEventListener("click", () => openPropertyModal(button.dataset.id)));
  body.querySelectorAll(".delete-property").forEach((button) => button.addEventListener("click", () => deleteProperty(button.dataset.id)));
}

function renderDevelopmentCard(development, mode) {
  const cover = normalizeImageUrl(development.coverUrl) || `${localAssetPrefix}assets/terraser-cover.png`;
  const amenities = Array.isArray(development.amenities) ? development.amenities : String(development.amenities || "").split(",").map((item) => item.trim()).filter(Boolean);
  const actions = mode === "rpm" ? `<div class="development-actions">${development.demo ? `<button class="secondary-button save-demo-development" data-id="${escapeHtml(development.id)}">Guardar en Firebase</button>` : `<button class="text-button edit-development" data-id="${escapeHtml(development.id)}">Editar</button><button class="text-button toggle-development" data-id="${escapeHtml(development.id)}">${development.published ? "Ocultar" : "Publicar"}</button><button class="text-button delete-development" data-id="${escapeHtml(development.id)}">Desactivar</button>`}</div>` : "";
  return `<article class="development-card glass-panel"><div class="development-cover" style="background-image:url('${escapeHtml(cover)}')"><span class="development-cover-label">${escapeHtml(development.name)}</span></div><div class="development-body"><div class="development-intro"><div><span class="eyebrow">${escapeHtml(development.city || "Ubicación pendiente")}</span><h3>${escapeHtml(development.type || "Desarrollo")}</h3><p>${escapeHtml(development.description)}</p></div><div class="development-price"><small>Precio inicial</small><strong>${escapeHtml(development.price || "Por definir")}</strong><span>${development.published ? "Publicado" : "Borrador"}</span></div></div><div class="development-stats"><div><strong>${escapeHtml(development.units || 0)}</strong><span>Unidades</span></div><div><strong>${escapeHtml(development.suites || 0)}</strong><span>Suites</span></div><div><strong>${escapeHtml(development.amenitiesCount || amenities.length)}</strong><span>Amenidades</span></div><div><strong>${escapeHtml(development.location || "-")}</strong><span>Ubicación</span></div></div><div class="development-columns"><div><span class="eyebrow">AMENIDADES</span><h4>Servicios destacados</h4><ul class="development-list">${amenities.map((amenity) => `<li>${escapeHtml(amenity)}</li>`).join("") || "<li>Por definir</li>"}</ul></div><div><span class="eyebrow">PUBLICACIÓN</span><h4>${development.published ? "Visible para clientes" : "Solo interno"}</h4><p class="panel-description">${development.demo ? "Ficha de ejemplo basada en el dossier del cliente." : "Registro administrado desde Firebase."}</p></div></div>${actions}</div></article>`;
}

function renderDevelopments() {
  const publicGrid = document.querySelector("#publicDevelopmentsGrid");
  const rpmGrid = document.querySelector("#rpmDevelopmentsGrid");
  const active = developments.filter((development) => development.active !== false);
  renderDevelopmentDashboard(active);
  if (publicGrid) {
    const published = active.filter((development) => development.published);
    publicGrid.innerHTML = published.map((development) => renderDevelopmentCard(development, "public")).join("") || `<div class="empty-state glass-panel"><h3>Próximamente</h3><p>Estamos preparando nuevos desarrollos inmobiliarios.</p></div>`;
  }
  if (rpmGrid) rpmGrid.innerHTML = active.map((development) => renderDevelopmentCard(development, "rpm")).join("");
  document.querySelectorAll(".save-demo-development").forEach((button) => button.addEventListener("click", () => saveDemoDevelopment(button.dataset.id)));
  document.querySelectorAll(".manage-development-units").forEach((button) => button.addEventListener("click", () => selectDevelopmentUnits(button.dataset.id)));
  document.querySelectorAll(".edit-development").forEach((button) => button.addEventListener("click", () => openDevelopmentModal(button.dataset.id)));
  document.querySelectorAll(".toggle-development").forEach((button) => button.addEventListener("click", () => toggleDevelopment(button.dataset.id)));
  document.querySelectorAll(".delete-development").forEach((button) => button.addEventListener("click", () => deleteDevelopment(button.dataset.id)));
}

function renderDevelopmentDashboard(activeDevelopments = developments.filter((development) => development.active !== false)) {
  const stats = document.querySelector("#developmentDashboardStats");
  const list = document.querySelector("#developmentDashboardList");
  if (!stats && !list) return;
  const published = activeDevelopments.filter((development) => development.published).length;
  const drafts = activeDevelopments.length - published;
  if (stats) stats.innerHTML = `<div><strong>${activeDevelopments.length}</strong><span>Total de proyectos</span></div><div><strong>${published}</strong><span>Publicados</span></div><div><strong>${drafts}</strong><span>Borradores</span></div>`;
  if (list) list.innerHTML = activeDevelopments.slice(0, 4).map((development) => `<div class="dashboard-project-row"><div><strong>${escapeHtml(development.name)}</strong><small>${escapeHtml(development.city || "Ubicación pendiente")} · ${escapeHtml(development.type || "Desarrollo")}</small></div><span class="tag ${development.published ? "green" : "orange"}">${development.published ? "Publicado" : "Borrador"}</span><button class="text-button dashboard-edit-development" data-id="${escapeHtml(development.id)}">Editar</button></div>`).join("") || `<div class="empty-state"><h3>Sin desarrollos registrados</h3><p>Crea el primer proyecto desde el botón de administración.</p></div>`;
  document.querySelectorAll(".dashboard-edit-development").forEach((button) => button.addEventListener("click", () => {
    document.querySelector('[data-panel="developmentManagerPanel"]')?.click();
    openDevelopmentModal(button.dataset.id);
  }));
}

async function loadDevelopments() {
  if (!window.rpmDb) { renderDevelopments(); return; }
  try {
    const query = document.body.classList.contains("confi-mode") ? window.rpmDb.collection("developments").get() : window.rpmDb.collection("developments").where("published", "==", true).where("active", "==", true).get();
    const snapshot = await query;
    if (!snapshot.empty) {
      const records = snapshot.docs.map((document) => ({ id: document.id, active: document.data().active !== false, ...document.data() }));
      const terraserExists = records.some((development) => development.id === "terraser-demo" || development.name === demoDevelopment.name);
      developments = terraserExists ? records : [demoDevelopment, ...records];
    } else {
      developments = [demoDevelopment];
    }
  } catch (error) {
    console.warn("Developments load fallback", error);
  }
  renderDevelopments();
  refreshDevelopmentSelectors();
}

let editingDevelopmentId = null;

function closeDevelopmentModal() {
  const modal = document.querySelector("#developmentModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function openDevelopmentModal(developmentId = "") {
  const modal = document.querySelector("#developmentModal");
  const form = document.querySelector("#developmentForm");
  if (!modal || !form) return;
  const development = developments.find((item) => item.id === developmentId);
  editingDevelopmentId = development && !development.demo ? developmentId : null;
  form.reset();
  if (development && !development.demo) {
    ["name", "type", "city", "location", "zoneId", "latitude", "longitude", "locationPrivacy", "price", "units", "suites", "amenitiesCount", "coverUrl", "description"].forEach((field) => { if (form.elements[field] && development[field] !== undefined) form.elements[field].value = development[field]; });
    form.elements.amenities.value = Array.isArray(development.amenities) ? development.amenities.join(", ") : development.amenities || "";
    form.elements.published.checked = Boolean(development.published);
  }
  document.querySelector("#developmentModalTitle").textContent = editingDevelopmentId ? "Editar desarrollo" : "Nuevo desarrollo";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

async function saveDevelopment(event) {
  event.preventDefault();
  if (!window.rpmDb) { showToast("Firebase todavía no está disponible."); return; }
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const record = { name: data.name.trim(), type: data.type, city: data.city.trim(), location: data.location.trim(), zoneId: data.zoneId || "", latitude: data.latitude ? Number(data.latitude) : null, longitude: data.longitude ? Number(data.longitude) : null, locationPrivacy: data.locationPrivacy || "exact", price: data.price.trim(), units: Number(data.units || 0), suites: Number(data.suites || 0), amenitiesCount: Number(data.amenitiesCount || 0), coverUrl: data.coverUrl.trim(), description: data.description.trim(), amenities: data.amenities.split(",").map((item) => item.trim()).filter(Boolean), published: form.elements.published.checked, active: true, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() };
  try {
    if (editingDevelopmentId) await window.rpmDb.collection("developments").doc(editingDevelopmentId).update(record);
    else { record.createdAt = window.firebase.firestore.FieldValue.serverTimestamp(); await window.rpmDb.collection("developments").add(record); }
    closeDevelopmentModal();
    await loadDevelopments();
    showToast(editingDevelopmentId ? "Desarrollo actualizado." : "Desarrollo creado.");
  } catch (error) {
    showToast("No se pudo guardar el desarrollo. Revisa permisos y reglas de Firestore.");
    console.error("Development save error", error);
  }
}

async function saveDemoDevelopment(developmentId) {
  const development = developments.find((item) => item.id === developmentId);
  if (!development || !window.rpmDb) return;
  const { id, demo, ...record } = development;
  record.createdAt = window.firebase.firestore.FieldValue.serverTimestamp();
  record.updatedAt = window.firebase.firestore.FieldValue.serverTimestamp();
  try {
    await window.rpmDb.collection("developments").doc("terraser-demo").set(record, { merge: true });
    await loadDevelopments();
    showToast("TERRASER quedó guardado en Firebase.");
  } catch (error) {
    const message = error?.code === "permission-denied"
      ? "Firebase rechazó el guardado. Publica las reglas de Firestore V3.2."
      : "No se pudo guardar TERRASER. Revisa la conexión con Firebase.";
    showToast(message);
    console.error("Development demo save error", error);
  }
}

async function toggleDevelopment(developmentId) {
  const development = developments.find((item) => item.id === developmentId);
  if (!development || !window.rpmDb) return;
  try { await window.rpmDb.collection("developments").doc(developmentId).update({ published: !development.published, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() }); await loadDevelopments(); showToast(development.published ? "Desarrollo ocultado del catálogo." : "Desarrollo publicado en el catálogo."); } catch (error) { showToast("No se pudo cambiar la publicación."); }
}

let pendingDevelopmentDeletionId = null;

function openDeleteDevelopmentModal(developmentId) {
  const development = developments.find((item) => item.id === developmentId);
  const modal = document.querySelector("#deleteDevelopmentModal");
  const name = document.querySelector("#deleteDevelopmentName");
  if (!development || !modal) return;
  pendingDevelopmentDeletionId = developmentId;
  if (name) name.textContent = development.name;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeDeleteDevelopmentModal() {
  const modal = document.querySelector("#deleteDevelopmentModal");
  if (!modal) return;
  pendingDevelopmentDeletionId = null;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

async function confirmDeleteDevelopment() {
  const developmentId = pendingDevelopmentDeletionId;
  closeDeleteDevelopmentModal();
  if (!developmentId || !window.rpmDb) return;
  try { await window.rpmDb.collection("developments").doc(developmentId).update({ active: false, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() }); await loadDevelopments(); showToast("Desarrollo desactivado. Puedes recuperarlo desde Firebase o volver a registrarlo."); } catch (error) { showToast("No se pudo desactivar el desarrollo."); console.error("Development delete error", error); }
}

function deleteDevelopment(developmentId) { openDeleteDevelopmentModal(developmentId); }

async function loadRpmProperties() {
  if (!window.rpmDb || !document.querySelector("#rpmPropertiesBody")) return;
  try {
    const snapshot = await window.rpmDb.collection("properties").get();
    if (snapshot.empty) {
      renderRpmProperties();
      return;
    }
    properties = snapshot.docs.map((document) => ({ id: document.id, active: document.data().active !== false, ...document.data() }));
    renderRpmProperties();
    showToast(`${properties.length} propiedades cargadas desde Firebase.`);
  } catch (error) {
    renderRpmProperties();
    showToast("No se pudieron cargar las propiedades. Revisa las reglas de Firestore.");
    console.error("Properties load error", error);
  }
}

let editingPropertyId = null;

function closePropertyModal() {
  const modal = document.querySelector("#propertyModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function openPropertyModal(propertyId = "") {
  const modal = document.querySelector("#propertyModal");
  const form = document.querySelector("#propertyForm");
  if (!modal || !form) return;
  editingPropertyId = propertyId || null;
  form.reset();
  const property = properties.find((item) => item.id === propertyId);
  if (property) {
    Object.entries({
      name: property.name, type: property.type, operation: property.operation || "Venta", price: property.price,
      zone: property.zone, municipality: property.municipality, zoneId: property.zoneId, latitude: property.latitude, longitude: property.longitude, locationPrivacy: property.locationPrivacy || "exact", area: property.area || property.meta,
      rooms: property.rooms, baths: property.baths, status: property.status, imageUrl: property.imageUrl,
      description: property.description, owner: property.owner, advisor: property.advisor, services: property.services, features: property.features, documents: property.documents, gallery: Array.isArray(property.gallery) ? property.gallery.join("\n") : property.gallery,
    }).forEach(([field, value]) => { if (form.elements[field] && value !== undefined) form.elements[field].value = value; });
    form.elements.published.checked = Boolean(property.published);
  }
  document.querySelector("#propertyModalTitle").textContent = property ? "Editar propiedad" : "Registrar propiedad";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

async function saveProperty(event) {
  event.preventDefault();
  if (!window.rpmDb) { showToast("Firebase todavía no está disponible."); return; }
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const record = {
    name: data.name.trim(), type: data.type, operation: data.operation, price: data.price.trim(), zone: data.zone.trim(),
    municipality: data.municipality.trim(), zoneId: data.zoneId || "", latitude: data.latitude ? Number(data.latitude) : null, longitude: data.longitude ? Number(data.longitude) : null, locationPrivacy: data.locationPrivacy || "exact", area: data.area.trim(), rooms: Number(data.rooms || 0), baths: Number(data.baths || 0),
    status: data.status, owner: data.owner.trim(), advisor: data.advisor.trim(), services: data.services.trim(), features: data.features.trim(), documents: data.documents.trim(), imageUrl: data.imageUrl.trim(), gallery: data.gallery.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean), description: data.description.trim(), published: form.elements.published.checked, active: true,
    updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
  };
  try {
    if (editingPropertyId) {
      await window.rpmDb.collection("properties").doc(editingPropertyId).update(record);
    } else {
      record.createdAt = window.firebase.firestore.FieldValue.serverTimestamp();
      await window.rpmDb.collection("properties").add(record);
    }
    closePropertyModal();
    await loadRpmProperties();
    showToast(editingPropertyId ? "Propiedad actualizada." : "Propiedad registrada.");
  } catch (error) {
    showToast("No se pudo guardar la propiedad. Revisa tu rol y las reglas de Firestore.");
    console.error("Property save error", error);
  }
}

async function deleteProperty(propertyId) {
  if (!window.rpmDb || !propertyId || !window.confirm("¿Deseas desactivar esta propiedad del inventario?")) return;
  try {
    await window.rpmDb.collection("properties").doc(propertyId).update({ active: false, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() });
    await loadRpmProperties();
    showToast("Propiedad desactivada del inventario.");
  } catch (error) {
    showToast("No se pudo eliminar la propiedad.");
    console.error("Property delete error", error);
  }
}

function normalizeImageUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.hostname.includes("drive.google.com")) {
      const match = url.pathname.match(/\/d\/([^/]+)/) || url.search.match(/[?&]id=([^&]+)/);
      return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200` : value;
    }
    return value;
  } catch {
    return "";
  }
}

function getSavedLogoUrl() {
  return localStorage.getItem(logoStorageKey) || defaultLogoUrl;
}

function applySavedLogo() {
  const savedLogo = localStorage.getItem(logoStorageKey);
  const logoUrl = normalizeImageUrl(savedLogo || defaultLogoUrl) || defaultLogoUrl;
  document.querySelectorAll("[data-brand-logo]").forEach((image) => {
    image.onerror = null;
    image.onerror = () => {
      image.onerror = null; // evita bucles si también falla el fallback
      if (image.src.endsWith(defaultLogoUrl.replace(/^\.\.\//, ""))) {
        image.style.display = "none";
        return;
      }
      image.src = defaultLogoUrl;
      if (savedLogo && image.id === "logoPreview" && !window.__rpmLogoErrorShown) {
        window.__rpmLogoErrorShown = true;
        showToast("No se pudo cargar el logo personalizado. Se restauró el logo original.");
      }
    };
    image.style.display = "";
    image.src = logoUrl;
  });
  const input = document.querySelector("#logoUrlInput");
  const status = document.querySelector("#logoStatus");
  if (input) input.value = savedLogo || "";
  if (status) status.textContent = savedLogo ? "Logo personalizado" : "Logo original";
}

function applyTheme() {
  const isDark = localStorage.getItem(themeStorageKey) === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  const button = document.querySelector("#themeToggle");
  if (button) {
    button.textContent = isDark ? "☀" : "◐";
    button.title = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
    button.setAttribute("aria-label", button.title);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function openLeadModal(property = "") {
  const modal = document.querySelector("#leadModal");
  const select = modal.querySelector("select[name=property]");
  if (property && [...select.options].some((option) => option.text === property)) select.value = property;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const modal = document.querySelector("#leadModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("active", item === button));
  document.querySelector("#portalView").classList.toggle("active-view", button.dataset.view === "portal");
  document.querySelector("#rpmView").classList.toggle("active-view", button.dataset.view === "rpm");
}));

document.querySelectorAll("[data-panel]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-panel]").forEach((item) => item.classList.toggle("active", item === button));
  document.querySelectorAll(".rpm-panel").forEach((panel) => panel.classList.toggle("active-panel", panel.id === button.dataset.panel));
}));

const newPropertyButton = document.querySelector("#newProperty");
if (newPropertyButton) newPropertyButton.addEventListener("click", () => openPropertyModal());
document.querySelectorAll("[data-close-property-modal]").forEach((button) => button.addEventListener("click", closePropertyModal));
document.querySelector("#propertyModal")?.addEventListener("click", (event) => { if (event.target.id === "propertyModal") closePropertyModal(); });
document.querySelector("#propertyForm")?.addEventListener("submit", saveProperty);
document.querySelector("#rpmPropertySearch")?.addEventListener("input", renderRpmProperties);
document.querySelector("#rpmPropertyStatus")?.addEventListener("change", renderRpmProperties);
const newDevelopmentButton = document.querySelector("#newDevelopment");
if (newDevelopmentButton) newDevelopmentButton.addEventListener("click", () => openDevelopmentModal());
document.querySelectorAll("[data-close-development-modal]").forEach((button) => button.addEventListener("click", closeDevelopmentModal));
document.querySelector("#developmentModal")?.addEventListener("click", (event) => { if (event.target.id === "developmentModal") closeDevelopmentModal(); });
document.querySelector("#developmentForm")?.addEventListener("submit", saveDevelopment);
document.querySelector("#goDevelopmentManager")?.addEventListener("click", () => document.querySelector('[data-panel="developmentManagerPanel"]')?.click());
document.querySelectorAll("[data-close-delete-development]").forEach((button) => button.addEventListener("click", closeDeleteDevelopmentModal));
document.querySelector("#deleteDevelopmentModal")?.addEventListener("click", (event) => { if (event.target.id === "deleteDevelopmentModal") closeDeleteDevelopmentModal(); });
document.querySelector("#confirmDeleteDevelopment")?.addEventListener("click", confirmDeleteDevelopment);

document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
document.querySelector("#leadModal").addEventListener("click", (event) => { if (event.target.id === "leadModal") closeModal(); });
document.querySelector("#leadForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = formData.get("name");
  const property = formData.get("property");
  closeModal();
  event.currentTarget.reset();
  showToast(`Interés registrado para ${name} en ${property}.`);
});
document.querySelector("#heroContact").addEventListener("click", () => openLeadModal());
document.querySelectorAll("[data-scroll]").forEach((button) => button.addEventListener("click", () => document.querySelector(`#${button.dataset.scroll}`).scrollIntoView({ behavior: "smooth" })));
document.querySelector("#newLead").addEventListener("click", () => openLeadModal());
document.querySelector("#newAction").addEventListener("click", () => showToast("Acciones rápidas disponibles en la siguiente versión."));
document.querySelector("#logoutDemo").addEventListener("click", () => showToast("Sesión de demostración cerrada."));
document.querySelectorAll(".map-pin").forEach((pin) => pin.addEventListener("click", () => showToast(`Zona seleccionada: ${pin.dataset.pin}`)));
document.querySelector("#themeToggle").addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
  localStorage.setItem(themeStorageKey, nextTheme);
  applyTheme();
  showToast(nextTheme === "dark" ? "Modo oscuro activado." : "Modo claro activado.");
});
const logoSettingsForm = document.querySelector("#logoSettingsForm");
if (logoSettingsForm) {
  logoSettingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = event.currentTarget.logoUrl.value.trim();
    if (!value) {
      localStorage.removeItem(logoStorageKey);
    } else if (!normalizeImageUrl(value)) {
      showToast("Coloca un enlace válido de imagen o Google Drive.");
      return;
    } else {
      localStorage.setItem(logoStorageKey, value);
    }
    applySavedLogo();
    showToast(value ? "Logo actualizado correctamente." : "Logo original restaurado.");
  });
  document.querySelector("#resetLogoButton").addEventListener("click", () => {
    localStorage.removeItem(logoStorageKey);
    applySavedLogo();
    showToast("Logo original restaurado.");
  });
}
searchInput.addEventListener("input", renderProperties);
typeSelect.addEventListener("change", renderProperties);
initializeFirebaseTestConnection();
initializeRpmAuth();
if (!document.body.classList.contains("confi-mode")) loadDevelopments();
applyTheme();
applySavedLogo();
renderProperties();



// V3.3 · Gestión integral de unidades por desarrollo
let developmentUnits = [];
let editingUnitId = null;

function refreshDevelopmentSelectors() {
  const active = developments.filter(d => d.active !== false);
  [document.querySelector('#unitDevelopmentFilter'), document.querySelector('#unitDevelopmentId')].forEach(select => {
    if (!select) return;
    const current = select.value;
    select.innerHTML = (select.id === 'unitDevelopmentFilter' ? '<option value="">Seleccionar desarrollo</option>' : '<option value="">Selecciona...</option>') + active.map(d => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.name)}</option>`).join('');
    if (active.some(d => d.id === current)) select.value = current;
  });
}

function selectDevelopmentUnits(developmentId) {
  const filter = document.querySelector('#unitDevelopmentFilter');
  if (filter) filter.value = developmentId;
  loadDevelopmentUnits(developmentId);
  document.querySelector('#developmentUnitsGrid')?.scrollIntoView({behavior:'smooth', block:'start'});
}

async function loadDevelopmentUnits(developmentId = document.querySelector('#unitDevelopmentFilter')?.value || '') {
  refreshDevelopmentSelectors();
  const grid = document.querySelector('#developmentUnitsGrid');
  const title = document.querySelector('#unitsSectionTitle');
  if (!grid) return;
  const development = developments.find(d => d.id === developmentId);
  if (title) title.textContent = development ? `Unidades de ${development.name}` : 'Unidades del desarrollo';
  if (!developmentId) { grid.innerHTML='<div class="empty-state"><h3>Selecciona un desarrollo</h3><p>Desde aquí podrás crear y administrar todas sus unidades.</p></div>'; return; }
  try {
    if (window.rpmDb) {
      const snap = await window.rpmDb.collection('developmentUnits').where('developmentId','==',developmentId).get();
      developmentUnits = snap.docs.map(doc => ({id:doc.id, ...doc.data()}));
    }
  } catch(e) { console.warn('Units load fallback',e); }
  if (!developmentUnits.length && (development.name || '').includes('TERRASER')) {
    developmentUnits = Array.from({length:10},(_,i)=>({id:`demo-terraser-${i+1}`,developmentId,name:`Residencia ${String(i+1).padStart(2,'0')}`,type:'Residencia',status:'Disponible',price:'$1,200,000',area:'120 m²',rooms:3,baths:2,published:true,demo:true}));
  }
  renderDevelopmentUnits();
}

function renderDevelopmentUnits() {
  const grid=document.querySelector('#developmentUnitsGrid'); if(!grid)return;
  const status=document.querySelector('#unitStatusFilter')?.value || 'all';
  const rows=developmentUnits.filter(u=>u.active!==false && (status==='all'||u.status===status));
  grid.innerHTML=rows.map(u=>`<article class="unit-card"><div class="unit-card-head"><strong>${escapeHtml(u.name)}</strong><span class="tag ${u.status==='Disponible'?'green':u.status==='Vendido'?'blue':'orange'}">${escapeHtml(u.status||'Disponible')}</span></div><small>${escapeHtml(u.type||'Unidad')} · ${escapeHtml(u.area||'Superficie pendiente')}</small><small>${u.rooms||0} recámaras · ${u.baths||0} baños</small><strong>${escapeHtml(u.price||'Precio por definir')}</strong><div class="development-actions">${u.demo?`<button class="secondary-button save-demo-unit" data-id="${escapeHtml(u.id)}">Guardar en Firebase</button>`:`<button class="secondary-button edit-unit" data-id="${escapeHtml(u.id)}">Editar</button><button class="danger-button delete-unit" data-id="${escapeHtml(u.id)}">Desactivar</button>`}</div></article>`).join('') || '<div class="empty-state"><h3>Sin unidades</h3><p>Agrega la primera unidad de este desarrollo.</p></div>';
  document.querySelectorAll('.edit-unit').forEach(b=>b.addEventListener('click',()=>openUnitModal(b.dataset.id)));
  document.querySelectorAll('.delete-unit').forEach(b=>b.addEventListener('click',()=>deactivateUnit(b.dataset.id)));
  document.querySelectorAll('.save-demo-unit').forEach(b=>b.addEventListener('click',()=>saveDemoUnit(b.dataset.id)));
}

function openUnitModal(unitId='') {
  const modal=document.querySelector('#unitModal'), form=document.querySelector('#unitForm'); if(!modal||!form)return;
  refreshDevelopmentSelectors(); form.reset(); editingUnitId=null;
  const unit=developmentUnits.find(u=>u.id===unitId);
  if(unit && !unit.demo){ editingUnitId=unitId; ['developmentId','name','type','status','price','area','rooms','baths','imageUrl','description'].forEach(k=>{if(form.elements[k]&&unit[k]!==undefined)form.elements[k].value=unit[k]}); form.elements.published.checked=unit.published!==false; }
  else { const current=document.querySelector('#unitDevelopmentFilter')?.value; if(current) form.elements.developmentId.value=current; form.elements.published.checked=true; }
  document.querySelector('#unitModalTitle').textContent=editingUnitId?'Editar unidad':'Nueva unidad'; modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
}
function closeUnitModal(){const m=document.querySelector('#unitModal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}}
async function saveUnit(e){e.preventDefault();if(!window.rpmDb){showToast('Firebase todavía no está disponible.');return} const f=e.currentTarget,d=Object.fromEntries(new FormData(f).entries()); const rec={developmentId:d.developmentId,name:d.name.trim(),type:d.type,status:d.status,price:d.price.trim(),area:d.area.trim(),rooms:Number(d.rooms||0),baths:Number(d.baths||0),imageUrl:d.imageUrl.trim(),description:d.description.trim(),published:f.elements.published.checked,active:true,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()}; try{if(editingUnitId)await window.rpmDb.collection('developmentUnits').doc(editingUnitId).update(rec);else{rec.createdAt=window.firebase.firestore.FieldValue.serverTimestamp();await window.rpmDb.collection('developmentUnits').add(rec)} closeUnitModal();document.querySelector('#unitDevelopmentFilter').value=d.developmentId;await loadDevelopmentUnits(d.developmentId);showToast(editingUnitId?'Unidad actualizada.':'Unidad creada.')}catch(err){console.error(err);showToast('No se pudo guardar la unidad. Revisa las reglas de Firebase.')}}
async function saveDemoUnit(id){const u=developmentUnits.find(x=>x.id===id);if(!u||!window.rpmDb)return;const dev=developments.find(d=>(d.name||'').includes('TERRASER'));if(!dev||dev.demo){showToast('Primero guarda TERRASER en Firebase para asociar sus unidades.');return}const {id:_,demo,...rec}=u;rec.developmentId=dev.id;rec.active=true;rec.createdAt=window.firebase.firestore.FieldValue.serverTimestamp();rec.updatedAt=rec.createdAt;await window.rpmDb.collection('developmentUnits').add(rec);showToast(`${u.name} guardada en Firebase.`);await loadDevelopmentUnits(dev.id)}
async function deactivateUnit(id){if(!window.rpmDb||!confirm('¿Desactivar esta unidad? No se eliminará físicamente.'))return;await window.rpmDb.collection('developmentUnits').doc(id).update({active:false,updatedAt:window.firebase.firestore.FieldValue.serverTimestamp()});await loadDevelopmentUnits(document.querySelector('#unitDevelopmentFilter').value);showToast('Unidad desactivada.');}

document.querySelector('#newDevelopmentUnit')?.addEventListener('click',()=>openUnitModal());
document.querySelector('#unitDevelopmentFilter')?.addEventListener('change',e=>loadDevelopmentUnits(e.target.value));
document.querySelector('#unitStatusFilter')?.addEventListener('change',renderDevelopmentUnits);
document.querySelector('#unitForm')?.addEventListener('submit',saveUnit);
document.querySelectorAll('[data-close-unit-modal]').forEach(b=>b.addEventListener('click',closeUnitModal));

// V3.3.2 - dropdowns personalizados Liquid Glass para filtros de unidades.
(function initUnitLiquidSelects(){
  const ids=['unitDevelopmentFilter','unitStatusFilter'];
  function enhance(select){
    if(!select || select.dataset.liquidEnhanced==='true') return;
    select.dataset.liquidEnhanced='true';
    select.classList.add('rpm-native-select');
    const root=document.createElement('div'); root.className='rpm-select';
    const trigger=document.createElement('button'); trigger.type='button'; trigger.className='rpm-select__trigger'; trigger.setAttribute('aria-haspopup','listbox'); trigger.setAttribute('aria-expanded','false');
    const label=document.createElement('span'); const chevron=document.createElement('span'); chevron.className='rpm-select__chevron';
    trigger.append(label,chevron);
    const menu=document.createElement('div'); menu.className='rpm-select__menu'; menu.setAttribute('role','listbox');
    select.insertAdjacentElement('afterend',root); root.append(trigger,menu);
    function sync(){
      const current=select.options[select.selectedIndex]; label.textContent=current?.textContent||'Seleccionar'; menu.innerHTML='';
      [...select.options].forEach(opt=>{const b=document.createElement('button');b.type='button';b.className='rpm-select__option'+(opt.value===select.value?' is-selected':'');b.textContent=opt.textContent;b.dataset.value=opt.value;b.setAttribute('role','option');b.setAttribute('aria-selected',opt.value===select.value?'true':'false');b.addEventListener('click',()=>{select.value=opt.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync();close();});menu.appendChild(b)});
    }
    function close(){root.classList.remove('is-open');trigger.setAttribute('aria-expanded','false')}
    trigger.addEventListener('click',e=>{e.stopPropagation();document.querySelectorAll('.rpm-select.is-open').forEach(x=>{if(x!==root)x.classList.remove('is-open')});const open=root.classList.toggle('is-open');trigger.setAttribute('aria-expanded',String(open))});
    select.addEventListener('change',sync);
    new MutationObserver(sync).observe(select,{childList:true,subtree:true,attributes:true});
    document.addEventListener('click',e=>{if(!root.contains(e.target))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    sync();
  }
  const start=()=>ids.forEach(id=>enhance(document.getElementById(id)));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();


// V4.0 - Geolocalización, mapas y zonas
let rpmZones = [];
let rpmLeafletMap = null;
let rpmMapLayer = null;
let editingZoneId = null;

function hasCoordinates(item){ return Number.isFinite(Number(item?.latitude)) && Number.isFinite(Number(item?.longitude)); }
function zoneName(id){ return rpmZones.find(z=>z.id===id)?.name || ''; }
function refreshZoneSelectors(){
  const opts = rpmZones.filter(z=>z.active!==false).map(z=>`<option value="${escapeHtml(z.id)}">${escapeHtml(z.name)}</option>`).join('');
  ['propertyZoneId','developmentZoneId'].forEach(id=>{ const el=document.getElementById(id); if(!el)return; const v=el.value; el.innerHTML='<option value="">Sin zona asignada</option>'+opts; el.value=v; });
  const f=document.getElementById('mapZoneFilter'); if(f){const v=f.value; f.innerHTML='<option value="all">Todas las zonas</option>'+opts; f.value=[...f.options].some(o=>o.value===v)?v:'all';}
}
async function loadZones(){
  if(!window.rpmDb){ renderZones(); return; }
  try{ const snap=await window.rpmDb.collection('zones').get(); rpmZones=snap.docs.map(d=>({id:d.id,active:d.data().active!==false,...d.data()})); }
  catch(e){ console.warn('Zones load error',e); }
  refreshZoneSelectors(); renderZones(); renderGeoMap();
}
function renderZones(){
  const box=document.getElementById('zonesList'); if(!box)return;
  const rows=rpmZones.filter(z=>z.active!==false);
  box.innerHTML=rows.map(z=>`<div class="zone-row"><div class="zone-row-head"><div><strong>${escapeHtml(z.name)}</strong><small>${escapeHtml(z.municipality||'Municipio sin definir')}</small></div><span class="tag blue">${properties.filter(p=>p.zoneId===z.id&&p.active!==false).length+developments.filter(d=>d.zoneId===z.id&&d.active!==false)} registros</span></div><small>${escapeHtml(z.description||'Sin descripción territorial')}</small><small>${z.advisor?'Asesor: '+escapeHtml(z.advisor):'Sin asesor asignado'}</small><div class="zone-actions"><button class="text-button edit-zone" data-id="${escapeHtml(z.id)}">Editar</button><button class="text-button focus-zone" data-id="${escapeHtml(z.id)}">Ver mapa</button></div></div>`).join('')||'<div class="empty-state"><h3>Sin zonas registradas</h3><p>Crea la primera zona comercial para organizar el inventario.</p></div>';
  box.querySelectorAll('.edit-zone').forEach(b=>b.onclick=()=>openZoneModal(b.dataset.id));
  box.querySelectorAll('.focus-zone').forEach(b=>b.onclick=()=>{const z=rpmZones.find(x=>x.id===b.dataset.id);if(z&&hasCoordinates(z)&&rpmLeafletMap)rpmLeafletMap.setView([z.latitude,z.longitude],15)});
  const gs=document.getElementById('geoStats'); if(gs){const p=properties.filter(x=>x.active!==false&&hasCoordinates(x)).length,d=developments.filter(x=>x.active!==false&&hasCoordinates(x)).length;gs.innerHTML=`<div><strong>${rows.length}</strong><span>Zonas activas</span></div><div><strong>${p}</strong><span>Propiedades geolocalizadas</span></div><div><strong>${d}</strong><span>Desarrollos geolocalizados</span></div><div><strong>${properties.filter(x=>x.locationPrivacy==='approximate').length+developments.filter(x=>x.locationPrivacy==='approximate').length}</strong><span>Ubicaciones aproximadas</span></div>`;}
}
function initGeoMap(){
  const el=document.getElementById('rpmMap'); if(!el||!window.L)return;
  if(!rpmLeafletMap){rpmLeafletMap=L.map(el,{scrollWheelZoom:true}).setView([20.8169,-102.7635],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(rpmLeafletMap);rpmMapLayer=L.layerGroup().addTo(rpmLeafletMap);}
  setTimeout(()=>rpmLeafletMap.invalidateSize(),80);
}
function renderGeoMap(){
  initGeoMap(); if(!rpmLeafletMap||!rpmMapLayer)return; rpmMapLayer.clearLayers();
  const type=document.getElementById('mapEntityFilter')?.value||'all', zid=document.getElementById('mapZoneFilter')?.value||'all';
  const items=[];
  if(type==='all'||type==='property') properties.filter(x=>x.active!==false&&hasCoordinates(x)&&(zid==='all'||x.zoneId===zid)).forEach(x=>items.push({...x,_kind:'Propiedad'}));
  if(type==='all'||type==='development') developments.filter(x=>x.active!==false&&hasCoordinates(x)&&(zid==='all'||x.zoneId===zid)).forEach(x=>items.push({...x,_kind:'Desarrollo'}));
  items.forEach(x=>{const m=L.marker([Number(x.latitude),Number(x.longitude)]).addTo(rpmMapLayer);m.bindPopup(`<div class="geo-popup"><strong>${escapeHtml(x.name||'Sin nombre')}</strong><small>${x._kind} · ${escapeHtml(zoneName(x.zoneId)||x.zone||x.city||'Sin zona')}</small><small>${escapeHtml(x.status||x.type||'')}</small><small>Privacidad: ${x.locationPrivacy==='approximate'?'Aproximada':x.locationPrivacy==='private'?'Privada':'Exacta'}</small></div>`)});
  if(items.length){const bounds=L.latLngBounds(items.map(x=>[Number(x.latitude),Number(x.longitude)]));rpmLeafletMap.fitBounds(bounds.pad(.18),{maxZoom:15});}
}
function openZoneModal(id=''){const m=document.getElementById('zoneModal'),f=document.getElementById('zoneForm');if(!m||!f)return;editingZoneId=id||null;f.reset();const z=rpmZones.find(x=>x.id===id);if(z)['name','municipality','advisor','latitude','longitude','description'].forEach(k=>{if(f.elements[k]&&z[k]!==undefined)f.elements[k].value=z[k]});document.getElementById('zoneModalTitle').textContent=z?'Editar zona comercial':'Nueva zona comercial';m.classList.add('open');m.setAttribute('aria-hidden','false')}
function closeZoneModal(){const m=document.getElementById('zoneModal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}}
async function saveZone(e){e.preventDefault();if(!window.rpmDb){showToast('Firebase todavía no está disponible.');return}const f=e.currentTarget,d=Object.fromEntries(new FormData(f).entries()),rec={name:d.name.trim(),municipality:d.municipality.trim(),advisor:d.advisor.trim(),latitude:d.latitude?Number(d.latitude):null,longitude:d.longitude?Number(d.longitude):null,description:d.description.trim(),active:true,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};try{if(editingZoneId)await rpmDb.collection('zones').doc(editingZoneId).update(rec);else{rec.createdAt=firebase.firestore.FieldValue.serverTimestamp();await rpmDb.collection('zones').add(rec)}closeZoneModal();await loadZones();showToast(editingZoneId?'Zona actualizada.':'Zona creada.')}catch(err){console.error(err);showToast('No se pudo guardar la zona. Revisa las reglas de Firebase.')}}

document.getElementById('newZone')?.addEventListener('click',()=>openZoneModal());
document.getElementById('zoneForm')?.addEventListener('submit',saveZone);
document.querySelectorAll('[data-close-zone-modal]').forEach(b=>b.addEventListener('click',closeZoneModal));
document.getElementById('mapEntityFilter')?.addEventListener('change',renderGeoMap);
document.getElementById('mapZoneFilter')?.addEventListener('change',renderGeoMap);
document.querySelector('[data-panel="mapsPanel"]')?.addEventListener('click',()=>{loadZones();setTimeout(renderGeoMap,120)});
setTimeout(loadZones,1200);
