
import { NextResponse } from 'next/server';
import { GoogleGenAI, Part } from "@google/genai";
import { Agent as AgentType, AgentSettings, ChatMessage } from '../../../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function youtubeSearch(query: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Use Google Search to find YouTube videos about "${query}". Return a summary of the top 3 results including title, channel, and a brief description. Format the response as a single, readable string.`,
            config: { tools: [{ googleSearch: {} }] },
        });
        return response.text ?? "I couldn't find any information on that topic.";
    } catch (error) {
        console.error("Error in youtubeSearch tool:", error);
        return "Sorry, I was unable to perform the search.";
    }
}

const availableTools: { [key: string]: (args: any) => Promise<string> } = {
    youtubeSearch: (args: { query: string }) => youtubeSearch(args.query),
};

export async function POST(req: Request) {
    try {
        const { agent, history, settings } = await req.json() as { agent: AgentType, history: ChatMessage[], settings: AgentSettings };
        const message = history[history.length - 1].content;

        const chatHistoryForSDK = history.slice(0, -1).map(msg => {
             if (msg.role === 'tool') {
                return {
                    role: 'model',
                    parts: [{ functionResponse: { name: msg.toolCall!.name, response: msg.toolResult } }]
                };
            }
            return {
                role: msg.role as 'user' | 'model',
                parts: [{ text: msg.content }],
            };
        });

        const processedTools = agent.tools?.map(tool => {
            if (tool.declaration) {
                return { functionDeclarations: [tool.declaration] };
            }
            return null;
        }).filter(Boolean);

        const chat = ai.chats.create({
            model: settings.model,
            history: chatHistoryForSDK,
            config: {
                systemInstruction: agent.systemInstruction,
                temperature: settings.temperature,
                tools: processedTools && processedTools.length > 0 ? processedTools : undefined,
            },
        });

        let result = await chat.sendMessage({ message });
        let functionCalls = result.functionCalls;
        const toolMessages: ChatMessage[] = [];

        while (functionCalls && functionCalls.length > 0) {
            const functionResponses: Part[] = [];
            for (const functionCall of functionCalls) {
                const { name, args } = functionCall;

                const toolMessage: ChatMessage = { role: 'tool', content: `Using tool: ${name}...`, toolCall: { name, args } };
                toolMessages.push(toolMessage);
                
                let toolOutputResult: any;
                if (name in availableTools) {
                    toolOutputResult = await availableTools[name](args);
                } else {
                    toolOutputResult = `Error: Tool "${name}" not found.`;
                }

                functionResponses.push({
                    functionResponse: { name, response: { result: toolOutputResult } }
                });
                
                toolMessage.toolResult = { result: toolOutputResult };
            }

            result = await chat.sendMessage(functionResponses);
            functionCalls = result.functionCalls;
        }

        const finalResponse: ChatMessage = { role: 'model', content: result.text };
        
        return NextResponse.json([...toolMessages, finalResponse]);

    } catch (error: any) {
        console.error('API Error in agent-chat route:', error);
        return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}