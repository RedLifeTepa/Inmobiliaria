# Reglas Firebase del RPM

Estas reglas corresponden al ambiente de pruebas `quiniela-mundial-417fa`.

## Roles permitidos

En Firestore debe existir un documento en `users/{UID}` con un campo `role` igual a uno de estos valores:

- `admin`
- `direccion`
- `asesor`
- `cobranza`
- `consulta`

El rol `admin` es el único que puede administrar usuarios, permisos y configuración general.

## Aplicación manual

1. En Firebase Console abre **Firestore Database > Rules**.
2. Copia el contenido de `firestore.rules`.
3. Publica las reglas.
4. En **Storage > Rules**, copia el contenido de `storage.rules`.
5. Publica las reglas.

Mientras no exista autenticación con un usuario y su documento `users/{UID}`, las colecciones internas permanecerán bloqueadas. Esto es intencional.
