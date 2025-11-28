import { Modal, ModalBody, ModalHeader, Button } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

const StockErrorMessage = ({ show, onClose, items = [] }) => {
    return (
        <Modal show={show} size="xl" onClose={onClose} popup>
            <ModalHeader />
            <ModalBody>
                <div className="text-center px-4">
                    <HiOutlineExclamationCircle className="mx-auto mb-3 h-16 w-16 text-gray-500 dark:text-gray-200" />
                    <h3 className="mb-1 text-2xl text-gray-500">
                        Stock insuficiente
                    </h3>
                    <div className="p-5 mb-5 text-center">
                        <ol className="text-sm text-gray-600 space-y-1 whitespace-nowrap">
                            {items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ol>
                    </div>
                    <div className="flex justify-center">
                        <Button className="w-32" color="gray" onClick={onClose}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default StockErrorMessage;
