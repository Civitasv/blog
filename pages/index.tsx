import Head from "next/head";
import { getSortedPostsData } from "../lib/posts";
import Item from "../components/article/item";
import Search from "../components/article/search/search";
import Tag from "../components/article/search/tag";

export default function Home({ allPostsData }) {
  return (
    <div className="pl-5 pr-5">
      <Head>
        <title>{"Civitasv's Blog"}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <div className="flex flex-col justify-center items-center">
          <div className="tools md:w-1/2 w-full mt-5 pr-6 pl-6 flex justify-end">
            <div className="tag mr-3">
              <Tag></Tag>
            </div>
            <div className="search">
              <Search></Search>
            </div>
          </div>
          <div className="md:w-1/2 w-full mt-40">
            <div className="introduction">
              <div className="introduction-title text-4xl font-semibold">
                {"Hello there"}
              </div>
              <div className="introduction-text">
                <div className="text-sm text-slate-500 mt-5">
                  {"This is Civitasv"}
                </div>
                <div className="mt-5 w-6 h-6">
                  <a
                    href="https://github.com/Civitasv"
                    title="github"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex flex-col items-center mt-40 justify-center">
        {allPostsData.map((article) => (
          <Item article={article} key={article.path} />
        ))}
      </main>

      <footer></footer>
    </div>
  );
}

export async function getStaticProps() {
  const allPostsData = await getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}
