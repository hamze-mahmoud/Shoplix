import { useState, useEffect } from "react";
import { orderService } from "../services/orderService";

/**
 * Hook for fetching user orders
 */
export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    orderService
      .getUserOrders()
      .then((res) => setOrders(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { orders, loading, error };
}

/**
 * Hook for fetching a single order
 */
export function useOrder(orderId) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    orderService
      .getOrderById(orderId)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  return { order, loading, error };
}
