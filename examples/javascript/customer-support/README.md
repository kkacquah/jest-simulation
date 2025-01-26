# Customer Support Small Model

A small customer support chatbot implementation using LangGraph.js. This chatbot can handle various customer inquiries including refunds and technical support.

## Features

- Initial support triage
- Billing support with refund handling
- Technical support
- State management using LangGraph
- Authorization checks for refunds

## Installation

```bash
pnpm install
```

## Usage

```typescript
import { customerSupportGraph } from 'customer-support-small';

const initialState = {
  messages: [{ role: 'user', content: 'I need help with my computer' }],
  nextRepresentative: '',
  refundAuthorized: false
};

const result = await customerSupportGraph.invoke(initialState);
```

## Development

1. Build the project:
```bash
pnpm build
```

2. Run tests:
```bash
pnpm test
```

## Environment Variables

Make sure to set the following environment variable:
- `TOGETHER_AI_API_KEY`: Your Together AI API key for model access

## License

MIT
