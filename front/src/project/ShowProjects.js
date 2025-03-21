import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import {
  Button,
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

const URI = "http://localhost:8000/projects/";

const CompShowProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  useEffect(() => {
    getProjects();
  }, []);

  const getProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await axios.get(URI, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects(res.data);
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los proyectos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `${URI}${projectId}/status`,
        { estado: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      getProjects();
      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `Proyecto ${newStatus.toLowerCase()} correctamente`,
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error al actualizar el estado",
      });
    }
  };

  const deleteProject = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el proyecto y liberará todas las reservas",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("authToken");
        await axios.delete(`${URI}${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire("Eliminado", "El proyecto ha sido eliminado", "success");
        getProjects();
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire("Error", "No se pudo eliminar el proyecto", "error");
      }
    }
  };

  const getStatusActions = (currentStatus) => {
    const actions = [];
    switch (currentStatus) {
      case "PLANIFICACION":
        actions.push({
          status: "EN_PROGRESO",
          icon: <PlayArrowIcon />,
          tooltip: "Iniciar Proyecto",
        });
        actions.push({
          status: "CANCELADO",
          icon: <CancelIcon />,
          tooltip: "Cancelar Proyecto",
        });
        break;
      case "EN_PROGRESO":
        actions.push({
          status: "PAUSADO",
          icon: <PauseIcon />,
          tooltip: "Pausar Proyecto",
        });
        actions.push({
          status: "COMPLETADO",
          icon: <CheckCircleIcon />,
          tooltip: "Completar Proyecto",
        });
        actions.push({
          status: "CANCELADO",
          icon: <CancelIcon />,
          tooltip: "Cancelar Proyecto",
        });
        break;
      case "PAUSADO":
        actions.push({
          status: "EN_PROGRESO",
          icon: <PlayArrowIcon />,
          tooltip: "Reanudar Proyecto",
        });
        actions.push({
          status: "CANCELADO",
          icon: <CancelIcon />,
          tooltip: "Cancelar Proyecto",
        });
        break;
      default:
        break;
    }
    return actions;
  };

  const handleExportPDF = (filteredRows) => {
    const doc = new jsPDF();
    const dataToExport = filteredRows
      ? filteredRows.map((row) => row.original)
      : projects;

    const addHeader = (doc) => {
      // Fondo del encabezado
      doc.setFillColor(63, 81, 181);
      doc.rect(0, 0, doc.internal.pageSize.width, 65, "F");

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.rect(15, 5, 40, 40, "S");
      doc.addImage("images/logo.png", "PNG", 15, 5, 40, 40);

      // Información de la empresa en blanco
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("FERRETERÍA KAVITO", 60, 25);

      doc.setFontSize(10);
      doc.text(
        "Dirección: Calle Boqueron N°1355 entre Colombia y Almirante Grau",
        60,
        35
      );
      doc.text("Teléfono: 76788361", 60, 40);
      doc.text("Email: ", 60, 45);

      // Línea decorativa
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(15, 60, 195, 60);
    };

    // Título del reporte con estilo
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 65, doc.internal.pageSize.width, 20, "F");
    doc.setTextColor(63, 81, 181);
    doc.setFontSize(16);
    doc.text("REPORTE DE PROYECTOS", doc.internal.pageSize.width / 2, 78, {
      align: "center",
    });

    // Fecha con ícono
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 15, 90);

    // Estadísticas en cajas
    const statsY = 100;
    const statsHeight = 25;

    // Caja de estadísticas
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(63, 81, 181);
    doc.setLineWidth(0.1);
    doc.roundedRect(15, statsY, 180, statsHeight, 3, 3, "FD");

    doc.setTextColor(63, 81, 181);
    doc.setFontSize(12);
    doc.text("Resumen de Proyectos", 20, statsY + 8);

    // Datos estadísticos
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    const totalProyectos = dataToExport.length;

    // Estadísticas en línea
    let statsLine = `Total: ${totalProyectos} | `;
    Object.entries(
      dataToExport.reduce((acc, project) => {
        acc[project.estado] = (acc[project.estado] || 0) + 1;
        return acc;
      }, {})
    ).forEach(([estado, cantidad]) => {
      statsLine += `${estado}: ${cantidad} | `;
    });
    doc.text(statsLine, 20, statsY + 18);

    // Preparar datos para la tabla
    const tableRows = dataToExport.map((project, index) => [
      index + 1,
      project.nombre,
      project.products
        ?.map(
          (p) => `• ${p.descripcion} (${p.project_products.cantidad_requerida})`
        )
        .join(" ") || "Sin productos",
      project.estado,
      new Date(project.fecha_inicio).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
      new Date(project.fecha_entrega).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
      project.prioridad,
    ]);

    // Tabla con nuevos estilos
    autoTable(doc, {
      head: [
        [
          "#",
          "Nombre",
          "Productos Requeridos",
          "Estado",
          "Inicio",
          "Entrega",
          "Prioridad",
        ],
      ],
      body: tableRows,
      startY: statsY + statsHeight + 10,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
        halign: "left",
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 35 },
        2: {
          cellWidth: 55,
          whiteSpace: "wrap",
          cellPadding: 3,
        },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 20, halign: "center" },
        6: { cellWidth: 20, halign: "center" },
      },
      didDrawPage: function (data) {
        addHeader(doc);
      },
      margin: { top: 70, left: 15, right: 15 },
    });

    // Pie de página con nuevo estilo
    const addFooter = (doc) => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setDrawColor(63, 81, 181);
        doc.setLineWidth(0.5);
        doc.line(
          15,
          doc.internal.pageSize.height - 20,
          doc.internal.pageSize.width - 15,
          doc.internal.pageSize.height - 20
        );

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
        doc.text(
          "© 2024 Ferretería KAVITO - Todos los derechos reservados",
          15,
          doc.internal.pageSize.height - 10
        );
      }
    };

    addFooter(doc);
    doc.save("reporte-proyectos.pdf");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "#",
        size: 50,
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        size: 150,
      },
      {
        header: "Productos",
        size: 250,
        Cell: ({ row }) => (
          <Stack spacing={1}>
            {row.original.products?.map((product) => (
              <Chip
                key={product.id}
                label={
                  <Typography variant="caption">
                    {`${product.descripcion} (${product.project_products.cantidad_entregada}/${product.project_products.cantidad_requerida})`}
                  </Typography>
                }
                color={
                  product.project_products.cantidad_entregada >=
                  product.project_products.cantidad_requerida
                    ? "success"
                    : product.project_products.cantidad_entregada > 0
                    ? "warning"
                    : "default"
                }
                size="small"
                variant={
                  product.project_products.cantidad_reservada > 0
                    ? "filled"
                    : "outlined"
                }
              />
            ))}
          </Stack>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        size: 120,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            color={getStatusColor(cell.getValue())}
            size="small"
          />
        ),
      },
      {
        accessorKey: "fecha_inicio",
        header: "Fecha Inicio",
        Cell: ({ cell }) => {
          const dateValue = cell.getValue();
          // Añadir T12:00:00 para establecer la hora al mediodía y evitar problemas de zona horaria
          const date = new Date(`${dateValue.split("T")[0]}T12:00:00`);
          return date.toLocaleDateString();
        },
      },
      {
        accessorKey: "fecha_entrega",
        header: "Fecha Entrega",
        Cell: ({ cell }) => {
          const dateValue = cell.getValue();
          const date = new Date(`${dateValue.split("T")[0]}T12:00:00`);
          return date.toLocaleDateString();
        },
      },
      {
        accessorKey: "prioridad",
        header: "Prioridad",
        size: 100,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            color={getPriorityColor(cell.getValue())}
            size="small"
            variant="outlined"
          />
        ),
      },
    ],
    []
  );

  const getStatusColor = (status) => {
    const colors = {
      PLANIFICACION: "info",
      EN_PROGRESO: "primary",
      PAUSADO: "warning",
      COMPLETADO: "success",
      CANCELADO: "danger",
    };
    return colors[status] || "default";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      BAJA: "success",
      MEDIA: "warning",
      ALTA: "danger",
    };
    return colors[priority] || "secondary";
  };

  return (
    <div className="container">
      <h1 style={{ color: "black", fontWeight: 800, fontSize: "2rem" }}>
        PROYECTOS
      </h1>
      <div className="row">
        <div className="col">
          <Link to="/projects/create" className="btn btn-primary mt-2 mb-2">
            <i className="fa-regular fa-square-plus"></i> NUEVO PROYECTO
          </Link>

          <MaterialReactTable
            columns={columns}
            data={projects}
            enableRowActions
            state={{ isLoading: loading }}
            renderTopToolbarCustomActions={({ table }) => (
              <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
                <Button
                  color="error"
                  onClick={() =>
                    handleExportPDF(table.getFilteredRowModel().rows)
                  }
                  startIcon={<PictureAsPdfIcon />}
                  variant="contained"
                >
                  Generar Reporte
                </Button>
              </Box>
            )}
            renderRowActions={({ row }) => (
              <Box sx={{ display: "flex", gap: "0.5rem" }}>
                {getStatusActions(row.original.estado).map((action) => (
                  <Tooltip key={action.status} title={action.tooltip}>
                    <IconButton
                      color="primary"
                      onClick={() =>
                        handleStatusChange(row.original.id, action.status)
                      }
                    >
                      {action.icon}
                    </IconButton>
                  </Tooltip>
                ))}
                <Tooltip title="Ver Detalles">
                  <IconButton
                    color="info"
                    component={Link}
                    to={`/projects/details/${row.original.id}`}
                  >
                    <AssignmentIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton
                    color="error"
                    onClick={() => deleteProject(row.original.id)}
                    disabled={row.original.estado === "COMPLETADO"}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            muiTableBodyRowProps={({ row }) => ({
              sx: {
                backgroundColor:
                  row.original.estado === "COMPLETADO"
                    ? "rgba(76, 175, 80, 0.1)"
                    : row.original.estado === "CANCELADO"
                    ? "rgba(244, 67, 54, 0.1)"
                    : "inherit",
              },
            })}
            localization={{
              noRecordsToDisplay: "No hay proyectos registrados",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CompShowProjects;
