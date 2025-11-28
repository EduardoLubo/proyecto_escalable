import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Select } from "flowbite-react";
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateConstructionModal = ({ show, token, setSuccessMessage, setErrorMessage, onClose, onCreated, onError }) => {

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        codigo: "",
        descripcion: "",
        cliente_id: "",
        pep: "",
        reserva: "",
        zona: ""
    });

    const [clientes, setClientes] = useState([]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: response } = await axios.post(`${BASE_URL}api/v1/obra`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({
                codigo: "",
                descripcion: "",
                cliente_id: "",
                pep: "",
                reserva: "",
                zona: ""
            });
            setSuccessMessage(response.message || "Obra creada exitosamente.");
            onCreated();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || "Error inesperado.");
            onError();
        } finally {
            setLoading(false);
        }
    };

    // Habilitar boton enviar
    const isValidToSend = !formData.codigo || !formData.descripcion || !formData.cliente_id;

    return (
        <Modal show={show} size="4xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Nuevo</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                            <div>
                                <Label htmlFor="codigoCreate" value="Código" className="mb-2 block" />
                                <TextInput
                                    id="codigoCreate"
                                    type="text"
                                    value={formData.codigo}
                                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                    required
                                    className="form-control form-rounded-xl"
                                />
                            </div>
                            <div>
                                <Label htmlFor="clienteCreate" value="Cliente" className="mb-2 block" />
                                <Select
                                    id="clienteCreate"
                                    value={formData.cliente_id}
                                    className="select-md"
                                    onChange={(e) =>
                                        setFormData({ ...formData, cliente_id: e.target.value })
                                    }
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {clientes.map((cliente) => (
                                        <option key={cliente.cliente_id} value={cliente.cliente_id}>
                                            {cliente.descripcion}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="pepCreate" value="Pep" className="mb-2 block" />
                                <TextInput
                                    id="pepCreate"
                                    type="text"
                                    value={formData.pep}
                                    onChange={(e) => setFormData({ ...formData, pep: e.target.value })}
                                    className="form-control form-rounded-xl"
                                />
                            </div>
                            <div>
                                <Label htmlFor="reservaCreate" value="Reserva" className="mb-2 block" />
                                <TextInput
                                    id="reservaCreate"
                                    type="text"
                                    value={formData.reserva}
                                    onChange={(e) => setFormData({ ...formData, reserva: e.target.value })}
                                    className="form-control form-rounded-xl"
                                />
                            </div>
                            <div>
                                <Label htmlFor="zonaCreate" value="Zona" className="mb-2 block" />
                                <TextInput
                                    id="zonaCreate"
                                    type="text"
                                    value={formData.zona}
                                    onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                                    className="form-control form-rounded-xl"
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <Label htmlFor="descripcionCreate" value="Descripción" className="mb-2 block" />
                                <TextInput
                                    id="descripcionCreate"
                                    type="text"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    required
                                    className="form-control form-rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <Button className="w-24" type="submit" color="primary" isProcessing={loading} disabled={loading || isValidToSend}>Enviar</Button>
                            <Button className="w-24" type="button" color="gray" onClick={onClose} disabled={loading}>Cancelar</Button>
                        </div>
                    </form>
                </ModalBody>
            </div>
        </Modal>
    );
};

export default CreateConstructionModal;