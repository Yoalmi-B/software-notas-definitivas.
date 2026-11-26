// Configuración de IndexedDB.
const DB_NAME = "NotasDefinitivasDB";
const DB_VERSION = 1;
let db = null;

export function conectarDB() {
    return new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) {
            reject(new Error("El navegador no ofrece soporte para IndexedDB."));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Usuarios: el documento es la llave primaria.
            if (!database.objectStoreNames.contains("usuarios")) {
                database.createObjectStore("usuarios", { keyPath: "documento" });
            }

            // Cálculos: ID autoincremental e índice para consultar por estudiante.
            if (!database.objectStoreNames.contains("calculos")) {
                const store = database.createObjectStore("calculos", {
                    keyPath: "id",
                    autoIncrement: true
                });
                store.createIndex("documento", "documento", { unique: false });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            db.onversionchange = () => {
                db.close();
                db = null;
            };
            resolve(db);
        };

        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("La actualización está bloqueada por otra pestaña. Cierra otras pestañas de la aplicación."));
    });
}

export function obtenerDB() {
    if (!db) {
        throw new Error("La base de datos todavía no está conectada.");
    }
    return db;
}
