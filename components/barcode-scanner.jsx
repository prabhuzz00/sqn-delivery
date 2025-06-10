"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Keyboard, ArrowLeft, Scan } from "lucide-react";
import { toast } from "sonner";
import { getOrderById } from "@/lib/api";
import dynamic from "next/dynamic";

// Dynamically load the QR reader
const QrReader = dynamic(
  () => import("@blackbox-vision/react-qr-reader").then((mod) => mod.QrReader),
  { ssr: false }
);

export function BarcodeScanner({ orderId, onComplete, onCancel }) {
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");
  const [expectedBarcode, setExpectedBarcode] = useState("");

  // Load expected barcode
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(orderId);
        if (res?.data?.barcode) {
          setExpectedBarcode(res.data.barcode);
        } else {
          toast.error("Could not load barcode for this order.");
          onCancel();
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        toast.error("Error loading barcode.");
        onCancel();
      }
    };

    fetchOrder();
  }, [orderId, onCancel]);

  // Manual entry
  const handleManualSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (manualCode.length !== 20) {
      setError("Code must be exactly 20 digits");
      return;
    }

    if (!/^\d{20}$/.test(manualCode)) {
      setError("Code must contain only numbers");
      return;
    }

    if (manualCode !== expectedBarcode) {
      toast.error("Invalid code");
      return;
    }

    setTimeout(() => onComplete(manualCode), 500);
  };

  // QR scan
  const handleQrScan = (data) => {
    if (!data) return;

    if (data.length !== 20 || !/^\d{20}$/.test(data)) {
      toast.error("Invalid code");
      return;
    }

    if (data !== expectedBarcode) {
      toast.error("Invalid code");
      return;
    }

    onComplete(data);
  };

  const handleQrError = (err) => {
    console.error("QR Reader error:", err);
    toast.error("QR scanning error. Try again.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Scan Delivery Code</h1>
            <p className="text-sm text-gray-500">Order: {orderId}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Delivery Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="camera" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  QR Scan
                </TabsTrigger>
              </TabsList>

              {/* Manual Entry */}
              <TabsContent value="manual" className="space-y-4">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Enter 20-digit delivery code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="Enter 20 digits"
                      value={manualCode}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 20);
                        setManualCode(value);
                        setError("");
                      }}
                      className="text-center text-lg tracking-wider"
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-500 text-center">
                      {manualCode.length}/20 digits
                    </p>
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={manualCode.length !== 20}
                  >
                    Submit Code
                  </Button>
                </form>
              </TabsContent>

              {/* QR Scanner */}
              {/* <TabsContent value="camera" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="w-72 mx-auto rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                    <QrReader
                      constraints={{ facingMode: "environment" }}
                      containerStyle={{ width: "100%" }}
                      onResult={(result, error) => {
                        if (!!result) {
                          handleQrScan(result?.text);
                        }
                        if (!!error) {
                          console.error(error);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Position the QR code within the frame to scan.
                  </p>
                </div>
              </TabsContent> */}

              <TabsContent value="camera" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="w-full max-w-xs mx-auto border-2 border-dashed border-gray-300 bg-black rounded">
                    <QrReader
                      constraints={{ facingMode: "environment" }}
                      containerStyle={{ width: "100%", height: "300px" }} // set a height!
                      videoContainerStyle={{ width: "100%", height: "100%" }} // fill the container
                      videoStyle={{ width: "100%", height: "100%" }} // fill
                      onResult={(result, error) => {
                        if (!!result) {
                          handleQrScan(result?.text);
                        }
                        if (!!error) {
                          console.error(error);
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Position the QR code within the frame to scan.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Scan the 20-digit code (QR or manual)</li>
                <li>• Ensure good lighting for better scan accuracy</li>
                <li>
                  • Hold the device steady and align the QR code in the frame
                </li>
                <li>• Use HTTPS or localhost for camera access</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
