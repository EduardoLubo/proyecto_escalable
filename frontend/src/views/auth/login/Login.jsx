import { useEffect, useState } from "react";
import AlertMessage from "src/components/alerts/AlertMessage";
import FullLogo from "src/layouts/full/shared/logo/FullLogo";
import AuthLogin from "src/components/auth/AuthLogin";

const gradientStyle = {
  background: "linear-gradient(45deg,rgb(40, 41, 100, 1) 0%, rgb(118, 198, 226, 1))",
  backgroundSize: "400% 400%",
  animation: "gradient 10s ease infinite",
  height: "100vh",
  overflow: "hidden",
};

const Login = () => {

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const msg = sessionStorage.getItem("authMessage");
    if (msg) {
      setErrorMessage(msg);
      sessionStorage.removeItem("authMessage");
    }
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);


  return (
    <div style={gradientStyle} className="relative overflow-hidden h-screen">
      {errorMessage && <AlertMessage message={errorMessage} type="failure" />}
      <div className="flex h-full justify-center items-center px-4">
        <div className="rounded-xl shadow-md bg-white dark:bg-darkgray p-6 w-full md:w-96 border-none">
          <div className="flex flex-col gap-2 p-4 w-full">
            <div className="mx-auto">
              <FullLogo />
            </div>
            <p className="text-sm text-center text-dark my-3">Bienvenido a <strong className="text-primary">Obrador WEB</strong></p>
            <AuthLogin />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
