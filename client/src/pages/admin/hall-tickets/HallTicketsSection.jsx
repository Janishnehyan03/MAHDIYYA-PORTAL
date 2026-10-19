import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArchive, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import BulkHallTickets from "./BulkHallTickets";
import SupplementaryBulkHallTickets from "./SupplementaryBulkHallTickets";

function HallTicketsSection({ defaultTab }) {
  const [searchParams, setSearchParams] = useSearchParams();


  const tabParam = searchParams.get("tab") || searchParams.get("type");
  const initialTab = defaultTab || (tabParam === "supplementary" ? "supplementary" : "regular");
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (tabParam === "supplementary") {
      setActiveTab("supplementary");
    } else if (tabParam === "regular") {
      setActiveTab("regular");
    }
  }, [tabParam, defaultTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Navigation Tabs Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
                <FontAwesomeIcon icon={faFileArchive} className="text-indigo-600" />
                Hall Tickets Section
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Download and manage examination hall tickets for regular and supplementary candidates.
              </p>
            </div>
          </div>

          {/* Two Options / Segmented Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl max-w-md w-full border border-gray-200">
            <button
              type="button"
              onClick={() => handleTabChange("regular")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "regular"
                  ? "bg-white text-indigo-600 shadow-xs border border-gray-200/80"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <FontAwesomeIcon icon={faFileArchive} className={activeTab === "regular" ? "text-indigo-600" : "text-gray-400"} />
              <span>1. Regular Hall Tickets</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("supplementary")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "supplementary"
                  ? "bg-white text-blue-600 shadow-xs border border-gray-200/80"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <FontAwesomeIcon icon={faGraduationCap} className={activeTab === "supplementary" ? "text-blue-600" : "text-gray-400"} />
              <span>2. Supplementary Hall Tickets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Selected View */}
      <div>
        {activeTab === "regular" ? (
          <BulkHallTickets />
        ) : (
          <SupplementaryBulkHallTickets />
        )}
      </div>
    </div>
  );
}

export default HallTicketsSection;
