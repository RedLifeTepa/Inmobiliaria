const properties = [
  { id: "RPM-1001", name: "Casa Encino", type: "Casa", zone: "Mirador del Valle, Tepatitlán", price: "$2,850,000", meta: "3 recámaras · 2 baños", status: "Venta", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80" },
  { id: "RPM-1002", name: "Terreno Los Olivos", type: "Terreno", zone: "Los Olivos, Tepatitlán", price: "$980,000", meta: "420 m² · servicios", status: "Venta", imageUrl: "https://assets.easybroker.com/property_images/4488694/75166387/EB-QF8694.jpeg?version=1715970199" },
  { id: "RPM-1003", name: "Casa Centro", type: "Casa", zone: "Centro, Tepatitlán", price: "$12,500 / mes", meta: "2 recámaras · amueblada", status: "Renta", imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80" },
  { id: "RPM-1004", name: "Lote La Hacienda", type: "Terreno", zone: "La Hacienda, Arandas", price: "$735,000", meta: "250 m² · acceso controlado", status: "Venta", imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80" },
  { id: "RPM-1005", name: "Residencia Los Altos", type: "Casa", zone: "El Carmen, San Juan de los Lagos", price: "$4,250,000", meta: "4 recámaras · jardín", status: "Venta", imageUrl: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80" },
  { id: "RPM-1006", name: "Terreno El Refugio", type: "Terreno", zone: "El Refugio, Tepatitlán", price: "$1,420,000", meta: "600 m² · esquina", status: "Publicado", imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80" },
  { id: "RPM-1007", name: "Casa Campestre", type: "Casa", zone: "Capilla de Guadalupe", price: "$2,180,000", meta: "3 recámaras · terraza", status: "Venta", imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80" },
  { id: "RPM-1008", name: "Lote Vista Norte", type: "Terreno", zone: "Vista Hermosa, Tepatitlán", price: "$1,050,000", meta: "360 m² · vista panorámica", status: "Apartado", imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80" },
];

const propertyGrid = document.querySelector("#propertyGrid");
const searchInput = document.querySelector("#propertySearch");
const typeSelect = document.querySelector("#propertyType");
const toast = document.querySelector("#toast");
const defaultLogoUrl = "assets/logo-altosfilm.png";
const logoStorageKey = "rpm.logoUrl";

function renderProperties() {
  const query = searchInput.value.toLowerCase().trim();
  const type = typeSelect.value;
  const filtered = properties.filter((property) => {
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
document.querySelector("#themeToggle").addEventListener("click", () => { document.body.classList.toggle("soft-mode"); showToast("Modo visual actualizado."); });
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
applySavedLogo();
renderProperties();
