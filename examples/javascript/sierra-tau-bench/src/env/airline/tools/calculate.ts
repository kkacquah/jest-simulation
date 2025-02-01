import { Tool } from '../../../tool';
import { z } from 'zod';

const CalculateParamsSchema = z.object({
  expression: z.string().refine(
    (expr) => /^[0-9+\-*/(). ]+$/.test(expr),
    { message: "Expression can only contain numbers, operators (+, -, *, /), parentheses, and spaces" }
  )
});

type CalculateParams = z.infer<typeof CalculateParamsSchema>;

export class Calculate extends Tool<CalculateParams> {
  name = 'Calculate';
  description = 'Calculate the result of a mathematical expression';
  paramsSchema = CalculateParamsSchema;

  _invoke(dataSchema: any, params: CalculateParams): string {
    try {
      // Create a safe evaluation context
      const evalContext = {
        __proto__: null,
        eval: undefined,
        Function: undefined,
      };

      // Use Function constructor to create a safe evaluation environment
      const safeMath = new Function('expression', `
        with (Math) {
          return eval(expression);
        }
      `).bind(evalContext);

      const result = safeMath(params.expression);
      
      // Round to 2 decimal places
      return (Math.round(result * 100) / 100).toString();
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
}