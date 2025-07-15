import React, { useState, useEffect, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import Axios from "../../../Axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudDownloadAlt } from "@fortawesome/free-solid-svg-icons";

/**
 * Generates a single hall ticket image using the Canvas API.
 * @param {object} ticket - The student's hall ticket data.
 * @param {string} examName - The name of the exam.
 * @param {Image} backgroundImage - The pre-loaded background image object.
 * @returns {Promise<Blob>} A promise that resolves with the generated image Blob.
 */
const generateHallTicketImage = (ticket, examName, backgroundImage) => {
  return new Promise((resolve) => {
    // --- Canvas Setup ---
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = backgroundImage.width;
    canvas.height = backgroundImage.height;

    // --- Drawing Constants ---
    const FONT_PRIMARY = "Arial";
    const COLOR_PRIMARY = "#000000";
    const POS_X_CONTENT = canvas.width / 3;
    const POS_Y_START = canvas.height * 0.3 + 50;

    // --- Draw Background ---
    ctx.drawImage(backgroundImage, 0, 0);

    // --- Draw Header (Exam Name) ---
    ctx.font = `bold 30px ${FONT_PRIMARY}`;
    ctx.fillStyle = COLOR_PRIMARY;
    ctx.textAlign = "center";
    ctx.fillText(examName, canvas.width / 2, POS_Y_START - 180);

    // --- Draw Student Details ---
    ctx.textAlign = "left";
    ctx.font = `25px ${FONT_PRIMARY}`;
    ctx.fillText(ticket.registerNo, POS_X_CONTENT, POS_Y_START);
    ctx.fillText(ticket.studentName, POS_X_CONTENT, POS_Y_START + 50);

    // Handle multi-line institution name
    ctx.font = `20px ${FONT_PRIMARY}`;
    const institutionLines = ticket.institution.match(/.{1,35}/g) || [];
    institutionLines.forEach((line, index) => {
      ctx.fillText(line, POS_X_CONTENT, POS_Y_START + 100 + index * 25);
    });

    ctx.font = `25px ${FONT_PRIMARY}`;
    ctx.fillText(ticket.className, POS_X_CONTENT, POS_Y_START + 210);

    // --- Draw Subjects Table ---
    const tableStartY = POS_Y_START + 310;
    const tableStartX = (canvas.width - (canvas.width - 200)) / 2;
    const tableWidth = canvas.width - 200;
    const colWidth = tableWidth / 5;
    const headerHeight = 35;
    const rowHeight = 40;
    const tableHeaders = ["Date", "Subject", "Code", "Time", "Invigilator's Sign"];

    // Draw Header
    ctx.fillStyle = "#2d3748"; // gray-800
    ctx.fillRect(tableStartX, tableStartY, tableWidth, headerHeight);

    ctx.font = `bold 16px ${FONT_PRIMARY}`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    tableHeaders.forEach((header, index) => {
      ctx.fillText(
        header,
        tableStartX + colWidth * index + colWidth / 2,
        tableStartY + 23
      );
    });
    
    // Draw Table Rows
    ticket?.hallTicketDetails?.subjects?.forEach((subject, index) => {
      const rowY = tableStartY + headerHeight + index * rowHeight;
      
      // Set cell text style
      ctx.fillStyle = COLOR_PRIMARY;
      ctx.font = `15px ${FONT_PRIMARY}`;
      
      // Date
      ctx.textAlign = "center";
      ctx.fillText(moment(subject?.date).format("DD-MM-YYYY"), tableStartX + colWidth * 0.5, rowY + 25);
      
      // Subject Name
      ctx.textAlign = "left";
      ctx.fillText(subject?.subjectId?.subjectName, tableStartX + colWidth + 10, rowY + 25);
      
      // Subject Code
      ctx.textAlign = "center";
      ctx.fillText(subject?.subjectId?.subjectCode, tableStartX + colWidth * 2.5, rowY + 25);
      
      // Time
      ctx.fillText(moment(subject?.time, "HH:mm").format("hh:mm A"), tableStartX + colWidth * 3.5, rowY + 25);

      // Draw horizontal line for each row
      ctx.strokeStyle = "#e2e8f0"; // gray-200
      ctx.beginPath();
      ctx.moveTo(tableStartX, rowY + rowHeight);
      ctx.lineTo(tableStartX + tableWidth, rowY + rowHeight);
      ctx.stroke();
    });

    // Draw Table Borders
    ctx.strokeStyle = "#a0aec0"; // gray-400
    ctx.strokeRect(tableStartX, tableStartY, tableWidth, headerHeight + ticket.hallTicketDetails.subjects.length * rowHeight);
    for (let i = 1; i < tableHeaders.length; i++) {
        ctx.beginPath();
        ctx.moveTo(tableStartX + colWidth * i, tableStartY);
        ctx.lineTo(tableStartX + colWidth * i, tableStartY + headerHeight + ticket.hallTicketDetails.subjects.length * rowHeight);
        ctx.stroke();
    }

    // --- Resolve with Blob ---
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
  });
};

function BulkHallTickets() {
  // --- State Management ---
  const [classes, setClasses] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [activeClassId, setActiveClassId] = useState(null); // Track which class is downloading

  // --- API Calls ---
  const getAllClasses = useCallback(async () => {
    try {
      const { data } = await Axios.get("/class");
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      toast.error("Could not fetch class list.");
    }
  }, []);

  const downloadHallTickets = async (classId) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setActiveClassId(classId);

    try {
      // 1. Fetch bulk hall ticket data
      const { data } = await Axios.post("/hall-ticket/bulk-download", { class: classId });

      if (!data.hallTickets || data.hallTickets.length === 0) {
        toast.info("No hall tickets available for this class.");
        return;
      }
      
      // 2. Fetch background image asset
      const bgResponse = await axios.get("/HallTicketBG.jpg", { responseType: "arraybuffer" });
      const backgroundImage = new Image();
      backgroundImage.src = URL.createObjectURL(new Blob([bgResponse.data]));
      await new Promise(resolve => backgroundImage.onload = resolve); // Wait for image to load

      // 3. Generate all hall ticket images in parallel for performance
      let completedCount = 0;
      const zip = new JSZip();
      const imageGenerationPromises = data.hallTickets.map(ticket => 
        generateHallTicketImage(ticket, data.hallTickets[0]?.examName, backgroundImage)
          .then(blob => {
            zip.file(`${ticket.registerNo}.jpg`, blob);
            // Update progress after each image is generated
            completedCount++;
            setDownloadProgress((completedCount / data.hallTickets.length) * 100);
          })
      );
      
      await Promise.all(imageGenerationPromises);

      // 4. Generate and save the ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const className = classes.find((cls) => cls._id === classId)?.className || "Hall-Tickets";
      saveAs(zipBlob, `${className}.zip`);
      toast.success("Hall tickets downloaded successfully!");

    } catch (error) {
      console.error("Error downloading bulk hall tickets:", error);
      toast.error(error.response?.data?.message || "An error occurred during download.");
    } finally {
      // 5. Reset state
      setIsDownloading(false);
      setDownloadProgress(0);
      setActiveClassId(null);
    }
  };

  // --- Effects ---
  useEffect(() => {
    getAllClasses();
  }, [getAllClasses]);

  // --- Render ---
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">
            Download Bulk Hall Tickets
          </h1>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.map((classItem) => {
                  const isCurrentClassDownloading = activeClassId === classItem._id;
                  return (
                    <tr key={classItem._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {classItem.className}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => downloadHallTickets(classItem._id)}
                          disabled={isDownloading}
                          className="relative inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {isCurrentClassDownloading ? (
                            <>
                              <div className="absolute top-0 left-0 h-full bg-blue-700 rounded-md" style={{ width: `${downloadProgress}%` }}></div>
                              <span className="relative z-10">
                                Downloading... {Math.round(downloadProgress)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faCloudDownloadAlt} className="mr-2 -ml-1 h-5 w-5" />
                              <span>Download</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {classes.length === 0 && !isDownloading && (
             <p className="text-center text-gray-500 py-8">No classes found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkHallTickets;