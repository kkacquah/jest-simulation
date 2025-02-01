import { DataSchema } from './env/airline/dataSchema/DataSchema';
import { tasks } from './env/airline/tasks/tasks';
import { AllTools } from './env/airline/tools';

/**
 * TaskVerifier is responsible for verifying that tasks can be executed correctly against the DataSchema.
 * It takes tasks defined in tasks.ts (like the one at L47-77 about omar_davis_3817 downgrading business flights)
 * and maps their "actions" to the corresponding tools in the tools directory.
 * 
 * For example, an action like:
 * {
 *   "name": "update_reservation_flights",
 *   "arguments": {
 *     "reservation_id": "JG7FMM",
 *     "cabin": "economy",
 *     ...
 *   }
 * }
 * 
 * Would map to the UpdateReservationFlights tool and execute it with the provided arguments.
 */

interface TaskAction {
  name: string;
  arguments: Record<string, any>;
}

interface Task {
  user_id: string;
  instruction: string;
  actions: TaskAction[];
}

export class TaskVerifier {
  private tools: Record<string, new () => any>;
  private dataSchema: DataSchema;

  constructor(dataSchema: DataSchema) {
    this.dataSchema = dataSchema;
    // Create a mapping of action names to tool classes
    this.tools = Object.fromEntries(
      AllTools.map(Tool => {
        const instance = new Tool();
        return [instance.name.toLowerCase(), Tool];
      })
    );
  }

  /**
   * Verify a single task by executing all its actions in sequence
   */
  async verifyTask(task: Task): Promise<{
    success: boolean;
    error?: string;
    dataHash?: string;
  }> {
    try {
      for (const action of task.actions) {
        const ToolClass = this.tools[action.name.toLowerCase()];
        if (!ToolClass) {
          throw new Error(`No tool found for action: ${action.name}`);
        }

        const tool = new ToolClass();
        await tool.invoke(this.dataSchema, action.arguments);
      }

      return {
        success: true,
        dataHash: this.dataSchema.getDataHash()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Verify a specific task from the tasks array by index
   */
  async verifyTaskByIndex(taskIndex: number) {
    const task = tasks[taskIndex];
    if (!task) {
      throw new Error(`No task found at index ${taskIndex}`);
    }
    return this.verifyTask(task);
  }

  /**
   * Verify all tasks in sequence
   */
  async verifyAllTasks() {
    const results: Record<number, {
      success: boolean;
      error?: string;
      dataHash?: string;
    }> = {};

    for (let i = 0; i < tasks.length; i++) {
      results[i] = await this.verifyTask(tasks[i]);
    }

    return results;
  }
}