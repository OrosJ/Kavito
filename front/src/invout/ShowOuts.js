import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import { Button, IconButton, Tooltip, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const URI = "http://localhost:8000/invouts/";

const CompShowInvOuts = () => {
  const [invouts, setInvOuts] = useState([]);

  useEffect(() => {
    getInvOuts();
  }, []);

  // Obtener
  const getInvOuts = async () => {
    try {
      const res = await axios.get(URI);
      console.log("Datos recibidos:", res.data);
      setInvOuts(res.data);
    } catch (error) {
      console.error("Error al obtener las salidas:", error);
    }
  };

  // Eliminar
  const deleteInvOut = async (id) => {
    try {
      await axios.delete(`${URI}${id}`);
      getInvOuts(); // Vuelve a obtener los datos después de la eliminación
    } catch (error) {
      console.error("Error al eliminar:", error);
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
        header: "Productos",
        accessorFn: (row) => row.productos.map(p => p.descripcion).join(", "),
        Cell: ({ row }) => (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {row.original.productos.map((producto, index) => (
              <span key={index} style={{ padding: "2px 0" }}>
                {producto.descripcion}
              </span>
            ))}
          </div>
        ),
        size: 200,
      },
      {
        header: "Cantidades",
        accessorFn: (row) => row.productos.map(p => p.cantidad).join(", "),
        Cell: ({ row }) => (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {row.original.productos?.map((producto, index) => (
              <span key={index} style={{ padding: "2px 0", textAlign: "center" }}>
                {producto.cantidad}
              </span>
            ))}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "usuario",
        header: "Usuario",
        Cell: ({ row }) => row.original.usuario,
        size: 70,
      },
      {
        accessorKey: "obs",
        header: "Observaciones",
        size: 70,
      },
      {
        accessorKey: "createdAt",
        header: "Fecha",
        Cell: ({ cell }) => {
          const date = new Date(cell.getValue());
          return date.toLocaleString('es-ES',{
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        },
      },
    ],
    []
  );

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <Link to="/invouts/cart" className="btn btn-primary mt-2 mb-2">
            <i className="fa-regular fa-square-plus"></i> NUEVA SALIDA
          </Link>
          {invouts.length > 0 ? (
            <MaterialReactTable
              columns={columns}
              data={invouts}
              enableRowActions
              renderRowActions={({ row }) => (
                <Box sx={{ display: "flex", gap: "0.5rem" }}>
                  <Tooltip title="Editar">
                    {/* Envolver el IconButton con el Link */}
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/edit/${row.original.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      color="error"
                      onClick={() => deleteInvOut(row.original.id)}
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

export default CompShowInvOuts;
