"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "typescript" }: CodeBlockProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark" || theme === "dark";

  // Custom styles matching our grayscale design
  const customDarkStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: "hsl(0 0% 10%)",
      margin: 0,
      padding: "1rem",
      borderRadius: "0.5rem",
      fontSize: "0.75rem",
      lineHeight: "1.5",
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: "transparent",
      fontSize: "0.75rem",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
  };

  const customLightStyle = {
    ...oneLight,
    'pre[class*="language-"]': {
      ...oneLight['pre[class*="language-"]'],
      background: "hsl(0 0% 96%)",
      margin: 0,
      padding: "1rem",
      borderRadius: "0.5rem",
      fontSize: "0.75rem",
      lineHeight: "1.5",
    },
    'code[class*="language-"]': {
      ...oneLight['code[class*="language-"]'],
      background: "transparent",
      fontSize: "0.75rem",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
  };

  return (
    <SyntaxHighlighter
      language={language}
      style={isDark ? customDarkStyle : customLightStyle}
      showLineNumbers={false}
      wrapLines={false}
      customStyle={{
        margin: 0,
        background: isDark ? "hsl(0 0% 10%)" : "hsl(0 0% 96%)",
        borderRadius: "0.5rem",
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
