// QuaggaJS configuration helper
export const getQuaggaConfig = (targetElement) => ({
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: targetElement,
    constraints: {
      width: { min: 320, ideal: 640, max: 1280 },
      height: { min: 240, ideal: 480, max: 720 },
      facingMode: "environment", // Use back camera
      aspectRatio: { min: 1, max: 2 },
    },
  },
  locator: {
    patchSize: "medium",
    halfSample: true,
  },
  numOfWorkers: navigator.hardwareConcurrency || 2,
  frequency: 10,
  decoder: {
    readers: [
      "code_128_reader", // Most common for delivery codes
      "ean_reader", // European Article Number
      "ean_8_reader", // EAN-8
      "code_39_reader", // Code 39
      "code_39_vin_reader", // Code 39 VIN
      "codabar_reader", // Codabar
      "upc_reader", // Universal Product Code
      "upc_e_reader", // UPC-E
      "i2of5_reader", // Interleaved 2 of 5
    ],
  },
  locate: true,
  debug: {
    showCanvas: false,
    showPatches: false,
    showFoundPatches: false,
    showSkeleton: false,
    showLabels: false,
    showPatchLabels: false,
    showRemainingPatchLabels: false,
    boxFromPatches: {
      showTransformed: false,
      showTransformedBox: false,
      showBB: false,
    },
  },
})

export const validateDeliveryCode = (code) => {
  // Validate 12-digit delivery code
  return /^\d{12}$/.test(code)
}

export const formatBarcodeResult = (result) => {
  return {
    code: result.codeResult.code,
    format: result.codeResult.format,
    confidence: Math.round(
      result.codeResult.decodedCodes.reduce((sum, code) => sum + code.confidence, 0) /
        result.codeResult.decodedCodes.length,
    ),
  }
}
