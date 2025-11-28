export const isAdmin = () => {
  const userData = localStorage.getItem("user");
  if (!userData) return false;

  try {
    const user = JSON.parse(userData);
    return user.tipo_usuario === "ADMINISTRADOR";
  } catch {
    return false;
  }
};
