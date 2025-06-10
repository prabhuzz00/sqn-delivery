"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarcodeScanner } from "@/components/barcode-scanner";
import {
  MapPin,
  Phone,
  Package,
  LogOut,
  Scan,
  User,
  CheckCircle,
} from "lucide-react";
import { DeliveryStats } from "@/components/delivery-stats";
import { getMyOrders, updateOrderStatus } from "@/lib/api";

export function OrdersDashboard({ deliveryPerson, deliveryBoyId, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getMyOrders(deliveryBoyId);
      setOrders(
        res.data.map((order) => ({
          id: order._id,
          customerName: order.userId?.name || "N/A",
          customerPhone: order.delivery_address?.mobile || "N/A",
          deliveryAddress: `${order.delivery_address?.address_line1}, ${order.delivery_address?.city}`,
          status: order.deliveryStatus.toLowerCase(),
          orderValue: order.totalAmt,
        }))
      );
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "out_for_delivery":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "out_for_delivery":
        return "Out for Delivery";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const handleScanOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowScanner(true);
  };

  const handleScanComplete = async (code) => {
    console.log(`Scanned code: ${code} for order: ${selectedOrderId}`);
    setShowScanner(false);

    try {
      await updateOrderStatus(selectedOrderId, "Delivered");
      await fetchOrders();
      setDeliveredCount((prevCount) => prevCount + 1);
      setSuccessMessage(`Order ${selectedOrderId} marked as delivered!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating status:", err);
    }

    setSelectedOrderId("");
  };

  const updateOrderStatusHandler = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (showScanner) {
    return (
      <BarcodeScanner
        orderId={selectedOrderId}
        onComplete={handleScanComplete}
        onCancel={() => setShowScanner(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Soouqna Delivery Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {deliveryPerson}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DeliveryStats orders={orders} deliveredCount={deliveredCount} />

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Delivery Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Delivery Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {order.customerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {order.customerPhone}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2 max-w-xs">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            {order.deliveryAddress}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>${order.orderValue.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateOrderStatusHandler(
                                  order.id,
                                  "Out for Delivery"
                                )
                              }
                            >
                              Start Delivery
                            </Button>
                          )}
                          {order.status === "out_for_delivery" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleScanOrder(order.id)}
                              className="flex items-center gap-1"
                            >
                              <Scan className="h-3 w-3" />
                              Scan Code
                            </Button>
                          )}
                          {order.status === "delivered" && (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">
                                Completed
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
