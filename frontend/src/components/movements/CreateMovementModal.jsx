import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Select, Table } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import axios from "axios";
import StockErrorMessage from "../alerts/StockErrorMessage";
import AutoLoadDataModal from "./AutoLoadDataModal";
import SetMaterialModal from "./SetMaterialModal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateMovementModal = ({ show, token, setSuccessMessage, setErrorMessage, onClose, onCreated, onError }) => {

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        descripcion: "",
        reserva: "",
        desde_ubicacion_id: "",
        hacia_ubicacion_id: "",
        desde_cuadrilla_id: "",
        hacia_cuadrilla_id: "",
        tipo_movimiento_id: "",
        cliente_id: "",
        movimiento_detalle: [{ material_id: "", serie: "", cantidad: 0 }]
    });
    const [tipoMovimiento, setTipoMovimiento] = useState("");
    const [detallesMovimiento, setDetallesMovimiento] = useState([]);
    const [origenOptions, setOrigenOptions] = useState([]);
    const [destinoOptions, setDestinoOptions] = useState([]);
    const [cuadrillaOptions, setCuadrillaOptions] = useState([]);
    const [mostrarCuadrillaOrigen, setMostrarCuadrillaOrigen] = useState(false);
    const [mostrarCuadrillaDestino, setMostrarCuadrillaDestino] = useState(false);
    const [mostrarOrigen, setMostrarOrigen] = useState(false);
    const [mostrarDestino, setMostrarDestino] = useState(false);
    const [showStockErrorModal, setShowStockErrorModal] = useState(false);
    const [stockErrorDetails, setStockErrorDetails] = useState([]);
    const [clientes, setClientes] = useState([]);

    // AutoData Modal
    const [isModalAutoDataOpen, setIsModalAutoDataOpen] = useState(false);

    // SetMaterial Modañl
    const [isModalSetMaterialOpen, setIsModalSetMaterialOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState("");

    const reglasOrigenDestino = {
        "INGRESO DE PROVEEDOR": {
            origen: "proveedor",
            destino: "deposito",
            cuadrilla_origen: false,
            cuadrilla_destino: false,
        },
        "DEVOLUCIONES DE OBRA": {
            origen: "obra",
            destino: "deposito",
            cuadrilla_origen: true,
            cuadrilla_destino: false,
        },
        "ENVIOS A OBRA": {
            origen: "deposito",
            destino: "obra",
            cuadrilla_origen: false,
            cuadrilla_destino: true,
        },
        "CONSUMO EN OBRA": {
            origen: "obra",
            destino: null,
            cuadrilla_origen: true,
            cuadrilla_destino: false,
        },
        "TRASLADO ENTRE OBRAS": {
            origen: "obra",
            destino: "obra",
            cuadrilla_origen: true,
            cuadrilla_destino: true,
        },
        "TRASLADO ENTRE DEPOSITOS": {
            origen: "deposito",
            destino: "deposito",
            cuadrilla_origen: false,
            cuadrilla_destino: false,
        },
        "TRASLADO ENTRE CUADRILLAS": {
            origen: "obra",
            destino: "obra",
            cuadrilla_origen: true,
            cuadrilla_destino: true,
        },
        "DEVOLUCIONES A PROVEEDOR": {
            origen: "deposito",
            destino: "proveedor",
            cuadrilla_origen: false,
            cuadrilla_destino: false,
        },
    };

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const { data } = await axios.get(`${BASE_URL}api/v1/cliente?getAll=true&activo=true`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setClientes(data.data || []);
            } catch (error) {
                setErrorMessage(error.response?.data?.message || error.message || "Error al cargar clientes.");
            }
        };
        if (show) {
            fetchClientes();
        }
    }, [show]);

    useEffect(() => {
        const fetchTiposMovimientos = async () => {
            try {
                const { data } = await axios.get(`${BASE_URL}api/v1/tipo_movimiento?tipo=${tipoMovimiento}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDetallesMovimiento(data.data || []);
            } catch (error) {
                setErrorMessage(error.response?.data?.message || error.message || "Error al cargar tipos de movimientos.");
            }
        };
        if (show && tipoMovimiento) {
            fetchTiposMovimientos();
        }
    }, [tipoMovimiento]);

    const fetchUbicaciones = async (endpoint, setter) => {
        try {
            const { data } = await axios.get(`${BASE_URL}api/v1/${endpoint}?getAll=true&activo=true&cliente=${formData.cliente_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setter(data.data || []);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || "Error al cargar ubicaciones.");
        }
    };

    const fetchCuadrillas = async () => {
        try {
            const { data } = await axios.get(`${BASE_URL}api/v1/cuadrilla?getAll=true&activo=true&cliente=${formData.cliente_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCuadrillaOptions(data.data || []);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || "Error al cargar cuadrillas.");
        }
    };

    const cleanFormData = (data) => {

        const cleaned = {};

        Object.entries(data).forEach(([key, value]) => {
            // Ignorar nulos, undefined, strings vacíos o arrays vacíos
            if (value !== null && value !== "" && value !== undefined && !(Array.isArray(value) && value.length === 0)) {
                // IDs → enteros
                if (key.endsWith('_id')) {
                    cleaned[key] = parseInt(value, 10) || 0; // "" o null se convierten en 0
                }
                // cantidad → float con 2 decimales
                else if (key === 'cantidad') {
                    cleaned[key] = parseFloat(parseFloat(value).toFixed(2)) || 0;
                }
                // resto → dejar tal cual
                else {
                    cleaned[key] = value;
                }
            }
        });

        // Filtrar primero filas inválidas
        if (Array.isArray(cleaned.movimiento_detalle)) {
            cleaned.movimiento_detalle = cleaned.movimiento_detalle
                .filter(d => d.material_id && d.cantidad > 0); // eliminar filas vacías

            const sinSerie = [];
            const conSerie = [];

            cleaned.movimiento_detalle.forEach(d => {
                if (d.serie) {
                    conSerie.push(d); // cada serie es independiente
                } else {
                    sinSerie.push(d);
                }
            });

            // Función para agrupar los que no tienen serie
            const aggregateDetalle = (detalle) => {
                const map = {};
                detalle.forEach(d => {
                    if (!map[d.material_id]) {
                        map[d.material_id] = { ...d, cantidad: 0 };
                    }
                    map[d.material_id].cantidad += d.cantidad;
                });
                return Object.values(map);
            };

            // Combinar agregados + seriados
            const agregados = aggregateDetalle(sinSerie);

            cleaned.movimiento_detalle = [...agregados, ...conSerie];
        }

        return cleaned;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cleanedData = cleanFormData(formData);
            const { data: response } = await axios.post(`${BASE_URL}api/v1/movimiento`, cleanedData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({
                descripcion: "",
                reserva: "",
                desde_ubicacion_id: "",
                hacia_ubicacion_id: "",
                desde_cuadrilla_id: "",
                hacia_cuadrilla_id: "",
                tipo_movimiento_id: "",
                movimiento_detalle: [{ material_id: "", serie: "", cantidad: 0 }]
            });
            setTipoMovimiento("");
            setDetallesMovimiento([]);
            setOrigenOptions([]);
            setDestinoOptions([]);
            setCuadrillaOptions([]);
            setSuccessMessage(response.message || "Movimiento creado exitosamente.");
            onCreated();
        } catch (error) {
            const errData = error.response?.data;
            if (errData?.message?.startsWith("Stock insuficiente")) {
                setStockErrorDetails(errData.data || []);
                setShowStockErrorModal(true);
            } else {
                setErrorMessage(error.response?.data?.message || error.message || "Error inesperado.");
                onError();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDetalleChange = async (index, field, value) => {
        const updatedDetalle = [...formData.movimiento_detalle];

        if (field === "codigo") {
            updatedDetalle[index].codigo = value;

            if (value.trim() !== "") {
                try {
                    const { data } = await axios.get(`${BASE_URL}api/v1/material?activo=true&codigo=${value}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (data.data && data.data.length > 0) {
                        const material = data.data[0];
                        updatedDetalle[index].material_id = material.material_id;
                        updatedDetalle[index].descripcion = material.descripcion;
                        updatedDetalle[index].unidad = material.unidad_medida.simbolo;
                        updatedDetalle[index].serializado = material.serializado;
                        if (material.serializado) {
                            updatedDetalle[index].cantidad = 1;
                        }
                    } else {
                        updatedDetalle[index].material_id = null;
                        updatedDetalle[index].descripcion = "MATERIAL NO ENCONTRADO";
                        updatedDetalle[index].unidad = "S/D";
                        updatedDetalle[index].serializado = false;
                        updatedDetalle[index].serie = "";
                        updatedDetalle[index].cantidad = 0;
                    }
                } catch {
                    updatedDetalle[index].material_id = null;
                    updatedDetalle[index].descripcion = "ERROR AL BUSCAR";
                    updatedDetalle[index].unidad = "Error";
                }
            } else {
                updatedDetalle[index].material_id = null;
                updatedDetalle[index].descripcion = "";
                updatedDetalle[index].unidad = "";
                updatedDetalle[index].serializado = false;
                updatedDetalle[index].serie = "";
                updatedDetalle[index].cantidad = 0;
            }

            // Aagregamos una nueva línea si escribimos dentro del campo código en la última fila
            const isLast = index === updatedDetalle.length - 1;
            const hasInput = updatedDetalle[index].codigo?.trim() !== "";
            if (isLast && hasInput) {
                updatedDetalle.push({ material_id: "", serie: "", cantidad: 0 });
            }
        }

        if (field === "serie") {
            updatedDetalle[index].serie = value;
        }

        if (field === "cantidad") {
            if (value === "") {
                updatedDetalle[index].cantidad = "";
            } else {
                const floatVal = parseFloat(value);
                if (!isNaN(floatVal) && floatVal >= 0) {
                    updatedDetalle[index].cantidad = floatVal;
                }
            }
        }

        setFormData({ ...formData, movimiento_detalle: updatedDetalle });
    };

    const handleRemoveRow = (index) => {
        const updatedDetalle = [...formData.movimiento_detalle];
        if (updatedDetalle.length === 1) return;
        updatedDetalle.splice(index, 1);
        setFormData({ ...formData, movimiento_detalle: updatedDetalle });
    };

    // Habilitar boton enviar
    const isValidToSend = formData.movimiento_detalle.some((d) => d.material_id && Number(d.cantidad) > 0);

    return (
        <Modal show={show} size="7xl" onClose={onClose} popup>

            <AutoLoadDataModal
                show={isModalAutoDataOpen}
                token={token}
                setFormData={setFormData}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalAutoDataOpen(false);
                }}
                onLoaded={() => {
                    setIsModalAutoDataOpen(false);
                }}
                onError={() => {
                    setIsModalAutoDataOpen(false);
                    onError();
                }}
            />

            <SetMaterialModal
                show={isModalSetMaterialOpen}
                token={token}
                selectedIndex={selectedIndex}
                setFormData={setFormData}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setSelectedIndex("");
                    setIsModalSetMaterialOpen(false);
                }}
                onLoaded={() => {
                    setSelectedIndex("");
                    setIsModalSetMaterialOpen(false);
                }}
                onError={() => {
                    setSelectedIndex("");
                    setIsModalSetMaterialOpen(false);
                    onError();
                }}
            />

            <StockErrorMessage
                show={showStockErrorModal}
                onClose={() => setShowStockErrorModal(false)}
                items={stockErrorDetails}
            />

            <div className="p-4">
                <ModalHeader>Nuevo</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">

                            <div>
                                <Label htmlFor="cliente" value="Cliente" className="mb-2 block" />
                                <Select
                                    id="cliente"
                                    value={formData.cliente_id}
                                    onChange={(e) => {
                                        const clienteId = e.target.value;
                                        setFormData({
                                            ...formData,
                                            cliente_id: clienteId,
                                            descripcion: "",
                                            reserva: "",
                                            desde_ubicacion_id: "",
                                            hacia_ubicacion_id: "",
                                            desde_cuadrilla_id: "",
                                            hacia_cuadrilla_id: "",
                                            tipo_movimiento_id: "",
                                        });
                                        setTipoMovimiento("");
                                        setDetallesMovimiento([]);
                                        setOrigenOptions([]);
                                        setDestinoOptions([]);
                                        setCuadrillaOptions([]);
                                    }}
                                    className="select-md"
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {clientes.map((c) => (
                                        <option key={c.cliente_id} value={c.cliente_id}>
                                            {`${c.descripcion}`}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {formData.cliente_id && (
                                <div>
                                    <Label htmlFor="tipoMovimiento" value="Tipo de Movimiento" className="mb-2 block" />
                                    <Select
                                        id="tipoMovimiento"
                                        value={tipoMovimiento}
                                        className="select-md"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setTipoMovimiento(value);
                                            setFormData({
                                                ...formData,
                                                descripcion: "",
                                                reserva: "",
                                                desde_ubicacion_id: "",
                                                hacia_ubicacion_id: "",
                                                desde_cuadrilla_id: "",
                                                hacia_cuadrilla_id: "",
                                                tipo_movimiento_id: "",
                                            });
                                            if (value === "") {
                                                setDetallesMovimiento([]);
                                                setOrigenOptions([]);
                                                setDestinoOptions([]);
                                                setCuadrillaOptions([]);
                                            }
                                        }}
                                        required
                                    >
                                        <option value="">Seleccione</option>
                                        <option value="ENTRADA">ENTRADA</option>
                                        <option value="SALIDA">SALIDA</option>
                                        <option value="DEVOLUCION">DEVOLUCION</option>
                                    </Select>
                                </div>
                            )}

                            {detallesMovimiento.length > 0 && (
                                <div>
                                    <Label htmlFor="detalleMovimiento" value="Detalle de Movimiento" className="mb-2 block" />
                                    <Select
                                        id="detalleMovimiento"
                                        value={formData.tipo_movimiento_id}
                                        className="select-md"
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            setFormData({
                                                ...formData,
                                                descripcion: "",
                                                reserva: "",
                                                desde_ubicacion_id: "",
                                                hacia_ubicacion_id: "",
                                                desde_cuadrilla_id: "",
                                                hacia_cuadrilla_id: "",
                                                tipo_movimiento_id: selectedId,
                                            });
                                            if (selectedId === "") {
                                                setOrigenOptions([]);
                                                setDestinoOptions([]);
                                                setCuadrillaOptions([]);
                                                return;
                                            }

                                            const detalle = detallesMovimiento.find((d) => d.tipo_movimiento_id === Number(selectedId));

                                            if (detalle?.descripcion) {
                                                const regla = reglasOrigenDestino[detalle.descripcion];

                                                // Mostrar u ocultar selects según regla
                                                setMostrarCuadrillaOrigen(!!regla?.cuadrilla_origen);
                                                setMostrarCuadrillaDestino(!!regla?.cuadrilla_destino);
                                                setMostrarOrigen(!!regla?.origen);
                                                setMostrarDestino(!!regla?.destino);

                                                if (regla?.origen) fetchUbicaciones(regla.origen, setOrigenOptions);
                                                else setOrigenOptions([]);

                                                if (regla?.destino) fetchUbicaciones(regla.destino, setDestinoOptions);
                                                else setDestinoOptions([]);

                                                if (regla?.cuadrilla_origen || regla?.cuadrilla_destino) {
                                                    fetchCuadrillas();
                                                } else {
                                                    setCuadrillaOptions([]);
                                                }
                                            } else {
                                                setMostrarCuadrillaOrigen(false);
                                                setMostrarCuadrillaDestino(false);
                                                setMostrarOrigen(false);
                                                setMostrarDestino(false);
                                            }

                                        }}
                                        required
                                    >
                                        <option value="">Seleccione</option>
                                        {detallesMovimiento.map((detalle) => (
                                            <option key={detalle.tipo_movimiento_id} value={detalle.tipo_movimiento_id}>
                                                {detalle.descripcion}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            )}

                            {detallesMovimiento.length > 0 && (
                                <div>
                                    <Label htmlFor="reserva" value="Reserva" className="mb-2 block" />
                                    <TextInput
                                        id="reserva"
                                        type="text"
                                        value={formData.reserva}
                                        onChange={(e) => setFormData({ ...formData, reserva: e.target.value })}
                                        className="form-control form-rounded-xl"
                                    />
                                </div>
                            )}

                            {detallesMovimiento.length > 0 && (
                                <div>
                                    <Label htmlFor="descripcion" value="Descripción" className="mb-2 block" />
                                    <TextInput
                                        id="descripcion"
                                        type="text"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="form-control form-rounded-xl"
                                    />
                                </div>
                            )}

                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">

                            {formData.tipo_movimiento_id && mostrarOrigen && (
                                <div className="lg:col-span-2">
                                    <Label htmlFor="desde_ubicacion_id" value="Origen" className="mb-2 block" />
                                    <Select
                                        id="desde_ubicacion_id"
                                        value={formData.desde_ubicacion_id}
                                        onChange={(e) => setFormData({ ...formData, desde_ubicacion_id: e.target.value })}
                                        className="select-md"
                                        required
                                    >
                                        <option value="">Seleccione</option>
                                        {origenOptions.map((item) => (
                                            <option key={item.ubicacion.ubicacion_id} value={item.ubicacion.ubicacion_id}>
                                                {item.codigo} / {item.descripcion}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            )}

                            {formData.tipo_movimiento_id && mostrarDestino && (
                                <div className="lg:col-span-2">
                                    <Label htmlFor="hacia_ubicacion_id" value="Destino" className="mb-2 block" />
                                    <Select
                                        id="hacia_ubicacion_id"
                                        value={formData.hacia_ubicacion_id}
                                        onChange={(e) => setFormData({ ...formData, hacia_ubicacion_id: e.target.value })}
                                        className="select-md"
                                        required
                                    >
                                        <option value="">Seleccione</option>
                                        {destinoOptions.map((item) => (
                                            <option key={item.ubicacion.ubicacion_id} value={item.ubicacion.ubicacion_id}>
                                                {item.codigo} / {item.descripcion}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            )}

                            {formData.tipo_movimiento_id && mostrarCuadrillaOrigen && (
                                <div className="lg:col-span-2">
                                    <Label htmlFor="cuadrilla_origen" value="Cuadrilla Origen" className="mb-2 block" />
                                    <Select
                                        id="cuadrilla_origen"
                                        value={formData.desde_cuadrilla_id}
                                        onChange={(e) => setFormData({ ...formData, desde_cuadrilla_id: e.target.value })}
                                        className="select-md"
                                        required
                                    >
                                        <option value="">Seleccione</option>
                                        {cuadrillaOptions.map((c) => {
                                            return (
                                                <option key={c.cuadrilla_id} value={c.cuadrilla_id}>
                                                    {`${c.codigo} / ${c.descripcion}`}
                                                </option>
                                            );
                                        })}
                                    </Select>
                                </div>
                            )}

                            {formData.tipo_movimiento_id && mostrarCuadrillaDestino && (
                                <div className="lg:col-span-2">
                                    <Label htmlFor="cuadrilla_destino" value="Cuadrilla Destino" className="mb-2 block" />
                                    <Select
                                        id="cuadrilla_destino"
                                        value={formData.hacia_cuadrilla_id}
                                        onChange={(e) => setFormData({ ...formData, hacia_cuadrilla_id: e.target.value })}
                                        className="select-md"
                                        required
                                    >
                                        <option value="">Seleccione</option>
                                        {cuadrillaOptions.map((c) => {
                                            return (
                                                <option key={c.cuadrilla_id} value={c.cuadrilla_id}>
                                                    {`${c.codigo} / ${c.descripcion}`}
                                                </option>
                                            );
                                        })}
                                    </Select>
                                </div>
                            )}

                            <div className="flex items-center justify-between lg:col-span-4">
                                <p className="font-bold text-dark text-lg block">Materiales</p>
                                <div className="flex gap-3">
                                    <div
                                        className="flex items-center cursor-pointer"
                                        onClick={() => {
                                            setIsModalAutoDataOpen(true)
                                        }}
                                    >
                                        <Icon icon="solar:upload-outline" height={25} className="text-primary" />
                                    </div>
                                    <div
                                        className="flex items-center cursor-pointer"
                                        onClick={() => {
                                            setFormData({
                                                descripcion: "",
                                                reserva: "",
                                                desde_ubicacion_id: "",
                                                hacia_ubicacion_id: "",
                                                desde_cuadrilla_id: "",
                                                hacia_cuadrilla_id: "",
                                                tipo_movimiento_id: "",
                                                cliente_id: "",
                                                movimiento_detalle: [{ material_id: "", cantidad: 0 }]
                                            });
                                            setTipoMovimiento("");
                                            setDetallesMovimiento([]);
                                            setOrigenOptions([]);
                                            setDestinoOptions([]);
                                            setCuadrillaOptions([]);
                                        }}
                                    >
                                        <Icon icon="solar:trash-bin-minimalistic-2-outline" height={25} className="text-primary" />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <Table.Head className="border-b-0">
                                            <Table.HeadCell className="lg:w-1/12">#</Table.HeadCell>
                                            <Table.HeadCell className="lg:w-2/12">Código</Table.HeadCell>
                                            <Table.HeadCell className="lg:w-2/12">Serie</Table.HeadCell>
                                            <Table.HeadCell className="lg:w-5/12 hidden lg:table-cell">Descripción</Table.HeadCell>
                                            <Table.HeadCell className="lg:w-1/12">Cantidad</Table.HeadCell>
                                            <Table.HeadCell className="lg:w-1/12 hidden lg:table-cell">Unidad</Table.HeadCell>
                                        </Table.Head>
                                        <Table.Body>
                                            {formData.movimiento_detalle.map((detalle, index) => (
                                                <Table.Row key={index}>
                                                    <Table.Cell className="py-1">{index + 1}</Table.Cell>
                                                    <Table.Cell className="py-1 whitespace-nowrap">
                                                        <div className="relative">
                                                            <TextInput
                                                                type="text"
                                                                className="form-control form-rounded-xl"
                                                                value={detalle.codigo || ""}
                                                                onChange={(e) => handleDetalleChange(index, "codigo", e.target.value)}
                                                                tabIndex={1}
                                                            />
                                                            {!detalle.codigo && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedIndex(index);
                                                                        setIsModalSetMaterialOpen(true)
                                                                    }}
                                                                    disabled={loading}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-700"
                                                                >
                                                                    <FiSearch size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell className="py-1 whitespace-nowrap">
                                                        <TextInput
                                                            type="text"
                                                            className={`form-control form-rounded-xl ${detalle.serializado ? "" : "bg-gray-50"}`}
                                                            value={detalle.serie || ""}
                                                            readOnly={!detalle.serializado}
                                                            onChange={(e) => handleDetalleChange(index, "serie", e.target.value)}
                                                        />
                                                    </Table.Cell>
                                                    <Table.Cell className="py-1 whitespace-nowrap hidden lg:table-cell">
                                                        <TextInput
                                                            type="text"
                                                            className="form-control form-rounded-xl bg-gray-50"
                                                            value={detalle.descripcion || ""}
                                                            readOnly
                                                        />
                                                    </Table.Cell>
                                                    <Table.Cell className="py-1 whitespace-nowrap">
                                                        <TextInput
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            className={`form-control form-rounded-xl ${detalle.serializado ? "bg-gray-50" : ""}`}
                                                            value={detalle.cantidad !== undefined && detalle.cantidad !== null ? detalle.cantidad : ""}
                                                            onChange={(e) => handleDetalleChange(index, "cantidad", e.target.value)}
                                                            tabIndex={1}
                                                            readOnly={detalle.serializado}
                                                        />
                                                    </Table.Cell>
                                                    <Table.Cell className="py-1 whitespace-nowrap hidden lg:table-cell">
                                                        <TextInput
                                                            type="text"
                                                            className="form-control form-rounded-xl bg-gray-50"
                                                            value={detalle.unidad || ""}
                                                            readOnly
                                                        />
                                                    </Table.Cell>
                                                    <Table.Cell className="py-1 whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveRow(index)}
                                                            className="hover:text-gray-700 mt-2"
                                                        >
                                                            <Icon icon="solar:forbidden-circle-outline" height={18} />
                                                        </button>
                                                    </Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                </div>
                            </div>

                        </div>

                        <div className="flex gap-3 mt-10">
                            <Button className="w-24" type="submit" color="primary" isProcessing={loading} disabled={loading || !isValidToSend} >Enviar</Button>
                            <Button className="w-24" type="button" color="gray" onClick={onClose} disabled={loading}>Cancelar</Button>
                        </div>

                    </form>
                </ModalBody>
            </div>
        </Modal>
    );
};

export default CreateMovementModal;