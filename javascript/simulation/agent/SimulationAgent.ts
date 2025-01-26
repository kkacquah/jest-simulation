import { EventEmitter } from 'events';
import { AgentConversationGenerator, ConversationMessage } from './conversationGenerators/BaseConversationGenerator';
import { SimulationLogger } from './logger';
import { DeterministicConversationGenerator } from './conversationGenerators/DeterministicConversationGenerator';

export interface SimulationAgentState {
  // The current turn of the simulation
  currentTurn: number;
  // The last input received from the user
  isComplete: boolean;
  // The last response generated by the agent
  lastAgentResponse: ConversationMessage | null;
  lastSimulationAgentResponse: ConversationMessage | null;
}

export type GetAgentResponseFunction = (state: SimulationAgentState) => Promise<ConversationMessage> | ConversationMessage;

export interface AgentConstructorArgs {
  getAgentResponse: GetAgentResponseFunction;
  conversationGenerator: AgentConversationGenerator;
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
export const DEFAULT_MAX_TURNS = 10;

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
  public state: SimulationAgentState | null = null;
  private getAgentResponse: GetAgentResponseFunction;
  private maxTurns: number;
  private conversationGenerator: AgentConversationGenerator;
  private logger: SimulationLogger;
  public events: AgentEventEmitter;

  constructor(args: AgentConstructorArgs) {
    super();
    this.getAgentResponse = args.getAgentResponse;
    this.maxTurns = args.maxTurns || DEFAULT_MAX_TURNS;
    this.conversationGenerator = args.conversationGenerator
    this.logger = new SimulationLogger(args.debug);
    this.events = new AgentEventEmitter();

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

  private setState(newState: SimulationAgentState) {
    this.state = newState;
    return this.state;
  }

  async initialize(): Promise<void> {
    
    this.conversationGenerator.initialize();
    await this.emit(SimulationEvents.INITIALIZED, this.state!);
    this.setState({ 
      lastAgentResponse: null,
      lastSimulationAgentResponse: null,
      currentTurn: 0,
      isComplete: false
    });
    await this.nextTurn();
  }

  async nextTurn(): Promise<SimulationAgentState> {
    // Check if the agent state is initialized
    if (!this.state) {
      throw new Error('Agent state is not initialized.');
    }
    // Check if the simulation is already complete
    if (this.state.isComplete) {
      return this.state;
    }
    // Emit the TURN_START event
    await this.emit(SimulationEvents.TURN_START, this.state);
    
    // Get input for the current turn using the inputFn
    const agentResponse = await this.getAgentResponse(this.state);
    // Update the state with the new input
    this.setState({ ...this.state, lastAgentResponse: agentResponse, currentTurn: this.state.currentTurn });
    // Log the user's input
    this.logger.logConversation('AGENT', agentResponse.content);

    // Generate a response using the conversation generator
    const response = await this.conversationGenerator.generateResponse(agentResponse);
    // Update the state with the new response and turn information
    this.setState({ 
      lastSimulationAgentResponse: response,
      lastAgentResponse: agentResponse,
      currentTurn: this.state.currentTurn + 1,
      isComplete: (this.state.currentTurn + 1) >= this.maxTurns
    });
    // Log the agent's response
    this.logger.logConversation('USER', response.content);
    // Emit the TURN_END event
    await this.emit(SimulationEvents.TURN_END, this.state);

    // Check if the simulation is now complete
    if (this.state.isComplete) {
      // Log the completion of the simulation
      this.logger.debug('Simulation complete');
      // Emit the COMPLETE event
      await this.emit(SimulationEvents.COMPLETE, this.state);
    }
    return { ...this.state };
  }
}
