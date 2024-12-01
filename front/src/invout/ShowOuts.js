import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MaterialReactTable } from "material-react-table";
import { Button, IconButton, Tooltip, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
      /* console.log("Datos recibidos:", res.data); */
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
        accessorKey: "codigo",
        header: "Código",
        size: 100,
      },
      {
        header: "Productos",
        accessorFn: (row) => row.productos.map((p) => p.descripcion).join(", "),
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
        accessorFn: (row) => row.productos.map((p) => p.cantidad).join(", "),
        Cell: ({ row }) => (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {row.original.productos?.map((producto, index) => (
              <span
                key={index}
                style={{ padding: "2px 0", textAlign: "center" }}
              >
                {producto.cantidad}
              </span>
            ))}
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "usuario",
        header: "Usuario",
        Cell: ({ row }) => row.original.usuario,
        size: 70,
      },
      {
        accessorKey: "total",
        header: "Total",
        Cell: ({ cell }) => `Bs. ${parseFloat(cell.getValue()).toFixed(2)}`,
        size: 100,
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
          return date.toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
    ],
    []
  );

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const dataToExport = invouts;

    const addHeader = (doc) => {
      doc.setFillColor(63, 81, 181);
      doc.rect(0, 0, doc.internal.pageSize.width, 65, "F");

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.rect(15, 15, 40, 40, "S");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("(Logo)", 27, 35);

      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("FERRETERÍA KAVITO", 60, 30);

      doc.setFontSize(10);
      doc.text("Dirección: [Tu dirección aquí]", 60, 40);
      doc.text("Teléfono: [Tu teléfono]", 60, 45);
      doc.text("Email: [Tu email]", 60, 50);

      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(15, 60, 195, 60);
    };

    doc.setFillColor(240, 240, 240);
    doc.rect(0, 65, doc.internal.pageSize.width, 20, "F");
    doc.setTextColor(63, 81, 181);
    doc.setFontSize(16);
    doc.text("REPORTE DE SALIDAS", doc.internal.pageSize.width / 2, 78, {
      align: "center",
    });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 15, 90);

    const statsY = 100;
    const statsHeight = 25;

    const totalSalidas = dataToExport.length;
    const totalProductosEntregados = dataToExport.reduce(
      (sum, salida) =>
        sum + salida.productos.reduce((pSum, prod) => pSum + prod.cantidad, 0),
      0
    );

    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(63, 81, 181);
    doc.setLineWidth(0.1);
    doc.roundedRect(15, statsY, 180, statsHeight, 3, 3, "FD");

    doc.setTextColor(63, 81, 181);
    doc.setFontSize(12);
    doc.text("Resumen de Salidas", 20, statsY + 8);

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(
      `Total de Salidas: ${totalSalidas} | Total de Productos Entregados: ${totalProductosEntregados}`,
      20,
      statsY + 18
    );

    const tableRows = dataToExport.map((salida, index) => [
      index + 1,
      salida.productos
        .map((p) => `• ${p.descripcion} (${p.cantidad})`)
        .join(" "),
      salida.usuario,
      salida.obs,
      new Date(salida.createdAt).toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]);

    autoTable(doc, {
      head: [
        [
          "#",
          "Productos (Cantidad)",
          "Usuario",
          "Observaciones",
          "Fecha y Hora",
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
        1: { cellWidth: 70 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 45 },
        4: { cellWidth: 30, halign: "center" },
      },
      didDrawPage: function (data) {
        addHeader(doc);
      },
      margin: { top: 70, left: 15, right: 15 },
    });

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
    doc.save("reporte-salidas.pdf");
  };

  return (
    <div className="container">
      <h1 style={{ color: "black", fontWeight: 800, fontSize: "2rem" }}>SALIDAS</h1>
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
              renderTopToolbarCustomActions={() => (
                <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
                  <Button
                    color="primary"
                    onClick={handleExportPDF}
                    startIcon={<FileDownloadIcon />}
                    variant="contained"
                  >
                    Exportar Informe
                  </Button>
                </Box>
              )}
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
                  <Tooltip title="Ver Detalles">
                    <IconButton
                      color="info"
                      component={Link}
                      to={`/invouts/details/${row.original.id}`}
                    >
                      <AssignmentIcon />
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
