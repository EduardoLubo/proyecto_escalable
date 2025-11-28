import { Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

const AlertMessage = ({ message, type }) => {

  const color = type === "success" ? "success" : "failure";

  const alertClasses = {
    success: "!bg-green-100 !text-green-600",
    failure: "!bg-red-100 !text-red-600",
  };

  return (
    <div className="fixed top-2 right-2 z-50">
      <Alert color={color}
        icon={HiInformationCircle}
        className={alertClasses[type] || ""}
      >
        {message}
      </Alert>
    </div>
  );
};

export default AlertMessage;
