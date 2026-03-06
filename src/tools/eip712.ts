import { ethers } from "ethers";
import { tool } from "langchain";
import { z } from "zod";

/**
Return format: just the 0x-prefixed hex signature, nothing else.

**/


// {
//     "domain": {
    // name: "DhruvaAgentIdentity",
    // version: "1",
    // chainId: 31337,
//       "verifyingContract": ""
//     },
//     "types": {
    // RegisterAgentWallet: [
    //     { name: "nftOwner", type: "address" },
    //     { name: "agentWallet", type: "address" },
    //     { name: "deadline", type: "uint256" },
//       ]
//     },
//     "message": {
//       "nftOwner": "0x...",
//       "agentWallet": "0x...",
//       "deadline": "1234567890",
//     }
//   }

const challengeSchema = z.object({
  domain: z.object({
    name: z.string(),
    version: z.string(),
    chainId: z.number(),
    verifyingContract: z.string(),
  }),
  types: z.record(z.string(), z.array(z.object({ name: z.string(), type: z.string() }))),
  message: z.record(z.string(), z.string()),
});
export const getDhruvaVerificationSignature = tool(
  async (challengeBase64: string) => {
    try {
    const challenge = JSON.parse(Buffer.from(challengeBase64, 'base64').toString('utf-8'));
    // console.log("challenge", challenge);
    const domain = challenge.domain;
    const types = challenge.types;
    const message = challenge.message;
    const wallet = new ethers.Wallet(
      process.env.AGENT_WALLET_PRIVATE_KEY as string,
    );
    console.log("challenge", challenge);
    const signature = await wallet.signTypedData(
      domain,   
      types,
      message,
    );
    console.log("signature", signature);
    return signature;
    } catch (error) {
      console.error("error", error);
      return {
        error: "Error getting signature",
        message: error.message,
      };
    }
  },
  {
    name: "get_712_signature_for_challenge",
    description: "Returns the EIP-712 signature for the Dhruva audit challenge which is a json object with the following fields: domain, types, message.",
    schema: z.string().describe("The base64 encoded challenge."),
  },
);
