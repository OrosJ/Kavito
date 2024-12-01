import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import { Button, IconButton, Tooltip, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const URI = "http://localhost:8000/projects/";

const CompShowProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects();
  }, []);

  const getProjects = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(URI, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects(res.data);
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
    }
  };

  const deleteProject = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${URI}${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      getProjects();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleExportPDF = (filteredRows) => {
    const doc = new jsPDF();
    const dataToExport = filteredRows ? 
        filteredRows.map(row => row.original) : 
        projects;

    const addHeader = (doc) => {
        // Fondo del encabezado
        doc.setFillColor(63, 81, 181);
        doc.rect(0, 0, doc.internal.pageSize.width, 65, 'F');

        // Espacio para logo con borde blanco
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.rect(15, 15, 40, 40, 'S');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('(Logo)', 27, 35);

        // Información de la empresa en blanco
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text('FERRETERÍA KAVITO', 60, 30);
        
        doc.setFontSize(10);
        doc.text('Dirección: [Tu dirección aquí]', 60, 40);
        doc.text('Teléfono: [Tu teléfono]', 60, 45);
        doc.text('Email: [Tu email]', 60, 50);

        // Línea decorativa
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(15, 60, 195, 60);
    };

    // Título del reporte con estilo
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 65, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(63, 81, 181);
    doc.setFontSize(16);
    doc.text('REPORTE DE PROYECTOS', doc.internal.pageSize.width/2, 78, { align: 'center' });

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
    doc.roundedRect(15, statsY, 180, statsHeight, 3, 3, 'FD');

    doc.setTextColor(63, 81, 181);
    doc.setFontSize(12);
    doc.text('Resumen de Proyectos', 20, statsY + 8);
    
    // Datos estadísticos
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    const totalProyectos = dataToExport.length;
    
    // Estadísticas en línea
    let statsLine = `Total: ${totalProyectos} | `;
    Object.entries(dataToExport.reduce((acc, project) => {
        acc[project.estado] = (acc[project.estado] || 0) + 1;
        return acc;
    }, {})).forEach(([estado, cantidad]) => {
        statsLine += `${estado}: ${cantidad} | `;
    });
    doc.text(statsLine, 20, statsY + 18);

    // Preparar datos para la tabla
    const tableRows = dataToExport.map((project, index) => [
        index + 1,
        project.nombre,
        project.products
            ?.map(p => `• ${p.descripcion} (${p.project_products.cantidad_requerida})`)
            .join(' ') || 'Sin productos',
        project.estado,
        new Date(project.fecha_inicio).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }),
        new Date(project.fecha_entrega).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }),
        project.prioridad
    ]);

    // Tabla con nuevos estilos
    autoTable(doc, {
        head: [['#', 'Nombre', 'Productos Requeridos', 'Estado', 'Inicio', 'Entrega', 'Prioridad']],
        body: tableRows,
        startY: statsY + statsHeight + 10,
        styles: { 
            fontSize: 8, 
            cellPadding: 3,
            overflow: 'linebreak',
            halign: 'left'
        },
        headStyles: {
            fillColor: [63, 81, 181],
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: { 
            fillColor: [245, 245, 245] 
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 35 },
            2: { 
                cellWidth: 55,
                whiteSpace: 'wrap',
                cellPadding: 3
            },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 20, halign: 'center' },
            6: { cellWidth: 20, halign: 'center' }
        },
        didDrawPage: function(data) {
            addHeader(doc);
        },
        margin: { top: 70, left: 15, right: 15 }
    });

    // Pie de página con nuevo estilo
    const addFooter = (doc) => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            doc.setDrawColor(63, 81, 181);
            doc.setLineWidth(0.5);
            doc.line(15, doc.internal.pageSize.height - 20, doc.internal.pageSize.width - 15, doc.internal.pageSize.height - 20);

            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(
                `Página ${i} de ${pageCount}`,
                doc.internal.pageSize.width - 30,
                doc.internal.pageSize.height - 10
            );
            doc.text(
                '© 2024 Ferretería KAVITO - Todos los derechos reservados',
                15,
                doc.internal.pageSize.height - 10
            );
        }
    };

    addFooter(doc);
    doc.save('reporte-proyectos.pdf');
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
        header: "Productos Requeridos",
        accessorFn: (row) =>
          row.products
            ?.map(
              (p) =>
                `${p.descripcion} (${p.project_products.cantidad_requerida})`
            )
            .join(", "),
        size: 200,
      },
      {
        accessorKey: "estado",
        header: "Estado",
        Cell: ({ cell }) => (
          <span className={`badge bg-${getStatusColor(cell.getValue())}`}>
            {cell.getValue()}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "fecha_inicio",
        header: "Fecha Inicio",
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(),
      },
      {
        accessorKey: "fecha_entrega",
        header: "Fecha Entrega",
        Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString(),
      },
      {
        accessorKey: "prioridad",
        header: "Prioridad",
        Cell: ({ cell }) => (
          <span className={`badge bg-${getPriorityColor(cell.getValue())}`}>
            {cell.getValue()}
          </span>
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
    return colors[status] || "secondary";
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
      <h1 style={{ color: "black", fontWeight: 800, fontSize: "2rem" }}>PROYECTOS</h1>
      <div className="row">
        <div className="col">
          <Link to="/projects/create" className="btn btn-primary mt-2 mb-2">
            <i className="fa-regular fa-square-plus"></i> NUEVO PROYECTO
          </Link>

          {projects.length > 0 ? (
            <MaterialReactTable
              columns={columns}
              data={projects}
              enableRowActions
              renderTopToolbarCustomActions={({ table }) => (
                <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
                  <Button
                    color="error"
                    onClick={() =>
                      handleExportPDF(table.getFilteredRowModel().rows)
                    }
                    startIcon={<PictureAsPdfIcon/>}
                    variant="contained"
                  >
                    Generar Reporte
                  </Button>
                </Box>
              )}
              renderRowActions={({ row }) => (
                <Box sx={{ display: "flex", gap: "0.5rem" }}>
                  <Tooltip title="Editar">
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/projects/edit/${row.original.id}`}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
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
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              positionActionsColumn="last"
            />
          ) : (
            <p>No hay proyectos registrados</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompShowProjects;
