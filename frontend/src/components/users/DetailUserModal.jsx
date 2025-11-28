import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Table } from "flowbite-react";

const DetailUserModal = ({ show, onClose, user, onEdit }) => {

    if (!user) return null;

    return (
        <Modal show={show} size="4xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Detalle</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        <div>
                            <Label htmlFor="estadoDetail" value="Estado" className="mb-2 block" />
                            <TextInput
                                id="estadoDetail"
                                type="text"
                                value={user.activo ? "ACTIVO" : "INACTIVO"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="rolDetail" value="Rol" className="mb-2 block" />
                            <TextInput
                                id="rolDetail"
                                type="text"
                                value={user.tipo_usuario.tipo}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="nombreDetail" value="Nombre" className="mb-2 block" />
                            <TextInput
                                id="nombreDetail"
                                type="text"
                                value={user.nombre}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="legajoDetail" value="Legajo" className="mb-2 block" />
                            <TextInput
                                id="legajoDetail"
                                type="text"
                                value={user.legajo}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <Label htmlFor="emailDetail" value="Email" className="mb-2 block" />
                            <TextInput
                                id="emailDetail"
                                type="text"
                                value={user.email}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                    </div>
                    {user.tipo_usuario.tipo === "USUARIO" && (
                        <div className="mt-6">
                            {user.clientes.length > 0 ? (
                                <>
                                    <Label value="Clientes habilitados" className="mb-3 block text-base text-gray-700" />
                                    <div className="overflow-x-auto">
                                        <Table hoverable>
                                            <Table.Head>
                                                <Table.HeadCell className="lg:w-1/2">Código</Table.HeadCell>
                                                <Table.HeadCell className="lg:w-1/2">Descripción</Table.HeadCell>
                                            </Table.Head>
                                            <Table.Body className="divide-y">
                                                {user.clientes.map((u) => (
                                                    <Table.Row key={u.usuario_cliente_id}>
                                                        <Table.Cell>{u.cliente.codigo}</Table.Cell>
                                                        <Table.Cell>{u.cliente.descripcion}</Table.Cell>
                                                    </Table.Row>
                                                ))}
                                            </Table.Body>
                                        </Table>
                                    </div>
                                </>
                            ) : (
                                <Label value="Sin clientes habilitados" className="mb-3 block text-base text-gray-700" />
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 mt-8">
                        <Button className="w-24" color="primary" onClick={onEdit}>
                            Editar
                        </Button>
                        <Button className="w-24" color="gray" onClick={onClose}>
                            Cerrar
                        </Button>
                    </div>
                </ModalBody>
            </div>
        </Modal>
    );
};

export default DetailUserModal;