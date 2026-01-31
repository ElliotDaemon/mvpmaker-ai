"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  Settings,
  ChevronLeft,
  Plus,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-provider";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "archived";
  updatedAt: string;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Project Alpha",
    description: "E-commerce platform with AI-powered recommendations and real-time inventory management",
    status: "active",
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    name: "Task Beta",
    description: "Project management tool with Kanban boards and team collaboration features",
    status: "active",
    updatedAt: "5 hours ago",
  },
  {
    id: "3",
    name: "Team Gamma",
    description: "Internal communication platform with video conferencing and file sharing",
    status: "completed",
    updatedAt: "1 day ago",
  },
  {
    id: "4",
    name: "Project Beta",
    description: "Customer support ticketing system with AI chatbot integration",
    status: "active",
    updatedAt: "2 days ago",
  },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: FolderKanban, label: "Projects", id: "projects" },
  { icon: ListTodo, label: "Tasks", id: "tasks" },
  { icon: Users, label: "Team", id: "team" },
  { icon: Settings, label: "Settings", id: "settings" },
];

const filters = ["All", "Active", "Completed", "Archived"];

export default function Home() {
  const [activeNav, setActiveNav] = useState("projects");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState<string | null>("1");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const filteredProjects = mockProjects.filter((p) => {
    if (activeFilter === "All") return true;
    return p.status === activeFilter.toLowerCase();
  });

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside
        className={`sidebar h-full flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-sm">MVPMAKER</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="btn-ghost p-2 rounded-lg"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform ${
                sidebarCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`nav-item w-full ${activeNav === item.id ? "active" : ""}`}
            >
              <item.icon className="icon flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Theme Switcher */}
        <div className="p-4 border-t border-[var(--border)]">
          {!sidebarCollapsed && (
            <div className="mb-3">
              <span className="text-xs text-secondary">Theme</span>
            </div>
          )}
          <ThemeSwitcher />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden">
        <div className="h-full flex gap-6">
          {/* Projects List Panel */}
          <div className="glass-panel w-[420px] flex-shrink-0 flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Projects</h1>
                <button className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  New
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="input pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 mt-4">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`badge cursor-pointer transition-all ${
                      activeFilter === filter ? "badge-accent" : ""
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Project List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 stagger-children">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`floating-card p-4 cursor-pointer ${
                    selectedProject === project.id ? "active" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{project.name}</h3>
                    <button className="btn-ghost p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-secondary line-clamp-2 mb-3">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-tertiary">{project.updatedAt}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        project.status === "active"
                          ? "bg-green-500/10 text-green-400"
                          : project.status === "completed"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-zinc-500/10 text-zinc-400"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="glass-panel flex-1 flex flex-col animate-fadeIn" style={{ animationDelay: "0.1s" }}>
            {selectedProject ? (
              <>
                {/* Detail Header */}
                <div className="p-5 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">
                        {mockProjects.find((p) => p.id === selectedProject)?.name}
                      </h2>
                      <p className="text-sm text-secondary">
                        {mockProjects.find((p) => p.id === selectedProject)?.description}
                      </p>
                    </div>
                    <button className="btn btn-secondary">
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </button>
                  </div>
                </div>

                {/* Detail Content */}
                <div className="flex-1 p-5 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Quick Actions */}
                    <div className="floating-card p-4">
                      <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                      <div className="space-y-2">
                        <button className="btn btn-ghost w-full justify-start text-sm">
                          <Sparkles className="w-4 h-4" />
                          Generate with AI
                        </button>
                        <button className="btn btn-ghost w-full justify-start text-sm">
                          <FolderKanban className="w-4 h-4" />
                          View Files
                        </button>
                        <button className="btn btn-ghost w-full justify-start text-sm">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="floating-card p-4">
                      <h3 className="text-sm font-medium mb-3">Statistics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary">Files</span>
                          <span className="text-sm font-medium">24</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary">Lines of Code</span>
                          <span className="text-sm font-medium">3,421</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary">AI Generations</span>
                          <span className="text-sm font-medium">12</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="floating-card p-4 col-span-2">
                      <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
                      <div className="space-y-3">
                        {[
                          { action: "Generated landing page", time: "2 hours ago" },
                          { action: "Updated API routes", time: "5 hours ago" },
                          { action: "Added authentication", time: "1 day ago" },
                        ].map((activity, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                            <span className="text-sm">{activity.action}</span>
                            <span className="text-xs text-tertiary">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] flex items-center justify-center mx-auto mb-4">
                    <FolderKanban className="w-8 h-8 text-tertiary" />
                  </div>
                  <p className="text-secondary">Select a project to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
