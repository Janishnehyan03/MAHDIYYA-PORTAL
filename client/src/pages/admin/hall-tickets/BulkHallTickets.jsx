import { faCloudDownloadAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { jsPDF } from "jspdf";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../../Axios";

/**
 * Generates a single hall ticket image using the Canvas API.
 * @param {object} ticket - The student's hall ticket data.
 * @param {string} examName - The name of the exam.
 * @param {Image} backgroundImage - The pre-loaded background image object.
 * @returns {Promise<Blob>} A promise that resolves with the generated image Blob.
 */
const generateHallTicketImage = (ticket, examName, backgroundImage) => {
  return new Promise(async (resolve) => {
    // --- Canvas Setup ---
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = backgroundImage.width;
    canvas.height = backgroundImage.height;

    // --- Drawing Constants ---
    const FONT_PRIMARY = "'Minion Pro', serif";
    const COLOR_PRIMARY = "#000000";
    const CENTER_X = canvas.width / 2;
    const POS_Y_START = canvas.height * 0.28;

    // --- Draw Background ---
    ctx.drawImage(backgroundImage, 0, 0);

    // --- Draw Header (Exam Name) ---
    const headerY = POS_Y_START - 120; // Slightly lower to center in box
    ctx.font = `bold 33px ${FONT_PRIMARY}`;
    ctx.textAlign = "center";
    ctx.fillText(examName?.toUpperCase(), CENTER_X, headerY);

    // Note: "ADMIT CARD" is already in the background image.

    // --- Draw Student Photo ---
    if (ticket.imageUrl) {
      try {
        const studentImg = new Image();
        studentImg.crossOrigin = "anonymous";
        studentImg.src = ticket.imageUrl;
        await new Promise((res) => {
          studentImg.onload = res;
          studentImg.onerror = () => {
            console.error("Failed to load image from URL:", ticket.imageUrl);
            res();
          };
        });
        if (studentImg.complete && studentImg.naturalWidth > 0) {
          const photoWidth = 210;
          const photoHeight = 270;
          const photoX = canvas.width - photoWidth - 145;
          const photoY = POS_Y_START + 25; // Adjusted down slightly

          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(photoX - 2, photoY - 2, photoWidth + 4, photoHeight + 4);
          ctx.drawImage(studentImg, photoX, photoY, photoWidth, photoHeight);
        }
      } catch (error) {
        console.error("Error drawing student photo:", error);
      }
    }

    // --- Draw Student Details (Values ONLY) ---
    ctx.fillStyle = COLOR_PRIMARY;

    // 1. Exam Reg No (Positioned in the background's box)
    const regNoX = CENTER_X + -120;  // Center in the box
    const regNoY = POS_Y_START + 70; // Move down into the box
    ctx.textAlign = "center";
    ctx.font = `bold 32px ${FONT_PRIMARY}`;
    ctx.fillText(ticket.registerNo, regNoX, regNoY);

    // 2. Candidate details (Aligned with background labels)
    const detailsX = canvas.width * 0.34; // Shift left closer to background colons
    ctx.textAlign = "left";

    // Candidate Name
    let currentY = POS_Y_START + 145; // Move down to "Name of the Candidate" placeholder
    ctx.font = `bold 30px ${FONT_PRIMARY}`;
    ctx.fillText(ticket.studentName?.toUpperCase(), detailsX, currentY);

    // Institution
    currentY += 50; // Move down to "Name of the Institution" placeholder
    ctx.font = `bold 22px ${FONT_PRIMARY}`;
    // Limit line length to 45 chars to keep it within image bounds
    const institutionLines = ticket.institution?.toUpperCase().match(/.{1,25}/g) || [];
    institutionLines.forEach((line, i) => {
      ctx.fillText(line, detailsX, currentY + i * 28);
    });

    // Class
    currentY += 85 + (institutionLines.length - 1) * 28; // Move down to "Name of the Class" placeholder
    ctx.font = `bold 28px ${FONT_PRIMARY}`;
    ctx.fillText(ticket.className?.toUpperCase(), detailsX, currentY);

    // --- Draw Subjects Table ---
    const tableStartY = currentY + 80;
    const tableStartX = (canvas.width - (canvas.width - 200)) / 2;
    const tableWidth = canvas.width - 200;
    const colWidth = tableWidth / 5;
    const headerHeight = 35;
    const rowHeight = 55;
    const tableHeaders = [
      "Date",
      "Subject",
      "Code",
      "Time",
      "Invigilator's Sign",
    ];

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
      ctx.font = `bold 24px ${FONT_PRIMARY}`;

      // Date
      ctx.textAlign = "center";
      ctx.fillText(
        moment(subject?.date).format("DD-MM-YYYY"),
        tableStartX + colWidth * 0.5,
        rowY + 35
      );

      // Subject Name
      ctx.textAlign = "left";
      ctx.fillText(
        subject?.subjectId?.subjectName,
        tableStartX + colWidth + 10,
        rowY + 35
      );

      // Subject Code
      ctx.textAlign = "center";
      ctx.fillText(
        subject?.subjectId?.subjectCode,
        tableStartX + colWidth * 2.5,
        rowY + 35
      );

      // Time
      ctx.fillText(
        moment(subject?.time, "HH:mm").format("hh:mm A"),
        tableStartX + colWidth * 3.5,
        rowY + 35
      );

      // Draw horizontal line for each row
      ctx.strokeStyle = "#e2e8f0"; // gray-200
      ctx.beginPath();
      ctx.moveTo(tableStartX, rowY + rowHeight);
      ctx.lineTo(tableStartX + tableWidth, rowY + rowHeight);
      ctx.stroke();
    });

    // Draw Table Borders
    ctx.strokeStyle = "#a0aec0"; // gray-400
    ctx.strokeRect(
      tableStartX,
      tableStartY,
      tableWidth,
      headerHeight + ticket.hallTicketDetails.subjects.length * rowHeight
    );
    for (let i = 1; i < tableHeaders.length; i++) {
      ctx.beginPath();
      ctx.moveTo(tableStartX + colWidth * i, tableStartY);
      ctx.lineTo(
        tableStartX + colWidth * i,
        tableStartY +
        headerHeight +
        ticket.hallTicketDetails.subjects.length * rowHeight
      );
      ctx.stroke();
    }

    // --- Resolve with data URL for preview if needed, or Blob ---
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ blob, dataUrl: reader.result });
      reader.readAsDataURL(blob);
    }, "image/jpeg", 0.95);
  });
};

function BulkHallTickets() {
  // --- State Management ---
  const [classes, setClasses] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [activeClassId, setActiveClassId] = useState(null);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // --- API Calls ---
  const loadPreview = useCallback(async (classesList) => {
    if (!classesList || classesList.length === 0) return;
    setIsPreviewLoading(true);
    try {
      const firstClass = classesList[0];
      const { data } = await Axios.post("/hall-ticket/bulk-download", {
        class: firstClass._id,
      });

      if (data.hallTickets && data.hallTickets.length > 0) {
        const bgResponse = await axios.get("/HallTicketBG.jpg", {
          responseType: "arraybuffer",
        });
        const backgroundImage = new Image();
        backgroundImage.src = URL.createObjectURL(new Blob([bgResponse.data]));
        await new Promise((resolve) => (backgroundImage.onload = resolve));

        const { dataUrl } = await generateHallTicketImage(
          data.hallTickets[0],
          data.hallTickets[0]?.examName,
          backgroundImage
        );
        setPreviewDataUrl(dataUrl);
      }
    } catch (error) {
      console.error("Failed to load preview:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  }, []);

  const downloadHallTickets = async (classId) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setActiveClassId(classId);

    try {
      // 1. Fetch bulk hall ticket data
      const { data } = await Axios.post("/hall-ticket/bulk-download", {
        class: classId,
      });

      if (!data.hallTickets || data.hallTickets.length === 0) {
        toast.info("No hall tickets available for this class.");
        return;
      }

      // 2. Fetch background image asset
      const bgResponse = await axios.get("/HallTicketBG.jpg", {
        responseType: "arraybuffer",
      });
      const backgroundImage = new Image();
      backgroundImage.src = URL.createObjectURL(new Blob([bgResponse.data]));
      await new Promise((resolve) => (backgroundImage.onload = resolve)); // Wait for image to load

      // 3. Generate all hall ticket images in parallel for performance
      let completedCount = 0;
      const images = await Promise.all(
        data.hallTickets.map((ticket) =>
          generateHallTicketImage(
            ticket,
            data.hallTickets[0]?.examName,
            backgroundImage
          )
            .then(({ blob }) => {
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result); // result is a base64 data URL
                reader.readAsDataURL(blob);
              });
            })
            .then((dataUrl) => {
              completedCount++;
              setDownloadProgress(
                (completedCount / data.hallTickets.length) * 100
              );
              return dataUrl;
            })
        )
      );

      // 4. Create a single PDF with all images as pages
      const firstImg = new window.Image();
      firstImg.src = images[0];
      await new Promise((resolve) => (firstImg.onload = resolve));
      const pdf = new jsPDF({
        orientation: firstImg.width > firstImg.height ? "l" : "p",
        unit: "px",
        format: [firstImg.width, firstImg.height],
      });

      // Add first page
      pdf.addImage(images[0], "JPEG", 0, 0, firstImg.width, firstImg.height);

      // Add the rest
      for (let i = 1; i < images.length; i++) {
        const img = new window.Image();
        img.src = images[i];
        // Wait for image to load to get correct dimensions
        await new Promise((resolve) => (img.onload = resolve));
        pdf.addPage(
          [img.width, img.height],
          img.width > img.height ? "l" : "p"
        );
        pdf.addImage(images[i], "JPEG", 0, 0, img.width, img.height);
      }

      // 5. Download the PDF
      const className =
        classes.find((cls) => cls._id === classId)?.className || "Hall-Tickets";
      pdf.save(`${className}.pdf`);
      toast.success("Hall tickets downloaded successfully!");
    } catch (error) {
      console.error("Error downloading bulk hall tickets:", error);
      toast.error(
        error.response?.data?.message || "An error occurred during download."
      );
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      setActiveClassId(null);
    }
  };
  // --- Effects ---
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await Axios.get("/class");
        setClasses(data);
        if (data.length > 0) {
          loadPreview(data);
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        toast.error("Could not fetch class list.");
      }
    };
    init();
  }, [loadPreview]);

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
                  const isCurrentClassDownloading =
                    activeClassId === classItem._id;
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
                              <div
                                className="absolute top-0 left-0 h-full bg-blue-700 rounded-md"
                                style={{ width: `${downloadProgress}%` }}
                              ></div>
                              <span className="relative z-10">
                                Downloading... {Math.round(downloadProgress)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faCloudDownloadAlt}
                                className="mr-2 -ml-1 h-5 w-5"
                              />
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
