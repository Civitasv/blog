import fs from 'fs'
import path from 'path'
import { serialize } from 'next-mdx-remote/serialize'

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
        const id = path.basename(absolute).replace(/\.mdx$/, '')
        const fileContents = fs.readFileSync(absolute, 'utf8')
        const matterResult = await serialize(fileContents, { parseFrontmatter: true });
        res.push({
          path: current === "" ? id : current + "/" + id,
          ...matterResult.frontmatter
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
    fs.readdirSync(directory).forEach(file => {
      const absolute = path.join(directory, file);
      if (fs.statSync(absolute).isDirectory()) {
        let name = path.basename(absolute);
        if (current === "")
          helper(res, name, absolute);
        else
          helper(res, current + "," + name, absolute);
      } else {
        let id: Array<string>;
        if (current === "") {
          id = [path.basename(absolute).replace(/\.mdx$/, "")];
        } else {
          id = current.split(",")
          id.push(path.basename(absolute).replace(/\.mdx$/, ''));
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

export async function getPostData(id) {
  const fileRelativePath = id.join("/");
  const fullPath = path.join(postsDirectory, `${fileRelativePath}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  const content = await serialize(fileContents, { parseFrontmatter: true });
  return {
    id,
    content
  }
}