import { getAllPostIds, getPostData } from "../../lib/posts"
import { MDXRemote } from 'next-mdx-remote'
import dynamic from 'next/dynamic';
import Head from "next/head";

const defaultComponents = { Test: dynamic(() => import("../../components/blog/test")) };

export default function Post({ article }) {
    let metadata = article.content.frontmatter;
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
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@vercel" />
                <meta name="twitter:title" content={metadata.title} />
                <meta name="twitter:description" content={metadata.description} />
                <meta name="twitter:image" content={metadata.cardImage} />
                <link
                    href={`https://unpkg.com/prismjs@latest/themes/prism-okaidia.css`}
                    rel="stylesheet"
                />
            </Head>
            <div className="article min-h-screen bg-white w-full h-full flex justify-center">
                <div className="md:w-3/4 w-full pt-40 pl-20 pr-20 ml-flex flex-col items-center">
                    <div className="header"></div>
                    <div className="article-title text-3xl font-bold">
                        {metadata.title}
                    </div>
                    <div className="article-text">
                        <div className="text-sm text-slate-500 mt-2">
                            <span className="me-1">{metadata.date}</span>
                            <span className="me-1">{"·"}</span>
                            <span className="me-1">{"4min"}</span>
                            <span className="me-1">{"·"}</span>
                            <span>{metadata.author}</span>
                        </div>
                    </div>

                    <div className="content bg-white prose prose-neutral pt-10 pb-10">
                        <MDXRemote {...article.content} components={defaultComponents}></MDXRemote>
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