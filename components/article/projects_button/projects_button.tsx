import Link from "next/link";

export default function ProjectsButton() {
  function projectsPage() {}
  return (
    <>
      {/* When this button is clicked, goto `Projects` page */}
      <Link href="/projects" passHref>
        <button
          className="rounded bg-black p-1 pl-2 pr-2 text-white"
          onClick={projectsPage}
        >
          Projects
        </button>
      </Link>
    </>
  );
}
