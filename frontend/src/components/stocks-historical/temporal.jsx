import { useEffect, useState } from "react";
import axios from 'axios';
import { TextInput, Button, Label, Badge } from "flowbite-react";
import { Icon } from "@iconify/react";
import AlertMessage from "../alerts/AlertMessage";
import { redirectIfNotAuthenticated } from "../protection/authRedirect";
import { handleOpenPDF } from "../../utils/stockHistoricalPdfPrint";
import { FiSearch } from "react-icons/fi";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box } from '@mui/material';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StocksHistorical = () => {

    // Generales
    const [loading, setLoading] = useState(false);
    const [stocks, setStocks] = useState([]);
    const [materialSerial, setMaterialSerial] = useState({});
    const [werehouses, setWerehouses] = useState([]);
    const [constructions, setConstructions] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [crews, setCrews] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [serieFilter, setSerieFilter] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));
    const [serieToPdf, setSerieToPdf] = useState("");
    const [clienteToPdf, setClienteToPdf] = useState("");

    useEffect(() => {
        redirectIfNotAuthenticated();
        if (!token) return;
        fetchUbicaciones();
    }, []);

    useEffect(() => {
        if (serieFilter) fetchStocks(page);
    }, [page, pageSize]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    useEffect(() => {
        if (materialSerial?.cliente?.descripcion) {
            setClienteToPdf(materialSerial.cliente.descripcion.toUpperCase());
        } else {
            setClienteToPdf("S/D");
        }
    }, [materialSerial]);

    const formatFechaHora = (fechaISO) => {
        return new Date(fechaISO).toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // fuerza 24h y sin AM/PM
        });
    };

    const fetchUbicaciones = async () => {
        try {
            const [depositosRes, obrasRes, proveedoresRes, cuadrillasRes] = await Promise.all([
                axios.get(`${BASE_URL}api/v1/deposito?getAll=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${BASE_URL}api/v1/obra?getAll=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${BASE_URL}api/v1/proveedor?getAll=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${BASE_URL}api/v1/cuadrilla?getAll=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setWerehouses(depositosRes.data?.data || []);
            setConstructions(obrasRes.data?.data || []);
            setSuppliers(proveedoresRes.data?.data || []);
            setCrews(cuadrillasRes.data?.data || []);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || error.message || "Error inesperado."
            );
        }
    };

    const fetchStocks = async (currentPage = 1) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize,
                ...(serieFilter && { serie: serieFilter })
            });
            const { data } = await axios.get(
                `${BASE_URL}api/v1/stock_historico?${queryParams}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setStocks(data.data || []);
            setMaterialSerial(data.data?.[0]?.material_serial || {});
            setTotalCount(data.total_count);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || error.message || "Error inesperado."
            );
        } finally {
            setLoading(false);
        }
    };

    const getUbicacionDescripcionFromCache = (tipo, ubicacion_id) => {
        if (!tipo || !ubicacion_id) return null;
        switch (tipo) {
            case "PROVEEDOR":
                const proveedor = suppliers.find(w => w.ubicacion.ubicacion_id === ubicacion_id);
                return proveedor ? `PROV / ${proveedor.codigo}` : "S/D";
            case "DEPOSITO":
                const deposito = werehouses.find(w => w.ubicacion.ubicacion_id === ubicacion_id);
                return deposito ? `DEPO / ${deposito.codigo}` : "S/D";
            case "OBRA":
                const obra = constructions.find(o => o.ubicacion.ubicacion_id === ubicacion_id);
                return obra ? `OBRA / ${obra.codigo}` : "S/D";
            default:
                return "S/D";
        }
    };

    const getCuadrillaDescripcionFromCache = (cuadrilla_id) => {
        if (!cuadrilla_id) return null;
        const cuadrilla = crews.find(o => o.cuadrilla_id === cuadrilla_id);
        return cuadrilla ? cuadrilla.codigo : "S/D";
    };

    const handlePDF = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                ...(serieFilter && { serie: serieFilter })
            });
            // Trae TODOS los stocks sin paginación
            const { data } = await axios.get(`${BASE_URL}api/v1/stock_historico?${queryParams}&getAll=true`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            await handleOpenPDF({
                userData,
                stocks: data.data,
                materialSerial,
                getUbicacionDescripcionFromCache,
                getCuadrillaDescripcionFromCache,
                formatFechaHora,
                serieToPdf,
                clienteToPdf
            });
        } catch (err) {
            setErrorMessage("Error al generar PDF");
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
            size: 155
        },
        {
            accessorKey: "usuario.nombre",
            header: "Usuario",
            size: 200
        },
        {
            accessorKey: "tipo_movimiento.descripcion",
            header: "Movimiento",
            size: 230
        },
        {
            accessorFn: (row) =>
                getUbicacionDescripcionFromCache(row.ubicacion.tipo, row.ubicacion_id),
            header: "Ubicación",
            size: 175
        },
        {
            accessorFn: (row) =>
                getCuadrillaDescripcionFromCache(row.cuadrilla_id) || "S/D",
            header: "Cuadrilla",
            size: 175
        },
        {
            accessorKey: "estado",
            header: "Estado",
            size: 150,
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
                    case "BAJA":
                        color = "red";
                        break;
                    default:
                        color = "gray";
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

    // Booleano para desactivar botones si no hay filtros aplciados
    const hasActiveFilters = !!(serieFilter);

    return (
        <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">

            {successMessage && <AlertMessage message={successMessage} type="success" />}
            {errorMessage && <AlertMessage message={errorMessage} type="failure" />}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl">Historico</h2>
                    <span>Registros: {totalCount}</span>
                </div>
                <div className="flex items-center">
                    <Button className="w-28" color="primary" onClick={() => {
                        if (!stocks || stocks.length === 0) {
                            setErrorMessage("No hay registros disponibles.");
                            return;
                        }
                        handlePDF();
                    }} isProcessing={loading} disabled={!hasActiveFilters || loading}><Icon icon="solar:printer-outline" height={18} />Informe</Button>
                    <Button className="w-28 ml-2 hidden lg:table-cell" color="gray" onClick={() => {
                        setTotalCount(0)
                        setSerieFilter("");
                        setSerieToPdf("");
                        setClienteToPdf("");
                        setStocks([]);
                        setMaterialSerial({});
                        setPage(1);
                    }}><Icon icon="solar:trash-bin-minimalistic-2-outline" height={18} />Filtros</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-9 gap-6 mt-4">
                <div className="lg:col-span-2">
                    <Label htmlFor="serie" value="Serie" className="mb-2 block text-base" />
                    <div className="relative">
                        <TextInput
                            id="serie"
                            type="text"
                            placeholder="Buscar"
                            value={serieFilter}
                            onChange={(e) => {
                                setPage(1);
                                setSerieFilter(e.target.value);
                                setSerieToPdf(e.target.value.toUpperCase());
                            }}
                            className="form-control form-rounded-xl"
                        />
                        <button
                            disabled={!hasActiveFilters || loading}
                            type="button"
                            onClick={() => fetchStocks(page)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                            <FiSearch size={20} />
                        </button>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <Label htmlFor="cliente" value="Cliente" className="mb-2 block text-base" />
                    <TextInput
                        id="cliente"
                        type="text"
                        value={materialSerial.cliente?.descripcion || "S/D"}
                        disabled
                        className="form-control form-rounded-xl bg-gray-50"
                    />
                </div>
                <div className="lg:col-span-2">
                    <Label htmlFor="codigo" value="Codigo" className="mb-2 block text-base" />
                    <TextInput
                        id="codigo"
                        type="text"
                        value={materialSerial.material?.codigo || "S/D"}
                        disabled
                        className="form-control form-rounded-xl bg-gray-50"
                    />
                </div>
                <div className="lg:col-span-3">
                    <Label htmlFor="descripcion" value="Descripción" className="mb-2 block text-base" />
                    <TextInput
                        id="descripcion"
                        type="text"
                        value={materialSerial.material?.descripcion || "S/D"}
                        disabled
                        className="form-control form-rounded-xl bg-gray-50"
                    />
                </div>
            </div>

            <div className="mt-4">
                <MaterialReactTable table={table} />
            </div>

        </div >
    );
};

export default StocksHistorical;