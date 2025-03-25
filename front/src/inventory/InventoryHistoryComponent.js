import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
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
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Switch,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  FilterAlt as FilterIcon,
  FilterAlt as FilterAltIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import RestoreIcon from "@mui/icons-material/Restore";
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
    sortBy: "fecha",
    orderDir: "DESC",
    showInactiveProducts: true,
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

      // Añadir parámetros de ordenamiento
      if (filters.sortBy) {
        queryParams.push(`sortBy=${filters.sortBy}`);
        queryParams.push(`orderDir=${filters.orderDir}`);
      }

      // Añadir parámetro para mostrar productos inactivos
      if (filters.showInactiveProducts) {
        queryParams.push(`showInactiveProducts=true`);
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

  const getStatsData = async (period = statsPeriod) => {
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

  const getHistoryWithFilters = async (tipoFiltro) => {
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

      // Usar el tipoFiltro pasado como parámetro en lugar de filters.tipo
      if (tipoFiltro) {
        queryParams.push(`tipo=${tipoFiltro}`);
      }

      if (filters.productId) {
        queryParams.push(`productId=${filters.productId}`);
      }

      if (filters.showInactiveProducts) {
        queryParams.push(`showInactiveProducts=true`);
      }

      if (filters.sortBy) {
        queryParams.push(`sortBy=${filters.sortBy}`);
        queryParams.push(`orderDir=${filters.orderDir}`);
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

  const handleResetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      tipo: "",
      productId: "",
      sortBy: "fecha",
      orderDir: "DESC",
      showInactiveProducts: false,
    });
    // Aplicar los filtros después de resetear
    getHistoryWithFilters("");
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
        id: "index",
        header: "#",
        size: 50,
        minSize: 50,
        maxSize: 60,
        Cell: ({ row }) => (
          <div style={{ textAlign: "center" }}>{row.index + 1}</div>
        ),
        muiTableHeadCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        size: 120,
        minSize: 100,
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
        size: 200,
        grow: true,
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
        size: 200, // Reducido
        minSize: 200, // Fijo
        maxSize: 200, // Limitado
        // Centrar el contenido
        Cell: ({ cell }) => (
          <div style={{ textAlign: "center", width: "100%" }}>
            {cell.getValue() || 0}
          </div>
        ),
        // Centrar el encabezado
        muiTableHeadCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "cantidad_nueva",
        header: "Cant. Nueva",
        size: 200, // Reducido
        minSize: 200, // Fijo
        maxSize: 200, // Limitado
        // Centrar el contenido
        Cell: ({ cell }) => (
          <div style={{ textAlign: "center", width: "100%" }}>
            {cell.getValue() || 0}
          </div>
        ),
        // Centrar el encabezado
        muiTableHeadCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "diferencia",
        header: "Diferencia",
        size: 200, // Reducido
        minSize: 200, // Fijo
        maxSize: 200, // Limitado
        Cell: ({ row }) => {
          const diff = row.original.diferencia;
          return (
            <div
              style={{
                textAlign: "center",
                width: "100%",
                color: diff > 0 ? "green" : diff < 0 ? "red" : "inherit",
                fontWeight: diff !== 0 ? "bold" : "normal",
              }}
            >
              {diff > 0 ? `+${diff}` : diff}
            </div>
          );
        },
        // Centrar el encabezado
        muiTableHeadCellProps: {
          align: "center",
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
        size: 100, // Reducido
        minSize: 100, // Fijo
        maxSize: 100, // Limitado
        Cell: ({ row }) => {
          const usuario = row.original.usuario;
          return usuario ? usuario.username : "N/A";
        },
      },
    ],
    []
  );

  // Obtener IDs de todas las columnas para usarlos en el orden inicial
  const columnIds = columns.map(
    (column) => column.id || column.accessorKey || column.header
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

          {/* Filtro rápido de tipo */}
          <ToggleButtonGroup
            value={filters.tipo}
            exclusive
            onChange={(e, newValue) => {
              setFilters({ ...filters, tipo: newValue || "" });
              getHistoryWithFilters(newValue || "");
            }}
            aria-label="filtro de tipo"
            size="small"
            sx={{
              mb: 2,
              "& .MuiToggleButton-root": {
                backgroundColor: "white",
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  fontWeight: "bold",
                },
              },
            }}
          >
            <ToggleButton value="" aria-label="todos">
              Todos
            </ToggleButton>
            <ToggleButton value="ENTRADA" aria-label="entrada">
              Entradas
            </ToggleButton>
            <ToggleButton value="MODIFICACION" aria-label="modificacion">
              Modificaciones
            </ToggleButton>
            <ToggleButton value="SALIDA" aria-label="salida">
              Salidas
            </ToggleButton>
            <ToggleButton value="DESACTIVACION" aria-label="eliminacion">
              Eliminaciones
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Botones de filtro avanzado */}
          {/*           <Button
            variant="outlined"
            startIcon={<FilterAltIcon />}
            onClick={() => setFilterDialogOpen(true)}
            sx={{ ml: 2, backgroundColor: "white" }}
          >
            Filtros avanzados
          </Button> */}

          {/* Botón para limpiar filtros */}
          {(filters.tipo ||
            filters.productId ||
            filters.startDate ||
            filters.endDate ||
            filters.sortBy !== "fecha" ||
            filters.orderDir !== "DESC" ||
            filters.showInactiveProducts) && (
            <Button
              variant="text"
              startIcon={<RestoreIcon />}
              onClick={handleResetFilters}
              sx={{ ml: 1, backgroundColor: "white" }}
            >
              Limpiar filtros
            </Button>
          )}

          {/* Chips para mostrar filtros activos */}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {filters.tipo && (
              <Chip
                label={`Tipo: ${filters.tipo}`}
                onDelete={() => setFilters({ ...filters, tipo: "" })}
                color="primary"
                variant="outlined"
              />
            )}
            {filters.productId && (
              <Chip
                label={`Producto: ${
                  products.find(
                    (p) => p.id.toString() === filters.productId.toString()
                  )?.descripcion || filters.productId
                }`}
                onDelete={() => setFilters({ ...filters, productId: "" })}
                color="primary"
                variant="outlined"
              />
            )}
            {filters.startDate && filters.endDate && (
              <Chip
                label={`Período: ${filters.startDate} - ${filters.endDate}`}
                onDelete={() =>
                  setFilters({ ...filters, startDate: null, endDate: null })
                }
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
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
        enableStickyHeader
        layoutMode="grid"
        enableColumnResizing
        columnResizeMode="onChange"
        muiTablePaperProps={{
          sx: {
            // IMPORTANTE: Esta propiedad fija la tabla y su scroll en la ventana
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%",
          },
        }}
        muiTableContainerProps={{
          sx: {
            overflow: "auto",
            position: "relative",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            "&::-webkit-scrollbar": {
              height: "10px",
              width: "10px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#555",
            },
          },
        }}
        // Configurar la columna de acciones
        displayColumnDefOptions={{
          "mrt-row-actions": {
            header: "Acciones",
            size: 80,
            minSize: 80,
            maxSize: 90,
            muiTableHeadCellProps: {
              align: "center",
            },
            muiTableBodyCellProps: {
              align: "center",
            },
          },
        }}
        // Establecer el orden inicial de columnas
        initialState={{
          columnOrder: [
            ...columns.map((col) => col.id || col.accessorKey || col.header),
            "mrt-row-actions",
          ],
          density: "compact",
        }}
        positionActionsColumn="last"
        renderRowActions={({ row }) => (
          <Box
            sx={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}
          >
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
                onChange={(e) => {
                  setStatsPeriod(e.target.value);
                  // Llamar a getStatsData inmediatamente cuando cambia el período
                  setTimeout(() => getStatsData(e.target.value), 10);
                }}
                label="Período"
              >
                <MenuItem value="week">Última Semana</MenuItem>
                <MenuItem value="month">Último Mes</MenuItem>
                <MenuItem value="year">Último Año</MenuItem>
              </Select>
            </FormControl>
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

      {/* Diálogo de filtros avanzados */}
    </div>
  );
};

export default InventoryHistoryComponent;
