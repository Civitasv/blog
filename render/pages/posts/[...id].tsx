import { useEffect } from "react";
import { getAllPostIds, getPostData } from "../../lib/posts"
import Prism from 'prismjs';

export default function Post({ article }) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log("HIGHLIGHT")
            Prism.highlightAll();
        }
    }, []);
    return (
        <>
            <div className="article min-h-screen bg-white w-full h-full flex justify-center">
                <div className="md:w-3/4 w-full pt-40 pl-20 pr-20 ml-flex flex-col items-center">
                    <div className="header"></div>
                    <div className="article-title text-3xl font-bold">
                        {article.title}
                    </div>
                    <div className="article-text">
                        <div className="text-sm text-slate-500 mt-2">
                            <span className="me-1">{article.date}</span>
                            <span className="me-1">{"·"}</span>
                            <span className="me-1">{"4min"}</span>
                            <span className="me-1">{"·"}</span>
                            <span>{article.author}</span>
                        </div>
                    </div>

                    <div className="content bg-white prose prose-neutral">
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
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