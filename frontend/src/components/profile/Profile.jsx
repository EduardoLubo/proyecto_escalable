import { useEffect, useState } from "react";
import AlertMessage from "../alerts/AlertMessage";
import { redirectIfNotAuthenticated } from "../protection/authRedirect";
import axios from 'axios';
import ChangePasswordModal from "./ChangePasswordModal";
import { Icon } from "@iconify/react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {

    const [user, setUser] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const usuarioId = userData ? JSON.parse(userData).usuario_id : null;

    // Cambiar contraseña
    const [isModalChangePasswordOpen, setIsModalChangePasswordOpen] = useState(false);

    useEffect(() => {

        const fetchUsuario = async () => {

            redirectIfNotAuthenticated();

            if (!userData || !token) return;

            try {
                const { data: response } = await axios.get(`${BASE_URL}api/v1/usuario/${usuarioId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = response.data;
                setUser(data);
            } catch (err) {
                setErrorMessage(
                    err.response?.data?.message || err.message || "Error de conexión con el servidor."
                );
            }
        };

        fetchUsuario();

    }, []);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    return (
        <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">

            {successMessage && <AlertMessage message={successMessage} type="success" />}
            {errorMessage && <AlertMessage message={errorMessage} type="failure" />}

            <ChangePasswordModal
                show={isModalChangePasswordOpen}
                user={user}
                token={token}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                onClose={() => {
                    setIsModalChangePasswordOpen(false);
                }}
                onUpdated={async () => {
                    setIsModalChangePasswordOpen(false);
                }}
                onError={() => {
                    setIsModalChangePasswordOpen(false);
                }}
            />

            <div className="mb-6">
                <h2 className="text-2xl">Mi cuenta</h2>
            </div>

            <div className="rounded-md p-6 space-y-6">
                <div className="pb-4 border-b border-gray-200">
                    <div>
                        <p className="font-bold text-dark mb-1">Nombre</p>
                        <p className="text-gray-500">{user?.nombre}</p>
                    </div>
                </div>

                <div className="pb-4 border-b border-gray-200">
                    <div>
                        <p className="font-bold text-dark mb-1">Legajo</p>
                        <p className="text-gray-500">{user?.legajo}</p>
                    </div>
                </div>

                <div>
                    <div>
                        <p className="font-bold text-dark mb-1">Email</p>
                        <p className="text-gray-500">{user?.email}</p>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <button className="text-gray-500 underline" onClick={() => setIsModalChangePasswordOpen(true)}>Cambiar contraseña</button>
            </div>

        </div >
    )
}

export default Profile