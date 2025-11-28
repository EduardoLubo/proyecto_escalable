import { Link } from "react-router";
import ErrorImg from "/src/assets/images/backgrounds/errorimg.svg";
import { Button } from "flowbite-react";

const Error = () => {
  return (
    <>
      <div className="h-screen flex items-center justify-center bg-white dark:bg-darkgray">
        <div className="text-center">
          <img src={ErrorImg} alt="error" className="mb-4" />          
          <h6 className="text-xl text-ld">
            Parece que esta página no existe
          </h6>
          <Button
            color={"primary"}
            as={Link}
            to="/"
            className="w-24 mt-6 mx-auto"
          >
            Home
          </Button>
        </div>
      </div>
    </>
  );
};

export default Error;
