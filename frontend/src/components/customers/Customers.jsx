import { useEffect, useState } from "react";
import axios from 'axios';
import { TextInput, Button, Badge, Label } from "flowbite-react";
import { Icon } from "@iconify/react";
import AlertMessage from "../alerts/AlertMessage";
import { redirectIfNotAuthenticated } from "../protection/authRedirect";
import DeleteCustomerModal from "./DeleteCustomerModal";
import CreateCustomerModal from "./CreateCustomerModal";
import DetailCustomerModal from "./DetailCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import { MaterialReactTable, useMaterialReactTable, MRT_ActionMenuItem } from "material-react-table";
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Edit, Delete } from "@mui/icons-material";
import { Box } from '@mui/material';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Customers = () => {

    // Generales
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [codigoFilter, setCodigoFilter] = useState("");
    const [descripcionFilter, setDescripcionFilter] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem("token");

    // Detalle
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [selectedDetailCustomer, setSelectedDetailCustomer] = useState(null);

    // Eliminar
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    // Editar
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [customerToEdit, setCustomerToEdit] = useState(null);

    // Nuevo
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);

    useEffect(() => {
        redirectIfNotAuthenticated();
        if (!token) return;
        fetchCustomers(page);
    }, [page, pageSize, codigoFilter, descripcionFilter]);

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

    const fetchCustomers = async (currentPage = 1) => {
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize,
                ...(codigoFilter && { codigo: codigoFilter }),
                ...(descripcionFilter && { descripcion: descripcionFilter }),
            });
            const { data } = await axios.get(`${BASE_URL}api/v1/cliente?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCustomers(data.data || []);
            setTotalCount(data.total_count || 0);
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
            Codigo: item.codigo || "S/D",
            Descripcion: item.descripcion || "S/D",
            Estado: item.activo ? "ACTIVO" : "INACTIVO" || "S/D",
            Psm: item.operativo ? "SI" : "NO" || "S/D"
        }));

        // Crear el libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

        // Generar el archivo Excel y descargarlo
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `Clientes_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const columns = [
        {
            accessorKey: "codigo",
            header: "Código",
            size: 260
        },
        {
            accessorKey: "descripcion",
            header: "Descripción",
            size: 700
        },
        {
            accessorKey: "activo",
            header: "Estado",
            size: 250,
            Cell: ({ cell }) => {
                const value = cell.getValue();
                const rowData = cell.row.original;
                const color = value ? "green" : "gray";
                return (
                    <div className="flex space-x-2 w-full justify-start">
                        <Badge
                            color={color}
                            className="w-24 flex justify-center"
                        >
                            {value ? "ACTIVO" : "INACTIVO"}
                        </Badge>
                        {rowData.operativo && (
                            <Badge
                                color="gray"
                                className="w-26 flex justify-center"
                            >
                                OPERATIVO PSM
                            </Badge>
                        )}
                    </div>
                );
            },
        }
    ];

    const table = useMaterialReactTable({
        columns,
        data: customers,
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
                setSelectedDetailCustomer(cell.row.original);
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
                    setCustomerToEdit(row.original);
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
                    setCustomerToDelete(row.original);
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

            <DeleteCustomerModal
                show={isModalDeleteOpen}
                token={token}
                customer={customerToDelete}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalDeleteOpen(false);
                    setCustomerToDelete(null);
                }}
                onDeleted={async () => {
                    setIsModalDeleteOpen(false);
                    setCustomerToDelete(null);
                    //Logica para cuando elimino el ultimo registro vuelva a la pagina anterior
                    const newPage = (customers.length === 1 && page > 1) ? page - 1 : page;
                    setPage(newPage);
                    await fetchCustomers(newPage);
                }}
                onError={() => {
                    setIsModalDeleteOpen(false);
                    setCustomerToDelete(null);
                }}
            />

            <CreateCustomerModal
                show={isModalCreateOpen}
                token={token}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalCreateOpen(false);
                }}
                onCreated={async () => {
                    setIsModalCreateOpen(false);
                    await fetchCustomers(page);
                }}
                onError={() => {
                    setIsModalCreateOpen(false);
                }}
            />

            <DetailCustomerModal
                show={isModalDetailOpen}
                onClose={() => {
                    setIsModalDetailOpen(false)
                }}
                customer={selectedDetailCustomer}
                onEdit={() => {
                    setIsModalDetailOpen(false);
                    setCustomerToEdit(selectedDetailCustomer);
                    setIsModalEditOpen(true);
                }}
            />

            <EditCustomerModal
                show={isModalEditOpen}
                customer={customerToEdit}
                token={token}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalEditOpen(false);
                    setCustomerToEdit(null);
                }}
                onUpdated={async () => {
                    setIsModalEditOpen(false);
                    setCustomerToEdit(null);
                    await fetchCustomers(page);
                }}
                onError={() => {
                    setIsModalEditOpen(false);
                    setCustomerToEdit(null);
                }}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl">Clientes</h2>
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
                        setPage(1);
                    }}><Icon icon="solar:trash-bin-minimalistic-2-outline" height={18} />Filtros</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
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

export default Customers;