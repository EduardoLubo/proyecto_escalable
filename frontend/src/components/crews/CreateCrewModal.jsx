import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateCrewModal = ({ show, token, setSuccessMessage, setErrorMessage, onClose, onCreated, onError }) => {

    const [loading, setLoading] = useState(false);
    const [cuadrilleros, setCuadrilleros] = useState([]);
    const [formData, setFormData] = useState({
        codigo: "",
        descripcion: "",
        cliente_id: "",
        cuadrilla_personal: [],
    });
    const [jefeId, setJefeId] = useState("");
    const [ayudantes, setAyudantes] = useState([""]);
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

    useEffect(() => {
        const fetchCuadrilleros = async () => {
            try {
                const { data } = await axios.get(`${BASE_URL}api/v1/personal_cuadrilla?getAll=true&activo=true`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCuadrilleros(data.data || []);
            } catch (error) {
                setErrorMessage(error.response?.data?.message || error.message || "Error al cargar cuadrilleros.");
            }
        };
        if (show) {
            fetchCuadrilleros();
        }
    }, [show]);

    const handleAddAyudante = () => {
        setAyudantes([...ayudantes, ""]);
    };

    const handleAyudanteChange = (index, value) => {
        const updated = [...ayudantes];
        updated[index] = value;
        setAyudantes(updated);
    };

    const handleRemoveAyudante = (index) => {
        if (ayudantes.length === 1) return;
        const updated = ayudantes.filter((_, i) => i !== index);
        setAyudantes(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cuadrilla_personal = [
            { rol: "JEFE DE CUADRILLA", personal_cuadrilla_id: parseInt(jefeId) },
            ...ayudantes
                .filter((a) => a)
                .map((a) => ({ rol: "AYUDANTE", personal_cuadrilla_id: parseInt(a) }))
        ];

        setLoading(true);

        try {
            const { data: response } = await axios.post(`${BASE_URL}api/v1/cuadrilla`, {
                codigo: formData.codigo,
                descripcion: formData.descripcion,
                cliente_id: formData.cliente_id,
                cuadrilla_personal
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({
                codigo: "",
                descripcion: "",
                cliente_id: "",
                cuadrilla_personal: []
            });
            setJefeId("");
            setAyudantes([""]);
            setSuccessMessage(response.message || "Cuadrilla creada exitosamente.");
            onCreated();
            onClose();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || "Error inesperado.");
            onError();
        } finally {
            setLoading(false);
        }
    };

    // Habilitar boton enviar
    const isValidToSend = !formData.codigo || !formData.descripcion || !formData.cliente_id || !jefeId;

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
                            <div className="lg:col-span-2">
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
                            <div className="lg:col-span-2">
                                <Label htmlFor="jefeCreate" value="Jefe de Cuadrilla" className="mb-2 block" />
                                <Select
                                    id="jefeCreate"
                                    value={jefeId}
                                    className="select-md"
                                    onChange={(e) => setJefeId(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {cuadrilleros.map((c) => (
                                        <option key={c.personal_cuadrilla_id} value={c.personal_cuadrilla_id}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div className="lg:col-span-2">
                                <div className="flex justify-between items-center mb-2">
                                    <Label value="Ayudantes" />
                                    <div className="flex gap-2">
                                        <div
                                            className="flex justify-center items-center cursor-pointer"
                                            onClick={handleAddAyudante}
                                        >
                                            <Icon icon="solar:user-plus-outline" height={25} className="text-primary" />
                                        </div>
                                        {ayudantes.length > 1 && (
                                            <div
                                                className="flex justify-center items-center cursor-pointer"
                                                onClick={() => handleRemoveAyudante(ayudantes.length - 1)} // O el index que corresponda
                                            >
                                                <Icon icon="solar:minus-circle-outline" height={25} className="text-primary" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {ayudantes.map((a, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <Select
                                            className="select-md flex-1"
                                            value={a}
                                            onChange={(e) => handleAyudanteChange(index, e.target.value)}
                                        >
                                            <option value="">Seleccione</option>
                                            {cuadrilleros.map((c) => (
                                                <option key={c.personal_cuadrilla_id} value={c.personal_cuadrilla_id}>
                                                    {c.nombre}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                ))}
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

export default CreateCrewModal;
