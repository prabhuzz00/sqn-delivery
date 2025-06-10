// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Camera,
//   Keyboard,
//   ArrowLeft,
//   Scan,
//   CheckCircle,
//   XCircle,
// } from "lucide-react";

// export function BarcodeScanner({ orderId, onComplete, onCancel }) {
//   const [manualCode, setManualCode] = useState("");
//   const [isScanning, setIsScanning] = useState(false);
//   const [error, setError] = useState("");
//   const [scanResult, setScanResult] = useState("");
//   const [cameraError, setCameraError] = useState("");
//   const scannerRef = useRef(null);
//   const quaggaRef = useRef(null);

//   // Load QuaggaJS dynamically
//   useEffect(() => {
//     const loadQuagga = async () => {
//       try {
//         // Dynamically import QuaggaJS
//         const Quagga = await import("quagga");
//         quaggaRef.current = Quagga.default || Quagga;
//       } catch (err) {
//         console.error("Failed to load QuaggaJS:", err);
//         setCameraError("Barcode scanning library not available");
//       }
//     };

//     loadQuagga();
//   }, []);

//   const handleManualSubmit = (e) => {
//     e.preventDefault();
//     setError("");

//     if (manualCode.length !== 12) {
//       setError("Code must be exactly 12 digits");
//       return;
//     }

//     if (!/^\d{12}$/.test(manualCode)) {
//       setError("Code must contain only numbers");
//       return;
//     }

//     // Show success message before completing
//     setScanResult(manualCode);

//     // Wait a moment to show success state before completing
//     setTimeout(() => {
//       onComplete(manualCode);
//     }, 1500);
//   };

//   const startCameraScanning = async () => {
//     if (!quaggaRef.current) {
//       setCameraError("Barcode scanning library not loaded");
//       return;
//     }

//     setIsScanning(true);
//     setCameraError("");
//     setScanResult("");

//     try {
//       await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" },
//       });
//       await quaggaRef.current.init({
//         inputStream: {
//           name: "Live",
//           type: "LiveStream",
//           target: scannerRef.current,
//           constraints: {
//             width: 320,
//             height: 240,
//             facingMode: "environment", // Use back camera
//           },
//         },
//         locator: {
//           patchSize: "medium",
//           halfSample: true,
//         },
//         numOfWorkers: 2,
//         frequency: 10,
//         decoder: {
//           readers: [
//             "code_128_reader",
//             "ean_reader",
//             "ean_8_reader",
//             "code_39_reader",
//             "code_39_vin_reader",
//             "codabar_reader",
//             "upc_reader",
//             "upc_e_reader",
//             "i2of5_reader",
//           ],
//         },
//         locate: true,
//       });

//       quaggaRef.current.start();

//       // Listen for successful scans
//       quaggaRef.current.onDetected((result) => {
//         const code = result.codeResult.code;
//         console.log("Barcode detected:", code);

//         // Validate if it's a 12-digit code
//         if (/^\d{12}$/.test(code)) {
//           setScanResult(code);
//           stopScanning();
//           setTimeout(() => {
//             onComplete(code);
//           }, 1500); // Show result for 1.5 seconds before completing
//         } else {
//           // Continue scanning if not a valid 12-digit code
//           console.log("Invalid code format, continuing scan...");
//         }
//       });
//     } catch (err) {
//       console.error("Camera initialization failed:", err);
//       setCameraError("Failed to access camera. Please check permissions.");
//       setIsScanning(false);
//     }
//   };

//   const stopScanning = () => {
//     if (quaggaRef.current && isScanning) {
//       quaggaRef.current.stop();
//     }
//     setIsScanning(false);
//   };

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (quaggaRef.current && isScanning) {
//         quaggaRef.current.stop();
//       }
//     };
//   }, [isScanning]);

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
//                   Camera Scan
//                 </TabsTrigger>
//               </TabsList>

//               <TabsContent value="manual" className="space-y-4">
//                 <form onSubmit={handleManualSubmit} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="code">Enter 12-digit delivery code</Label>
//                     <Input
//                       id="code"
//                       type="text"
//                       placeholder="123456789012"
//                       value={manualCode}
//                       onChange={(e) => {
//                         const value = e.target.value
//                           .replace(/\D/g, "")
//                           .slice(0, 12);
//                         setManualCode(value);
//                         setError("");
//                       }}
//                       className="text-center text-lg tracking-wider"
//                       maxLength={12}
//                     />
//                     <p className="text-xs text-gray-500 text-center">
//                       {manualCode.length}/12 digits
//                     </p>
//                   </div>
//                   {error && (
//                     <p className="text-red-600 text-sm text-center">{error}</p>
//                   )}
//                   <Button
//                     type="submit"
//                     className="w-full"
//                     disabled={manualCode.length !== 12}
//                   >
//                     Submit Code
//                   </Button>
//                 </form>
//               </TabsContent>

//               <TabsContent value="camera" className="space-y-4">
//                 <div className="text-center space-y-4">
//                   {!isScanning ? (
//                     <>
//                       <div className="bg-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
//                         <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                         <p className="text-gray-600 mb-4">
//                           Position the barcode within the camera frame
//                         </p>
//                         <Button
//                           onClick={startCameraScanning}
//                           className="w-full"
//                           disabled={!!cameraError}
//                         >
//                           Start Camera Scan
//                         </Button>
//                       </div>
//                       {cameraError && (
//                         <div className="flex items-center gap-2 text-red-600 text-sm">
//                           <XCircle className="h-4 w-4" />
//                           {cameraError}
//                         </div>
//                       )}
//                       <p className="text-xs text-gray-500">
//                         Make sure the barcode is well-lit and clearly visible
//                       </p>
//                     </>
//                   ) : (
//                     <div className="space-y-4">
//                       {/* Camera Preview */}
//                       <div className="relative bg-black rounded-lg overflow-hidden">
//                         <div
//                           ref={scannerRef}
//                           className="w-full h-64 flex items-center justify-center"
//                         />

//                         {/* Scanning Overlay */}
//                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                           <div className="border-2 border-red-500 w-48 h-24 rounded-lg">
//                             <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500"></div>
//                             <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500"></div>
//                             <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500"></div>
//                             <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500"></div>
//                           </div>
//                         </div>

//                         {/* Scan Result */}
//                         {scanResult && (
//                           <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center">
//                             <div className="text-white text-center">
//                               <CheckCircle className="h-12 w-12 mx-auto mb-2" />
//                               <p className="text-lg font-semibold">
//                                 Scan Successful!
//                               </p>
//                               <p className="text-sm">{scanResult}</p>
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       <div className="flex gap-2">
//                         <Button
//                           variant="outline"
//                           onClick={stopScanning}
//                           className="flex-1"
//                         >
//                           Stop Scanning
//                         </Button>
//                       </div>

//                       <p className="text-sm text-gray-600">
//                         Hold the barcode steady within the red frame
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </TabsContent>
//             </Tabs>

//             <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//               <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
//               <ul className="text-sm text-blue-800 space-y-1">
//                 <li>• Scan the 12-digit code provided by the customer</li>
//                 <li>• Ensure good lighting for better scan accuracy</li>
//                 <li>
//                   • Hold the device steady and align the barcode in the frame
//                 </li>
//                 <li>
//                   • The app supports various barcode formats (Code 128, EAN,
//                   UPC, etc.)
//                 </li>
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  Keyboard,
  ArrowLeft,
  Scan,
  CheckCircle,
  XCircle,
} from "lucide-react";

export function BarcodeScanner({ orderId, onComplete, onCancel }) {
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef(null);
  const quaggaRef = useRef(null);

  // Load QuaggaJS dynamically
  useEffect(() => {
    const loadQuagga = async () => {
      try {
        const Quagga = await import("quagga");
        quaggaRef.current = Quagga.default || Quagga;
      } catch (err) {
        console.error("Failed to load QuaggaJS:", err);
        setCameraError(
          "Barcode scanning library not available. Try manual entry."
        );
      }
    };
    loadQuagga();
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (manualCode.length !== 12) {
      setError("Code must be exactly 12 digits");
      return;
    }

    if (!/^\d{12}$/.test(manualCode)) {
      setError("Code must contain only numbers");
      return;
    }

    setScanResult(manualCode);
    setTimeout(() => {
      onComplete(manualCode);
    }, 1500);
  };

  const startCameraScanning = async () => {
    if (!quaggaRef.current) {
      setCameraError("Barcode scanning library not loaded. Try manual entry.");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "Camera access is not supported by this browser. Use Chrome or Safari."
      );
      return;
    }

    if (!scannerRef.current) {
      setCameraError(
        "Camera preview element not found. Ensure the camera tab is active and try again."
      );
      return;
    }

    setIsScanning(true);
    setCameraError("");
    setScanResult("");

    try {
      // Request camera permissions
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      await quaggaRef.current.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: "environment",
          },
        },
        decoder: {
          readers: ["upc_reader", "ean_reader", "code_128_reader"],
        },
        locate: true,
      });

      quaggaRef.current.start();

      quaggaRef.current.onDetected((result) => {
        if (result && result.codeResult && result.codeResult.code) {
          const code = result.codeResult.code;
          console.log("Barcode detected:", code);
          if (/^\d{12}$/.test(code)) {
            setScanResult(code);
            stopScanning();
            setTimeout(() => onComplete(code), 1500);
          } else {
            console.log("Invalid code format, continuing scan...");
          }
        }
      });
    } catch (err) {
      console.error("Camera initialization failed:", err);
      if (err.name === "NotAllowedError") {
        setCameraError(
          "Camera access denied. Please allow camera permissions in your browser settings."
        );
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on this device. Use manual entry.");
      } else if (err.name === "SecurityError") {
        setCameraError(
          "Camera access requires HTTPS. Use a secure URL or localhost."
        );
      } else {
        setCameraError(
          "Failed to access camera: " +
            (err.message || "Unknown error") +
            ". Ensure you're using HTTPS and check permissions."
        );
      }
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (quaggaRef.current && isScanning) {
      try {
        quaggaRef.current.stop();
      } catch (err) {
        console.error("Error stopping Quagga:", err);
      }
    }
    setIsScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (quaggaRef.current && isScanning) {
        try {
          quaggaRef.current.stop();
        } catch (err) {
          console.error("Error stopping Quagga on unmount:", err);
        }
      }
    };
  }, [isScanning]);

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
                  Camera Scan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Enter 12-digit delivery code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456789012"
                      value={manualCode}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 12);
                        setManualCode(value);
                        setError("");
                      }}
                      className="text-center text-lg tracking-wider"
                      maxLength={12}
                    />
                    <p className="text-xs text-gray-500 text-center">
                      {manualCode.length}/12 digits
                    </p>
                  </div>
                  {error && (
                    <p className="text-red-600 text-sm text-center">{error}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={manualCode.length !== 12}
                  >
                    Submit Code
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="camera" className="space-y-4">
                <div className="text-center space-y-4">
                  <div ref={scannerRef} />
                  {!isScanning ? (
                    <>
                      <div className="bg-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Position the barcode within the camera frame
                        </p>
                        <Button
                          onClick={startCameraScanning}
                          className="w-full"
                          disabled={!!cameraError}
                        >
                          Start Camera Scan
                        </Button>
                      </div>
                      {cameraError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <XCircle className="h-4 w-4" />
                          {cameraError}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Make sure the barcode is well-lit and clearly visible.
                        Use HTTPS for camera access.
                      </p>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {/* Camera Preview */}
                      <div className="relative bg-black rounded-lg overflow-hidden">
                        <div className="w-full h-64 flex items-center justify-center" />

                        {/* Scanning Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="border-2 border-red-500 w-48 h-24 rounded-lg">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500"></div>
                          </div>
                        </div>

                        {/* Scan Result */}
                        {scanResult && (
                          <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center">
                            <div className="text-white text-center">
                              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-lg font-semibold">
                                Scan Successful!
                              </p>
                              <p className="text-sm">{scanResult}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={stopScanning}
                          className="flex-1"
                        >
                          Stop Scanning
                        </Button>
                      </div>

                      <p className="text-sm text-gray-600">
                        Hold the barcode steady within the red frame
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Scan the 12-digit code provided by the customer</li>
                <li>• Ensure good lighting for better scan accuracy</li>
                <li>
                  • Hold the device steady and align the barcode in the frame
                </li>
                <li>
                  • The app supports various barcode formats (Code 128, EAN,
                  UPC, etc.)
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
