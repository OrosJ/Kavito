import React, { useState, useEffect, useMemo } from 'react';
import axios from "axios";
import { Link } from "react-router-dom";
import { MaterialReactTable } from 'material-react-table';
import { Button, IconButton, Tooltip, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const URI = "http://localhost:8000/products/";

const CompShowProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts();
  }, []);

  // Obtener los productos
  const getProducts = async () => {
    try {
      const res = await axios.get(URI);
      setProducts(res.data); // Corregido: actualizar el estado correctamente
    } catch (error) {
      console.error("Error al obtener los productos:", error);
    }
  };

  // Eliminar un producto
  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${URI}${id}`);
      getProducts(); // Vuelve a obtener los productos después de la eliminación
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: '#',
      size: 50,
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripcion',
    },
    {
      accessorKey: 'category.categoryname',
      header: 'Categoria',
    },
    {
      accessorKey: 'cantidad',
      header: 'Cantidad',
      size: 70,
    },
    {
      accessorKey: 'precio',
      header: 'Precio',
      size: 70,
    },
    {
      accessorKey: 'image',
      header: 'Imagen',
      Cell: ({ row }) => (
        <img
          src={row.original.image} // Asegúrate de que la URL de la imagen esté bien formada
          alt={""} // Opcional: puedes poner una descripción alternativa
          style={{ width: '50px', height: '50px', objectFit: 'cover' }} // Ajusta el estilo según lo necesites
        />
      ),
    },
  ], []);

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <Link to="/create" className="btn btn-primary mt-2 mb-2">
            <i className="fa-regular fa-square-plus"></i> NUEVO REGISTRO
          </Link>
          {products.length > 0 ? (
            <MaterialReactTable
              columns={columns}
              data={products}
              enableRowActions
              renderRowActions={({ row }) => (
                <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                  <Tooltip title="Editar">
                    {/* Envolver el IconButton con el Link */}
                    <IconButton color="primary" component={Link} to={`/edit/${row.original.id}`}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      color="error"
                      onClick={() => deleteProduct(row.original.id)}
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

export default CompShowProducts;
