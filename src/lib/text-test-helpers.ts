export const invalidTextOptions: [string, unknown][] = [
  ['as', 'h1'], ['tone', 'red'], ['weight', 700], ['align', 'left'], ['whiteSpace', 'nowrap'], ['decoration', 'blink'],
  ['size', null], ['size', 14], ['size', []], ['size', {}], ['size', { base: 'sm', md: 'lg' }],
  ['size', { base: 'xl' }], ['size', { base: 'sm', sm: null }], ['lineHeight', 0], ['lineHeight', -1],
  ['lineHeight', Infinity], ['lineHeight', NaN], ['lineHeight', '1.5'],
  ['lineClamp', 0], ['lineClamp', 1.5], ['lineClamp', Infinity], ['lineClamp', '2'],
  ['inherit', null], ['truncate', 'true'], ['italic', 1],
];
