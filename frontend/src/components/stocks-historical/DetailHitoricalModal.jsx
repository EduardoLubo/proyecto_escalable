import { useEffect, useState } from "react";
import axios from 'axios';
import { Modal, ModalHeader, ModalBody, Button, Badge, Label, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { handleOpenPDF } from "../../utils/DetailHistoricalPdfPrint";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box } from '@mui/material';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DetailHistoricalModal = ({ show, token, material, onClose, onError, setErrorMessage, formatFechaHora, getUbicacionDescripcionFromCache, getCuadrillaDescripcionFromCache }) => {

    const [loading, setLoading] = useState(false);
    const [stocks, setStocks] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const userData = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (show) {
            fetchStocks(page);
        }
    }, [show, page, pageSize]);

    const fetchStocks = async (currentPage = 1) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize,
                serie: material.serie,
                cliente: material.cliente_id
            });
            const { data } = await axios.get(
                `${BASE_URL}api/v1/stock_historico?${queryParams}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setStocks(data.data || []);
            setTotalCount(data.total_count);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || error.message || "Error inesperado."
            );
        } finally {
            setLoading(false);
        }
    };

    const handlePDFDetail = async () => {
        try {
            setLoading(true);
            await handleOpenPDF({ userData, material, stocks, formatFechaHora, getUbicacionDescripcionFromCache, getCuadrillaDescripcionFromCache });
        } catch (err) {
            setErrorMessage("Error al generar PDF");
            onError();
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = (data) => {
        if (!data || data.length === 0) {
            setErrorMessage("No hay registros para exportar.");
            return;
        }
        // Transformar los datos para que se vean prolijos en el Excel
        const exportData = data.map((item) => ({
            Fecha: formatFechaHora(item.auditoria_alta) || "S/D",
            Usuario: item.usuario?.nombre || "S/D",
            Movimiento: item.tipo_movimiento?.descripcion || "S/D",
            Ubicación: getUbicacionDescripcionFromCache(item.ubicacion?.tipo, item.ubicacion_id) || "S/D",
            Cuadrilla: getCuadrillaDescripcionFromCache(item.cuadrilla_id) || "S/D",
            Estado: item.estado || "S/D",
        }));
        // Crear el libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Historico");
        // Generar el archivo Excel y descargarlo
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `Historico_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const columns = [
        {
            accessorFn: (row) =>
                formatFechaHora(row.auditoria_alta),
            header: "Fecha",
            size: 150
        },
        {
            accessorKey: "usuario.nombre",
            header: "Usuario",
            size: 225
        },
        {
            accessorKey: "tipo_movimiento.descripcion",
            header: "Movimiento",
            size: 275
        },
        {
            accessorFn: (row) =>
                getUbicacionDescripcionFromCache(row.ubicacion.tipo, row.ubicacion_id),
            header: "Ubicación",
            size: 200
        },
        {
            accessorFn: (row) =>
                getCuadrillaDescripcionFromCache(row.cuadrilla_id) || "S/D",
            header: "Cuadrilla",
            size: 200
        },
        {
            accessorKey: "estado",
            header: "Estado",
            size: 110,
            Cell: ({ cell }) => {
                const value = cell.getValue();
                let color;
                switch (value) {
                    case "DISPONIBLE":
                        color = "green";
                        break;
                    case "ASIGNADO":
                        color = "yellow";
                        break;
                    case "INSTALADO":
                        color = "info";
                        break;
                    case "BAJA":
                        color = "red";
                        break;
                }
                return (
                    <Badge
                        color={color}
                        className="w-24 flex justify-center"
                    >
                        {value}
                    </Badge>
                );
            },
        }
    ];

    const table = useMaterialReactTable({
        columns,
        data: stocks,
        rowCount: totalCount,              // total de registros del backend
        layoutMode: "grid-no-grow",        // asegura que se respete el size

        initialState: {
            density: "compact",
        },

        state: {
            isLoading: loading,
            pagination: { pageIndex: page - 1, pageSize }
        },

        onPaginationChange: (updater) => {
            const newPagination =
                typeof updater === "function"
                    ? updater({ pageIndex: page - 1, pageSize })
                    : updater;
            setPage(newPagination.pageIndex + 1);
            setPageSize(newPagination.pageSize);
        },

        // Opciones
        enablePagination: true,            // habilita paginación
        manualPagination: true,            // controlada por el backend
        enableHiding: true,                // permite ocultar columnas
        enableSorting: true,               // habilita ordenamiento
        enableColumnActions: false,        // habilita acciones en columnas
        enableRowActions: false,           // habilita acciones por fila
        positionActionsColumn: 'last',     // ubicacion de la columna acciones
        enableColumnResizing: true,        // habilita ancho de las columnas manual
        enableColumnFilters: false,        // habilita filtros por columna
        columnFilterDisplayMode: 'popover',// filtros en columna individual
        enableDensityToggle: false,        // habilita cambiar densidad (altura filas)
        enableFullScreenToggle: true,      // habilita fullscreen        
        enableGlobalFilter: true,          // habilita filtro global (lupa)
        enableTopToolbar: true,            // habilita toolbar superior
        enableBottomToolbar: true,         // habilita toolbar inferior
        enableColumnOrdering: false,       // habilita reordenamiento de columnas
        localization: MRT_Localization_ES, // idioma español         

        muiPaginationProps: {
            showRowsPerPage: true,
            rowsPerPageOptions: [20, 50, 100]
        },

        muiTablePaperProps: {
            elevation: 0,
            sx: {
                borderRadius: '.375rem',
                border: '1px solid #e0e6eb',
            }
        },

        muiTableHeadCellProps: {
            sx: {
                color: 'rgb(55 65 81)'
            }
        },

        muiTableBodyCellProps: {
            sx: {
                color: '#6b7280',
            },
        },

        renderTopToolbarCustomActions: ({ table }) => (
            <Box>
                <Button color="gray" className="border-none" onClick={() => handleExportExcel(table.getRowModel().rows.map(row => row.original))}>
                    <Icon icon="solar:download-minimalistic-outline" height={20} />Exportar CSV
                </Button>
            </Box>
        )

    });

    if (!material) return null;

    return (
        <Modal show={show} size="7xl" onClose={onClose} popup >
            <div className="p-4">
                <ModalHeader>Historico</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
                        <div>
                            <Label htmlFor="cliente" value="Cliente" className="mb-2 block text-base" />
                            <TextInput
                                id="cliente"
                                type="text"
                                value={material?.cliente?.codigo || "S/D"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="codigo" value="Código" className="mb-2 block text-base " />
                            <TextInput
                                id="codigo"
                                type="text"
                                value={material?.material?.codigo || "S/D"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="serie" value="Serie" className="mb-2 block text-base" />
                            <TextInput
                                id="serie"
                                type="text"
                                value={material?.serie || "S/D"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <Label htmlFor="descripcion" value="Descripción" className="mb-2 block text-base" />
                            <TextInput
                                id="descripcion"
                                type="text"
                                value={material?.material?.descripcion || "S/D"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <MaterialReactTable table={table} />
                    </div>

                    <div className="flex gap-3 mt-10">
                        <Button
                            className="w-28"
                            color="primary"
                            onClick={handlePDFDetail}
                            disabled={loading}
                            isProcessing={loading}
                        >
                            <Icon icon="solar:printer-outline" height={18} />
                            <span>Informe</span>
                        </Button>
                        <Button className="w-28" color="gray" onClick={onClose}>
                            Cerrar
                        </Button>
                    </div>
                </ModalBody>
            </div>
        </Modal>
    );
};

export default DetailHistoricalModal;