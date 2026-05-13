import { getChatHistory } from "@/lib/db";

export default async function ChatHistory() {
  const messages = await getChatHistory();

  return (
    <div className="space-y-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
}