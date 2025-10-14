import { useRouter } from 'next/router';

const Sidebar = ({ 
  sidebarCollapsed, 
  toggleSidebar, 
  handleLogout, 
  sidebarItems,
  userRole = 'candidate'
}) => {
  const router = useRouter();

  return (
    <div
      className={`${
        sidebarCollapsed ? 'w-20' : 'w-72'
      } bg-white/90 backdrop-blur-md border-r border-gray-300 transition-all duration-300 min-h-screen fixed left-0 top-16 z-40`}
    >
      <div className="p-4 flex flex-col h-full">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 text-black hover:bg-gray-200 rounded-lg transition-colors mb-4"
        >
          <i
            className={`fas fa-bars text-xl ${
              sidebarCollapsed ? 'rotate-90' : ''
            } transition-transform`}
          ></i>
        </button>

        <nav className="space-y-2 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center ${
                sidebarCollapsed ? 'justify-center px-2' : 'px-4'
              } py-3 text-black hover:bg-gray-200 rounded-lg transition-all duration-300 ${
                router.pathname === item.path ? 'bg-gray-100 shadow-lg' : ''
              }`}
            >
              <i
                className={`${item.icon} ${
                  sidebarCollapsed ? 'text-xl' : 'mr-3'
                } ${sidebarCollapsed ? '' : 'w-6'}`}
              ></i>
              {!sidebarCollapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              sidebarCollapsed ? 'justify-center px-2' : 'px-4'
            } py-3 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-300`}
          >
            <i
              className={`fas fa-sign-out-alt ${
                sidebarCollapsed ? 'text-xl' : 'mr-3'
              } ${sidebarCollapsed ? '' : 'w-6'}`}
            ></i>
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;