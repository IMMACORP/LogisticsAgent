import ReactMarkdown from "react-markdown";

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="prose prose-sm max-w-none break-words prose-headings:font-semibold prose-headings:text-[#1e3a5f] prose-p:leading-7 prose-li:my-0 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-table:block prose-table:max-w-full prose-table:overflow-x-auto">
      <ReactMarkdown
        components={{
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
