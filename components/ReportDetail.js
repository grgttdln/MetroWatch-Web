"use client";

import { useState } from "react";
import { db } from "../utils/supabase/api";

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "not resolved", label: "Not Resolved", color: "bg-orange-500" },
  { value: "ongoing", label: "Ongoing", color: "bg-blue-500" },
  { value: "resolved", label: "Resolved", color: "bg-green-500" },
  { value: "dismissed", label: "Dismissed", color: "bg-gray-500" },
];

export default function ReportDetail({ report, onBack, onUpdateReport }) {
  const [comment, setComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(
    report?.status || "pending"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateTime = (date, time) => {
    try {
      if (!date) return "";
      const dateTime = time ? `${date}T${time}` : date;
      const d = new Date(dateTime);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: time ? "numeric" : undefined,
        minute: time ? "2-digit" : undefined,
        hour12: true,
      }).format(d);
    } catch {
      return date || "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update the report status in the database
      const { data, error } = await db.update(
        "reports",
        { status: selectedStatus },
        { report_id: report.report_id }
      );

      if (error) {
        throw new Error(error.message || "Failed to update report status");
      }

      console.log("Report status updated successfully:", data);

      // Update the local state if onUpdateReport callback is provided
      if (onUpdateReport && data && data[0]) {
        onUpdateReport({
          ...report,
          status: selectedStatus,
          comments: [
            ...(report.comments || []),
            {
              id: Date.now(),
              text: comment,
              timestamp: new Date().toISOString(),
              author: "Current User", // In a real app, this would be the logged-in user
            },
          ],
        });
      }

      setComment("");

      // Show success message (you could add a toast notification here)
      alert("Report status updated successfully!");
    } catch (error) {
      console.error("Error updating report:", error);
      alert(`Error updating report: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!report) return null;

  const currentStatusOption = statusOptions.find(
    (opt) => opt.value === selectedStatus
  );

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-blue-500/30">
          <button
            onClick={onBack}
            className="p-2 hover:bg-blue-500/30 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center p-2">
              <img
                src="/MetroWatch.png"
                alt="MetroWatch Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold">MetroWatch</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Report Title */}
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {report.description || "Report Details"}
            </h2>
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  currentStatusOption?.color || "bg-gray-500"
                }`}
              ></div>
              <span className="text-blue-200 font-medium">
                {currentStatusOption?.label ||
                  (selectedStatus
                    ? selectedStatus.charAt(0).toUpperCase() +
                      selectedStatus.slice(1)
                    : "Pending")}
              </span>
            </div>
          </div>

          {/* Report Image */}
          {report.url && (
            <div className="rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm">
              <img
                src={report.url}
                alt="Report"
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Details Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Details:</h3>

            <div>
              <span className="text-blue-200">Reported On:</span>
              <p className="font-medium">
                {formatDateTime(report.date, report.time)}
              </p>
            </div>

            <div>
              <span className="text-blue-200">Address:</span>
              <p className="font-medium">
                {report.location || "Location not specified"}
              </p>
            </div>

            <div>
              <span className="text-blue-200">Category:</span>
              <p className="font-medium">
                {report.category || "Uncategorized"}
              </p>
            </div>

            <div>
              <span className="text-blue-200">Severity:</span>
              <p className="font-medium capitalize">
                {report.severity || "Unknown"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-blue-200">Reported By:</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-blue-800"
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
                </div>
                <span className="font-medium">
                  {report.users?.name || "Unknown User"}
                </span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          {report.comments && report.comments.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Previous Comments:</h3>
              <div className="space-y-3">
                {report.comments.map((comment) => (
                  <div key={comment.id} className="bg-white/10 rounded-lg p-3">
                    <p className="text-sm text-blue-200">{comment.author}</p>
                    <p className="font-medium">{comment.text}</p>
                    <p className="text-xs text-blue-300 mt-1">
                      {new Date(comment.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comment Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold">Leave a Comment/Remark:</h3>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment or remark here..."
              className="w-full h-32 p-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none"
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Update Status of Report:
              </label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent appearance-none cursor-pointer"
                >
                  {statusOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-blue-800 text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-blue-200"
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

            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="w-full bg-white text-blue-800 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                "Update Status of Report"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
