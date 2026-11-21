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
        return <GraduationCap className="h-4 w-4 text-[#1a73e8]" />;
      case "Building2":
        return <Building2 className="h-4 w-4 text-[#1a73e8]" />;
      case "Cpu":
        return <Cpu className="h-4 w-4 text-[#1a73e8]" />;
      case "Users":
        return <Users className="h-4 w-4 text-[#1a73e8]" />;
      case "BookMarked":
        return <BookMarked className="h-4 w-4 text-[#1a73e8]" />;
      default:
        return <Folder className="h-4 w-4 text-[#1a73e8]" />;
    }
  };

  return (
    <>
      {isSearchOpen && (
        <div className="fixed inset-0 z-[70] bg-[#f8f9fa] pt-[env(safe-area-inset-top)] sm:inset-auto sm:left-0 sm:top-0 sm:w-full sm:bg-[#f8f9fa]/98 sm:backdrop-blur-md sm:border-b sm:border-[#e8eaed]">
          <div className="px-4 sm:px-6 py-3 flex items-center gap-3 border-b border-[#e8eaed]">
            <button
              onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
              className="p-2 rounded-full text-[#5f6368] hover:text-[#1f1f1f] hover:bg-[#f1f3f4] transition-colors shrink-0"
              aria-label="Fermer la recherche"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9aa0a6] shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    onAskAI(searchQuery.trim());
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }
                }}
                enterKeyHint="send"
                placeholder="Rechercher ou demander à Lekki…"
                className="w-full pl-10 pr-8 py-2 bg-transparent border-none text-base text-[#1f1f1f] placeholder:text-[#9aa0a6] focus:outline-none min-w-0"
              />
              {searchQuery && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(""); }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1f1f1f] shrink-0"
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
        className="h-14 sm:h-16 shrink-0 z-30 select-none border-b border-[#e8eaed] bg-white px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4"
      >
        {/* Left: mobile logo, desktop context */}
        <div className={`flex items-center gap-3 min-w-0 shrink-0 ${isSearchOpen ? "hidden" : ""}`}>
          <div className="lg:hidden flex items-center gap-2">
            <img src="/logo.svg" alt="Lekki Logo" className="h-7 w-7 rounded-lg" />
            <span className="font-display text-base font-medium tracking-tight text-[#1f1f1f]">
              Lekki
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 min-w-0 rounded-full border border-[#e8eaed] bg-[#f8f9fa] py-1.5 pl-2.5 pr-3.5">
            {getWorkspaceIcon(activeWorkspace?.icon)}
            <span className="truncate max-w-[220px] text-sm font-medium text-[#3c4043]">
              {activeWorkspace ? activeWorkspace.name : "Mon espace"}
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div className={`relative hidden sm:flex flex-1 max-w-xl mx-auto justify-center overflow-visible ${isSearchOpen ? "hidden" : ""}`}>
          <div className="w-full max-w-lg relative group">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#f1f3f4] focus-within:bg-white border border-transparent focus-within:border-[#1a73e8]/30 transition-all">
              <Search className="h-4 w-4 text-[#5f6368] group-focus-within:text-[#1a73e8] transition-colors shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Rechercher un cours, un sujet, une notion…"
                className="w-full bg-transparent border-none text-sm text-[#1f1f1f] placeholder:text-[#5f6368] focus:outline-none"
              />
              <div className="flex items-center gap-2">
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="p-1 rounded-full hover:bg-[#e8eaed] text-[#5f6368] hover:text-[#1f1f1f] transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <div className="hidden md:flex items-center gap-1">
                  <kbd className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-medium font-sans bg-white text-[#5f6368] rounded-md border border-[#e8eaed]">⌘K</kbd>
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
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-full border bg-[#f1f3f4] border-transparent text-left hover:border-[#e8eaed] transition-colors"
            aria-label="Ouvrir la recherche"
          >
            <Search className="h-4 w-4 text-[#5f6368] shrink-0" />
            <span className="truncate text-sm text-[#5f6368]">Rechercher ou demander à Lekki…</span>
          </button>
        </div>

        {/* Right: AI + User */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            id="header-lekki-ai-toggle"
            aria-label="Lekki AI"
            onClick={onToggleAI}
            className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isAIOpen
                ? "bg-[#1a73e8] text-white shadow-[0_1px_6px_rgba(26,115,232,0.3)]"
                : "border border-[#1a73e8]/25 bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d3e3fd]"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>{isAIOpen ? "Lekki AI actif" : "Lekki AI"}</span>
          </button>

          <div className="h-6 w-px bg-[#e8eaed] hidden sm:block" />

          <div className="relative">
            <button
              id="header-user-persona-btn"
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-[#f1f3f4] lg:pr-2"
              title="Compte utilisateur"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#1558b0] text-white flex items-center justify-center font-medium text-sm">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#5f6368] hidden md:block" />
            </button>

            {showUserMenu && (
              <div
                id="header-user-dropdown"
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#e8eaed] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-4 py-3 border-b border-[#e8eaed]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#1558b0] text-white flex items-center justify-center font-medium text-base">
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#1f1f1f] truncate">
                        {user?.name || user?.username}
                      </div>
                      <div className="text-xs text-[#5f6368] truncate">{user?.email}</div>
                    </div>
                  </div>
                </div>

                <div className="p-1 border-t border-[#e8eaed] mt-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#d93025] hover:bg-[#d93025]/10 font-medium transition-colors"
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
