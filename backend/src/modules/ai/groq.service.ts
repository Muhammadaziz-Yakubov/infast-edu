import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class GroqService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly defaultModel = 'llama-3.3-70b-versatile';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GROQ_API_KEY') || '';
  }

  async getChatCompletionStream(
    messages: { role: string; content: string }[],
    res: Response,
    model?: string,
    onComplete?: (fullContent: string) => void | Promise<void>,
    isJson = false,
  ): Promise<void> {
    if (!this.apiKey) {
      throw new InternalServerErrorException('GROQ_API_KEY is not configured in .env');
    }

    try {
      const requestBody: any = {
        model: model || this.defaultModel,
        messages,
        temperature: 0.2,
        stream: true,
      };
      if (isJson) {
        requestBody.response_format = { type: 'json_object' };
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new InternalServerErrorException(`Groq API error: ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new InternalServerErrorException('Failed to read response body from Groq API');
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === 'data: [DONE]') {
            res.write('data: [DONE]\n\n');
            continue;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const jsonStr = trimmed.slice(6);
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch (err) {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }

      if (onComplete) {
        try {
          await Promise.resolve(onComplete(fullContent));
        } catch (err) {
          console.error('[GroqService] Error in onComplete callback:', err.message);
        }
      }

      res.end();
    } catch (error) {
      console.error('[GroqService] Error:', error.message);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}
