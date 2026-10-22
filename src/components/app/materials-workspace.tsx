"use client";

import {
  BookCopy,
  FileCode2,
  FilePenLine,
  FileText,
  FolderOpen,
  Link2,
  Plus,
  Save,
  Search,
  Trash2
} from "lucide-react";
import { useMemo, useState } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import {
  filterMaterials,
  getMaterialTypeLabel,
  initialContentMaterials,
  type ContentMaterial,
  type MaterialType
} from "@/lib/content-and-classes";
import { lessonTemplates, type LessonTemplate } from "@/lib/mentorship-lifecycle";
import type { UserRole } from "@/lib/access";
import styles from "./workspace-board.module.css";

type LibraryTab = "materials" | "templates";

function AssetIcon({ type }: { type: MaterialType }) {
  if (type === "html") return <FileCode2 size={19} />;
  if (type === "external_link" || type === "repository") return <Link2 size={19} />;
  return <FileText size={19} />;
}

const emptyMaterial: ContentMaterial = {
  id: "",
  ownerId: "mentor-preview",
  type: "pdf",
  title: "",
  description: "",
  category: "",
  tags: [],
  source: "",
  visibility: "private",
  createdAt: ""
};

const emptyTemplate: LessonTemplate = {
  id: "",
  title: "",
  category: "",
  estimatedDuration: "60 min",
  objective: "",
  suggestedTopics: [],
  suggestedMaterials: [],
  suggestedExercise: ""
};

export function MaterialsWorkspace({ role }: { role?: UserRole | null }) {
  const [tab, setTab] = useState<LibraryTab>("materials");
  const [materials, setMaterials] = useState(initialContentMaterials);
  const [templates, setTemplates] = useState(lessonTemplates);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [materialDraft, setMaterialDraft] = useState<ContentMaterial | null>(null);
  const [templateDraft, setTemplateDraft] = useState<LessonTemplate | null>(null);
  const [feedback, setFeedback] = useState("");

  const categories = useMemo(() => Array.from(new Set(materials.map((material) => material.category))).sort(), [materials]);
  const visibleMaterials = useMemo(() => filterMaterials(materials, query, "all", category), [materials, query, category]);
  const visibleTemplates = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return templates.filter((template) => !normalized || `${template.title} ${template.category} ${template.objective}`.toLocaleLowerCase("pt-BR").includes(normalized));
  }, [templates, query]);

  function saveMaterial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!materialDraft?.title.trim() || !materialDraft.category.trim() || !materialDraft.source.trim()) {
      setFeedback("Título, categoria e arquivo ou URL são obrigatórios.");
      return;
    }
    const next = { ...materialDraft, id: materialDraft.id || `material-${Date.now()}`, createdAt: materialDraft.createdAt || new Date().toISOString() };
    setMaterials((current) => current.some((item) => item.id === next.id) ? current.map((item) => item.id === next.id ? next : item) : [next, ...current]);
    setMaterialDraft(null);
    setFeedback("Material salvo na biblioteca.");
  }

  function saveTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!templateDraft?.title.trim() || !templateDraft.objective.trim()) {
      setFeedback("Título e objetivo são obrigatórios para o template.");
      return;
    }
    const next = { ...templateDraft, id: templateDraft.id || `template-${Date.now()}` };
    setTemplates((current) => current.some((item) => item.id === next.id) ? current.map((item) => item.id === next.id ? next : item) : [next, ...current]);
    setTemplateDraft(null);
    setFeedback("Template de aula salvo e disponível para novos planos.");
  }

  if (role === "mentee") {
    const sharedMaterials = visibleMaterials.filter((material) => material.visibility === "shared");

    return (
      <section className={styles.workspace} aria-label="Materiais compartilhados comigo">
        <GlassPanel strong className={styles.panel}>
          <div className={styles.panelHeader}>
            <div><span className={styles.eyebrow}>Plano atual</span><h2>Materiais compartilhados comigo</h2></div>
            <PillChip>{sharedMaterials.length} itens</PillChip>
          </div>
          <p>Esta visão mostra somente os conteúdos liberados pelo mentor para sua trilha atual.</p>
          <div className={styles.toolbar}>
            <label className={styles.searchWrap}><Search size={17} /><input type="search" placeholder="Buscar material" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <select aria-label="Filtrar categoria" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">Todas as categorias</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className={styles.materialGrid}>
            {sharedMaterials.map((material) => (
              <article className={styles.materialCard} key={material.id}>
                <div className={styles.materialCardHeader}>
                  <span className={styles.materialCardIcon}><AssetIcon type={material.type} /></span>
                  <PillChip>Compartilhado</PillChip>
                </div>
                <div className={styles.materialCopy}>
                  <small>{getMaterialTypeLabel(material.type)} · {material.category}</small>
                  <strong>{material.title}</strong>
                  <p>{material.description}</p>
                </div>
                <div className={styles.tagRow}>{material.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className={styles.rowActions}>
                  <a className={styles.textButton} href={material.source} target="_blank" rel="noreferrer">Abrir material</a>
                </div>
              </article>
            ))}
          </div>
          {sharedMaterials.length === 0 ? <div className={styles.emptyState}>Nenhum material compartilhado corresponde a esta busca.</div> : null}
        </GlassPanel>
      </section>
    );
  }

  return (
    <section className={styles.workspace} aria-label="Biblioteca de materiais e templates">
      <GlassPanel className={styles.calendarTopbar}>
        <div className={styles.tabs} role="tablist" aria-label="Conteúdo da biblioteca">
          <button className={[styles.tab, tab === "materials" ? styles.tabActive : ""].join(" ")} type="button" role="tab" aria-selected={tab === "materials"} onClick={() => { setTab("materials"); setQuery(""); }}><FolderOpen size={16} /> Materiais</button>
          <button className={[styles.tab, tab === "templates" ? styles.tabActive : ""].join(" ")} type="button" role="tab" aria-selected={tab === "templates"} onClick={() => { setTab("templates"); setQuery(""); }}><BookCopy size={16} /> Templates de aula</button>
        </div>
        <GlassButton icon={<Plus size={16} />} onClick={() => tab === "materials" ? setMaterialDraft({ ...emptyMaterial }) : setTemplateDraft({ ...emptyTemplate })}>
          {tab === "materials" ? "Novo material" : "Novo template"}
        </GlassButton>
      </GlassPanel>

      {feedback ? <div className={styles.feedback} role="status">{feedback}</div> : null}

      {tab === "materials" ? (
        <div className={styles.mainGrid}>
          <GlassPanel strong className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.eyebrow}>Biblioteca</span><h2>Seus materiais</h2></div>
              <PillChip tone="muted">{visibleMaterials.length} itens</PillChip>
            </div>
            <div className={styles.toolbar}>
              <label className={styles.searchWrap}><Search size={17} /><input type="search" placeholder="Buscar título, tag ou categoria" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
              <select aria-label="Filtrar categoria" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">Todas as categorias</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className={styles.materialGrid}>
              {visibleMaterials.map((material) => (
                <article className={styles.materialCard} key={material.id}>
                  <div className={styles.materialCardHeader}>
                    <span className={styles.materialCardIcon}><AssetIcon type={material.type} /></span>
                    <PillChip tone={material.visibility === "shared" ? "default" : "muted"}>{material.visibility === "shared" ? "Em uso" : "Privado"}</PillChip>
                  </div>
                  <div className={styles.materialCopy}>
                    <small>{getMaterialTypeLabel(material.type)} · {material.category}</small>
                    <strong>{material.title}</strong>
                    <p>{material.description}</p>
                  </div>
                  <div className={styles.tagRow}>{material.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                  <div className={styles.rowActions}>
                    <button className={styles.textButton} type="button" onClick={() => setMaterialDraft({ ...material })}><FilePenLine size={14} /> Editar</button>
                    <button className={[styles.textButton, styles.textButtonDanger].join(" ")} type="button" onClick={() => setMaterials((current) => current.filter((item) => item.id !== material.id))}><Trash2 size={14} /> Excluir</button>
                  </div>
                </article>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.eyebrow}>{materialDraft?.id ? "Editar material" : "Adicionar material"}</span><h3>{materialDraft ? (materialDraft.title || "Novo material") : "Selecione um item"}</h3></div>
              <span className={styles.iconBox}><FilePenLine size={18} /></span>
            </div>
            {materialDraft ? (
              <form className={styles.form} onSubmit={saveMaterial}>
                <label>Título<input value={materialDraft.title} onChange={(event) => setMaterialDraft((current) => current ? { ...current, title: event.target.value } : current)} /></label>
                <div className={styles.twoFields}>
                  <label>Tipo<select value={materialDraft.type} onChange={(event) => setMaterialDraft((current) => current ? { ...current, type: event.target.value as MaterialType } : current)}><option value="pdf">PDF</option><option value="html">HTML</option><option value="presentation">Apresentação</option><option value="markdown">Markdown</option><option value="external_link">Link externo</option><option value="repository">Repositório</option></select></label>
                  <label>Categoria<input value={materialDraft.category} onChange={(event) => setMaterialDraft((current) => current ? { ...current, category: event.target.value } : current)} /></label>
                </div>
                <label>Descrição<textarea rows={3} value={materialDraft.description} onChange={(event) => setMaterialDraft((current) => current ? { ...current, description: event.target.value } : current)} /></label>
                <label>Tags<input value={materialDraft.tags.join(", ")} onChange={(event) => setMaterialDraft((current) => current ? { ...current, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) } : current)} /></label>
                <label>Arquivo ou URL<input value={materialDraft.source} placeholder="arquivo.pdf ou https://..." onChange={(event) => setMaterialDraft((current) => current ? { ...current, source: event.target.value } : current)} /></label>
                <div className={styles.panelActions}><button className={styles.textButton} type="button" onClick={() => setMaterialDraft(null)}>Cancelar</button><GlassButton type="submit" icon={<Save size={15} />}>Salvar material</GlassButton></div>
              </form>
            ) : <div className={styles.emptyState}>Escolha “Editar” em um material ou crie um novo. O formulário aparece aqui sem tirar você da biblioteca.</div>}
          </GlassPanel>
        </div>
      ) : (
        <div className={styles.mainGrid}>
          <GlassPanel strong className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.eyebrow}>Aulas-base</span><h2>Templates reutilizáveis</h2></div>
              <PillChip tone="muted">{templates.length} templates</PillChip>
            </div>
            <p>Edite a aula-base aqui. Ao usá-la em um plano, ela vira uma cópia independente para aquele mentorado.</p>
            <label className={styles.searchWrap}><Search size={17} /><input type="search" placeholder="Buscar template" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <div className={styles.templateList}>
              {visibleTemplates.map((template) => (
                <button className={[styles.templateItem, templateDraft?.id === template.id ? styles.templateItemActive : ""].join(" ")} type="button" onClick={() => setTemplateDraft({ ...template })} key={template.id}>
                  <span>{template.category} · {template.estimatedDuration}</span>
                  <strong>{template.title}</strong>
                  <small>{template.objective}</small>
                </button>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><span className={styles.eyebrow}>{templateDraft?.id ? "Editar template" : "Novo template"}</span><h3>{templateDraft?.title || "Detalhes da aula"}</h3></div>
              <span className={styles.iconBox}><BookCopy size={18} /></span>
            </div>
            {templateDraft ? (
              <form className={styles.form} onSubmit={saveTemplate}>
                <label>Título<input value={templateDraft.title} onChange={(event) => setTemplateDraft((current) => current ? { ...current, title: event.target.value } : current)} /></label>
                <div className={styles.twoFields}>
                  <label>Categoria<input value={templateDraft.category} onChange={(event) => setTemplateDraft((current) => current ? { ...current, category: event.target.value } : current)} /></label>
                  <label>Duração<input value={templateDraft.estimatedDuration} onChange={(event) => setTemplateDraft((current) => current ? { ...current, estimatedDuration: event.target.value } : current)} /></label>
                </div>
                <label>Objetivo<textarea rows={3} value={templateDraft.objective} onChange={(event) => setTemplateDraft((current) => current ? { ...current, objective: event.target.value } : current)} /></label>
                <label>Tópicos<input value={templateDraft.suggestedTopics.join(", ")} onChange={(event) => setTemplateDraft((current) => current ? { ...current, suggestedTopics: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) } : current)} /></label>
                <label>Materiais sugeridos<input value={templateDraft.suggestedMaterials.join(", ")} onChange={(event) => setTemplateDraft((current) => current ? { ...current, suggestedMaterials: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) } : current)} /></label>
                <label>Exercício sugerido<textarea rows={3} value={templateDraft.suggestedExercise} onChange={(event) => setTemplateDraft((current) => current ? { ...current, suggestedExercise: event.target.value } : current)} /></label>
                <div className={styles.panelActions}>
                  {templateDraft.id ? <button className={[styles.textButton, styles.textButtonDanger].join(" ")} type="button" onClick={() => { setTemplates((current) => current.filter((item) => item.id !== templateDraft.id)); setTemplateDraft(null); }}><Trash2 size={14} /> Excluir</button> : <span />}
                  <GlassButton type="submit" icon={<Save size={15} />}>Salvar template</GlassButton>
                </div>
              </form>
            ) : <div className={styles.emptyState}>Selecione um template para editar ou crie uma nova aula-base.</div>}
          </GlassPanel>
        </div>
      )}
    </section>
  );
}
