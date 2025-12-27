import xss from 'xss';

const options = {
  whiteList: {
    p: [],
    br: [],
    strong: [],
    em: [],
    u: [],
    h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
    ul: [], ol: [], li: [],
    a: ['href', 'title'],
    code: [],
    pre: [],
    blockquote: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'],
};

export function sanitizeHtml(html: string): string {
  return xss(html, options);
}

export function sanitizeInput(input: string): string {
  // Remove potential XSS and SQL injection patterns
  return sanitizeHtml(input)
    .replace(/['";\\]/g, '')
    .trim();
}

