import React, { useEffect, useState } from "react";
import axios from "axios";

const MentorApplicationsPanel = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch all mentor applications
  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/admin/mentor-applications",
        { withCredentials: true }
      );
      setApplications(response.data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update status
  const updateApplicationStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5001/admin/mentor-applications/${id}/status`,
        { status },
        { withCredentials: true }
      );

      // Update UI
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status } : app))
      );
    } catch (err) {
      console.error("Error updating application status:", err);
      alert("Failed to update application status.");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ✅ Loading & Error UI
  if (loading) {
    return (
      <div className="text-center py-10 text-indigo-600 font-medium">
        Loading mentor applications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
        Mentor Applications
      </h2>

      {applications.length === 0 ? (
        <p className="text-center text-gray-500">No mentor applications found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">LinkedIn</th>
                <th className="px-5 py-3">Portfolio</th>
                <th className="px-5 py-3">Bio</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((app) => {
                const user = app.userId || {}; // in case populated from backend

                return (
                  <tr
                    key={app._id}
                    className="border-b hover:bg-indigo-50 transition"
                  >
                    {/* Applicant */}
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {app.name ||
                            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                            "—"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user.email || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-3">
                      {app.phoneNumber || "—"}
                    </td>

                    {/* Domain */}
                    <td className="px-5 py-3">{app.domain || "—"}</td>

                    {/* LinkedIn */}
                    <td className="px-5 py-3">
                      {app.linkedin ? (
                        <a
                          href={app.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Portfolio */}
                    <td className="px-5 py-3">
                      {app.portfolio ? (
                        <a
                          href={app.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Bio */}
                    <td className="px-5 py-3 max-w-xs truncate">
                      {app.bio || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3 capitalize">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : app.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-center">
                      {app.status === "pending" ? (
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() =>
                              updateApplicationStatus(app._id, "approved")
                            }
                            className="px-3 py-1 rounded-md bg-green-500 text-white hover:bg-green-600 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              updateApplicationStatus(app._id, "rejected")
                            }
                            className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <em className="text-gray-400">—</em>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MentorApplicationsPanel;
