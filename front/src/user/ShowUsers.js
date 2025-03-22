import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import {
  Button,
  IconButton,
  Tooltip,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import RefreshIcon from "@mui/icons-material/Refresh";
import Swal from "sweetalert2";
import api from "../utils/api";

const mostrarMensaje = (tipo, titulo, texto) => {
  Swal.fire({
    icon: tipo,
    title: titulo,
    text: texto,
    position: "top-end",
    toast: true,
    timer: tipo === "success" ? 2000 : undefined,
    timerProgressBar: true,
    showConfirmButton: tipo !== "success",
  });
};

const URI = "http://localhost:8000/users/";

const CompShowUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
  }, [showInactive]);

  const getUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/users${showInactive ? "?includeInactive=true" : ""}`
      );
      setUsers(res.data);
      setError(null);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      if (error.response && error.response.status === 403) {
        // Si es un error de permisos
        mostrarMensaje(
          "error",
          "Acceso denegado",
          "No tienes permisos para acceder a esta sección"
        );
        navigate("/");
      } else {
        setError(
          "No se pudieron cargar los usuarios. Verifica tus permisos o la conexión."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Este usuario será eliminado permanentemente!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "¡Sí, eliminar!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`${URI}${id}`);
        if (response.data.hasRelatedItems) {
          // Si tiene elementos relacionados, mostrar un mensaje de error
          mostrarMensaje(
            "error",
            "No se puede eliminar",
            response.data.message ||
              "Este usuario tiene registros asociados y no puede ser eliminado."
          );
        } else {
          getUsers();
          mostrarMensaje(
            "success",
            "¡Eliminado!",
            "El usuario ha sido eliminado correctamente."
          );
        }
        await api.delete(`${URI}${id}`);
        getUsers();
        mostrarMensaje(
          "success",
          "¡Eliminado!",
          "El usuario ha sido eliminado correctamente."
        );
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.hasRelatedItems
        ) {
          mostrarMensaje(
            "error",
            "No se puede eliminar",
            error.response.data.message ||
              "Este usuario tiene registros asociados y no puede ser eliminado."
          );
        } else {
          mostrarMensaje("error", "¡Error!", "No se pudo eliminar el usuario.");
        }
      }
    }
  };

  const deactivateUser = async (id) => {
    const result = await Swal.fire({
      title: "¿Desactivar usuario?",
      text: "Este usuario no podrá iniciar sesión, pero sus registros históricos se mantendrán",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff9800",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await api.put(`${URI}${id}/deactivate`);
        getUsers();
        mostrarMensaje(
          "success",
          "Usuario desactivado",
          "El usuario ha sido desactivado correctamente"
        );
      } catch (error) {
        console.error("Error al desactivar el usuario:", error);

        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          mostrarMensaje("error", "Error", error.response.data.message);
        } else {
          mostrarMensaje("error", "Error", "No se pudo desactivar el usuario");
        }
      }
    }
  };

  const reactivateUser = async (id) => {
    const result = await Swal.fire({
      title: "¿Reactivar usuario?",
      text: "Este usuario volverá a poder iniciar sesión en el sistema",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4caf50",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, reactivar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await api.put(`/users/${id}/reactivate`);
        getUsers();
        mostrarMensaje(
          "success",
          "Usuario reactivado",
          "El usuario ha sido reactivado correctamente"
        );
      } catch (error) {
        console.error("Error al reactivar el usuario:", error);
        mostrarMensaje("error", "Error", "No se pudo reactivar el usuario");
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "#",
        size: 50,
      },
      {
        accessorKey: "username",
        header: "Nombre",
      },
      {
        accessorKey: "email",
        header: "Correo",
      },
      {
        accessorKey: "role",
        header: "Rol",
      },
    ],
    []
  );

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Usuarios</h2>
      <div className="row">
        <div className="col">
          <Link to="/create-user" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ marginBottom: 2 }}
              startIcon={<i className="fa-regular fa-square-plus"></i>}
            >
              NUEVO USUARIO
            </Button>
          </Link>

          <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                />
              }
              label="Mostrar usuarios desactivados"
            />
          </Box>

          {users.length > 0 ? (
            <MaterialReactTable
              columns={columns}
              data={users}
              enableRowActions
              state={{ isLoading: loading }}
              renderRowActions={({ row }) => (
                <Box sx={{ display: "flex", gap: "0.5rem" }}>
                  <Tooltip title="Editar">
                    {/* Envolver el IconButton con el Link */}
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/edit-user/${row.original.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      color="error"
                      onClick={() => deleteUser(row.original.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Desactivar usuario">
                    <IconButton
                      color="warning"
                      onClick={() => deactivateUser(row.original.id)}
                    >
                      <BlockIcon />
                    </IconButton>
                  </Tooltip>
                  {!row.original.activo && (
                    <Tooltip title="Reactivar usuario">
                      <IconButton
                        color="success"
                        onClick={() => reactivateUser(row.original.id)}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
              positionActionsColumn="last"
            />
          ) : (
            <p>Cargando datos...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompShowUsers;
