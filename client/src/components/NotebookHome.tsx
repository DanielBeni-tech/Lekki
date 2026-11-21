import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import type { DriveFile, NavView, WikiPage, Workspace } from "@/types/lekki";
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  Camera,
  FileCheck2,
  FolderOpen,
  GraduationCap,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { DocumentTypeIcon } from "./DocumentTypeIcon";
import { prettyName } from "@/lib/studentDocs";
import type { Library } from "@/lib/library";
import type { RevisionMode } from "./RevisionPanel";
import { spaceWording } from "@/lib/spaces";
import { workspaces as workspacesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { inviteLink } from "@/lib/pendingLinks";
import { shareText } from "@/lib/share";

interface NotebookHomeProps {
  files: DriveFile[];
  wikiPages: WikiPage[];
  activeWorkspace: Workspace | null;
  onNavigate: (view: NavView) => void;
  onOpenFile: (file: DriveFile) => void;
  onOpenWiki: (page: WikiPage) => void;
  onOpenSearch: () => void;
  onOpenAI: () => void;
  onAsk: (question: string) => void;
  onOpenRevision: (mode: RevisionMode, fileId?: string) => void;
  onScan?: () => void;
  library: Library;
}

const actionClass =
  "group flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition hover:bg-[#F1F0E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/40";

export function NotebookHome({
  files,
  wikiPages,
  activeWorkspace,
  onNavigate,
  onOpenFile,
  onOpenWiki,
  onOpenSearch,
  onOpenAI,
  onAsk,
  onOpenRevision,
  onScan,
  library,
}: NotebookHomeProps) {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const firstName = (user?.name || "").split(" ")[0];
  const wording = spaceWording(activeWorkspace);
  const canManage = ["owner", "admin"].includes(activeWorkspace?.role || "");
  const isReader = Boolean(activeWorkspace) && !canManage;

  const sources = useMemo(
    () =>
      [...library.entries]
        .sort(
          (a, b) =>
            new Date(b.file.updated_at).getTime() -
            new Date(a.file.updated_at).getTime(),
        )
        .slice(0, 7),
    [library.entries],
  );
  const latestWiki = useMemo(
    () =>
      [...wikiPages].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )[0],
    [wikiPages],
  );
  const suggestions = useMemo(() => {
    const course = sources.find(({ info }) => !info.isExam);
    const exam = sources.find(({ info }) => info.isExam);
    return [
      course ? `Résume « ${prettyName(course.file.name)} »` : "Résume les idées principales de mes sources",
      exam ? `Quelles notions réviser dans « ${prettyName(exam.file.name)} » ?` : "Quelles notions reviennent le plus souvent ?",
    ];
  }, [sources]);

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const value = question.trim();
    if (!value) return;
    onAsk(value);
    setQuestion("");
  };

  const invite = async () => {
    if (!activeWorkspace) {
      toast.info("Crée d’abord un espace pour ta promo ou ton groupe.");
      return;
    }
    if (!canManage) {
      toast.info("Demande un code d’invitation à un admin de l’espace.");
      return;
    }
    try {
      const { code } = await workspacesApi.getJoinCode(activeWorkspace.id);
      await shareText(
        `Rejoindre ${activeWorkspace.name}`,
        `Rejoins « ${activeWorkspace.name} » sur Lekki (code ${code}) :`,
        inviteLink(code),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de récupérer le code.");
    }
  };

  const documentsView: NavView = activeWorkspace ? "workspace_files" : "my_docs";

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto bg-[#FBFAF6] xl:grid-cols-[248px_minmax(0,1fr)_280px] xl:overflow-hidden">
      <section className="order-2 border-t border-[#E5E9DC] bg-white/70 p-4 sm:p-5 xl:col-start-1 xl:row-span-2 xl:row-start-1 xl:order-none xl:overflow-y-auto xl:border-r xl:border-t-0">
        <div className="flex items-center justify-between gap-2 px-2">
          <div>
            <p className="text-sm font-semibold text-[#16241D]">Sources</p>
            <p className="mt-0.5 text-xs text-[#758278]">
              {library.entries.length} document{library.entries.length === 1 ? "" : "s"} dans cet espace
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(documentsView)}
            aria-label="Ajouter des sources"
            title="Ajouter des sources"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#5C6B62] transition hover:bg-[#E7F1E9] hover:text-[#2E7D5B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/40"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          {sources.length ? (
            sources.map(({ file, info }) => (
              <button
                key={file.id}
                type="button"
                onClick={() => onOpenFile(file)}
                className="group flex min-w-0 items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-[#F1F0E9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/40"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F0E9] text-[#2E7D5B]">
                  <DocumentTypeIcon extension={file.extension} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-[#26342B] group-hover:text-[#2E7D5B]">
                    {prettyName(file.name)}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-[#758278]">
                    {info.isExam ? "Ancien sujet" : info.kind === "cours" ? "Cours" : "Document"}
                    {info.year ? ` · ${info.year}` : ""}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[#D9DFD2] px-4 py-6 text-center">
              <FolderOpen className="mx-auto size-5 text-[#8A968E]" />
              <p className="mt-2 text-sm font-medium text-[#26342B]">Ton espace commence ici</p>
              <p className="mt-1 text-xs leading-relaxed text-[#758278]">
                Ajoute tes cours et Lekki les transformera en sources consultables.
              </p>
              <button
                type="button"
                onClick={() => onNavigate(documentsView)}
                className="mt-3 text-xs font-semibold text-[#2E7D5B] hover:underline"
              >
                Ajouter un document
              </button>
            </div>
          )}
        </div>

        {library.entries.length > sources.length && (
          <button
            type="button"
            onClick={() => onNavigate(documentsView)}
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-1 rounded-lg px-3 text-xs font-medium text-[#2E7D5B] transition hover:bg-[#E7F1E9]"
          >
            Voir toutes les sources <ArrowRight className="size-3.5" />
          </button>
        )}
      </section>

      <section aria-labelledby="notebook-home-title" className="order-1 min-w-0 px-5 pb-8 pt-8 sm:px-8 sm:pt-10 xl:col-start-2 xl:row-start-1 xl:order-none xl:overflow-y-auto xl:px-10 xl:pb-12 xl:pt-12">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#758278]">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#2E7D5B]">
              <Sparkles className="size-3.5" /> {firstName ? `Bonjour ${firstName}` : "Bienvenue"}
            </span>
            <span aria-hidden="true">·</span>
            <span className="max-w-full truncate">{activeWorkspace?.name || "Mon espace personnel"}</span>
            {library.academic && library.current && <span>· Semestre {library.current}</span>}
          </div>

          <h1 id="notebook-home-title" className="mt-5 max-w-2xl font-display text-[1.7rem] font-medium leading-tight tracking-[-0.03em] text-[#16241D] sm:text-[2.65rem]">
            {wording.headline[0]}{" "}<span className="text-[#2E7D5B]">{wording.headline[1].replace(" ?", "\u00a0?")}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#5C6B62] sm:text-[15px]">
            Interroge tes cours, retrouve une notion et passe directement à la révision.
          </p>

          <form
            onSubmit={submit}
            className="mt-7 rounded-2xl border border-[#D9DFD2] bg-white p-2 shadow-[0_8px_28px_-24px_rgba(22,36,29,0.45)] transition focus-within:border-[#2E7D5B]/50 focus-within:shadow-[0_8px_32px_-20px_rgba(46,125,91,0.25)]"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="ml-3 size-4 shrink-0 text-[#2E7D5B]" />
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.shiftKey) return;
                  if (event.nativeEvent.isComposing || event.keyCode === 229) return;
                  event.preventDefault();
                  submit();
                }}
                placeholder={wording.askPlaceholder}
                aria-label="Question pour Lekki AI"
                enterKeyHint="send"
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#16241D] outline-none placeholder:text-[#8A968E] sm:text-[15px]"
              />
              <button
                type="submit"
                disabled={!question.trim()}
                aria-label="Envoyer la question"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2E7D5B] text-white transition hover:bg-[#246147] disabled:cursor-not-allowed disabled:bg-[#E5E9DC] disabled:text-[#8A968E]"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[#F1F0E9] px-3 pt-2">
              <span className="text-[11px] text-[#8A968E]">Lekki répond en citant ses sources</span>
              <button
                type="button"
                onClick={onOpenSearch}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-medium text-[#5C6B62] transition hover:bg-[#F1F0E9] hover:text-[#2E7D5B]"
              >
                <Search className="size-3.5" /> Rechercher
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onAsk(suggestion)}
                className="max-w-full rounded-full border border-[#E5E9DC] bg-white px-3.5 py-2 text-left text-xs leading-5 text-[#3E4641] transition hover:border-[#2E7D5B]/30 hover:bg-[#F5F8F3] hover:text-[#2E7D5B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/40"
              >
                <span className="line-clamp-1">{suggestion}</span>
              </button>
            ))}
          </div>

          <div className="mt-9 border-t border-[#E5E9DC] pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#16241D]">Reprendre ton espace</p>
                <p className="mt-1 text-xs text-[#758278]">Tes contenus utiles, sans détour.</p>
              </div>
              <button
                type="button"
                onClick={onOpenAI}
                className="hidden min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-[#2E7D5B] transition hover:bg-[#E7F1E9] sm:inline-flex"
              >
                <Sparkles className="size-3.5" /> Ouvrir Lekki AI
              </button>
            </div>

            {latestWiki ? (
              <button
                type="button"
                onClick={() => onOpenWiki(latestWiki)}
                className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-[#E5E9DC] bg-white p-4 text-left transition hover:border-[#D9DFD2] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/40"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F1E9] text-[#2E7D5B]">
                  <BookOpen className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#758278]">Dernière fiche consultée</span>
                  <span className="mt-1 block truncate text-sm font-medium text-[#26342B]">{latestWiki.title}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-[#8A968E]" />
              </button>
            ) : files.length > 0 ? (
              <button
                type="button"
                onClick={() => onOpenFile(files[0])}
                className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-[#E5E9DC] bg-white p-4 text-left transition hover:border-[#D9DFD2] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D5B]/40"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F0E9] text-[#2E7D5B]">
                  <DocumentTypeIcon extension={files[0].extension} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#758278]">Document récent</span>
                  <span className="mt-1 block truncate text-sm font-medium text-[#26342B]">{prettyName(files[0].name)}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-[#8A968E]" />
              </button>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-[#D9DFD2] bg-white/70 p-5 text-sm text-[#5C6B62]">
                Commence par ajouter une source ou poser une question à Lekki.
              </div>
            )}
          </div>
        </div>
      </section>

      <aside className="order-3 border-t border-[#E5E9DC] bg-white/70 p-4 sm:p-5 xl:col-start-3 xl:row-span-2 xl:row-start-1 xl:order-none xl:overflow-y-auto xl:border-l xl:border-t-0">
        <div className="px-2">
          <p className="text-sm font-semibold text-[#16241D]">Studio</p>
          <p className="mt-0.5 text-xs text-[#758278]">Des outils prêts pour tes sources</p>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <button type="button" onClick={() => onOpenRevision("quiz")} className={actionClass}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#E7F1E9] text-[#2E7D5B]"><GraduationCap className="size-4" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-[#26342B]">Créer un quiz</span><span className="mt-0.5 block text-[11px] text-[#758278]">Réviser à ton rythme</span></span>
            <ArrowRight className="size-3.5 text-[#8A968E]" />
          </button>
          {wording.study && (
            <button type="button" onClick={() => onOpenRevision("correction")} className={actionClass}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FCEDEA] text-[#B75442]"><FileCheck2 className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-[#26342B]">Corriger un sujet</span><span className="mt-0.5 block text-[11px] text-[#758278]">Avec les cours comme repères</span></span>
              <ArrowRight className="size-3.5 text-[#8A968E]" />
            </button>
          )}
          <button type="button" onClick={() => onNavigate(activeWorkspace ? "workspace_wiki" : "my_docs")} className={actionClass}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F0E9] text-[#5C6B62]"><BookOpen className="size-4" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-[#26342B]">Fiches & wiki</span><span className="mt-0.5 block text-[11px] text-[#758278]">Retrouver le savoir du groupe</span></span>
            <ArrowRight className="size-3.5 text-[#8A968E]" />
          </button>
          {onScan && activeWorkspace && wording.study && (
            <button type="button" onClick={onScan} className={actionClass}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F0E9] text-[#5C6B62]"><Camera className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-[#26342B]">Photographier un sujet</span><span className="mt-0.5 block text-[11px] text-[#758278]">Le classer dans tes sources</span></span>
              <ArrowRight className="size-3.5 text-[#8A968E]" />
            </button>
          )}
        </div>

        <div className="mt-5 border-t border-[#E5E9DC] pt-4">
          <button type="button" onClick={() => onNavigate(documentsView)} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-xs font-medium text-[#2E7D5B] transition hover:bg-[#E7F1E9]">
            <FolderOpen className="size-4" /> Gérer les documents
          </button>
          {!isReader && activeWorkspace && (
            <button type="button" onClick={() => void invite()} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-xs font-medium text-[#5C6B62] transition hover:bg-[#F1F0E9]">
              <Users className="size-4" /> Inviter un membre
            </button>
          )}
        </div>

        <div className="mt-5 rounded-xl bg-[#F5F8F3] p-3.5">
          <div className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-[#2E7D5B]" />
            <p className="text-xs leading-5 text-[#5C6B62]">Les réponses sont reliées à tes documents : ouvre une source citée pour vérifier le contexte.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
