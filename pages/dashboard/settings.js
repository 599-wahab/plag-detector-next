import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import withAuth from "../../lib/withAuth";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const SettingsPage = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: "English",
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const savedSidebar = localStorage.getItem("sidebarCollapsed");
    if (savedSidebar === "true") setSidebarCollapsed(true);

    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", newState.toString());
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");

    // simulate API call
    setTimeout(() => {
      localStorage.setItem("userSettings", JSON.stringify(settings));
      setSuccessMsg("Settings saved successfully!");
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <Navbar />
      <div className="flex">
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={handleToggleSidebar}
          handleLogout={handleLogout}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-72"
          } p-6`}
        >
          <h1 className="text-3xl font-bold mb-6 text-black">Settings</h1>
          <div className="bg-gray-100 rounded-xl p-6 border border-gray-300 max-w-3xl">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleChange("notifications", e.target.checked)}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Dark Mode</span>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => handleChange("darkMode", e.target.checked)}
                />
              </div>

              <div>
                <label className="text-lg font-medium block mb-2">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full"
                >
                  <option>English</option>
                  <option>Urdu</option>
                  <option>Arabic</option>
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>

              {successMsg && (
                <p className="text-green-600 font-medium mt-2">{successMsg}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SettingsPage);
