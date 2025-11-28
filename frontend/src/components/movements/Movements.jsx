import { useEffect, useState } from "react";
import axios from 'axios';
import { TextInput, Button, Select, Datepicker, Label } from "flowbite-react";
import { Icon } from "@iconify/react";
import AlertMessage from "../alerts/AlertMessage";
import { redirectIfNotAuthenticated } from "../protection/authRedirect";
import DetailMovementModal from "./DetailMovementModal";
import CreateMovementModal from "./CreateMovementModal";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box } from '@mui/material';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Spinner from '../../views/spinner/Spinner'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Movements = () => {

    // Generales
    const [loading, setLoading] = useState(false);
    const [movements, setMovements] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [fechaFilter, setFechaFilter] = useState(null);
    const [remitoFilter, setRemitoFilter] = useState("");
    const [usuarioFilter, setUsuarioFilter] = useState("");
    const [clienteFilter, setClienteFilter] = useState("");
    const [tipoFilter, setTipoFilter] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem("token");

    // Detalle
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [selectedDetailMovement, setSelectedDetailMovement] = useState(null);

    // Nuevo
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);

    useEffect(() => {
        redirectIfNotAuthenticated();
        if (!token) return;
        fetchCustomers();
        fetchMovements(page);
    }, [page, pageSize, fechaFilter, remitoFilter, usuarioFilter, tipoFilter, clienteFilter]);

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

    const fetchMovements = async (currentPage = 1) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize,
                ...(fechaFilter instanceof Date && { fecha: fechaFilter.toISOString().split("T")[0] }),
                ...(remitoFilter && { remito: remitoFilter }),
                ...(usuarioFilter && { usuario: usuarioFilter }),
                ...(tipoFilter && { descripcion: tipoFilter }),
                ...(clienteFilter && { cliente: clienteFilter }),
            });
            const { data } = await axios.get(`${BASE_URL}api/v1/movimiento?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMovements(data.data || []);
            setTotalCount(data.total_count || 0);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || error.message || "Error inesperado."
            );
        } finally {
            setLoading(false);
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

    const getUbicacionDescripcion = (ubicacion) => {
        if (!ubicacion) return "";

        if (ubicacion.tipo === "PROVEEDOR" && ubicacion.proveedor) {
            return `${ubicacion.proveedor.codigo} / ${ubicacion.proveedor.descripcion}`;
        }

        if (ubicacion.tipo === "DEPOSITO" && ubicacion.deposito) {
            return `${ubicacion.deposito.codigo} / ${ubicacion.deposito.descripcion}`;
        }

        if (ubicacion.tipo === "OBRA" && ubicacion.obra) {
            return `${ubicacion.obra.codigo} / ${ubicacion.obra.descripcion}`;
        }

        return "";
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
            Cliente: item.cliente?.descripcion || "S/D",
            Movimiento: item.tipo_movimiento?.descripcion || "S/D",
            Origen: getUbicacionDescripcion(item.desde_ubicacion) || "S/D",
            Destino: getUbicacionDescripcion(item.hacia_ubicacion) || "S/D",
            Remito: item.movimiento_id || "S/D",
        }));

        // Crear el libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");

        // Generar el archivo Excel y descargarlo
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `Movimientos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const columns = [
        {
            accessorFn: (row) =>
                formatFechaHora(row.auditoria_alta) || "S/D",
            header: "Fecha",
            size: 140
        },
        {
            accessorKey: "usuario.nombre",
            header: "Usuario",
            size: 185
        },
        {
            accessorKey: "cliente.descripcion",
            header: "Cliente",
            size: 195
        },
        {
            accessorKey: "tipo_movimiento.descripcion",
            header: "Movimiento",
            size: 245
        },
        {
            accessorFn: (row) =>
                getUbicacionDescripcion(row.desde_ubicacion) || "S/D",
            header: "Origen",
            size: 215
        },
        {
            accessorFn: (row) =>
                getUbicacionDescripcion(row.hacia_ubicacion) || "S/D",
            header: "Destino",
            size: 215
        },
        {
            accessorKey: "movimiento_id",
            header: "Remito",
            muiTableHeadCellProps: { align: "right" },
            muiTableBodyCellProps: { align: "right" },
            size: 90
        }
    ];

    const table = useMaterialReactTable({
        columns,
        data: movements,
        rowCount: totalCount,              // total de registros del backend
        layoutMode: "grid-no-grow",        // asegura que se respete el size

        initialState: {
            density: "compact",
        },

        state: {
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
                setSelectedDetailMovement(cell.row.original);
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

    return (
        <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">

            {successMessage && <AlertMessage message={successMessage} type="success" />}
            {errorMessage && <AlertMessage message={errorMessage} type="failure" />}

            <CreateMovementModal
                show={isModalCreateOpen}
                token={token}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalCreateOpen(false);
                }}
                onCreated={async () => {
                    setIsModalCreateOpen(false);
                    await fetchMovements(page);
                }}
                onError={() => {
                    setIsModalCreateOpen(false);
                }}
            />

            <DetailMovementModal
                show={isModalDetailOpen}
                movement={selectedDetailMovement}
                onClose={() => {
                    setIsModalDetailOpen(false)
                }}
                onError={() => {
                    setIsModalDetailOpen(false)
                }}
                setErrorMessage={setErrorMessage}
                getUbicacionDescripcion={getUbicacionDescripcion}
                formatFechaHora={formatFechaHora}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl">Movimientos</h2>
                    <span>Registros: {totalCount}</span>
                </div>
                <div className="flex items-center">
                    <Button
                        className="w-28"
                        color="primary"
                        onClick={() => {
                            setIsModalCreateOpen(true);
                        }}
                    >
                        Nuevo
                    </Button>
                    <Button className="w-28 ml-2 hidden lg:table-cell" color="gray" onClick={() => {
                        setFechaFilter(null);
                        setRemitoFilter("");
                        setUsuarioFilter("");
                        setTipoFilter("");
                        setClienteFilter("");
                        setPage(1);
                    }}><Icon icon="solar:trash-bin-minimalistic-2-outline" height={18} />Filtros</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
                <div>
                    <Label htmlFor="fecha" value="Fecha" className="mb-2 block text-base" />
                    <Datepicker
                        id="fecha"
                        key={fechaFilter ? fechaFilter.toISOString() : "empty"}
                        language="es-AR"
                        labelTodayButton="Hoy"
                        labelClearButton="Limpar"
                        value={fechaFilter}
                        onChange={(date) => {
                            setPage(1);
                            setFechaFilter(date);
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
                    <Label htmlFor="usuario" value="Usuario" className="mb-2 block text-base" />
                    <TextInput
                        id="usuario"
                        value={usuarioFilter}
                        onChange={(e) => {
                            setPage(1);
                            setUsuarioFilter(e.target.value);
                        }}
                        className="form-control form-rounded-xl w-full"
                        placeholder="Filtrar"
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
                    <Label htmlFor="tipo" value="Movimiento" className="mb-2 block text-base" />
                    <Select
                        id="tipo"
                        value={tipoFilter}
                        onChange={(e) => {
                            setPage(1);
                            setTipoFilter(e.target.value);
                        }}
                        className="select-md w-full"
                    >
                        <option value="">Filtrar</option>
                        <option value="INGRESO DE PROVEEDOR">INGRESO DE PROVEEDOR</option>
                        <option value="DEVOLUCIONES DE OBRA">DEVOLUCIONES DE OBRA</option>
                        <option value="ENVIOS A OBRA">ENVIOS A OBRA</option>
                        <option value="CONSUMO EN OBRA">CONSUMO EN OBRA</option>
                        <option value="TRASLADO ENTRE OBRAS">TRASLADO ENTRE OBRAS</option>
                        <option value="TRASLADO ENTRE DEPOSITOS">TRASLADO ENTRE DEPOSITOS</option>
                        <option value="TRASLADO ENTRE CUADRILLAS">TRASLADO ENTRE CUADRILLAS</option>
                        <option value="DEVOLUCIONES A PROVEEDOR">DEVOLUCIONES A PROVEEDOR</option>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="remito" value="Remito" className="mb-2 block text-base" />
                    <TextInput
                        id="remito"
                        value={remitoFilter}
                        onChange={(e) => {
                            setPage(1);
                            setRemitoFilter(e.target.value);
                        }}
                        className="form-control form-rounded-xl w-full"
                        placeholder="Filtrar"
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

export default Movements;