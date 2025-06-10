"use client";

import { useState, useEffect } from "react";
import { LoginForm } from "@/components/login-form";
import { OrdersDashboard } from "@/components/orders-dashboard";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deliveryPerson, setDeliveryPerson] = useState("");
  const [deliveryBoyId, setDeliveryBoyId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("delivery_auth");
      const savedPerson = localStorage.getItem("delivery_person");
      const savedId = localStorage.getItem("deliveryBoyId");

      if (savedAuth === "true" && savedPerson && savedId) {
        setIsAuthenticated(true);
        setDeliveryPerson(savedPerson);
        setDeliveryBoyId(savedId);
      }
    }
  }, []);

  const handleLogin = (name) => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("deliveryBoyId");
      setIsAuthenticated(true);
      setDeliveryPerson(name);
      setDeliveryBoyId(savedId);

      localStorage.setItem("delivery_auth", "true");
      localStorage.setItem("delivery_person", name);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setDeliveryPerson("");
    setDeliveryBoyId("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("delivery_auth");
      localStorage.removeItem("delivery_person");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("deliveryBoyId");
    }
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <OrdersDashboard
      deliveryPerson={deliveryPerson}
      deliveryBoyId={deliveryBoyId}
      onLogout={handleLogout}
    />
  );
}
