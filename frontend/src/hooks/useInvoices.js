import { useState, useEffect } from "react";
import client from "../api/client";

export const useInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvoices = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await client.get("/invoices", { params });
      setInvoices(data.invoices);
    } catch (err) {
      setError(err.response?.data?.message || "Error cargando facturas");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await client.get("/invoices/stats");
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || "Error cargando estadísticas");
    }
  };

  const uploadInvoice = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await client.post("/invoices", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  };

  const deleteInvoice = async (id) => {
    await client.delete(`/invoices/${id}`);
    setInvoices((prev) => prev.filter((inv) => inv._id !== id));
  };

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, []);

  const deleteAllInvoices = async () => {
    await client.delete("/invoices/all");
    setInvoices([]);
    setStats(null);
  };

  return { invoices, stats, loading, error, fetchInvoices, fetchStats, uploadInvoice, deleteInvoice, deleteAllInvoices };
};