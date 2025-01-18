import JSZip from "jszip";
import { saveAs } from "file-saver"; // For saving the ZIP file
import axios from "axios";
import React, { useEffect, useState } from "react";
import Axios from "../../../Axios";
import { toast } from "react-toastify";
import moment from "moment";

function BulkHallTickets() {
  const [classes, setClasses] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Fetch all classes
  const getAllClasses = async () => {
    try {
      let { data } = await Axios.get("/class");
      setClasses(data);
    } catch (error) {
      console.log(error);
    }
  };

  const downloadHallTickets = async (classId) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // Request bulk download data from the backend
      const { data } = await Axios.post("/hall-ticket/bulk-download", {
        class: classId,
      });


      if (data.hallTickets.length > 0) {
        const totalTickets = data.hallTickets.length;
        const zip = new JSZip(); // Create a new JSZip instance

        // Fetch the background image for all tickets
        const backgroundImageResponse = await axios.get("/HallTicketBG.jpg", {
          responseType: "arraybuffer",
        });
        const backgroundImageBytes = backgroundImageResponse.data;

        // Loop through all the tickets and modify the image for each
        for (let index = 0; index < totalTickets; index++) {
          const ticket = data.hallTickets[index];

          // Create a canvas to edit the image (using HTML canvas)
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Load the background image
          const backgroundImage = new Image();
          backgroundImage.src = URL.createObjectURL(
            new Blob([backgroundImageBytes])
          );

          await new Promise((resolve) => {
            backgroundImage.onload = () => {
              // Set the canvas size to match the background image size
              canvas.width = backgroundImage.width;
              canvas.height = backgroundImage.height;

              // Draw the background image onto the canvas
              ctx.drawImage(backgroundImage, 0, 0);

              const studentDetailsY = canvas.height * 0.3 + 50;
              // Add exam name as header
              ctx.font = "bold 30px Arial";
              ctx.fillStyle = "black";
              ctx.textAlign = "center";
              ctx.fillText(data?.hallTickets[0]?.examName, canvas.width / 2, studentDetailsY - 180);

              // Add student details (25% from top)
              ctx.fillStyle = "black";
              ctx.textAlign = "left";
              ctx.font = "25px Arial";
              ctx.fillText(
                ticket.registerNo,
                canvas.width / 3,
                studentDetailsY
              );
              ctx.fillText(
                ticket.studentName,
                canvas.width / 3,
                studentDetailsY + 50
              );
              const institutionLines =
                ticket.institution.match(/.{1,35}/g) || [];
              ctx.font = "20px Arial"; // Decrease font size for institution
              institutionLines.forEach((line, index) => {
                ctx.fillText(
                  line,
                  canvas.width / 3,
                  studentDetailsY + 100 + index * 20
                );
              });
              ctx.font = "25px Arial"; // Reset font size for other text
              ctx.fillText(
                ticket.className,
                canvas.width / 3,
                studentDetailsY + 210
              );

              // Add subject details 100px below class name
              // Set the starting Y position for the table details
              const subjectDetailsY = studentDetailsY + 310; // 100px below className + 210px buffer

              // Table headers for subjects
              ctx.font = "18px Arial";
              ctx.textAlign = "center";
              ctx.fillStyle = "#272f30"; // Teal background for headers
              ctx.strokeStyle = "black"; // Black border for cells

              // Table dimensions
              const tableWidth = canvas.width - 200; // Further reduced table width
              const tableHeight = 30 + (ticket?.hallTicketDetails?.subjects?.length || 0) * 40; // Header + Rows
              const tableX = (canvas.width - tableWidth) / 2; // Center the table on the screen

              // Draw full table border
              ctx.strokeRect(tableX, subjectDetailsY, tableWidth, tableHeight);

              // Header cell dimensions
              const headerHeight = 30;
              const colWidth = tableWidth / 5; // 5 columns

              // Draw header background
              ctx.fillStyle = "#272f30"; // Teal background for headers
              ctx.fillRect(tableX, subjectDetailsY, tableWidth, headerHeight);

              // Header labels
              const headers = ["Date", "Subject", "Code", "Time", "Sign Of Invigilator"];
              ctx.fillStyle = "white"; // White text for headers

              headers.forEach((header, index) => {
                ctx.fillText(header, tableX + colWidth * index + colWidth / 2, subjectDetailsY + 20);
                // Draw vertical borders for headers
                if (index < headers.length - 1) {
                  ctx.strokeRect(tableX + colWidth * (index + 1), subjectDetailsY, 1, tableHeight);
                }
              });

              // Rows
              let tableTop = subjectDetailsY + headerHeight;
              ticket?.hallTicketDetails?.subjects?.forEach((subject, key) => {
                const rowY = tableTop + key * 40; // Row spacing

                // No background color for rows (transparent)
                ctx.fillStyle = "transparent";
                ctx.fillRect(tableX, rowY, tableWidth, 40); // Full row width
                ctx.strokeStyle = "black";
                ctx.strokeRect(tableX, rowY, tableWidth, 40);

                ctx.fillStyle = "black"; // Black text for rows
                ctx.textAlign = "center";

                // Date
                ctx.fillText(
                  moment(subject?.date).format("DD-MM-YYYY"),
                  tableX + colWidth / 2,
                  rowY + 20
                );

                // Subject Name (Left align for clarity)
                ctx.textAlign = "left";
                ctx.fillText(
                  subject?.subjectId?.subjectName,
                  tableX + colWidth + 10,
                  rowY + 20
                );

                // Subject Code
                ctx.textAlign = "center";
                ctx.fillText(
                  subject?.subjectId?.subjectCode,
                  tableX + colWidth * 2.5,
                  rowY + 20
                );

                // Time
                ctx.fillText(moment(subject?.time, "HH:mm").format("hh:mm A"), tableX + colWidth * 3.5, rowY + 20);

                // Invigilator Placeholder
                ctx.fillText("", tableX + colWidth * 4.5, rowY + 20);

                // Draw vertical borders for each cell in the row
                for (let i = 1; i <= 4; i++) {
                  ctx.strokeRect(tableX + colWidth * i, rowY, 1, 40);
                }
              });


              // Save the modified image as a Blob and add it to the zip
              canvas.toBlob((modifiedImageBlob) => {
                zip.file(`${ticket.registerNo}.jpg`, modifiedImageBlob);

                // Update progress
                setDownloadProgress(((index + 1) / totalTickets) * 100);

                resolve();
              }, "image/jpeg");
            };
          });
        }

        // Generate the ZIP file and trigger the download
        zip.generateAsync({ type: "blob" }).then((content) => {
          const className = classes.find(cls => cls._id === classId)?.className || "hall-tickets";
          saveAs(content, `${className}.zip`);
          setIsDownloading(false);
        });
      } else {
        console.log("No hall tickets available.");
        setIsDownloading(false);
      }
    } catch (error) {
      console.log("Error downloading bulk hall tickets:", error);
      toast.error(error.response?.data?.message || "Error downloading hall tickets",{
        position: "top-center",

      });
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    getAllClasses();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="w-1/2 p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold text-center text-teal-600 mb-6">
          Bulk Hall Tickets
        </h1>

        <table className="min-w-full table-auto rounded-lg">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Class Name</th>
              <th className="p-3 text-left">Download Hall Ticket</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr key={classItem._id} className="border-b hover:bg-gray-700">
                <td className="p-3">{classItem.className}</td>
                <td className="p-3">
                  <button
                    onClick={() => downloadHallTickets(classItem._id)}
                    disabled={isDownloading}
                    className={`bg-teal-600 text-white px-4 py-2 rounded-md transition ${isDownloading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "hover:bg-teal-700"
                      }`}
                  >
                    {isDownloading
                      ? `Downloading ${Math.round(downloadProgress)}%`
                      : "Download Hall Tickets"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isDownloading && (
          <div className="mt-4">
            <div className="text-center text-teal-600">
              Downloading... {Math.round(downloadProgress)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-teal-600 h-2 rounded-full"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BulkHallTickets;
