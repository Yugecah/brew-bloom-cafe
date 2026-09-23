import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

const statusOptions = [
  "Order Received",
  "Preparing",
  "Ready",
  "Completed",
];

const statusClassMap = {
  "Order Received": "status-received",
  Preparing: "status-preparing",
  Ready: "status-ready",
  Completed: "status-completed",
};

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check demo employee login
  useEffect(() => {
    const employeeLoggedIn =
      sessionStorage.getItem("brewBloomEmployee") === "true";

    if (!employeeLoggedIn) {
      navigate("/employee/login");
    }
  }, [navigate]);

  // Convert Supabase row to dashboard-friendly object
  const normalizeOrder = (row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    tableNumber: row.table_number,
    items: Array.isArray(row.items) ? row.items : [],
    total: Number(row.total || 0),
    note: row.note || "",
    status: row.status,
    createdAt: row.created_at,
  });

  // Load orders from Supabase
  const loadOrders = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error(fetchError);
      setError("Unable to load orders from Supabase.");
      setLoading(false);
      return;
    }

    setOrders((data || []).map(normalizeOrder));
    setLoading(false);
  };

  // Initial load + realtime subscription
  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("brew-bloom-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setError("");

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error(updateError);
      setError("Unable to update order status.");
      return;
    }

    // Optimistic UI update
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      )
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem("brewBloomEmployee");
    navigate("/employee/login");
  };

  const filteredOrders = useMemo(() => {
    if (activeFilter === "All") {
      return orders;
    }

    return orders.filter(
      (order) => order.status === activeFilter
    );
  }, [orders, activeFilter]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      received: orders.filter(
        (order) => order.status === "Order Received"
      ).length,
      preparing: orders.filter(
        (order) => order.status === "Preparing"
      ).length,
      ready: orders.filter(
        (order) => order.status === "Ready"
      ).length,
      completed: orders.filter(
        (order) => order.status === "Completed"
      ).length,
    }),
    [orders]
  );

  const formatPrice = (price) =>
    `₱${Number(price).toLocaleString("en-PH")}`;

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getNextStatus = (status) => {
    const currentIndex = statusOptions.indexOf(status);

    if (
      currentIndex === -1 ||
      currentIndex >= statusOptions.length - 1
    ) {
      return null;
    }

    return statusOptions[currentIndex + 1];
  };

  const getNextButtonLabel = (status) => {
    switch (status) {
      case "Order Received":
        return "Start Preparing";

      case "Preparing":
        return "Mark Ready";

      case "Ready":
        return "Complete Order";

      default:
        return "Completed";
    }
  };

  return (
    <div className="employee-dashboard-page">
      <header className="employee-dashboard-header">
        <div className="employee-dashboard-brand">
          <span className="employee-dashboard-logo">B</span>

          <div>
            <strong>Brew & Bloom</strong>
            <span>STAFF DASHBOARD</span>
          </div>
        </div>

        <div className="employee-dashboard-actions">
          <button
            type="button"
            className="employee-view-site-button"
            onClick={() => navigate("/")}
          >
            View Website
          </button>

          <button
            type="button"
            className="employee-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="employee-dashboard-content">
        <div className="employee-dashboard-heading">
          <div>
            <span className="eyebrow">TODAY'S ORDERS</span>

            <h1>Order Management</h1>

            <p>
              Manage incoming customer orders and keep the café
              moving smoothly.
            </p>
          </div>

          <div className="employee-live-indicator">
            <span className="employee-live-dot" />
            Live
          </div>
        </div>

        {error && (
          <div className="employee-dashboard-error">
            {error}
          </div>
        )}

        {/* STATS */}
        <section className="employee-stats-grid">
          <div className="employee-stat-card">
            <span>Total Orders</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="employee-stat-card">
            <span>Order Received</span>
            <strong>{stats.received}</strong>
          </div>

          <div className="employee-stat-card">
            <span>Preparing</span>
            <strong>{stats.preparing}</strong>
          </div>

          <div className="employee-stat-card">
            <span>Ready</span>
            <strong>{stats.ready}</strong>
          </div>

          <div className="employee-stat-card">
            <span>Completed</span>
            <strong>{stats.completed}</strong>
          </div>
        </section>

        {/* FILTERS */}
        <section className="employee-orders-section">
          <div className="employee-orders-toolbar">
            <div className="employee-filter-tabs">
              {[
                "All",
                "Order Received",
                "Preparing",
                "Ready",
                "Completed",
              ].map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={
                    activeFilter === filter
                      ? "employee-filter active"
                      : "employee-filter"
                  }
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="employee-refresh-button"
              onClick={loadOrders}
            >
              ↻ Refresh
            </button>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="employee-empty-state">
              <div className="employee-loading-spinner" />
              <h3>Loading orders...</h3>
              <p>
                Connecting to the Brew & Bloom order system.
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* EMPTY */
            <div className="employee-empty-state">
              <div className="employee-empty-icon">☕</div>

              <h3>No orders found</h3>

              <p>
                New customer orders will appear here
                automatically.
              </p>
            </div>
          ) : (
            /* ORDERS */
            <div className="employee-orders-list">
              {filteredOrders.map((order) => {
                const nextStatus = getNextStatus(order.status);

                return (
                  <article
                    className="employee-order-card"
                    key={order.id}
                  >
                    <div className="employee-order-card-header">
                      <div>
                        <div className="employee-order-number">
                          #{order.orderNumber}
                        </div>

                        <div className="employee-order-time">
                          {formatTime(order.createdAt)}
                        </div>
                      </div>

                      <span
                        className={`employee-order-status ${
                          statusClassMap[order.status] || ""
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="employee-order-main">
                      <div className="employee-order-customer">
                        <span>Customer</span>
                        <strong>{order.customerName}</strong>
                      </div>

                      <div className="employee-order-table">
                        <span>Table</span>
                        <strong>{order.tableNumber}</strong>
                      </div>

                      <div className="employee-order-total">
                        <span>Total</span>
                        <strong>
                          {formatPrice(order.total)}
                        </strong>
                      </div>
                    </div>

                    {/* ITEMS */}
                    <div className="employee-order-items">
                      <div className="employee-order-items-heading">
                        Items
                      </div>

                      {order.items.map((item, index) => (
                        <div
                          className="employee-order-item"
                          key={`${item.id || item.name}-${index}`}
                        >
                          <div>
                            <strong>{item.name}</strong>
                            <span>
                              {item.quantity} ×{" "}
                              {formatPrice(item.price)}
                            </span>
                          </div>

                          <strong>
                            {formatPrice(
                              Number(item.price) *
                                Number(item.quantity)
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>

                    {/* NOTE */}
                    {order.note && (
                      <div className="employee-order-note">
                        <span>Customer Note</span>
                        <p>{order.note}</p>
                      </div>
                    )}

                    {/* STATUS TRACK */}
                    <div className="employee-status-track">
                      {statusOptions.map((status, index) => {
                        const currentIndex =
                          statusOptions.indexOf(order.status);

                        const isComplete =
                          index <= currentIndex;

                        return (
                          <div
                            className={
                              isComplete
                                ? "employee-status-step complete"
                                : "employee-status-step"
                            }
                            key={status}
                          >
                            <span className="employee-status-dot">
                              {isComplete ? "✓" : ""}
                            </span>

                            <span>{status}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* ACTION */}
                    {nextStatus && (
                      <div className="employee-order-action">
                        <button
                          type="button"
                          className="employee-status-button"
                          onClick={() =>
                            updateOrderStatus(
                              order.id,
                              nextStatus
                            )
                          }
                        >
                          {getNextButtonLabel(order.status)}
                          <span>→</span>
                        </button>
                      </div>
                    )}

                    {order.status === "Completed" && (
                      <div className="employee-completed-message">
                        ✓ Order completed
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default EmployeeDashboard;