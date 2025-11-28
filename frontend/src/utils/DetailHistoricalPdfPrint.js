import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoBase64 from "./logoBase64";

export const handleOpenPDF = async ({ userData, material, stocks, formatFechaHora, getUbicacionDescripcionFromCache, getCuadrillaDescripcionFromCache }) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;

    const colRight = pageWidth - margin;
    const logoHeight = 20;

    const now = new Date();

    const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // fuerza 24h y sin AM/PM
    }).format(now);

    // === 1. LOGO ===
    if (logoBase64) {
        pdf.addImage(logoBase64, "PNG", margin, 10, 50, logoHeight);
    }

    // === 2. TÍTULO REMITO (derecha) ===
    pdf.setFontSize(26);
    pdf.setFont("helvetica", "bold");
    pdf.text(`HISTORICO`, colRight, 18, { align: "right" });

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${fechaFormateada}`, colRight, 25, { align: "right" });

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

    // === 4. LÍNEA SEPARADORA ===
    const topContentEndY = Math.max(
        10 + logoHeight,
        25,
        35 + empresaInfo.length * lineSpacing
    );
    const separatorY = topContentEndY;

    pdf.line(margin, separatorY, pageWidth - margin, separatorY);

    // === 5. INFO EN COLUMNAS ===

    const yStart = separatorY + 6;

    const datos = [
        ["Solicitado por", userData?.usuario_nombre || "S/D"],
        ["Cliente", material?.cliente?.codigo || "S/D"],
        ["Codigo", material?.material?.codigo || "S/D"],
        ["Serie", material?.serie || "S/D"],
        ["Descripción", material?.material?.descripcion || "S/D"],
    ].filter(([_, value]) => value !== "S/D");

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

    // === 6. TABLA ===
    const tableBody = stocks.map((p) => [
        formatFechaHora(p.auditoria_alta) || "S/D",
        p.usuario?.nombre|| "S/D",
        p.tipo_movimiento?.descripcion || "S/D",
        getUbicacionDescripcionFromCache(p.ubicacion.tipo, p.ubicacion_id) || "S/D",
        getCuadrillaDescripcionFromCache(p.cuadrilla_id) || "S/D",
        p.estado || "S/D"
    ]);

    autoTable(pdf, {
        startY: tableStartY,
        head: [["Fecha", "Usuario", "Movimiento", "Ubicación", "Cuadrilla", "Estado"]],
        body: tableBody,
        headStyles: {
            fillColor: [220, 220, 220],
            textColor: 20,
            fontStyle: "bold",
            fontSize: 8,
        },
        styles: {
            fontSize: 8,
            cellPadding: 1,
        },
        margin: { left: margin, right: margin, bottom: 35 },
        pageBreak: "auto"
    });

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

    // === 7. MOSTRAR PDF ===
    window.open(pdf.output("bloburl"), "_blank");
};