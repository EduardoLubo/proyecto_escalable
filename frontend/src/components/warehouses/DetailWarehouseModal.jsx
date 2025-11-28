import { Modal, ModalHeader, ModalBody, Label, TextInput, Button } from "flowbite-react";

const DetailWarehouseModal = ({ show, onClose, warehouse, onEdit }) => {

    if (!warehouse) return null;

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
                                value={warehouse.activo ? "ACTIVO" : "INACTIVO"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="codigoDetail" value="Código" className="mb-2 block" />
                            <TextInput
                                id="codigoDetail"
                                type="text"
                                value={warehouse.codigo}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="clienteDetail" value="Cliente" className="mb-2 block" />
                            <TextInput
                                id="clienteDetail"
                                type="text"
                                value={warehouse.cliente?.descripcion || "S/D"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div className="lg:col-span-3">
                            <Label htmlFor="descripcionDetail" value="Descripción" className="mb-2 block" />
                            <TextInput
                                id="descripcionDetail"
                                type="text"
                                value={warehouse.descripcion}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
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

export default DetailWarehouseModal;