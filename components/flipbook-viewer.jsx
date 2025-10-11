// "use client";

// import { useRef, useEffect, useState } from "react";
// import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
// import { Button } from "@/components/ui/button";

// // Dynamic import for react-pageflip to avoid SSR issues
// let HTMLFlipBook: any = null;

// export default function FlipbookViewer() {
//   const flipBookRef = useRef < any > null;
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [zoom, setZoom] = useState(1); // zoom factor
//   const totalPages = 24;

//   useEffect(() => {
//     import("react-pageflip").then((module) => {
//       HTMLFlipBook = module.default;
//       setIsLoaded(true);
//     });
//   }, []);

//   const nextPage = () => {
//     if (flipBookRef.current) {
//       flipBookRef.current.pageFlip().flipNext();
//     }
//   };

//   const prevPage = () => {
//     if (flipBookRef.current) {
//       flipBookRef.current.pageFlip().flipPrev();
//     }
//   };

//   const onFlip = (e: any) => {
//     setCurrentPage(e.data);
//   };

//   const handleZoomIn = () => {
//     setZoom((prev) => Math.min(prev + 0.1, 2));
//   };

//   const handleZoomOut = () => {
//     setZoom((prev) => Math.max(prev - 0.1, 0.6));
//   };

//   if (!isLoaded || !HTMLFlipBook) {
//     return (
//       <div className="flex items-center justify-center w-[1000px] h-[700px] bg-white rounded-lg shadow-lg border-2 border-sky-blue/20">
//         <div className="text-center">
//           <div className="animate-spin w-8 h-8 border-4 border-sky-blue border-t-transparent rounded-full mx-auto mb-4"></div>
//           <p className="font-body text-gray-600">Loading flipbook...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center gap-6">
//       {/* Zoom Controls */}
//       <div className="flex items-center gap-4 mb-2">
//         <Button
//           onClick={handleZoomOut}
//           className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2"
//         >
//           <ZoomOut className="w-4 h-4" />
//         </Button>
//         <span className="text-sm text-gray-600">
//           Zoom: {(zoom * 100).toFixed(0)}%
//         </span>
//         <Button
//           onClick={handleZoomIn}
//           className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2"
//         >
//           <ZoomIn className="w-4 h-4" />
//         </Button>
//       </div>

//       {/* Flipbook Container */}
//       <div className="relative w-full max-w-[90vw] max-h-[90vh] overflow-hidden flex justify-center items-center border rounded-lg shadow-lg bg-white">
//         <div
//           style={{
//             transform: `scale(${zoom})`,
//             transformOrigin: "center center",
//             transition: "transform 0.3s ease-in-out",
//           }}
//         >
//           <HTMLFlipBook
//             ref={flipBookRef}
//             width={800}
//             height={1100}
//             size="stretch"
//             minWidth={600}
//             maxWidth={1000}
//             minHeight={400}
//             maxHeight={1100}
//             maxShadowOpacity={0.5}
//             showCover={false}
//             mobileScrollSupport={false}
//             onFlip={onFlip}
//             className="shadow-2xl"
//             style={{
//               boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
//             }}
//             drawShadow={true}
//             flippingTime={800}
//             usePortrait={false}
//             startPage={0}
//             autoSize={false}
//             clickEventForward={true}
//           >
//             {Array.from({ length: totalPages }, (_, index) => (
//               <div
//                 key={index}
//                 className="page bg-white border-r border-gray-200 last:border-r-0"
//               >
//                 <img
//                   src={`/pdf-pages/page-${index + 1}.jpg`}
//                   alt={`Page ${index + 1}`}
//                   className="w-full h-full object-cover"
//                   style={{ userSelect: "none" }}
//                   draggable={false}
//                 />
//               </div>
//             ))}
//           </HTMLFlipBook>
//         </div>
//       </div>

//       {/* Navigation Controls */}
//       <div className="flex items-center gap-4">
//         <Button
//           onClick={prevPage}
//           disabled={currentPage === 0}
//           className="bg-sky-blue hover:bg-sky-blue/80 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
//         >
//           <ChevronLeft className="w-5 h-5" />
//         </Button>

//         <div className="bg-white px-6 py-3 rounded-full border-2 border-sky-blue/20 shadow-sm">
//           <span className="font-body text-sm text-gray-600">
//             Pages {currentPage + 1}-{Math.min(currentPage + 2, totalPages)} of{" "}
//             {totalPages}
//           </span>
//         </div>

//         <Button
//           onClick={nextPage}
//           disabled={currentPage >= totalPages - 1}
//           className="bg-sky-blue hover:bg-sky-blue/80 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
//         >
//           <ChevronRight className="w-5 h-5" />
//         </Button>
//       </div>

//       <p className="font-body text-sm text-gray-500 text-center max-w-md">
//         Click on the pages or use the navigation buttons to flip through the
//         book. Drag the page corners for a realistic page-turning experience!
//       </p>
//     </div>
//   );
// }

"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamic import for react-pageflip to avoid SSR issues
let HTMLFlipBook = null;

export default function FlipbookViewer() {
  const flipBookRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1); // zoom factor
  const totalPages = 24;

  useEffect(() => {
    import("react-pageflip").then((module) => {
      HTMLFlipBook = module.default;
      setIsLoaded(true);
    });
  }, []);

  const nextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const prevPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const onFlip = (e) => {
    setCurrentPage(e.data);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.6));
  };

  if (!isLoaded || !HTMLFlipBook) {
    return (
      <div className="flex items-center justify-center w-[1000px] h-[700px] bg-white rounded-lg shadow-lg border-2 border-sky-blue/20">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-sky-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-body text-gray-600">Loading flipbook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Zoom Controls */}
      <div className="flex items-center gap-4 mb-2">
        <Button
          onClick={handleZoomOut}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600">
          Zoom: {(zoom * 100).toFixed(0)}%
        </span>
        <Button
          onClick={handleZoomIn}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Flipbook Container */}
      <div className="relative w-full max-w-[90vw] max-h-[90vh] overflow-hidden flex justify-center items-center border rounded-lg shadow-lg bg-white">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <HTMLFlipBook
            ref={flipBookRef}
            width={800}
            height={1100}
            size="stretch"
            minWidth={600}
            maxWidth={1000}
            minHeight={400}
            maxHeight={1100}
            maxShadowOpacity={0.5}
            showCover={false}
            mobileScrollSupport={false}
            onFlip={onFlip}
            className="shadow-2xl"
            style={{
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
            drawShadow={true}
            flippingTime={800}
            usePortrait={false}
            startPage={0}
            autoSize={false}
            clickEventForward={true}
          >
            {Array.from({ length: totalPages }, (_, index) => (
              <div
                key={index}
                className="page bg-white border-r border-gray-200 last:border-r-0"
              >
                <img
                  src={`/pdf-pages/page-${index + 1}.jpg`}
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{ userSelect: "none" }}
                  draggable={false}
                />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-4">
        <Button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="bg-sky-blue hover:bg-sky-blue/80 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="bg-white px-6 py-3 rounded-full border-2 border-sky-blue/20 shadow-sm">
          <span className="font-body text-sm text-gray-600">
            Pages {currentPage + 1}-{Math.min(currentPage + 2, totalPages)} of{" "}
            {totalPages}
          </span>
        </div>

        <Button
          onClick={nextPage}
          disabled={currentPage >= totalPages - 1}
          className="bg-sky-blue hover:bg-sky-blue/80 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <p className="font-body text-sm text-gray-500 text-center max-w-md">
        Click on the pages or use the navigation buttons to flip through the
        book. Drag the page corners for a realistic page-turning experience!
      </p>
    </div>
  );
}
