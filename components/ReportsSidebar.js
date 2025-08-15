"use client";

import { useState, useMemo } from "react";
import ReportDetail from "./ReportDetail";

const categories = {
  Garbage: "🗑️",
  Traffic: "🚦",
  Flooding: "🌊",
  Vandalism: "⚠️",
  "Noise Pollution": "🔊",
  "Road Damage": "🕳️",
  "Illegal Parking": "🚗",
  "Street Lighting": "💡",
  "Stray Animals": "🐶",
  Others: "📋",
};

export default function ReportsSidebar({
  reports,
  status,
  selectedReport,
  onSelectReport,
}) {
  const [severity, setSeverity] = useState("");
  const [category, setCategory] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (severity && (r.severity || "").toLowerCase() !== severity)
        return false;
      if (category && (r.category || "") !== category) return false;

      // Handle date range filtering
      if (dateRange) {
        const today = new Date();
        const reportDate = new Date(r.date);
        if (!isFinite(reportDate)) return true; // Skip invalid dates

        const daysDiff = Math.floor(
          (today - reportDate) / (1000 * 60 * 60 * 24)
        );

        switch (dateRange) {
          case "today":
            if (daysDiff !== 0) return false;
            break;
          case "week":
            if (daysDiff > 7) return false;
            break;
          case "month":
            if (daysDiff > 30) return false;
            break;
          default:
            break;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          ![r.location, r.description, r.category, r.severity, r.user_id]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [reports, severity, category, dateRange, searchQuery]);

  const formatDateTime = (date, time) => {
    try {
      if (!date) return "";
      const dateTime = time ? `${date}T${time}` : date;
      const d = new Date(dateTime);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: time ? "numeric" : undefined,
        minute: time ? "2-digit" : undefined,
        hour12: true,
      }).format(d);
    } catch {
      return date || "";
    }
  };

  const handleReportClick = (report) => {
    onSelectReport(report);
  };

  const handleBackToList = () => {
    onSelectReport(null);
  };

  const handleUpdateReport = (updatedReport) => {
    // In a real application, you would update the report in your backend
    // For now, we'll just log the update and go back to the list
    console.log("Report updated:", updatedReport);
    onSelectReport(null);
  };

  // If a specific report is selected, show the detail view
  if (selectedReport) {
    return (
      <ReportDetail
        report={selectedReport}
        onBack={handleBackToList}
        onUpdateReport={handleUpdateReport}
      />
    );
  }

  return (
    <div className="w-full max-w-none lg:max-w-2xl flex flex-col gap-4 lg:gap-6 p-4 lg:p-6 bg-white h-screen overflow-hidden">
      {/* App Header */}
      <div className="flex flex-col items-center gap-2 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center p-2">
            <img
              src="/MetroWatch.png"
              alt="MetroWatch Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            MetroWatch
          </h1>
        </div>
        <p className="text-gray-600 text-center">Citizens' Reports on Manila</p>
      </div>

      {/* Reports Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
        <div
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            status === "connected"
              ? "bg-green-100 text-green-800"
              : status === "connecting"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full mr-2 ${
              status === "connected"
                ? "bg-green-500"
                : status === "connecting"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          ></div>
          {status === "connected"
            ? "Live"
            : status === "connecting"
            ? "Connecting"
            : "Error"}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search for a Location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Severity Filter */}
          <div className="relative">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="block w-full px-3 py-2.5 text-sm text-black border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-500">
                Severity
              </option>
              <option value="high" className="text-black">
                High
              </option>
              <option value="medium" className="text-black">
                Medium
              </option>
              <option value="low" className="text-black">
                Low
              </option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-3 py-2.5 text-sm text-black border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-500">
                Category
              </option>
              {Object.keys(categories).map((c) => (
                <option key={c} value={c} className="text-black">
                  {categories[c]} {c}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full px-3 py-2.5 text-sm text-black border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-500">
                Date Range
              </option>
              <option value="today" className="text-black">
                Today
              </option>
              <option value="week" className="text-black">
                Past Week
              </option>
              <option value="month" className="text-black">
                Past Month
              </option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
        {filteredReports.map((r) => (
          <div
            key={r.report_id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => handleReportClick(r)}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Image */}
              <div className="w-full sm:w-32 h-40 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                {r.url ? (
                  <img
                    src={r.url}
                    alt="Report"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Report Details */}
              <div className="flex-1 flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {r.description || "Clogged Drainage"}
                </h3>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-blue-600 font-medium">
                    {r.category || "Flood Control"}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatDateTime(r.date, r.time)}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Posted by:</span>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {r.user_id || "John Doe"}
                    </div>
                  </div>

                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReportClick(r);
                    }}
                  >
                    Take Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!filteredReports.length && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg
              className="w-12 h-12 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">No reports found</p>
          </div>
        )}
      </div>
    </div>
  );
}
