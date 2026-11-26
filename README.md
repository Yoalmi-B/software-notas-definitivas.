# Software de Cálculo de Notas Definitivas

Aplicación web para calcular notas definitivas a partir de las calificaciones y sus respectivos porcentajes. Permite consultar el resultado, conocer el estado académico y conservar el historial de cálculos por estudiante.

El proyecto está desarrollado con **HTML5, CSS3, JavaScript Vanilla modular e IndexedDB**, y utiliza una arquitectura estática que permite su despliegue en Vercel sin necesidad de un servidor backend.

## Tecnologías utilizadas

- **HTML5:** estructura de la aplicación.
- **CSS3:** diseño y estilos de la interfaz.
- **JavaScript Vanilla:** lógica y funcionalidades del sistema.
- **IndexedDB:** almacenamiento local de usuarios e historial de cálculos.
- **Vercel:** plataforma de despliegue.

## Funcionalidades

- Acceso mediante número de documento.
- Registro automático de usuarios que ingresan por primera vez.
- Configuración de la cantidad de notas por cálculo.
- Registro de calificaciones y porcentajes.
- Validación de datos y porcentajes.
- Cálculo automático de la nota definitiva.
- Clasificación del resultado como Aprobado o Reprobado.
- Consulta del historial de cálculos por estudiante.
- Persistencia de la información mediante IndexedDB.

## Reglas de cálculo

- Las calificaciones deben estar entre **0.0 y 5.0**.
- La cantidad de notas permitida es de **1 a 20**.
- Cada porcentaje debe ser mayor que 0 y no superar el 100%.
- La suma de los porcentajes debe ser exactamente **100%**.
- La nota definitiva se calcula mediante un promedio ponderado.
- El resultado se presenta con dos cifras decimales.
- El estudiante aprueba con una nota definitiva igual o superior a **3.0**.

### Fórmula aplicada

\[
\text{Nota definitiva} =
\sum_{i=1}^{n}
\left(\text{Nota}_i \times \frac{\text{Porcentaje}_i}{100}\right)
\]

## Estructura del proyecto

```text
software-notas-definitivas/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── database.js
│   ├── grades.js
│   └── history.js
│
├── docs/
│   └── especificaciones-y-pruebas.md
│
├── vercel.json
└── README.md
```

## Ejecución local

1. Clonar o descargar el repositorio.
2. Abrir la carpeta del proyecto en Visual Studio Code.
3. Ejecutar el archivo `index.html` mediante una extensión como **Live Server**.
4. Acceder a la dirección local proporcionada por el servidor.

La aplicación debe ejecutarse desde un servidor local y no directamente mediante `file://`, debido al uso de módulos JavaScript e IndexedDB.

## Almacenamiento de información

La aplicación utiliza IndexedDB para almacenar los datos localmente en el navegador.

La base de datos se denomina `NotasDefinitivasDB` y contiene los siguientes almacenes:

- **usuarios:** registra el documento del estudiante y su fecha de registro.
- **calculos:** almacena las notas, porcentajes, resultado definitivo, estado académico y fecha del cálculo.

La sesión del usuario se gestiona mediante `sessionStorage`.

La información almacenada no se sincroniza entre dispositivos ni navegadores. Si se eliminan los datos del sitio en el navegador, también se puede perder el historial guardado.

## Despliegue en Vercel

El proyecto está configurado para funcionar como una aplicación web estática.

1. Publicar el repositorio en GitHub.
2. Ingresar a [Vercel](https://vercel.com/).
3. Seleccionar **Add New → Project**.
4. Importar el repositorio correspondiente.
5. Seleccionar el preset **Other**.
6. Configurar el directorio raíz del proyecto.
7. Mantener sin configurar el comando de compilación, ya que no se requiere un proceso de build.
8. Seleccionar **Deploy**.

El archivo `vercel.json` contiene la configuración de rutas de la aplicación.

## Documentación complementaria

En la carpeta `docs/` se encuentra el documento `especificaciones-y-pruebas.md`, que contiene:

- Caso de uso principal.
- Historias de usuario.
- Especificaciones técnicas.
- Reglas de validación.
- Casos de prueba.
- Lista de verificación de requisitos.

## Consideraciones de seguridad

El acceso se realiza mediante el número de documento, sin contraseña. Este mecanismo permite identificar los registros dentro de la aplicación, pero no constituye un sistema de autenticación seguro.

Los datos se almacenan localmente en el navegador y no se transmiten a una base de datos externa.