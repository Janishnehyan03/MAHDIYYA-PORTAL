import React, { useState } from "react";
import { saveAs } from "file-saver";
import { PDFDocument, rgb } from "pdf-lib"; // Import PDFDocument and rgb from pdf-lib
import axios from "axios";
import Axios from "../Axios";

const PdfCustomizer = () => {
  const [registerNumber, setRegisterNumber] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null); // State variable to store PDF bytes
  const [error, setError] = useState(null);

  const handleRegisterNumberChange = (event) => {
    setRegisterNumber(event.target.value);
  };

  const fetchStudentData = async () => {
    try {
      let { data } = await Axios.get(
        `/hall-ticket/special-hallticket/${registerNumber}`
      );
      console.log(data);
      setStudentData(data);
      setError(null);

      // Fetch the PDF file from the server
      const pdfResponse = await axios.get("/hall-ticket.pdf", {
        responseType: "arraybuffer",
      });
      const pdfBytes = pdfResponse.data;
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      const { height } = firstPage.getSize();
      const drawColumnText = (text, x, yStart, yIncrement, size) => {
        const lines = text.split(",");
        lines.forEach((line, index) => {
          firstPage.drawText(line.trim(), {
            x: x,
            y: yStart - index * yIncrement,
            size: size,
            // color: rgb(0, 0, 0),  // Uncomment if you want to set the color
          });
        });
      };
      
      const yStartSecondSem = height - 470;
      const yStartForthSem = height - 525;
      const yStartMahdiyyaSecondSem = height - 580;
      const yStartMahdiyyaForthSem = height - 645;
      const yStartMahdiyyaSixthSem = height - 698;
      const yIncrement = 15;  // Adjust this value as needed

      firstPage.drawText(data.name, {
        x: 150,
        y: height - 230,
        size: 12,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(data?.institution || "", {
        x: 150,
        y: height - 254,
        size: 9,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(data?.registerNo || "", {
        x: 150,
        y: height - 275,
        size: 12,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(data?.semester || "", {
        x: 150,
        y: height - 295,
        size: 9,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(data?.examCentre || "", {
        x: 200,
        y: height - 360,
        size: 8,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(data?.method || "", {
        x: 200,
        y: height - 390,
        size: 9,
        color: rgb(0, 0, 0),
      });
      drawColumnText(
  data?.semesters?.secondSem || "_____________________",
  240,
  yStartSecondSem,
  yIncrement,
  9
);

drawColumnText(
  data?.semesters?.forthSem || "_____________________",
  240,
  yStartForthSem,
  yIncrement,
  9
);

drawColumnText(
  data?.semesters?.mahdiyyaSecondSem || "_____________________",
  240,
  yStartMahdiyyaSecondSem,
  yIncrement,
  9
);

drawColumnText(
  data?.semesters?.mahdiyyaForthSem || "_____________________",
  240,
  yStartMahdiyyaForthSem,
  yIncrement,
  9
);

drawColumnText(
  data?.semesters?.mahdiyyaSixthSem || "_____________________",
  240,
  yStartMahdiyyaSixthSem,
  yIncrement,
  9
);
      const modifiedPdfBytes = await pdfDoc.save();
      setPdfBytes(modifiedPdfBytes);
    } catch (error) {
      console.error("Error fetching student data or PDF", error);
      setError("Error fetching student data or PDF");
    }
  };

  const handleGeneratePdf = () => {
    try {
      if (pdfBytes) {
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        saveAs(blob, "hall-ticket.pdf");
      }
    } catch (error) {
      console.error("Error generating PDF", error);
      setError("Error generating PDF");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-center font-bold text-xl uppercase my-5 text-sky-800">
        Download Your Hall Ticket{" "}
      </h1>
      <input
        type="text"
        value={registerNumber}
        onChange={handleRegisterNumberChange}
        placeholder="Enter Register Number"
        className="w-full p-2 border border-gray-300 rounded"
      />
      <p className="text-red-500 my-2 italic text-sm lowercase">
        *Use Only Capital Letters{" "}
      </p>
      {error && <div className="text-red-500">{error}</div>}
      {/* Display "Generate PDF" button only when PDF bytes are available */}
      {pdfBytes && (
        <button
          onClick={handleGeneratePdf}
          className="bg-blue-600 hover:bg-blue-600 text-white mr-3 py-2 px-4 rounded"
        >
          Generate PDF
        </button>
      )}
      <button
        onClick={fetchStudentData}
        className="bg-violet-500 hover:bg-violet-600 text-white py-2 px-4 rounded"
      >
        GET HALL TICKET
      </button>
    </div>
  );
};

export default PdfCustomizer;
