import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts');

interface Article {
  title: string,
  date: string,
  outline: string,
  author: string,
}

export function getSortedPostsData() {
  function helper(res, current: string, directory) {
    fs.readdirSync(directory).forEach(file => {
      const absolute = path.join(directory, file);
      if (fs.statSync(absolute).isDirectory()) {
        let name = path.basename(absolute);
        if (current === "")
          helper(res, name, absolute);
        else
          helper(res, current + "/" + name, absolute);
      } else {
        const id = path.basename(absolute).replace(/\.md$/, '')
        const fileContents = fs.readFileSync(absolute, 'utf8')
        const matterResult = matter(fileContents);
        res.push({
          path: current === "" ? id : current + "/" + id,
          ...(matterResult.data as Article)
        })
      }
    })
  }
  let res = [];
  helper(res, "", postsDirectory);
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
          id = [path.basename(absolute).replace(/\.md$/, "")];
        } else {
          id = current.split(",")
          id.push(path.basename(absolute).replace(/\.md$/, ''));
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
  const fullPath = path.join(postsDirectory, `${fileRelativePath}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  const matterResult = matter(fileContents)

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const content = processedContent.toString();
  return {
    id,
    content,
    ...(matterResult.data as Article)
  }
}