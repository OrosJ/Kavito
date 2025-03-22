import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import {
  Button,
  IconButton,
  Tooltip,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  FilterAlt as FilterIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

const URI = "http://localhost:8000/inventory-history/";

const InventoryHistoryComponent = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [statsData, setStatsData] = useState([]);
  const [statsPeriod, setStatsPeriod] = useState("month");

  // Filtros
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    tipo: "",
    productId: "",
  });

  // Estado para nuevo registro de entrada
  const [newEntry, setNewEntry] = useState({
    product_id: "",
    cantidad: 1,
    motivo: "",
  });

  // Estado para los productos disponibles
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getHistory();
    getProducts();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No se encontró token de autenticación");
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  const getHistory = async () => {
    try {
      setLoading(true);
      const config = getAuthHeaders();

      // Construir la URL con los filtros
      let url = URI;
      const queryParams = [];

      if (filters.startDate && filters.endDate) {
        queryParams.push(`startDate=${filters.startDate}`);
        queryParams.push(`endDate=${filters.endDate}`);
      }

      if (filters.tipo) {
        queryParams.push(`tipo=${filters.tipo}`);
      }

      if (filters.productId) {
        queryParams.push(`productId=${filters.productId}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }

      const response = await axios.get(url, config);
      setHistory(response.data);
      setError(null);
    } catch (error) {
      console.error("Error al obtener el historial:", error);
      if (error.response?.status === 403) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      } else {
        setError(
          error.response?.data?.message || "Error al cargar el historial"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
    }
  };

  const getStatsData = async () => {
    try {
      setLoading(true);
      const config = getAuthHeaders();
      const response = await axios.get(
        `${URI}stats?period=${statsPeriod}`,
        config
      );
      setStatsData(response.data);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las estadísticas",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    getHistory();
  };

  const handleNewEntryChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({
      ...newEntry,
      [name]: value,
    });
  };

  const handleNewEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      const config = getAuthHeaders();
      await axios.post(`${URI}entrada`, newEntry, config);
      setDialogOpen(false);
      setNewEntry({
        product_id: "",
        cantidad: 1,
        motivo: "",
      });
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Entrada registrada correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
      getHistory();
    } catch (error) {
      console.error("Error al registrar entrada:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al registrar la entrada",
      });
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(18);
    doc.text("Historial de Inventario", 14, 20);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);

    // Filtrar y formatear los datos para la tabla
    const tableData = history.map((item) => [
      item.id,
      item.tipo,
      item.producto ? item.producto.descripcion : "N/A",
      item.cantidad_anterior || 0,
      item.cantidad_nueva || 0,
      item.diferencia,
      item.motivo || "N/A",
      new Date(item.fecha).toLocaleDateString(),
      item.usuario ? item.usuario.username : "N/A",
    ]);

    // Configurar la tabla
    autoTable(doc, {
      head: [
        [
          "ID",
          "Tipo",
          "Producto",
          "Cant. Anterior",
          "Cant. Nueva",
          "Diferencia",
          "Motivo",
          "Fecha",
          "Usuario",
        ],
      ],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    // Guardar el PDF
    doc.save("historial-inventario.pdf");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 50,
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        Cell: ({ row }) => {
          const tipo = row.original.tipo;
          let color;
          switch (tipo) {
            case "ENTRADA":
              color = "success";
              break;
            case "MODIFICACION":
              color = "warning";
              break;
            case "ELIMINACION":
              color = "error";
              break;
            case "DESACTIVACION":
              color = "error";
              break;
            case "SALIDA":
              color = "error";
              break;
            default:
              color = "default";
          }
          return <Chip label={tipo} color={color} size="small" />;
        },
      },
      {
        header: "Producto",
        Cell: ({ row }) => {
          const producto = row.original.producto;
          if (!producto) return "N/A";

          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {producto.image && (
                <img
                  src={producto.image}
                  alt={producto.descripcion}
                  width="30"
                  height="30"
                  style={{ objectFit: "cover", borderRadius: "4px" }}
                  onError={(e) => {
                    // Fallback en caso de error al cargar la imagen
                    e.target.onerror = null;
                    e.target.src = "/placeholder.png";
                  }}
                />
              )}
              <Typography variant="body2">{producto.descripcion}</Typography>
            </Box>
          );
        },
      },
      {
        accessorKey: "cantidad_anterior",
        header: "Cant. Anterior",
        size: 100,
      },
      {
        accessorKey: "cantidad_nueva",
        header: "Cant. Nueva",
        size: 100,
      },
      {
        accessorKey: "diferencia",
        header: "Diferencia",
        Cell: ({ row }) => {
          const diff = row.original.diferencia;
          return (
            <Typography
              variant="body2"
              sx={{
                color: diff > 0 ? "green" : diff < 0 ? "red" : "inherit",
                fontWeight: diff !== 0 ? "bold" : "normal",
              }}
            >
              {diff > 0 ? `+${diff}` : diff}
            </Typography>
          );
        },
      },
      {
        accessorKey: "motivo",
        header: "Motivo",
      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        Cell: ({ row }) => {
          return new Date(row.original.fecha).toLocaleString();
        },
      },
      {
        header: "Usuario",
        Cell: ({ row }) => {
          const usuario = row.original.usuario;
          return usuario ? usuario.username : "N/A";
        },
      },
    ],
    []
  );

  return (
    <div className="container">
      <h1 style={{ color: "#2563eb", fontWeight: 800, fontSize: "2rem" }}>
        HISTORIAL DE INVENTARIO
      </h1>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <form onSubmit={handleFilterSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Fecha Inicio"
                  type="date"
                  name="startDate"
                  value={filters.startDate || ""}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Fecha Fin"
                  type="date"
                  name="endDate"
                  value={filters.endDate || ""}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    name="tipo"
                    value={filters.tipo}
                    onChange={handleFilterChange}
                    label="Tipo"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="ENTRADA">Entradas</MenuItem>
                    <MenuItem value="MODIFICACION">Modificaciones</MenuItem>
                    <MenuItem value="ELIMINACION">Eliminaciones</MenuItem>
                    <MenuItem value="DESACTIVACION">Eliminaciones</MenuItem>
                    <MenuItem value="SALIDA">Eliminaciones</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Producto</InputLabel>
                  <Select
                    name="productId"
                    value={filters.productId}
                    onChange={handleFilterChange}
                    label="Producto"
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.descripcion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<FilterIcon />}
                  fullWidth
                >
                  Filtrar
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Registrar Entrada
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<TrendingUpIcon />}
          onClick={() => {
            getStatsData();
            setStatsDialogOpen(true);
          }}
        >
          Ver Estadísticas
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<PdfIcon />}
          onClick={handleExportPDF}
        >
          Exportar PDF
        </Button>
      </Box>

      <MaterialReactTable
        columns={columns}
        data={history}
        state={{ isLoading: loading }}
        enableRowActions
        renderRowActions={({ row }) => (
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <Tooltip title="Ver Detalles">
              <IconButton
                color="info"
                onClick={() => {
                  Swal.fire({
                    title: "Detalles del Movimiento",
                    html: `
                      <div style="text-align: left;">
                        <p><strong>ID:</strong> ${row.original.id}</p>
                        <p><strong>Tipo:</strong> ${row.original.tipo}</p>
                        <p><strong>Producto:</strong> ${
                          row.original.producto?.descripcion || "N/A"
                        }</p>
                        <p><strong>Cantidad Anterior:</strong> ${
                          row.original.cantidad_anterior || 0
                        }</p>
                        <p><strong>Cantidad Nueva:</strong> ${
                          row.original.cantidad_nueva || 0
                        }</p>
                        <p><strong>Diferencia:</strong> ${
                          row.original.diferencia
                        }</p>
                        <p><strong>Motivo:</strong> ${
                          row.original.motivo || "N/A"
                        }</p>
                        <p><strong>Fecha:</strong> ${new Date(
                          row.original.fecha
                        ).toLocaleString()}</p>
                        <p><strong>Usuario:</strong> ${
                          row.original.usuario?.username || "N/A"
                        }</p>
                      </div>
                    `,
                    icon: "info",
                  });
                }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        localization={{
          noRecordsToDisplay: "No hay registros de inventario disponibles",
        }}
      />

      {/* Diálogo para registro de entrada */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Registrar Nueva Entrada de Inventario</DialogTitle>
        <DialogContent>
          <form onSubmit={handleNewEntrySubmit}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Producto</InputLabel>
              <Select
                name="product_id"
                value={newEntry.product_id}
                onChange={handleNewEntryChange}
                label="Producto"
                required
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              name="cantidad"
              label="Cantidad"
              type="number"
              fullWidth
              value={newEntry.cantidad}
              onChange={handleNewEntryChange}
              required
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ mt: 2 }}
            />

            <TextField
              margin="dense"
              name="motivo"
              label="Motivo de la entrada"
              type="text"
              fullWidth
              value={newEntry.motivo}
              onChange={handleNewEntryChange}
              multiline
              rows={2}
              sx={{ mt: 2 }}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleNewEntrySubmit}
            variant="contained"
            color="primary"
          >
            Registrar Entrada
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para estadísticas */}
      <Dialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Estadísticas de Inventario</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={statsPeriod}
                onChange={(e) => setStatsPeriod(e.target.value)}
                label="Período"
              >
                <MenuItem value="week">Última Semana</MenuItem>
                <MenuItem value="month">Último Mes</MenuItem>
                <MenuItem value="year">Último Año</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" sx={{ ml: 2 }} onClick={getStatsData}>
              Actualizar
            </Button>
          </Box>

          {statsData && statsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="entradas"
                  stroke="#4CAF50"
                  name="Entradas"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="incrementos"
                  stroke="#2196F3"
                  name="Incrementos"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="salidas"
                  stroke="#F44336"
                  name="Salidas"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography>No hay datos estadísticos disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InventoryHistoryComponent;
