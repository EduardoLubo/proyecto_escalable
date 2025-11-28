import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Select } from "flowbite-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditCrewMemberModal = ({ show, onClose, member, token, onUpdated, onError, setSuccessMessage, setErrorMessage }) => {

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        activo: true,
        nombre: "",
        legajo: ""
    });

    useEffect(() => {
        if (member) {
            setFormData({
                activo: member.activo,
                nombre: member.nombre,
                legajo: member.legajo
            });
        }
    }, [member]);

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
            const { data: response } = await axios.put(`${BASE_URL}api/v1/personal_cuadrilla/${member.personal_cuadrilla_id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccessMessage(response.message || "Cuadrillero actualizado correctamente.");
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
            formData.nombre !== member.nombre ||
            formData.legajo !== member.legajo ||
            formData.activo !== member.activo
        );
    };

    if (!member) return null;

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
                            <Label htmlFor="legajoEdit" value="Legajo" className="mb-2 block" />
                            <TextInput
                                id="legajoEdit"
                                name="legajo"
                                type="text"
                                value={formData.legajo}
                                onChange={handleChange}
                                className="form-control form-rounded-xl"
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <Label htmlFor="nombreEdit" value="Nombre" className="mb-2 block" />
                            <TextInput
                                id="nombreEdit"
                                name="nombre"
                                type="text"
                                value={formData.nombre}
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

export default EditCrewMemberModal;