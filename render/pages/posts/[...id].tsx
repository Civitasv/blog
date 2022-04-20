import { getAllPostIds, getPostData } from "../../lib/posts"
import { MDXRemote } from 'next-mdx-remote'
import dynamic from 'next/dynamic';
import Head from "next/head";

const defaultComponents = { Test: dynamic(() => import("../../components/blog/test")) };

export default function Post({ article }) {
    let metadata = article.metadata;
    let type = article.type;
    let content = article.content;
    if (metadata === null || content === null)
        return (
            <div className="prose">
                Sadly, Nothing here~
            </div>
        )
    return (
        <>
            <Head>
                <title>{metadata.title}</title>
                <meta charSet="utf-8" />
                <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
                <meta content="width=device-width, initial-scale=1" name="viewport" />
                <meta name="robots" content="follow, index" />
                <link href="/favicon.ico" rel="shortcut icon" />
                <meta content={metadata.description} name="description" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={metadata.title} />
                <meta property="og:description" content={metadata.description} />
                <meta property="og:title" content={metadata.title} />
                <meta property="og:image" content={metadata.cardImage} />
                <link
                    href={`https://unpkg.com/prismjs@latest/themes/prism-okaidia.css`}
                    rel="stylesheet"
                />
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.15.0/dist/katex.min.css" />
            </Head>
            <div className="min-h-screen bg-white w-full h-full">
                <div className="w-full pt-40 pl-10 pr-10 flex flex-col justify-center items-center">
                    <div className="article md:w-1/2 w-full max-w-fit bg-white prose prose-neutral pt-10 pb-10">
                        <div className="header">
                            <div className="article-title text-3xl font-bold">
                                {metadata.title}
                            </div>
                            <div className="article-text">
                                <div className="text-sm text-slate-500 mt-2">
                                    <span className="me-1">{metadata.date}</span>
                                    <span className="me-1">{" · "}</span>
                                    <span className="me-1">{metadata.readTime}</span>
                                    <span className="me-1">{" · "}</span>
                                    <span>{metadata.author}</span>
                                </div>
                            </div>
                        </div>
                        {
                            (type === "mdx")
                                ? <MDXRemote {...article.content} components={defaultComponents}></MDXRemote>
                                : <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        }
                    </div>
                </div>
            </div >
        </>
    )
}

export async function getStaticPaths() {
    const paths = getAllPostIds();
    return {
        paths,
        fallback: false
    }
}

export async function getStaticProps({ params }) {
    const article = await getPostData(params.id);
    return {
        props: {
            article
        }
    }
}