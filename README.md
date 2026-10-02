# RPM Inmobiliario V3.0

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
