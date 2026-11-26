import { conectarDB } from "./database.js";
import {
    autenticarEstudiante,
    obtenerSesion,
    cerrarSesion
} from "./auth.js";
import {
    generarCampos,
    validarNotas,
    actualizarPorcentaje
} from "./grades.js";
import {
    guardarCalculo,
    mostrarHistorial
} from "./history.js";

// Elementos principales del DOM
const connectionStatus = document.getElementById("connection-status");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const loginInput = document.getElementById("documento");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");
const studentDocument = document.getElementById("student-document");
const logoutButton = document.getElementById("logout-button");
const generateButton = document.getElementById("generate-button");
const numberGrades = document.getElementById("number-grades");
const gradesSection = document.getElementById("grades-section");
const gradesForm = document.getElementById("grades-form");
const gradesMessage = document.getElementById("grades-message");
const resultSection = document.getElementById("result-section");
const finalGrade = document.getElementById("final-grade");
const academicStatus = document.getElementById("academic-status");
const newCalculationButton = document.getElementById("new-calculation-button");

let documentoActual = null;

// Inicializa IndexedDB antes de habilitar el formulario de acceso.
async function iniciarAplicacion() {
    loginButton.disabled = true;
    loginButton.textContent = "Conectando...";

    if (!("indexedDB" in window)) {
        mostrarErrorConexion("Este navegador no es compatible con IndexedDB.");
        return;
    }

    try {
        await conectarDB();
        connectionStatus.textContent = "Base de datos conectada correctamente.";
        connectionStatus.classList.add("success");
        connectionStatus.classList.remove("error");
        loginButton.disabled = false;
        loginButton.textContent = "Ingresar";

        // sessionStorage conserva la sesión al recargar la pestaña.
        const documento = obtenerSesion();
        if (documento) {
            await mostrarPanel(documento);
        }
    } catch (error) {
        console.error("Error al iniciar la aplicación:", error);
        mostrarErrorConexion("No fue posible conectar la base de datos. Recarga la página e inténtalo nuevamente.");
    }
}

function mostrarErrorConexion(mensaje) {
    connectionStatus.textContent = mensaje;
    connectionStatus.classList.add("error");
    connectionStatus.classList.remove("success");
    loginButton.disabled = true;
    loginButton.textContent = "No disponible";
}

async function mostrarPanel(documento) {
    documentoActual = documento;
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    studentDocument.textContent = `Documento: ${documento}`;

    try {
        await mostrarHistorial(documento);
    } catch (error) {
        console.error("Error al consultar el historial:", error);
        document.getElementById("history-container").textContent =
            "No fue posible cargar el historial. Intenta recargar la página.";
    }
}

// Acceso: el documento identifica al estudiante; si no existe, se registra.
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const documento = loginInput.value.trim();

    if (!/^[0-9]{5,20}$/.test(documento)) {
        loginMessage.textContent = "Ingresa un documento válido de 5 a 20 dígitos.";
        loginInput.focus();
        return;
    }

    loginButton.disabled = true;
    loginMessage.textContent = "";

    try {
        await autenticarEstudiante(documento);
        await mostrarPanel(documento);
    } catch (error) {
        console.error("Error de acceso:", error);
        loginMessage.textContent = `No fue posible ingresar: ${error.message}`;
    } finally {
        loginButton.disabled = false;
    }
});

// Cerrar sesión elimina únicamente la sesión; no borra estudiantes ni historial.
logoutButton.addEventListener("click", () => {
    cerrarSesion();
    documentoActual = null;
    dashboardSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
    loginForm.reset();
    loginMessage.textContent = "";
    gradesSection.classList.add("hidden");
    resultSection.classList.add("hidden");
    loginInput.focus();
});

// Generación dinámica de campos.
generateButton.addEventListener("click", () => {
    const cantidad = Number(numberGrades.value);

    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) {
        gradesMessage.textContent = "Ingresa una cantidad entera entre 1 y 20.";
        numberGrades.focus();
        return;
    }

    generarCampos(cantidad);
    gradesForm.reset();
    actualizarPorcentaje();
    gradesSection.classList.remove("hidden");
    resultSection.classList.add("hidden");
    gradesMessage.textContent = "";
    document.getElementById("grades-container").scrollIntoView({ behavior: "smooth", block: "start" });
});

// Cálculo del promedio ponderado y almacenamiento del resultado.
gradesForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!documentoActual) {
        gradesMessage.textContent = "La sesión no está activa. Ingresa nuevamente.";
        return;
    }

    try {
        const notas = validarNotas();
        const definitiva = notas.reduce(
            (total, nota) => total + (nota.valor * nota.porcentaje / 100),
            0
        );
        const definitivaRedondeada =
            Math.round((definitiva + Number.EPSILON) * 100) / 100;
        const estado = definitivaRedondeada >= 3 ? "Aprobado" : "Reprobado";

        const calculo = {
            documento: documentoActual,
            notas,
            definitiva: definitivaRedondeada,
            estado,
            fecha: new Date().toISOString()
        };

        await guardarCalculo(calculo);

        finalGrade.textContent = definitivaRedondeada.toFixed(2);
        academicStatus.textContent = estado;
        academicStatus.className = estado === "Aprobado" ? "approved" : "failed";
        resultSection.classList.remove("hidden");
        gradesMessage.textContent = "";

        await mostrarHistorial(documentoActual);
        resultSection.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
        gradesMessage.textContent = error.message;
        console.error("No se pudo calcular/guardar:", error);
    }
});

// Permite limpiar los valores para realizar otro cálculo con la misma estructura.
newCalculationButton.addEventListener("click", () => {
    gradesForm.reset();
    actualizarPorcentaje();
    resultSection.classList.add("hidden");
    gradesMessage.textContent = "";
    gradesSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

iniciarAplicacion();
