import { faCloudDownloadAlt, faEye, faFileAlt, faGraduationCap, faLock, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { jsPDF } from "jspdf";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Axios, { getUploadsUrl } from "../../../Axios";

/**
 * Generates a single supplementary hall ticket image using the HTML5 Canvas API.
 * Uses the exact same background image and layout dimensions as standard hall tickets.
 * @param {object} ticket - The candidate's supplementary hall ticket data.
 * @param {string} examName - The name of the supplementary exam.
 * @param {Image} backgroundImage - The pre-loaded background image object (/HallTicketBG.jpg).
 * @returns {Promise<{blob: Blob, dataUrl: string}>} Resolves with the generated Blob and Data URL.
 */
const generateSupplementaryHallTicketImage = (ticket, examName, backgroundImage) => {
  return new Promise(async (resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = backgroundImage.width;
    canvas.height = backgroundImage.height;

    // --- Drawing Constants ---
    const FONT_PRIMARY = "'Minion Pro', serif";
    const COLOR_PRIMARY = "#000000";
    const CENTER_X = canvas.width / 2;
    const POS_Y_START = canvas.height * 0.28;

    // 1. Draw Background
    ctx.drawImage(backgroundImage, 0, 0);

    // 2. Draw Header (Exam Title)
    const headerY = POS_Y_START - 120;
    ctx.font = `bold 33px ${FONT_PRIMARY}`;
    ctx.textAlign = "center";
    ctx.fillStyle = COLOR_PRIMARY;
    ctx.fillText(examName?.toUpperCase() || "SUPPLEMENTARY EXAMINATION", CENTER_X, headerY);

    // 3. Draw Student Photo (if available)
    if (ticket.imageUrl) {
      try {
        const studentImg = new Image();
        studentImg.crossOrigin = "anonymous";
        // Handle full URL vs relative file path
        studentImg.src = ticket.imageUrl.startsWith("http")
          ? ticket.imageUrl
          : getUploadsUrl(ticket.imageUrl);

        await new Promise((res) => {
          studentImg.onload = res;
          studentImg.onerror = () => {
            console.warn("Could not load student photo:", ticket.imageUrl);
            res();
          };
        });

        if (studentImg.complete && studentImg.naturalWidth > 0) {
          const photoWidth = 210;
          const photoHeight = 270;
          const photoX = canvas.width - photoWidth - 145;
          const photoY = POS_Y_START + 25;

          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(photoX - 2, photoY - 2, photoWidth + 4, photoHeight + 4);
          ctx.drawImage(studentImg, photoX, photoY, photoWidth, photoHeight);
        }
      } catch (error) {
        console.error("Error drawing student photo:", error);
      }
    }

    // 4. Draw Candidate Details
    ctx.fillStyle = COLOR_PRIMARY;

    // Exam Register Number (Centered in the pre-printed box)
    const regNoX = CENTER_X - 120;
    const regNoY = POS_Y_START + 70;
    ctx.textAlign = "center";
    ctx.font = `bold 32px ${FONT_PRIMARY}`;
    ctx.fillText(ticket.registerNo || "", regNoX, regNoY);

    // Candidate details column
    const detailsX = canvas.width * 0.34;
    ctx.textAlign = "left";

    // Candidate Name
    let currentY = POS_Y_START + 145;
    ctx.font = `bold 30px ${FONT_PRIMARY}`;
    ctx.fillText(ticket.studentName?.toUpperCase() || "", detailsX, currentY);

    // Name of the Institution (Study Centre)
    currentY += 50;
    ctx.font = `bold 22px ${FONT_PRIMARY}`;
    const institutionText = ticket.institution?.toUpperCase() || "";
    const institutionLines = institutionText.includes(",")
      ? institutionText.split(",").map((part) => part.trim())
      : [institutionText];
    institutionLines.forEach((line, i) => {
      ctx.fillText(line, detailsX, currentY + i * 28);
    });

    // Class / Semester
    currentY += 85 + (institutionLines.length - 1) * 28;
    ctx.font = `bold 28px ${FONT_PRIMARY}`;
    ctx.fillText(ticket.className?.toUpperCase() || "", detailsX, currentY);

    // 5. Draw Supplementary Subjects Table
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

    // Header Background
    ctx.fillStyle = "#2d3748";
    ctx.fillRect(tableStartX, tableStartY, tableWidth, headerHeight);

    // Header Labels
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

    // Subject Rows
    const subjectsList = ticket.subjects || [];
    subjectsList.forEach((subject, index) => {
      const rowY = tableStartY + headerHeight + index * rowHeight;

      ctx.fillStyle = COLOR_PRIMARY;
      ctx.font = `bold 24px ${FONT_PRIMARY}`;

      // Date
      ctx.textAlign = "center";
      ctx.fillText(subject.date || "-", tableStartX + colWidth * 0.5, rowY + 35);

      // Subject Name
      ctx.textAlign = "left";
      ctx.fillText(
        subject.subjectName || "",
        tableStartX + colWidth + 10,
        rowY + 35
      );

      // Subject Code
      ctx.textAlign = "center";
      ctx.fillText(
        subject.subjectCode || "-",
        tableStartX + colWidth * 2.5,
        rowY + 35
      );

      // Time
      ctx.fillText(subject.time || "-", tableStartX + colWidth * 3.5, rowY + 35);

      // Row divider line
      ctx.strokeStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.moveTo(tableStartX, rowY + rowHeight);
      ctx.lineTo(tableStartX + tableWidth, rowY + rowHeight);
      ctx.stroke();
    });

    // Outer Table Border & Column Dividers
    const totalTableHeight = headerHeight + subjectsList.length * rowHeight;
    ctx.strokeStyle = "#a0aec0";
    ctx.strokeRect(tableStartX, tableStartY, tableWidth, totalTableHeight);

    for (let i = 1; i < tableHeaders.length; i++) {
      ctx.beginPath();
      ctx.moveTo(tableStartX + colWidth * i, tableStartY);
      ctx.lineTo(tableStartX + colWidth * i, tableStartY + totalTableHeight);
      ctx.stroke();
    }

    // Export as Blob & DataURL
    canvas.toBlob(
      (blob) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ blob, dataUrl: reader.result });
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.95
    );
  });
};

function SupplementaryBulkHallTickets() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [activeDownloadKey, setActiveDownloadKey] = useState(null); // 'all' or semesterName

  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId && sessions.length > 0) {
      const sess = sessions.find((s) => s._id === selectedSessionId);
      setSelectedSession(sess || null);
      if (sess) {
        loadPreview(sess._id);
      }
    } else {
      setSelectedSession(null);
      setPreviewDataUrl(null);
    }
  }, [selectedSessionId, sessions]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data } = await Axios.get("/supplementary-exam/hall-ticket-sessions");
      const list = data.data.sessions || [];
      setSessions(list);
      if (list.length > 0) {
        setSelectedSessionId(list[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch supplementary hall ticket sessions:", error);
      toast.error("Failed to load supplementary exam sessions");
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = useCallback(async (templateId) => {
    try {
      setIsPreviewLoading(true);
      const { data } = await Axios.get(
        `/supplementary-exam/hall-tickets?examTemplateId=${templateId}`
      );
      const tickets = data.data.hallTickets || [];

      if (tickets.length > 0) {
        const bgResponse = await axios.get("/HallTicketBG.jpg", {
          responseType: "arraybuffer",
        });
        const backgroundImage = new Image();
        backgroundImage.src = URL.createObjectURL(new Blob([bgResponse.data]));
        await new Promise((resolve) => (backgroundImage.onload = resolve));

        const { dataUrl } = await generateSupplementaryHallTicketImage(
          tickets[0],
          tickets[0].examName,
          backgroundImage
        );
        setPreviewDataUrl(dataUrl);
      } else {
        setPreviewDataUrl(null);
      }
    } catch (error) {
      console.error("Failed to load hall ticket preview:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  }, []);

  const downloadHallTickets = async (semester) => {
    if (!selectedSessionId) return;

    const downloadKey = semester || "all";
    setIsDownloading(true);
    setDownloadProgress(0);
    setActiveDownloadKey(downloadKey);

    try {
      // 1. Fetch tickets from backend
      const url =
        downloadKey === "all"
          ? `/supplementary-exam/hall-tickets?examTemplateId=${selectedSessionId}`
          : `/supplementary-exam/hall-tickets?examTemplateId=${selectedSessionId}&semester=${encodeURIComponent(
              semester
            )}`;

      const { data } = await Axios.get(url);
      const tickets = data.data.hallTickets || [];

      if (tickets.length === 0) {
        toast.info("No supplementary hall tickets found for this selection.");
        return;
      }

      // 2. Fetch background image asset
      const bgResponse = await axios.get("/HallTicketBG.jpg", {
        responseType: "arraybuffer",
      });
      const backgroundImage = new Image();
      backgroundImage.src = URL.createObjectURL(new Blob([bgResponse.data]));
      await new Promise((resolve) => (backgroundImage.onload = resolve));

      // 3. Generate all hall ticket images
      let completedCount = 0;
      const images = await Promise.all(
        tickets.map((ticket) =>
          generateSupplementaryHallTicketImage(
            ticket,
            ticket.examName,
            backgroundImage
          )
            .then(({ blob }) => {
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              });
            })
            .then((dataUrl) => {
              completedCount++;
              setDownloadProgress((completedCount / tickets.length) * 100);
              return dataUrl;
            })
        )
      );

      // 4. Create single PDF containing all generated tickets as pages
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

      // Add subsequent pages
      for (let i = 1; i < images.length; i++) {
        const img = new window.Image();
        img.src = images[i];
        await new Promise((resolve) => (img.onload = resolve));
        pdf.addPage([img.width, img.height], img.width > img.height ? "l" : "p");
        pdf.addImage(images[i], "JPEG", 0, 0, img.width, img.height);
      }

      // 5. Save the PDF
      const cleanSessionTitle = (selectedSession?.title || "Supplementary")
        .replace(/[^a-zA-Z0-9]/g, "_");
      const cleanSem = downloadKey === "all" ? "All_Semesters" : semester.replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`${cleanSessionTitle}_${cleanSem}_Hall_Tickets.pdf`);

      toast.success("Supplementary hall tickets downloaded successfully!");
    } catch (error) {
      console.error("Error downloading supplementary hall tickets:", error);
      toast.error(
        error.response?.data?.message || "An error occurred during download."
      );
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      setActiveDownloadKey(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
              <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600" />
              Download Supplementary Hall Tickets
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Generate and download bulk admit cards for candidates registered for supplementary exams.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-600" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
              <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 text-4xl mb-3" />
              <h3 className="text-base font-bold text-gray-700">
                No Supplementary Applications Found
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Your study centre has not registered any students for supplementary exams yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Exam Session Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  SELECT SUPPLEMENTARY EXAM SESSION
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg p-3 text-base font-semibold text-gray-800 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  >
                    {sessions.map((sess) => (
                      <option key={sess._id} value={sess._id}>
                        {sess.title} — ({sess.totalStudents} Candidates) [{sess.status?.toUpperCase()}]
                      </option>
                    ))}
                  </select>

                  {selectedSession && (
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          selectedSession.status === "open"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {selectedSession.status === "open" ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            OPEN
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faLock} className="text-xs text-amber-600" />
                            CLOSED (View & Download Active)
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Table of Semesters / Categories */}
              {selectedSession && (
                <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-xs">
                  <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Semester / Category
                        </th>
                        <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">
                          Total Candidates
                        </th>
                        <th className="px-6 py-3.5 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Combined Row (All Semesters) */}
                      <tr className="bg-blue-50/50 hover:bg-blue-50 transition-colors font-semibold">
                        <td className="px-6 py-4 whitespace-nowrap text-blue-900 flex items-center gap-2">
                          <FontAwesomeIcon icon={faFileAlt} className="text-blue-600" />
                          <span>All Semesters (Combined Package)</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-blue-900 font-bold">
                          {selectedSession.totalStudents}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => downloadHallTickets(null)}
                            disabled={isDownloading}
                            className="relative inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors min-w-[140px]"
                          >
                            {activeDownloadKey === "all" && isDownloading ? (
                              <>
                                <div
                                  className="absolute top-0 left-0 h-full bg-blue-700 rounded-md"
                                  style={{ width: `${downloadProgress}%` }}
                                ></div>
                                <span className="relative z-10 text-xs">
                                  Downloading... {Math.round(downloadProgress)}%
                                </span>
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon
                                  icon={faCloudDownloadAlt}
                                  className="mr-2 -ml-1 h-5 w-5"
                                />
                                <span>Download All</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Individual Semester Rows */}
                      {selectedSession.semesters.map((sem, sIdx) => {
                        const isCurrentDownloading =
                          activeDownloadKey === sem.semesterName && isDownloading;
                        return (
                          <tr key={sIdx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                              {sem.semesterName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700 font-bold">
                              {sem.count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => downloadHallTickets(sem.semesterName)}
                                disabled={isDownloading}
                                className="relative inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors min-w-[140px]"
                              >
                                {isCurrentDownloading ? (
                                  <>
                                    <div
                                      className="absolute top-0 left-0 h-full bg-indigo-700 rounded-md"
                                      style={{ width: `${downloadProgress}%` }}
                                    ></div>
                                    <span className="relative z-10 text-xs">
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
              )}
            </div>
          )}
        </div>

        {/* Live Hall Ticket Preview Card */}
        {previewDataUrl && (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faEye} className="text-indigo-600" />
                <span>Admit Card Visual Preview</span>
              </h3>
              <span className="text-xs text-gray-500 italic">
                Sample preview from this exam session
              </span>
            </div>

            <div className="flex justify-center overflow-x-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
              {isPreviewLoading ? (
                <div className="py-20">
                  <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-indigo-600" />
                </div>
              ) : (
                <img
                  src={previewDataUrl}
                  alt="Supplementary Hall Ticket Preview"
                  className="max-h-[600px] w-auto object-contain rounded shadow-md border border-gray-300"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplementaryBulkHallTickets;
