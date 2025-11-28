import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Select } from "flowbite-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditConstructionModal = ({ show, onClose, construction, token, onUpdated, onError, setSuccessMessage, setErrorMessage }) => {

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        activo: true,
        codigo: "",
        descripcion: "",
        cliente_id: "",
        pep: "",
        reserva: "",
        zona: ""
    });

    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        if (construction) {
            setFormData({
                activo: construction.activo,
                codigo: construction.codigo,
                descripcion: construction.descripcion,
                cliente_id: construction.cliente_id,
                pep: construction.pep,
                reserva: construction.reserva,
                zona: construction.zona
            });
        }
    }, [construction]);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const { data } = await axios.get(`${BASE_URL}api/v1/cliente?getAll=true`, {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!hasChanges()) {
            setErrorMessage("No se detectaron cambios.");
            onError();
            return;
        }
        setLoading(true);
        try {
            const { data: response } = await axios.put(`${BASE_URL}api/v1/obra/${construction.obra_id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccessMessage(response.message || "Obra actualizada correctamente.");
            onUpdated();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || "Error inesperado.");
            onError();
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        return (
            formData.codigo !== construction.codigo ||
            formData.descripcion !== construction.descripcion ||
            formData.activo !== construction.activo ||
            formData.cliente_id !== construction.cliente_id ||
            formData.pep !== construction.pep ||
            formData.reserva !== construction.reserva ||
            formData.zona !== construction.zona
        );
    };

    if (!construction) return null;

    return (
        <Modal show={show} size="4xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Editar</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        <div>
                            <Label htmlFor="activoEdit" value="Estado" className="mb-2 block" />
                            <Select
                                id="activoEdit"
                                name="activo"
                                value={formData.activo ? "true" : "false"}
                                className="select-md"
                                onChange={(e) => setFormData({ ...formData, activo: e.target.value === "true" })}
                            >
                                <option value="true">ACTIVO</option>
                                <option value="false">INACTIVO</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="clienteEdit" value="Cliente" className="mb-2 block" />
                            <Select
                                id="clienteEdit"
                                name="cliente_id"
                                value={formData.cliente_id || ""}
                                className="select-md"
                                onChange={handleChange}
                            >
                                {/* Opción por defecto si no hay coincidencia */}
                                {!clientes.some((c) => String(c.cliente_id) === String(formData.cliente_id)) && (
                                    <option value="">S/D</option>
                                )}

                                {clientes.map((cliente) => (
                                    <option key={cliente.cliente_id} value={cliente.cliente_id}>
                                        {cliente.descripcion}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="codigoEdit" value="Código" className="mb-2 block" />
                            <TextInput
                                id="codigoEdit"
                                name="codigo"
                                type="text"
                                value={formData.codigo}
                                onChange={handleChange}
                                className="form-control form-rounded-xl"
                            />
                        </div>
                        <div>
                            <Label htmlFor="pepEdit" value="Pep" className="mb-2 block" />
                            <TextInput
                                id="pepEdit"
                                name="pep"
                                type="text"
                                value={formData.pep}
                                onChange={handleChange}
                                className="form-control form-rounded-xl"
                            />
                        </div>
                        <div>
                            <Label htmlFor="reservaEdit" value="Reserva" className="mb-2 block" />
                            <TextInput
                                id="reservaEdit"
                                name="reserva"
                                type="text"
                                value={formData.reserva}
                                onChange={handleChange}
                                className="form-control form-rounded-xl"
                            />
                        </div>
                        <div>
                            <Label htmlFor="zonaEdit" value="Zona" className="mb-2 block" />
                            <TextInput
                                id="zonaEdit"
                                name="zona"
                                type="text"
                                value={formData.zona}
                                onChange={handleChange}
                                className="form-control form-rounded-xl"
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <Label htmlFor="descripcionEdit" value="Descripción" className="mb-2 block" />
                            <TextInput
                                id="descripcionEdit"
                                name="descripcion"
                                type="text"
                                value={formData.descripcion}
                                onChange={handleChange}
                                className="form-control form-rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-8">
                        <Button className="w-24" color="primary" onClick={handleSubmit} isProcessing={loading} disabled={loading}>Guardar</Button>
                        <Button className="w-24" color="gray" onClick={onClose} disabled={loading}>Cancelar</Button>
                    </div>
                </ModalBody>
            </div>
        </Modal>
    );
};

export default EditConstructionModal;