import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Select } from "flowbite-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditMaterialModal = ({ show, onClose, material, token, onUpdated, onError, setSuccessMessage, setErrorMessage }) => {

    const [loading, setLoading] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [formData, setFormData] = useState({
        activo: true,
        codigo: "",
        serializado: false,
        descripcion: "",
        unidad_medida_id: ""
    });

    const [unidadMedidas, setUnidadMedidas] = useState([]);

    useEffect(() => {
        if (material) {
            setFormData({
                activo: material.activo,
                codigo: material.codigo,
                serializado: material.serializado,
                descripcion: material.descripcion,
                unidad_medida_id: material.unidad_medida_id
            });
        }
    }, [material]);

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

        // Si está cambiando de serializado a no serializado, mostramos advertencia
        if (formData.serializado === false && material.serializado === true) {
            setShowWarning(true);
            return;
        }

        setLoading(true);
        try {
            const { data: response } = await axios.put(`${BASE_URL}api/v1/material/${material.material_id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccessMessage(response.message || "Material actualizado correctamente.");
            onUpdated();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || "Error inesperado.");
            onError();
        } finally {
            setLoading(false);
        }
    };

    const handleWarningCancel = () => {
        setShowWarning(false); // Cerrar la advertencia sin hacer el cambio
    };

    const hasChanges = () => {
        return (
            formData.codigo !== material.codigo ||
            formData.serializado !== material.serializado ||
            formData.descripcion !== material.descripcion ||
            formData.activo !== material.activo ||
            formData.unidad_medida_id !== material.unidad_medida_id
        );
    };

    if (!material) return null;

    return (
        <>
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
                                <Label htmlFor="unidadEdit" value="Unidad de medida" className="mb-2 block" />
                                <Select
                                    id="unidadEdit"
                                    name="unidad_medida_id"
                                    value={formData.unidad_medida_id || ""}
                                    className="select-md"
                                    onChange={handleChange}
                                >
                                    {/* Opción por defecto si no hay coincidencia */}
                                    {!unidadMedidas.some((u) => String(u.unidad_medida_id) === String(formData.unidad_medida_id)) && (
                                        <option value="">S/D</option>
                                    )}

                                    {unidadMedidas.map((unidad) => (
                                        <option key={unidad.unidad_medida_id} value={unidad.unidad_medida_id}>
                                            {unidad.simbolo} - {unidad.descripcion}
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
                                <Label htmlFor="serializadoEdit" value="Serializado" className="mb-2 block" />
                                <Select
                                    id="serializadoEdit"
                                    name="serializado"
                                    value={formData.serializado ? "true" : "false"}
                                    className="select-md"
                                    onChange={(e) => setFormData({ ...formData, serializado: e.target.value === "true" })}
                                >
                                    <option value="true">SI</option>
                                    <option value="false">NO</option>
                                </Select>
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

            {/* Modal de advertencia */}
            <Modal show={showWarning} size="md" onClose={handleWarningCancel} popup>
                <div className="p-4">
                    <ModalHeader>Atención</ModalHeader>
                    <ModalBody className="p-4">
                        <p className="text-center">No es posible cambiar el estado de serialización de este material a "no serializado" debido a que posee registros asociados en el sistema.</p>
                        <div className="flex justify-center gap-4 mt-8">
                            <Button className="w-24" color="failure" onClick={handleWarningCancel} disabled={loading}>Cerrar</Button>
                        </div>
                    </ModalBody>
                </div>
            </Modal>

        </>
    );
};

export default EditMaterialModal;