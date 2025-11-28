import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Select } from "flowbite-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditWarehouseModal = ({ show, onClose, warehouse, token, onUpdated, onError, setSuccessMessage, setErrorMessage }) => {

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        activo: true,
        codigo: "",
        descripcion: "",
        cliente_id: "",
    });

    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        if (warehouse) {
            setFormData({
                activo: warehouse.activo,
                codigo: warehouse.codigo,
                descripcion: warehouse.descripcion,
                cliente_id: warehouse.cliente_id,
            });
        }
    }, [warehouse]);

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
            const { data: response } = await axios.put(`${BASE_URL}api/v1/deposito/${warehouse.deposito_id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccessMessage(response.message || "Deposito actualizado correctamente.");
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
            formData.codigo !== warehouse.codigo ||
            formData.descripcion !== warehouse.descripcion ||
            formData.activo !== warehouse.activo ||
            formData.cliente_id !== warehouse.cliente_id
        );
    };

    if (!warehouse) return null;

    return (
        <Modal show={show} size="4xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Editar</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
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
                        <div className="lg:col-span-3">
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

export default EditWarehouseModal;