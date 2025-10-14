// pages/dashboard/interviewer.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import withAuth from "../../lib/withAuth";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

function InterviewerDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [scheduleDates, setScheduleDates] = useState({}); // key: candidateIndex -> Date object
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [savingIdx, setSavingIdx] = useState(null); // to disable per-candidate save button
  const router = useRouter();

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState === "true") setSidebarCollapsed(true);
    fetchScheduledInterviews();
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", newState.toString());
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // fetch candidates
  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const res = await fetch("/api/get-candidates");
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates || []);
        setShowCandidatesModal(true);
      } else {
        alert("Error: " + (data.error || "Failed to load candidates"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error fetching candidates");
    } finally {
      setLoadingCandidates(false);
    }
  };

  // fetch scheduled interviews
  const fetchScheduledInterviews = async () => {
    setLoadingScheduled(true);
    try {
      const res = await fetch("/api/get-scheduled-interviews");
      const data = await res.json();
      if (data.success) setScheduledInterviews(data.interviews || []);
      else alert("Error loading scheduled interviews: " + data.error);
    } catch (err) {
      console.error(err);
      alert("Failed to load scheduled interviews.");
    } finally {
      setLoadingScheduled(false);
    }
  };

  // schedule interview for candidate at index
  const saveInterview = async (candidate, index) => {
    const dt = scheduleDates[index];
    if (!dt) return alert("Select date & time first");
    setSavingIdx(index);
    try {
      const res = await fetch("/api/schedule-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: candidate.id,
          scheduledAt: new Date(dt).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Interview scheduled for ${candidate.full_name || candidate.email}`);
        // refresh scheduled interviews
        await fetchScheduledInterviews();
        // optionally close modal for that candidate
      } else {
        alert("Failed to schedule: " + (data.error || "unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Error scheduling interview");
    } finally {
      setSavingIdx(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black pt-16">
      <Navbar />
      <div className="flex">
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />

        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-72"} p-6`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Interviewer Dashboard</h1>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchCandidates} className="px-4 py-2 bg-blue-600 text-white rounded">
                {loadingCandidates ? "Loading..." : "Show Candidates"}
              </button>
              <button onClick={fetchScheduledInterviews} className="px-4 py-2 bg-gray-200 rounded">
                Refresh Schedule
              </button>
              <button onClick={() => {
                const roomId = Math.random().toString(36).slice(2, 12);
                router.push(`/meeting/${roomId}`);
              }} className="px-4 py-2 bg-green-600 text-white rounded">
                Create Meeting
              </button>
            </div>
          </div>

          {/* Scheduled Interviews list */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Scheduled Interviews</h2>
            {loadingScheduled ? (
              <p>Loading scheduled interviews...</p>
            ) : scheduledInterviews.length === 0 ? (
              <p>No scheduled interviews.</p>
            ) : (
              <div className="bg-gray-50 p-4 rounded">
                <table className="min-w-full text-left">
                  <thead>
                    <tr>
                      <th className="p-2">Candidate</th>
                      <th className="p-2">Scheduled At</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduledInterviews.map((it) => (
                      <tr key={it.id} className="border-t">
                        <td className="p-2">{it.fullName || it.email}</td>
                        <td className="p-2">{it.scheduledAt ? new Date(it.scheduledAt).toLocaleString() : "-"}</td>
                        <td className="p-2">{it.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Candidates Modal */}
      {showCandidatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Candidates</h3>
              <button onClick={() => setShowCandidatesModal(false)} className="text-gray-600">Close</button>
            </div>

            {candidates.length === 0 ? (
              <p>No candidates found.</p>
            ) : (
              <div className="grid gap-4">
                {candidates.map((c, idx) => (
                  <div key={c.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <div className="font-semibold">{c.full_name || c.email}</div>
                      <div className="text-sm text-gray-600">{c.email} • {c.phone}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="datetime-local"
                        value={scheduleDates[idx] ? new Date(scheduleDates[idx]).toISOString().slice(0,16) : ""}
                        onChange={(e) => setScheduleDates(prev => ({ ...prev, [idx]: e.target.value }))}
                        className="border p-2 rounded"
                      />
                      <button
                        onClick={() => saveInterview(c, idx)}
                        disabled={savingIdx === idx}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        {savingIdx === idx ? "Saving..." : "Schedule"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(InterviewerDashboard, "interviewer");
