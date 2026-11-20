import React, { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Sparkles,
  ChevronDown,
  LogOut,
  X,
  Folder,
  GraduationCap,
  Building2,
  Cpu,
  Users,
  BookMarked,
} from "lucide-react";
import { UnifiedSearchDialog } from "./UnifiedSearchDialog";

interface HeaderProps {
  onSelectDocument: (docId: string) => void;
  onSelectWiki: (wikiId: string) => void;
  onAskAI: (query: string) => void;
  onToggleAI: () => void;
  isAIOpen: boolean;
  onOpenMobileMenu?: () => void;
}

export function Header({
  onSelectDocument,
  onSelectWiki,
  onAskAI,
  onToggleAI,
  isAIOpen,
}: HeaderProps) {
  const { activeWorkspace } = useWorkspace();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Le nom de l'espace reste affiché ici comme repère ; on en change depuis la sidebar.
  const getWorkspaceIcon = (iconName?: string) => {
    switch (iconName) {
      case "GraduationCap":
        return <GraduationCap className="h-4 w-4 text-emerald-400" />;
      case "Building2":
        return <Building2 className="h-4 w-4 text-sky-700" />;
      case "Cpu":
        return <Cpu className="h-4 w-4 text-amber-700" />;
      case "Users":
        return <Users className="h-4 w-4 text-violet-700" />;
      case "BookMarked":
        return <BookMarked className="h-4 w-4 text-sky-700" />;
      default:
        return <Folder className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <>
      {isSearchOpen && (
        <div className="fixed inset-0 z-[70] bg-[#F8F7F4] pt-[env(safe-area-inset-top)] sm:inset-auto sm:left-0 sm:top-0 sm:w-full sm:bg-[#F8F7F4]/98 sm:backdrop-blur-md sm:border-b sm:border-line/80">
          <div className="px-4 sm:px-6 py-3 flex items-center gap-3 border-b border-line/60">
            <button
              onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
              className="p-2 rounded-lg text-muted hover:text-heading hover:bg-[#EFEEE7] transition-colors shrink-0"
              aria-label="Fermer la recherche"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  // Entrée = demander à Lekki : la recherche s'affiche déjà en tapant.
                  if (e.key === "Enter" && searchQuery.trim()) {
                    onAskAI(searchQuery.trim());
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }
                }}
                enterKeyHint="send"
                placeholder="Rechercher ou demander à Lekki…"
                className="w-full pl-10 pr-8 py-2 bg-transparent border-none text-base text-heading placeholder-zinc-500 focus:outline-none min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-md hover:bg-[#EFEEE7] text-subtle hover:text-body shrink-0"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <UnifiedSearchDialog
            open={isSearchOpen}
            onOpenChange={(open) => {
              setIsSearchOpen(open);
              if (!open) setSearchQuery("");
            }}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSelectDocument={(id) => { onSelectDocument(id); setIsSearchOpen(false); setSearchQuery(""); }}
            onSelectWiki={(id) => { onSelectWiki(id); setIsSearchOpen(false); setSearchQuery(""); }}
            onAskAI={(q) => { onAskAI(q); setIsSearchOpen(false); setSearchQuery(""); }}
          />
        </div>
      )}

      <header
        id="lekki-app-header"
        className="h-14 sm:h-16 shrink-0 z-30 select-none border-b border-[#E7E4D9] bg-[#F8F7F4]/90 px-3 backdrop-blur-md sm:px-6 flex items-center justify-between gap-2 sm:gap-4"
      >
        {/* Left: mobile logo, desktop context */}
        <div className={`flex items-center gap-3 min-w-0 shrink-0 ${isSearchOpen ? "hidden" : ""}`}>
          <div className="lg:hidden flex items-center gap-2">
            <img src="/logo.svg" alt="Lekki Logo" className="h-7 w-7 rounded-lg" />
            <span className="font-display text-base font-semibold tracking-tight text-heading">
              Lekki
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 min-w-0 rounded-full border border-[#E7E4D9] bg-[#F8F7F2] py-1.5 pl-2.5 pr-3.5">
            {getWorkspaceIcon(activeWorkspace?.icon)}
            <span className="truncate max-w-[220px] text-sm font-medium text-body">
              {activeWorkspace ? activeWorkspace.name : "Mon espace"}
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div className={`relative hidden sm:flex flex-1 max-w-xl mx-auto justify-center overflow-visible ${isSearchOpen ? "hidden" : ""}`}>
          <div className="w-full max-w-lg relative group">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#F8F7F2] focus-within:bg-[#F8F7F2] border border-[#E7E4D9] focus-within:border-emerald-400/30 transition-all">
              <Search className="h-4 w-4 text-subtle group-focus-within:text-emerald-400 transition-colors shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Rechercher un cours, un sujet, une notion…"
                className="w-full bg-transparent border-none text-sm text-body placeholder-zinc-500 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="p-1 rounded-md hover:bg-[#EFEEE7] text-subtle hover:text-body transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <div className="hidden md:flex items-center gap-1">
                  <kbd className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-medium font-sans bg-[#F8F7F2] text-subtle rounded-md border border-[#E7E4D9]">⌘K</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile : bouton pour ouvrir l'overlay de recherche */}
        <div className={`sm:hidden flex-1 mx-2 ${isSearchOpen ? "hidden" : ""}`}>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border bg-[#F8F7F2] border-[#E7E4D9] text-left hover:border-[#E7E4D9] transition-colors"
            aria-label="Ouvrir la recherche"
          >
            <Search className="h-4 w-4 text-subtle shrink-0" />
            <span className="truncate text-sm text-subtle">Rechercher ou demander à Lekki…</span>
          </button>
        </div>

        {/* Right: AI + User */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            id="header-lekki-ai-toggle"
            aria-label="Lekki AI"
            onClick={onToggleAI}
            className={`hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold transition-all ${
              isAIOpen
                ? "bg-emerald-400 text-[#FBFAF6] shadow-[0_0_24px_rgba(127,207,165,0.28)]"
                : "border border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200 hover:bg-emerald-400/[0.12] hover:border-emerald-400/40"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>{isAIOpen ? "Lekki AI actif" : "Lekki AI"}</span>
          </button>

          <div className="h-6 w-px bg-[#F8F7F2] hidden sm:block" />

          <div className="relative">
            <button
              id="header-user-persona-btn"
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-[#F8F7F2] lg:pr-2"
              title="Compte utilisateur"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-600/60 to-[#8a6a34]/60 border border-emerald-400/25 text-heading flex items-center justify-center font-semibold text-sm">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-subtle hidden md:block" />
            </button>

            {showUserMenu && (
              <div
                id="header-user-dropdown"
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FFFFFF] border border-[#E7E4D9] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-4 py-3 border-b border-[#E7E4D9]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-600 to-[#8a6a34] text-heading flex items-center justify-center font-semibold text-base">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-heading truncate">
                        {user?.name || user?.username}
                      </div>
                      <div className="text-xs text-subtle truncate">{user?.email}</div>
                    </div>
                  </div>
                </div>

                <div className="p-1 border-t border-[#E7E4D9] mt-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-700 hover:bg-red-500/10 font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
