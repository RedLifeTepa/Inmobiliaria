# RPM Inmobiliario V2.3

Versión estable previa al módulo V3.0 de registro de propiedades.

## Alcance acumulado

- V1.0: base HTML5, CSS3, JavaScript, catálogo y estructura RPM.
- V1.1: configuración de logo y conexión inicial con Firebase.
- V1.2: reglas de Firestore y Storage.
- V2.0: acceso privado mediante Firebase Authentication y roles.
- V2.1: opción para recordar usuario durante 7 días.
- V2.2: indicador visual de conexión con Firebase.
- V2.3: modo claro/oscuro y catálogo público sin acceso visible al RPM/ERP.

## Estructura

- `index.html`: catálogo público.
- `confi.html`: acceso privado al RPM.
- `portal/index.html`: copia organizada del portal público.
- `rpm/index.html`: copia organizada del RPM.
- `config/firebase-config.js`: configuración de Firebase.
- `firebase/`: reglas de Firestore y Storage.
- `src/css/app.css`: estilos compartidos y temas claro/oscuro.
- `src/js/app.js`: navegación, autenticación, persistencia, conexión y comportamiento general.

## Siguiente versión

V3.0 incorporará el registro funcional de terrenos, casas, predios y propiedades.
