import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MaterialReactTable } from 'material-react-table';
import { Button, IconButton, Tooltip, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const URI = 'http://localhost:8000/users/';

const CompShowUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const res = await axios.get(URI);
      setUsers(res.data);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await axios.delete(`${URI}${id}`);
        getUsers();
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
      }
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: '#',
    },
    {
      accessorKey: 'username',
      header: 'Nombre',
    },
    {
      accessorKey: 'email',
      header: 'Correo',
    },
    {
      accessorKey: 'role',
      header: 'Rol',
    },
  ], []);

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <Link to="/create-user" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ marginBottom: 2 }}
              startIcon={<i className="fa-regular fa-square-plus"></i>}
            >
              NUEVO USUARIO
            </Button>
          </Link>

          {users.length > 0 ? (
            <MaterialReactTable
              columns={columns}
              data={users}
              enableRowActions
              renderRowActions={({ row }) => (
                <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                  <Tooltip title="Editar">
                    {/* Envolver el IconButton con el Link */}
                    <IconButton color="primary" component={Link} to={`/edit-user/${row.original.id}`}>
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