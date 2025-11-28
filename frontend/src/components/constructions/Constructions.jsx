import { useEffect, useState } from "react";
import axios from 'axios';
import { TextInput, Button, Select, Badge, Label } from "flowbite-react";
import { Icon } from "@iconify/react";
import AlertMessage from "../alerts/AlertMessage";
import { redirectIfNotAuthenticated } from "../protection/authRedirect";
import DeleteConstructionModal from "./DeleteConstructionModal";
import CreateConstructionModal from "./CreateConstructionModal";
import DetailConstructionModal from "./DetailConstructionModal";
import EditConstructionModal from "./EditConstructionModal";
import { MaterialReactTable, useMaterialReactTable, MRT_ActionMenuItem } from "material-react-table";
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Edit, Delete } from "@mui/icons-material";
import { Box } from '@mui/material';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Constructions = () => {

    // Generales
    const [constructions, setConstructions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [codigoFilter, setCodigoFilter] = useState("");
    const [descripcionFilter, setDescripcionFilter] = useState("");
    const [clienteFilter, setClienteFilter] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem("token");

    // Detalle
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [selectedDetailConstruction, setSelectedDetailConstruction] = useState(null);

    // Eliminar
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [constructionToDelete, setConstructionToDelete] = useState(null);

    // Editar
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [constructionToEdit, setConstructionToEdit] = useState(null);

    // Nuevo
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);

    useEffect(() => {
        redirectIfNotAuthenticated();
        if (!token) return;
        fetchCustomers();
        fetchConstructions(page);
    }, [page, pageSize, codigoFilter, descripcionFilter, clienteFilter]);

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

    const fetchConstructions = async (currentPage = 1) => {
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize,
                ...(codigoFilter && { codigo: codigoFilter }),
                ...(descripcionFilter && { descripcion: descripcionFilter }),
                ...(clienteFilter && { cliente: clienteFilter }),
            });
            const { data } = await axios.get(`${BASE_URL}api/v1/obra?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setConstructions(data.data || []);
            setTotalCount(data.total_count || 0);
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

    const handleExportExcel = (data) => {
        if (!data || data.length === 0) {
            setErrorMessage("No hay registros para exportar.");
            return;
        }

        // Transformar los datos para que se vean prolijos en el Excel
        const exportData = data.map((item) => ({
            Cliente: item.cliente?.descripcion || "S/D",
            Codigo: item.codigo || "S/D",
            Descripcion: item.descripcion || "S/D",            
            Estado: item.activo ? "ACTIVO" : "INACTIVO" || "S/D"
        }));

        // Crear el libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Obras");

        // Generar el archivo Excel y descargarlo
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `Obras_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const columns = [
        {
            accessorKey: "cliente.descripcion",
            header: "Cliente",
            size: 325
        },
        {
            accessorKey: "codigo",
            header: "Código",
            size: 200
        },
        {
            accessorKey: "descripcion",
            header: "Descripción",
            size: 475
        },
        {
            accessorKey: "activo",
            header: "Estado",
            size: 210,
            Cell: ({ cell }) => {
                const value = cell.getValue();
                const color = value ? "green" : "gray";
                return (
                    <Badge
                        color={color}
                        className="w-24 flex justify-center"
                    >
                        {value ? "ACTIVO" : "INACTIVO"}
                    </Badge>
                );
            },
        }
    ];

    const table = useMaterialReactTable({
        columns,
        data: constructions,
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
        enableRowActions: true,            // habilita acciones por fila
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
            rowsPerPageOptions: [20, 50]
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
                setSelectedDetailConstruction(cell.row.original);
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
        ),

        renderRowActionMenuItems: ({ row, table, closeMenu }) => [
            <MRT_ActionMenuItem
                key="edit"
                icon={<Edit />}
                label="Editar"
                onClick={() => {
                    closeMenu?.();
                    setConstructionToEdit(row.original);
                    setIsModalEditOpen(true);
                }}
                table={table}
            />,
            <MRT_ActionMenuItem
                key="delete"
                icon={<Delete />}
                label="Eliminar"
                onClick={() => {
                    closeMenu?.();
                    setConstructionToDelete(row.original);
                    setIsModalDeleteOpen(true);
                }}
                table={table}
            />,
        ],

    });

    return (
        <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">

            {successMessage && <AlertMessage message={successMessage} type="success" />}
            {errorMessage && <AlertMessage message={errorMessage} type="failure" />}

            <DeleteConstructionModal
                show={isModalDeleteOpen}
                token={token}
                construction={constructionToDelete}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalDeleteOpen(false);
                    setConstructionToDelete(null);
                }}
                onDeleted={async () => {
                    setIsModalDeleteOpen(false);
                    setConstructionToDelete(null);
                    //Logica para cuando elimino el ultimo registro vuelva a la pagina anterior
                    const newPage = (constructions.length === 1 && page > 1) ? page - 1 : page;
                    setPage(newPage);
                    await fetchConstructions(newPage);
                }}
                onError={() => {
                    setIsModalDeleteOpen(false);
                    setConstructionToDelete(null);
                }}
            />

            <CreateConstructionModal
                show={isModalCreateOpen}
                token={token}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalCreateOpen(false);
                }}
                onCreated={async () => {
                    setIsModalCreateOpen(false);
                    await fetchConstructions(page);
                }}
                onError={() => {
                    setIsModalCreateOpen(false);
                }}
            />

            <DetailConstructionModal
                show={isModalDetailOpen}
                onClose={() => {
                    setIsModalDetailOpen(false)
                }}
                construction={selectedDetailConstruction}
                onEdit={() => {
                    setIsModalDetailOpen(false);
                    setConstructionToEdit(selectedDetailConstruction);
                    setIsModalEditOpen(true);
                }}
            />

            <EditConstructionModal
                show={isModalEditOpen}
                construction={constructionToEdit}
                token={token}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalEditOpen(false);
                    setConstructionToEdit(null);
                }}
                onUpdated={async () => {
                    setIsModalEditOpen(false);
                    setConstructionToEdit(null);
                    await fetchConstructions(page);
                }}
                onError={() => {
                    setIsModalEditOpen(false);
                    setConstructionToEdit(null);
                }}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl">Obras</h2>
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
                        setCodigoFilter("");
                        setDescripcionFilter("");
                        setClienteFilter("");
                        setPage(1);
                    }}><Icon icon="solar:trash-bin-minimalistic-2-outline" height={18} />Filtros</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
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
                    <Label htmlFor="codigo" value="Código" className="mb-2 block text-base" />
                    <TextInput
                        id="codigo"
                        value={codigoFilter}
                        onChange={(e) => {
                            setPage(1);
                            setCodigoFilter(e.target.value);
                        }}
                        className="form-control form-rounded-xl w-full"
                        placeholder="Filtrar"
                    />
                </div>
                <div>
                    <Label htmlFor="descripcion" value="Descripción" className="mb-2 block text-base" />
                    <TextInput
                        id="descripcion"
                        value={descripcionFilter}
                        onChange={(e) => {
                            setPage(1);
                            setDescripcionFilter(e.target.value);
                        }}
                        className="form-control form-rounded-xl w-full"
                        placeholder="Filtrar"
                    />
                </div>
            </div>

            <div className="mt-4">
                <MaterialReactTable table={table} />
            </div>

        </div >
    );
};

export default Constructions;