"use client";
import { useRouter } from "next/router";
import {
  FaHome,
  FaUserTie,
  FaUsers,
  FaClipboardList,
  FaCogs,
  FaSignOutAlt,
  FaBars,
  FaQuestionCircle,
  FaChartLine,
  FaSearchPlus,
  FaUserCircle,
} from "react-icons/fa";
import { useEffect, useState } from "react";

const Sidebar = ({ sidebarCollapsed, toggleSidebar, handleLogout }) => {
  const router = useRouter();
  const [role, setRole] = useState(null);

  // ✅ Detect user role automatically from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole || "candidate");
  }, []);

  if (!role) return null; // wait until role is loaded

  // ✅ Sidebar items based on detected role
  const sidebarItems =
    role === "interviewer"
      ? [
          { id: 1, name: "Dashboard", path: "/dashboard/interviewer", icon: <FaHome /> },
          { id: 2, name: "Report", path: "/dashboard/report", icon: <FaChartLine /> },
          { id: 3, name: "Plagiarism Detection", path: "/dashboard/plagiarism", icon: <FaSearchPlus /> },
          { id: 4, name: "Profile", path: "/dashboard/profile", icon: <FaUserCircle /> },
          { id: 5, name: "Settings", path: "/dashboard/settings", icon: <FaCogs /> },
        ]
      : [
          { id: 1, name: "Home", path: "/dashboard/candidate", icon: <FaHome /> },
          { id: 2, name: "My Profile", path: "/dashboard/profile", icon: <FaUserTie /> },
          { id: 3, name: "Quizzes", path: "/dashboard/quizzes", icon: <FaClipboardList /> },
          { id: 4, name: "Help", path: "/dashboard/help", icon: <FaQuestionCircle /> },
          { id: 5, name: "Settings", path: "/dashboard/settings", icon: <FaCogs /> },
        ];

  return (
    <div
      className={`${
        sidebarCollapsed ? "w-20" : "w-72"
      } bg-white/90 backdrop-blur-md border-r border-gray-300 transition-all duration-300 min-h-screen fixed left-0 top-16 z-40 shadow-lg`}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Toggle Sidebar */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 text-gray-800 hover:bg-gray-200 rounded-lg transition-colors mb-4"
        >
          <FaBars
            className={`text-2xl transition-transform ${
              sidebarCollapsed ? "rotate-90" : ""
            }`}
          />
        </button>

        {/* Navigation Items */}
        <nav className="space-y-2 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center ${
                sidebarCollapsed ? "justify-center px-2" : "px-4"
              } py-3 text-gray-800 hover:bg-gray-200 rounded-lg transition-all duration-300 ${
                router.pathname === item.path
                  ? "bg-gray-100 shadow-md border-l-4 border-blue-500"
                  : ""
              }`}
            >
              <span className={`text-xl ${sidebarCollapsed ? "" : "mr-3 w-6 text-lg"}`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center px-2" : "px-4"
            } py-3 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-300`}
          >
            <FaSignOutAlt className={`text-xl ${sidebarCollapsed ? "" : "mr-3 w-6"}`} />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
