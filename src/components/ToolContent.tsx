import Link from "next/link";
import type { ToolContent } from "@/data/toolContent/types";

type Props = {
  content: ToolContent;
  toolTitle: string;
  guidePath: string;
};

export default function ToolContent({ content, toolTitle, guidePath }: Props) {
  return (
    <div className="max-w-4xl mx-auto mt-12 space-y-12">
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          About {toolTitle}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {content.overview}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Key Features
        </h2>
        <ul className="grid sm:grid-cols-2 gap-3">
          {content.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
            >
              <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">
                &#10003;
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          How to Use {toolTitle}
        </h2>
        <ol className="space-y-4">
          {content.steps.map((step, i) => (
            <li key={step.title} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6">
          <Link
            href={guidePath}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Read the complete step-by-step guide with screenshots and pro tips
          </Link>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Common Use Cases
        </h2>
        <ul className="space-y-2">
          {content.useCases.map((useCase) => (
            <li
              key={useCase}
              className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
            >
              <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">
                &#8226;
              </span>
              <span>{useCase}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-5">
          {content.faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {faq.q}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
