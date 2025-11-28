import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Select } from "flowbite-react";
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateMaterialModal = ({ show, token, setSuccessMessage, setErrorMessage, onClose, onCreated, onError }) => {

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        codigo: "",
        serializado: false,
        descripcion: "",
        unidad_medida_id: ""
    });

    const [unidadMedidas, setUnidadMedidas] = useState([]);

    useEffect(() => {
        const fetchUnidades = async () => {
            try {
                const { data } = await axios.get(`${BASE_URL}api/v1/unidad_medida?getAll=true`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUnidadMedidas(data.data || []);
            } catch (error) {
                setErrorMessage(error.response?.data?.message || error.message || "Error al cargar unidades.");
            }
        };
        if (show) {
            fetchUnidades();
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: response } = await axios.post(`${BASE_URL}api/v1/material`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({
                codigo: "",
                serializado: false,
                descripcion: "",
                unidad_medida_id: ""
            });
            setSuccessMessage(response.message || "Material creado exitosamente.");
            onCreated();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || "Error inesperado.");
            onError();
        } finally {
            setLoading(false);
        }
    };

    // Habilitar boton enviar
    const isValidToSend = !formData.codigo || !formData.descripcion || !formData.unidad_medida_id;

    return (
        <Modal show={show} size="4xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Nuevo</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
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
                                <Label htmlFor="serializadoCreate" value="Serializado" className="mb-2 block" />
                                <Select
                                    id="serializadoCreate"
                                    value={formData.serializado ? "true" : "false"}
                                    className="select-md"
                                    onChange={(e) =>
                                        setFormData({ ...formData, serializado: e.target.value === "true" })
                                    }
                                    required
                                >
                                    <option value="false">NO</option>
                                    <option value="true">SI</option>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="unidadCreate" value="Unidad de medida" className="mb-2 block" />
                                <Select
                                    id="unidadCreate"
                                    value={formData.unidad_medida_id}
                                    className="select-md"
                                    onChange={(e) =>
                                        setFormData({ ...formData, unidad_medida_id: e.target.value })
                                    }
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {unidadMedidas.map((unidad) => (
                                        <option key={unidad.unidad_medida_id} value={unidad.unidad_medida_id}>
                                            {unidad.simbolo} - {unidad.descripcion}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div className="lg:col-span-3">
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

export default CreateMaterialModal;