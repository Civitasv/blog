import Link from "next/link";

export default function Item({ article }) {
    return (
        <Link href={`/posts/${article.path}`} passHref>
            <div className="cursor-pointer bg-white rounded-md 
                            min-h-fit md:w-1/2 w-full mb-3 mt-3
                            flex items-center p-6 hover:scale-95">
                <div className="article">
                    <div className="article-title text-lg font-bold">
                        {article.title}
                    </div>
                    <div className="article-text">
                        <p className="text-sm text-slate-500">
                            {article.outline}
                        </p>
                        <div className="text-sm text-slate-500 mt-2">
                            <span className="me-1">{article.date}</span>
                            <span className="me-1">{"·"}</span>
                            <span className="me-1">{article.read_time}</span>
                            <span className="me-1">{"·"}</span>
                            <span>{article.author}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}