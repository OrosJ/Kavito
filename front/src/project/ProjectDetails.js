import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  LinearProgress,
  Paper,
  Select,
} from "@mui/material";

import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import {
  Receipt as ReceiptIcon,
  BookmarkAdd as BookmarkAddIcon,
  LocalShipping as LocalShippingIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  PictureAsPdf as PdfIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineDot,
  TimelineConnector,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";

import Swal from "sweetalert2";

const CompProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [actionQuantity, setActionQuantity] = useState(1);
  const [actionType, setActionType] = useState("reserve");
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [latestDeliveryOut, setLatestDeliveryOut] = useState(null);
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectClient, setProjectClient] = useState("");
  const [projectStartDate, setProjectStartDate] = useState(null);
  const [projectEndDate, setProjectEndDate] = useState(null);
  const [projectBudget, setProjectBudget] = useState(0);
  const [projectProducts, setProjectProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [clients, setClients] = useState([]);

  // Effect hooks
  useEffect(() => {
    if (id) {
      getProject();
    }
  }, [id]);

  useEffect(() => {
    if (project) {
      setProjectName(project.nombre || "");
      setProjectDescription(project.descripcion || "");
      setProjectClient(project?.client_id?.toString() || "");
      setProjectStartDate(project.fecha_inicio || "");
      setProjectEndDate(project.fecha_entrega || "");
      setProjectBudget(project.costo || 0);
      setProjectProducts(project.products || []);
    }
  }, [project]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/products", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setAvailableProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (editMode) {
      fetchProducts();
    }
  }, [editMode]);

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      PLANIFICACION: "info",
      EN_PROGRESO: "primary",
      PAUSADO: "warning",
      COMPLETADO: "success",
      CANCELADO: "error",
    };
    return colors[status] || "default";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      BAJA: "success",
      MEDIA: "warning",
      ALTA: "error",
    };
    return colors[priority] || "default";
  };

  const getProductStatusColor = (status) => {
    const colors = {
      PENDIENTE: "default",
      RESERVADO: "primary",
      EN_PROCESO: "warning",
      ENTREGADO: "success",
      CANCELADO: "error",
    };
    return colors[status] || "default";
  };

  const getHistoryStatusColor = (tipo) => {
    const colors = {
      RESERVA: "primary",
      ENTREGA: "success",
      CANCELACION: "error",
      MODIFICACION: "info",
    };
    return colors[tipo] || "default";
  };

  const getProjectProgress = (project) => {
    if (!project.products || project.products.length === 0) return 0;
    const totalProducts = project.products.length;
    const completedProducts = project.products.filter(
      (p) =>
        p.project_products.cantidad_entregada >=
        p.project_products.cantidad_requerida
    ).length;
    return Math.round((completedProducts / totalProducts) * 100);
  };

  const getProject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`http://localhost:8000/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProject(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Error al cargar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableActions = (currentStatus) => {
    if (!currentStatus) return [];
    const actions = [];
    switch (currentStatus) {
      case "PLANIFICACION":
        actions.push({
          status: "EN_PROGRESO",
          label: "Iniciar",
          icon: <PlayArrowIcon />,
          color: "primary",
        });
        break;
      case "EN_PROGRESO":
        actions.push(
          {
            status: "PAUSADO",
            label: "Pausar",
            icon: <PauseIcon />,
            color: "warning",
          },
          {
            status: "COMPLETADO",
            label: "Completar",
            icon: <CheckCircleIcon />,
            color: "success",
          }
        );
        break;
      case "PAUSADO":
        actions.push({
          status: "EN_PROGRESO",
          label: "Reanudar",
          icon: <PlayArrowIcon />,
          color: "primary",
        });
        break;
    }
    return actions;
  };

  // handlers
  const handleReserveProduct = (product) => {
    const isFullyReserved =
      product.project_products.cantidad_reservada ===
      product.project_products.cantidad_requerida;

    if (isFullyReserved) {
      Swal.fire({
        title: "¿Liberar Reserva?",
        text: "Se liberarán los productos reservados y volverán a estar disponibles en stock",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, Liberar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          releaseProductReservation(product);
        }
      });
    } else {
      setSelectedProduct(product);
      setActionType("reserve");
      setActionQuantity(1);
      setReserveDialogOpen(true);
    }
  };

  const confirmReservation = async () => {
    try {
      if (!selectedProduct || !actionQuantity) return;

      // Verificar que no exceda la cantidad máxima a reservar
      const cantidadMaxima =
        selectedProduct.project_products.cantidad_requerida -
        selectedProduct.project_products.cantidad_reservada;

      if (parseInt(actionQuantity) > cantidadMaxima) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `No puedes reservar más de ${cantidadMaxima} unidades para este producto.`,
        });
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/project-products/${selectedProduct.project_products.id}/reserve`,
        { cantidad: parseInt(actionQuantity) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      getProject();
      setSelectedProduct(null);
      setReserveDialogOpen(false);
      setActionQuantity(1);

      Swal.fire({
        icon: "success",
        title: "Reserva Exitosa",
        text: "Los productos han sido reservados correctamente",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "Error al reservar los productos",
      });
    }
  };

  const handleDeliverProduct = (product) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        Swal.fire("Error", "No hay sesión activa", "error");
        return;
      }

      Swal.fire({
        title: "¿Entregar Productos?",
        text: "Se generará una salida de inventario para los productos entregados",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, Entregar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          setSelectedProduct(product);
          setDeliveryDialogOpen(true);

          // Establecer la cantidad máxima disponible para entrega
          const cantidadDisponible = Math.min(
            product.project_products.cantidad_requerida -
              product.project_products.cantidad_entregada,
            product.cantidad -
              (product.cantidad_reservada -
                product.project_products.cantidad_reservada)
          );

          // Pre-establecer la cantidad a entregar como el mínimo entre la cantidad pendiente y la cantidad reservada (si hay reserva)
          const cantidadReservada =
            product.project_products.cantidad_reservada || 0;
          const cantidadPendiente =
            product.project_products.cantidad_requerida -
            product.project_products.cantidad_entregada;

          // Priorizar usar las reservas existentes
          setActionQuantity(
            Math.min(cantidadReservada, cantidadPendiente) || 1
          );
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const confirmDelivery = async () => {
    try {
      if (!selectedProduct || !actionQuantity) return;

      const response = await axios.post(
        `http://localhost:8000/project-products/${selectedProduct.project_products.id}/deliver-p`,
        { cantidad: parseInt(actionQuantity) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      // Manejo flexible de la estructura de respuesta
      console.log("Respuesta completa:", response.data);

      // Intentar obtener inventoryOut de diferentes estructuras posibles
      const inventoryOut =
        response.data.respuesta?.inventoryOut ||
        response.data.inventoryOut ||
        response.data;

      // Verificar que tenemos los datos necesarios
      if (!inventoryOut || !inventoryOut.codigo) {
        console.error("Estructura de respuesta inesperada:", response.data);
        throw new Error("No se pudo obtener la información de la salida");
      }

      setLatestDeliveryOut(inventoryOut);
      getProject();
      setSelectedProduct(null);
      setDeliveryDialogOpen(false);
      setActionQuantity(1);

      Swal.fire({
        icon: "success",
        title: "Entrega Exitosa",
        html: `
          <p>Se han entregado los productos correctamente</p>
          <p>Salida de inventario generada:</p>
          <p>Código: ${inventoryOut.codigo}</p>
          <p>Total: Bs. ${parseFloat(inventoryOut.total).toFixed(2)}</p>
        `,
      });
    } catch (error) {
      console.error("Error completo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "Error al entregar los productos",
      });
    }
  };

  const releaseProductReservation = async (product) => {
    try {
      await axios.put(
        `http://localhost:8000/project-products/${product.project_products.id}/release`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      getProject();
      Swal.fire(
        "Liberado",
        "Los productos han sido liberados correctamente",
        "success"
      );
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al liberar productos",
        "error"
      );
    }
  };

  const handleShowHistory = async (product) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `http://localhost:8000/project-products/${product.project_products.id}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedHistory(response.data);
    } catch (error) {
      Swal.fire(
        "Error",
        "No se pudo obtener el historial del producto",
        "error"
      );
    }
  };

  // Project status management
  const handleProjectCompletion = async () => {
    const pendingProducts = project.products.filter(
      (product) =>
        product.project_products.cantidad_entregada <
        product.project_products.cantidad_requerida
    );

    let dialog;
    if (pendingProducts.length > 0) {
      let pendingList = pendingProducts
        .map(
          (p) =>
            `- ${p.descripcion}: ${
              p.project_products.cantidad_requerida -
              p.project_products.cantidad_entregada
            } pendientes`
        )
        .join("\n");

      dialog = {
        title: "Productos Pendientes",
        html: `Los siguientes productos aún no han sido entregados completamente:<br/><pre>${pendingList}</pre>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Completar y Entregar Pendientes",
        cancelButtonText: "Cancelar",
      };
    } else {
      dialog = {
        title: "¿Completar Proyecto?",
        text: "Todos los productos han sido entregados. ¿Desea completar el proyecto?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, Completar",
        cancelButtonText: "Cancelar",
      };
    }

    const result = await Swal.fire(dialog);
    if (result.isConfirmed) {
      completeProject();
    }
  };

  const completeProject = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        Swal.fire("Error", "No hay sesión activa", "error");
        return;
      }
      const response = await axios.put(
        `http://localhost:8000/projects/${project.id}/status`,
        {
          estado: "COMPLETADO",
          notas: "Proyecto completado con entrega de productos pendientes",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.data.inventoryOut) {
        Swal.fire({
          title: "Proyecto Completado",
          html: `
            Se ha completado el proyecto y generado la salida:<br/>
            Código: ${response.data.inventoryOut.codigo}<br/>
            Total: Bs. ${response.data.inventoryOut.total.toFixed(2)}
          `,
          icon: "success",
        });
      } else {
        Swal.fire(
          "Completado",
          "El proyecto ha sido completado exitosamente",
          "success"
        );
      }

      getProject();
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al completar el proyecto",
        "error"
      );
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === "COMPLETADO") {
      handleProjectCompletion();
    } else {
      setSelectedStatus(newStatus);
      setStatusDialog(true);
    }
  };

  const confirmStatusChange = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `http://localhost:8000/projects/${id}/status`,
        {
          estado: selectedStatus,
          notas: statusNote,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatusDialog(false);
      getProject();
      Swal.fire("Éxito", "Estado actualizado correctamente", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al actualizar estado",
        "error"
      );
    }
  };

  const renderCancelButton = () => {
    if (!project?.estado) return null;

    const isDisabled = ["COMPLETADO", "CANCELADO"].includes(project.estado);

    return (
      <Button
        variant="outlined"
        color="error"
        startIcon={<CancelIcon />}
        onClick={() => handleStatusChange("CANCELADO")}
        disabled={isDisabled}
      >
        Cancelar Proyecto
      </Button>
    );
  };

  // Edit mode functions
  const handleSaveProject = async () => {
    try {
      const productosFormateados = [...project.products, ...newProducts].map(
        (p) => ({
          product_id: p.id,
          cantidad_requerida: p.project_products.cantidad_requerida,
          fecha_requerida: null,
        })
      );

      const token = localStorage.getItem("authToken");
      await axios.put(
        `http://localhost:8000/projects/${id}`,
        {
          nombre: projectName,
          descripcion: projectDescription,
          fecha_inicio: projectStartDate,
          fecha_entrega: projectEndDate,
          productos: productosFormateados,
          client_id: projectClient,
          presupuesto: projectBudget,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEditMode(false);
      getProject();
      Swal.fire("Éxito", "Proyecto actualizado correctamente", "success");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error al actualizar el proyecto",
        "error"
      );
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setProjectName(project.nombre);
    setProjectDescription(project.descripcion);
    setProjectClient(project.client_id);
    setProjectStartDate(project.fecha_inicio);
    setProjectEndDate(project.fecha_entrega);
    setProjectBudget(project.presupuesto);
    setNewProducts([]);
  };

  // Product management
  const handleRemoveProduct = async (product) => {
    const result = await Swal.fire({
      title: "¿Está seguro?",
      text:
        product.project_products.cantidad_reservada > 0
          ? "Se liberarán las reservas existentes para este producto"
          : "¿Desea eliminar este producto del proyecto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        if (product.project_products.cantidad_reservada > 0) {
          await axios.put(
            `http://localhost:8000/project-products/${product.project_products.id}/release`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
        }

        setProject((prevProject) => ({
          ...prevProject,
          products: prevProject.products.filter((p) => p.id !== product.id),
        }));

        Swal.fire(
          "Eliminado",
          "El producto ha sido eliminado del proyecto",
          "success"
        );
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el producto", "error");
      }
    }
  };

  const handleAddNewProduct = (productId) => {
    const product = availableProducts.find((p) => p.id === parseInt(productId));
    setNewProducts([
      ...newProducts,
      {
        ...product,
        project_products: {
          productId: product.id,
          cantidad_requerida: 1,
          cantidad_reservada: 0,
          cantidad_entregada: 0,
          estado: "PENDIENTE",
        },
      },
    ]);
  };

  const handleUpdateExistingProductQuantity = (productId, quantity) => {
    setProject((prevProject) => ({
      ...prevProject,
      products: prevProject.products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            project_products: {
              ...p.project_products,
              cantidad_requerida: parseInt(quantity) || 1,
            },
          };
        }
        return p;
      }),
    }));
  };

  const handleUpdateNewProductQuantity = (productId, quantity) => {
    setNewProducts(
      newProducts.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            project_products: {
              ...p.project_products,
              cantidad_requerida: parseInt(quantity) || 1,
            },
          };
        }
        return p;
      })
    );
  };

  const handleRemoveNewProduct = (productId) => {
    setNewProducts(newProducts.filter((p) => p.id !== productId));
  };

  // Render functions
  const renderProductActions = (product) => {
    const isFullyReserved =
      product.project_products.cantidad_reservada ===
      product.project_products.cantidad_requerida;

    return (
      <Stack direction="row" spacing={1} justifyContent="center">
        {/* Botón de Reserva */}
        {project.estado === "COMPLETADO" || project.estado === "CANCELADO" ? (
          <Tooltip title="No disponible en el estado actual">
            <span>
              <IconButton
                size="small"
                color={isFullyReserved ? "warning" : "primary"}
                disabled
              >
                {isFullyReserved ? <CancelIcon /> : <BookmarkAddIcon />}
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Tooltip title={isFullyReserved ? "Liberar Reserva" : "Reservar"}>
            <IconButton
              size="small"
              color={isFullyReserved ? "warning" : "primary"}
              onClick={() => handleReserveProduct(product)}
            >
              {isFullyReserved ? <CancelIcon /> : <BookmarkAddIcon />}
            </IconButton>
          </Tooltip>
        )}

        {/* Botón de Entrega */}
        {project.estado !== "EN_PROGRESO" ? (
          <Tooltip title="Solo disponible cuando el proyecto está en progreso">
            <span>
              <IconButton size="small" color="success" disabled>
                <LocalShippingIcon />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Entregar">
            <IconButton
              size="small"
              color="success"
              onClick={() => handleDeliverProduct(product)}
            >
              <LocalShippingIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Botón de Comprobante */}
        {product.project_products.cantidad_entregada > 0 && (
          <Tooltip title="Ver Comprobante">
            <IconButton
              size="small"
              color="info"
              component={Link}
              to={`/inventory/outputs/${latestDeliveryOut?.id}`}
            >
              <ReceiptIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* Botón de Historial */}
        <Tooltip title="Ver Historial">
          <IconButton
            size="small"
            color="info"
            onClick={() => handleShowHistory(product)}
          >
            <HistoryIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  };

  const renderDialogs = () => (
    <>
      {/* Delivery Dialog */}
      <Dialog
        open={deliveryDialogOpen}
        onClose={() => {
          setDeliveryDialogOpen(false);
          setSelectedProduct(null);
        }}
      >
        <DialogTitle>
          Entregar Producto: {selectedProduct?.descripcion}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Pendiente por entregar:{" "}
              {selectedProduct
                ? selectedProduct.project_products.cantidad_requerida -
                  selectedProduct.project_products.cantidad_entregada
                : 0}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Cantidad reservada:{" "}
              {selectedProduct
                ? selectedProduct.project_products.cantidad_reservada
                : 0}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Precio unitario: Bs.{" "}
              {parseFloat(selectedProduct?.precio || 0).toFixed(2)}
            </Typography>
            <TextField
              type="number"
              label="Cantidad a Entregar"
              fullWidth
              margin="normal"
              value={actionQuantity}
              onChange={(e) => setActionQuantity(e.target.value)}
              inputProps={{
                min: 1,
                max: selectedProduct
                  ? selectedProduct.project_products.cantidad_requerida -
                    selectedProduct.project_products.cantidad_entregada
                  : 1,
              }}
            />
            {actionQuantity && selectedProduct?.precio && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total: Bs.{" "}
                {(actionQuantity * selectedProduct.precio).toFixed(2)}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeliveryDialogOpen(false);
              setSelectedProduct(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelivery}
            variant="contained"
            color="primary"
            startIcon={<LocalShippingIcon />}
          >
            Entregar y Generar Salida
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
        <DialogTitle>Cambiar estado del proyecto</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notas"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancelar</Button>
          <Button
            onClick={confirmStatusChange}
            variant="contained"
            color="primary"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Historial del Producto</DialogTitle>
        <DialogContent>
          <Timeline>
            {selectedHistory?.map((record, index) => (
              <TimelineItem key={index}>
                <TimelineOppositeContent color="textSecondary">
                  {new Date(record.createdAt).toLocaleString()}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot
                    color={getHistoryStatusColor(record.tipo_cambio)}
                  />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body2">
                    <strong>{record.tipo_cambio}</strong>: {record.cantidad}{" "}
                    unidades
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {record.motivo}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </DialogContent>
      </Dialog>
      <Dialog
        open={reserveDialogOpen}
        onClose={() => {
          setReserveDialogOpen(false);
          setSelectedProduct(null);
        }}
      >
        <DialogTitle>
          Reservar Producto: {selectedProduct?.descripcion}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Cantidad máxima a reservar:{" "}
              {selectedProduct
                ? selectedProduct.project_products.cantidad_requerida -
                  selectedProduct.project_products.cantidad_reservada
                : 0}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Cantidad requerida total:</strong>{" "}
              {selectedProduct
                ? selectedProduct.project_products.cantidad_requerida
                : 0}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Ya reservado:</strong>{" "}
              {selectedProduct
                ? selectedProduct.project_products.cantidad_reservada
                : 0}
            </Typography>
            <TextField
              type="number"
              label="Cantidad a Reservar"
              fullWidth
              margin="normal"
              value={actionQuantity}
              onChange={(e) => setActionQuantity(e.target.value)}
              inputProps={{
                min: 1,
                max: selectedProduct
                  ? selectedProduct.project_products.cantidad_requerida -
                    selectedProduct.project_products.cantidad_reservada
                  : 1,
              }}
              error={
                selectedProduct &&
                parseInt(actionQuantity) >
                  selectedProduct.project_products.cantidad_requerida -
                    selectedProduct.project_products.cantidad_reservada
              }
              helperText={
                selectedProduct &&
                parseInt(actionQuantity) >
                  selectedProduct.project_products.cantidad_requerida -
                    selectedProduct.project_products.cantidad_reservada
                  ? "La cantidad excede el máximo permitido"
                  : ""
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setReserveDialogOpen(false);
              setSelectedProduct(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmReservation}
            variant="contained"
            color="primary"
            startIcon={<BookmarkAddIcon />}
          >
            Reservar Productos
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  // render
  if (loading) return <Box p={3}>Cargando proyecto...</Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!project) return <Alert severity="warning">Proyecto no encontrado</Alert>;

  return (
    <Box p={3}>
      {/* Project Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* Title and Description */}
            <Grid item xs={12} md={8}>
              {editMode ? (
                <TextField
                  label="Nombre del Proyecto"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
              ) : (
                <Typography variant="h4" gutterBottom>
                  {project.nombre}
                </Typography>
              )}
              {editMode ? (
                <TextField
                  label="Descripción"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  multiline
                  rows={2}
                  fullWidth
                />
              ) : (
                <Typography color="textSecondary" gutterBottom>
                  {project.descripcion}
                </Typography>
              )}
            </Grid>

            {/* Status and Actions */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1} alignItems="flex-end">
                <Chip
                  label={project.estado}
                  color={getStatusColor(project.estado)}
                  size="medium"
                />
                <Chip
                  label={`Prioridad: ${project.prioridad}`}
                  color={getPriorityColor(project.prioridad)}
                  variant="outlined"
                />
                {!editMode && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Editar Proyecto
                  </Button>
                )}
              </Stack>
            </Grid>

            {/* Project Details */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  {/* Client */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Cliente
                      </Typography>
                      {editMode ? (
                        <Select
                          value={projectClient || ""}
                          onChange={(e) => setProjectClient(e.target.value)}
                          fullWidth
                        >
                          {clients.map((client) => (
                            <MenuItem key={client.id} value={client.id}>
                              {client.clientname}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <Typography variant="body1">
                          {project?.client?.clientname || "No asignado"}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  {/* Start Date */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Fecha Inicio
                      </Typography>
                      {editMode ? (
                        <input
                          type="date"
                          value={
                            typeof projectStartDate === "string"
                              ? projectStartDate.split("T")[0]
                              : projectStartDate
                          }
                          onChange={(e) => setProjectStartDate(e.target.value)}
                          style={{ width: "100%" }}
                        />
                      ) : (
                        <Typography variant="body1">
                          {new Date(project.fecha_inicio).toLocaleDateString()}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  {/* End Date */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Fecha Entrega
                      </Typography>
                      {editMode ? (
                        <input
                          type="date"
                          value={
                            typeof projectEndDate === "string"
                              ? projectEndDate.split("T")[0]
                              : projectEndDate
                          }
                          onChange={(e) => setProjectEndDate(e.target.value)}
                          style={{ width: "100%" }}
                        />
                      ) : (
                        <Typography variant="body1">
                          {new Date(project.fecha_entrega).toLocaleDateString()}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  {/* Budget */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Costo Total
                      </Typography>
                      {editMode ? (
                        <TextField
                          type="number"
                          value={projectBudget}
                          onChange={(e) => setProjectBudget(e.target.value)}
                          fullWidth
                        />
                      ) : (
                        <Typography variant="body1">
                          Bs. {parseFloat(project.costo).toFixed(2)}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Progress Bar */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Progreso del Proyecto
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getProjectProgress(project)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography
                  variant="caption"
                  sx={{ mt: 1 }}
                  color="textSecondary"
                >
                  {getProjectProgress(project)}% Completado
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Actions Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Acciones disponibles
          </Typography>
          <Stack direction="row" spacing={2}>
            {getAvailableActions(project.estado).map((action) => (
              <Button
                key={action.status}
                variant="contained"
                color={action.color}
                startIcon={action.icon}
                onClick={() => handleStatusChange(action.status)}
              >
                {action.label}
              </Button>
            ))}
            {renderCancelButton()}
          </Stack>
          {editMode && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveProject}
              sx={{ mt: 2 }}
            >
              Guardar Cambios
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Products Table Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Productos del Proyecto
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="center">Requerido</TableCell>
                  <TableCell align="center">Reservado</TableCell>
                  <TableCell align="center">Entregado</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {project.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.descripcion}</TableCell>
                    <TableCell align="center">
                      {editMode ? (
                        <TextField
                          type="number"
                          value={product.project_products.cantidad_requerida}
                          onChange={(e) =>
                            handleUpdateExistingProductQuantity(
                              product.id,
                              e.target.value
                            )
                          }
                          inputProps={{ min: 1 }}
                          size="small"
                        />
                      ) : (
                        product.project_products.cantidad_requerida
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.project_products.cantidad_reservada}
                        color={
                          product.project_products.cantidad_reservada > 0
                            ? "primary"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={
                            (product.project_products.cantidad_entregada /
                              product.project_products.cantidad_requerida) *
                            100
                          }
                          sx={{ width: "100px", mr: 1 }}
                        />
                        <Typography variant="body2">
                          {product.project_products.cantidad_entregada}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.project_products.estado}
                        color={getProductStatusColor(
                          product.project_products.estado
                        )}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {editMode ? (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveProduct(product)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      ) : (
                        renderProductActions(product)
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {editMode && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Nuevos Productos
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Select
                  value=""
                  onChange={(e) => handleAddNewProduct(e.target.value)}
                  sx={{ minWidth: 200 }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Seleccionar producto
                  </MenuItem>
                  {availableProducts
                    .filter(
                      (p) => !project.products.find((pp) => pp.id === p.id)
                    )
                    .map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.descripcion}
                      </MenuItem>
                    ))}
                </Select>
              </Box>
              {newProducts.length > 0 && (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="center">Cantidad Requerida</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {newProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.descripcion}</TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              value={
                                product.project_products.cantidad_requerida
                              }
                              onChange={(e) =>
                                handleUpdateNewProductQuantity(
                                  product.id,
                                  e.target.value
                                )
                              }
                              inputProps={{ min: 1 }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveNewProduct(product.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Render Dialogs */}
      {renderDialogs()}
    </Box>
  );
};

export default CompProjectDetails;
