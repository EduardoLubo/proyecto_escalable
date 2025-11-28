import { jwtDecode } from 'jwt-decode';
import { Button, Label, TextInput } from "flowbite-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import AlertMessage from "../alerts/AlertMessage";
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthLogin = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSubmit = async (event) => {

    event.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}api/v1/login/`, {
        email,
        pass,
      });

      const data = res.data;

      if (data.token) {
        const decoded = jwtDecode(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(decoded));
        setErrorMessage("");
        navigate("/");
      } else {
        setErrorMessage(data.message || "Error desconocido.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || error.message || "Error de conexión con el servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      {errorMessage && <AlertMessage message={errorMessage} type="failure" />}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="Username" value="Email" />
          </div>
          <TextInput
            id="Username"
            type="email"
            required
            className="form-control form-rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="userpwd" value="Contraseña" />
          </div>
          <TextInput
            id="userpwd"
            type="password"
            required
            className="form-control form-rounded-xl"
            value={pass}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" color={'primary'} className="w-full" disabled={loading}>
          {loading ? "Iniciando..." : "Iniciar sesión"}
        </Button>

      </form>

    </>
  );
};

export default AuthLogin;