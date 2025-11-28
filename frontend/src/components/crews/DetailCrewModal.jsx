import { Modal, ModalHeader, ModalBody, Label, TextInput, Button, Table } from "flowbite-react";

const DetailCrewModal = ({ show, onClose, crew, onEdit }) => {

    if (!crew) return null;

    return (
        <Modal show={show} size="4xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Detalle</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                        <div>
                            <Label htmlFor="estadoDetail" value="Estado" className="mb-2 block" />
                            <TextInput
                                id="estadoDetail"
                                type="text"
                                value={crew.activo ? "ACTIVO" : "INACTIVO"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="codigoDetail" value="Código" className="mb-2 block" />
                            <TextInput
                                id="codigoDetail"
                                type="text"
                                value={crew.codigo}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="clienteDetail" value="Cliente" className="mb-2 block" />
                            <TextInput
                                id="clienteDetail"
                                type="text"
                                value={crew.cliente?.descripcion || "S/D"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <Label htmlFor="descripcionDetail" value="Descripción" className="mb-2 block" />
                            <TextInput
                                id="descripcionDetail"
                                type="text"
                                value={crew.descripcion}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <Label value="Personal de la cuadrilla" className="mb-3 block text-base text-gray-700" />
                            <div className="overflow-x-auto">
                                <Table hoverable>
                                    <Table.Head>
                                        <Table.HeadCell className="lg:w-1/2">Rol</Table.HeadCell>
                                        <Table.HeadCell className="lg:w-1/2">Nombre</Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body className="divide-y">
                                        {crew.cuadrilla_personal?.map((p) => (
                                            <Table.Row key={p.personal_cuadrilla?.personal_cuadrilla_id}>
                                                <Table.Cell>{p.rol}</Table.Cell>
                                                <Table.Cell>{p.personal_cuadrilla?.nombre || "S/D"}</Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        </div>
                    </div>

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

export default DetailCrewModal;