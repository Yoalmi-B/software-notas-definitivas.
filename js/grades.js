// Genera los campos solicitados por el estudiante.
export function generarCampos(cantidad) {
    const container = document.getElementById("grades-container");
    container.innerHTML = "";

    for (let i = 1; i <= cantidad; i++) {
        const grupo = document.createElement("div");
        grupo.className = "grade-group";

        const titulo = document.createElement("h4");
        titulo.textContent = `Nota ${i}`;

        const labelNota = document.createElement("label");
        labelNota.htmlFor = `nota-${i}`;
        labelNota.textContent = "Calificación (0.0 a 5.0)";

        const inputNota = document.createElement("input");
        inputNota.type = "number";
        inputNota.id = `nota-${i}`;
        inputNota.className = "nota";
        inputNota.min = "0";
        inputNota.max = "5";
        inputNota.step = "0.01";
        inputNota.placeholder = "Ej. 4.2";
        inputNota.required = true;

        const labelPorcentaje = document.createElement("label");
        labelPorcentaje.htmlFor = `porcentaje-${i}`;
        labelPorcentaje.textContent = "Porcentaje (%)";

        const inputPorcentaje = document.createElement("input");
        inputPorcentaje.type = "number";
        inputPorcentaje.id = `porcentaje-${i}`;
        inputPorcentaje.className = "porcentaje";
        inputPorcentaje.min = "0.01";
        inputPorcentaje.max = "100";
        inputPorcentaje.step = "0.01";
        inputPorcentaje.placeholder = "Ej. 30";
        inputPorcentaje.required = true;

        grupo.append(titulo, labelNota, inputNota, labelPorcentaje, inputPorcentaje);
        container.appendChild(grupo);
    }

    // Un solo listener delegado: no se acumulan listeners al regenerar los campos.
    container.oninput = actualizarPorcentaje;
    actualizarPorcentaje();
}

// Actualiza el porcentaje acumulado y orienta sobre el faltante/exceso.
export function actualizarPorcentaje() {
    const inputs = document.querySelectorAll(".porcentaje");
    let total = 0;

    inputs.forEach((input) => {
        if (input.value.trim() !== "") total += Number(input.value);
    });

    const totalRedondeado = Math.round((total + Number.EPSILON) * 100) / 100;
    const totalElement = document.getElementById("percentage-total");
    const messageElement = document.getElementById("percentage-message");

    totalElement.textContent = `${totalRedondeado.toFixed(2)}%`;

    if (Math.abs(totalRedondeado - 100) < 0.000001) {
        messageElement.textContent = "Porcentajes completos: 100%.";
        messageElement.className = "percentage-valid";
    } else if (totalRedondeado < 100) {
        messageElement.textContent = `Falta asignar ${(100 - totalRedondeado).toFixed(2)}%.`;
        messageElement.className = "percentage-pending";
    } else {
        messageElement.textContent = `Hay un exceso de ${(totalRedondeado - 100).toFixed(2)}%.`;
        messageElement.className = "percentage-invalid";
    }
}

// Valida los campos y devuelve los datos numéricos para el cálculo.
export function validarNotas() {
    const notas = document.querySelectorAll(".nota");
    const porcentajes = document.querySelectorAll(".porcentaje");
    const resultado = [];
    let totalPorcentaje = 0;

    if (notas.length === 0) {
        throw new Error("Primero debes generar al menos una nota.");
    }

    for (let i = 0; i < notas.length; i++) {
        const valorTexto = notas[i].value.trim();
        const porcentajeTexto = porcentajes[i].value.trim();

        if (valorTexto === "" || porcentajeTexto === "") {
            const campo = valorTexto === "" ? notas[i] : porcentajes[i];
            campo.focus();
            throw new Error(`Completa todos los campos de la nota ${i + 1}.`);
        }

        const valor = Number(valorTexto);
        const porcentaje = Number(porcentajeTexto);

        if (!Number.isFinite(valor) || valor < 0 || valor > 5) {
            notas[i].focus();
            throw new Error(`La nota ${i + 1} debe estar entre 0.0 y 5.0.`);
        }

        if (!Number.isFinite(porcentaje) || porcentaje <= 0 || porcentaje > 100) {
            porcentajes[i].focus();
            throw new Error(`El porcentaje de la nota ${i + 1} debe ser mayor que 0 y máximo 100.`);
        }

        totalPorcentaje += porcentaje;
        resultado.push({ valor, porcentaje });
    }

    const total = Math.round((totalPorcentaje + Number.EPSILON) * 100) / 100;
    if (Math.abs(total - 100) > 0.000001) {
        const diferencia = 100 - total;
        throw new Error(
            diferencia > 0
                ? `La suma de porcentajes es ${total.toFixed(2)}%. Falta asignar ${diferencia.toFixed(2)}%.`
                : `La suma de porcentajes es ${total.toFixed(2)}%. Hay un exceso de ${Math.abs(diferencia).toFixed(2)}%.`
        );
    }

    return resultado;
}
