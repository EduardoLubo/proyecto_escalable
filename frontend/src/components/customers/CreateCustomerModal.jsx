import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Select } from "flowbite-react";
import { useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateCustomerModal = ({ show, token, setSuccessMessage, setErrorMessage, onClose, onCreated, onError }) => {

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        codigo: "",
        descripcion: "",
        operativo: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: response } = await axios.post(`${BASE_URL}api/v1/cliente`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFormData({
                codigo: "",
                descripcion: "",
                operativo: false
            });
            setSuccessMessage(response.message || "Cliente creado exitosamente.");
            onCreated();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || "Error inesperado.");
            onError();
        } finally {
            setLoading(false);
        }
    };

    // Habilitar boton enviar
    const isValidToSend = !formData.codigo || !formData.descripcion;

    return (
        <Modal show={show} size="2xl" onClose={onClose} popup>
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
                                <Label htmlFor="operativoCreate" value="Operativo PSM" className="mb-2 block" />
                                <Select
                                    id="operativoCreate"
                                    value={formData.operativo ? "true" : "false"}
                                    className="select-md"
                                    onChange={(e) =>
                                        setFormData({ ...formData, operativo: e.target.value === "true" })
                                    }
                                    required
                                >
                                    <option value="false">NO</option>
                                    <option value="true">SI</option>
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

export default CreateCustomerModal;