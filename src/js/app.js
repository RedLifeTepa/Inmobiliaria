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
  id: "terraser-demo",
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
const whatsappStorageKey = "rpm.whatsappNumber";
const defaultWhatsappNumber = "523781097992";

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

function parseMoney(value = "") { const n = Number(String(value).replace(/[^0-9.]/g, "")); return Number.isFinite(n) ? n : 0; }
function publicPropertyVisible(property){ return property.active !== false && property.published !== false && !["Vendido","Rentado","No disponible"].includes(property.status); }
function refreshPublicZoneFilter(){
  const el=document.querySelector('#publicZoneFilter'); if(!el)return; const current=el.value;
  const zones=[...new Set(properties.filter(publicPropertyVisible).map(p=>p.zone).filter(Boolean))].sort();
  el.innerHTML='<option value="all">Todas las zonas</option>'+zones.map(z=>`<option value="${escapeHtml(z)}">${escapeHtml(z)}</option>`).join('');
  el.value=zones.includes(current)?current:'all';
}
function renderProperties() {
  if(!propertyGrid || !searchInput || !typeSelect) return;
  refreshPublicZoneFilter();
  const query = searchInput.value.toLowerCase().trim();
  const type = typeSelect.value;
  const operation=document.querySelector('#publicOperationFilter')?.value||'all';
  const price=document.querySelector('#publicPriceFilter')?.value||'all';
  const zone=document.querySelector('#publicZoneFilter')?.value||'all';
  const filtered = properties.filter((property) => {
    if (!publicPropertyVisible(property)) return false;
    const matchesQuery = `${property.name} ${property.zone} ${property.municipality||''} ${property.meta||''}`.toLowerCase().includes(query);
    const matchesType=type==='all'||property.type===type;
    const matchesOperation=operation==='all'||(property.operation||property.status)===operation;
    const matchesZone=zone==='all'||property.zone===zone;
    const amount=parseMoney(property.price); let matchesPrice=true;
    if(price!=='all'){const limit=Number(price);matchesPrice=limit===5000001?amount>5000000:amount<=limit;}
    return matchesQuery&&matchesType&&matchesOperation&&matchesZone&&matchesPrice;
  });
  const count=document.querySelector('#publicResultCount'); if(count)count.textContent=`${filtered.length} ${filtered.length===1?'propiedad':'propiedades'}`;
  propertyGrid.innerHTML = filtered.length ? filtered.map((property) => `
    <article class="property-card public-property-card">
      <button class="property-visual property-detail-button ${property.type === "Terreno" ? "visual-terrain" : ""}" data-id="${escapeHtml(property.id)}" style="background-image:url('${normalizeImageUrl(property.imageUrl)}')" aria-label="Ver detalle de ${escapeHtml(property.name)}">
        <span class="property-badge">${escapeHtml(property.operation||property.status||'Disponible')}</span><span class="property-view-chip">Ver ficha</span>
      </button>
      <div class="property-body"><span class="eyebrow">${escapeHtml(property.type||'Propiedad')} · ${escapeHtml(property.zone||'Zona por definir')}</span><h4>${escapeHtml(property.name)}</h4><p>${escapeHtml(property.meta||property.area||'Información disponible con asesor')}</p>
        <div class="property-meta"><span class="property-price">${escapeHtml(property.price||'Precio a consultar')}</span><div class="property-card-actions"><button class="text-button property-detail-button" data-id="${escapeHtml(property.id)}">Ver detalle</button><button class="text-button interest-button" data-property="${escapeHtml(property.name)}" data-property-id="${escapeHtml(property.id)}">Me interesa →</button></div></div>
      </div></article>`).join("") : `<div class="empty-state glass-panel"><h3>No encontramos coincidencias</h3><p>Prueba con otra zona, operación, precio o tipo de inmueble.</p></div>`;
  document.querySelectorAll('.property-detail-button').forEach(b=>b.addEventListener('click',()=>openPublicPropertyDetail(b.dataset.id)));
  document.querySelectorAll(".interest-button").forEach((button) => button.addEventListener("click", () => openLeadModal(button.dataset.property, button.dataset.propertyId)));
}
function openPublicPropertyDetail(id){
  const property=properties.find(p=>p.id===id); const modal=document.querySelector('#propertyDetailModal'),box=document.querySelector('#propertyDetailContent'); if(!property||!modal||!box)return;
  const location=property.locationPrivacy==='private'?'Ubicación reservada':property.locationPrivacy==='approximate'?`${property.zone||''} · ubicación aproximada`:[property.zone,property.municipality].filter(Boolean).join(', ');
  box.innerHTML=`<div class="public-detail-cover" style="background-image:url('${normalizeImageUrl(property.imageUrl)}')"><span class="property-badge">${escapeHtml(property.operation||property.status||'Disponible')}</span></div><div class="public-detail-body"><span class="eyebrow">${escapeHtml(property.type||'Propiedad')}</span><h3>${escapeHtml(property.name)}</h3><p class="public-detail-location">⌖ ${escapeHtml(location||'Ubicación por definir')}</p><div class="public-detail-stats"><div><strong>${escapeHtml(property.area||property.meta||'—')}</strong><span>Superficie / datos</span></div><div><strong>${escapeHtml(property.bedrooms||'—')}</strong><span>Recámaras</span></div><div><strong>${escapeHtml(property.bathrooms||'—')}</strong><span>Baños</span></div><div><strong>${escapeHtml(property.status||'Disponible')}</strong><span>Disponibilidad</span></div></div><p>${escapeHtml(property.description||'Solicita información para conocer todos los detalles de esta propiedad.')}</p><div class="public-detail-footer"><strong>${escapeHtml(property.price||'Precio a consultar')}</strong><button class="primary-button detail-interest" data-property="${escapeHtml(property.name)}" data-property-id="${escapeHtml(property.id)}">Solicitar información</button></div></div>`;
  modal.classList.add('open');modal.setAttribute('aria-hidden','false'); box.querySelector('.detail-interest')?.addEventListener('click',e=>{modal.classList.remove('open');openLeadModal(e.currentTarget.dataset.property, e.currentTarget.dataset.propertyId)});
}
function closePublicPropertyDetail(){const m=document.querySelector('#propertyDetailModal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}}

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
      <td><div class="row-actions"><button class="visibility-switch ${property.published !== false ? "is-on" : ""}" data-property-visibility="${escapeHtml(property.id)}" role="switch" aria-checked="${property.published !== false}" title="${property.published !== false ? "Visible en portal" : "Oculta en portal"}"><span></span><b>${property.published !== false ? "Visible" : "Oculta"}</b></button><button class="text-button edit-property" data-id="${escapeHtml(property.id)}">Editar</button><button class="text-button delete-property" data-id="${escapeHtml(property.id)}">Desactivar</button></div></td>
    </tr>`).join("") : `<tr><td colspan="7"><div class="empty-state"><h3>No hay propiedades con esos filtros</h3><p>Registra un inmueble nuevo o modifica la búsqueda.</p></div></td></tr>`;
  body.querySelectorAll("[data-property-visibility]").forEach((button) => button.addEventListener("click", () => togglePropertyPublication(button.dataset.propertyVisibility)));
  body.querySelectorAll(".edit-property").forEach((button) => button.addEventListener("click", () => openPropertyModal(button.dataset.id)));
  body.querySelectorAll(".delete-property").forEach((button) => button.addEventListener("click", () => deleteProperty(button.dataset.id)));
}

function renderDevelopmentCard(development, mode) {
  const cover = normalizeImageUrl(development.coverUrl) || `${localAssetPrefix}assets/terraser-cover.png`;
  const amenities = Array.isArray(development.amenities) ? development.amenities : String(development.amenities || "").split(",").map((item) => item.trim()).filter(Boolean);
  const actions = mode === "rpm" ? `<div class="development-actions"><button class="visibility-switch ${development.published ? "is-on" : ""}" data-development-visibility="${escapeHtml(development.id)}" role="switch" aria-checked="${Boolean(development.published)}" title="${development.published ? "Visible en portal" : "Oculto en portal"}"><span></span><b>${development.published ? "Visible" : "Oculto"}</b></button><button class="text-button edit-development" data-id="${escapeHtml(development.id)}">Editar</button><button class="text-button delete-development" data-id="${escapeHtml(development.id)}">Desactivar</button></div>` : "";
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
  document.querySelectorAll("[data-development-visibility]").forEach((button) => button.addEventListener("click", () => toggleDevelopment(button.dataset.developmentVisibility)));
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
    const isAdmin = document.body.classList.contains("confi-mode");
    if (isAdmin) {
      const demoRef = window.rpmDb.collection("developments").doc("terraser-demo");
      const demoSnap = await demoRef.get();
      if (!demoSnap.exists) {
        const { id, demo, ...seed } = demoDevelopment;
        await demoRef.set({ ...seed, createdAt: window.firebase.firestore.FieldValue.serverTimestamp(), updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    }
    const query = isAdmin ? window.rpmDb.collection("developments").get() : window.rpmDb.collection("developments").where("published", "==", true).where("active", "==", true).get();
    const snapshot = await query;
    if (!snapshot.empty) {
      const records = snapshot.docs.map((document) => ({ id: document.id, active: document.data().active !== false, demo: false, ...document.data() }));
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

async function togglePropertyPublication(propertyId) {
  const property = properties.find((item) => item.id === propertyId);
  if (!property || !window.rpmDb) return;
  const next = property.published === false;
  try {
    await window.rpmDb.collection("properties").doc(propertyId).update({ published: next, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() });
    property.published = next;
    renderRpmProperties();
    renderProperties();
    showToast(next ? "Propiedad visible en el portal." : "Propiedad ocultada del portal sin eliminarla.");
  } catch (error) {
    showToast("No se pudo cambiar la visibilidad de la propiedad.");
    console.error("Property publication toggle error", error);
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

function openLeadModal(property = "", propertyId = "") {
  const modal = document.querySelector("#leadModal");
  if (!modal) return;
  const form = modal.querySelector("#leadForm");
  const propertyNameInput = form?.querySelector('[name="propertyName"]');
  const propertyIdInput = form?.querySelector('[name="propertyId"]');
  const context = modal.querySelector("#leadPropertyContext");
  const matched = properties.find((item) => item.id === propertyId || item.name === property);
  const resolvedName = matched?.name || property || "Consulta general";
  const resolvedId = matched?.id || propertyId || "";
  if (propertyNameInput) propertyNameInput.value = resolvedName;
  if (propertyIdInput) propertyIdInput.value = resolvedId;
  if (context) {
    context.hidden = !property;
    context.textContent = property ? `Solicitud vinculada a: ${resolvedName}${resolvedId ? ` · ${resolvedId}` : ""}` : "";
  }
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
document.querySelector("#leadModal")?.addEventListener("click", (event) => { if (event.target.id === "leadModal") closeModal(); });
document.querySelector("#leadForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const normalizedPhone = phone.replace(/\D/g, "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const propertyId = String(formData.get("propertyId") || "").trim();
  const propertyName = String(formData.get("propertyName") || "Consulta general").trim();
  const preferredTime = String(formData.get("preferredTime") || "").trim();
  const userMessage = String(formData.get("message") || "").trim();
  const message = userMessage || `Solicito información sobre ${propertyName}${propertyId ? ` (${propertyId})` : ""}.`;
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) { submitButton.disabled = true; submitButton.textContent = "Enviando…"; }
  try {
    if (!window.rpmDb) throw new Error("Firebase no está disponible");
    let duplicateId = "";
    if (normalizedPhone.length >= 7) {
      const dup = await window.rpmDb.collection("publicLeads").where("normalizedPhone", "==", normalizedPhone).where("propertyId", "==", propertyId).limit(1).get();
      if (!dup.empty) duplicateId = dup.docs[0].id;
    }
    if (duplicateId) {
      showToast(`Ya tenemos tu solicitud para ${propertyName}. Un asesor dará seguimiento.`);
    } else {
      await window.rpmDb.collection("publicLeads").add({ name, phone, normalizedPhone, email, message, propertyId, propertyName, preferredTime, consent: true, source: "portal", status: "nuevo", followUpStatus: "pendiente", repeatCount: 0, createdAt: window.firebase.firestore.FieldValue.serverTimestamp(), lastContactAt: window.firebase.firestore.FieldValue.serverTimestamp() });
      showToast(`Interés registrado: ${propertyName}.`);
    }
    closeModal(); form.reset();
  } catch (error) {
    console.error("Lead save error", error);
    showToast("No se pudo registrar la solicitud. Revisa la conexión con Firebase.");
  } finally {
    if (submitButton) { submitButton.disabled = false; submitButton.textContent = "Enviar interés"; }
  }
});

function openLeadWhatsApp() {
  const form = document.querySelector("#leadForm");
  if (!form) return;
  const propertyName = form.querySelector('[name="propertyName"]')?.value || "una propiedad";
  const propertyId = form.querySelector('[name="propertyId"]')?.value || "";
  const name = form.querySelector('[name="name"]')?.value.trim() || "";
  const text = `Hola, me interesa ${propertyName}${propertyId ? ` (${propertyId})` : ""}.${name ? ` Mi nombre es ${name}.` : ""} ¿Me pueden compartir más información?`;
  const number = (localStorage.getItem(whatsappStorageKey) || defaultWhatsappNumber).replace(/\D/g, "");
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}
document.querySelector("#leadWhatsApp")?.addEventListener("click", openLeadWhatsApp);

async function loadPublicLeadsInbox() {
  const list = document.querySelector("#publicLeadsList");
  if (!list || !window.rpmDb) return;
  const summary = document.querySelector("#interestSummary");
  try {
    const snap = await window.rpmDb.collection("publicLeads").orderBy("createdAt", "desc").limit(50).get();
    const rows = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    document.querySelector("#interestBadge") && (document.querySelector("#interestBadge").textContent = String(rows.filter(x=>x.status==="nuevo").length));
    if (summary) summary.textContent = `${rows.length} solicitudes · ${rows.filter(x=>x.status==="nuevo").length} nuevas`;
    if (!rows.length) { list.innerHTML = '<div class="empty-state glass-panel"><h3>Sin solicitudes todavía</h3><p>Los nuevos interesados del portal aparecerán aquí.</p></div>'; return; }
    list.innerHTML = rows.map(lead => `<article class="public-lead-row glass-panel"><div><strong>${escapeHtml(lead.name||"Sin nombre")}</strong><small>${escapeHtml(lead.phone||"")} ${lead.email ? `· ${escapeHtml(lead.email)}` : ""}</small></div><div><span class="tag blue">${escapeHtml(lead.propertyName||"Consulta general")}</span><small>${escapeHtml(lead.message||"")}</small></div><div><strong>${escapeHtml(lead.preferredTime||"Cualquier horario")}</strong><small>${escapeHtml(lead.source||"portal")} · ${escapeHtml(lead.followUpStatus||"pendiente")}</small></div><div class="crm-card-actions"><button class="secondary-button convert-crm" data-lead-id="${escapeHtml(lead.id)}">Pasar a CRM</button><button class="secondary-button lead-whatsapp-admin" data-phone="${escapeHtml(lead.phone||"")}" data-property="${escapeHtml(lead.propertyName||"")}">WhatsApp</button></div></article>`).join("");
    list.querySelectorAll('.convert-crm').forEach(btn=>btn.addEventListener('click',()=>convertLeadToCrm(btn.dataset.leadId)));
    list.querySelectorAll('.lead-whatsapp-admin').forEach(btn=>btn.addEventListener('click',()=>{const phone=(btn.dataset.phone||'').replace(/\D/g,'');const msg=`Hola, te contactamos por tu interés en ${btn.dataset.property||'nuestra propiedad'}.`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer')}));
  } catch (error) { console.error("Lead inbox error", error); if(summary) summary.textContent="No se pudieron cargar las solicitudes"; }
}
document.querySelector("#refreshInterests")?.addEventListener("click", loadPublicLeadsInbox);
document.querySelector('[data-panel="interestsPanel"]')?.addEventListener("click", loadPublicLeadsInbox);

document.querySelector("#heroContact")?.addEventListener("click", () => openLeadModal());
document.querySelectorAll("[data-scroll]").forEach((button) => button.addEventListener("click", () => document.querySelector(`#${button.dataset.scroll}`).scrollIntoView({ behavior: "smooth" })));
document.querySelector("#newLead")?.addEventListener("click", () => openLeadModal());
document.querySelector("#newAction")?.addEventListener("click", () => showToast("Acciones rápidas disponibles en la siguiente versión."));
document.querySelector("#logoutDemo")?.addEventListener("click", () => showToast("Sesión de demostración cerrada."));
document.querySelectorAll(".map-pin").forEach((pin) => pin.addEventListener("click", () => showToast(`Zona seleccionada: ${pin.dataset.pin}`)));
document.querySelector("#themeToggle")?.addEventListener("click", () => {
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

// V10.0.1 - Selectores Liquid Glass estables y reutilizables en todo el RPM.
(function initLiquidSelects(){
  const ids=['propertyType','publicOperationFilter','publicPriceFilter','publicZoneFilter','rpmPropertyStatus','unitDevelopmentFilter','unitStatusFilter','mapEntityFilter','mapZoneFilter','crmOwnerFilter','crmTypeFilter','operationTypeFilter','operationStatusFilter','collectionStatusFilter','collectionDueFilter','dashboardPeriod','reportPeriod','reportOwner'];
  const registry=new Map();
  function closeAll(except){
    document.querySelectorAll('.rpm-select.is-open').forEach(root=>{
      if(root!==except){root.classList.remove('is-open');root.querySelector('.rpm-select__trigger')?.setAttribute('aria-expanded','false');}
    });
  }
  function enhance(select){
    if(!select || registry.has(select)) return;
    select.classList.add('rpm-native-select');
    select.setAttribute('aria-hidden','true');
    select.tabIndex=-1;
    const root=document.createElement('div'); root.className='rpm-select';
    const trigger=document.createElement('button'); trigger.type='button'; trigger.className='rpm-select__trigger'; trigger.setAttribute('aria-haspopup','listbox'); trigger.setAttribute('aria-expanded','false');
    const label=document.createElement('span'); label.className='rpm-select__label';
    const chevron=document.createElement('span'); chevron.className='rpm-select__chevron'; chevron.setAttribute('aria-hidden','true');
    trigger.append(label,chevron);
    const menu=document.createElement('div'); menu.className='rpm-select__menu'; menu.setAttribute('role','listbox');
    select.insertAdjacentElement('afterend',root); root.append(trigger,menu);
    function sync(){
      const current=select.options[select.selectedIndex]; label.textContent=current?.textContent||'Seleccionar'; menu.replaceChildren();
      [...select.options].forEach(opt=>{
        const b=document.createElement('button'); b.type='button'; b.className='rpm-select__option'+(opt.value===select.value?' is-selected':''); b.textContent=opt.textContent; b.dataset.value=opt.value; b.setAttribute('role','option'); b.setAttribute('aria-selected',opt.value===select.value?'true':'false');
        b.addEventListener('click',()=>{select.value=opt.value; select.dispatchEvent(new Event('change',{bubbles:true})); sync(); root.classList.remove('is-open'); trigger.setAttribute('aria-expanded','false');});
        menu.appendChild(b);
      });
    }
    trigger.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const opening=!root.classList.contains('is-open');closeAll(root);root.classList.toggle('is-open',opening);trigger.setAttribute('aria-expanded',String(opening));});
    select.addEventListener('change',sync);
    const observer=new MutationObserver(sync); observer.observe(select,{childList:true,subtree:true});
    registry.set(select,{sync,observer,root}); sync();
  }
  function start(){ids.forEach(id=>enhance(document.getElementById(id)));}
  document.addEventListener('click',()=>closeAll());
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

// V5.0 - Catálogo público avanzado
['publicOperationFilter','publicPriceFilter','publicZoneFilter'].forEach(id=>document.getElementById(id)?.addEventListener('change',renderProperties));
document.getElementById('clearPublicFilters')?.addEventListener('click',()=>{if(searchInput)searchInput.value='';if(typeSelect)typeSelect.value='all';['publicOperationFilter','publicPriceFilter','publicZoneFilter'].forEach(id=>{const el=document.getElementById(id);if(el){el.value='all';el.dispatchEvent(new Event('change',{bubbles:true}))}});renderProperties();});
document.querySelectorAll('[data-close-detail-modal]').forEach(b=>b.addEventListener('click',closePublicPropertyDetail));
document.getElementById('propertyDetailModal')?.addEventListener('click',e=>{if(e.target.id==='propertyDetailModal')closePublicPropertyDetail()});

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
// V7.0 - CRM inmobiliario
const CRM_STAGES=['Nuevo','Contactado','Calificado','Visita agendada','Negociación','Cerrado','Perdido'];
let crmContacts=[], crmActivities=[], editingCrmId=null, activeCrmId=null;
function crmEsc(v){return escapeHtml(String(v??''))}
function crmDate(v){if(!v)return 'Sin fecha';try{const d=v.toDate?v.toDate():new Date(v);return d.toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'})}catch{return 'Sin fecha'}}
async function loadCrm(){const box=document.getElementById('crmKanban');if(!box)return;if(!window.rpmDb){renderCrm();return}try{const [c,a]=await Promise.all([rpmDb.collection('crmContacts').orderBy('updatedAt','desc').limit(250).get(),rpmDb.collection('crmActivities').orderBy('createdAt','desc').limit(500).get()]);crmContacts=c.docs.map(d=>({id:d.id,...d.data()}));crmActivities=a.docs.map(d=>({id:d.id,...d.data()}));renderCrm()}catch(e){console.error('CRM load',e);box.innerHTML='<div class="empty-state glass-panel"><h3>No se pudo cargar el CRM</h3><p>Publica las reglas V7 de Firestore y vuelve a intentar.</p></div>'}}
function filteredCrm(){const q=(document.getElementById('crmSearch')?.value||'').toLowerCase().trim(),owner=document.getElementById('crmOwnerFilter')?.value||'all',type=document.getElementById('crmTypeFilter')?.value||'all';return crmContacts.filter(c=>c.active!==false&&(!q||[c.name,c.phone,c.email,c.propertyName,c.owner].some(x=>String(x||'').toLowerCase().includes(q)))&&(owner==='all'||c.owner===owner)&&(type==='all'||c.contactType===type))}
function renderCrm(){const box=document.getElementById('crmKanban');if(!box)return;const rows=filteredCrm(), owners=[...new Set(crmContacts.map(x=>x.owner).filter(Boolean))].sort();const of=document.getElementById('crmOwnerFilter');if(of){const v=of.value;of.innerHTML='<option value="all">Todos los responsables</option>'+owners.map(x=>`<option>${crmEsc(x)}</option>`).join('');of.value=owners.includes(v)||v==='all'?v:'all'}const sum=document.getElementById('crmSummary');if(sum){const due=rows.filter(x=>x.nextActionAt&&new Date(x.nextActionAt)<=new Date()).length;sum.innerHTML=`<div><strong>${rows.length}</strong><span>Contactos activos</span></div><div><strong>${rows.filter(x=>x.stage==='Nuevo').length}</strong><span>Nuevos</span></div><div><strong>${rows.filter(x=>x.stage==='Negociación').length}</strong><span>En negociación</span></div><div><strong>${due}</strong><span>Acciones vencidas / hoy</span></div>`}box.innerHTML=CRM_STAGES.map(stage=>{const arr=rows.filter(x=>(x.stage||'Nuevo')===stage);return `<section class="crm-stage"><div class="crm-stage-head"><span>${stage}</span><b>${arr.length}</b></div>${arr.map(c=>`<article class="crm-contact-card" data-crm-id="${crmEsc(c.id)}"><strong>${crmEsc(c.name||'Sin nombre')}</strong><small>${crmEsc(c.propertyName||c.contactType||'Sin inmueble relacionado')}</small><div class="crm-contact-meta"><span class="tag blue">${crmEsc(c.contactType||'Nuevo')}</span>${c.owner?`<span class="tag green">${crmEsc(c.owner)}</span>`:''}</div><span class="crm-contact-next">${c.nextAction?'→ '+crmEsc(c.nextAction):'Sin próxima acción'}${c.nextActionAt?' · '+crmDate(c.nextActionAt):''}</span></article>`).join('')||'<div class="crm-empty">Sin contactos</div>'}</section>`}).join('');box.querySelectorAll('[data-crm-id]').forEach(el=>el.onclick=()=>openCrmDetail(el.dataset.crmId))}
function openCrmModal(id='',seed={}){const m=document.getElementById('crmContactModal'),f=document.getElementById('crmContactForm');if(!m||!f)return;editingCrmId=id||null;f.reset();const c=id?crmContacts.find(x=>x.id===id):seed;['sourceLeadId','name','phone','email','contactType','stage','owner','propertyName','nextAction','nextActionAt','source','preferences','notes'].forEach(k=>{if(f.elements[k]&&c?.[k]!=null)f.elements[k].value=c[k]});document.getElementById('crmContactModalTitle').textContent=id?'Editar contacto':'Nuevo contacto';m.classList.add('open');m.setAttribute('aria-hidden','false')}
function closeCrmModal(){const m=document.getElementById('crmContactModal');m?.classList.remove('open');m?.setAttribute('aria-hidden','true')}
async function saveCrmContact(e){e.preventDefault();if(!window.rpmDb){showToast('Firebase no está disponible.');return}const d=Object.fromEntries(new FormData(e.currentTarget).entries()),rec={name:d.name.trim(),phone:d.phone.trim(),email:d.email.trim(),contactType:d.contactType,stage:d.stage,owner:d.owner.trim(),propertyName:d.propertyName.trim(),nextAction:d.nextAction.trim(),nextActionAt:d.nextActionAt||'',source:d.source.trim()||'Manual',preferences:d.preferences.trim(),notes:d.notes.trim(),sourceLeadId:d.sourceLeadId||'',active:true,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};try{if(editingCrmId)await rpmDb.collection('crmContacts').doc(editingCrmId).update(rec);else{rec.createdAt=firebase.firestore.FieldValue.serverTimestamp();const ref=await rpmDb.collection('crmContacts').add(rec);await rpmDb.collection('crmActivities').add({contactId:ref.id,type:'Alta',summary:'Contacto creado en CRM',createdAt:firebase.firestore.FieldValue.serverTimestamp()});if(rec.sourceLeadId)await rpmDb.collection('publicLeads').doc(rec.sourceLeadId).update({followUpStatus:'crm',status:'atendido'})}closeCrmModal();await Promise.all([loadCrm(),loadPublicLeadsInbox()]);showToast(editingCrmId?'Contacto actualizado.':'Contacto agregado al CRM.')}catch(err){console.error(err);showToast('No se pudo guardar. Revisa las reglas V7 de Firebase.')}}
async function convertLeadToCrm(id){if(!window.rpmDb)return;try{const s=await rpmDb.collection('publicLeads').doc(id).get();if(!s.exists)return;const l=s.data();const dup=crmContacts.find(c=>c.sourceLeadId===id)||(l.normalizedPhone&&crmContacts.find(c=>String(c.phone||'').replace(/\D/g,'')===l.normalizedPhone&&c.propertyName===l.propertyName));if(dup){openCrmDetail(dup.id);showToast('Este interesado ya está en el CRM.');return}openCrmModal('',{sourceLeadId:id,name:l.name,phone:l.phone,email:l.email||'',contactType:'Nuevo',stage:'Nuevo',propertyName:l.propertyName||'',source:l.source||'Portal',notes:l.message||'',nextAction:'Primer contacto'})}catch(e){console.error(e);showToast('No se pudo preparar el contacto.')}}
function openCrmDetail(id){const c=crmContacts.find(x=>x.id===id),m=document.getElementById('crmDetailModal'),box=document.getElementById('crmDetailContent');if(!c||!m||!box)return;activeCrmId=id;const acts=crmActivities.filter(a=>a.contactId===id);box.innerHTML=`<div class="crm-detail-head"><span class="eyebrow">EXPEDIENTE COMERCIAL</span><h3>${crmEsc(c.name)}</h3><p>${crmEsc(c.phone)}${c.email?' · '+crmEsc(c.email):''}</p></div><div class="crm-detail-grid"><div><small>Etapa</small><strong>${crmEsc(c.stage||'Nuevo')}</strong></div><div><small>Perfil</small><strong>${crmEsc(c.contactType||'Nuevo')}</strong></div><div><small>Interés</small><strong>${crmEsc(c.propertyName||'Sin inmueble')}</strong></div><div><small>Responsable</small><strong>${crmEsc(c.owner||'Sin asignar')}</strong></div><div><small>Próxima acción</small><strong>${crmEsc(c.nextAction||'Sin definir')}</strong><small>${crmDate(c.nextActionAt)}</small></div><div><small>Fuente</small><strong>${crmEsc(c.source||'Manual')}</strong></div></div><div class="crm-card-actions"><button class="primary-button" id="crmEditCurrent">Editar ficha</button><button class="secondary-button" id="crmWhatsappCurrent">WhatsApp</button></div><h4>Registrar actividad</h4><form id="crmActivityForm" class="crm-activity-form"><select name="type"><option>Llamada</option><option>WhatsApp</option><option>Nota</option><option>Cita</option><option>Visita</option><option>Correo</option></select><input name="when" type="datetime-local"/><input name="summary" required placeholder="Resultado / próxima acción"/><button class="primary-button">Guardar</button></form><h4>Historial</h4><div class="crm-timeline">${acts.map(a=>`<div class="crm-activity"><strong>${crmEsc(a.type||'Actividad')}</strong><small>${crmDate(a.createdAt)}</small><div>${crmEsc(a.summary||'')}</div></div>`).join('')||'<div class="crm-empty">Sin actividades registradas.</div>'}</div>`;box.querySelector('#crmEditCurrent').onclick=()=>{m.classList.remove('open');openCrmModal(id)};box.querySelector('#crmWhatsappCurrent').onclick=()=>window.open('https://wa.me/52'+String(c.phone||'').replace(/\D/g,'')+'?text='+encodeURIComponent('Hola '+(c.name||'')+', doy seguimiento a tu interés en '+(c.propertyName||'nuestra oferta inmobiliaria')+'.'),'_blank');box.querySelector('#crmActivityForm').onsubmit=saveCrmActivity;m.classList.add('open');m.setAttribute('aria-hidden','false')}
async function saveCrmActivity(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());try{await rpmDb.collection('crmActivities').add({contactId:activeCrmId,type:d.type,summary:d.summary.trim(),scheduledAt:d.when||'',createdAt:firebase.firestore.FieldValue.serverTimestamp()});await rpmDb.collection('crmContacts').doc(activeCrmId).update({lastActivityAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});await loadCrm();openCrmDetail(activeCrmId);showToast('Actividad registrada.')}catch(err){console.error(err);showToast('No se pudo registrar la actividad.')}}
document.getElementById('newCrmContact')?.addEventListener('click',()=>openCrmModal());document.getElementById('crmContactForm')?.addEventListener('submit',saveCrmContact);document.querySelectorAll('[data-close-crm-modal]').forEach(b=>b.onclick=closeCrmModal);document.querySelectorAll('[data-close-crm-detail]').forEach(b=>b.onclick=()=>document.getElementById('crmDetailModal')?.classList.remove('open'));['crmSearch','crmOwnerFilter','crmTypeFilter'].forEach(id=>document.getElementById(id)?.addEventListener(id==='crmSearch'?'input':'change',renderCrm));document.querySelector('[data-panel="crmPanel"]')?.addEventListener('click',loadCrm);
setTimeout(loadCrm,1400);

// V8.0 - Operaciones, ventas, rentas y expedientes
let rpmOperations=[], editingOperationId=null, activeOperationId=null;
const OP_DOCS=['Identificación del cliente','Comprobante de domicilio','Documento de propiedad','Contrato / convenio','Comprobante de pago inicial'];
function opEsc(v){return escapeHtml(String(v??''))}
function opMoney(v){return v||'Por definir'}
function opDate(v){if(!v)return 'Sin fecha';try{const d=v.toDate?v.toDate():new Date(v);return d.toLocaleDateString('es-MX',{dateStyle:'medium'})}catch{return String(v)}}
async function loadOperations(){const box=document.getElementById('operationsList');if(!box)return;if(!window.rpmDb){renderOperations();return}try{const s=await rpmDb.collection('operations').orderBy('updatedAt','desc').limit(250).get();rpmOperations=s.docs.map(d=>({id:d.id,...d.data()}));renderOperations()}catch(e){console.error('Operations load',e);box.innerHTML='<div class="empty-state glass-panel"><h3>No se pudieron cargar las operaciones</h3><p>Publica las reglas V8 de Firestore y vuelve a intentar.</p></div>'}}
function filteredOperations(){const q=(document.getElementById('operationSearch')?.value||'').toLowerCase().trim(),t=document.getElementById('operationTypeFilter')?.value||'all',st=document.getElementById('operationStatusFilter')?.value||'all';return rpmOperations.filter(o=>o.active!==false&&(!q||[o.contactName,o.propertyName,o.owner,o.type].some(x=>String(x||'').toLowerCase().includes(q)))&&(t==='all'||o.type===t)&&(st==='all'||o.status===st))}
function renderOperations(){const box=document.getElementById('operationsList');if(!box)return;const rows=filteredOperations(),sum=document.getElementById('operationSummary');if(sum)sum.innerHTML=`<div><strong>${rows.length}</strong><span>Operaciones activas</span></div><div><strong>${rows.filter(x=>x.type==='Apartado').length}</strong><span>Apartados</span></div><div><strong>${rows.filter(x=>x.type==='Venta').length}</strong><span>Ventas</span></div><div><strong>${rows.filter(x=>x.type==='Renta').length}</strong><span>Rentas</span></div>`;box.innerHTML=rows.map(o=>`<article class="operation-card"><div><span class="eyebrow">${opEsc(o.type||'Operación')}</span><strong>${opEsc(o.contactName||'Cliente')}</strong><small>${opEsc(o.propertyName||'Sin inmueble')}</small></div><div><strong>${opEsc(o.owner||'Sin responsable')}</strong><small>Responsable</small></div><div><strong>${opEsc(opMoney(o.amount))}</strong><small>Importe</small></div><div><strong>${opEsc(opDate(o.operationDate))}</strong><small>Fecha</small></div><div><span class="tag blue op-status">${opEsc(o.status||'Preparación')}</span><small>${Object.values(o.checklist||{}).filter(Boolean).length}/${OP_DOCS.length} documentos</small></div><button class="secondary-button" data-operation-id="${opEsc(o.id)}">Ver expediente</button></article>`).join('')||'<div class="empty-state glass-panel"><span class="empty-icon">▤</span><h3>Sin operaciones registradas</h3><p>Crea un apartado, venta o renta y vincúlalo con un contacto del CRM.</p></div>';box.querySelectorAll('[data-operation-id]').forEach(b=>b.onclick=()=>openOperationDetail(b.dataset.operationId))}
function fillOperationContacts(selected=''){const el=document.getElementById('operationContactId');if(!el)return;el.innerHTML='<option value="">Seleccionar contacto CRM</option>'+crmContacts.filter(c=>c.active!==false).map(c=>`<option value="${opEsc(c.id)}">${opEsc(c.name)}${c.propertyName?' · '+opEsc(c.propertyName):''}</option>`).join('');el.value=selected||''}
function openOperationModal(id=''){const m=document.getElementById('operationModal'),f=document.getElementById('operationForm');if(!m||!f)return;editingOperationId=id||null;f.reset();const o=id?rpmOperations.find(x=>x.id===id):null;fillOperationContacts(o?.contactId||'');['type','status','propertyName','owner','operationDate','amount','commission','conditions'].forEach(k=>{if(f.elements[k]&&o?.[k]!=null)f.elements[k].value=o[k]});document.getElementById('operationModalTitle').textContent=id?'Editar operación':'Nueva operación';m.classList.add('open');m.setAttribute('aria-hidden','false')}
function closeOperationModal(){const m=document.getElementById('operationModal');m?.classList.remove('open');m?.setAttribute('aria-hidden','true')}
async function saveOperation(e){e.preventDefault();if(!window.rpmDb){showToast('Firebase no está disponible.');return}const d=Object.fromEntries(new FormData(e.currentTarget).entries()),c=crmContacts.find(x=>x.id===d.contactId),old=editingOperationId?rpmOperations.find(x=>x.id===editingOperationId):null,rec={type:d.type,status:d.status,contactId:d.contactId,contactName:c?.name||'Cliente',propertyName:d.propertyName.trim(),owner:d.owner.trim(),operationDate:d.operationDate||'',amount:d.amount.trim(),commission:d.commission.trim(),conditions:d.conditions.trim(),active:true,checklist:old?.checklist||{},updatedAt:firebase.firestore.FieldValue.serverTimestamp()};try{let ref;if(editingOperationId){ref=rpmDb.collection('operations').doc(editingOperationId);await ref.update(rec)}else{rec.createdAt=firebase.firestore.FieldValue.serverTimestamp();rec.history=[{action:'Operación creada',at:new Date().toISOString()}];ref=await rpmDb.collection('operations').add(rec)}if(c&&d.status==='Cerrada')await rpmDb.collection('crmContacts').doc(c.id).update({stage:'Cerrado',contactType:'Cliente efectivo',updatedAt:firebase.firestore.FieldValue.serverTimestamp()});closeOperationModal();await loadOperations();showToast(editingOperationId?'Operación actualizada.':'Operación creada.')}catch(err){console.error(err);showToast('No se pudo guardar. Revisa las reglas V8 de Firebase.')}}
function openOperationDetail(id){const o=rpmOperations.find(x=>x.id===id),m=document.getElementById('operationDetailModal'),box=document.getElementById('operationDetailContent');if(!o||!m||!box)return;activeOperationId=id;const hist=Array.isArray(o.history)?o.history:[];box.innerHTML=`<span class="eyebrow">EXPEDIENTE · ${opEsc(o.type)}</span><h3>${opEsc(o.contactName)} · ${opEsc(o.propertyName)}</h3><div class="operation-detail-grid"><div><small>Estado</small><strong>${opEsc(o.status)}</strong></div><div><small>Responsable</small><strong>${opEsc(o.owner||'Sin asignar')}</strong></div><div><small>Fecha</small><strong>${opEsc(opDate(o.operationDate))}</strong></div><div><small>Importe</small><strong>${opEsc(opMoney(o.amount))}</strong></div><div><small>Comisión</small><strong>${opEsc(opMoney(o.commission))}</strong></div><div><small>Condiciones</small><strong>${opEsc(o.conditions||'Sin condiciones')}</strong></div></div><div class="crm-card-actions"><button class="primary-button" id="editOperationCurrent">Editar operación</button></div><h4>Checklist documental</h4><div class="operation-checklist">${OP_DOCS.map((d,i)=>`<div class="operation-check"><label><input type="checkbox" data-op-doc="${i}" ${o.checklist?.[i]?'checked':''}/> ${opEsc(d)}</label><span>${o.checklist?.[i]?'Completo':'Pendiente'}</span></div>`).join('')}</div><h4>Historial de cambios</h4><div class="operation-history">${hist.slice().reverse().map(h=>`<div><strong>${opEsc(h.action)}</strong><small>${opEsc(opDate(h.at))}</small></div>`).join('')||'<div>Sin cambios adicionales.</div>'}</div>`;box.querySelector('#editOperationCurrent').onclick=()=>{m.classList.remove('open');openOperationModal(id)};box.querySelectorAll('[data-op-doc]').forEach(ch=>ch.onchange=()=>toggleOperationDoc(id,ch.dataset.opDoc,ch.checked));m.classList.add('open');m.setAttribute('aria-hidden','false')}
async function toggleOperationDoc(id,key,val){const o=rpmOperations.find(x=>x.id===id);if(!o)return;const checklist={...(o.checklist||{}),[key]:val},history=[...(o.history||[]),{action:`Documento ${OP_DOCS[Number(key)]}: ${val?'completo':'pendiente'}`,at:new Date().toISOString()}];try{await rpmDb.collection('operations').doc(id).update({checklist,history,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});await loadOperations();openOperationDetail(id)}catch(e){console.error(e);showToast('No se pudo actualizar el expediente.')}}
document.getElementById('newOperation')?.addEventListener('click',async()=>{if(!crmContacts.length)await loadCrm();openOperationModal()});document.getElementById('operationForm')?.addEventListener('submit',saveOperation);document.querySelectorAll('[data-close-operation]').forEach(b=>b.onclick=closeOperationModal);document.querySelectorAll('[data-close-operation-detail]').forEach(b=>b.onclick=()=>document.getElementById('operationDetailModal')?.classList.remove('open'));['operationSearch','operationTypeFilter','operationStatusFilter'].forEach(id=>document.getElementById(id)?.addEventListener(id==='operationSearch'?'input':'change',renderOperations));document.querySelector('[data-panel="documentsPanel"]')?.addEventListener('click',loadOperations);setTimeout(loadOperations,1600);

// V9.0 - Cobranza, abonos, deudas y saldos
let rpmCollections=[], rpmCollectionPayments=[], editingCollectionId=null, activeCollectionId=null;
function colNum(v){const n=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:0}
function colMoney(v){return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(colNum(v))}
function colDate(v){if(!v)return 'Sin fecha';try{const d=v.toDate?v.toDate():new Date(String(v).length===10?v+'T12:00:00':v);return d.toLocaleDateString('es-MX',{dateStyle:'medium'})}catch{return String(v)}}
function colEffectiveStatus(a){if(a.status==='Bloqueado')return 'Bloqueado';const bal=colBalance(a);if(bal<=0)return 'Pagado';if(a.dueDate&&new Date(a.dueDate+'T23:59:59')<new Date())return 'Vencido';if(colPaid(a)>0)return 'Parcial';return a.status||'Pendiente'}
function colPaid(a){return rpmCollectionPayments.filter(p=>p.accountId===a.id).reduce((s,p)=>s+colNum(p.amount),0)}
function colBalance(a){return Math.max(0,colNum(a.totalAmount)+colNum(a.lateFee)-colPaid(a))}
async function loadCollections(){const box=document.getElementById('collectionsList');if(!box)return;if(!window.rpmDb){renderCollections();return}try{const [a,p]=await Promise.all([rpmDb.collection('collections').orderBy('updatedAt','desc').limit(300).get(),rpmDb.collection('collectionPayments').orderBy('createdAt','desc').limit(800).get()]);rpmCollections=a.docs.map(d=>({id:d.id,...d.data()}));rpmCollectionPayments=p.docs.map(d=>({id:d.id,...d.data()}));renderCollections()}catch(e){console.error('Collections load',e);box.innerHTML='<div class="empty-state glass-panel"><h3>No se pudo cargar la cobranza</h3><p>Publica las reglas V9 de Firestore y vuelve a intentar.</p></div>'}}
function filteredCollections(){const q=(document.getElementById('collectionSearch')?.value||'').toLowerCase().trim(),st=document.getElementById('collectionStatusFilter')?.value||'all',due=document.getElementById('collectionDueFilter')?.value||'all',now=new Date();return rpmCollections.filter(a=>{if(a.active===false)return false;const eff=colEffectiveStatus(a);if(q&&![a.contactName,a.propertyName,a.operationType,a.owner].some(x=>String(x||'').toLowerCase().includes(q)))return false;if(st!=='all'&&eff!==st)return false;if(due!=='all'){if(!a.dueDate)return false;const d=new Date(a.dueDate+'T23:59:59'),days=(d-now)/86400000;if(due==='overdue'&&days>=0)return false;if(due!=='overdue'&&(days<0||days>Number(due)))return false}return true})}
function renderCollections(){const rows=filteredCollections(),box=document.getElementById('collectionsList'),sum=document.getElementById('collectionSummary');if(!box)return;const active=rpmCollections.filter(a=>a.active!==false),total=active.reduce((s,a)=>s+colBalance(a),0),over=active.filter(a=>colEffectiveStatus(a)==='Vencido').reduce((s,a)=>s+colBalance(a),0),paid=rpmCollectionPayments.reduce((s,p)=>s+colNum(p.amount),0);if(sum)sum.innerHTML=`<div><strong>${colMoney(total)}</strong><span>Cartera pendiente</span></div><div><strong>${colMoney(over)}</strong><span>Cartera vencida</span></div><div><strong>${colMoney(paid)}</strong><span>Abonos registrados</span></div><div><strong>${active.filter(a=>colEffectiveStatus(a)!=='Pagado').length}</strong><span>Cuentas activas</span></div>`;box.innerHTML=rows.map(a=>{const st=colEffectiveStatus(a);return `<article class="collection-card"><div><span class="eyebrow">${opEsc(a.operationType||'OPERACIÓN')}</span><strong>${opEsc(a.contactName||'Cliente')}</strong><small>${opEsc(a.propertyName||'Sin inmueble')}</small></div><div><strong>${colMoney(a.totalAmount)}</strong><small>Importe</small></div><div><strong>${colMoney(colPaid(a))}</strong><small>Abonado</small></div><div><strong>${colMoney(colBalance(a))}</strong><small>Saldo</small></div><div><span class="tag blue collection-status ${st==='Vencido'?'overdue':st==='Pagado'?'paid':''}">${opEsc(st)}</span><small>Vence ${opEsc(colDate(a.dueDate))}</small></div><div class="collection-actions"><button class="secondary-button" data-col-detail="${opEsc(a.id)}">Estado de cuenta</button>${st!=='Pagado'?`<button class="primary-button" data-col-pay="${opEsc(a.id)}">＋ Abono</button>`:''}</div></article>`}).join('')||'<div class="empty-state glass-panel"><span class="empty-icon">$</span><h3>Sin cuentas por cobrar</h3><p>Crea una cuenta y vincúlala con una operación registrada en V8.</p></div>';box.querySelectorAll('[data-col-detail]').forEach(b=>b.onclick=()=>openCollectionDetail(b.dataset.colDetail));box.querySelectorAll('[data-col-pay]').forEach(b=>b.onclick=()=>openCollectionPayment(b.dataset.colPay))}
function fillCollectionOperations(selected=''){const el=document.getElementById('collectionOperationId');if(!el)return;el.innerHTML='<option value="">Seleccionar operación</option>'+rpmOperations.filter(o=>o.active!==false&&o.status!=='Cancelada').map(o=>`<option value="${opEsc(o.id)}">${opEsc(o.contactName)} · ${opEsc(o.propertyName)} · ${opEsc(o.type)}</option>`).join('');el.value=selected||''}
async function openCollectionAccount(id=''){if(!rpmOperations.length)await loadOperations();const m=document.getElementById('collectionAccountModal'),f=document.getElementById('collectionAccountForm');if(!m||!f)return;editingCollectionId=id||null;f.reset();const a=id?rpmCollections.find(x=>x.id===id):null;fillCollectionOperations(a?.operationId||'');['status','totalAmount','dueDate','installments','lateFee','notes'].forEach(k=>{if(f.elements[k]&&a?.[k]!=null)f.elements[k].value=a[k]});document.getElementById('collectionAccountModalTitle').textContent=id?'Editar cuenta por cobrar':'Nueva cuenta por cobrar';m.classList.add('open');m.setAttribute('aria-hidden','false')}
function closeCollectionAccount(){document.getElementById('collectionAccountModal')?.classList.remove('open')}
async function saveCollectionAccount(e){e.preventDefault();if(!window.rpmDb){showToast('Firebase no está disponible.');return}const d=Object.fromEntries(new FormData(e.currentTarget).entries()),o=rpmOperations.find(x=>x.id===d.operationId);if(!o){showToast('Selecciona una operación válida.');return}const rec={operationId:o.id,operationType:o.type||'',contactId:o.contactId||'',contactName:o.contactName||'Cliente',propertyName:o.propertyName||'',owner:o.owner||'',status:d.status,totalAmount:colNum(d.totalAmount),dueDate:d.dueDate,installments:Math.max(1,Number(d.installments)||1),lateFee:colNum(d.lateFee),notes:d.notes.trim(),active:true,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};try{if(editingCollectionId)await rpmDb.collection('collections').doc(editingCollectionId).update(rec);else{rec.createdAt=firebase.firestore.FieldValue.serverTimestamp();await rpmDb.collection('collections').add(rec)}closeCollectionAccount();await loadCollections();showToast(editingCollectionId?'Cuenta actualizada.':'Cuenta por cobrar creada.')}catch(err){console.error(err);showToast('No se pudo guardar. Revisa las reglas V9 de Firebase.')}}
function openCollectionPayment(id){const a=rpmCollections.find(x=>x.id===id),m=document.getElementById('collectionPaymentModal'),f=document.getElementById('collectionPaymentForm');if(!a||!m||!f)return;f.reset();f.elements.accountId.value=id;f.elements.paymentDate.value=new Date().toISOString().slice(0,10);f.elements.amount.max=colBalance(a);m.classList.add('open');m.setAttribute('aria-hidden','false')}
async function saveCollectionPayment(e){e.preventDefault();if(!window.rpmDb)return;const d=Object.fromEntries(new FormData(e.currentTarget).entries()),a=rpmCollections.find(x=>x.id===d.accountId),amount=colNum(d.amount);if(!a||amount<=0){showToast('Captura un abono válido.');return}if(amount>colBalance(a)+.01){showToast('El abono no puede superar el saldo pendiente.');return}try{await rpmDb.collection('collectionPayments').add({accountId:a.id,operationId:a.operationId,contactName:a.contactName,propertyName:a.propertyName,amount,paymentDate:d.paymentDate,method:d.method,reference:d.reference.trim(),notes:d.notes.trim(),createdAt:firebase.firestore.FieldValue.serverTimestamp()});const remaining=Math.max(0,colBalance(a)-amount);await rpmDb.collection('collections').doc(a.id).update({status:remaining<=0?'Pagado':'Parcial',updatedAt:firebase.firestore.FieldValue.serverTimestamp()});document.getElementById('collectionPaymentModal')?.classList.remove('open');await loadCollections();showToast('Abono registrado correctamente.')}catch(err){console.error(err);showToast('No se pudo registrar el abono. Revisa las reglas V9.')}}
function openCollectionDetail(id){const a=rpmCollections.find(x=>x.id===id),m=document.getElementById('collectionDetailModal'),box=document.getElementById('collectionDetailContent');if(!a||!m||!box)return;activeCollectionId=id;const pays=rpmCollectionPayments.filter(p=>p.accountId===id),st=colEffectiveStatus(a);box.innerHTML=`<span class="eyebrow">ESTADO DE CUENTA · V9.0</span><h3>${opEsc(a.contactName)} · ${opEsc(a.propertyName)}</h3><div class="collection-detail-grid"><div><small>Estado</small><strong>${opEsc(st)}</strong></div><div><small>Importe total</small><strong>${colMoney(a.totalAmount)}</strong></div><div><small>Recargos</small><strong>${colMoney(a.lateFee)}</strong></div><div><small>Abonado</small><strong>${colMoney(colPaid(a))}</strong></div><div><small>Saldo</small><strong>${colMoney(colBalance(a))}</strong></div><div><small>Vencimiento</small><strong>${opEsc(colDate(a.dueDate))}</strong></div></div><div class="crm-card-actions"><button class="secondary-button" id="editCollectionCurrent">Editar cuenta</button>${st!=='Pagado'?'<button class="primary-button" id="payCollectionCurrent">＋ Registrar abono</button>':''}</div><h4>Historial de abonos</h4><div class="payment-history">${pays.map(p=>`<div class="payment-row"><div><strong>${colMoney(p.amount)}</strong><small>${opEsc(p.method||'Pago')}</small></div><div><strong>${opEsc(colDate(p.paymentDate))}</strong><small>Fecha</small></div><div><strong>${opEsc(p.reference||'Sin referencia')}</strong><small>${opEsc(p.notes||'')}</small></div></div>`).join('')||'<div class="empty-state"><p>Sin abonos registrados.</p></div>'}</div>`;box.querySelector('#editCollectionCurrent').onclick=()=>{m.classList.remove('open');openCollectionAccount(id)};box.querySelector('#payCollectionCurrent')?.addEventListener('click',()=>{m.classList.remove('open');openCollectionPayment(id)});m.classList.add('open');m.setAttribute('aria-hidden','false')}
document.getElementById('newCollectionAccount')?.addEventListener('click',()=>openCollectionAccount());document.getElementById('collectionAccountForm')?.addEventListener('submit',saveCollectionAccount);document.getElementById('collectionPaymentForm')?.addEventListener('submit',saveCollectionPayment);document.querySelectorAll('[data-close-collection-account]').forEach(b=>b.onclick=closeCollectionAccount);document.querySelectorAll('[data-close-collection-payment]').forEach(b=>b.onclick=()=>document.getElementById('collectionPaymentModal')?.classList.remove('open'));document.querySelectorAll('[data-close-collection-detail]').forEach(b=>b.onclick=()=>document.getElementById('collectionDetailModal')?.classList.remove('open'));['collectionSearch','collectionStatusFilter','collectionDueFilter'].forEach(id=>document.getElementById(id)?.addEventListener(id==='collectionSearch'?'input':'change',renderCollections));document.querySelector('[data-panel="collectionsPanel"]')?.addEventListener('click',loadCollections);setTimeout(loadCollections,1800);

// V10.0 - Dashboard, indicadores y reportes
let v10Data={properties:[],crm:[],operations:[],collections:[],payments:[]};
function v10Num(v){const n=Number(String(v??0).replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:0}
function v10Money(v){return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v10Num(v))}
function v10Date(v){if(!v)return null;if(v?.toDate)return v.toDate();const d=new Date(v);return isNaN(d)?null:d}
function v10InPeriod(row,days){if(days==='all')return true;const d=v10Date(row.updatedAt)||v10Date(row.createdAt)||v10Date(row.operationDate)||v10Date(row.paymentDate);return !d||((Date.now()-d.getTime())/86400000<=Number(days))}
function v10Group(rows,key,labels=[]){const out={};labels.forEach(x=>out[x]=0);rows.forEach(r=>{const k=r[key]||'Sin definir';out[k]=(out[k]||0)+1});return out}
function v10Bars(target,data){const el=document.getElementById(target);if(!el)return;const entries=Object.entries(data),max=Math.max(1,...entries.map(([,v])=>v));el.innerHTML=entries.map(([k,v])=>`<div class="analytics-row"><span title="${opEsc(k)}">${opEsc(k)}</span><div class="analytics-track"><div class="analytics-fill" style="width:${Math.max(3,(v/max)*100)}%"></div></div><strong>${v}</strong></div>`).join('')||'<div class="empty-state"><p>Sin datos para este periodo.</p></div>'}
async function loadV10Data(){if(!window.rpmDb)return;try{const [p,c,o,a,pay]=await Promise.all([rpmDb.collection('properties').get(),rpmDb.collection('crmContacts').get(),rpmDb.collection('operations').get(),rpmDb.collection('collections').get(),rpmDb.collection('collectionPayments').get()]);v10Data={properties:p.docs.map(d=>({id:d.id,...d.data()})),crm:c.docs.map(d=>({id:d.id,...d.data()})),operations:o.docs.map(d=>({id:d.id,...d.data()})),collections:a.docs.map(d=>({id:d.id,...d.data()})),payments:pay.docs.map(d=>({id:d.id,...d.data()}))};renderV10Dashboard();renderV10Reports()}catch(e){console.error('V10 dashboard',e);showToast('No se pudieron consolidar todos los indicadores.') }}
function v10Balance(a){const paid=v10Data.payments.filter(p=>p.accountId===a.id).reduce((s,p)=>s+v10Num(p.amount),0);return Math.max(0,v10Num(a.totalAmount)+v10Num(a.lateFee)-paid)}
function renderV10Dashboard(){const days=document.getElementById('dashboardPeriod')?.value||'all',p=v10Data.properties.filter(x=>x.active!==false),c=v10Data.crm.filter(x=>x.active!==false&&v10InPeriod(x,days)),o=v10Data.operations.filter(x=>x.active!==false&&v10InPeriod(x,days)),a=v10Data.collections.filter(x=>x.active!==false),pending=a.reduce((s,x)=>s+v10Balance(x),0),closed=o.filter(x=>x.status==='Cerrada'),amount=closed.reduce((s,x)=>s+v10Num(x.amount),0),metrics=document.getElementById('dashboardMetrics');if(metrics)metrics.innerHTML=`<article class="metric-card glass-panel"><span>Inventario activo</span><strong>${p.length}</strong><small>${p.filter(x=>x.published).length} publicados</small></article><article class="metric-card glass-panel"><span>Prospectos CRM</span><strong>${c.length}</strong><small>${c.filter(x=>x.stage==='Negociación').length} en negociación</small></article><article class="metric-card glass-panel"><span>Operaciones cerradas</span><strong>${closed.length}</strong><small>${v10Money(amount)} operado</small></article><article class="metric-card glass-panel"><span>Cartera pendiente</span><strong>${v10Money(pending)}</strong><small>${a.filter(x=>v10Balance(x)>0).length} cuentas con saldo</small></article>`;v10Bars('dashboardFunnel',v10Group(c,'stage',['Nuevo','Contactado','Calificado','Visita agendada','Negociación','Cerrado']));v10Bars('dashboardOperations',v10Group(o,'type',['Apartado','Venta','Renta']));v10Bars('dashboardCollections',v10Group(a.map(x=>({...x,status:typeof colEffectiveStatus==='function'?colEffectiveStatus(x):(x.status||'Pendiente')})),'status',['Pendiente','Parcial','Pagado','Vencido','Bloqueado']));v10Bars('dashboardInventory',v10Group(p,'type'));const u=document.getElementById('dashboardUpdated');if(u)u.textContent='Actualizado '+new Date().toLocaleString('es-MX')}
function v10Filtered(){const days=document.getElementById('reportPeriod')?.value||'all',owner=document.getElementById('reportOwner')?.value||'all';const match=r=>v10InPeriod(r,days)&&(owner==='all'||(r.owner||'Sin asignar')===owner);return{crm:v10Data.crm.filter(x=>x.active!==false&&match(x)),ops:v10Data.operations.filter(x=>x.active!==false&&match(x)),cols:v10Data.collections.filter(x=>x.active!==false&&match(x))}}
function renderV10Reports(){const owners=[...new Set([...v10Data.crm,...v10Data.operations,...v10Data.collections].map(x=>x.owner).filter(Boolean))].sort(),sel=document.getElementById('reportOwner');if(sel){const old=sel.value;sel.innerHTML='<option value="all">Todos los responsables</option>'+owners.map(x=>`<option>${opEsc(x)}</option>`).join('');sel.value=owners.includes(old)?old:'all'}const {crm,ops,cols}=v10Filtered(),closed=ops.filter(x=>x.status==='Cerrada'),amount=closed.reduce((s,x)=>s+v10Num(x.amount),0),pending=cols.reduce((s,x)=>s+v10Balance(x),0),sum=document.getElementById('reportSummary');if(sum)sum.innerHTML=`<div><strong>${crm.length}</strong><span>Contactos CRM</span></div><div><strong>${ops.length}</strong><span>Operaciones</span></div><div><strong>${v10Money(amount)}</strong><span>Importe cerrado</span></div><div><strong>${v10Money(pending)}</strong><span>Cartera pendiente</span></div>`;const allOwners=[...new Set([...crm,...ops,...cols].map(x=>x.owner||'Sin asignar'))].sort(),body=document.getElementById('advisorReportBody');if(body)body.innerHTML=allOwners.map(owner=>{const cc=crm.filter(x=>(x.owner||'Sin asignar')===owner),oo=ops.filter(x=>(x.owner||'Sin asignar')===owner),cl=oo.filter(x=>x.status==='Cerrada'),co=cols.filter(x=>(x.owner||'Sin asignar')===owner);return `<tr><td><strong>${opEsc(owner)}</strong></td><td>${cc.length}</td><td>${oo.length}</td><td>${cl.length}</td><td>${v10Money(cl.reduce((s,x)=>s+v10Num(x.amount),0))}</td><td>${v10Money(co.reduce((s,x)=>s+v10Balance(x),0))}</td></tr>`}).join('')||'<tr><td colspan="6">Sin información para el filtro seleccionado.</td></tr>'}
function exportV10Csv(){const {crm,ops,cols}=v10Filtered(),rows=[['Metrica','Valor'],['Contactos CRM',crm.length],['Operaciones',ops.length],['Operaciones cerradas',ops.filter(x=>x.status==='Cerrada').length],['Importe cerrado',ops.filter(x=>x.status==='Cerrada').reduce((s,x)=>s+v10Num(x.amount),0)],['Cartera pendiente',cols.reduce((s,x)=>s+v10Balance(x),0)],[],['Responsable','Tipo','Cliente','Propiedad','Estado','Importe']];ops.forEach(x=>rows.push([x.owner||'Sin asignar',x.type||'',x.contactName||'',x.propertyName||'',x.status||'',v10Num(x.amount)]));const csv='\ufeff'+rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`RPM_Reporte_V10_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);showToast('Reporte CSV generado.')}
document.getElementById('refreshDashboard')?.addEventListener('click',loadV10Data);document.getElementById('dashboardPeriod')?.addEventListener('change',renderV10Dashboard);['reportPeriod','reportOwner'].forEach(id=>document.getElementById(id)?.addEventListener('change',renderV10Reports));document.getElementById('exportExecutiveReport')?.addEventListener('click',exportV10Csv);document.querySelector('[data-panel="dashboardPanel"]')?.addEventListener('click',loadV10Data);document.querySelector('[data-panel="reportsPanel"]')?.addEventListener('click',()=>{loadV10Data()});setTimeout(loadV10Data,2200);

// V11.0 - Automatizaciones, recordatorios e integraciones
const v11SettingsKey='rpm.v11.automationSettings',v11TemplatesKey='rpm.v11.whatsappTemplates';
const v11Defaults={crmEnabled:true,crmDays:1,collectionEnabled:true,collectionDays:3,operationEnabled:true};
const v11TemplateDefaults={firstContact:'Hola {nombre}, gracias por tu interés en {propiedad}. Soy {responsable} y con gusto te comparto la información.',followUp:'Hola {nombre}, doy seguimiento a tu interés en {propiedad}. ¿Te apoyo con alguna duda o agendamos una visita?',visit:'Hola {nombre}, te recordamos tu visita relacionada con {propiedad}. Quedamos atentos.',payment:'Hola {nombre}, te recordamos que tienes un pago próximo relacionado con {propiedad}. Saldo pendiente: {saldo}.'};
function v11Read(key,def){try{return {...def,...JSON.parse(localStorage.getItem(key)||'{}')}}catch(e){return {...def}}}
function v11Date(v){if(!v)return null;if(v?.toDate)return v.toDate();const d=new Date(v);return isNaN(d)?null:d}
function v11DaysUntil(v){const d=v11Date(v);return d?Math.ceil((d-new Date())/86400000):99999}
function v11Money(n){return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(Number(n)||0)}
function v11Balance(a){const paid=(rpmCollectionPayments||[]).filter(p=>p.accountId===a.id).reduce((s,p)=>s+(Number(p.amount)||0),0);return Math.max(0,(Number(a.amount)||0)+(Number(a.surcharge)||0)-paid)}
function v11Fill(t,d){return String(t||'').replace(/\{(nombre|propiedad|responsable|saldo)\}/g,(_,k)=>({nombre:d.name||'cliente',propiedad:d.propertyName||'la propiedad',responsable:d.owner||'nuestro equipo',saldo:d.balance!=null?v11Money(d.balance):''}[k]||''))}
function v11LoadForms(){const s=v11Read(v11SettingsKey,v11Defaults),f=document.getElementById('automationSettingsForm');if(f){f.crmEnabled.checked=s.crmEnabled;f.crmDays.value=s.crmDays;f.collectionEnabled.checked=s.collectionEnabled;f.collectionDays.value=s.collectionDays;f.operationEnabled.checked=s.operationEnabled}const t=v11Read(v11TemplatesKey,v11TemplateDefaults),tf=document.getElementById('whatsappTemplatesForm');if(tf)Object.keys(v11TemplateDefaults).forEach(k=>{if(tf.elements[k])tf.elements[k].value=t[k]})}
async function v11EnsureData(){await Promise.allSettled([loadCrm(),loadCollections(),loadOperations()])}
function v11BuildAlerts(){const s=v11Read(v11SettingsKey,v11Defaults),alerts=[];if(s.crmEnabled)(crmContacts||[]).filter(c=>c.active!==false&&c.nextActionAt&& !['Cerrado','Perdido'].includes(c.stage)).forEach(c=>{const days=v11DaysUntil(c.nextActionAt);if(days<=Number(s.crmDays))alerts.push({type:'CRM',severity:days<0?'Vencido':'Próximo',title:c.nextAction||'Seguimiento pendiente',name:c.name,propertyName:c.propertyName,owner:c.owner,phone:c.phone,days,template:'followUp'})});if(s.collectionEnabled)(rpmCollections||[]).filter(a=>a.active!==false&&a.status!=='Pagado').forEach(a=>{const days=v11DaysUntil(a.dueDate),balance=v11Balance(a);if(days<=Number(s.collectionDays))alerts.push({type:'Cobranza',severity:days<0?'Vencido':'Próximo',title:days<0?'Pago vencido':'Pago próximo',name:a.contactName,propertyName:a.propertyName,owner:a.owner,phone:a.phone,days,balance,template:'payment'})});if(s.operationEnabled)(rpmOperations||[]).filter(o=>o.active!==false&&!['Cerrada','Cancelada'].includes(o.status)).forEach(o=>{const missing=(o.checklist||[]).filter(x=>!x.done).length;if(missing)alerts.push({type:'Operación',severity:'Pendiente',title:`${missing} documento(s) pendiente(s)`,name:o.contactName,propertyName:o.propertyName,owner:o.owner,phone:o.phone,days:999,template:'followUp'})});return alerts}
function v11Render(){const alerts=v11BuildAlerts(),summary=document.getElementById('automationSummary');if(summary){const overdue=alerts.filter(x=>x.severity==='Vencido').length,crm=alerts.filter(x=>x.type==='CRM').length,col=alerts.filter(x=>x.type==='Cobranza').length;summary.innerHTML=`<div><strong>${alerts.length}</strong><span>Alertas activas</span></div><div><strong>${overdue}</strong><span>Vencidas</span></div><div><strong>${crm}</strong><span>Seguimientos CRM</span></div><div><strong>${col}</strong><span>Avisos de cobranza</span></div>`}const box=document.getElementById('automationAlerts');if(!box)return;box.innerHTML=alerts.map((a,i)=>`<div class="automation-alert"><div><span class="eyebrow">${opEsc(a.type)} · ${opEsc(a.severity)}</span><strong>${opEsc(a.title)}</strong><small>${opEsc(a.name||'Sin contacto')} · ${opEsc(a.propertyName||'Sin inmueble')}${a.days!==999?' · '+(a.days<0?Math.abs(a.days)+' día(s) vencido':a.days+' día(s)'):''}</small></div><div class="automation-alert-actions">${a.phone?`<button class="secondary-button" data-v11-wa="${i}">WhatsApp</button>`:''}</div></div>`).join('')||'<div class="empty-state"><h3>Todo al día</h3><p>No se detectaron alertas con las reglas actuales.</p></div>';box.querySelectorAll('[data-v11-wa]').forEach(b=>b.onclick=()=>{const a=alerts[Number(b.dataset.v11Wa)],tpl=v11Read(v11TemplatesKey,v11TemplateDefaults)[a.template]||v11TemplateDefaults.followUp,msg=v11Fill(tpl,a);window.open('https://wa.me/52'+String(a.phone||'').replace(/\D/g,'')+'?text='+encodeURIComponent(msg),'_blank')})}
async function v11Run(){showToast('Revisando CRM, operaciones y cobranza…');await v11EnsureData();v11Render();showToast('Revisión de automatizaciones completada.')}
document.getElementById('automationSettingsForm')?.addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,s={crmEnabled:f.crmEnabled.checked,crmDays:Number(f.crmDays.value)||0,collectionEnabled:f.collectionEnabled.checked,collectionDays:Number(f.collectionDays.value)||0,operationEnabled:f.operationEnabled.checked};localStorage.setItem(v11SettingsKey,JSON.stringify(s));v11Render();showToast('Reglas de automatización guardadas.')});
document.getElementById('whatsappTemplatesForm')?.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());localStorage.setItem(v11TemplatesKey,JSON.stringify(d));showToast('Plantillas de WhatsApp guardadas.')});
document.getElementById('runAutomationCheck')?.addEventListener('click',v11Run);document.getElementById('refreshAutomationAlerts')?.addEventListener('click',v11Run);document.querySelector('[data-panel="automationsPanel"]')?.addEventListener('click',v11Run);v11LoadForms();setTimeout(()=>{if(document.getElementById('automationsPanel'))v11Run()},2600);

/* ===== V12.0 · Seguridad, respaldo y publicación ===== */
const V12_COLLECTIONS=['properties','developments','developmentUnits','zones','publicLeads','crmContacts','crmActivities','operations','collections','collectionPayments','settings'];
const V12_CHECK_KEY='rpm-v12-deployment-checks';
function v12Escape(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function v12LoadChecks(){let saved={};try{saved=JSON.parse(localStorage.getItem(V12_CHECK_KEY)||'{}')}catch(e){}document.querySelectorAll('[data-v12-check]').forEach(x=>{x.checked=!!saved[x.dataset.v12Check];x.onchange=()=>{const all={};document.querySelectorAll('[data-v12-check]').forEach(c=>all[c.dataset.v12Check]=c.checked);localStorage.setItem(V12_CHECK_KEY,JSON.stringify(all))}})}
async function v12Audit(){const checks=[];checks.push({name:'Conexión Firebase',ok:!!window.rpmDb,detail:window.rpmDb?'Firestore inicializado':'Firestore no disponible'});checks.push({name:'Sesión autenticada',ok:!!window.firebase?.auth?.().currentUser,detail:window.firebase?.auth?.().currentUser?.email||'Sin usuario autenticado'});const secure=location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname);checks.push({name:'Conexión segura HTTPS',ok:secure,detail:secure?'Contexto seguro':'Publica con HTTPS antes de producción'});checks.push({name:'Diseño responsive',ok:!document.documentElement.scrollWidth||document.documentElement.scrollWidth<=window.innerWidth+2,detail:document.documentElement.scrollWidth<=window.innerWidth+2?'Sin desbordamiento horizontal detectado':'Se detectó desbordamiento horizontal'});let readable=0;if(window.rpmDb){for(const c of ['properties','crmContacts','operations','collections']){try{await window.rpmDb.collection(c).limit(1).get();readable++}catch(e){}}}checks.push({name:'Colecciones operativas',ok:readable===4,detail:`${readable}/4 colecciones críticas accesibles`});const box=document.getElementById('systemAuditList');if(box)box.innerHTML=checks.map(x=>`<div class="security-check ${x.ok?'ok':'warn'}"><b>${x.ok?'✓':'!'}</b><div><strong>${v12Escape(x.name)}</strong><small>${v12Escape(x.detail)}</small></div></div>`).join('');const ok=checks.filter(x=>x.ok).length,sum=document.getElementById('securitySummary');if(sum)sum.innerHTML=`<div><strong>${ok}/${checks.length}</strong><span>Pruebas correctas</span></div><div><strong>${window.rpmDb?'Activa':'Revisar'}</strong><span>Base de datos</span></div><div><strong>${secure?'HTTPS':'Pendiente'}</strong><span>Seguridad web</span></div><div><strong>V12.0</strong><span>Versión técnica</span></div>`;showToast(ok===checks.length?'Diagnóstico completado sin alertas.':'Diagnóstico completado. Hay puntos por revisar.');return checks}
function v12Serializable(v){if(v?.toDate)return v.toDate().toISOString();if(Array.isArray(v))return v.map(v12Serializable);if(v&&typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))o[k]=v12Serializable(x);return o}return v}
async function v12Backup(){if(!window.rpmDb){showToast('Firebase no está disponible para generar el respaldo.');return}const btn=document.getElementById('exportSystemBackup'),status=document.getElementById('backupStatus');if(btn)btn.disabled=true;if(status)status.textContent='Generando respaldo…';const backup={system:'RPM Inmobiliario',version:'12.0',createdAt:new Date().toISOString(),collections:{},errors:{}};for(const name of V12_COLLECTIONS){try{const snap=await window.rpmDb.collection(name).get();backup.collections[name]=snap.docs.map(d=>({id:d.id,...v12Serializable(d.data())}))}catch(e){backup.errors[name]=e?.message||'Sin acceso'}}const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`RPM_respaldo_${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href);if(btn)btn.disabled=false;if(status)status.textContent=`Respaldo generado: ${Object.keys(backup.collections).length} colecciones · ${Object.keys(backup.errors).length} con alerta.`;const cb=document.querySelector('[data-v12-check="backup"]');if(cb){cb.checked=true;cb.dispatchEvent(new Event('change'))}showToast('Respaldo JSON generado.');}
document.getElementById('runSystemAudit')?.addEventListener('click',v12Audit);document.getElementById('exportSystemBackup')?.addEventListener('click',v12Backup);document.querySelector('[data-panel="securityPanel"]')?.addEventListener('click',()=>setTimeout(v12Audit,80));v12LoadChecks();
