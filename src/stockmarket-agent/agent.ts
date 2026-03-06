
import { z } from 'zod';
import { createAgent, tool } from "langchain";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Message } from '@a2a-js/sdk';



const getAgentWalletPublicAddress = tool(
  () => `My wallet public address is ${process.env.AGENT_WALLET_PUBLIC_ADDRESS}`,
  {
    name: "get_agent_wallet_public_address",
    description: "Returns the public address you wallet",
    schema: z.object({
      query: z.string().describe("The public address of the agent's wallet."),
    }),
  }
);


  
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0
  });
  
const agent = createAgent({
    model,
    tools: [getAgentWalletPublicAddress]
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





