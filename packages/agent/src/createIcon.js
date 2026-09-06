/** Escape a value for safe embedding inside an HTML/SVG attribute. */
const escAttr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Factory that builds an icon function returning an SVG element.
 * @param {string} displayName  PascalCase icon name
 * @param {string|{code: string}} iconCode SVG inner code string
 * @returns {function(import('./createIcon').IconOptions=): SVGSVGElement}
 */
const createIcon = (displayName, iconCode) => {
  const codeString = typeof iconCode === 'object' ? (iconCode.code || '') : (iconCode || '');

  /**
   * Create an SVG element for this icon.
   * @param {import('./createIcon').IconOptions} [options]
   * @returns {SVGSVGElement}
   */
  const icon = (options = {}) => {
    const {
      color,
      size = 24,
      strokeWidth,
      className,
      attrs = {},
    } = options;

    let html = codeString;

    if (strokeWidth != null) {
      html = html.replace(/stroke-width="[^"]*"/g, 'stroke-width="' + strokeWidth + '"');
    }

    if (typeof document === 'undefined') {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('reicon-agent: document is not defined when rendering icon "' + displayName + '". Use toSvg() for Server-Side Rendering (SSR).');
      }
      return null;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('class', className ? 'reicon-agent ' + className : 'reicon-agent');
    if (color != null) svg.style.color = color;

    for (const [k, v] of Object.entries(attrs)) {
      svg.setAttribute(k, String(v));
    }

    svg.innerHTML = html;
    return svg;
  };

  icon.displayName = displayName;
  icon.iconCode = codeString;

  /**
   * Returns the SVG markup as a string (useful for SSR or innerHTML).
   * @param {import('./createIcon').IconOptions} [options]
   * @returns {string}
   */
  icon.toSvg = (options = {}) => {
    const {
      color,
      size = 24,
      strokeWidth,
      className,
      attrs = {},
    } = options;

    let html = codeString;

    if (strokeWidth != null) {
      html = html.replace(/stroke-width="[^"]*"/g, 'stroke-width="' + strokeWidth + '"');
    }

    const extraAttrs = Object.entries(attrs)
      .map(([k, v]) => `${escAttr(k)}="${escAttr(v)}"`)
      .join(' ');

    const colorStyle = color != null ? ` style="color: ${escAttr(color)}"` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${escAttr(size)}" height="${escAttr(size)}" viewBox="0 0 24 24" fill="none" class="${escAttr(className ? 'reicon-agent ' + className : 'reicon-agent')}"${colorStyle}${extraAttrs ? ' ' + extraAttrs : ''}>${html}</svg>`;
  };

  return icon;
};

export { createIcon };
export default createIcon;
