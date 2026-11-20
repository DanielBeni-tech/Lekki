import { spaceWording } from "@/lib/spaces";
import React, { useEffect, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { NavView } from "@/types/lekki";
import {
  Home,
  FolderLock,
  Star,
  Share2,
  Trash2,
  Files,
  BookOpen,
  Settings2,
  X,
  ChevronsUpDown,
  Building2,
  GraduationCap,
  Cpu,
  Folder,
  Users,
  BookMarked,
  LayoutGrid,
  Check,
  ChevronDown,
  LogOut,
  Plus,
} from "lucide-react";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenWorkspaceSettings?: () => void;
  onOpenRevision?: () => void;
  counts?: {
    myDocs?: number;
    starred?: number;
    sharedWithMe?: number;
    trash?: number;
    workspaceFiles?: number;
    workspaceWiki?: number;
  };
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  currentView,
  onSelectView,
  onOpenWorkspaceSettings,
  onOpenRevision,
  counts = {},
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const { activeWorkspace, workspaces, setActiveWorkspace, loading, error, refresh } = useWorkspace();
  const { user, logout } = useAuth();
  const [wsSwitcherOpen, setWsSwitcherOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);

  const getWorkspaceIcon = (iconName?: string) => {
    switch (iconName) {
      case "GraduationCap": return <GraduationCap className="h-4 w-4" />;
      case "Building2":     return <Building2 className="h-4 w-4" />;
      case "Cpu":           return <Cpu className="h-4 w-4" />;
      case "Users":         return <Users className="h-4 w-4" />;
      case "BookMarked":    return <BookMarked className="h-4 w-4" />;
      default:              return <Folder className="h-4 w-4" />;
    }
  };

  // Entrée de navigation : l'état actif se lit à la teinte sauge et au fond très légèrement teinté.
  const navItemClass = (isActive: boolean) =>
    `w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group select-none ${
      isActive
        ? "bg-emerald-400/[0.10] text-emerald-100 ring-1 ring-inset ring-emerald-400/20"
        : "text-muted hover:text-heading hover:bg-[#F8F7F2] border border-transparent"
    }`;

  const navIconClass = (isActive: boolean) =>
    isActive ? "text-emerald-300" : "text-subtle group-hover:text-body";

  // Échap ferme le menu du téléphone (clavier Bluetooth, tablette).
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMobileClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onMobileClose]);

  const handleSelect = (view: NavView) => {
    onSelectView(view);
    onMobileClose?.();
  };

  const handleSwitchWs = (wsId: string) => {
    setActiveWorkspace(wsId);
    setWsSwitcherOpen(false);
  };

  /* ── Modal centré pour switcher l’espace ── */
  const WorkspaceSwitcherModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => setWsSwitcherOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm rounded-2xl bg-[#FFFFFF] border border-[#E7E4D9] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E4D9]">
          <span className="eyebrow text-subtle">
            Changer d’espace
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setWsSwitcherOpen(false);
                setCreateWorkspaceOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-400/10 transition-colors"
              aria-label="Créer un espace"
            >
              <Plus className="h-4 w-4" />
              <span>Rejoindre / créer</span>
            </button>
            <button
              onClick={() => setWsSwitcherOpen(false)}
              className="p-1.5 rounded-lg text-subtle hover:text-strong hover:bg-[#F8F7F2] transition-colors"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="py-2 max-h-72 overflow-y-auto">
          {loading && (
            <p className="px-5 py-6 text-center text-sm text-subtle">Chargement des espaces...</p>
          )}
          {!loading && error && (
            <div className="px-5 py-6 text-center space-y-2">
              <p className="text-sm text-amber-700">{error}</p>
              <button onClick={() => void refresh()} className="text-xs text-emerald-300 hover:text-emerald-200">
                Réessayer
              </button>
            </div>
          )}
          {!loading && !error && workspaces.length === 0 && (
            <div className="px-5 py-7 text-center">
              <p className="text-sm font-medium text-strong">Aucun espace disponible</p>
              <p className="mt-1 text-xs text-subtle">Rejoins un espace avec son code ou crée-en un.</p>
              <button
                onClick={() => {
                  setWsSwitcherOpen(false);
                  setCreateWorkspaceOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-3 py-2 text-xs font-semibold text-[#FBFAF6] hover:bg-emerald-300 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Rejoindre ou créer
              </button>
            </div>
          )}
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspace?.id;
            return (
              <button
                key={ws.id}
                onClick={() => handleSwitchWs(ws.id)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  isActive
                    ? "bg-emerald-400/10 text-emerald-200"
                    : "text-body hover:bg-[#F8F7F2] hover:text-heading"
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isActive
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-[#F8F7F2] text-muted"
                }`}>
                  {getWorkspaceIcon(ws.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{ws.name}</div>
                  {ws.description && (
                    <div className="text-[11px] text-subtle truncate">{ws.description}</div>
                  )}
                </div>
                {isActive && <Check className="h-4 w-4 text-emerald-300 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ── Contenu de la sidebar ── */
  const sidebarContent = (
    <div className="p-3 space-y-6">
      {/* Accueil */}
      <button
        id="sidebar-nav-home"
        onClick={() => handleSelect("home")}
        className={navItemClass(currentView === "home")}
      >
        <div className="flex items-center gap-3">
          <Home className={`h-4 w-4 ${navIconClass(currentView === "home")}`} />
          <span>Accueil</span>
        </div>
      </button>

      {/* ESPACE — aucun espace fictif : créer/rejoindre avant d’afficher le Drive partagé et le Wiki */}
      <div className="space-y-1">
        {activeWorkspace ? (
          <>
            <button
              id="sidebar-workspace-switcher"
              onClick={() => setWsSwitcherOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#E7E4D9] hover:border-emerald-400/30 bg-[#F8F7F2] hover:bg-emerald-400/[0.05] text-sm transition-all group mb-1.5"
              title="Changer d’espace"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-emerald-300 bg-emerald-400/10 ring-1 ring-inset ring-emerald-400/20">
                {getWorkspaceIcon(activeWorkspace.icon)}
              </div>
              <span className="flex-1 text-left truncate font-semibold text-strong text-sm">
                {activeWorkspace.name}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 text-faint group-hover:text-emerald-300 transition-colors shrink-0" />
            </button>

            {spaceWording(activeWorkspace).kind === "promo" && (
            <button
              id="sidebar-nav-subjects"
              onClick={() => handleSelect("subjects")}
              className={navItemClass(currentView === "subjects" || currentView === "subject")}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className={`h-4 w-4 ${navIconClass(currentView === "subjects" || currentView === "subject")}`} />
                <span>Matières</span>
              </div>
            </button>
            )}

            <button id="sidebar-nav-workspace-files" onClick={() => handleSelect("workspace_files")} className={navItemClass(currentView === "workspace_files")}>
              <div className="flex items-center gap-3">
                <Files className={`h-4 w-4 ${navIconClass(currentView === "workspace_files")}`} />
                <span>Documents</span>
              </div>
              {counts.workspaceFiles !== undefined && <span className="text-[11px] tabular-nums text-faint">{counts.workspaceFiles}</span>}
            </button>

            <button id="sidebar-nav-workspace-wiki" onClick={() => handleSelect("workspace_wiki")} className={navItemClass(currentView === "workspace_wiki")}>
              <div className="flex items-center gap-3">
                <BookOpen className={`h-4 w-4 ${navIconClass(currentView === "workspace_wiki")}`} />
                <span>{spaceWording(activeWorkspace).wiki}</span>
              </div>
              {counts.workspaceWiki !== undefined && <span className="text-[11px] tabular-nums text-faint">{counts.workspaceWiki}</span>}
            </button>

            {onOpenRevision && spaceWording(activeWorkspace).study && (
              <button
                id="sidebar-nav-revision"
                onClick={() => { onOpenRevision(); onMobileClose?.(); }}
                className={navItemClass(false)}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className={`h-4 w-4 ${navIconClass(false)}`} />
                  <span>Réviser</span>
                </div>
                <span className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Nouveau</span>
              </button>
            )}

            {(activeWorkspace.role === "admin" || activeWorkspace.role === "owner") && onOpenWorkspaceSettings && (
              <button
                onClick={() => { onOpenWorkspaceSettings(); onMobileClose?.(); }}
                className={navItemClass(false)}
              >
                <div className="flex items-center gap-3">
                  <Settings2 className={`h-4 w-4 ${navIconClass(false)}`} />
                  <span>Administration</span>
                </div>
              </button>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-[#E7E4D9] bg-[#F8F7F2] p-3.5">
            <div className="text-sm font-medium text-strong">Aucun espace rejoint</div>
            <p className="mt-1 text-xs leading-relaxed text-subtle">
              Rejoins l’espace de ta promo avec son code, ou crée-le.
            </p>
            <button
              type="button"
              onClick={() => setCreateWorkspaceOpen(true)}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-3 py-2 text-xs font-semibold text-[#FBFAF6] hover:bg-emerald-300 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Rejoindre ou créer
            </button>
          </div>
        )}
      </div>

      {/* PERSONNEL : après l’espace de la promo, qui est le cœur de l’app */}
      <div className="space-y-1">
        <div className="px-3 mb-1.5 eyebrow text-faint">
          Personnel
        </div>

        <button id="sidebar-nav-my-docs" onClick={() => handleSelect("my_docs")} className={navItemClass(currentView === "my_docs")}>
          <div className="flex items-center gap-3">
            <FolderLock className={`h-4 w-4 ${navIconClass(currentView === "my_docs")}`} />
            <span>Mes documents</span>
          </div>
          {counts.myDocs !== undefined && <span className="text-[11px] tabular-nums text-faint">{counts.myDocs}</span>}
        </button>

        <button id="sidebar-nav-starred" onClick={() => handleSelect("starred")} className={navItemClass(currentView === "starred")}>
          <div className="flex items-center gap-3">
            <Star className={`h-4 w-4 ${navIconClass(currentView === "starred")}`} />
            <span>Favoris</span>
          </div>
          {counts.starred !== undefined && <span className="text-[11px] tabular-nums text-faint">{counts.starred}</span>}
        </button>

        <button id="sidebar-nav-shared" onClick={() => handleSelect("shared_with_me")} className={navItemClass(currentView === "shared_with_me")}>
          <div className="flex items-center gap-3">
            <Share2 className={`h-4 w-4 ${navIconClass(currentView === "shared_with_me")}`} />
            <span>Partagés avec moi</span>
          </div>
          {counts.sharedWithMe !== undefined && <span className="text-[11px] tabular-nums text-faint">{counts.sharedWithMe}</span>}
        </button>

        <button id="sidebar-nav-trash" onClick={() => handleSelect("trash")} className={navItemClass(currentView === "trash")}>
          <div className="flex items-center gap-3">
            <Trash2 className={`h-4 w-4 ${navIconClass(currentView === "trash")}`} />
            <span>Corbeille</span>
          </div>
          {counts.trash !== undefined && <span className="text-[11px] tabular-nums text-faint">{counts.trash}</span>}
        </button>
      </div>
    </div>
  );

  const brand = (
    <div className="flex items-center gap-3 px-4 pb-4 pt-5">
      <img src="/logo.svg" alt="" className="h-9 w-9 rounded-xl ring-1 ring-emerald-400/15" />
      <div className="min-w-0">
        <span className="block font-display text-lg leading-none tracking-tight text-heading">Lekki</span>
        <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-faint">
          Mémoire de promo
        </span>
      </div>
    </div>
  );

  return (
    <>
      {wsSwitcherOpen && <WorkspaceSwitcherModal />}
      <CreateWorkspaceDialog open={createWorkspaceOpen} onOpenChange={setCreateWorkspaceOpen} />

      {/* ── Desktop sidebar ── */}
      <aside
        id="lekki-app-sidebar"
        className="hidden lg:flex w-64 bg-[#F8F7F4] border-r border-[#E7E4D9] flex-col shrink-0 select-none overflow-y-auto"
      >
        {brand}
        <div className="h-px mx-4 mb-1 bg-[#F8F7F2]" />
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside
            id="lekki-app-sidebar-mobile"
            className="relative z-50 h-dvh max-h-dvh w-72 max-w-[85vw] bg-[#F8F7F4] border-r border-[#E7E4D9] flex flex-col overflow-hidden animate-in slide-in-from-left duration-200"
          >
            <div className="flex items-center justify-between px-4 pb-3 pt-4 border-b border-[#E7E4D9]">
              <div className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="" className="h-7 w-7 rounded-lg" />
                <span className="font-display text-base tracking-tight text-heading">Lekki</span>
              </div>
              <button
                onClick={onMobileClose}
                className="p-1.5 rounded-lg text-subtle hover:text-strong hover:bg-[#F8F7F2] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {sidebarContent}
            </div>

            {/* Profil utilisateur toujours ancré en bas du menu mobile */}
            <div className="shrink-0 border-t border-[#E7E4D9] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              {mobileProfileOpen && (
                <>
                  <div
                    className="absolute inset-0 z-40 bg-black/30 backdrop-blur-sm"
                    onClick={() => setMobileProfileOpen(false)}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 z-50 mb-[calc(0.75rem+env(safe-area-inset-bottom))] mx-2 rounded-xl border border-[#E7E4D9] bg-[#FFFFFF]/95 backdrop-blur-md p-1 shadow-2xl animate-in fade-in slide-in-from-bottom-1 duration-100"
                  >
                    <button
                      onClick={() => {
                        logout();
                        onMobileClose?.();
                      }}
                      className="w-full px-3 py-2.5 text-left flex items-center gap-3 text-sm text-red-700 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={() => setMobileProfileOpen((open) => !open)}
                aria-expanded={mobileProfileOpen}
                aria-label="Ouvrir le menu du profil"
                className="w-full min-w-0 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#F8F7F2] transition-colors"
              >
                <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-emerald-600/60 to-[#8a6a34]/60 border border-emerald-400/25 text-heading flex items-center justify-center font-semibold text-sm">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-heading">
                    {user?.name || user?.username || "Mon compte"}
                  </div>
                  <div className="truncate text-xs text-subtle">{user?.email || "Profil et paramètres"}</div>
                </div>
                <ChevronDown className={`h-4 w-4 shrink-0 text-subtle transition-transform ${mobileProfileOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
