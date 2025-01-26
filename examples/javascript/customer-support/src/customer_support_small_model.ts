import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { StateAnnotation, StateType } from "./nodes/SupportNode";
import { InitialSupportNode } from "./nodes/InitialSupportNode";
import { BillingSupportNode } from "./nodes/BillingSupportNode";
import { TechnicalSupportNode } from "./nodes/TechnicalSupportNode";
import { RefundHandler } from "./nodes/RefundHandler";
import { RunnableConfig } from "@langchain/core/runnables";

// Create a memory saver for checkpointing
const checkpointer = new MemorySaver();

// Initialize the model
const model = new ChatTogetherAI({
  model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
  temperature: 0,
});

// Initialize nodes
const initialSupport = new InitialSupportNode(model);
const billingSupport = new BillingSupportNode(model);
const technicalSupport = new TechnicalSupportNode(model);
const refundHandler = new RefundHandler();

// Build the graph
const builder = new StateGraph(StateAnnotation)
  .addNode("initial_support", async (state: StateType) => new InitialSupportNode(model).handle(state))
  .addNode("billing_support", async (state: StateType) => new BillingSupportNode(model).handle(state))
  .addNode("technical_support", async (state: StateType) => new TechnicalSupportNode(model).handle(state))
  .addNode("handle_refund", async (state: StateType) => new RefundHandler().handle(state))
  .addEdge("__start__", "initial_support");

// Add conditional edges for initial support routing
builder.addConditionalEdges("initial_support", async (state) => {
  if (state.nextRepresentative.includes("BILLING")) {
    return "billing";
  } else if (state.nextRepresentative.includes("TECHNICAL")) {
    return "technical";
  } else {
    return "conversational";
  }
}, {
  billing: "billing_support",
  technical: "technical_support",
  conversational: "__end__",
});

// Add edges for technical support and billing support
builder
  .addEdge("technical_support", "__end__")
  .addConditionalEdges("billing_support", async (state) => {
    if (state.nextRepresentative.includes("REFUND")) {
      return "refund";
    } else {
      return "__end__";
    }
  }, {
    refund: "handle_refund",
    __end__: "__end__",
  })
  .addEdge("handle_refund", "__end__");

// Compile the graph
const graph = builder.compile({
  checkpointer,
});

export const app = {
  invoke: async (messages: Array<{ role: string; content: string }>) => {
    const inputs = {
      messages,
      nextRepresentative: "",
      refundAuthorized: false
    };
    
    const config: RunnableConfig = {
      configurable: {
        thread_id: `support-conversation-${Date.now()}`
      },
      tags: ["customer-support"],
      metadata: {
        conversation_id: `conv-${Date.now()}`,
        conversation_type: "customer_support"
      }
    };
    
    return await graph.invoke(inputs, config);
  }
};
