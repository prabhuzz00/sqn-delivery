const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// Helper: safely get token from localStorage
const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return "";
};

// Helper: create default headers at call time
const createHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAccessToken()}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
};

export const loginDeliveryBoy = async (credentials) => {
  const res = await fetch(`${API_BASE}/api/deliveryboy/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
};

export const getMyOrders = async (deliveryBoyId, status = "") => {
  const url = `/api/deliveryboy/${deliveryBoyId}/orders${
    status ? `?status=${status}` : ""
  }`;
  const res = await fetch(`${API_BASE}${url}`, {
    headers: createHeaders(), // Create headers at call-time
  });
  return handleResponse(res);
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await fetch(
    `${API_BASE}/api/deliveryboy/order/${orderId}/status`,
    {
      method: "PUT",
      headers: createHeaders(), // Create headers at call-time
      body: JSON.stringify({ status }),
    }
  );
  return handleResponse(res);
};

export const assignPendingOrders = async (deliveryBoyId, orderIds) => {
  const res = await fetch(`${API_BASE}/api/deliveryboy/assign`, {
    method: "PUT",
    headers: createHeaders(), // Create headers at call-time
    body: JSON.stringify({ deliveryBoyId, orderIds }),
  });
  return handleResponse(res);
};

export const getOrderById = async (orderId) => {
  const res = await fetch(`${API_BASE}/api/order/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Error fetching order: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};
