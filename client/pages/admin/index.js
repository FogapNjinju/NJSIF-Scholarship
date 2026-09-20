import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SESSION_KEY = "njsif-admin-session";

const statusStyles = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  accepted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  rejected: "border-red-500/30 bg-red-500/10 text-red-200",
  archived: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  deleted: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

const statusOrder = {
  pending: 0,
  accepted: 1,
  rejected: 2,
  archived: 3,
  deleted: 4,
};

const documentLabels = {
  gceOLevel: "GCE O/L",
  gceALevel: "GCE A/L",
  transcript: "Transcript",
  attestation: "Attestation",
  idCard: "Passport / ID",
};

const getDocumentEntries = (documents = {}) => Object.entries(documents || {}).filter(([, value]) => value);
const getDocumentViewUrl = (filename) => `${API_URL}/api/applications/documents/${encodeURIComponent(filename)}/view`;
const getDocumentDownloadUrl = (filename) => `${API_URL}/api/applications/documents/${encodeURIComponent(filename)}/download`;
const getScoreValue = (value) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(100, Math.max(0, parsed));
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "—");
const ARCHIVE_TAG = "[ARCHIVED]";

const hasArchiveMarker = (text = "") => typeof text === "string" && text.includes(ARCHIVE_TAG);

const stripArchiveMarker = (text = "") =>
  typeof text === "string"
    ? text.replaceAll(ARCHIVE_TAG, "").replace(/^[-:\s]+/, "").trim()
    : "";

const buildArchiveText = (text, fallback) => {
  const cleaned = stripArchiveMarker(text || "");
  return `${ARCHIVE_TAG} ${cleaned || fallback}`.trim();
};

const getEffectiveStatus = (application = {}) => {
  const rawStatus = typeof application.status === "string" ? application.status.trim().toLowerCase() : "";

  if (rawStatus === "deleted") return "deleted";
  if (rawStatus === "archived") return "archived";
  if (rawStatus === "accepted" || rawStatus === "rejected") return rawStatus;

  if (
    application.archivedAt ||
    hasArchiveMarker(application.reviewNote) ||
    hasArchiveMarker(application.decisionReason)
  ) {
    return "archived";
  }

  return rawStatus || "pending";
};

const normalizeApplication = (application = {}) => {
  const effectiveStatus = getEffectiveStatus(application);

  return {
    ...application,
    status: effectiveStatus,
    archivedAt:
      effectiveStatus === "archived"
        ? application.archivedAt || application.lastReviewedAt || application.createdAt || new Date().toISOString()
        : null,
  };
};

const downloadFile = (content, filename, type) => {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const exportApplicationsToCsv = (applications = [], filename = "applications.csv") => {
  const headers = [
    "Rank",
    "Name",
    "Email",
    "Status",
    "Score",
    "Reviewed",
    "Education",
    "Program",
    "Submitted At",
    "Decision Reason",
    "Internal Note",
    "Documents",
  ];

  const rows = applications.map((application) => [
    application.rank || "",
    application.name || "",
    application.email || "",
    application.status || "pending",
    getScoreValue(application.score),
    application.reviewed ? "Yes" : "No",
    application.education || "",
    application.program || "",
    formatDateTime(application.createdAt),
    application.decisionReason || "",
    application.reviewNote || "",
    getDocumentEntries(application.documents)
      .map(([key]) => documentLabels[key] || key)
      .join(", "),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  downloadFile(csv, filename, "text/csv;charset=utf-8;");
};

const exportApplicationsToExcel = (applications = [], filename = "applications.xls") => {
  const rows = applications
    .map(
      (application) => `
        <tr>
          <td>${application.rank || ""}</td>
          <td>${application.name || ""}</td>
          <td>${application.email || ""}</td>
          <td>${application.status || "pending"}</td>
          <td>${getScoreValue(application.score)}</td>
          <td>${application.reviewed ? "Yes" : "No"}</td>
          <td>${application.education || ""}</td>
          <td>${application.program || ""}</td>
          <td>${formatDateTime(application.createdAt)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Score</th>
              <th>Reviewed</th>
              <th>Education</th>
              <th>Program</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>`;

  downloadFile(html, filename, "application/vnd.ms-excel;charset=utf-8;");
};

function DocumentActions({ documents }) {
  const docs = getDocumentEntries(documents);

  if (docs.length === 0) {
    return <span className="text-xs text-slate-400">No documents uploaded</span>;
  }

  return (
    <div className="mt-3 space-y-3">
      {docs.map(([key, value]) => (
        <div
          key={`${key}-${value}`}
          className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium text-white">{documentLabels[key] || key}</p>
            <p className="text-xs text-slate-400">{value}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={getDocumentViewUrl(value)}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary !min-h-9 !px-3 !py-1.5 !text-xs"
            >
              View
            </a>
            <a href={getDocumentDownloadUrl(value)} className="btn-primary !min-h-9 !px-3 !py-1.5 !text-xs">
              Download
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

const buildSummary = (applications = []) => {
  const visibleApplications = applications.filter((item) => item.status !== "deleted");
  const byEducation = visibleApplications.reduce((acc, item) => {
    const key = item.education || "Other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const totalScore = visibleApplications.reduce((sum, item) => sum + getScoreValue(item.score), 0);

  return {
    total: visibleApplications.length,
    pending: visibleApplications.filter((item) => item.status === "pending").length,
    accepted: visibleApplications.filter((item) => item.status === "accepted").length,
    rejected: visibleApplications.filter((item) => item.status === "rejected").length,
    archived: visibleApplications.filter((item) => item.status === "archived").length,
    averageScore: visibleApplications.length ? Math.round(totalScore / visibleApplications.length) : 0,
    byEducation,
    recent: [...visibleApplications].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5),
    topRanked: [...visibleApplications]
      .sort((a, b) => getScoreValue(b.score) - getScoreValue(a.score) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5),
  };
};

const maxEducationCount = (summary) => Math.max(1, ...Object.values(summary.byEducation || {}));

const buildSubmissionTimeline = (applications = []) => {
  const visibleApplications = applications.filter((item) => item.status !== "deleted");
  const groupedByDate = visibleApplications.reduce((acc, item) => {
    const date = new Date(item.createdAt || 0).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(groupedByDate)
    .sort((a, b) => new Date(`${a[0]} 2026`) - new Date(`${b[0]} 2026`))
    .slice(-14)
    .map(([date, count]) => ({
      date,
      submissions: count,
    }));
};

const buildScoreDistribution = (applications = []) => {
  const visibleApplications = applications.filter((item) => item.status !== "deleted");
  const scoreRanges = {
    "0-20": 0,
    "21-40": 0,
    "41-60": 0,
    "61-80": 0,
    "81-100": 0,
  };

  visibleApplications.forEach((item) => {
    const score = getScoreValue(item.score);
    if (score <= 20) scoreRanges["0-20"]++;
    else if (score <= 40) scoreRanges["21-40"]++;
    else if (score <= 60) scoreRanges["41-60"]++;
    else if (score <= 80) scoreRanges["61-80"]++;
    else scoreRanges["81-100"]++;
  });

  return Object.entries(scoreRanges).map(([range, count]) => ({
    range,
    count,
  }));
};

const buildStatusTimeline = (applications = []) => {
  const visibleApplications = applications.filter((item) => item.status !== "deleted");
  const groupedByDate = visibleApplications.reduce((acc, item) => {
    const date = new Date(item.createdAt || 0).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = { pending: 0, accepted: 0, rejected: 0, archived: 0 };
    }
    acc[date][item.status] = (acc[date][item.status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(groupedByDate)
    .sort((a, b) => new Date(`${a[0]} 2026`) - new Date(`${b[0]} 2026`))
    .slice(-14)
    .map(([date, statuses]) => ({
      date,
      ...statuses,
    }));
};

export default function AdminDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState(buildSummary([]));
  const [submissionTimeline, setSubmissionTimeline] = useState([]);
  const [scoreDistribution, setScoreDistribution] = useState([]);
  const [statusTimeline, setStatusTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("active");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewedDraft, setReviewedDraft] = useState(false);
  const [reviewNoteDraft, setReviewNoteDraft] = useState("");
  const [decisionReasonDraft, setDecisionReasonDraft] = useState("");
  const [scoreDraft, setScoreDraft] = useState(0);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const applicationsRes = await axios.get(`${API_URL}/api/applications`);
      const list = (applicationsRes.data || []).map(normalizeApplication);

      setApplications(list);
      setSelectedIds((current) => current.filter((id) => list.some((item) => item._id === id)));
      setSummary(buildSummary(list));
      setSubmissionTimeline(buildSubmissionTimeline(list));
      setScoreDistribution(buildScoreDistribution(list));
      setStatusTimeline(buildStatusTimeline(list));
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (localStorage.getItem(SESSION_KEY) !== "active") {
      router.replace("/admin/login");
      return;
    }

    const timeoutId = setTimeout(() => {
      void fetchDashboard();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchDashboard, router]);

  const rankedApplications = useMemo(() => {
    const visibleApplications = applications.filter((application) => application.status !== "deleted");
    const rankMap = new Map(
      [...visibleApplications]
        .sort(
          (a, b) =>
            getScoreValue(b.score) - getScoreValue(a.score) ||
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
        .map((application, index) => [application._id, index + 1])
    );

    const query = search.trim().toLowerCase();
    const filtered = visibleApplications.filter((application) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "active"
            ? application.status !== "archived"
            : application.status === filter;

      const matchesSearch = query
        ? `${application.name || ""} ${application.email || ""} ${application.program || ""}`.toLowerCase().includes(query)
        : true;

      return matchesFilter && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }

      if (sortBy === "status") {
        return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      if (sortBy === "score-high") {
        return getScoreValue(b.score) - getScoreValue(a.score) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      if (sortBy === "score-low") {
        return getScoreValue(a.score) - getScoreValue(b.score) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return sorted.map((application) => ({
      ...application,
      rank: rankMap.get(application._id) || null,
      score: getScoreValue(application.score),
    }));
  }, [applications, filter, search, sortBy]);

  const selectedApplications = useMemo(
    () => rankedApplications.filter((application) => selectedIds.includes(application._id)),
    [rankedApplications, selectedIds]
  );

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/api/applications/${id}`, {
        status,
        score: selectedApplication?._id === id ? getScoreValue(scoreDraft) : undefined,
        reviewed: selectedApplication?._id === id ? reviewedDraft : undefined,
        reviewNote: selectedApplication?._id === id ? stripArchiveMarker(reviewNoteDraft) : undefined,
        decisionReason: selectedApplication?._id === id ? stripArchiveMarker(decisionReasonDraft) : undefined,
      });

      const normalizedResponse = normalizeApplication(response.data);
      setError("");
      setMessage(`Application updated to ${status}.`);
      await fetchDashboard();

      if (selectedApplication?._id === id) {
        setSelectedApplication(normalizedResponse);
        setReviewedDraft(normalizedResponse.reviewed || false);
        setReviewNoteDraft(stripArchiveMarker(normalizedResponse.reviewNote || ""));
        setDecisionReasonDraft(stripArchiveMarker(normalizedResponse.decisionReason || ""));
        setScoreDraft(getScoreValue(normalizedResponse.score));
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Unable to update application status.");
    }
  };

  const openDetails = (application) => {
    const normalized = normalizeApplication(application);
    setSelectedApplication(normalized);
    setReviewedDraft(normalized.reviewed || false);
    setReviewNoteDraft(stripArchiveMarker(normalized.reviewNote || ""));
    setDecisionReasonDraft(stripArchiveMarker(normalized.decisionReason || ""));
    setScoreDraft(getScoreValue(normalized.score));
  };

  const archiveApplication = async (id) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Archive this applicant instead of deleting them? You can restore them later.");
      if (!confirmed) return;
    }

    const archivePayload = {
      reviewed: selectedApplication?._id === id ? reviewedDraft : true,
      reviewNote: selectedApplication?._id === id ? reviewNoteDraft : "Archived from admin dashboard",
      decisionReason: selectedApplication?._id === id ? decisionReasonDraft : "Archived by admin",
    };

    try {
      let response;

      try {
        response = await axios.patch(`${API_URL}/api/applications/${id}/archive`, archivePayload);
      } catch (err) {
        if (![404, 405].includes(err?.response?.status || 0)) {
          throw err;
        }

        response = await axios.put(`${API_URL}/api/applications/${id}`, {
          reviewed: archivePayload.reviewed,
          reviewNote: buildArchiveText(archivePayload.reviewNote, "Archived from admin dashboard"),
          decisionReason: buildArchiveText(archivePayload.decisionReason, "Archived by admin"),
        });
      }

      const normalizedResponse = normalizeApplication({
        ...response.data,
        reviewNote: response.data?.reviewNote || buildArchiveText(archivePayload.reviewNote, "Archived from admin dashboard"),
        decisionReason: response.data?.decisionReason || buildArchiveText(archivePayload.decisionReason, "Archived by admin"),
        archivedAt: response.data?.archivedAt || new Date().toISOString(),
      });

      setError("");
      setMessage("Application archived successfully.");
      await fetchDashboard();

      if (selectedApplication?._id === id) {
        setSelectedApplication(normalizedResponse);
        setReviewedDraft(normalizedResponse.reviewed || false);
        setReviewNoteDraft(stripArchiveMarker(normalizedResponse.reviewNote || ""));
        setDecisionReasonDraft(stripArchiveMarker(normalizedResponse.decisionReason || ""));
        setScoreDraft(getScoreValue(normalizedResponse.score));
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Unable to archive application.");
    }
  };

  const restoreApplication = async (id) => {
    try {
      let response;

      try {
        response = await axios.patch(`${API_URL}/api/applications/${id}/restore`, {
          status: "pending",
        });
      } catch (err) {
        if (![404, 405].includes(err?.response?.status || 0)) {
          throw err;
        }

        response = await axios.put(`${API_URL}/api/applications/${id}`, {
          status: "pending",
          reviewNote: stripArchiveMarker(selectedApplication?._id === id ? reviewNoteDraft : selectedApplication?.reviewNote || ""),
          decisionReason: stripArchiveMarker(selectedApplication?._id === id ? decisionReasonDraft : selectedApplication?.decisionReason || ""),
        });
      }

      const normalizedResponse = normalizeApplication({
        ...response.data,
        status: "pending",
        reviewNote: stripArchiveMarker(response.data?.reviewNote || ""),
        decisionReason: stripArchiveMarker(response.data?.decisionReason || ""),
        archivedAt: null,
      });

      setError("");
      setMessage("Application restored to pending.");
      await fetchDashboard();

      if (selectedApplication?._id === id) {
        setSelectedApplication(normalizedResponse);
        setReviewedDraft(normalizedResponse.reviewed || false);
        setReviewNoteDraft(stripArchiveMarker(normalizedResponse.reviewNote || ""));
        setDecisionReasonDraft(stripArchiveMarker(normalizedResponse.decisionReason || ""));
        setScoreDraft(getScoreValue(normalizedResponse.score));
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Unable to restore application.");
    }
  };

  const saveReviewDetails = async () => {
    if (!selectedApplication?._id) return;

    try {
      const response = await axios.put(`${API_URL}/api/applications/${selectedApplication._id}`, {
        score: getScoreValue(scoreDraft),
        reviewed: reviewedDraft,
        reviewNote:
          selectedApplication.status === "archived"
            ? buildArchiveText(reviewNoteDraft, "Archived from admin dashboard")
            : stripArchiveMarker(reviewNoteDraft),
        decisionReason:
          selectedApplication.status === "archived"
            ? buildArchiveText(decisionReasonDraft, "Archived by admin")
            : stripArchiveMarker(decisionReasonDraft),
      });

      const normalizedResponse = normalizeApplication(response.data);
      setSelectedApplication(normalizedResponse);
      setReviewedDraft(normalizedResponse.reviewed || false);
      setReviewNoteDraft(stripArchiveMarker(normalizedResponse.reviewNote || ""));
      setDecisionReasonDraft(stripArchiveMarker(normalizedResponse.decisionReason || ""));
      setScoreDraft(getScoreValue(normalizedResponse.score));
      setMessage("Review notes and scoring saved.");
      await fetchDashboard();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Unable to save review details.");
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = rankedApplications.map((application) => application._id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? selectedIds.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...selectedIds, ...visibleIds])));
  };

  const runBulkStatusUpdate = async (status) => {
    if (selectedIds.length === 0) {
      setError("Select at least one application first.");
      return;
    }

    try {
      let response;

      try {
        response = await axios.put(`${API_URL}/api/applications/bulk-update`, {
          ids: selectedIds,
          status,
          reviewed: status !== "pending",
        });
      } catch (err) {
        const statusCode = err?.response?.status || 0;
        const messageText = String(err?.response?.data?.error || "").toLowerCase();

        if (!(statusCode === 404 || statusCode === 405 || (statusCode === 400 && messageText.includes("invalid status")))) {
          throw err;
        }

        await Promise.all(
          selectedApplications.map((application) =>
            axios.put(`${API_URL}/api/applications/${application._id}`, {
              ...(status !== "archived" ? { status } : {}),
              reviewed: status !== "pending",
              reviewNote:
                status === "archived"
                  ? buildArchiveText(application.reviewNote, "Archived from admin dashboard")
                  : stripArchiveMarker(application.reviewNote || ""),
              decisionReason:
                status === "archived"
                  ? buildArchiveText(application.decisionReason, "Archived by admin")
                  : stripArchiveMarker(application.decisionReason || ""),
            })
          )
        );

        response = { data: { updatedCount: selectedIds.length, applications: [] } };
      }

      setError("");
      setMessage(`${response.data.updatedCount || selectedIds.length} applications updated to ${status}.`);
      setSelectedIds([]);
      await fetchDashboard();

      if (selectedApplication && selectedIds.includes(selectedApplication._id)) {
        const updatedCurrent = response.data.applications?.find((item) => item._id === selectedApplication._id);
        if (updatedCurrent) {
          openDetails(updatedCurrent);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Unable to run the bulk action.");
    }
  };

  const handleExport = (type) => {
    const source = selectedApplications.length > 0 ? selectedApplications : rankedApplications;

    if (source.length === 0) {
      setError("There are no applications to export.");
      return;
    }

    const datedFile = `applications-${new Date().toISOString().slice(0, 10)}`;
    setMessage(`${source.length} application${source.length === 1 ? "" : "s"} prepared for export.`);

    if (type === "excel") {
      exportApplicationsToExcel(source, `${datedFile}.xls`);
      return;
    }

    exportApplicationsToCsv(source, `${datedFile}.csv`);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
    }
    router.push("/admin/login");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/20 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Admin dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Application insights and review center</h1>
            <p className="mt-2 text-sm text-slate-400">
              Sort submissions, run bulk actions, export reports, archive safely, and rank applicants by score.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={fetchDashboard} className="btn-secondary !min-h-10 !px-4 !py-2">
              Refresh
            </button>
            <Link href="/" className="btn-secondary !min-h-10 !px-4 !py-2">
              Back to site
            </Link>
            <button onClick={handleLogout} className="btn-primary !min-h-10 !px-4 !py-2">
              Logout
            </button>
          </div>
        </header>

        {message && (
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total applications", value: summary.total },
            { label: "Pending", value: summary.pending },
            { label: "Accepted", value: summary.accepted },
            { label: "Archived", value: summary.archived },
            { label: "Avg. score", value: `${summary.averageScore}/100` },
          ].map((card) => (
            <div key={card.label} className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/20">
              <p className="text-sm text-slate-400">{card.label}</p>
              {loading ? (
                <div className="shimmer mt-3 h-9 w-20 rounded-xl bg-slate-800" />
              ) : (
                <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
              )}
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Submissions over time</h2>
            <p className="mt-2 text-sm text-slate-400">Last 14 days of submissions.</p>
            <div className="mt-6">
              {loading ? (
                <div className="shimmer h-72 rounded-xl bg-slate-800" />
              ) : submissionTimeline.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={submissionTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "12px",
                      }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="submissions"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ fill: "#0ea5e9", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-400">No submission data yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Score distribution</h2>
            <p className="mt-2 text-sm text-slate-400">Histogram of applicant scores.</p>
            <div className="mt-6">
              {loading ? (
                <div className="shimmer h-72 rounded-xl bg-slate-800" />
              ) : scoreDistribution.some((item) => item.count > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="range" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "12px",
                      }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-400">No scoring data yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Status overview</h2>
            <p className="mt-2 text-sm text-slate-400">A quick visual breakdown of the current application pipeline.</p>
            <div className="mt-6 space-y-4">
              {[
                { label: "Pending", value: summary.pending, color: "bg-amber-400" },
                { label: "Accepted", value: summary.accepted, color: "bg-emerald-400" },
                { label: "Rejected", value: summary.rejected, color: "bg-red-400" },
                { label: "Archived", value: summary.archived, color: "bg-slate-400" },
              ].map((item) => {
                const width = summary.total ? `${(item.value / summary.total) * 100}%` : "0%";
                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-full ${item.color}`} style={{ width }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Education distribution</h2>
            <p className="mt-2 text-sm text-slate-400">See where most applications are coming from.</p>
            <div className="mt-6 space-y-4">
              {Object.keys(summary.byEducation || {}).length > 0 ? (
                Object.entries(summary.byEducation).map(([key, value]) => {
                  const width = `${(value / maxEducationCount(summary)) * 100}%`;
                  return (
                    <div key={key}>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                        <span>{key}</span>
                        <span>{value}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full bg-sky-400" style={{ width }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400">No education data yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-1">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Status trends over time</h2>
            <p className="mt-2 text-sm text-slate-400">How statuses have changed over the last 14 days.</p>
            <div className="mt-6">
              {loading ? (
                <div className="shimmer h-72 rounded-xl bg-slate-800" />
              ) : statusTimeline.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={statusTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "12px",
                      }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      dot={{ fill: "#fbbf24", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="accepted"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rejected"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: "#ef4444", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="archived"
                      stroke="#6b7280"
                      strokeWidth={2}
                      dot={{ fill: "#6b7280", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-400">No status data yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
            <div className="mb-5 flex flex-col gap-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-xl font-semibold text-white">Applications</h2>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleExport("csv")} className="btn-secondary !min-h-10 !px-4 !py-2 !text-xs">
                    Export CSV
                  </button>
                  <button onClick={() => handleExport("excel")} className="btn-secondary !min-h-10 !px-4 !py-2 !text-xs">
                    Export Excel
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or program"
                  className="field-control !mt-0 !rounded-full !py-2.5"
                />

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="field-control !mt-0 !rounded-full !py-2.5"
                >
                  <option value="active">Active only</option>
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="field-control !mt-0 !rounded-full !py-2.5"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="status">Sort by status</option>
                  <option value="score-high">Highest score</option>
                  <option value="score-low">Lowest score</option>
                </select>

                <button onClick={toggleSelectAllVisible} className="btn-secondary !min-h-10 !px-4 !py-2 !text-xs">
                  {rankedApplications.length > 0 && rankedApplications.every((application) => selectedIds.includes(application._id))
                    ? "Clear visible selection"
                    : "Select visible"}
                </button>
              </div>
            </div>

            <div className="mb-5 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Bulk actions</p>
                  <p className="text-xs text-slate-400">{selectedIds.length} applicant{selectedIds.length === 1 ? "" : "s"} selected</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => runBulkStatusUpdate("accepted")} className="btn-primary !min-h-10 !bg-emerald-500 !px-3 !py-2 !text-xs hover:!bg-emerald-400">
                    Accept selected
                  </button>
                  <button onClick={() => runBulkStatusUpdate("rejected")} className="btn-danger !min-h-10 !bg-red-500 !px-3 !py-2 !text-xs !text-white hover:!bg-red-400">
                    Reject selected
                  </button>
                  <button onClick={() => runBulkStatusUpdate("pending")} className="btn-secondary !min-h-10 !px-3 !py-2 !text-xs">
                    Mark pending
                  </button>
                  <button onClick={() => runBulkStatusUpdate("archived")} className="btn-secondary !min-h-10 !border-slate-500/30 !bg-slate-500/10 !px-3 !py-2 !text-xs !text-slate-200">
                    Archive selected
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="shimmer rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                      <div className="h-5 w-40 rounded-lg bg-slate-800" />
                      <div className="mt-3 h-4 w-56 rounded-lg bg-slate-800" />
                      <div className="mt-3 h-4 w-full rounded-lg bg-slate-800" />
                      <div className="mt-2 h-4 w-4/5 rounded-lg bg-slate-800" />
                    </div>
                  ))}
                </div>
              ) : rankedApplications.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300">
                  No applications found for the current filter.
                </div>
              ) : (
                rankedApplications.map((application) => {
                  const docs = getDocumentEntries(application.documents);
                  const isSelected = selectedIds.includes(application._id);
                  return (
                    <div
                      key={application._id}
                      className={`rounded-[1.5rem] border p-5 ${
                        isSelected ? "border-sky-400/50 bg-slate-900/95" : "border-white/10 bg-slate-950/70"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs text-slate-200">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelection(application._id)}
                                className="h-4 w-4 rounded border-white/20 bg-slate-950"
                              />
                              Select
                            </label>
                            <h3 className="text-lg font-semibold text-white">{application.name || "Unnamed applicant"}</h3>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[application.status] || statusStyles.pending}`}>
                              {application.status || "pending"}
                            </span>
                            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
                              Rank #{application.rank || "—"}
                            </span>
                            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
                              Score {application.score}/100
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">{application.email || "No email"}</p>
                          <p className="text-sm text-slate-400">
                            {application.education || "Education not set"} • {application.program || "Program not set"}
                          </p>
                          <p className="text-sm leading-7 text-slate-300">{application.goals || "No goals submitted."}</p>
                          <p className="text-xs text-slate-500">Submitted {formatDateTime(application.createdAt)}</p>
                          {application.reviewed && <p className="text-xs font-medium text-emerald-300">Reviewed by admin</p>}
                          {application.archivedAt && <p className="text-xs text-slate-400">Archived on {formatDateTime(application.archivedAt)}</p>}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {application.status === "archived" ? (
                            <button
                              onClick={() => restoreApplication(application._id)}
                              className="btn-secondary !min-h-10 !px-4 !py-2 !text-xs"
                            >
                              Restore
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => updateStatus(application._id, "accepted")}
                                className="btn-primary !min-h-10 !bg-emerald-500 !px-4 !py-2 !text-xs hover:!bg-emerald-400"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateStatus(application._id, "rejected")}
                                className="btn-danger !min-h-10 !bg-red-500 !px-4 !py-2 !text-xs !text-white hover:!bg-red-400"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => updateStatus(application._id, "pending")}
                                className="btn-secondary !min-h-10 !px-4 !py-2 !text-xs"
                              >
                                Mark pending
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openDetails(application)}
                            className="btn-secondary !min-h-10 !border-sky-500/30 !bg-sky-500/10 !px-4 !py-2 !text-xs !text-sky-200 hover:!bg-sky-500/20"
                          >
                            View details
                          </button>
                          {application.status !== "archived" && (
                            <button
                              onClick={() => archiveApplication(application._id)}
                              className="btn-secondary !min-h-10 !border-slate-500/30 !bg-slate-500/10 !px-4 !py-2 !text-xs !text-slate-200"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">Supporting documents</p>
                          <span className="text-xs text-slate-400">{docs.length} file{docs.length === 1 ? "" : "s"}</span>
                        </div>
                        <DocumentActions documents={application.documents} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
              <h2 className="text-xl font-semibold text-white">Top ranked applicants</h2>
              <div className="mt-4 space-y-3">
                {(summary.topRanked || []).length > 0 ? (
                  summary.topRanked.map((item, index) => (
                    <div key={item._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
                      <div>
                        <p className="font-medium text-white">#{index + 1} {item.name || "Unnamed applicant"}</p>
                        <p className="text-xs text-slate-400">{item.program || "Program not set"}</p>
                      </div>
                      <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
                        {getScoreValue(item.score)}/100
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No scoring data yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/20">
              <h2 className="text-xl font-semibold text-white">Recent activity</h2>
              <div className="mt-4 space-y-3">
                {(summary.recent || []).length > 0 ? (
                  summary.recent.map((item) => (
                    <div key={item._id} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                      <p className="text-sm font-medium text-white">{item.name || "Unnamed applicant"}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.email || "No email"}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No recent applications yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-slate-950/40">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Application details</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{selectedApplication.name || "Unnamed applicant"}</h2>
                <p className="mt-1 text-sm text-slate-400">{selectedApplication.email || "No email provided"}</p>
              </div>
              <button onClick={() => setSelectedApplication(null)} className="btn-secondary !min-h-10 !px-4 !py-2">
                Close
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
                <p><span className="text-slate-400">Education:</span> {selectedApplication.education || "—"}</p>
                <p className="mt-2"><span className="text-slate-400">Program:</span> {selectedApplication.program || "—"}</p>
                <p className="mt-2"><span className="text-slate-400">Status:</span> {selectedApplication.status || "pending"}</p>
                <p className="mt-2"><span className="text-slate-400">Rank:</span> #{rankedApplications.find((item) => item._id === selectedApplication._id)?.rank || "—"}</p>
                <p className="mt-2"><span className="text-slate-400">Score:</span> {getScoreValue(scoreDraft)}/100</p>
                <p className="mt-2"><span className="text-slate-400">Reviewed:</span> {selectedApplication.reviewed ? "Yes" : "No"}</p>
                <p className="mt-2"><span className="text-slate-400">Submitted:</span> {formatDateTime(selectedApplication.createdAt)}</p>
                <p className="mt-2"><span className="text-slate-400">Last reviewed:</span> {selectedApplication.lastReviewedAt ? formatDateTime(selectedApplication.lastReviewedAt) : "Not yet reviewed"}</p>
                {selectedApplication.archivedAt && <p className="mt-2"><span className="text-slate-400">Archived:</span> {formatDateTime(selectedApplication.archivedAt)}</p>}
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-sm font-semibold text-white">Uploaded documents</p>
                <p className="mt-2 text-xs text-slate-400">Admins can open each file in a new tab or download it directly.</p>
                <DocumentActions documents={selectedApplication.documents} />
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-white">Goals and motivation</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{selectedApplication.goals || "No goals submitted."}</p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <label className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={reviewedDraft}
                    onChange={(e) => setReviewedDraft(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-slate-900"
                  />
                  Mark reviewed by admin
                </label>

                <label className="block text-sm font-medium text-slate-100">
                  Applicant score (0–100)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scoreDraft}
                    onChange={(e) => setScoreDraft(e.target.value)}
                    className="field-control !mt-2"
                    placeholder="Add a score"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-100">
                  Internal review note
                  <textarea
                    value={reviewNoteDraft}
                    onChange={(e) => setReviewNoteDraft(e.target.value)}
                    rows={5}
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
                    placeholder="Leave internal review comments here"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-100">
                Decision reason
                <textarea
                  value={decisionReasonDraft}
                  onChange={(e) => setDecisionReasonDraft(e.target.value)}
                  rows={8}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
                  placeholder="Explain why this applicant was accepted, rejected, archived, or held as pending"
                />
              </label>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-white">Timestamp history</p>
              <div className="mt-3 space-y-3">
                {(selectedApplication.history || []).length > 0 ? (
                  [...selectedApplication.history].reverse().map((item, index) => (
                    <div key={`${item.action}-${index}`} className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-white">{item.action}</span>
                        <span className="text-xs text-slate-400">{item.at ? new Date(item.at).toLocaleString() : "Recently"}</span>
                      </div>
                      {item.status && <p className="mt-1 text-xs uppercase tracking-wide text-sky-300">{item.status}</p>}
                      {item.note && <p className="mt-2 text-sm text-slate-300">{item.note}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No review history yet.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={saveReviewDetails} className="btn-primary">
                Save review details
              </button>
              <button
                onClick={() => updateStatus(selectedApplication._id, "accepted")}
                className="btn-primary !bg-emerald-500 hover:!bg-emerald-400"
              >
                Accept applicant
              </button>
              <button
                onClick={() => updateStatus(selectedApplication._id, "rejected")}
                className="btn-danger !bg-red-500 !text-white hover:!bg-red-400"
              >
                Reject applicant
              </button>
              {selectedApplication.status === "archived" ? (
                <button onClick={() => restoreApplication(selectedApplication._id)} className="btn-secondary">
                  Restore applicant
                </button>
              ) : (
                <button onClick={() => archiveApplication(selectedApplication._id)} className="btn-secondary !border-slate-500/30 !bg-slate-500/10 !text-slate-200">
                  Archive applicant
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
