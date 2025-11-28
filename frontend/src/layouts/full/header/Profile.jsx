import { Dropdown } from "flowbite-react";
import { Icon } from "@iconify/react";
import { Link } from "react-router";
import { useNavigate } from 'react-router';

const Profile = () => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/auth/login');
  };

  return (
    <div className="relative group/menu">
      <Dropdown
        label=""
        className="rounded-sm w-44"
        dismissOnClick={true}
        renderTrigger={() => (
          <Icon icon="solar:user-bold" height={24} className="cursor-pointer text-dark" />
        )}
      >
        <Dropdown.Item
          as={Link}
          to="/profile"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark"
        >
          <Icon icon="solar:settings-outline" className="text-dark" height={20} />
          Mi cuenta
        </Dropdown.Item>
        <Dropdown.Item
          onClick={handleLogout}
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark"
        >
          <Icon icon="solar:exit-outline" className="text-dark" height={20} />
          Salir
        </Dropdown.Item>
      </Dropdown>
    </div>
  );
};

export default Profile;
