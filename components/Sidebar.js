"use client";
import { useRouter, usePathname } from "next/navigation";
import {
  FaHome,
  FaUser,
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
  FaVideo,
  FaCalendarAlt,
  FaHistory,
  FaShieldAlt,
  FaRobot,
} from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";

const Sidebar = ({ sidebarCollapsed, toggleSidebar, handleLogout }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // Detect user role and info automatically from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const userName = localStorage.getItem("name");
    const userEmail = localStorage.getItem("email");
    
    setRole(storedRole || "candidate");
    setUser({ name: userName, email: userEmail });
  }, []);

  if (!role) {
    return (
      <div className={`${sidebarCollapsed ? "w-20" : "w-72"} bg-white/90 backdrop-blur-md border-r border-gray-300 min-h-screen fixed left-0 top-16 z-40 shadow-lg flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Sidebar items based on detected role
  const sidebarItems =
    role === "interviewer"
      ? [
          { 
            id: 1, 
            name: "Dashboard", 
            path: "/dashboard/interviewer", 
            icon: <FaHome />,
            description: "Interview overview"
          },
          { 
            id: 2, 
            name: "Schedule Interview", 
            path: "/dashboard/schedule", 
            icon: <FaCalendarAlt />,
            description: "Create new interviews"
          },
          { 
            id: 3, 
            name: "AI Analysis", 
            path: "/dashboard/analysis", 
            icon: <FaRobot />,
            description: "Interview insights"
          },
          { 
            id: 4, 
            name: "Plagiarism Detection", 
            path: "/dashboard/plagiarism", 
            icon: <FaSearchPlus />,
            description: "AI-powered detection"
          },
          { 
            id: 5, 
            name: "Interview History", 
            path: "/dashboard/history", 
            icon: <FaHistory />,
            description: "Past interviews"
          },
          { 
            id: 6, 
            name: "Reports", 
            path: "/dashboard/reports", 
            icon: <FaChartLine />,
            description: "Detailed analytics"
          },
          { 
            id: 7, 
            name: "Profile", 
            path: "/dashboard/profile", 
            icon: <FaUserCircle />,
            description: "Account settings"
          },
        ]
      : [
          { 
            id: 1, 
            name: "Dashboard", 
            path: "/dashboard/candidate", 
            icon: <FaHome />,
            description: "Your overview"
          },
          { 
            id: 2, 
            name: "My Interviews", 
            path: "/dashboard/interviews", 
            icon: <FaVideo />,
            description: "Upcoming & past"
          },
          { 
            id: 3, 
            name: "Practice Sessions", 
            path: "/dashboard/practice", 
            icon: <FaClipboardList />,
            description: "Prepare for interviews"
          },
          { 
            id: 4, 
            name: "AI Feedback", 
            path: "/dashboard/feedback", 
            icon: <FaRobot />,
            description: "Performance insights"
          },
          { 
            id: 5, 
            name: "My Profile", 
            path: "/dashboard/profile", 
            icon: <FaUserTie />,
            description: "Personal information"
          },
          { 
            id: 6, 
            name: "Security", 
            path: "/dashboard/security", 
            icon: <FaShieldAlt />,
            description: "Account security"
          },
          { 
            id: 7, 
            name: "Help & Support", 
            path: "/dashboard/help", 
            icon: <FaQuestionCircle />,
            description: "Get assistance"
          },
        ];

  const isActive = (path) => pathname === path;

  return (
    <div
      className={`${
        sidebarCollapsed ? "w-20" : "w-72"
      } bg-white/95 backdrop-blur-lg border-r border-gray-200 transition-all duration-300 min-h-screen fixed left-0 top-16 z-40 shadow-xl`}
    >
      <div className="p-4 flex flex-col h-full">
        {/* User Info Section */}
        {!sidebarCollapsed && user && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <FaUser className="text-white text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user.email || ""}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {role}
              </span>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>
        )}

        {/* Collapsed User Info */}
        {sidebarCollapsed && user && (
          <div className="mb-6 flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <FaUser className="text-white text-lg" />
            </div>
          </div>
        )}

        {/* Toggle Sidebar */}
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center ${
            sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
          } py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300 mb-4 group`}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!sidebarCollapsed && (
            <span className="text-sm font-medium text-gray-600">Navigation</span>
          )}
          <FaBars
            className={`text-lg text-gray-500 transition-transform duration-300 group-hover:text-gray-700 ${
              sidebarCollapsed ? "rotate-0" : "rotate-90"
            }`}
          />
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1 flex-1">
          {sidebarItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center px-2" : "px-4"
                } py-3 text-left rounded-xl transition-all duration-300 group relative ${
                  active
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                }`}
                title={sidebarCollapsed ? item.name : ""}
              >
                <span
                  className={`text-lg transition-colors duration-300 ${
                    sidebarCollapsed ? "" : "mr-3 w-6"
                  } ${
                    active
                      ? "text-white"
                      : "text-gray-500 group-hover:text-blue-500"
                  }`}
                >
                  {item.icon}
                </span>
                
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm block truncate">
                      {item.name}
                    </span>
                    <span
                      className={`text-xs block truncate ${
                        active ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                )}

                {/* Active indicator */}
                {active && !sidebarCollapsed && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="pt-4 border-t border-gray-200 space-y-2">
          {/* Settings */}
          <button
            onClick={() => router.push("/dashboard/settings")}
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center px-2" : "px-4"
            } py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300 group`}
            title={sidebarCollapsed ? "Settings" : ""}
          >
            <FaCogs
              className={`text-lg ${
                sidebarCollapsed ? "" : "mr-3"
              } text-gray-500 group-hover:text-gray-700`}
            />
            {!sidebarCollapsed && (
              <span className="font-medium text-sm">Settings</span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              sidebarCollapsed ? "justify-center px-2" : "px-4"
            } py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group border border-red-200 hover:border-red-300`}
            title={sidebarCollapsed ? "Logout" : ""}
          >
            <FaSignOutAlt
              className={`text-lg ${
                sidebarCollapsed ? "" : "mr-3"
              } text-red-500 group-hover:text-red-600`}
            />
            {!sidebarCollapsed && (
              <span className="font-medium text-sm">Logout</span>
            )}
          </button>
        </div>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-center">
                
                <p className="text-gray-400 mb-4">
                  &copy; {new Date().getFullYear()} Skill Scanner. All rights reserved.
                </p>
                <div className="flex justify-center space-x-6 text-sm text-gray-400">
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;