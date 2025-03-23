import React, { useState, useEffect } from 'react';
import { 
  Badge, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Typography,
  Box
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Importación correcta
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LowStockNotification = () => {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  
  // Simplemente navegar a productos sin intentar filtrar
  const handleClick = () => {
    navigate('/products');
  };
  
  useEffect(() => {
    // Implementación mínima para contar productos
    const checkLowStock = async () => {
      try {
        const response = await axios.get('http://localhost:8000/products');
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Respuesta inesperada:', response.data);
          return;
        }
        
        // Contar productos con stock bajo usando la lógica del frontend
        const threshold = 10; // Mismo umbral que habíamos definido
        const lowStockItems = response.data.filter(p => 
          p.cantidad && Number(p.cantidad) < threshold
        );
        
        setLowStockCount(lowStockItems.length);
      } catch (error) {
        console.error('Error al verificar stock bajo:', error);
      }
    };
    
    checkLowStock();
  }, []);
  
  return (
    <Tooltip title="Productos con stock bajo">
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="Ver productos con stock bajo"
      >
        <Badge 
          badgeContent={lowStockCount} 
          color="error"
          max={99}
        >
          <WarningAmberIcon/>
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default LowStockNotification;