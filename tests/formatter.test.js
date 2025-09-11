const FormatterService = require('../src/services/FormatterService');

describe('FormatterService', () => {
  let formatterService;

  beforeEach(() => {
    formatterService = new FormatterService();
  });

  it('should format JavaScript code correctly', async () => {
    const code = 'function hello(){console.log("hello world")}';
    const formattedCode = await formatterService.format(code, 'javascript', false);
    const expectedCode = `function hello() {
  console.log("hello world")
}`;
    expect(formattedCode).toBe(expectedCode);
  });
});
