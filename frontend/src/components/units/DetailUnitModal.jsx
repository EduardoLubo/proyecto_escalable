import { Modal, ModalHeader, ModalBody, Label, TextInput, Button } from "flowbite-react";

const DetailUnitModal = ({ show, onClose, unit, onEdit }) => {

    if (!unit) return null;

    return (
        <Modal show={show} size="4xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Detalle</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        <div>
                            <Label htmlFor="simboloDetail" value="Símbolo" className="mb-2 block" />
                            <TextInput
                                id="simboloDetail"
                                type="text"
                                value={unit.simbolo}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="descripcionDetail" value="Descripción" className="mb-2 block" />
                            <TextInput
                                id="descripcionDetail"
                                type="text"
                                value={unit.descripcion}
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

export default DetailUnitModal;