import { useState } from "react";
import { Modal, ModalBody, ModalHeader, Button, FileInput, Label } from "flowbite-react";
import * as XLSX from "xlsx";
import axios from "axios";
import Spinner from '../../views/spinner/Spinner'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AutoLoadDataModal = ({ show, token, setFormData, setErrorMessage, onClose, onLoaded, onError }) => {

    const [loading, setLoading] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleExcelUpload({ target: { files: e.dataTransfer.files } });
            e.dataTransfer.clearData();
        }
    };

    const handleExcelUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (!rows || rows.length < 2) {
                setErrorMessage("El archivo está vacío o sin datos.");
                onError();
                return;
            }

            // Extraer headers y normalizar
            const headers = rows[0].map(h => h?.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
            const codigoIndex = headers.findIndex(h => h === "codigo");
            const serieIndex = headers.findIndex(h => h === "serie");
            const cantidadIndex = headers.findIndex(h => h === "cantidad");

            if (codigoIndex === -1 || cantidadIndex === -1) {
                setErrorMessage("El archivo debe contener las columnas 'codigo', 'serie' (si corresponde) y 'cantidad'.");
                onError();
                return;
            }

            const parsedRows = [];
            const codigosSet = new Set();

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const rawCodigo = row[codigoIndex];
                const rawSerie = serieIndex !== -1 ? row[serieIndex] : null; // <-- serie opcional
                const rawCantidad = row[cantidadIndex];

                const codigo = rawCodigo?.toString().trim().toUpperCase();
                const serie = rawSerie?.toString().trim().toUpperCase();
                const cantidadStr = rawCantidad?.toString().replace(",", ".").trim();
                const cantidadNum = parseFloat(cantidadStr);                

                // Validación
                if (!codigo || isNaN(cantidadNum)) {
                    setErrorMessage(`Fila ${i + 1}: código o cantidad no válida.`);
                    onError();
                    return;
                }

                codigosSet.add(codigo);

                // Guardamos cantidad con 2 decimales siempre como número
                parsedRows.push({
                    codigo,
                    serie,
                    cantidad: parseFloat(cantidadNum.toFixed(2))
                });
            }

            const detalle = [];

            for (const row of parsedRows) {
                try {
                    const { data } = await axios.get(`${BASE_URL}api/v1/material?activo=true&codigo=${row.codigo}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (data.data && data.data.length > 0) {
                        const material = data.data[0];

                        if (row.serie && !material.serializado) {
                            setErrorMessage(`El material codigo '${row.codigo}' no está configurado como serializado en el sistema.`);
                            onError();
                            return;
                        }

                        detalle.push({
                            material_id: material.material_id,
                            codigo: material.codigo,
                            serie: row.serie,
                            descripcion: material.descripcion,
                            unidad: material.unidad_medida.simbolo,
                            serializado: material.serializado,
                            cantidad: material.serializado ? 1 : row.cantidad
                        });
                    } else {
                        setErrorMessage(`Material no encontrado código '${row.codigo}'.`);
                        onError();
                        return;
                    }
                } catch (error) {
                    setErrorMessage(error.response?.data?.message || error.message || "Error en la autocarga.");
                    onError();
                    return;
                }
            }

            // Agregamos una fila vacía al final
            detalle.push({ material_id: "", serie: "", cantidad: 0 });

            setFormData(prev => ({
                ...prev,
                movimiento_detalle: detalle
            }));

            onLoaded();

        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || "Error en la autocarga.");
            onError();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} size="lg" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Carga inteligente</ModalHeader>
                <ModalBody>
                    {loading ? (
                        <div className="flex items-center justify-center h-64 overflow-hidden">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 mt-4">
                            <div className="flex w-full items-center justify-center">
                                <Label
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    htmlFor="dropzone-file"
                                    className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                                >
                                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                        <svg
                                            className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 20 16"
                                        >
                                            <path
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                            />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                            <span className="font-semibold">Seleccioná un archivo</span> o soltalo aca
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center w-64">
                                            Archivos permitidos: <strong>.xlsx</strong>, <strong>.xls</strong>. El archivo debe contener las columnas <strong>“codigo”</strong>, <strong>“serie”</strong> (si corresponde) y <strong>“cantidad”</strong>.
                                        </p>
                                    </div>
                                    <FileInput
                                        id="dropzone-file"
                                        className="hidden"
                                        accept=".xlsx, .xls"
                                        onChange={handleExcelUpload}
                                    />
                                </Label>
                            </div>
                        </div>

                    )}

                    <div className="flex justify-center mt-8">
                        <Button className="w-32" color="gray" onClick={onClose} disabled={loading}>Cerrar</Button>
                    </div>

                </ModalBody>
            </div>
        </Modal>
    );
};

export default AutoLoadDataModal;