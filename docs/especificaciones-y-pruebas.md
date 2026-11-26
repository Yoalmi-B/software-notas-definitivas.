# Documentación de requisitos, especificaciones y pruebas

## 1. Caso de uso

CU-01 – Gestión y cálculo de nota definitiva

- Actor principal: Estudiante.
- Objetivo: Permitir que el estudiante ingrese con su documento de identidad, configure una estructura de evaluación y conozca su nota definitiva, estado académico e historial.
- Precondición: Acceder desde un navegador moderno con soporte para IndexedDB.

### Reglas de negocio

- RN-01: El acceso se realiza únicamente mediante el número de documento, sin contraseña. Si el documento no existe, se registra automáticamente; si existe, se recupera el usuario.
- RN-02: La escala de calificación está comprendida entre 0.0 y 5.0.
- RN-03: La suma de los porcentajes de todas las notas debe ser exactamente del 100%.
- RN-04: Se aprueba la asignatura con una nota definitiva mayor o igual a 3.0.

### Flujo principal

1. El estudiante ingresa su número de documento en la pantalla de acceso.
2. El sistema consulta el documento en IndexedDB, registra al estudiante si es nuevo o recupera sus datos si ya existe.
3. El sistema crea la sesión local y muestra el panel de notas.
4. El estudiante indica la cantidad de notas que desea evaluar.
5. El sistema genera dinámicamente los campos para ingresar la calificación y el porcentaje de cada nota.
6. El estudiante diligencia los campos y solicita el cálculo.
7. El sistema valida la información, calcula el promedio ponderado y muestra la definitiva junto con el estado académico.
8. El sistema guarda el resultado en IndexedDB asociado al documento del estudiante.

### Flujos alternos

- FA-01 – Porcentaje inválido: Si la suma de porcentajes es menor o mayor al 100%, el sistema bloquea el cálculo e informa cuánto falta o sobra.
- FA-02 – Nota fuera de rango: Si una calificación es menor que 0 o mayor que 5, el sistema solicita corregirla.
- FA-03 – Campos vacíos o no numéricos: El sistema impide realizar el cálculo hasta completar correctamente los datos.

## 2. Historias de usuario

- HU-01 – Acceso: Como estudiante, quiero ingresar con mi documento para acceder a mi panel de calificaciones.
- HU-02 – Registro automático: Como estudiante nuevo, quiero que mi documento se registre automáticamente si no existe, para comenzar a utilizar el sistema.
- HU-03 – Configurar evaluación: Como estudiante, quiero indicar cuántas notas tendrá mi evaluación para generar los campos necesarios.
- HU-04 – Ingresar calificaciones: Como estudiante, quiero registrar el valor y porcentaje de cada nota para calcular mi definitiva.
- HU-05 – Validar información: Como estudiante, quiero recibir mensajes claros si ingreso datos incompletos o incorrectos para poder corregirlos.
- HU-06 – Consultar resultado: Como estudiante, quiero conocer mi promedio ponderado y saber si aprobé o reprobé.
- HU-07 – Consultar historial: Como estudiante, quiero que mis cálculos queden guardados y poder consultarlos posteriormente.

## 3. Épica

EP-01 – Gestión de calificaciones:** Permitir al estudiante acceder al sistema, configurar su evaluación, registrar sus calificaciones, calcular su nota definitiva y consultar los resultados almacenados.

Las historias de usuario HU-01 a HU-07 pertenecen a esta épica.

## 4. Criterios de aceptación

| Historia | Criterios de aceptación |
|---|---|
| HU-01 | El sistema permite ingresar un documento válido y acceder al panel de notas. |
| HU-02 | Si el documento no está registrado, el sistema crea el usuario en IndexedDB. |
| HU-03 | El sistema permite seleccionar una cantidad entera de notas entre 1 y 20 y genera los campos correspondientes. |
| HU-04 | El sistema permite ingresar una calificación y un porcentaje para cada nota. |
| HU-05 | El sistema identifica campos vacíos, valores fuera de rango y porcentajes incorrectos, e informa qué debe corregirse. |
| HU-06 | El sistema calcula el promedio ponderado, lo muestra con dos decimales e indica si el estudiante aprobó o reprobó. |
| HU-07 | El sistema guarda cada cálculo asociado al documento y permite consultar el historial correspondiente. |

## 5. Especificaciones técnicas (Specs)

### 5.1. Modelo de datos

- Base de datos: `NotasDefinitivasDB`.
- Versión: `1`.

ObjectStore `usuarios`

- `keyPath: "documento"`.
- `documento`: String, llave primaria.
- `fechaRegistro`: String, fecha de registro en formato ISO 8601.

ObjectStore `calculos`

- `keyPath: "id"`.
- `autoIncrement: true`.
- `id`: Number, identificador autogenerado.
- `documento`: String, documento del estudiante.
- `notas`: Array de objetos con las propiedades `valor` (Number) y `porcentaje` (Number).
- `definitiva`: Number, resultado redondeado a dos decimales.
- `estado`: String, con los valores `Aprobado` o `Reprobado`.
- `fecha`: String, fecha del cálculo en formato ISO 8601.

Índice:
El ObjectStore `calculos` cuenta con un índice no único sobre la propiedad `documento`, que permite consultar los cálculos asociados a cada estudiante.

### 5.2. Contrato de interfaz y estados

1. Acceso: Se muestra `login-section` con el campo para ingresar el documento. El botón de acceso permanece deshabilitado hasta que IndexedDB esté disponible.
2. Panel: Después del acceso, se oculta `login-section` y se muestra `dashboard-section`.
3. Configuración: Se solicita la cantidad de notas, que debe ser un número entero entre 1 y 20.
4. Ingreso: Se generan dinámicamente dos campos por cada nota: calificación y porcentaje.
5. Validación: Se revisan los valores ingresados y se informa el porcentaje acumulado, faltante o sobrante.
6. Resultado: Si los datos son válidos, se calcula y muestra la definitiva y el estado académico.
7. Historial: Se muestran los cálculos asociados al documento del estudiante activo.
8. Cerrar sesión: Se elimina la sesión local y se vuelve a la pantalla de acceso, sin borrar los datos almacenados.
9. Recarga: `sessionStorage` permite recuperar la sesión al recargar la misma pestaña. IndexedDB conserva los usuarios y cálculos almacenados.

### 5.3. Fórmula y redondeo

El sistema utiliza la fórmula del promedio ponderado:
`Definitiva = Σ (nota_i × porcentaje_i / 100)`
Cada calificación se multiplica por su porcentaje y los resultados se suman para obtener la nota definitiva.
El resultado se redondea a dos cifras decimales. La asignatura se aprueba cuando la definitiva es mayor o igual a `3.00`; de lo contrario, el estado es `Reprobado`.

### 5.4. Validaciones y casos borde

- El documento es obligatorio, debe contener únicamente números y tener entre 5 y 20 dígitos.
- La cantidad de notas debe ser un número entero entre 1 y 20. No se permiten cero, negativos ni decimales.
- Cada calificación es obligatoria y debe estar entre 0.0 y 5.0.
- Cada porcentaje es obligatorio, debe ser mayor que 0 y no superar el 100.
- La suma de los porcentajes debe ser exactamente del 100%. Para la validación, el total se compara con dos cifras decimales.
- Si los porcentajes son inferiores al 100%, se informa cuánto falta.
- Si los porcentajes superan el 100%, se informa cuánto sobra.
- No se permite calcular con campos vacíos o valores no numéricos.
- Si IndexedDB no está disponible, el botón de acceso permanece deshabilitado.
- Si se recarga la misma pestaña, la sesión puede recuperarse mediante `sessionStorage`.
- Al cerrar sesión se elimina la sesión local, pero se conservan los usuarios y cálculos en IndexedDB.
- Si se cierra la pestaña, la sesión de `sessionStorage` deja de estar disponible.

## 6. Lista de verificación frente a la guía

| Requisito | Evidencia en el proyecto | Estado |
|---|---|---|
| HTML5 | `index.html` | Implementado |
| CSS3 | `css/style.css` | Implementado |
| JavaScript Vanilla modular | Archivos dentro de `js/` con módulos ES6 | Implementado |
| Sin frameworks ni librerías externas | No se importan frameworks | Cumple |
| IndexedDB nativa | `js/database.js` | Implementado |
| ObjectStore `usuarios` | `keyPath: "documento"` | Implementado |
| ObjectStore `calculos` | `keyPath: "id"` y autoincremento | Implementado |
| Acceso solo con documento | `js/auth.js` | Implementado |
| Registro automático | Se crea el usuario si el documento no existe | Implementado |
| Escala de 0.0 a 5.0 | Validación en `js/grades.js` | Implementado |
| Porcentajes suman 100% | Validación de porcentajes | Implementado |
| Aprobación desde 3.0 | Condición en `js/app.js` | Implementado |
| Cantidad dinámica de notas | Función `generarCampos()` | Implementado |
| Validación de campos vacíos y valores incorrectos | Validaciones del formulario | Implementado |
| Promedio ponderado | Fórmula en `js/app.js` | Implementado |
| Redondeo a dos decimales | `Math.round` y presentación con `toFixed(2)` | Implementado |
| Guardar historial por estudiante | `js/history.js` e índice `documento` | Implementado |
| Persistencia tras recarga | IndexedDB y `sessionStorage` | Implementado |
| Preparación para Vercel | `vercel.json` y `README.md` | Preparado |
| Verificación en navegador | Ejecución de casos de prueba | Pendiente de comprobar |
| Despliegue en Vercel | Publicación desde la cuenta del aprendiz | Pendiente |

Nota sobre persistencia: IndexedDB almacena los datos localmente en el navegador y dispositivo utilizados. `sessionStorage` mantiene la sesión mientras la pestaña permanezca abierta, incluso al recargarla. No existe sincronización automática entre diferentes dispositivos o navegadores.

## 7. Casos de prueba

### CP-01 – Cálculo correcto y estudiante aprobado

| Campo | Dato |
|---|---|
| Objetivo | Comprobar el cálculo ponderado, la aprobación y el guardado del historial. |
| Precondición | La aplicación está abierta e IndexedDB está conectada. |
| Documento | `123456789` |
| Cantidad de notas | 3 |

Datos de entrada

| Nota | Calificación | Porcentaje |
|---|---:|---:|
| Nota 1 | 4.0 | 30% |
| Nota 2 | 3.5 | 30% |
| Nota 3 | 2.0 | 40% |
| Total  |     | 100%|

Procedimiento
1. Ingresar el documento.
2. Generar tres campos de notas.
3. Digitar las calificaciones y porcentajes de la tabla.
4. Presionar «Calcular nota definitiva».
5. Consultar el historial.

Resultado esperado
- La suma de porcentajes es aceptada.
- La nota definitiva es `3.05`.
- El estado mostrado es **Aprobado**.
- El cálculo queda guardado en `calculos`, asociado al documento `123456789`.
- El historial muestra el nuevo cálculo.

Estado de ejecución: Pendiente de ejecución.

### CP-02 – Porcentajes incompletos y bloqueo del cálculo

| Campo | Dato |
|---|---|
| Objetivo | Verificar que el sistema impida calcular cuando los porcentajes no suman 100%. |
| Precondición | El estudiante ingresó correctamente y generó tres campos. |
| Documento | `987654321` |
| Cantidad de notas | 3 |

Datos de entrada
| Nota | Calificación | Porcentaje |
|------|---------------------------|
| Nota 1 | 4.0 | 30% |
| Nota 2 | 3.5 | 30% |
| Nota 3 | 2.0 | 20% |
| Total  |     | 80% |

Procedimiento
1. Ingresar el documento.
2. Generar tres campos de notas.
3. Digitar las calificaciones y porcentajes de la tabla.
4. Presionar «Calcular nota definitiva».
5. Observar el mensaje de validación y consultar el historial.

Resultado esperado
- El sistema informa que falta asignar `20.00%`.
- No muestra una nota definitiva.
- No guarda un nuevo cálculo en el historial.
- El estudiante puede corregir los porcentajes y volver a calcular.

Estado de ejecución: Pendiente de ejecución.

## 8. Consideraciones para la entrega
- Ejecutar la aplicación mediante Live Server o un servidor HTTP local. No abrir directamente `index.html` mediante `file://`.
- Ejecutar los casos de prueba en el navegador y comprobar los resultados.
- Para desplegar, subir el proyecto a GitHub y conectarlo a Vercel como sitio estático.
- Después del despliegue, repetir las pruebas desde la URL pública.

Limitación de seguridad: El acceso mediante documento sin contraseña corresponde al mecanismo definido en el caso de uso. Este método no verifica la identidad real del estudiante y no debe utilizarse para proteger información sensible en un sistema institucional de producción.