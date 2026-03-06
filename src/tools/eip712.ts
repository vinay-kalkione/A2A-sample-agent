import { ethers } from "ethers";
import { tool } from "langchain";
import { z } from "zod";

/**
Return format: just the 0x-prefixed hex signature, nothing else.

**/


// {
//     "domain": {
//       "name": "DhruvaAudit",
//       "version": "1",
//       "chainId": 80002,
//       "verifyingContract": ""
//     },
//     "types": {
//       "AuditChallenge": [
//         {
//           "name": "message",
//           "type": "string"
//         },
//         {
//           "name": "nonce",
//           "type": "string"
//         },
//         {
//           "name": "timestamp",
//           "type": "uint256"
//         }
//       ]
//     },
//     "primaryType": "AuditChallenge",
//     "message": {
//       "message": "Dhruva Audit: Please sign this challenge to verify your identity...",
//       "nonce": "0x7da74c23d5e1f07365a0c870f5c20e47",
//       "timestamp": 1772783078
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
    console.log("challenge", challenge);
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
