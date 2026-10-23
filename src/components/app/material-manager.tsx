"use client";

import { Edit3, ExternalLink, FileText, Plus, Save } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { saveMaterial, type MaterialMutationState } from "@/app/app/materials/actions";
import { MaterialCard } from "@/components/app/material-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PillChip } from "@/components/ui/pill-chip";
import type { MaterialWorkspaceItem, MaterialsWorkspaceData } from "@/lib/workspace-data";
import styles from "./workspace-board.module.css";

const initialState: MaterialMutationState = { status: "idle", message: "" };
const linkTypes = new Set(["external_link", "repository"]);

function typeLabel(type: string) {
  return ({ html: "HTML", pdf: "PDF", presentation: "Apresentação", markdown: "Markdown", text: "Texto", image: "Imagem", external_link: "Link externo", repository: "Repositório" } as Record<string, string>)[type] ?? type;
}

function MaterialForm({ material, onCancel }: { material?: MaterialWorkspaceItem; onCancel: () => void }) {
  const [type, setType] = useState(material?.type ?? "external_link");
  const [state, action, pending] = useActionState(saveMaterial, initialState);

  useEffect(() => {
    if (state.status === "success") onCancel();
  }, [state.status, onCancel]);

  return (
    <GlassPanel strong className={styles.panel}>
      <div className={styles.panelHeader}>
        <div><span className={styles.eyebrow}>{material ? "Editar material" : "Novo material"}</span><h2>{material?.title ?? "Adicionar à biblioteca"}</h2></div>
      </div>
      <form action={action} className={styles.form}>
        <input name="materialId" type="hidden" value={material?.id ?? ""} />
        <div className={styles.twoFields}>
          <label>Título<input name="title" required maxLength={160} defaultValue={material?.title ?? ""} /></label>
          <label>Categoria<input name="category" required maxLength={100} defaultValue={material?.category ?? ""} /></label>
        </div>
        <label>Descrição<textarea name="description" rows={3} maxLength={1000} defaultValue={material?.description ?? ""} /></label>
        <div className={styles.twoFields}>
          <label>Tipo
            <select name="type" value={type} onChange={(event) => setType(event.target.value)}>
              <option value="external_link">Link externo</option><option value="repository">Repositório</option>
              <option value="pdf">PDF</option><option value="presentation">Apresentação</option><option value="html">HTML</option>
              <option value="markdown">Markdown</option><option value="text">Texto</option><option value="image">Imagem</option>
            </select>
          </label>
          <label>Tags<input name="tags" placeholder="frontend, aula, exercício" defaultValue={material?.tags.join(", ") ?? ""} /></label>
        </div>
        {linkTypes.has(type) ? (
          <label>URL<input name="sourceUrl" type="url" required placeholder="https://..." defaultValue={material?.sourceUrl ?? ""} /></label>
        ) : (
          <label>{material?.storagePath ? "Substituir arquivo (opcional)" : "Arquivo"}<input name="file" type="file" required={!material?.storagePath} /></label>
        )}
        {state.status !== "idle" ? <div className={state.status === "error" ? styles.noticeError : styles.feedback} role="status">{state.message}</div> : null}
        <div className={styles.panelActions}>
          <button className={styles.textButton} type="button" onClick={onCancel}>Cancelar</button>
          <GlassButton type="submit" disabled={pending} icon={<Save size={15} />}>{pending ? "Salvando..." : "Salvar material"}</GlassButton>
        </div>
      </form>
    </GlassPanel>
  );
}

export function MaterialManager({ data }: { data: MaterialsWorkspaceData }) {
  const [editor, setEditor] = useState<string | "new" | null>(null);
  const materialBeingEdited = editor && editor !== "new" ? data.materials.find((material) => material.id === editor) : undefined;

  return (
    <section className={styles.workspace} aria-label="Gerenciar materiais">
      {data.loadError ? <div className={styles.notice} role="alert">Não foi possível carregar os materiais. Tente novamente.</div> : null}
      <div className={styles.panelHeader}>
        <div><h2>Seus materiais</h2></div>
        <GlassButton icon={<Plus size={15} />} onClick={() => setEditor("new")}>Novo material</GlassButton>
      </div>
      {editor ? <MaterialForm key={editor} material={materialBeingEdited} onCancel={() => setEditor(null)} /> : null}
      <GlassPanel strong className={styles.panel}>
        <div className={styles.panelHeader}><div><h2>Biblioteca</h2></div><PillChip tone="muted">{data.materials.length} item(ns)</PillChip></div>
        {data.materials.length ? (
          <div className={styles.materialGrid}>
            {data.materials.map((material) => (
              <MaterialCard
                key={material.id}
                icon={<FileText size={19} />}
                typeLabel={typeLabel(material.type)}
                category={material.category}
                title={material.title}
                description={material.description}
                tags={material.tags}
                status={material.shared ? "Compartilhado" : "Privado"}
                statusTone={material.shared ? "default" : "muted"}
                action={<div className={styles.rowActions}>
                  {material.openUrl ? <a className={styles.textButton} href={material.openUrl} target="_blank" rel="noreferrer">Abrir <ExternalLink size={13} /></a> : null}
                  <button className={styles.textButton} type="button" onClick={() => setEditor(material.id)}><Edit3 size={14} /> Editar</button>
                </div>}
              />
            ))}
          </div>
        ) : <div className={styles.emptyState}>Nenhum material foi adicionado. Crie o primeiro item da biblioteca.</div>}
      </GlassPanel>

      <GlassPanel className={styles.panel}>
        <div className={styles.panelHeader}><div><h2>Templates disponíveis</h2></div><PillChip tone="muted">{data.templates.length}</PillChip></div>
        {data.templates.length ? <ul className={styles.templateList}>{data.templates.map((template) => <li className={styles.templateItem} key={template.id}><strong>{template.title}</strong><span>{template.category} · {template.estimatedDurationMinutes} minutos</span><p>{template.objective}</p></li>)}</ul> : <div className={styles.emptyState}>Nenhum template disponível.</div>}
      </GlassPanel>
    </section>
  );
}
