import { useState } from "react";
import { Button } from "./ui/Button";

const allPrompts = [
  "Tell me about Hritik's experience",
  "What projects has Hritik worked on?",
  "What technologies does Hritik use?",
  "What is Hritik's current role?",
  "Tell me about Hritik's skills",
  "What companies has Hritik worked at?",

  "What is Hritik currently working on?",
  "What kind of developer is Hritik?",
  "What problems does Hritik like solving?",
  "What areas is Hritik strongest in?",
  "What is Hritik focusing on learning now?",

  "Which project best represents Hritik's work?",
  "What was the motivation behind Hritik's projects?",
  "What technical challenges has Hritik written about?",
  "What tools or frameworks does Hritik frequently mention?",
  "What has Hritik built outside of work?",

  "How does Hritik approach system design?",
  "What does Hritik care about in clean architecture?",
  "How does Hritik balance speed vs correctness?",
  "What engineering principles does Hritik follow?",
  "What tradeoffs does Hritik often discuss?",

  "What can you help me with?",
  "Where should I start if I want to explore Hritik's work?",
  "What should I read to understand Hritik's thinking?",
  "Is Hritik more backend or frontend focused?",
  "How can I contact Hritik?",
];

function getRandomPrompts(prompts, count) {
  const shuffled = [...prompts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function ChatPrompts({ onPromptClick }) {
  const [randomPrompts] = useState(() => getRandomPrompts(allPrompts, 3));

  return (
    <div className="mt-2 flex w-full max-w-[200px] flex-col gap-1.5 sm:mt-3 sm:max-w-[250px] sm:gap-2">
      <p className="text-center text-xs text-muted-foreground">Try asking:</p>
      <div className="flex flex-col gap-1 sm:gap-1.5">
        {randomPrompts.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            size="sm"
            onClick={() => onPromptClick(prompt)}
            className="h-auto min-h-[32px] w-full justify-start whitespace-normal break-words px-2 py-1.5 text-left text-xs leading-normal sm:min-h-[36px] sm:px-3 sm:py-2"
          >
            <span className="line-clamp-2">{prompt}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
