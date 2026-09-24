# RPM inmobiliario V1

Base modular del proyecto para Altos Film. No es un único `index.html`: `index.html` es el catálogo público y `confi.html` es el ERP/RPM interno. La estructura separa portal, ERP, estilos compartidos, módulos JavaScript, configuración de Firebase y recursos visuales.

## Estructura

- `index.html`: catálogo público principal con filtros, mapa y captación.
- `confi.html`: ERP/RPM interno con dashboard, inventario, CRM, cobranza y expedientes.
- `portal/index.html`: copia organizada del catálogo público para crecimiento futuro.
- `rpm/index.html`: copia organizada del ERP interno para crecimiento futuro.
- `src/css/app.css`: sistema visual Neumorfista y responsive.
- `src/js/app.js`: comportamiento compartido de la V1.
- `config/firebase-config.js`: configuración preparada para Firebase.
- `assets/`: logo y recursos visuales.

La V3.2 incluye la gestión de desarrollos inmobiliarios. TERRASER Residencias & Hotel queda como primer ejemplo y puede guardarse en Firebase desde el RPM. Los administradores pueden crear, editar, publicar, ocultar y desactivar desarrollos; el catálogo público solo muestra los registros publicados y activos. Las imágenes pueden recibirse mediante URL directa o enlace compartido de Google Drive.

La V1 incluye ocho propiedades demostrativas de Tepatitlán y Los Altos. Sus imágenes son referencias públicas de demostración. Antes de publicar el catálogo real se reemplazarán por imágenes autorizadas de la inmobiliaria.

La conexión actual utiliza el proyecto Firebase `quiniela-mundial-417fa` exclusivamente como ambiente de pruebas. La configuración está aislada en `config/firebase-config.js` para poder sustituirla por la base oficial al finalizar el desarrollo.

## Ejecutar localmente

Abre `index.html` en un navegador moderno o sírvelo desde un servidor web local. La V1 no necesita compilación.

## Firebase

La V1 inicializa Firebase y Firestore con el proyecto de pruebas. Las reglas de Firestore, autenticación, Storage y persistencia de módulos se incorporarán en las siguientes iteraciones funcionales.

## Datos de contacto

Teléfono: 378 109 7992  
Correo: contacto@altosfilm.com  
Sitio web: altosfilm.com
