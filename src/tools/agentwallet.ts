import { z } from 'zod';
import { tool } from "langchain";

export const getAgentWalletPublicAddress = tool(
    () => `${process.env.AGENT_WALLET_PUBLIC_ADDRESS}`,
    {
      name: "get_agent_wallet_public_address",
      description: "Returns the public address you wallet",
      schema: z.object({
        query: z.string().describe("The public address of the agent's wallet."),
      }),
    }
  );