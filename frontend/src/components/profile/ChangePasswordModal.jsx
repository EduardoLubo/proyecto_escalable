import { Modal, ModalHeader, ModalBody, Label, TextInput, Button } from "flowbite-react";
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChangePasswordModal = ({ show, token, user, setSuccessMessage, setErrorMessage, onClose, onUpdated, onError }) => {

    const [password, setPassword] = useState("");
    const [repassword, setRePassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!show) {
            setPassword("");
            setRePassword("");
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== repassword) {
            setPassword("");
            setRePassword("");
            onError();
            setErrorMessage("Las contraseñas no coinciden.");
            return;
        }
        setLoading(true);
        const body = {
            nombre: user.nombre,
            legajo: user.legajo,
            email: user.email,
            pass: password,
        };
        try {
            const { data: response } = await axios.put(
                `${BASE_URL}api/v1/usuario/${user.usuario_id}`,
                body,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setPassword("");
            setRePassword("");
            onUpdated();
            setSuccessMessage(response.message || "Cuenta actualizada correctamente.");
        } catch (error) {
            setPassword("");
            setRePassword("");
            onError();
            setErrorMessage(error.response?.data?.message || error.message || "Error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    // Habilitar boton enviar
    const isValidToSend = !password || !repassword;

    return (
        <Modal show={show} size="2xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Cambiar contraseña</ModalHeader>
                <ModalBody>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                            <div>
                                <Label htmlFor="password" value="Nueva contraseña" className="mb-2 block" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="form-control form-rounded-xl"
                                />
                            </div>
                            <div>
                                <Label htmlFor="repassword" value="Confirmar contraseña" className="mb-2 block" />
                                <TextInput
                                    id="repassword"
                                    type="password"
                                    value={repassword}
                                    onChange={(e) => setRePassword(e.target.value)}
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

export default ChangePasswordModal;