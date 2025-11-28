import { useState } from "react";
import { Modal, ModalHeader, ModalBody, Button, Table } from "flowbite-react";
import { Icon } from "@iconify/react";
import { handleOpenPDF } from "../../utils/movementPdfPrint";

const DetailMovementModal = ({ show, movement, onClose, onError, setErrorMessage, getUbicacionDescripcion, formatFechaHora }) => {

    const [loading, setLoading] = useState(false);

    const handlePDFMovement = async () => {
        try {
            setLoading(true);
            await handleOpenPDF({ movement, formatFechaHora, getUbicacionDescripcion });
        } catch (err) {
            setErrorMessage("Error al generar PDF");
            onError();
        } finally {
            setLoading(false);
        }
    };

    if (!movement) return null;

    return (
        <Modal show={show} size="7xl" onClose={onClose} popup>
            <div className="p-4">
                <ModalHeader>Remito #{movement.movimiento_id}</ModalHeader>
                <ModalBody className="max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
                        <div className="border-b border-gray-200">
                            <p className="font-bold text-dark mb-2 block">Fecha</p>
                            <p className="text-gray-500 tabular-nums">{formatFechaHora(movement.auditoria_alta)}</p>
                        </div>
                        <div className="border-b border-gray-200">
                            <p className="font-bold text-dark mb-2 block">Usuario</p>
                            <p className="text-gray-500 ">{movement.usuario.nombre}</p>
                        </div>
                        <div className="border-b border-gray-200">
                            <p className="font-bold text-dark mb-2 block">Cliente</p>
                            <p className="text-gray-500">{movement.cliente ? `${movement.cliente.descripcion}` : "S/D"}</p>
                        </div>
                        <div className="border-b border-gray-200">
                            <p className="font-bold text-dark mb-2 block">Tipo de Movimiento</p>
                            <p className="text-gray-500 ">{movement.tipo_movimiento.descripcion}</p>
                        </div>
                        <div className="border-b border-gray-200">
                            <p className="font-bold text-dark mb-2 block">Origen</p>
                            <p className="text-gray-500 ">{getUbicacionDescripcion(movement.desde_ubicacion) || "S/D"}</p>
                        </div>
                        <div className="border-b border-gray-200">
                            <p className="font-bold text-dark mb-2 block">Destino</p>
                            <p className="text-gray-500 ">{getUbicacionDescripcion(movement.hacia_ubicacion) || "S/D"}</p>
                        </div>
                        <div className="border-b border-gray-200">
                            <p className="font-bold text-dark mb-2 block">Reserva</p>
                            <p className="text-gray-500 ">{movement.reserva || "S/D"}</p>
                        </div>
                        <div className="border-b border-gray-200">
                            <p className="font-bold text-dark mb-2 block">Descripción</p>
                            <p className="text-gray-500 ">{movement.descripcion || "S/D"}</p>
                        </div>

                        {movement.desde_cuadrilla && (
                            <>
                                <div className="border-b border-gray-200 lg:col-span-2">
                                    <p className="font-bold text-dark mb-2 block">Cuadrilla Origen</p>
                                    <p className="text-gray-500">{movement.desde_cuadrilla ? `${movement.desde_cuadrilla.codigo} / ${movement.desde_cuadrilla.descripcion}` : "S/D"}</p>
                                </div>
                            </>
                        )}

                        {movement.hacia_cuadrilla && (
                            <>
                                <div className="border-b border-gray-200 lg:col-span-2">
                                    <p className="font-bold text-dark mb-2 block">Cuadrilla Destino</p>
                                    <p className="text-gray-500">{movement.hacia_cuadrilla ? `${movement.hacia_cuadrilla.codigo} / ${movement.hacia_cuadrilla.descripcion}` : "S/D"}</p>
                                </div>
                            </>
                        )}

                        <div className="lg:col-span-4">
                            <p className="font-bold text-dark text-lg block">Materiales</p>
                        </div>

                        <div className="lg:col-span-4">
                            <div className="overflow-x-auto">
                                <Table hoverable>
                                    <Table.Head>
                                        <Table.HeadCell className="lg:w-1/12 hidden lg:table-cell">#</Table.HeadCell>
                                        <Table.HeadCell className="lg:w-1/12">Código</Table.HeadCell>
                                        <Table.HeadCell className="lg:w-1/12">Serie</Table.HeadCell>
                                        <Table.HeadCell className="lg:w-5/12 hidden lg:table-cell">Descripción</Table.HeadCell>
                                        <Table.HeadCell className="lg:w-1/12 text-right">Cantidad</Table.HeadCell>
                                        <Table.HeadCell className="lg:w-1/12 text-right hidden lg:table-cell">Unidad</Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body className="divide-y">
                                        {movement.movimiento_detalles?.map((p, index) => (
                                            <Table.Row key={index}>
                                                <Table.Cell className="hidden lg:table-cell">{index + 1}</Table.Cell>
                                                <Table.Cell>{p.material?.codigo || "S/D"}</Table.Cell>
                                                <Table.Cell>{p.movimiento_detalle_serial?.material?.serie || "S/D"}</Table.Cell>
                                                <Table.Cell className="hidden lg:table-cell">{p.material?.descripcion || "S/D"}</Table.Cell>
                                                <Table.Cell className="text-right tabular-nums">{p.cantidad}</Table.Cell>
                                                <Table.Cell className="hidden lg:table-cell text-right">{p.material?.unidad_medida?.simbolo || "S/D"}</Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-10">
                        <Button
                            className="w-28"
                            color="primary"
                            onClick={handlePDFMovement}
                            disabled={loading}
                            isProcessing={loading}
                        >
                            <Icon icon="solar:printer-outline" height={18} />
                            <span>Remito</span>
                        </Button>
                        <Button className="w-28" color="gray" onClick={onClose}>
                            Cerrar
                        </Button>
                    </div>
                </ModalBody>
            </div>
        </Modal>
    );
};

export default DetailMovementModal;