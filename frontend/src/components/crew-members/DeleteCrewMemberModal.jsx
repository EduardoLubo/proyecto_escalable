import { Modal, ModalBody, ModalHeader, Button } from "flowbite-react";
import axios from "axios";
import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DeleteCrewMemberModal = ({ show, onClose, member, onDeleted, onError, token, setSuccessMessage, setErrorMessage }) => {

    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!member) return;
        setLoading(true);
        try {
            const { data: response } = await axios.delete(`${BASE_URL}api/v1/personal_cuadrilla/${member.personal_cuadrilla_id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccessMessage(response.message || "Cuadrillero eliminado correctamente.");
            onDeleted();
        } catch (err) {
            setErrorMessage(err.response?.data?.message || err.message || "No se pudo eliminar el cuadrillero.");
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
                        ¿Eliminar el cuadrillero: {member?.legajo}?
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

export default DeleteCrewMemberModal;