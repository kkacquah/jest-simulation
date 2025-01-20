import { EventEmitter } from 'events';
import { AgentConversationGenerator, ConversationMessage, FakeConversationGenerator } from './AgentConversationGenerator';
import { SimulationLogger } from './logger';

export interface SimulationAgentState {
  initialized: boolean;
  currentTurn: number;
  isComplete: boolean;
  lastInput?: ConversationMessage;
  lastResponse?: ConversationMessage;
  [key: string]: unknown;
}

export type InputFunction = (turn: number) => Promise<ConversationMessage> | ConversationMessage;

export interface AgentConstructorArgs {
  role: string;
  task: string;
  inputFn: InputFunction;
  generator?: AgentConversationGenerator;
  maxTurns?: number;
  debug?: boolean;
}

export const SimulationEvents = {
  INITIALIZED: 'initialized',
  TURN_START: 'turnStart',
  TURN_END: 'turnEnd',
  COMPLETE: 'complete'
} as const;

export type SimulationEventType = typeof SimulationEvents[keyof typeof SimulationEvents];
type SimulationEventHandler = (state: SimulationAgentState) => Promise<void>;

class TypedEventEmitter extends EventEmitter {
  on(event: SimulationEventType, listener: SimulationEventHandler): this {
    return super.on(event, listener);
  }

  emit(event: SimulationEventType, state: SimulationAgentState): boolean {
    return super.emit(event, state);
  }
}

export class AgentEventEmitter extends TypedEventEmitter {
  constructor() {
    super();
  }
}

/**
 * Default maximum number of turns for a simulation
 */
export const DEFAULT_MAX_TURNS = 50;

const agentResponses: ConversationMessage[] = [
  { role: 'assistant', content: 'Hello! How can I help you today?' },
  { role: 'assistant', content: 'Jest is a JavaScript testing framework.' },
  { role: 'assistant', content: 'Here are the basic steps for writing tests...' },
  { role: 'assistant', content: 'You\'re welcome!' },
  { role: 'assistant', content: 'Goodbye! Have a great day!' }
];

/**
 * SimulationAgent is the core simulation engine that processes turns and emits events.
 * It uses an AgentConversationGenerator to generate responses for each turn.
 * 
 * Events:
 * - initialized: Emitted when the agent is first initialized
 * - turnStart: Emitted before processing each turn
 * - turnEnd: Emitted after processing each turn
 * - complete: Emitted when the simulation reaches its maximum turns
 * 
 * Each event handler receives the current agent state and can perform async operations.
 * The agent will wait for all event handlers to complete before proceeding.
 */
export class SimulationAgent extends TypedEventEmitter {
  role: string;
  task: string;
  state: SimulationAgentState;
  private inputFn: InputFunction;
  private maxTurns: number;
  private generator: AgentConversationGenerator;
  private logger: SimulationLogger;
  public events: AgentEventEmitter;

  constructor(args: AgentConstructorArgs) {
    super();
    this.role = args.role;
    this.task = args.task;
    this.inputFn = args.inputFn;
    this.maxTurns = args.maxTurns || DEFAULT_MAX_TURNS;
    this.generator = args.generator || new FakeConversationGenerator(agentResponses);
    this.logger = new SimulationLogger(args.debug);
    this.events = new AgentEventEmitter();

    this.state = {
      initialized: false,
      currentTurn: 0,
      isComplete: false
    };

    // Forward all events to the dedicated event emitter
    this.on(SimulationEvents.INITIALIZED, async(state) => {
      this.events.emit(SimulationEvents.INITIALIZED, state);
    });
    this.on(SimulationEvents.TURN_START, async(state) => {
      this.events.emit(SimulationEvents.TURN_START, state);
    });
    this.on(SimulationEvents.TURN_END, async(state) => {
      this.events.emit(SimulationEvents.TURN_END, state);
    });
    this.on(SimulationEvents.COMPLETE, async(state) => {
      this.events.emit(SimulationEvents.COMPLETE, state);
    });
  }

  async initialize(): Promise<void> {
    this.state.initialized = true;
    await this.emit(SimulationEvents.INITIALIZED, this.state);
  }

  async nextTurn(): Promise<void> {
    if (this.state.isComplete) {
      return;
    }

    await this.emit(SimulationEvents.TURN_START, this.state);

    const input = await this.inputFn(this.state.currentTurn);
    this.state.lastInput = input;
    this.logger.logConversation('USER', input.content);

    const response = await this.generator.generateResponse(input);
    this.state.lastResponse = response;
    this.logger.logConversation('AGENT', response.content);

    this.state.currentTurn++;
    this.state.isComplete = this.state.currentTurn >= this.maxTurns;

    await this.emit(SimulationEvents.TURN_END, this.state);

    if (this.state.isComplete) {
      await this.emit(SimulationEvents.COMPLETE, this.state);
    }
  }
}
