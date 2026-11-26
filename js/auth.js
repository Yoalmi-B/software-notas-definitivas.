import { obtenerDB } from "./database.js";

// Busca al estudiante y lo registra automáticamente si es la primera visita.
export function autenticarEstudiante(documento) {
    return new Promise((resolve, reject) => {
        const db = obtenerDB();
        const transaction = db.transaction(["usuarios"], "readwrite");
        const store = transaction.objectStore("usuarios");
        const request = store.get(documento);
        let usuarioEncontrado = null;
        let errorOperacion = null;

        request.onsuccess = () => {
            usuarioEncontrado = request.result;

            if (!usuarioEncontrado) {
                usuarioEncontrado = {
                    documento,
                    fechaRegistro: new Date().toISOString()
                };
                store.add(usuarioEncontrado);
            }
        };

        request.onerror = () => {
            errorOperacion = request.error;
        };

        transaction.oncomplete = () => {
            try {
                sessionStorage.setItem("estudiante", documento);
                resolve(usuarioEncontrado);
            } catch (error) {
                reject(error);
            }
        };

        transaction.onerror = () => reject(errorOperacion || transaction.error);
        transaction.onabort = () => reject(errorOperacion || transaction.error || new Error("La operación fue cancelada."));
    });
}

// Recupera la sesión después de recargar la misma pestaña.
export function obtenerSesion() {
    return sessionStorage.getItem("estudiante");
}

export function cerrarSesion() {
    sessionStorage.removeItem("estudiante");
}
