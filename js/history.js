import { obtenerDB } from "./database.js";

// Persiste un cálculo asociado al documento del estudiante.
export function guardarCalculo(calculo) {
    return new Promise((resolve, reject) => {
        try {
            const db = obtenerDB();
            const transaction = db.transaction(["calculos"], "readwrite");
            const store = transaction.objectStore("calculos");
            const request = store.add(calculo);
            let idGuardado;

            request.onsuccess = () => { idGuardado = request.result; };
            transaction.oncomplete = () => resolve(idGuardado);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error || new Error("No se pudo guardar el cálculo."));
        } catch (error) {
            reject(error);
        }
    });
}

// Consulta exclusivamente los cálculos del documento recibido.
export function consultarHistorial(documento) {
    return new Promise((resolve, reject) => {
        try {
            const db = obtenerDB();
            const transaction = db.transaction(["calculos"], "readonly");
            const store = transaction.objectStore("calculos");
            const request = store.index("documento").getAll(documento);

            request.onsuccess = () => {
                const historial = request.result.sort((a, b) => b.id - a.id);
                resolve(historial);
            };
            request.onerror = () => reject(request.error);
        } catch (error) {
            reject(error);
        }
    });
}

// Renderiza el historial sin insertar contenido del almacenamiento como HTML.
export async function mostrarHistorial(documento) {
    const historial = await consultarHistorial(documento);
    const container = document.getElementById("history-container");
    container.replaceChildren();

    if (historial.length === 0) {
        container.textContent = "No hay cálculos registrados para este estudiante.";
        return;
    }

    historial.forEach((calculo) => {
        const elemento = document.createElement("article");
        elemento.className = "history-item";

        const titulo = document.createElement("strong");
        titulo.textContent = `Nota definitiva: ${Number(calculo.definitiva).toFixed(2)} — ${calculo.estado}`;

        const fecha = document.createElement("p");
        fecha.className = "history-date";
        const fechaValida = new Date(calculo.fecha);
        fecha.textContent = Number.isNaN(fechaValida.getTime())
            ? "Fecha no disponible"
            : fechaValida.toLocaleString("es-CO");

        const detalle = document.createElement("p");
        detalle.textContent = `${calculo.notas.length} nota(s) registradas.`;

        elemento.append(titulo, fecha, detalle);
        container.appendChild(elemento);
    });
}
