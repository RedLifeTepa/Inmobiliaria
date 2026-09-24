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

## Activación de V2

1. En **Authentication > Sign-in method**, activa **Correo electrónico/contraseña**.
2. En **Authentication > Users**, crea el primer usuario administrador.
3. Copia su UID.
4. En Firestore crea la colección `users` y un documento con ese UID.
5. Agrega estos campos: `name` con el nombre del usuario y `role` con el valor `admin`.
6. Abre `confi.html` e inicia sesión con ese correo y contraseña.

El RPM valida el usuario en Authentication y después consulta su documento de perfil antes de mostrar el sistema.
