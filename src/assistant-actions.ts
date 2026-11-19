export const assistantSections = {
  summary: "الملخص المهني",
  experience: "الخبرات",
  projects: "المشاريع",
  skills: "المهارات",
  education: "التعليم",
  courses: "الدورات",
} as const;

export type AssistantAction = "chat" | "improve" | "translate-ar" | "translate-en";
export type AssistantSection = keyof typeof assistantSections;
