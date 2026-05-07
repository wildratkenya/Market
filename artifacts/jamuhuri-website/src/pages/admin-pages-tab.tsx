import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function PagesTab() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const pages = [
    { id: "home", label: "Home Page" },
    { id: "about", label: "About Page" },
    { id: "contact", label: "Contact Page" },
    { id: "footer", label: "Footer" },
  ];

  const loadPage = async (pageId: string) => {
    setSelectedPage(pageId);
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}` }
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = pageId === "about" ? parseBodyContent(data.bodyContent || "") : null;
        setFormData({
          ...data,
          ...(parsed ? {
            bodyContent: parsed.bio,
            visionContent: parsed.vision,
            missionContent: parsed.mission,
          } : {}),
        });
      } else {
        setFormData({ pageName: pageId, pageTitle: pageId.charAt(0).toUpperCase() + pageId.slice(1) });
      }
    } catch {
      setFormData({ pageName: pageId, pageTitle: pageId.charAt(0).toUpperCase() + pageId.slice(1) });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    setSaving(true);
    try {
      const payload = { ...formData };
      if (selectedPage === "about") {
        payload.bodyContent = combineBodyContent(
          formData.bodyContent || "",
          formData.visionContent || "",
          formData.missionContent || "",
        );
        delete payload.visionContent;
        delete payload.missionContent;
      }
      const res = await fetch(`/api/pages/${selectedPage}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast({ title: "Page saved", description: "Content updated successfully." });
        qc.invalidateQueries({ queryKey: ["/api/pages"] });
        qc.invalidateQueries({ queryKey: ["/api/pages", selectedPage] });
      } else {
        const err = await res.json();
        toast({ variant: "destructive", title: "Save failed", description: err.error || "Unknown error" });
      }
    } catch {
      toast({ variant: "destructive", title: "Save failed", description: "Network error" });
    } finally {
      setSaving(false);
    }
  };

function parseBodyContent(raw: string) {
  const visionMatch = raw.match(/VISION:\s*([\s\S]*?)(?=MISSION:|$)/);
  const missionMatch = raw.match(/MISSION:\s*([\s\S]*?)$/);
  const vision = visionMatch ? visionMatch[1].trim() : "";
  const mission = missionMatch ? missionMatch[1].trim() : "";
  let bio = raw.replace(/BELIEF:[\s\S]*?(?=VISION:|$)/, "");
  bio = bio.replace(/VISION:[\s\S]*?(?=MISSION:|$)/, "");
  bio = bio.replace(/MISSION:[\s\S]*$/, "");
  bio = bio.replace(/\n{2,}/g, "\n\n").trim();
  return { bio, vision, mission };
}

function combineBodyContent(bio: string, vision: string, mission: string) {
  const parts = [];
  if (bio) parts.push(bio);
  if (vision) parts.push("VISION:\n\n" + vision);
  if (mission) parts.push("MISSION:\n\n" + mission);
  return parts.join("\n\n");
}

const genericFields: { key: string; label: string; type?: string }[] = [
  { key: "pageTitle", label: "Page Title" },
  { key: "heroTitle", label: "Hero Title" },
  { key: "heroSubtitle", label: "Hero Subtitle" },
  { key: "heroDescription", label: "Hero Description", type: "textarea" },
  { key: "heroImage", label: "Hero Image URL" },
  { key: "heroButtonText", label: "Hero Button Text" },
  { key: "footerContent", label: "Footer Content", type: "textarea" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address", type: "textarea" },
  { key: "socialLinks", label: "Social Links" },
];

const aboutFields: { key: string; label: string; type?: string }[] = [
  ...genericFields,
  { key: "bodyContent", label: "Bio Content", type: "textarea" },
  { key: "visionContent", label: "Vision", type: "textarea" },
  { key: "missionContent", label: "Mission", type: "textarea" },
];

function getFieldsForPage(pageId: string) {
  return pageId === "about" ? aboutFields : genericFields;
}

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pages</h3>
          <div className="space-y-1">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => loadPage(p.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPage === p.id
                    ? "bg-[#c9a227]/20 text-[#c9a227]"
                    : "hover:bg-muted"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="w-8 h-8 rounded-full border-4 border-[#c9a227] border-t-transparent animate-spin mx-auto" />
          </div>
        ) : selectedPage ? (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold capitalize">{formData.pageTitle || selectedPage}</h3>
            {getFieldsForPage(selectedPage).map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-sm font-medium">{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    value={formData[f.key] || ""}
                    onChange={(e) => setFormData(d => ({ ...d, [f.key]: e.target.value }))}
                    rows={4}
                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                  />
                ) : (
                  <Input
                    value={formData[f.key] || ""}
                    onChange={(e) => setFormData(d => ({ ...d, [f.key]: e.target.value }))}
                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="bg-[#c9a227] text-[#0f2337] hover:bg-[#b8911e]">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            <p>Select a page from the left to edit its content.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PagesTab;
