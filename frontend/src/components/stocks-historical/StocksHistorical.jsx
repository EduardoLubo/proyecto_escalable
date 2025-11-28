import { useEffect, useState } from "react";
import axios from 'axios';
import { TextInput, Button, Label, Badge, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import AlertMessage from "../alerts/AlertMessage";
import { redirectIfNotAuthenticated } from "../protection/authRedirect";
import DetailHistoricalModal from "./DetailHitoricalModal";
import { handleOpenPDF } from "../../utils/stockHistoricalPdfPrint";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box } from '@mui/material';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Spinner from '../../views/spinner/Spinner'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StocksHistorical = () => {

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
    const [serieFilter, setSerieFilter] = useState("");
    const [codigoFilter, setCodigoFilter] = useState("");
    const [descripcionFilter, setDescripcionFilter] = useState("");
    const [clienteFilter, setClienteFilter] = useState("");
    const [estadoFilter, setEstadoFilter] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    // Flag de carga
    const [isUbicacionesLoaded, setIsUbicacionesLoaded] = useState(false);

    // Modal
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [selectedDetailMaterial, setSelectedDetailMaterial] = useState(null);

    useEffect(() => {
        redirectIfNotAuthenticated();
        if (!token) return;
        fetchCustomers();
        fetchUbicaciones();
    }, []);

    useEffect(() => {
        if (!isUbicacionesLoaded) return;
        fetchStocks(page);
    }, [page, pageSize, codigoFilter, serieFilter, descripcionFilter, clienteFilter, estadoFilter, isUbicacionesLoaded]);

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

    const fetchStocks = async (currentPage = 1) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize,
                ...(codigoFilter && { codigo: codigoFilter }),
                ...(serieFilter && { serie: serieFilter }),
                ...(descripcionFilter && { descripcion: descripcionFilter }),
                ...(clienteFilter && { cliente: clienteFilter }),
                ...(estadoFilter && { estado: estadoFilter })
            });
            const { data } = await axios.get(
                `${BASE_URL}api/v1/material_serial?${queryParams}`,
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
            default:
                return "S/D";
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
                ...(serieFilter && { serie: serieFilter }),
                ...(descripcionFilter && { descripcion: descripcionFilter }),
                ...(clienteFilter && { cliente: clienteFilter }),
                ...(estadoFilter && { estado: estadoFilter })
            });
            // Trae TODOS los stocks sin paginación
            const { data } = await axios.get(`${BASE_URL}api/v1/material_serial?${queryParams}&getAll=true`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            await handleOpenPDF({
                userData,
                stocks: data.data,
                getUbicacionDescripcionFromCache,
                getCuadrillaDescripcionFromCache,
                codigoFilter,
                serieFilter,
                descripcionFilter,
                clienteFilter
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
            Cliente: item.cliente?.descripcion || "S/D",
            Ubicacion: getUbicacionDescripcionFromCache(item.ubicacion?.tipo, item.ubicacion?.ubicacion_id) || "S/D",
            Cuadrilla: getCuadrillaDescripcionFromCache(item.cuadrilla_id) || "S/D",
            Codigo: item.material?.codigo || "S/D",
            Serie: item.serie || "S/D",
            Descripcion: item.material?.descripcion || "S/D",
            Estado: item.estado || "S/D",
        }));

        // Crear el libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Serializados");

        // Generar el archivo Excel y descargarlo
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `Serializados_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const columns = [
        {
            accessorKey: "cliente.descripcion",
            header: "Cliente",
            size: 190
        },
        {
            accessorFn: (row) =>
                row.ubicacion ? getUbicacionDescripcionFromCache(row.ubicacion.tipo, row.ubicacion.ubicacion_id) : "S/D",
            header: "Ubicación",
            size: 165
        },
        {
            accessorFn: (row) =>
                getCuadrillaDescripcionFromCache(row.cuadrilla_id) || "S/D",
            header: "Cuadrilla",
            size: 205
        },
        {
            accessorKey: "material.codigo",
            header: "Código",
            size: 110
        },
        {
            accessorKey: "serie",
            header: "Serie",
            size: 110
        },
        {
            accessorKey: "material.descripcion",
            header: "Descripción",
            size: 395
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

        muiTableBodyCellProps: ({ cell, table }) => ({
            onClick: () => {
                // Salir del fullscreen si está activado
                if (table.getState().isFullScreen) {
                    table.setIsFullScreen(false);
                }
                // Abrir modal con los datos de la fila
                setSelectedDetailMaterial(cell.row.original);
                setIsModalDetailOpen(true);
            },
            sx: {
                cursor: "pointer",
                color: '#6b7280'
            },
        }),

        renderTopToolbarCustomActions: ({ table }) => (
            <Box>
                <Button color="gray" className="border-none" onClick={() => handleExportExcel(table.getRowModel().rows.map(row => row.original))}>
                    <Icon icon="solar:download-minimalistic-outline" height={20} />Exportar CSV
                </Button>
            </Box>
        )

    });

    // Booleano para desactivar botones si no hay filtros aplciados

    const hasActiveFilters = !!(codigoFilter || serieFilter || descripcionFilter || clienteFilter || estadoFilter);

    return (
        <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">

            {successMessage && <AlertMessage message={successMessage} type="success" />}
            {errorMessage && <AlertMessage message={errorMessage} type="failure" />}

            <DetailHistoricalModal
                show={isModalDetailOpen}
                token={token}
                material={selectedDetailMaterial}
                onClose={() => {
                    setIsModalDetailOpen(false)
                }}
                onError={() => {
                    setIsModalDetailOpen(false)
                }}
                setErrorMessage={setErrorMessage}
                formatFechaHora={formatFechaHora}
                getUbicacionDescripcionFromCache={getUbicacionDescripcionFromCache}
                getCuadrillaDescripcionFromCache={getCuadrillaDescripcionFromCache}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl">Serializados</h2>
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
                        setCodigoFilter("");
                        setSerieFilter("");
                        setDescripcionFilter("");
                        setClienteFilter("");
                        setEstadoFilter("");
                        setPage(1);
                    }}><Icon icon="solar:trash-bin-minimalistic-2-outline" height={18} />Filtros</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
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
                    <Label htmlFor="serie" value="Serie" className="mb-2 block text-base" />
                    <TextInput
                        id="serie"
                        type="text"
                        placeholder="Filtrar"
                        value={serieFilter}
                        onChange={(e) => {
                            setPage(1);
                            setSerieFilter(e.target.value);
                        }}
                        className="form-control form-rounded-xl"
                    />
                </div>
                <div>
                    <Label htmlFor="descripcion" value="Descripción" className="mb-2 block text-base" />
                    <TextInput
                        id="descripcion"
                        type="text"
                        placeholder="Filtrar"
                        value={descripcionFilter}
                        onChange={(e) => {
                            setPage(1);
                            setDescripcionFilter(e.target.value);
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
                    <Label htmlFor="estado" value="Estado" className="mb-2 block text-base" />
                    <Select
                        id="estado"
                        value={estadoFilter}
                        onChange={(e) => {
                            setPage(1);
                            setEstadoFilter(e.target.value);
                        }}
                        className="select-md w-full"
                    >
                        <option value="">Filtrar</option>
                        <option value="DISPONIBLE">DISPONIBLE</option>
                        <option value="BAJA">BAJA</option>
                        <option value="ASIGNADO">ASIGNADO</option>
                        <option value="INSTALADO">INSTALADO</option>
                    </Select>
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

export default StocksHistorical;