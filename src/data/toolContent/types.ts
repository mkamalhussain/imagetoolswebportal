export type ToolStep = {
  title: string;
  text: string;
};

export type ToolFaq = {
  q: string;
  a: string;
};

export type ToolContent = {
  overview: string;
  features: string[];
  steps: ToolStep[];
  useCases: string[];
  faqs: ToolFaq[];
};
