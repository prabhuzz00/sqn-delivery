"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CheckCircle, Clock, TrendingUp } from "lucide-react"

export function DeliveryStats({ orders, deliveredCount }) {
  const [averageDeliveryTime, setAverageDeliveryTime] = useState("--:--")
  const [deliveryTrend, setDeliveryTrend] = useState(0)

  // Calculate average delivery time
  useEffect(() => {
    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered" && order.startedAt && order.deliveredAt,
    )

    if (deliveredOrders.length > 0) {
      const totalMinutes = deliveredOrders.reduce((total, order) => {
        const startTime = new Date(order.startedAt).getTime()
        const endTime = new Date(order.deliveredAt).getTime()
        return total + (endTime - startTime) / (1000 * 60) // Convert to minutes
      }, 0)

      const avgMinutes = Math.round(totalMinutes / deliveredOrders.length)
      const hours = Math.floor(avgMinutes / 60)
      const minutes = Math.round(avgMinutes % 60)

      setAverageDeliveryTime(`${hours > 0 ? hours + "h " : ""}${minutes}m`)

      // Simple trend calculation (positive number means improving/faster)
      if (deliveredOrders.length > 1) {
        const latestDelivery = deliveredOrders[deliveredOrders.length - 1]
        const latestTime = new Date(latestDelivery.deliveredAt).getTime() - new Date(latestDelivery.startedAt).getTime()
        const latestMinutes = latestTime / (1000 * 60)

        setDeliveryTrend(Math.round((avgMinutes - latestMinutes) * 10) / 10)
      }
    }
  }, [orders])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Out for Delivery</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {orders.filter((o) => o.status === "out_for_delivery").length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{deliveredCount}</div>
          <p className="text-xs text-gray-500 mt-1">
            {orders.filter((o) => o.status === "delivered").length} total delivered
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageDeliveryTime}</div>
          {deliveryTrend !== 0 && (
            <div className={`flex items-center text-xs mt-1 ${deliveryTrend > 0 ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${deliveryTrend < 0 ? "transform rotate-180" : ""}`} />
              {deliveryTrend > 0 ? "Faster by " : "Slower by "}
              {Math.abs(deliveryTrend)}m
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
