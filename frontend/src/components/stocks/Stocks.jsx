import { useEffect, useState } from "react";
import axios from 'axios';
import { TextInput, Button, Select, Label } from "flowbite-react";
import { Icon } from "@iconify/react";
import AlertMessage from "../alerts/AlertMessage";
import { redirectIfNotAuthenticated } from "../protection/authRedirect";
import { handleOpenPDF } from "../../utils/stockPdfPrint";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box } from '@mui/material';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Spinner from '../../views/spinner/Spinner'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Stocks = () => {

    // Generales
    const [loading, setLoading] = useState(false);
    const [stocks, setStocks] = useState([]);
    const [werehouses, setWerehouses] = useState([]);
    const [constructions, setConstructions] = useState([]);
    const [crews, setCrews] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [codigoFilter, setCodigoFilter] = useState("");
    const [serieFilter, setSerieFilter] = useState("");
    const [depositoFilter, setDepositoFilter] = useState("");
    const [obraFilter, setObraFilter] = useState("");
    const [cuadrillaFilter, setCuadrillaFilter] = useState("");
    const [clienteFilter, setClienteFilter] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    const [codigoToPdf, setCodigoToPdf] = useState("");
    const [serieToPdf, setSerieToPdf] = useState("");
    const [depositoToPdf, setDepositoToPdf] = useState("");
    const [obraToPdf, setObraToPdf] = useState("");
    const [cuadrillaToPdf, setCuadrillaToPdf] = useState("");
    const [clienteToPdf, setClienteToPdf] = useState("");

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
    }, [page, pageSize, codigoFilter, serieFilter, depositoFilter, obraFilter, cuadrillaFilter, clienteFilter, isUbicacionesLoaded]);

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

    const fetchUbicaciones = async () => {
        try {
            const [depositosRes, obrasRes, cuadrillasRes] = await Promise.all([
                axios.get(`${BASE_URL}api/v1/deposito?getAll=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${BASE_URL}api/v1/obra?getAll=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${BASE_URL}api/v1/cuadrilla?getAll=true`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setWerehouses(depositosRes.data?.data || []);
            setConstructions(obrasRes.data?.data || []);
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
                ...(serieFilter && { serie: serieFilter }),
                ...(cuadrillaFilter && { cuadrilla: cuadrillaFilter }),
                ...(clienteFilter && { cliente: clienteFilter }),
            });

            if (obraFilter) {
                queryParams.append("ubicacion", obraFilter);
            } else if (depositoFilter) {
                queryParams.append("ubicacion", depositoFilter);
            }

            const { data } = await axios.get(`${BASE_URL}api/v1/stock?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

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

    const getUbicacionDescripcionFromCache = (tipo, ubicacion_id) => {

        if (!tipo || !ubicacion_id) return null;

        switch (tipo) {

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
                ...(cuadrillaFilter && { cuadrilla: cuadrillaFilter }),
                ...(clienteFilter && { cliente: clienteFilter }),
            });
            if (obraFilter) {
                queryParams.append("ubicacion", obraFilter);
            } else if (depositoFilter) {
                queryParams.append("ubicacion", depositoFilter);
            }
            // Trae TODOS los stocks sin paginación
            const { data } = await axios.get(`${BASE_URL}api/v1/stock?${queryParams}&getAll=true`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            await handleOpenPDF({
                userData,
                stocks: data.data,
                getUbicacionDescripcionFromCache,
                getCuadrillaDescripcionFromCache,
                codigoToPdf,
                serieToPdf,
                depositoToPdf,
                obraToPdf,
                cuadrillaToPdf,
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
            Cliente: item.cliente || "S/D",
            Ubicación: getUbicacionDescripcionFromCache(item.ubicacion?.tipo, item.ubicacion?.ubicacion_id) || "S/D",
            Cuadrilla: getCuadrillaDescripcionFromCache(item.cuadrilla?.cuadrilla_id) || "S/D",
            Código: item.material?.codigo || "S/D",
            Serie: item.serie || "S/D",
            Descripción: item.material?.descripcion || "S/D",
            Cantidad: item.cantidad ?? 0,
            Unidad: item.material?.unidad_medida?.simbolo || "S/D",
        }));

        // Crear el libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");

        // Generar el archivo Excel y descargarlo
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `Stock_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const columns = [
        {
            accessorKey: "cliente",
            header: "Cliente",
            size: 150
        },
        {
            accessorFn: (row) =>
                getUbicacionDescripcionFromCache(row.ubicacion?.tipo, row.ubicacion?.ubicacion_id) || "S/D",
            header: "Ubicación",
            size: 165
        },
        {
            accessorFn: (row) =>
                getCuadrillaDescripcionFromCache(row.cuadrilla?.cuadrilla_id) || "S/D",
            header: "Cuadrilla",
            size: 205
        },
        {
            accessorKey: "material.codigo",
            header: "Código",
            size: 100
        },
        {
            accessorFn: (row) => row.serie || "S/D",
            header: "Serie",
            size: 100
        },
        {
            accessorKey: "material.descripcion",
            header: "Descripción",
            size: 370
        },
        {
            accessorKey: "cantidad",
            header: "Cantidad",
            muiTableHeadCellProps: { align: "right" },
            muiTableBodyCellProps: { align: "right" },
            size: 105
        },
        {
            accessorKey: "material.unidad_medida.simbolo",
            header: "Unidad",
            muiTableHeadCellProps: { align: "right" },
            muiTableBodyCellProps: { align: "right" },
            size: 90
        },
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

    // Booleano para desactivar boton de informe si no hay filtros aplciados
    const hasActiveFilters = !!(codigoFilter || serieFilter || depositoFilter || obraFilter || cuadrillaFilter || clienteFilter);

    return (
        <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">

            {successMessage && <AlertMessage message={successMessage} type="success" />}
            {errorMessage && <AlertMessage message={errorMessage} type="failure" />}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl">Stock</h2>
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
                        setDepositoFilter("");
                        setObraFilter("");
                        setCuadrillaFilter("");
                        setClienteFilter("");
                        setCodigoToPdf("");
                        setSerieToPdf("");
                        setDepositoToPdf("");
                        setObraToPdf("");
                        setCuadrillaToPdf("");
                        setClienteToPdf("");
                        setPage(1);
                    }}><Icon icon="solar:trash-bin-minimalistic-2-outline" height={18} />Filtros</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mt-4">
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
                            setCodigoToPdf(e.target.value.toUpperCase());
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
                            setSerieToPdf(e.target.value.toUpperCase());
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
                            const selectedText = e.target.options[e.target.selectedIndex].text;
                            setClienteToPdf(selectedText);
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
                    <Label htmlFor="deposito" value="Depósito" className="mb-2 block text-base" />
                    <Select
                        id="deposito"
                        className="select-md"
                        value={depositoFilter}
                        onChange={(e) => {
                            setPage(1);
                            setDepositoFilter(e.target.value);
                            setObraFilter(""); // Resetea obra
                            const selectedText = e.target.options[e.target.selectedIndex].text;
                            setDepositoToPdf(selectedText);
                        }}
                        disabled={obraFilter !== "" || cuadrillaFilter !== ""}
                    >
                        <option value="">Filtrar</option>
                        {werehouses.map((deposito) => (
                            <option key={deposito.deposito_id} value={deposito.ubicacion.ubicacion_id}>
                                {deposito.codigo} / {deposito.descripcion}
                            </option>
                        ))}
                    </Select>
                </div>
                <div>
                    <Label htmlFor="obra" value="Obra" className="mb-2 block text-base" />
                    <Select
                        id="obra"
                        className="select-md"
                        value={obraFilter}
                        onChange={(e) => {
                            setPage(1);
                            setObraFilter(e.target.value);
                            setDepositoFilter(""); // Resetea depósito
                            const selectedText = e.target.options[e.target.selectedIndex].text;
                            setObraToPdf(selectedText);
                        }}
                        disabled={depositoFilter !== ""}
                    >
                        <option value="">Filtrar</option>
                        {constructions.map((obra) => (
                            <option key={obra.obra_id} value={obra.ubicacion.ubicacion_id}>
                                {obra.codigo} / {obra.descripcion}
                            </option>
                        ))}
                    </Select>
                </div>
                <div>
                    <Label htmlFor="cuadrilla" value="Cuadrilla" className="mb-2 block text-base" />
                    <Select
                        id="cuadrilla"
                        className="select-md"
                        value={cuadrillaFilter}
                        onChange={(e) => {
                            setPage(1);
                            setCuadrillaFilter(e.target.value);
                            setDepositoFilter(""); // Resetea depósito
                            const selectedText = e.target.options[e.target.selectedIndex].text;
                            setCuadrillaToPdf(selectedText);
                        }}
                        disabled={depositoFilter !== ""}
                    >
                        <option value="">Filtrar</option>
                        {crews.map((cuadrilla) => (
                            <option key={cuadrilla.cuadrilla_id} value={cuadrilla.codigo}>
                                {cuadrilla.codigo} / {cuadrilla.descripcion}
                            </option>
                        ))}
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

export default Stocks;