import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoBase64 from "./logoBase64";

export const handleOpenPDF = async ({ movement, formatFechaHora, getUbicacionDescripcion }) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;

    const colRight = pageWidth - margin;
    const logoHeight = 20;

    // === 1. LOGO ===
    if (logoBase64) {
        pdf.addImage(logoBase64, "PNG", margin, 10, 50, logoHeight);
    }

    // === 2. TÍTULO REMITO (derecha) ===
    pdf.setFontSize(26);
    pdf.setFont("helvetica", "bold");
    pdf.text(`REMITO #${movement.movimiento_id}`, colRight, 18, { align: "right" });

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${formatFechaHora(movement.auditoria_alta)}`, colRight, 25, { align: "right" });

    // === 3. DATOS DE EMPRESA A LA IZQUIERDA ===
    const empresaInfo = [
        "EMA SERVICIOS S.A.",
        "Av. San Martín 4970",
        "1602 - Florida - Buenos Aires",
        "Fecha de Inicio de Actividades: 20-05-1998"
    ];

    // Aseguramos que ocupen los mismos 20mm que el logo
    const lineSpacing = logoHeight / empresaInfo.length; // ~4mm por línea

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");

    empresaInfo.forEach((line, i) => {
        pdf.text(line, margin, 35 + i * lineSpacing);
    });

    // === 5. LÍNEA SEPARADORA ===
    const topContentEndY = Math.max(
        10 + logoHeight,
        25,
        35 + empresaInfo.length * lineSpacing
    );
    const separatorY = topContentEndY;

    pdf.line(margin, separatorY, pageWidth - margin, separatorY);

    // === 6. INFO EN UNA SOLA COLUMNA ===

    const yStart = separatorY + 6;

    const datos = [
        ["Usuario", movement.usuario?.nombre || "S/D"],
        ["Cliente", movement.cliente ? `${movement.cliente.codigo || "S/D"} / ${movement.cliente.descripcion || "S/D"}` : "S/D"],
        ["Tipo de Movimiento", movement.tipo_movimiento?.descripcion || "S/D"],
        ["Lugar de Origen", getUbicacionDescripcion(movement.desde_ubicacion) || "S/D"],
        ["Lugar de Destino", getUbicacionDescripcion(movement.hacia_ubicacion) || "S/D"],
    ].filter(([_, value]) => value !== "S/D");

    if (movement.desde_cuadrilla) {
        const jefe = movement.desde_cuadrilla.cuadrilla_personal?.find(p => p.rol === "JEFE DE CUADRILLA");
        datos.push([
            "Cuadrilla Origen",
            `${movement.desde_cuadrilla.codigo} / ${jefe?.personal_cuadrilla?.nombre || "S/D"}`
        ]);
    }

    if (movement.hacia_cuadrilla) {
        const jefe = movement.hacia_cuadrilla.cuadrilla_personal?.find(p => p.rol === "JEFE DE CUADRILLA");
        datos.push([
            "Cuadrilla Destino",
            `${movement.hacia_cuadrilla.codigo} / ${jefe?.personal_cuadrilla?.nombre || "S/D"}`
        ]);
    }

    datos.push(["Nro. Reserva", movement.reserva || "S/D"]);
    datos.push(["Descripción", movement.descripcion || "S/D"]);

    // Render
    const renderFullWidth = (data, y) => {
        const labelX = margin;
        const valueX = margin + 50; // valor fijo para alinear todos los valores iguales

        data.forEach(([label, value]) => {
            pdf.setFontSize(8);

            pdf.setFont("helvetica", "bold");
            pdf.text(`${label}:`, labelX, y);

            pdf.setFont("helvetica", "normal");
            pdf.text(value || "S/D", valueX, y);

            y += 5;
        });
        return y;
    };

    const yEnd = renderFullWidth(datos, yStart);
    const tableStartY = yEnd + 2;

    // === 7. TABLA ===
    autoTable(pdf, {
        startY: tableStartY,
        head: [["#", "Código", "Serie", "Descripción", "Cantidad", "Unidad"]],
        body: movement.movimiento_detalles.map((p, index) => [
            index + 1,
            p.material?.codigo || "S/D",
            p.movimiento_detalle_serial?.material?.serie || "S/D",
            p.material?.descripcion || "S/D",
            p.cantidad ?? "S/D",
            p.material?.unidad_medida?.simbolo || "S/D",
        ]),
        headStyles: {
            fillColor: [220, 220, 220],
            textColor: 20,
            fontStyle: "bold",
            fontSize: 8,
        },
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        columnStyles: {
            4: { halign: "right" },
            5: { halign: "right" },
        },
        margin: { left: margin, right: margin, bottom: 35 },
        pageBreak: "auto",
        didParseCell: (data) => {
            if (data.section === 'head' && (data.column.index === 4 || data.column.index === 5)) {
                data.cell.styles.halign = 'right';
            }
        },
    });

    // === 8. FIRMAS ===
    const finalPage = pdf.internal.getNumberOfPages();
    pdf.setPage(finalPage);

    const firmaY = pageHeight - 30;
    const firmaWidth = 70;
    const firmaHeight = 0.3;

    pdf.setLineWidth(firmaHeight);
    pdf.setDrawColor(50, 50, 50); // Gris oscuro para línea profesional

    // Línea para "Recibí conforme"
    pdf.line(margin, firmaY, margin + firmaWidth, firmaY);

    // Línea para "Aclaración"
    const aclaracionX = pageWidth / 2;
    pdf.line(aclaracionX, firmaY, aclaracionX + firmaWidth, firmaY);

    // Texto de título debajo de la línea, centrado
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("Entrega", margin + firmaWidth / 2, firmaY + 7, { align: "center" });
    pdf.text("Recibe", aclaracionX + firmaWidth / 2, firmaY + 7, { align: "center" });

    // Texto auxiliar en cursiva debajo del título, más pequeño
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "italic");
    pdf.text("Firma y aclaración", margin + firmaWidth / 2, firmaY + 12, { align: "center" });
    pdf.text("Firma y aclaración", aclaracionX + firmaWidth / 2, firmaY + 12, { align: "center" });

    // Paginacion
    const totalPages = pdf.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(
            `Página ${i} de ${totalPages}`,
            pageWidth - margin,
            pageHeight - 10,
            { align: "right" }
        );
    }

    // === 9. MOSTRAR PDF ===
    window.open(pdf.output("bloburl"), "_blank");
};