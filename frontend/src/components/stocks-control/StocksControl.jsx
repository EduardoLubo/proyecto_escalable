import { useEffect, useState } from "react";
import axios from 'axios';
import { TextInput, Button, Label, Select, Datepicker } from "flowbite-react";
import { Icon } from "@iconify/react";
import AlertMessage from "../alerts/AlertMessage";
import { redirectIfNotAuthenticated } from "../protection/authRedirect";
import { handleOpenPDF } from "../../utils/stockControlPdfPrint";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box } from '@mui/material';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Spinner from '../../views/spinner/Spinner'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StocksControl = () => {

    // Generales
    const [loading, setLoading] = useState(false);
    const [stocks, setStocks] = useState([]);
    const [werehouses, setWerehouses] = useState([]);
    const [constructions, setConstructions] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [crews, setCrews] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [codigoFilter, setCodigoFilter] = useState("");
    const [clienteFilter, setClienteFilter] = useState("");
    const [fechaDesdeFilter, setFechaDesdeFilter] = useState(null);
    const [fechaHastaFilter, setFechaHastaFilter] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    // Flag de carga
    const [isUbicacionesLoaded, setIsUbicacionesLoaded] = useState(false);

    useEffect(() => {
        redirectIfNotAuthenticated();
        if (!token) return;
        fetchCustomers();
        fetchUbicaciones();
    }, []);

    useEffect(() => {
        if (!isUbicacionesLoaded) return;
        fetchStocks(page);
    }, [page, pageSize, codigoFilter, clienteFilter, fechaDesdeFilter, fechaHastaFilter, isUbicacionesLoaded]);

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

    const fetchCustomers = async () => {
        try {
            const { data } = await axios.get(`${BASE_URL}api/v1/cliente`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCustomers(data.data || []);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || error.message || "Error inesperado."
            );
        }
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
            setIsUbicacionesLoaded(true);
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
                ...(codigoFilter && { codigo: codigoFilter }),
                ...(clienteFilter && { cliente: clienteFilter }),
                ...(fechaDesdeFilter instanceof Date && { fechaDesde: fechaDesdeFilter.toISOString().split("T")[0] }),
                ...(fechaHastaFilter instanceof Date && { fechaHasta: fechaHastaFilter.toISOString().split("T")[0] }),
            });
            const { data } = await axios.get(
                `${BASE_URL}api/v1/stock_control?${queryParams}`,
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

    const getUbicacionDescripcionFromCache = (tipo, ubicacion_id) => {
        if (!tipo || !ubicacion_id) return null;
        switch (tipo) {
            case "PROVEEDOR":
                const proveedor = suppliers.find(w => w.ubicacion.ubicacion_id === ubicacion_id);
                return proveedor ? `${proveedor.codigo} / ${proveedor.descripcion}` : "S/D";
            case "DEPOSITO":
                const deposito = werehouses.find(w => w.ubicacion.ubicacion_id === ubicacion_id);
                return deposito ? `${deposito.codigo} / ${deposito.descripcion}` : "S/D";
            case "OBRA":
                const obra = constructions.find(o => o.ubicacion.ubicacion_id === ubicacion_id);
                return obra ? `${obra.codigo} / ${obra.descripcion}` : "S/D";
        }
    };

    const getCuadrillaDescripcionFromCache = (cuadrilla_id) => {
        if (!cuadrilla_id) return null;
        const cuadrilla = crews.find(o => o.cuadrilla_id === cuadrilla_id);
        return cuadrilla ? `${cuadrilla.codigo} / ${cuadrilla.descripcion}` : "S/D";
    };

    const handlePDF = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                ...(codigoFilter && { codigo: codigoFilter }),
                ...(clienteFilter && { cliente: clienteFilter }),
                ...(fechaDesdeFilter instanceof Date && { fechaDesde: fechaDesdeFilter.toISOString().split("T")[0] }),
                ...(fechaHastaFilter instanceof Date && { fechaHasta: fechaHastaFilter.toISOString().split("T")[0] }),
            });
            // Trae TODOS los stocks sin paginación
            const { data } = await axios.get(`${BASE_URL}api/v1/stock_control?${queryParams}&getAll=true`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            await handleOpenPDF({
                userData,
                stocks: data.data,
                getUbicacionDescripcionFromCache,
                getCuadrillaDescripcionFromCache,
                formatFechaHora
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
        const exportData = data.map((item) => {
            const tipoMov = item.movimiento?.tipo_movimiento?.descripcion;

            // --- Ubicación ---
            const verOrigenUbicacion = tipoMov === "CONSUMO EN OBRA";
            const ubicacion = verOrigenUbicacion ? item.movimiento?.desde_ubicacion : item.movimiento?.hacia_ubicacion;
            const ubicacionDesc = getUbicacionDescripcionFromCache(ubicacion?.tipo, ubicacion?.ubicacion_id) || "S/D";

            // --- Cuadrilla ---
            const verOrigenCuadrilla = tipoMov === "CONSUMO EN OBRA" || tipoMov === "DEVOLUCIONES DE OBRA";
            const cuadrillaId = verOrigenCuadrilla ? item.movimiento?.desde_cuadrilla_id : item.movimiento?.hacia_cuadrilla_id;
            const cuadrillaDesc = getCuadrillaDescripcionFromCache(cuadrillaId) || "S/D";

            return {
                Fecha: formatFechaHora(item.movimiento?.auditoria_alta) || "S/D",
                Usuario: item.movimiento?.usuario?.nombre || "S/D",
                Cliente: item.movimiento?.cliente?.descripcion || "S/D",
                Movimiento: tipoMov || "S/D",
                Ubicación: ubicacionDesc,
                Cuadrilla: cuadrillaDesc,
                Serie: item.movimiento_detalle_serial?.material?.serie || "S/D",
                Cantidad: item.cantidad ?? 0,
                Remito: item.movimiento?.movimiento_id || "S/D",
            };
        });

        // Crear el libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Control");

        // Generar el archivo Excel y descargarlo
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `Control_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const columns = [
        {
            accessorFn: (row) =>
                formatFechaHora(row.movimiento?.auditoria_alta) || "S/D",
            header: "Fecha",
            size: 135
        },
        {
            accessorKey: "movimiento.usuario.nombre",
            header: "Usuario",
            size: 130
        },
        {
            accessorKey: "movimiento.cliente.descripcion",
            header: "Cliente",
            size: 150
        },
        {
            accessorKey: "movimiento.tipo_movimiento.descripcion",
            header: "Movimiento",
            size: 205
        },
        {
            accessorFn: (row) => {
                const verOrigen = row.movimiento?.tipo_movimiento?.descripcion === "CONSUMO EN OBRA";
                const ubicacion = verOrigen ? row.movimiento?.desde_ubicacion : row.movimiento?.hacia_ubicacion;
                return getUbicacionDescripcionFromCache(ubicacion?.tipo, ubicacion?.ubicacion_id) || "S/D";
            },
            header: "Ubicación",
            size: 165
        },
        {
            accessorFn: (row) => {
                const verOrigen = row.movimiento?.tipo_movimiento?.descripcion === "CONSUMO EN OBRA" || row.movimiento?.tipo_movimiento?.descripcion === "DEVOLUCIONES DE OBRA";
                const cuadrilla_id = verOrigen ? row.movimiento?.desde_cuadrilla_id : row.movimiento?.hacia_cuadrilla_id;
                return getCuadrillaDescripcionFromCache(cuadrilla_id) || "S/D";
            },
            header: "Cuadrilla",
            size: 205
        },
        {
            accessorFn: (row) => row.movimiento_detalle_serial?.material?.serie || "S/D",
            header: "Serie",
            size: 100
        },
        {
            accessorKey: "cantidad",
            header: "Cantidad",
            muiTableHeadCellProps: { align: "right" },
            muiTableBodyCellProps: { align: "right" },
            size: 105
        },
        {
            accessorKey: "movimiento.movimiento_id",
            header: "Remito",
            muiTableHeadCellProps: { align: "right" },
            muiTableBodyCellProps: { align: "right" },
            size: 90
        },
    ];

    const table = useMaterialReactTable({
        columns,
        data: stocks,
        rowCount: totalCount,   // total de registros del backend
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
    const hasActiveFilters = !!(codigoFilter || clienteFilter || fechaDesdeFilter || fechaHastaFilter);

    return (
        <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">

            {successMessage && <AlertMessage message={successMessage} type="success" />}
            {errorMessage && <AlertMessage message={errorMessage} type="failure" />}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl">Control</h2>
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
                        setFechaDesdeFilter(null);
                        setFechaHastaFilter(null);
                        setCodigoFilter("");
                        setClienteFilter("");
                        setPage(1);
                    }}><Icon icon="solar:trash-bin-minimalistic-2-outline" height={18} />Filtros</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
                <div>
                    <Label htmlFor="codigo" value="Código" className="mb-2 block text-base " />
                    <TextInput
                        id="codigo"
                        type="text"
                        placeholder="Filtrar"
                        value={codigoFilter}
                        onChange={(e) => {
                            setPage(1);
                            setCodigoFilter(e.target.value);
                        }}
                        className="form-control form-rounded-xl"
                    />
                </div>
                <div>
                    <Label htmlFor="cliente" value="Cliente" className="mb-2 block text-base" />
                    <Select
                        id="cliente"
                        value={clienteFilter}
                        onChange={(e) => {
                            setPage(1);
                            setClienteFilter(e.target.value);
                        }}
                        className="select-md w-full"
                    >
                        <option value="">Filtrar</option>
                        {customers.map((cliente) => (
                            <option key={cliente.cliente_id} value={cliente.cliente_id}>
                                {cliente.descripcion}
                            </option>
                        ))}
                    </Select>
                </div>
                <div>
                    <Label htmlFor="fechaDesde" value="Desde" className="mb-2 block text-base" />
                    <Datepicker
                        id="fechaDesde"
                        key={fechaDesdeFilter ? fechaDesdeFilter.toISOString() : "empty"}
                        language="es-AR"
                        labelTodayButton="Hoy"
                        labelClearButton="Limpar"
                        value={fechaDesdeFilter}
                        onChange={(date) => {
                            setPage(1);
                            setFechaDesdeFilter(date);
                        }}
                        className="w-full"
                        style={{
                            border: "1px solid #e5e7eb",
                            backgroundColor: "transparent",
                            borderRadius: "0.35rem"
                        }}
                    />
                </div>
                <div>
                    <Label htmlFor="fechaHasta" value="Hasta" className="mb-2 block text-base" />
                    <Datepicker
                        id="fechaHasta"
                        key={fechaHastaFilter ? fechaHastaFilter.toISOString() : "empty"}
                        language="es-AR"
                        labelTodayButton="Hoy"
                        labelClearButton="Limpar"
                        value={fechaHastaFilter}
                        onChange={(date) => {
                            setPage(1);
                            setFechaHastaFilter(date);
                        }}
                        className="w-full"
                        style={{
                            border: "1px solid #e5e7eb",
                            backgroundColor: "transparent",
                            borderRadius: "0.35rem"
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 overflow-hidden">
                    <Spinner />
                </div>
            ) : (
                <div className="mt-4">
                    <MaterialReactTable table={table} />
                </div>
            )}

        </div >
    );
};

export default StocksControl;