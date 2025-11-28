import { Modal, ModalBody, ModalHeader, Button } from "flowbite-react";
import axios from "axios";
import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DeleteUnitModal = ({ show, onClose, unit, onDeleted, onError, token, setSuccessMessage, setErrorMessage }) => {

    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!unit) return;
        setLoading(true);
        try {
            const { data: response } = await axios.delete(`${BASE_URL}api/v1/unidad_medida/${unit.unidad_medida_id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccessMessage(response.message || "Unidad de medida eliminada correctamente.");
            onDeleted();
        } catch (err) {
            setErrorMessage(err.response?.data?.message || err.message || "No se pudo eliminar la unidad de medida.");
            onError();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} size="md" onClose={onClose} popup>
            <ModalHeader />
            <ModalBody>
                <div className="text-center">
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        ¿Eliminar unidad de medida: {unit?.descripcion}?
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button className="w-24" color="failure" onClick={handleDelete} isProcessing={loading} disabled={loading}>
                            Eliminar
                        </Button>
                        <Button className="w-24" color="gray" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default DeleteUnitModal;