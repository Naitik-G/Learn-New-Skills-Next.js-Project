'use client';

import { useParams } from 'next/navigation';
import { topicsData } from '@/data/topicsData';

export default function DialoguePage() {
  const params = useParams();
  const topicId = params?.id as string;

  const topic = topicsData[topicId];

  if (!topic) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold">Topic not found</h2>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">{topic.title}</h1>
        <div className="space-y-4">
          {topic.conversation.map((line, idx) => (
            <p key={idx} className="text-lg">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
