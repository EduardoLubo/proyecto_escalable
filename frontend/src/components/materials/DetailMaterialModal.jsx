import { Modal, ModalHeader, ModalBody, Label, TextInput, Button } from "flowbite-react";

const DetailMaterialModal = ({ show, onClose, material, onEdit }) => {

    if (!material) return null;

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
                                value={material.activo ? "ACTIVO" : "INACTIVO"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="unidadDetail" value="Unidad de medida" className="mb-2 block" />
                            <TextInput
                                id="unidadDetail"
                                type="text"
                                value={material.unidad_medida ? `${material.unidad_medida.simbolo} - ${material.unidad_medida.descripcion}` : "S/D"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="codigoDetail" value="Código" className="mb-2 block" />
                            <TextInput
                                id="codigoDetail"
                                type="text"
                                value={material.codigo}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div>
                            <Label htmlFor="serializadoDetail" value="Serializado" className="mb-2 block" />
                            <TextInput
                                id="serializadoDetail"
                                type="text"
                                value={material.serializado ? "SI" : "NO"}
                                readOnly
                                className="form-control form-rounded-xl bg-gray-50 rounded-md"
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <Label htmlFor="descripcion" value="Descripción" className="mb-2 block" />
                            <TextInput
                                id="descripcionDetail"
                                type="text"
                                value={material.descripcion}
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

export default DetailMaterialModal;