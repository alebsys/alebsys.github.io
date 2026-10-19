import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';

export type Lang = 'ru' | 'en';

const collectionFor = { ru: 'posts', en: 'postsEn' } as const;

export async function getPosts(lang: Lang = 'ru') {
  const posts = await getCollection(collectionFor[lang], ({ data }) => !import.meta.env.PROD || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function postHref(lang: Lang, id: string) {
  return lang === 'en' ? `/en/posts/${id}/` : `/posts/${id}/`;
}

// «Серия: заголовок» для списков и <title>.
export function fullTitle(data: { title: string; series?: string }) {
  return data.series ? `${data.series}: ${data.title}` : data.title;
}

export function formatDate(date: Date, lang: Lang = 'ru') {
  return date.toLocaleDateString(lang === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export interface PostLink {
  title: string;
  date: Date;
  href: string;
}

// Старый архив Hugo лежит готовым HTML в public/posts/<slug>/index.html.
// Заголовок и дату берём из самих страниц, чтобы список не вести руками.
export function getLegacyPosts(): PostLink[] {
  const dir = path.join(process.cwd(), 'public/posts');
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'index.html')))
    .map((e) => {
      const html = fs.readFileSync(path.join(dir, e.name, 'index.html'), 'utf8');
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1].replace(/ \| Performance Matters$/, '') ?? e.name;
      const date = html.match(/"datePublished":"([^"]+)"/)?.[1];
      return { title: decodeEntities(title), date: new Date(date ?? 0), href: `/posts/${e.name}/` };
    });
}

export async function getAllPostLinks(lang: Lang = 'ru'): Promise<PostLink[]> {
  const posts = (await getPosts(lang)).map((p) => ({ title: fullTitle(p.data), date: p.data.date, href: postHref(lang, p.id) }));
  // Старый архив есть только на русском.
  const legacy = lang === 'ru' ? getLegacyPosts() : [];
  return [...posts, ...legacy].sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

function decodeEntities(s: string) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}
