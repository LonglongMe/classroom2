import Link from "next/link";
export default function Blog() {
    return (
        <>
        <div>
            <h1>Blog</h1>
        </div>
        <div>
            <Link href="/blog/1">Blog 1</Link>
            <Link href="/blog/2">Blog 2</Link>
            <Link href="/blog/3">Blog 3</Link>
        </div>
        </>
    )
}