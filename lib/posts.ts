import fs from "fs";
import path from "path";
import { serialize } from "next-mdx-remote/serialize";
import matter from "gray-matter";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkPrism from "remark-prism";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { remark } from "remark";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
const postsDirectory = path.join(process.cwd(), "posts");

export async function getSortedPostsData() {
  async function helper(res, current: string, directory) {
    fs.readdirSync(directory).forEach(async (file) => {
      const absolute = path.join(directory, file);
      if (fs.statSync(absolute).isDirectory()) {
        let name = path.basename(absolute);
        if (current === "") helper(res, name, absolute);
        else helper(res, current + "/" + name, absolute);
      } else {
        const basename = path.basename(absolute);
        const fileContents = fs.readFileSync(absolute, "utf8");

        let id;
        if (basename.endsWith(".mdx")) {
          id = basename.replace(/\.mdx$/, "");
        } else if (basename.endsWith(".md")) {
          id = basename.replace(/\.md$/, "");
        }
        const matterResult = matter(fileContents);
        const frontMatter = matterResult.data;
        const readTime =
          Math.ceil(matterResult.content.split(" ").length / 200) + "min";
        frontMatter["readTime"] = readTime;

        res.push({
          path: current === "" ? id : current + "/" + id,
          ...frontMatter,
        });
      }
    });
  }
  let res = [];
  await helper(res, "", postsDirectory);
  return res.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1;
    } else if (a > b) {
      return -1;
    } else {
      return 0;
    }
  });
}

export function getAllPostIds() {
  function helper(res, current: string, directory) {
    fs.readdirSync(directory).forEach(async (file) => {
      const absolute = path.join(directory, file);
      if (fs.statSync(absolute).isDirectory()) {
        let name = path.basename(absolute);
        if (current === "") helper(res, name, absolute);
        else helper(res, current + "," + name, absolute);
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
          id = current.split(",");
          id.push(name);
        }
        res.push({
          params: {
            id: id,
          },
        });
      }
    });
  }
  let files = [];
  helper(files, "", postsDirectory);
  return files;
}

export async function getPostData(id) {
  const fileRelativePath = id.join("/");
  const fullMdPath = path.join(postsDirectory, `${fileRelativePath}.md`);
  const fullMdXPath = path.join(postsDirectory, `${fileRelativePath}.mdx`);
  let fileContents, type;
  if (fs.existsSync(fullMdPath)) {
    fileContents = fs.readFileSync(fullMdPath, "utf8");
    type = "md";
  } else if (fs.existsSync(fullMdXPath)) {
    fileContents = fs.readFileSync(fullMdXPath, "utf8");
    type = "mdx";
  } else
    return {
      type: "not exist",
      content: null,
      metadata: null,
    };
  const matterResult = matter(fileContents);
  const metadata = matterResult.data;
  const readTime =
    Math.ceil(matterResult.content.split(" ").length / 200) + "min";
  metadata["readTime"] = readTime;
  let content;

  if (type === "md") {
    content = await remark()
      .use(remarkParse)
      .use(remarkPrism)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeKatex)
      .use(rehypeStringify)
      .process(matterResult.content);
    content = content.toString();
  } else if (type == "mdx") {
    content = await serialize(matterResult.content, {
      mdxOptions: {
        remarkPlugins: [
          remarkPrism,
          remarkMath,
          remarkParse,
          remarkGfm,
          remarkRehype,
        ],
        rehypePlugins: [rehypeKatex, rehypeStringify],
      },
    });
  }
  return {
    type: type,
    content: content,
    metadata: metadata,
  };
}
