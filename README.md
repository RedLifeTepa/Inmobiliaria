RPM Inmobiliario V5.0 - Catalogo Publico Avanzado

Base: V4.0.2 Ancla Visual Estable.
Incluye filtros publicos por tipo, operacion, precio y zona; contador de resultados; ficha publica de propiedad; control de publicacion; privacidad de ubicacion; desarrollos publicados; diseno Liquid Glass responsive.

## Versión actual: V3.3 – Gestión integral de desarrollos

Incluye desarrollos, publicación pública, unidades administrables y TERRASER como ejemplo.

# RPM Inmobiliario V3.2

Versión funcional del módulo de registro e inventario de propiedades, construida sobre la V2.3.

## Alcance acumulado

- Conserva V1.0 a V2.3: base web, Firebase, reglas, autenticación, roles, recordar usuario, indicador de conexión y modo claro/oscuro.
- V3.0: alta, edición, consulta, filtrado y baja lógica de propiedades.
- Tipos: casas, terrenos, predios, departamentos, locales, bodegas, oficinas y otros.
- Datos: operación, precio, superficie, habitaciones, baños, servicios, características, zona y municipio.
- Relaciones: propietario y asesor responsable.
- Expediente: documentos de referencia, portada, galería y descripción.
- Estados: Disponible, Publicado, Apartado, Vendido, Rentado y No disponible.
- Persistencia en la colección `properties` de Cloud Firestore.
- Baja lógica mediante `active: false`, sin borrar físicamente el registro.

## Firebase

La colección `properties` ya está contemplada en `firebase/firestore.rules` para usuarios internos autorizados. Publica las reglas incluidas en el proyecto antes de probar la versión en producción.

## Siguiente versión

V4.0: geolocalización, mapas y zonas.

## V3.1 / V3.2 - Desarrollos y unidades
- Se agrega el módulo **Desarrollos** al RPM.
- TERRASER queda como ejemplo real de desarrollo mixto, conservando las propiedades demostrativas existentes.
- El desarrollo puede guardarse en Firebase y después editarse, publicarse/ocultarse o desactivarse con confirmación.
- Se incorpora el concepto de **unidades de desarrollo**: TERRASER muestra 10 residencias demostrativas con estado independiente y datos heredados del proyecto.
- La portada `assets/terraser-cover.png` queda incluida localmente para evitar dependencias externas.
- La información comercial de TERRASER es demostrativa y debe validarse antes de publicación oficial.

## V4.0.1 - Geolocalizacion, mapas y zonas · ancla estable
- Modulo privado Mapas y zonas con mapa interactivo OpenStreetMap/Leaflet.
- Coordenadas y privacidad (exacta, aproximada o privada) en propiedades y desarrollos.
- Catalogo CRUD de zonas comerciales con municipio, asesor y centro geografico.
- Filtros del mapa por tipo de entidad y zona.
- Las unidades de un desarrollo heredan conceptualmente la ubicacion del desarrollo.


## V4.0.2
- Selector de tipo del catálogo público migrado al componente Liquid Glass reutilizable.
- Consistencia visual entre portal público y RPM.
- Ajuste responsive del filtro del catálogo.


## V5.0.1
- Corrige la superposición del modal sobre filtros y navegación.
- Vincula cada solicitud pública con propertyId y propertyName.
- Guarda solicitudes en Firestore `publicLeads` con origen, estado y fecha.
- Mantiene mensaje contextual de la propiedad consultada.


## V6.0 - Captación de interesados y WhatsApp
- Formulario público vinculado a propertyId/propertyName.
- Horario preferido, consentimiento, origen y estado de seguimiento.
- Prevención de duplicados por teléfono normalizado + propiedad.
- Botón de WhatsApp con mensaje precargado y referencia del inmueble.
- Bandeja interna “Interesados” en el RPM para consultar solicitudes de publicLeads.
- Acceso rápido de WhatsApp desde la bandeja interna.
- Reglas Firestore actualizadas para la estructura V6.


## V7.0 - CRM inmobiliario
- Fichas de contactos con perfil, etapa, responsable, inmueble, fuente, preferencias y próxima acción.
- Embudo de 7 etapas: Nuevo, Contactado, Calificado, Visita agendada, Negociación, Cerrado y Perdido.
- Conversión de interesados V6 a CRM conservando propiedad y origen.
- Historial de llamadas, WhatsApp, notas, citas, visitas y correo en `crmActivities`.
- Contactos persistentes en Firestore `crmContacts`, con filtros y búsqueda.
- Reglas Firestore actualizadas para ambas colecciones privadas.

## V7.0.1 - Correccion responsive CRM
- El CRM queda contenido dentro del area disponible del RPM.
- Buscador y filtros se reorganizan segun el ancho de pantalla.
- El boton Nuevo contacto baja de linea cuando es necesario.
- El kanban conserva desplazamiento horizontal interno sin sacar la pagina del viewport.
- Se mantiene intacta la funcionalidad Firebase/CRM de V7.0.


## V7.0.2 - Ancla Estable CRM
- Filtros del CRM (responsable y perfil) homologados al selector Liquid Glass reutilizable.
- Conserva el ajuste responsive de V7.0.1.

## V8.0 - Operaciones y expedientes
- Apartados, ventas y rentas vinculados con contactos del CRM.
- Estado, responsable, fecha, importe, comisión y condiciones por operación.
- Expediente operativo con checklist documental y trazabilidad de cambios.
- Cierre de operación actualiza el contacto CRM a Cliente efectivo / Cerrado.
- Colección Firestore: `operations` (requiere publicar las reglas incluidas).


## V8.0.1 - Selectores Liquid Glass
- Homologa los filtros de tipo de movimiento y estado del modulo Operaciones con el componente Liquid Glass reutilizable.
- Conserva la logica de filtrado y el comportamiento responsive de V8.0.

## V9.0 - Cobranza, abonos, deudas y saldos
- Cuentas por cobrar vinculadas a operaciones V8.
- Registro de abonos con fecha, método, referencia y notas.
- Cálculo de saldo y recargos.
- Semáforo: Pendiente, Parcial, Pagado, Vencido y Bloqueado.
- Filtros de cartera y vencimientos.
- Estado de cuenta e historial de abonos.
- Reglas Firestore para `collectionPayments`.

## V10.0 - Dashboard, indicadores y reportes
- Dashboard ejecutivo conectado a Firestore para inventario, CRM, operaciones y cobranza.
- Indicadores de inventario activo, prospectos, operaciones cerradas, importe operado y cartera pendiente.
- Visualizaciones de embudo CRM, tipo de operación, estado de cartera y distribución del inventario.
- Centro de reportes con filtros por periodo y responsable.
- Productividad por responsable y exportación de resumen operativo a CSV.


## V10.0.1 - Homologacion visual de selectores
- Cobranza: estado y vencimiento usan el componente Liquid Glass.
- Dashboard y Reportes: periodo y responsable usan el mismo componente.
- Inventario: estado usa el mismo componente.
- Se conserva la logica nativa de los selectores como fuente de verdad para filtros y Firebase.

## V11.0 - Automatizaciones e integraciones
- Centro de automatizaciones dentro del RPM.
- Reglas configurables para próximas acciones CRM, vencimientos de cobranza y documentos pendientes en operaciones.
- Bandeja consolidada de alertas con acceso contextual a WhatsApp.
- Plantillas editables para primer contacto, seguimiento, visita y recordatorio de pago con variables dinámicas.
- Estado de integraciones y preparación para proveedor autorizado de WhatsApp Business.
- En esta versión web la revisión se ejecuta al abrir el RPM o manualmente; la ejecución 24/7 se deja preparada para backend/servidor en V12.

## V12.0 - Seguridad, respaldo y publicación final
- Nuevo Centro de estabilidad en el RPM.
- Diagnóstico de Firebase, sesión, HTTPS, desbordamiento responsive y colecciones críticas.
- Exportación de respaldo lógico JSON de las colecciones accesibles.
- Checklist persistente de publicación a producción.
- Reglas Firestore/Storage mantienen denegación por defecto y control por roles.
- La publicación oficial requiere servidor con HTTPS y reglas Firebase publicadas.
- Después de V12 se realizará la auditoría integral funcional acordada antes de declarar producción definitiva.
