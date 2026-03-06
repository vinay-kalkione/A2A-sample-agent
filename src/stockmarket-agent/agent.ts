import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Message } from '@a2a-js/sdk';
import { getAgentWalletPublicAddress } from '../tools/agentwallet.js';
import { getDhruvaVerificationSignature } from '../tools/eip712.js';

  
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0
  });
  
const agent = createAgent({
    model,
    tools: [getAgentWalletPublicAddress, getDhruvaVerificationSignature]
  });


export const invokeAgent = async (message: Message) => {
  console.log('Invoking agent with message:', message);
  const response = await agent.invoke({
    messages: message.parts.map((part) => ({
      role: message.role,
      content: part.kind === 'text' ? part.text : ""
    })),
  }); 
  return response.messages[response.messages.length - 1].content;
};





