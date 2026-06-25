import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// f11 — file-based MDX blog. Drop a new `.mdx` file in /content/insights with
// frontmatter and it shows up automatically. Rendered via next-mdx-remote/rsc.

const POSTS_DIR = path.join(process.cwd(), "content", "insights");

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  readingTime: string;
};

export type Post = PostMeta & { content: string };

function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function listFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
}

export function getAllPostMeta(): PostMeta[] {
  return listFiles()
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: String(data.title ?? slug),
        date: String(data.date ?? ""),
        excerpt: String(data.excerpt ?? ""),
        category: String(data.category ?? "Insights"),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        author: String(data.author ?? "Armed Capital"),
        readingTime: readingTime(content),
      } satisfies PostMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  const file = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    excerpt: String(data.excerpt ?? ""),
    category: String(data.category ?? "Insights"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    author: String(data.author ?? "Armed Capital"),
    readingTime: readingTime(content),
    content,
  };
}

export function getAllSlugs(): string[] {
  return listFiles().map((f) => f.replace(/\.mdx$/, ""));
}
