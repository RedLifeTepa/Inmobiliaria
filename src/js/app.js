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
  coverUrl: "assets/terraser-cover.png",
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
const defaultLogoUrl = "assets/logo-altosfilm.png";
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
    const searchable = `${property.id} ${property.name} ${property.zone} ${property.municipality || ""}`.toLowerCase();
    return searchable.includes(query) && (status === "all" || property.status === status);
  });
  body.innerHTML = filtered.length ? filtered.map((property) => `
    <tr>
      <td>${escapeHtml(property.id)}</td>
      <td><strong>${escapeHtml(property.name)}</strong><small>${escapeHtml(property.type)} · ${escapeHtml(property.area || property.meta || "Sin superficie")}</small></td>
      <td>${escapeHtml(property.zone)}</td>
      <td>${escapeHtml(property.operation || property.status)} · ${escapeHtml(property.price)}</td>
      <td><span class="tag ${propertyTagClass(property.status)}">${escapeHtml(property.status)}</span></td>
      <td><div class="row-actions"><button class="text-button edit-property" data-id="${escapeHtml(property.id)}">Editar</button><button class="text-button delete-property" data-id="${escapeHtml(property.id)}">Desactivar</button></div></td>
    </tr>`).join("") : `<tr><td colspan="6"><div class="empty-state"><h3>No hay propiedades con esos filtros</h3><p>Registra un inmueble nuevo o modifica la búsqueda.</p></div></td></tr>`;
  body.querySelectorAll(".edit-property").forEach((button) => button.addEventListener("click", () => openPropertyModal(button.dataset.id)));
  body.querySelectorAll(".delete-property").forEach((button) => button.addEventListener("click", () => deleteProperty(button.dataset.id)));
}

function renderDevelopmentCard(development, mode) {
  const cover = normalizeImageUrl(development.coverUrl) || "assets/terraser-cover.png";
  const amenities = Array.isArray(development.amenities) ? development.amenities : String(development.amenities || "").split(",").map((item) => item.trim()).filter(Boolean);
  const actions = mode === "rpm" ? `<div class="development-actions">${development.demo ? `<button class="secondary-button save-demo-development" data-id="${escapeHtml(development.id)}">Guardar en Firebase</button>` : `<button class="text-button edit-development" data-id="${escapeHtml(development.id)}">Editar</button><button class="text-button toggle-development" data-id="${escapeHtml(development.id)}">${development.published ? "Ocultar" : "Publicar"}</button><button class="text-button delete-development" data-id="${escapeHtml(development.id)}">Desactivar</button>`}</div>` : "";
  return `<article class="development-card glass-panel"><div class="development-cover" style="background-image:url('${escapeHtml(cover)}')"><span class="development-cover-label">${escapeHtml(development.name)}</span></div><div class="development-body"><div class="development-intro"><div><span class="eyebrow">${escapeHtml(development.city || "Ubicación pendiente")}</span><h3>${escapeHtml(development.type || "Desarrollo")}</h3><p>${escapeHtml(development.description)}</p></div><div class="development-price"><small>Precio inicial</small><strong>${escapeHtml(development.price || "Por definir")}</strong><span>${development.published ? "Publicado" : "Borrador"}</span></div></div><div class="development-stats"><div><strong>${escapeHtml(development.units || 0)}</strong><span>Unidades</span></div><div><strong>${escapeHtml(development.suites || 0)}</strong><span>Suites</span></div><div><strong>${escapeHtml(development.amenitiesCount || amenities.length)}</strong><span>Amenidades</span></div><div><strong>${escapeHtml(development.location || "-")}</strong><span>Ubicación</span></div></div><div class="development-columns"><div><span class="eyebrow">AMENIDADES</span><h4>Servicios destacados</h4><ul class="development-list">${amenities.map((amenity) => `<li>${escapeHtml(amenity)}</li>`).join("") || "<li>Por definir</li>"}</ul></div><div><span class="eyebrow">PUBLICACIÓN</span><h4>${development.published ? "Visible para clientes" : "Solo interno"}</h4><p class="panel-description">${development.demo ? "Ficha de ejemplo basada en el dossier del cliente." : "Registro administrado desde Firebase."}</p></div></div>${actions}</div></article>`;
}

function renderDevelopments() {
  const publicGrid = document.querySelector("#publicDevelopmentsGrid");
  const rpmGrid = document.querySelector("#rpmDevelopmentsGrid");
  const active = developments.filter((development) => development.active !== false);
  if (publicGrid) {
    const published = active.filter((development) => development.published);
    publicGrid.innerHTML = published.map((development) => renderDevelopmentCard(development, "public")).join("") || `<div class="empty-state glass-panel"><h3>Próximamente</h3><p>Estamos preparando nuevos desarrollos inmobiliarios.</p></div>`;
  }
  if (rpmGrid) rpmGrid.innerHTML = active.map((development) => renderDevelopmentCard(development, "rpm")).join("");
  document.querySelectorAll(".save-demo-development").forEach((button) => button.addEventListener("click", () => saveDemoDevelopment(button.dataset.id)));
  document.querySelectorAll(".edit-development").forEach((button) => button.addEventListener("click", () => openDevelopmentModal(button.dataset.id)));
  document.querySelectorAll(".toggle-development").forEach((button) => button.addEventListener("click", () => toggleDevelopment(button.dataset.id)));
  document.querySelectorAll(".delete-development").forEach((button) => button.addEventListener("click", () => deleteDevelopment(button.dataset.id)));
}

async function loadDevelopments() {
  if (!window.rpmDb) { renderDevelopments(); return; }
  try {
    const query = document.body.classList.contains("confi-mode") ? window.rpmDb.collection("developments").get() : window.rpmDb.collection("developments").where("published", "==", true).where("active", "==", true).get();
    const snapshot = await query;
    if (!snapshot.empty) developments = snapshot.docs.map((document) => ({ id: document.id, active: document.data().active !== false, ...document.data() }));
  } catch (error) {
    console.warn("Developments load fallback", error);
  }
  renderDevelopments();
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
    ["name", "type", "city", "location", "price", "units", "suites", "amenitiesCount", "coverUrl", "description"].forEach((field) => { if (form.elements[field] && development[field] !== undefined) form.elements[field].value = development[field]; });
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
  const record = { name: data.name.trim(), type: data.type, city: data.city.trim(), location: data.location.trim(), price: data.price.trim(), units: Number(data.units || 0), suites: Number(data.suites || 0), amenitiesCount: Number(data.amenitiesCount || 0), coverUrl: data.coverUrl.trim(), description: data.description.trim(), amenities: data.amenities.split(",").map((item) => item.trim()).filter(Boolean), published: form.elements.published.checked, active: true, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() };
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
  try { await window.rpmDb.collection("developments").add(record); await loadDevelopments(); showToast("TERRASER quedó guardado en Firebase."); } catch (error) { showToast("No se pudo guardar TERRASER en Firebase."); console.error(error); }
}

async function toggleDevelopment(developmentId) {
  const development = developments.find((item) => item.id === developmentId);
  if (!development || !window.rpmDb) return;
  try { await window.rpmDb.collection("developments").doc(developmentId).update({ published: !development.published, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() }); await loadDevelopments(); showToast(development.published ? "Desarrollo ocultado del catálogo." : "Desarrollo publicado en el catálogo."); } catch (error) { showToast("No se pudo cambiar la publicación."); }
}

async function deleteDevelopment(developmentId) {
  if (!window.rpmDb || !window.confirm("¿Deseas desactivar este desarrollo?")) return;
  try { await window.rpmDb.collection("developments").doc(developmentId).update({ active: false, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() }); await loadDevelopments(); showToast("Desarrollo desactivado."); } catch (error) { showToast("No se pudo desactivar el desarrollo."); }
}

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
      zone: property.zone, municipality: property.municipality, area: property.area || property.meta,
      rooms: property.rooms, baths: property.baths, status: property.status, imageUrl: property.imageUrl,
      description: property.description,
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
    municipality: data.municipality.trim(), area: data.area.trim(), rooms: Number(data.rooms || 0), baths: Number(data.baths || 0),
    status: data.status, imageUrl: data.imageUrl.trim(), description: data.description.trim(), published: form.elements.published.checked, active: true,
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
  const logoUrl = normalizeImageUrl(getSavedLogoUrl()) || defaultLogoUrl;
  document.querySelectorAll("[data-brand-logo]").forEach((image) => {
    image.src = logoUrl;
    image.onerror = () => {
      image.src = defaultLogoUrl;
      if (image.id === "logoPreview") showToast("No se pudo cargar el logo. Revisa el enlace.");
    };
  });
  const input = document.querySelector("#logoUrlInput");
  const status = document.querySelector("#logoStatus");
  if (input) input.value = localStorage.getItem(logoStorageKey) || "";
  if (status) status.textContent = localStorage.getItem(logoStorageKey) ? "Logo personalizado" : "Logo original";
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
