import fs from 'fs'
import path from 'path'
import { serialize } from 'next-mdx-remote/serialize'
import matter from 'gray-matter'
import remarkPrism from 'remark-prism'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
const postsDirectory = path.join(process.cwd(), 'posts');

export async function getSortedPostsData() {
  async function helper(res, current: string, directory) {
    fs.readdirSync(directory).forEach(async file => {
      const absolute = path.join(directory, file);
      if (fs.statSync(absolute).isDirectory()) {
        let name = path.basename(absolute);
        if (current === "")
          helper(res, name, absolute);
        else
          helper(res, current + "/" + name, absolute);
      } else {
        const basename = path.basename(absolute);
        const fileContents = fs.readFileSync(absolute, 'utf8')

        let id, matterResult, frontMatter;
        if (basename.endsWith(".mdx")) {
          id = basename.replace(/\.mdx$/, "");
          matterResult = await serialize(fileContents, { parseFrontmatter: true });
          frontMatter = matterResult.frontmatter;
        } else if (basename.endsWith(".md")) {
          id = basename.replace(/\.md$/, "");
          matterResult = matter(fileContents);
          frontMatter = matterResult.data;
        }
        res.push({
          path: current === "" ? id : current + "/" + id,
          ...frontMatter
        })
      }
    })
  }
  let res = [];
  await helper(res, "", postsDirectory);
  return res.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1
    } else if (a > b) {
      return -1
    } else {
      return 0
    }
  })
}

export function getAllPostIds() {
  function helper(res, current: string, directory) {
    fs.readdirSync(directory).forEach(async file => {
      const absolute = path.join(directory, file);
      if (fs.statSync(absolute).isDirectory()) {
        let name = path.basename(absolute);
        if (current === "")
          helper(res, name, absolute);
        else
          helper(res, current + "," + name, absolute);
      } else {
        let id: Array<string>;
        let basename = path.basename(absolute);
        let name;
        if (basename.endsWith(".mdx")) {
          name = basename.replace(/\.mdx$/, "");
        } else if (basename.endsWith(".md")) {
          name = basename.replace(/\.md$/, "");
        }
        if (current === "") {
          id = [name];
        } else {
          id = current.split(",")
          id.push(name);
        }

        res.push({
          params: {
            id: id
          }
        });
      }
    });
  }
  let files = [];
  helper(files, "", postsDirectory);
  return files;
}

export async function getPostData(id, type) {
  console.log(id, type)
  const fileRelativePath = id.join("/");
  const fullPath = path.join(postsDirectory, `${fileRelativePath}.${type}`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  const matterResult = matter(fileContents);
  const metadata = matterResult.data;
  let content;

  if (type === "md") {
    content = await remark()
      .use(remarkPrism)
      .use(remarkHtml)
      .process(matterResult.content);
    content = content.toString();
  } else if (type == "mdx") {
    content = await serialize(
      matterResult.content,
      {
        mdxOptions: {
          remarkPlugins: [remarkPrism, remarkMath],
          rehypePlugins: [rehypeKatex]
        }
      });
  }
  return {
    type: type,
    content: content,
    metadata: metadata
  }
}