
import { z } from 'zod';
import { createAgent, tool } from "langchain";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';



const getAgentWalletPublicAddress = tool(
  () => `The public address of the agent's wallet is ${process.env.AGENT_WALLET_PUBLIC_ADDRESS}`,
  {
    name: "get_agent_wallet_public_address",
    description: "Returns the public address of the agent's wallet.",
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


export const invokeAgent = async (message: string) => {
  const response = await agent.invoke({
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
  }); 
  return response.messages[response.messages.length - 1].content;
};





