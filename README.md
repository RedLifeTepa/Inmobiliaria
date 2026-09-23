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

La V1 incluye ocho propiedades demostrativas de Tepatitlán y Los Altos. Sus imágenes son referencias públicas de demostración y cada registro tiene un campo `imageUrl` que puede recibir una URL directa o un enlace compartido de Google Drive. Antes de publicar el catálogo real se reemplazarán por imágenes autorizadas de la inmobiliaria.

## Ejecutar localmente

Abre `index.html` en un navegador moderno o sírvelo desde un servidor web local. La V1 no necesita compilación.

## Firebase

Edita `config/firebase-config.js` con las credenciales del proyecto Firebase. La conexión real, reglas de Firestore, autenticación y Storage se incorporarán en la siguiente iteración funcional.

## Datos de contacto

Teléfono: 378 109 7992  
Correo: contacto@altosfilm.com  
Sitio web: altosfilm.com
