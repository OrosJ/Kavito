import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Divider,
  Paper,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const URI = "http://localhost:8000/invouts/";

const InvOutDetails = () => {
  const { id } = useParams();
  const [invOut, setInvOut] = useState(null);
  const [loading, setLoading] = useState(true);

  const getInvOutDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${URI}${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Datos recibidos:", res.data);
      setInvOut(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los detalles:", error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getInvOutDetails();
  }, [getInvOutDetails]);

  const handleExportPDF = () => {
    const doc = new jsPDF();

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

    // Título y detalles básicos
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 65, doc.internal.pageSize.width, 20, "F");
    doc.setTextColor(63, 81, 181);
    doc.setFontSize(16);
    doc.text("COMPROBANTE DE SALIDA", doc.internal.pageSize.width / 2, 78, {
      align: "center",
    });

    // Información de la salida
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(`Código de Salida: ${invOut.codigo}`, 15, 95);
    doc.text(`N° de Salida: ${invOut.id}`, 15, 95);
    doc.text(`Fecha: ${new Date(invOut.createdAt).toLocaleString()}`, 15, 102);
    doc.text(`Usuario: ${invOut.usuario}`, 15, 109);

    // Observaciones
    doc.setFontSize(11);
    doc.setTextColor(63, 81, 181);
    doc.text("Observaciones:", 15, 123);
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(invOut.obs, 15, 130);

    // Tabla de productos
    const tableRows = invOut.productos
      ? invOut.productos.map((producto, index) => [
          index + 1,
          producto.descripcion,
          producto.cantidad,
          `Bs. ${producto.precio.toFixed(2)}`,
          `Bs. ${producto.subtotal.toFixed(2)}`,
        ])
      : [];

    autoTable(doc, {
      head: [["#", "Producto", "Cantidad",'Precio Unit.', 'Subtotal']],
      body: tableRows,
      foot: [['', '', '', 'Total:', `Bs. ${invOut.total.toFixed(2)}`]],
      startY: 140,
      styles: {
        fontSize: 9,
        cellPadding: 3,
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
        0: { cellWidth: 20, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 30, halign: "center" },
      },
      didDrawPage: function (data) {
        addHeader(doc);
      },
      margin: { top: 70 },
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
    doc.save(`comprobante-salida-${invOut.id}.pdf`);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!invOut) {
    return <div>No se encontraron datos válidos para esta salida</div>;
  }
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" component="h1">
            Salida #{invOut.codigo}
          </Typography>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportPDF}
          >
            Generar Reporte
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información General
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography>
                  <strong>Código:</strong> {invOut.codigo}
                </Typography>
                <Typography>
                  <strong>Fecha:</strong>{" "}
                  {new Date(invOut.createdAt).toLocaleString()}
                </Typography>
                <Typography>
                  <strong>Usuario:</strong> {invOut.usuario}
                </Typography>
                <Typography sx={{ mt: 2 }}>
                  <strong>Observaciones:</strong>
                </Typography>
                <Typography sx={{ pl: 2 }}>{invOut.obs}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Productos
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {invOut.productos && invOut.productos.length > 0 ? (
                  <>
                    {invOut.productos.map((producto, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography>
                          • {producto.descripcion}
                          <Typography component="span" sx={{ ml: 1 }}>
                            ({producto.cantidad} unidades)
                          </Typography>
                          <Typography
                            component="span"
                            color="primary"
                            sx={{ ml: 1 }}
                          >
                            Bs. {producto.subtotal.toFixed(2)}
                          </Typography>
                        </Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" align="right">
                      Total: Bs. {invOut.total.toFixed(2)}
                    </Typography>
                  </>
                ) : (
                  <Typography>No hay productos registrados</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default InvOutDetails;
