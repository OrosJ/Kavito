import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import { Button, IconButton, Tooltip, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Swal from "sweetalert2";

const URI = "http://localhost:8000/clients/";

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

const CompShowClients = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    getClients();
  }, []);

  const getClients = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log("No se encontró el token. Redirigiendo al login...");
        // Aquí podrías redirigir al usuario a la página de login si no hay token
        return;
      }

      const res = await axios.get(URI, {
        headers: {
          Authorization: `Bearer ${token}`, // Incluye el token en los headers
        },
      });

      setClients(res.data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const deleteClient = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Este cliente será eliminado permanentemente!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "¡Sí, eliminar!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${URI}${id}`);

        if (response.data.hasRelatedItems) {
          // Si tiene elementos relacionados, mostrar un mensaje de error
          mostrarMensaje(
            "error",
            "No se puede eliminar",
            response.data.message ||
              "Este cliente tiene proyectos asociados y no puede ser eliminado."
          );
        } else {
          // Si se eliminó (desactivó) correctamente, actualizar la lista
          getClients();
          mostrarMensaje(
            "success",
            "¡Eliminado!",
            "El cliente ha sido eliminado correctamente."
          );
        }
      } catch (error) {
        console.error("Error al eliminar el cliente:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.hasRelatedItems
        ) {
          mostrarMensaje(
            "error",
            "No se puede eliminar",
            error.response.data.message ||
              "Este cliente tiene proyectos asociados y no puede ser eliminado."
          );
        } else {
          mostrarMensaje("error", "¡Error!", "No se pudo eliminar el cliente.");
        }
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'index',
        header: '#',
        size: 50,
        Cell: ({ row }) => <span>{row.index + 1}</span>,
      },
      {
        accessorKey: "clientname",
        header: "Nombre",
      },
      {
        accessorKey: "createdAt",
        header: "Fecha de Registro",
      },
      {
        accessorKey: "updatedAt",
        header: "Ultima Modificaion",
      },
    ],
    []
  );

  return (
    <div className="container">
      <h1 style={{ color: "#2563eb", fontWeight: 800, fontSize: "2rem" }}>
        GESTIÓN DE CLIENTES
      </h1>
      <div className="row">
        <div className="col">
          <Link to="/create-client" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ marginBottom: 2 }}
              startIcon={<i className="fa-regular fa-square-plus"></i>}
            >
              NUEVO CLIENTE
            </Button>
          </Link>

          {clients.length > 0 ? (
            <MaterialReactTable
              columns={columns}
              data={clients}
              enableRowActions
              renderRowActions={({ row }) => (
                <Box sx={{ display: "flex", gap: "0.5rem" }}>
                  <Tooltip title="Editar">
                    {/* Envolver el IconButton con el Link */}
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/edit-client/${row.original.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      color="error"
                      onClick={() => deleteClient(row.original.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
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

export default CompShowClients;
