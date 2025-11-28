import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoBase64 from "./logoBase64";

export const handleOpenPDF = async ({ userData, stocks, getUbicacionDescripcionFromCache, getCuadrillaDescripcionFromCache, codigoToPdf, serieToPdf, depositoToPdf, obraToPdf, cuadrillaToPdf, clienteToPdf }) => {
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
    pdf.text(`INFORME STOCK`, colRight, 18, { align: "right" });

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
        ["Material", codigoToPdf || "S/D"],
        ["Serie", serieToPdf || "S/D"],
        ["Depósito", depositoToPdf && depositoToPdf !== "Filtrar" ? depositoToPdf : "S/D"],
        ["Obra", obraToPdf && obraToPdf !== "Filtrar" ? obraToPdf : "S/D"],
        ["Cuadrilla", cuadrillaToPdf && cuadrillaToPdf !== "Filtrar" ? cuadrillaToPdf : "S/D"],
        ["Cliente", clienteToPdf && clienteToPdf !== "Filtrar" ? clienteToPdf : "S/D"]
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
        p.cliente ?? "S/D",
        getUbicacionDescripcionFromCache(p.ubicacion?.tipo, p.ubicacion?.ubicacion_id) || "S/D",
        getCuadrillaDescripcionFromCache(p.cuadrilla?.cuadrilla_id) || "S/D",
        p.material?.codigo || "S/D",
        p.es_serial ? (p.serie || "S/D") : "S/D",
        p.material?.descripcion || "S/D",
        p.cantidad ?? "S/D",
        p.material?.unidad_medida?.simbolo || "S/D"
    ]);

    autoTable(pdf, {
        startY: tableStartY,
        head: [["Cliente", "Ubicacion", "Cuadrilla", "Código", "Serie", "Descripción", "Cantidad", "Unidad"]],
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
        columnStyles: {
            6: { halign: 'right' }, // Cantidad
            7: { halign: 'right' }, // Unidad
        },
        margin: { left: margin, right: margin, bottom: 35 },
        pageBreak: "auto",
        didParseCell: (data) => {
            if (data.section === 'head' && (data.column.index === 6 || data.column.index === 7)) {
                data.cell.styles.halign = 'right';
            }
        },
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