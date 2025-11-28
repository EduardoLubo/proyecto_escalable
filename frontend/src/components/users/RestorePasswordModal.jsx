import { Modal, ModalBody, ModalHeader, Button } from "flowbite-react";
import axios from "axios";
import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RestorePasswordModal = ({ show, onClose, user, onSend, onError, token, setSuccessMessage, setErrorMessage }) => {

    const [loading, setLoading] = useState(false);

    const handleSendInvitation = async () => {

        if (!user) return;

        setLoading(true);

        try {
            const { data: response } = await axios.post(`${BASE_URL}api/v1/usuario/${user.usuario_id}/restore`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccessMessage(response.message || "Contraseña restaurada correctamente.");
            onSend();
        } catch (err) {
            setErrorMessage(err.response?.data?.message || err.message || "No se pudo restaurar la contraseña.");
            onError();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} size="xl" onClose={onClose} popup>
            <ModalHeader />
            <ModalBody>
                <div className="text-center">
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        ¿Restaurar contraseña del usuario: {user?.nombre}?
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button className="w-24" color="primary" onClick={handleSendInvitation} isProcessing={loading} disabled={loading}>
                            Enviar
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

export default RestorePasswordModal;