export default function BlogPost({ params }: { params: { id: string } }) {
    return (
        <div>
            <h1>Blog {params.id}</h1>
            <p>这里是文章 {params.id} 的内容占位。</p>
        </div>
    );
}

// 可选：预渲染固定的几篇文章（与现有链接对应）
export async function generateStaticParams() {
    return ["1", "2", "3"].map((id) => ({ id }));
}


