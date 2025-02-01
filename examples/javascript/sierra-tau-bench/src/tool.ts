import { z } from 'zod';
import { DataSchema } from './env/airline/dataSchema/DataSchema';

export abstract class Tool<TParams extends any> {
    abstract paramsSchema: z.ZodSchema<TParams>;
    abstract name: string;
    abstract description: string;

    invoke(dataSchema: DataSchema, params: TParams): any {
        const validatedParams = this.paramsSchema.parse(params);
        return this._invoke(dataSchema, validatedParams);
    }

    abstract _invoke(dataSchema: DataSchema, params: TParams): any;

    getInfo(): {
        name: string;
        description: string;
        parameters: z.ZodSchema<TParams>;
    } {
        return {
            name: this.name,
            description: this.description,
            parameters: this.paramsSchema
        };
    }
}
