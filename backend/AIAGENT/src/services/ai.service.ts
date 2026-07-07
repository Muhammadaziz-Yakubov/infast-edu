import { groq } from "../ai/groqClient";
import { SYSTEM_PROMPT } from "../ai/systemPrompt";
import { MessageRepository } from "../database/message.repository";
import { CRMService } from "./crm.service";
import { config } from "../config";
import { logger } from "../utils/logger";

export class AIService {
  private messageRepository: MessageRepository;
  private crmService: CRMService;

  constructor() {
    this.messageRepository = new MessageRepository();
    this.crmService = new CRMService();
  }

  /**
   * Generates a reply using Groq API based on chat history and supports CRM tool calling
   */
  async generateReply(chatId: string, incomingMessageText: string): Promise<string> {
    try {
      // 1. Fetch last 20 messages for context
      const history = await this.messageRepository.getChatHistory(chatId, 20);

      // 2. Format history for Groq Chat Completion
      const messages: any[] = [
        { role: "system", content: SYSTEM_PROMPT },
      ];

      for (const msg of history) {
        messages.push({
          role: msg.direction === "incoming" ? "user" : "assistant",
          content: msg.text,
        });
      }

      // If the incoming message wasn't saved yet, append it manually
      const lastMsgInHistory = history[history.length - 1];
      if (!lastMsgInHistory || lastMsgInHistory.text !== incomingMessageText) {
        messages.push({ role: "user", content: incomingMessageText });
      }

      logger.debug(`Sending ${messages.length} messages in context to Groq for chat: ${chatId}`);

      // Define tool schema
      const tools = [
        {
          type: "function" as const,
          function: {
            name: "add_lead_to_crm",
            description: "Registers a student as a lead in the CRM when they want to enroll in a course. Make sure you have collected their first name, last name, phone number, and interested course name first.",
            parameters: {
              type: "object",
              properties: {
                firstName: {
                  type: "string",
                  description: "The student's first name (ism)",
                },
                lastName: {
                  type: "string",
                  description: "The student's last name (familiya)",
                },
                phone: {
                  type: "string",
                  description: "The student's phone number, e.g. +998901234567",
                },
                courseName: {
                  type: "string",
                  description: "The name of the course the student is enrolling in (e.g. Frontend, Backend, Flutter)",
                },
              },
              required: ["firstName", "lastName", "phone", "courseName"],
            },
          },
        },
        {
          type: "function" as const,
          function: {
            name: "get_student_info",
            description: "Fetches a student's active group name, schedule days, class time, payment history, and next payment due date from the CRM database using their phone number.",
            parameters: {
              type: "object",
              properties: {
                phone: {
                  type: "string",
                  description: "The student's phone number, e.g. +998901234567",
                },
              },
              required: ["phone"],
            },
          },
        },
      ];

      // 3. Request completion from Groq
      let completion = await groq.chat.completions.create({
        messages,
        model: config.GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 500,
        tools,
      });

      let responseMessage = completion.choices[0]?.message;
      if (!responseMessage) {
        throw new Error("Received empty response from Groq API");
      }

      // 4. Handle tool calls if requested by the model
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        logger.info(`Groq requested tool call for chat ${chatId}: ${JSON.stringify(responseMessage.tool_calls)}`);

        // Push the assistant's response (with tool call details) to messages
        messages.push(responseMessage);

        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.function.name === "add_lead_to_crm") {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              logger.info(`Executing add_lead_to_crm with args: ${JSON.stringify(args)}`);

              // Register the lead in the CRM
              const result = await this.crmService.addCrmLead(
                args.firstName,
                args.lastName,
                args.phone,
                args.courseName,
                chatId
              );

              // Append tool response
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: toolCall.function.name,
                content: JSON.stringify(result),
              });
            } catch (err) {
              logger.error(`Failed to parse or execute tool call: ${err}`);
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: toolCall.function.name,
                content: JSON.stringify({ success: false, error: String(err) }),
              });
            }
          } else if (toolCall.function.name === "get_student_info") {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              logger.info(`Executing get_student_info with args: ${JSON.stringify(args)}`);

              const result = await this.crmService.getStudentDataByPhone(args.phone);

              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: toolCall.function.name,
                content: JSON.stringify(result),
              });
            } catch (err) {
              logger.error(`Failed to execute get_student_info tool call: ${err}`);
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                name: toolCall.function.name,
                content: JSON.stringify({ success: false, error: String(err) }),
              });
            }
          }
        }

        // Get final reply from Groq after tool results are added
        completion = await groq.chat.completions.create({
          messages,
          model: config.GROQ_MODEL,
          temperature: 0.3,
          max_tokens: 500,
        });

        responseMessage = completion.choices[0]?.message;
      }

      const reply = responseMessage?.content?.trim() || "";

      if (!reply) {
        throw new Error("Received empty final response from Groq API");
      }

      logger.info(`AI Response generated successfully for chat ${chatId}`);
      logger.debug(`Generated Reply: "${reply}"`);

      return reply;
    } catch (error) {
      logger.error(`Error in AIService.generateReply for chat ${chatId}: ${error}`);
      return "Bu haqida aniq ma'lumotim yo'q, Muhammadazizning o'zi javob beradi.";
    }
  }
}
