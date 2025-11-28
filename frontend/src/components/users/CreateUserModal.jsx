import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Select, Table, Checkbox } from "flowbite-react";
import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateUserModal = ({ show, token, setSuccessMessage, setErrorMessage, onClose, onCreated, onError }) => {

    const [loading, setLoading] = useState(false);
    const [userForm, setUserForm] = useState({
        nombre: "",
        email: "",
        legajo: "",
        tipo_usuario_id: ""
    });
    const [selectedClientes, setSelectedClientes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [tiposUsuarios, setTiposUsuarios] = useState([]);

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
        const fetchTiposUsuarios = async () => {
            try {
                const { data } = await axios.get(`${BASE_URL}api/v1/tipo_usuario`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTiposUsuarios(data.data || []);
            } catch (error) {
                setErrorMessage(error.response?.data?.message || error.message || "Error al cargar tipos de usuario.");
            }
        };
        if (show) {
            fetchTiposUsuarios();
        }
    }, [show]);

    // Manejar checkboxes
    const handleToggleCliente = (clienteId, checked) => {
        setSelectedClientes((prev) =>
            checked ? [...prev, clienteId] : prev.filter((id) => id !== clienteId)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...userForm,
                clientes: selectedClientes,
            };
            const { data: response } = await axios.post(`${BASE_URL}api/v1/usuario`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserForm({
                nombre: "",
                email: "",
                legajo: "",
                tipo_usuario_id: ""
            });
            setSelectedClientes([]);
            setSuccessMessage(response.message || "Usuario creado exitosamente.");
            onCreated();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || "Error inesperado.");
            onError();
        } finally {
            setLoading(false);
        }
    };

    // Habilitar boton enviar
    const isValidToSend = !userForm.nombre || !userForm.email || !userForm.legajo || !userForm.tipo_usuario_id;

    // Habilitar tabla de clientes
    const selectedTipo = tiposUsuarios.find(
        (t) => String(t.tipo_usuario_id) === String(userForm.tipo_usuario_id)
    );

    return (
        <Modal show={show} size="4xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Nuevo</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                            <div>
                                <Label htmlFor="legajoCreate" value="Legajo" className="mb-2 block" />
                                <TextInput
                                    id="legajoCreate"
                                    type="text"
                                    value={userForm.legajo}
                                    onChange={(e) => setUserForm({ ...userForm, legajo: e.target.value })}
                                    required
                                    className="form-control form-rounded-xl"
                                />
                            </div>
                            <div>
                                <Label htmlFor="tipoCreate" value="Rol" className="mb-2 block" />
                                <Select
                                    id="tipoCreate"
                                    value={userForm.tipo_usuario_id}
                                    className="select-md"
                                    onChange={(e) =>
                                        setUserForm({ ...userForm, tipo_usuario_id: e.target.value })
                                    }
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    {tiposUsuarios.map((item) => (
                                        <option key={item.tipo_usuario_id} value={item.tipo_usuario_id}>
                                            {item.tipo}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div className="lg:col-span-2">
                                <Label htmlFor="nombreCreate" value="Nombre" className="mb-2 block" />
                                <TextInput
                                    id="nombreCreate"
                                    type="text"
                                    value={userForm.nombre}
                                    onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                                    required
                                    className="form-control form-rounded-xl"
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <Label htmlFor="emailCreate" value="Email" className="mb-2 block" />
                                <TextInput
                                    id="emailCreate"
                                    type="text"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    required
                                    className="form-control form-rounded-xl"
                                />
                            </div>
                        </div>

                        {selectedTipo?.tipo === "USUARIO" && (
                            <div className="mt-6">
                                {clientes.length > 0 ? (
                                    <>
                                        <Label value="Clientes disponibles" className="mb-3 block text-base text-gray-700" />
                                        <div className="overflow-x-auto">
                                            <Table hoverable>
                                                <Table.Head>
                                                    <Table.HeadCell className="lg:w-1/2">Código</Table.HeadCell>
                                                    <Table.HeadCell className="lg:w-1/2">Descripción</Table.HeadCell>
                                                </Table.Head>
                                                <Table.Body className="divide-y">
                                                    {clientes.map((cliente) => (
                                                        <Table.Row key={cliente.cliente_id}>
                                                            <Table.Cell>{cliente.codigo}</Table.Cell>
                                                            <Table.Cell>{cliente.descripcion}</Table.Cell>
                                                            <Table.Cell>
                                                                <Checkbox
                                                                    checked={selectedClientes.includes(cliente.cliente_id)}
                                                                    onChange={(e) => handleToggleCliente(cliente.cliente_id, e.target.checked)}
                                                                />
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table>
                                        </div>
                                    </>
                                ) : (
                                    <Label value="No hay clientes disponibles" className="mb-3 block text-base text-gray-700" />
                                )}
                            </div>
                        )}

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

export default CreateUserModal;