import { uniqueId } from "lodash";

const SidebarContent = [
  {
    heading: "INVENTARIO",
    children: [
      {
        name: "Stock",
        icon: "solar:document-text-outline",
        id: uniqueId(),
        url: "/stocks",
      },
      {
        name: "Control",
        icon: "solar:check-square-outline",
        id: uniqueId(),
        url: "/stocks-control",
      },
      {
        name: "Serializados",
        icon: "solar:history-outline",
        id: uniqueId(),
        url: "/stocks-historical",
      },
      {
        name: "Movimientos",
        icon: "solar:sort-horizontal-outline",
        id: uniqueId(),
        url: "/movements",
      },
    ],
  },
  {
    heading: "UBICACIONES",
    children: [
      {
        name: "Proveedores",
        icon: "solar:cart-large-minimalistic-outline",
        id: uniqueId(),
        url: "/suppliers",
      },
      {
        name: "Depósitos",
        icon: "solar:box-outline",
        id: uniqueId(),
        url: "/warehouses",
      },
      {
        name: "Obras",
        icon: "solar:paint-roller-outline",
        id: uniqueId(),
        url: "/constructions",
      },
    ],
  },
  {
    heading: "RECURSOS",
    children: [
      {
        name: "Materiales",
        icon: "la:tools",
        id: uniqueId(),
        url: "/materials",
      },
      {
        name: "Unidades",
        icon: "solar:ruler-outline",
        id: uniqueId(),
        url: "/units",
      },
      {
        name: "Cuadrillas",
        icon: "solar:bus-outline",
        id: uniqueId(),
        url: "/crews",
      },
      {
        name: "Personal",
        icon: "solar:user-hand-up-outline",
        id: uniqueId(),
        url: "/crew-members",
      },
    ],
  },
  {
    heading: "SISTEMA",
    roles: ["ADMINISTRADOR"],
    children: [
      {
        name: "Clientes",
        icon: "solar:notebook-outline",
        id: uniqueId(),
        url: "/customers",
        roles: ["ADMINISTRADOR"],
      },
      {
        name: "Usuarios",
        icon: "solar:users-group-rounded-outline",
        id: uniqueId(),
        url: "/users",
        roles: ["ADMINISTRADOR"],
      }
    ],
  },
];

export default SidebarContent;
