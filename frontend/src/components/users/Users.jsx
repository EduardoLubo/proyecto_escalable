import { useEffect, useState } from "react";
import axios from 'axios';
import { TextInput, Button, Select, Badge, Label } from "flowbite-react";
import { Icon } from "@iconify/react";
import AlertMessage from "../alerts/AlertMessage";
import { redirectIfNotAuthenticated } from "../protection/authRedirect";
import CreateUserModal from "./CreateUserModal";
import DetailUserModal from "./DetailUserModal";
import EditUserModal from "./EditUserModal";
import RestorePasswordModal from "./RestorePasswordModal";
import { MaterialReactTable, useMaterialReactTable, MRT_ActionMenuItem } from "material-react-table";
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Edit, LockReset } from "@mui/icons-material";
import { Box } from '@mui/material';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Users = () => {

    // Generales
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [emailFilter, setEmailFilter] = useState("");
    const [nombreFilter, setNombreFilter] = useState("");
    const [rolFilter, setRolFilter] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem("token");

    // Detalle
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [selectedDetailUser, setSelectedDetailUser] = useState(null);

    // Editar
    const [isModalEditOpen, setIsModalEditOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    // Restore
    const [isModalRestorePasswordOpen, setIsModalRestorePasswordOpen] = useState(false);
    const [userToRestorePassword, setUserToRestorePassword] = useState(null);

    // Nuevo
    const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);

    useEffect(() => {
        redirectIfNotAuthenticated();
        if (!token) return;
        fetchUsers(page);
    }, [page, pageSize, emailFilter, nombreFilter, rolFilter]);

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

    const fetchUsers = async (currentPage = 1) => {
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize,
                ...(emailFilter && { email: emailFilter }),
                ...(nombreFilter && { nombre: nombreFilter }),
                ...(rolFilter && { tipo_usuario: rolFilter }),
            });
            const { data } = await axios.get(`${BASE_URL}api/v1/usuario?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(data.data || []);
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
            Email: item.email || "S/D",
            Nombre: item.nombre || "S/D",
            Rol: item.tipo_usuario?.tipo || "S/D",
            Estado: item.activo ? "ACTIVO" : "INACTIVO" || "S/D"
        }));

        // Crear el libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

        // Generar el archivo Excel y descargarlo
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `Usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const columns = [
        {
            accessorKey: "email",
            header: "Email",
            size: 410
        },
        {
            accessorKey: "nombre",
            header: "Nombre",
            size: 350
        },
        {
            accessorKey: "tipo_usuario.tipo",
            header: "Rol",
            size: 300
        },
        {
            accessorKey: "activo",
            header: "Estado",
            size: 150,
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
        data: users,
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
                setSelectedDetailUser(cell.row.original);
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
                    setUserToEdit(row.original);
                    setIsModalEditOpen(true);
                }}
                table={table}
            />,
            <MRT_ActionMenuItem
                key="reset-password"
                icon={<LockReset />}
                label="Restaurar contraseña"
                onClick={() => {
                    closeMenu?.();
                    setUserToRestorePassword(row.original);
                    setIsModalRestorePasswordOpen(true);
                }}
                table={table}
            />,
        ],

    });

    return (

        <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">

            {successMessage && <AlertMessage message={successMessage} type="success" />}
            {errorMessage && <AlertMessage message={errorMessage} type="failure" />}

            <RestorePasswordModal
                show={isModalRestorePasswordOpen}
                token={token}
                user={userToRestorePassword}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalRestorePasswordOpen(false);
                    setUserToRestorePassword(null);
                }}
                onSend={async () => {
                    setIsModalRestorePasswordOpen(false);
                    setUserToRestorePassword(null);
                    await fetchUsers(page);
                }}
                onError={() => {
                    setIsModalRestorePasswordOpen(false);
                    setUserToRestorePassword(null);
                }}
            />

            <CreateUserModal
                show={isModalCreateOpen}
                token={token}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalCreateOpen(false);
                }}
                onCreated={async () => {
                    setIsModalCreateOpen(false);
                    await fetchUsers(page);
                }}
                onError={() => {
                    setIsModalCreateOpen(false);
                }}
            />

            <DetailUserModal
                show={isModalDetailOpen}
                onClose={() => {
                    setIsModalDetailOpen(false)
                }}
                user={selectedDetailUser}
                onEdit={() => {
                    setIsModalDetailOpen(false);
                    setUserToEdit(selectedDetailUser);
                    setIsModalEditOpen(true);
                }}
            />

            <EditUserModal
                show={isModalEditOpen}
                user={userToEdit}
                token={token}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalEditOpen(false);
                    setUserToEdit(null);
                }}
                onUpdated={async () => {
                    setIsModalEditOpen(false);
                    setUserToEdit(null);
                    await fetchUsers(page);
                }}
                onError={() => {
                    setIsModalEditOpen(false);
                    setUserToEdit(null);
                }}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl">Usuarios</h2>
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
                        setEmailFilter("");
                        setNombreFilter("");
                        setRolFilter("");
                        setPage(1);
                    }}><Icon icon="solar:trash-bin-minimalistic-2-outline" height={18} />Filtros</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div>
                    <Label htmlFor="email" value="Email" className="mb-2 block text-base" />
                    <TextInput
                        id="email"
                        value={emailFilter}
                        onChange={(e) => {
                            setPage(1);
                            setEmailFilter(e.target.value);
                        }}
                        className="form-control form-rounded-xl w-full"
                        placeholder="Filtrar"
                    />
                </div>
                <div>
                    <Label htmlFor="nombre" value="Nombre" className="mb-2 block text-base" />
                    <TextInput
                        id="nombre"
                        value={nombreFilter}
                        onChange={(e) => {
                            setPage(1);
                            setNombreFilter(e.target.value);
                        }}
                        className="form-control form-rounded-xl w-full"
                        placeholder="Filtrar"
                    />
                </div>
                <div>
                    <Label htmlFor="rol" value="Rol" className="mb-2 block text-base" />
                    <Select
                        id="rol"
                        value={rolFilter}
                        onChange={(e) => {
                            setPage(1);
                            setRolFilter(e.target.value);
                        }}
                        className="select-md w-full"
                    >
                        <option value="">Filtrar</option>
                        <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                        <option value="USUARIO">USUARIO</option>
                    </Select>
                </div>
            </div>

            <div className="mt-4">
                <MaterialReactTable table={table} />
            </div>

        </div >
    );
};

export default Users;