import Link from "next/link";

export default function Projects() {
  const projects = [
    {
      name: "CMake Tools for Neovim",
      summary: "CMake integration in Neovim",
      repo: "https://github.com/Civitasv/cmake-tools.nvim",
      img: "",
      video: "",
    },
    {
      name: "RuNvim",
      summary: "Beautiful, fast, functional Configuration for Neovim.",
      repo: "https://github.com/Civitasv/runvim",
      img: "",
      video: "",
    },
    {
      name: "AMapPoi",
      summary: "POI搜索工具、地理编码工具",
      repo: "https://github.com/Civitasv/AMapPoi.nvim",
      img: "",
      video: "",
    },
    {
      name: "asciichart",
      summary: "Nice-looking lightweight console ASCII line charts, using C++, no dependencies.",
      repo: "https://github.com/Civitasv/asciichart",
      img: "",
      video: "",
    },
    {
      name: "Mini JSON Parser",
      summary: "A Tiny Json Parser",
      repo: "https://github.com/Civitasv/mini-json-parser",
      img: "",
      video: "",
    }
  ];
  return (
    <>
      <main className="flex flex-col items-center mt-40 justify-center">
        {projects.map((item, index) => {
          return (
            <div
              key={index}
              className="
          cursor-pointer bg-white rounded-md 
                            min-h-fit md:w-1/2 w-full mb-3 mt-3
                            flex items-center p-6
          "
            >
              <div className="project">
                <div className="name text-lg font-bold">{item.name}</div>
                <div className="summary text-sm text-slate-500">
                  {item.summary}
                </div>
                <Link href={item.repo} passHref>
                  <p className="repo text-sm text-slate-500">{item.repo}</p>
                </Link>
                <div className="img">{item.img}</div>
                <div className="video">{item.video}</div>
              </div>
            </div>
          );
        })}
      </main>
    </>
  );
}
