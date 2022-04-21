import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

export default function handler(req, res) {
  const results = req.query.tag ? searchAllPostContentIncludeTag(req.query.tag) : [];
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ results }));
}


function searchAllPostContentIncludeTag(tag: string) {
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
        let id;
        const basename = path.basename(absolute);
        if (basename.endsWith(".mdx")) {
          id = basename.replace(/\.mdx$/, "");
        } else if (basename.endsWith(".md")) {
          id = basename.replace(/\.md$/, "");
        }
        const fileContents = fs.readFileSync(absolute, 'utf8')
        const analysis = matter(fileContents);
        const metadata = analysis.data;
        let contains = false;
        const tags = metadata.tags;
        for (const item of tags) {
          if (item.includes(tag)) {
            contains = true;
            break;
          }
        }
        if (contains) {
          res.push({
            path: current === "" ? id : current + "/" + id,
            ...metadata
          })
        }
      }
    });
  }
  let searchResult = [];
  const postsDirectory = path.join(process.cwd(), "posts");
  helper(searchResult, "", postsDirectory);
  return searchResult;
}