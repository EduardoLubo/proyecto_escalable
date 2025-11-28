import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Select, Table, Checkbox } from "flowbite-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditUserModal = ({ show, onClose, user, token, onUpdated, onError, setSuccessMessage, setErrorMessage }) => {

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        activo: true,
        nombre: "",
        email: "",
        legajo: "",
        tipo_usuario_id: ""
    });

    const [selectedClientes, setSelectedClientes] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [tiposUsuarios, setTiposUsuarios] = useState([]);

    // Cargar datos del usuario
    useEffect(() => {
        if (user) {
            setFormData({
                activo: user.activo,
                nombre: user.nombre,
                email: user.email,
                legajo: user.legajo,
                tipo_usuario_id: user.tipo_usuario_id
            });
            // Mapear los clientes habilitados
            setSelectedClientes(user.clientes?.map(c => c.cliente.cliente_id) || []);
        }
    }, [user]);

    // Cargar tipos de usuarios
    useEffect(() => {
        if (!show) return;
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
        fetchTiposUsuarios();
    }, [show]);

    // Cargar clientes
    useEffect(() => {
        if (!show) return;
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
        fetchClientes();
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleCliente = (clienteId, checked) => {
        setSelectedClientes(prev =>
            checked ? [...prev, clienteId] : prev.filter(id => id !== clienteId)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                clientes: selectedClientes
            };
            const { data: response } = await axios.put(`${BASE_URL}api/v1/usuario/${user.usuario_id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccessMessage(response.message || "Usuario actualizado correctamente.");
            onUpdated();
        } catch (error) {
            setErrorMessage(error.response?.data?.message || error.message || "Error inesperado.");
            onError();
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        if (!user) return false;
        return (
            formData.activo !== user.activo ||
            formData.nombre !== user.nombre ||
            formData.email !== user.email ||
            formData.legajo !== user.legajo ||
            formData.tipo_usuario_id !== user.tipo_usuario_id ||
            JSON.stringify(selectedClientes.sort()) !== JSON.stringify(user.clientes?.map(c => c.cliente_id).sort() || [])
        );
    };

    const selectedTipo = tiposUsuarios.find(t => String(t.tipo_usuario_id) === String(formData.tipo_usuario_id));

    if (!user) return null;

    return (
        <Modal show={show} size="4xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Editar Usuario</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
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
                                <Label htmlFor="tipoEdit" value="Rol" className="mb-2 block" />
                                <Select
                                    id="tipoEdit"
                                    name="tipo_usuario_id"
                                    value={formData.tipo_usuario_id}
                                    className="select-md"
                                    onChange={handleChange}
                                >
                                    {tiposUsuarios.map((item) => (
                                        <option key={item.tipo_usuario_id} value={item.tipo_usuario_id}>
                                            {item.tipo}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
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
                                <Label htmlFor="emailEdit" value="Email" className="mb-2 block" />
                                <TextInput
                                    id="emailEdit"
                                    name="email"
                                    type="text"
                                    value={formData.email}
                                    onChange={handleChange}
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
                            <Button className="w-24" type="submit" color="primary" isProcessing={loading} disabled={loading || !hasChanges()}>Guardar</Button>
                            <Button className="w-24" color="gray" onClick={onClose} disabled={loading}>Cancelar</Button>
                        </div>
                    </form>
                </ModalBody>
            </div>
        </Modal>
    );
};

export default EditUserModal;