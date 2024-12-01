import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MaterialReactTable } from 'material-react-table';
import { Button, IconButton, Tooltip, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const URI = 'http://localhost:8000/clients/';

const CompShowClients = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    getClients();
  }, []);

  const getClients = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No se encontró el token. Redirigiendo al login...');
        // Aquí podrías redirigir al usuario a la página de login si no hay token
        return;
      }

      const res = await axios.get(URI, {
        headers: {
          Authorization: `Bearer ${token}`,  // Incluye el token en los headers
        },
      });

      setClients(res.data);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };

  const deleteClient = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await axios.delete(`${URI}${id}`);
        getClients();
      } catch (error) {
        console.error('Error al eliminar el cliente:', error);
      }
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: '#',
      size: 50,
    },
    {
      accessorKey: 'clientname',
      header: 'Nombre',
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha de Registro',
    },
    {
      accessorKey: 'updatedAt',
      header: 'Ultima Modificaion',
    },
  ], []);

  return (
    <div className="container">
      <h2>Clientes</h2>
      <div className="row">
        <div className="col">
          <Link to="/create-user" style={{ textDecoration: 'none' }}>
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
                <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                  <Tooltip title="Editar">
                    {/* Envolver el IconButton con el Link */}
                    <IconButton color="primary" component={Link} to={`/edit-client/${row.original.id}`}>
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