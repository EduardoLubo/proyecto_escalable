import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, Label, TextInput } from "flowbite-react";
import axios from "axios";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { MRT_Localization_ES } from 'material-react-table/locales/es';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SetMaterialModal = ({ show, token, selectedIndex, setFormData, setErrorMessage, onClose, onLoaded, onError }) => {

    const [materials, setMaterials] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [descripcionFilter, setDescripcionFilter] = useState("");

    useEffect(() => {
        if (!token) return;
        if (!descripcionFilter.trim()) {
            setMaterials([]);
            setTotalCount(0);
            return;
        }
        fetchMaterials(page);
    }, [page, pageSize, descripcionFilter]);

    useEffect(() => {
        if (!show) {
            setDescripcionFilter("");
            setMaterials([]);
            setPage(1);
        }
    }, [show]);

    const fetchMaterials = async (currentPage = 1) => {
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize,
                activo: true,
                ...(descripcionFilter && { descripcion: descripcionFilter }),
            });
            const { data } = await axios.get(`${BASE_URL}api/v1/material?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMaterials(data.data || []);
            setTotalCount(data.total_count || 0);
        } catch (error) {            
            setErrorMessage(
                error.response?.data?.message || error.message || "Error inesperado."
            );
            onError();
        }
    };

    const columns = [
        {
            accessorKey: "codigo",
            header: "Código",
            size: 150
        },
        {
            accessorKey: "descripcion",
            header: "Descripción",
            size: 625
        }
    ];

    const table = useMaterialReactTable({
        columns,
        data: materials,
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
        enableGlobalFilter: false,         // habilita filtro global (lupa)
        enableTopToolbar: true,            // habilita toolbar superior
        enableBottomToolbar: true,         // habilita toolbar inferior
        enableColumnOrdering: false,       // habilita reordenamiento de columnas
        localization: MRT_Localization_ES, // idioma español

        muiPaginationProps: {
            showRowsPerPage: false
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

                const material = cell.row.original;

                setFormData(prev => {
                    const updated = { ...prev };
                    const updatedDetalle = [...updated.movimiento_detalle];

                    updatedDetalle[selectedIndex].material_id = material.material_id;
                    updatedDetalle[selectedIndex].codigo = material.codigo;
                    updatedDetalle[selectedIndex].descripcion = material.descripcion;
                    updatedDetalle[selectedIndex].unidad = material.unidad_medida.simbolo;
                    updatedDetalle[selectedIndex].serializado = material.serializado;

                    if (material.serializado) {
                        updatedDetalle[selectedIndex].cantidad = 1;
                    }

                    updatedDetalle.push({ material_id: "", serie: "", cantidad: 0 });

                    updated.movimiento_detalle = updatedDetalle;
                    return updated;
                });
                setDescripcionFilter("");
                setMaterials([]);
                setPage(1);
                onLoaded();
            },
            sx: {
                cursor: "pointer",
                color: '#6b7280'
            },
        }),

    });

    return (
        <Modal show={show} size="4xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Buscar material</ModalHeader>
                <ModalBody>
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-4">
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
                </ModalBody>
            </div>
        </Modal>
    );
};

export default SetMaterialModal;