const visit = require('unist-util-visit');

module.exports = function remarkMermaidZoom() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'mermaid' && parent && typeof index === 'number') {
        const code = node.value;
        const importNode = {
          type: 'mdxJsxFlowElement',
          name: 'Mermaid',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'code',
              value: {
                type: 'mdxJsxTextualValue',
                value: '`' + code + '`',
              },
            },
          ],
        };
        parent.children.splice(index, 1, importNode);
      }
    });
  };
};