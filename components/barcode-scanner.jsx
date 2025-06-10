// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Camera, Keyboard, ArrowLeft, Scan } from "lucide-react";
// import { toast } from "sonner";
// import { getOrderById } from "@/lib/api";
// import { Html5Qrcode } from "html5-qrcode";

// export function BarcodeScanner({ orderId, onComplete, onCancel }) {
//   const [manualCode, setManualCode] = useState("");
//   const [error, setError] = useState("");
//   const expectedBarcode = useRef("");
//   const scannerRef = useRef(null);
//   const html5QrCode = useRef(null);

//   // Load expected barcode
//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const res = await getOrderById(orderId);
//         if (res?.data?.barcode) {
//           expectedBarcode.current = res.data.barcode;
//         } else {
//           toast.error("Could not load barcode for this order.");
//           onCancel();
//         }
//       } catch (err) {
//         console.error("Error fetching order:", err);
//         toast.error("Error loading barcode.");
//         onCancel();
//       }
//     };

//     fetchOrder();
//   }, [orderId, onCancel]);

//   // Manual entry
//   const handleManualSubmit = (e) => {
//     e.preventDefault();
//     setError("");

//     if (manualCode.length !== 20) {
//       setError("Code must be exactly 20 digits");
//       return;
//     }

//     if (!/^\d{20}$/.test(manualCode)) {
//       setError("Code must contain only numbers");
//       return;
//     }

//     if (manualCode !== expectedBarcode.current) {
//       toast.error("Invalid code");
//       return;
//     }

//     setTimeout(() => onComplete(manualCode), 500);
//   };

//   // Initialize QR scanner when camera tab is active
//   const startScanner = async () => {
//     if (!scannerRef.current) return;
//     try {
//       const config = { fps: 10, qrbox: { width: 250, height: 250 } };
//       html5QrCode.current = new Html5Qrcode("qr-scanner");

//       await html5QrCode.current.start(
//         { facingMode: "environment" },
//         config,
//         (decodedText) => {
//           console.log("Scanned code:", decodedText);

//           if (
//             decodedText.length === 20 &&
//             /^\d{20}$/.test(decodedText) &&
//             decodedText === expectedBarcode.current
//           ) {
//             html5QrCode.current.stop();
//             onComplete(decodedText);
//           } else {
//             toast.error("Invalid code. Please try again.");
//           }
//         },
//         (error) => {
//           console.warn("QR scan error:", error);
//         }
//       );
//     } catch (err) {
//       console.error("Error initializing scanner:", err);
//       toast.error("Camera initialization failed.");
//       onCancel();
//     }
//   };

//   // Stop scanner when leaving the tab or component unmounts
//   const stopScanner = () => {
//     if (html5QrCode.current) {
//       html5QrCode.current
//         .stop()
//         .catch((err) => console.error("Stop error:", err));
//     }
//   };

//   useEffect(() => {
//     return () => stopScanner();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-md mx-auto">
//         {/* Header */}
//         <div className="flex items-center gap-3 mb-6">
//           <Button variant="outline" size="icon" onClick={onCancel}>
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-xl font-semibold">Scan Delivery Code</h1>
//             <p className="text-sm text-gray-500">Order: {orderId}</p>
//           </div>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Scan className="h-5 w-5" />
//               Delivery Verification
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Tabs
//               defaultValue="manual"
//               className="w-full"
//               onValueChange={(val) => {
//                 if (val === "camera") {
//                   startScanner();
//                 } else {
//                   stopScanner();
//                 }
//               }}
//             >
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="manual" className="flex items-center gap-2">
//                   <Keyboard className="h-4 w-4" />
//                   Manual Entry
//                 </TabsTrigger>
//                 <TabsTrigger value="camera" className="flex items-center gap-2">
//                   <Camera className="h-4 w-4" />
//                   QR Scan
//                 </TabsTrigger>
//               </TabsList>

//               {/* Manual Entry */}
//               <TabsContent value="manual" className="space-y-4">
//                 <form onSubmit={handleManualSubmit} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="code">Enter 20-digit delivery code</Label>
//                     <Input
//                       id="code"
//                       type="text"
//                       placeholder="Enter 20 digits"
//                       value={manualCode}
//                       onChange={(e) => {
//                         const value = e.target.value
//                           .replace(/\D/g, "")
//                           .slice(0, 20);
//                         setManualCode(value);
//                         setError("");
//                       }}
//                       className="text-center text-lg tracking-wider"
//                       maxLength={20}
//                     />
//                     <p className="text-xs text-gray-500 text-center">
//                       {manualCode.length}/20 digits
//                     </p>
//                   </div>
//                   {error && (
//                     <p className="text-red-600 text-sm text-center">{error}</p>
//                   )}
//                   <Button
//                     type="submit"
//                     className="w-full"
//                     disabled={manualCode.length !== 20}
//                   >
//                     Submit Code
//                   </Button>
//                 </form>
//               </TabsContent>

//               {/* QR Scanner */}
//               <TabsContent value="camera" className="space-y-4">
//                 <div className="text-center space-y-4">
//                   <div id="qr-scanner" ref={scannerRef} className="" />
//                   <p className="text-xs text-gray-500">
//                     Position the QR code within the frame to scan.
//                   </p>
//                 </div>
//               </TabsContent>
//             </Tabs>

//             <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//               <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
//               <ul className="text-sm text-blue-800 space-y-1">
//                 <li>• Scan the 20-digit code (QR or manual)</li>
//                 <li>• Ensure good lighting for better scan accuracy</li>
//                 <li>
//                   • Hold the device steady and align the QR code in the frame
//                 </li>
//                 <li>• Use HTTPS or localhost for camera access</li>
//               </ul>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Camera, Keyboard, ArrowLeft, Scan } from "lucide-react";
// import { toast } from "sonner";
// import { getOrderById } from "@/lib/api";
// import QrScanner from "@/components/QrScanner"; // import your QrScanner component

// export function BarcodeScanner({ orderId, onComplete, onCancel }) {
//   const [manualCode, setManualCode] = useState("");
//   const [error, setError] = useState("");
//   const [expectedBarcode, setExpectedBarcode] = useState("");

//   // Load expected barcode
//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const res = await getOrderById(orderId);
//         if (res?.data?.barcode) {
//           setExpectedBarcode(res.data.barcode);
//         } else {
//           toast.error("Could not load barcode for this order.");
//           onCancel();
//         }
//       } catch (err) {
//         console.error("Error fetching order:", err);
//         toast.error("Error loading barcode.");
//         onCancel();
//       }
//     };

//     fetchOrder();
//   }, [orderId, onCancel]);

//   // Manual entry
//   const handleManualSubmit = (e) => {
//     e.preventDefault();
//     setError("");

//     if (manualCode.length !== 20) {
//       setError("Code must be exactly 20 digits");
//       return;
//     }

//     if (!/^\d{20}$/.test(manualCode)) {
//       setError("Code must contain only numbers");
//       return;
//     }

//     if (manualCode !== expectedBarcode) {
//       toast.error("Invalid code");
//       return;
//     }

//     setTimeout(() => onComplete(manualCode), 500);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-md mx-auto">
//         {/* Header */}
//         <div className="flex items-center gap-3 mb-6">
//           <Button variant="outline" size="icon" onClick={onCancel}>
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-xl font-semibold">Scan Delivery Code</h1>
//             <p className="text-sm text-gray-500">Order: {orderId}</p>
//           </div>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Scan className="h-5 w-5" />
//               Delivery Verification
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="manual" className="w-full">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="manual" className="flex items-center gap-2">
//                   <Keyboard className="h-4 w-4" />
//                   Manual Entry
//                 </TabsTrigger>
//                 <TabsTrigger value="camera" className="flex items-center gap-2">
//                   <Camera className="h-4 w-4" />
//                   QR Scan
//                 </TabsTrigger>
//               </TabsList>

//               {/* Manual Entry */}
//               <TabsContent value="manual" className="space-y-4">
//                 <form onSubmit={handleManualSubmit} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="code">Enter 20-digit delivery code</Label>
//                     <Input
//                       id="code"
//                       type="text"
//                       placeholder="Enter 20 digits"
//                       value={manualCode}
//                       onChange={(e) => {
//                         const value = e.target.value
//                           .replace(/\D/g, "")
//                           .slice(0, 20);
//                         setManualCode(value);
//                         setError("");
//                       }}
//                       className="text-center text-lg tracking-wider"
//                       maxLength={20}
//                     />
//                     <p className="text-xs text-gray-500 text-center">
//                       {manualCode.length}/20 digits
//                     </p>
//                   </div>
//                   {error && (
//                     <p className="text-red-600 text-sm text-center">{error}</p>
//                   )}
//                   <Button
//                     type="submit"
//                     className="w-full"
//                     disabled={manualCode.length !== 20}
//                   >
//                     Submit Code
//                   </Button>
//                 </form>
//               </TabsContent>

//               {/* QR Scanner using your final working QrScanner component */}
//               <TabsContent value="camera" className="space-y-4">
//                 <QrScanner
//                   orderId={orderId}
//                   onComplete={onComplete}
//                   onCancel={onCancel}
//                 />
//               </TabsContent>
//             </Tabs>

//             <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//               <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
//               <ul className="text-sm text-blue-800 space-y-1">
//                 <li>• Scan the 20-digit code (QR or manual)</li>
//                 <li>• Ensure good lighting for better scan accuracy</li>
//                 <li>
//                   • Hold the device steady and align the QR code in the frame
//                 </li>
//                 <li>• Use HTTPS or localhost for camera access</li>
//               </ul>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Camera, Keyboard, ArrowLeft, Scan } from "lucide-react";
// import { toast } from "sonner";
// import { getOrderById } from "@/lib/api";
// import QrScanner from "@/components/QrScanner";

// export function BarcodeScanner({ orderId, onComplete, onCancel }) {
//   const [manualCode, setManualCode] = useState("");
//   const [error, setError] = useState("");
//   const [expectedBarcode, setExpectedBarcode] = useState("");
//   const [activeTab, setActiveTab] = useState("manual");

//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const res = await getOrderById(orderId);
//         if (res?.data?.barcode) {
//           setExpectedBarcode(res.data.barcode);
//         } else {
//           toast.error("Could not load barcode for this order.");
//           onCancel();
//         }
//       } catch (err) {
//         console.error("Error fetching order:", err);
//         toast.error("Error loading barcode.");
//         onCancel();
//       }
//     };

//     fetchOrder();
//   }, [orderId, onCancel]);

//   const handleManualSubmit = (e) => {
//     e.preventDefault();
//     setError("");

//     if (manualCode.length !== 20) {
//       setError("Code must be exactly 20 digits");
//       return;
//     }

//     if (!/^\d{20}$/.test(manualCode)) {
//       setError("Code must contain only numbers");
//       return;
//     }

//     if (manualCode !== expectedBarcode) {
//       toast.error("Invalid code");
//       return;
//     }

//     setTimeout(() => onComplete(manualCode), 500);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-md mx-auto">
//         <div className="flex items-center gap-3 mb-6">
//           <Button variant="outline" size="icon" onClick={onCancel}>
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-xl font-semibold">Scan Delivery Code</h1>
//             <p className="text-sm text-gray-500">Order: {orderId}</p>
//           </div>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Scan className="h-5 w-5" />
//               Delivery Verification
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Tabs
//               value={activeTab}
//               onValueChange={setActiveTab}
//               className="w-full"
//             >
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="manual" className="flex items-center gap-2">
//                   <Keyboard className="h-4 w-4" />
//                   Manual Entry
//                 </TabsTrigger>
//                 <TabsTrigger value="camera" className="flex items-center gap-2">
//                   <Camera className="h-4 w-4" />
//                   QR Scan
//                 </TabsTrigger>
//               </TabsList>
//             </Tabs>

//             {/* Manual Entry */}
//             {activeTab === "manual" && (
//               <div className="space-y-4 mt-4">
//                 <form onSubmit={handleManualSubmit} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="code">Enter 20-digit delivery code</Label>
//                     <Input
//                       id="code"
//                       type="text"
//                       placeholder="Enter 20 digits"
//                       value={manualCode}
//                       onChange={(e) => {
//                         const value = e.target.value
//                           .replace(/\D/g, "")
//                           .slice(0, 20);
//                         setManualCode(value);
//                         setError("");
//                       }}
//                       className="text-center text-lg tracking-wider"
//                       maxLength={20}
//                     />
//                     <p className="text-xs text-gray-500 text-center">
//                       {manualCode.length}/20 digits
//                     </p>
//                   </div>
//                   {error && (
//                     <p className="text-red-600 text-sm text-center">{error}</p>
//                   )}
//                   <Button
//                     type="submit"
//                     className="w-full"
//                     disabled={manualCode.length !== 20}
//                   >
//                     Submit Code
//                   </Button>
//                 </form>
//               </div>
//             )}

//             {/* QR Scanner */}
//             {activeTab === "camera" && (
//               <div className="space-y-4 mt-4">
//                 <QrScanner
//                   orderId={orderId}
//                   onComplete={onComplete}
//                   onCancel={onCancel}
//                 />
//               </div>
//             )}

//             <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//               <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
//               <ul className="text-sm text-blue-800 space-y-1">
//                 <li>• Scan the 20-digit code (QR or manual)</li>
//                 <li>• Ensure good lighting for better scan accuracy</li>
//                 <li>
//                   • Hold the device steady and align the QR code in the frame
//                 </li>
//                 <li>• Use HTTPS or localhost for camera access</li>
//               </ul>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Keyboard, ArrowLeft, Scan } from "lucide-react";
import { toast } from "sonner";
import { getOrderById } from "@/lib/api";
import { Html5Qrcode } from "html5-qrcode";

export function BarcodeScanner({ orderId, onComplete, onCancel }) {
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");
  const [expectedBarcode, setExpectedBarcode] = useState("");
  const [activeTab, setActiveTab] = useState("manual");
  const scannerRef = useRef(null);
  const html5QrCode = useRef(null);

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

  // QR scanner logic
  const startScanner = async () => {
    if (!scannerRef.current) return;

    try {
      html5QrCode.current = new Html5Qrcode("qr-scanner");
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      await html5QrCode.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          console.log("Scanned code:", decodedText);

          if (
            decodedText.length === 20 &&
            /^\d{20}$/.test(decodedText) &&
            decodedText === expectedBarcode
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
      toast.error("Camera initialization failed.");
      onCancel();
    }
  };

  const stopScanner = () => {
    if (html5QrCode.current) {
      html5QrCode.current
        .stop()
        .catch((err) => console.error("Stop error:", err));
    }
  };

  // Cleanup
  useEffect(() => {
    return () => stopScanner();
  }, []);

  // Manage scanner start/stop based on tab
  useEffect(() => {
    if (activeTab === "camera") {
      startScanner();
    } else {
      stopScanner();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
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
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
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
            </Tabs>

            {activeTab === "manual" && (
              <div className="space-y-4 mt-4">
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
              </div>
            )}

            {activeTab === "camera" && (
              <div className="space-y-4 mt-4">
                <div
                  id="qr-scanner"
                  ref={scannerRef}
                  className="w-full max-w-xs mx-auto aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-black"
                />
                <p className="text-xs text-gray-500 text-center">
                  Position the QR code within the frame to scan.
                </p>
              </div>
            )}

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
