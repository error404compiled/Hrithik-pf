import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { getAppwriteConfig, isAppwriteConfigured } from "@/lib/appwriteClient";
import { getCurrentUser, isAdminUser, loginWithEmailPassword, logout } from "@/lib/adminAuth";
import {
  createPostForAdmin,
  listPostsForAdmin,
  replacePostsFromCsvForAdmin,
  updatePostForAdmin,
} from "@/lib/posts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function createEmptyDraft() {
  return {
    id: "",
    slug: "",
    title: "",
    summary: "",
    image: "",
    content: "",
    tags: "",
    coAuthors: "",
    readingTime: "5 min",
    draft: true,
    publishedAt: "",
    externalUrl: "",
  };
}

export default function UpdateVlogPage() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState(createEmptyDraft);
  const [saving, setSaving] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);

  const configured = isAppwriteConfigured();
  const { adminEmail } = getAppwriteConfig();
  const admin = isAdminUser(user);

  const selected = useMemo(
    () => posts.find((p) => p.id === selectedId) || null,
    [posts, selectedId],
  );

  const resetToNewPost = () => {
    setSelectedId("");
    setDraft(createEmptyDraft());
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await getCurrentUser();
      if (cancelled) return;
      setUser(u);
      setLoadingAuth(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!admin) return;
    (async () => {
      try {
        const list = await listPostsForAdmin();
        setPosts(list);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load existing posts.");
      }
    })();
  }, [admin]);

  useEffect(() => {
    if (!selected) {
      setDraft(createEmptyDraft());
      return;
    }
    setDraft({
      id: selected.id,
      slug: selected.slug,
      title: selected.title,
      summary: selected.summary,
      image: selected.image,
      content: selected.content,
      tags: selected.tags,
      coAuthors: selected.coAuthors,
      readingTime: selected.readingTime,
      draft: selected.draft,
      publishedAt: selected.publishedAt || "",
      externalUrl: selected.externalUrl || "",
    });
  }, [selected]);

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      await loginWithEmailPassword(email.trim(), password);
      const u = await getCurrentUser();
      setUser(u);
      setPassword("");
      toast.success("Signed in.");
    } catch (error) {
      toast.error(error?.message || "Login failed.");
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!draft.slug || !draft.title || !draft.content) {
      toast.error("slug, title and content are required.");
      return;
    }
    if (!user?.$id) {
      toast.error("Please login again.");
      return;
    }

    const payload = {
      slug: draft.slug.trim(),
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      image: draft.image.trim(),
      content: draft.content,
      tags: draft.tags.trim(),
      coAuthors: draft.coAuthors.trim(),
      readingTime: draft.readingTime.trim() || "5 min",
      draft: Boolean(draft.draft),
      externalUrl: draft.externalUrl.trim(),
      publishedAt: draft.publishedAt || new Date().toISOString(),
    };

    setSaving(true);
    try {
      if (draft.id) {
        await updatePostForAdmin(draft.id, payload);
        toast.success("Post updated.");
      } else {
        await createPostForAdmin(payload, user.$id);
        toast.success("Post created.");
      }
      const list = await listPostsForAdmin();
      setPosts(list);
      resetToNewPost();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const onCsvFileSelected = async (file) => {
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  };

  const onReplaceFromCsv = async () => {
    if (!csvText.trim()) {
      toast.error("Paste CSV or upload a CSV file first.");
      return;
    }
    if (!user?.$id) {
      toast.error("Please login again.");
      return;
    }
    const confirmed = window.confirm(
      "This will replace ALL existing blogs with CSV rows. Continue?",
    );
    if (!confirmed) return;

    setImporting(true);
    try {
      const result = await replacePostsFromCsvForAdmin(csvText, user.$id);
      const list = await listPostsForAdmin();
      setPosts(list);
      resetToNewPost();
      toast.success(
        `Imported ${result.imported} posts (removed ${result.removedDuplicates} duplicates).`,
      );
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "CSV import failed.");
    } finally {
      setImporting(false);
    }
  };

  if (!configured) {
    return (
      <article className="mt-8 flex flex-col gap-8 pb-16">
        <h1 className="title text-3xl">update vlog.</h1>
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Appwrite is not configured. Add `VITE_APPWRITE_*` variables in `.env`
            and restart Vite.
          </CardContent>
        </Card>
      </article>
    );
  }

  if (loadingAuth) {
    return <article className="mt-8 pb-16 text-sm text-muted-foreground">Loading…</article>;
  }

  if (!admin) {
    return (
      <>
        <Helmet>
          <title>Admin Login | HritikSharma.me</title>
        </Helmet>
        <article className="mt-8 flex flex-col gap-8 pb-16">
          <h1 className="title text-3xl">update vlog.</h1>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Admin sign in</CardTitle>
            </CardHeader>
            <CardContent>
              {user && !admin && (
                <div className="mb-4 rounded-md border border-amber-400/40 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  Signed in as <b>{user.email}</b>, but this account is not allowed
                  to edit blogs.
                  <br />
                  Set <code>VITE_ADMIN_EMAIL</code> in <code>.env</code> to this
                  email (or sign in with the configured admin).
                  <br />
                  Current configured admin:{" "}
                  <b>{adminEmail || "(not set)"}</b>
                </div>
              )}
              <form className="space-y-3" onSubmit={onLogin}>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Sign in
                </Button>
              </form>
            </CardContent>
          </Card>
        </article>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Update Vlog | HritikSharma.me</title>
      </Helmet>
      <article className="mt-8 flex flex-col gap-8 pb-16">
        <div className="flex items-center justify-between gap-4">
          <h1 className="title text-3xl">update vlog.</h1>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetToNewPost}
            >
              New post
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                await logout();
                setUser(null);
                toast.success("Logged out.");
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bulk import external blogs (CSV replace mode)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              CSV format: <code>title,url</code> (header optional). This will
              overwrite all existing blogs and keep only deduped links.
            </p>
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => onCsvFileSelected(e.target.files?.[0])}
            />
            <Textarea
              rows={6}
              placeholder={"title,url\nMy Medium Post,https://medium.com/..."}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <Button type="button" variant="outline" disabled={importing} onClick={onReplaceFromCsv}>
              {importing ? "Importing..." : "Replace blogs from CSV"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit existing</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">-- Select post --</option>
              {posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.slug})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{draft.id ? "Update post" : "Create post"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSave}>
              <Input
                placeholder="Slug (example: my-first-post)"
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                required
              />
              <Input
                placeholder="Title"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                required
              />
              <Input
                placeholder="Summary"
                value={draft.summary}
                onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
              />
              <Input
                placeholder="External article URL (Medium/Substack/etc.)"
                value={draft.externalUrl}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, externalUrl: e.target.value }))
                }
              />
              <Input
                placeholder="Featured image URL"
                value={draft.image}
                onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
              />
              <Input
                placeholder="Tags CSV (ai, react, appwrite)"
                value={draft.tags}
                onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
              />
              <Input
                placeholder="Co-authors CSV"
                value={draft.coAuthors}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, coAuthors: e.target.value }))
                }
              />
              <Input
                placeholder="Reading time (e.g. 6 min)"
                value={draft.readingTime}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, readingTime: e.target.value }))
                }
              />
              <Input
                type="datetime-local"
                value={
                  draft.publishedAt
                    ? new Date(draft.publishedAt).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    publishedAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  }))
                }
              />
              <div className="flex items-center gap-2">
                <Switch
                  id="draft-flag"
                  checked={draft.draft}
                  onCheckedChange={(checked) =>
                    setDraft((d) => ({ ...d, draft: checked }))
                  }
                />
                <Label htmlFor="draft-flag">Draft</Label>
              </div>
              <Textarea
                rows={18}
                placeholder="Markdown / MDX content"
                value={draft.content}
                onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                required
              />
              <Button disabled={saving} type="submit">
                {saving ? "Saving..." : draft.id ? "Update post" : "Create post"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </article>
    </>
  );
}

