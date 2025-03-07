import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import { Button, IconButton, Tooltip, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Swal from "sweetalert2";

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

const URI = "http://localhost:8000/categories/";

const CompShowCategories = () => {
  const [categories, setCategories] = useState([]);

  // Carga todos los datos cuando el componente se monta
  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const res = await axios.get(URI);
      setCategories(res.data); // almacena los datos en el estado
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    }
  };

  const deleteCategory = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Este categoria será eliminada permanentemente!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "¡Sí, eliminar!",
      cancelButtonText: "Cancelar",
    });

    if(result.isConfirmed){
      try {
        await axios.delete(`${URI}${id}`);
        getCategories(); 
        mostrarMensaje('success', '¡Eliminado!', 'Categoria eliminada correctamente.');
      } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        mostrarMensaje('error', '¡Error!', 'No se pudo eliminar.');
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
        accessorKey: "categoryname",
        header: "Categoria",
      },
      {
        accessorKey: "createdAt",
        header: "Creacion",
      },
      {
        accessorKey: "updatedAt",
        header: "Ultima Actualizacion",
      },
    ],
    []
  );

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <Link to="/create-category" className="btn btn-primary mt-2 mb-2">
            <i className="fa-regular fa-square-plus"></i> NUEVA CATEGORIA
          </Link>
          {categories.length > 0 ? (
            <MaterialReactTable
              columns={columns}
              data={categories}
              enableRowActions
              renderRowActions={({ row }) => (
                <Box sx={{ display: "flex", gap: "0.5rem" }}>
                  <Tooltip title="Editar">
                    {/* Envolver el IconButton con el Link */}
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/edit-category/${row.original.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      color="error"
                      onClick={() => deleteCategory(row.original.id)}
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

export default CompShowCategories;
