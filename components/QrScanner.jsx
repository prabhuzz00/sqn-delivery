"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getOrderById } from "@/lib/api";
import { Html5Qrcode } from "html5-qrcode";

export default function QrScanner({ orderId, onComplete, onCancel }) {
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);
  const expectedBarcode = useRef("");

  useEffect(() => {
    const initScanner = async () => {
      try {
        const res = await getOrderById(orderId);
        if (res?.data?.barcode) {
          expectedBarcode.current = res.data.barcode;
        } else {
          toast.error("Could not load barcode for this order.");
          onCancel();
          return;
        }

        html5QrCode.current = new Html5Qrcode("qr-scanner");

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        await html5QrCode.current.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            console.log("Scanned:", decodedText);
            if (
              decodedText.length === 20 &&
              /^\d{20}$/.test(decodedText) &&
              decodedText === expectedBarcode.current
            ) {
              html5QrCode.current.stop();
              onComplete(decodedText);
            } else {
              toast.error("Invalid code. Please try again.");
            }
          },
          (error) => {
            console.warn("QR scan error:", error);
          }
        );
      } catch (err) {
        console.error("Error initializing scanner:", err);
        toast.error("Failed to start camera.");
        onCancel();
      }
    };

    initScanner();

    return () => {
      if (html5QrCode.current) {
        html5QrCode.current
          .stop()
          .catch((err) => console.error("Stop error:", err));
      }
    };
  }, [orderId, onComplete, onCancel]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="flex items-center gap-3 mb-4 w-full max-w-md">
        <Button variant="outline" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">Scan Delivery Code</h1>
      </div>

      <div
        id="qr-scanner"
        ref={scannerRef}
        className="w-full max-w-xs aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-black"
      />

      <p className="text-xs text-gray-500 mt-2">
        Position the QR code within the frame to scan.
      </p>
    </div>
  );
}
