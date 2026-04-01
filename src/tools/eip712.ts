import { DhruvaSigningPolicy,RegistrationRequest } from "@kalkilabs/dhruva-agent-tools";
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
    //     { name: "agentWallet", type: "address" }
    //     { name: "deadline", type: "uint256" },
//       ]
//     },
//     "message": {
//       "nftOwner": "0x...",
//       "agentWallet": "0x...",
//       "deadline": "1234567890",
//     }
//   }

export const getDhruvaVerificationSignature = tool(
  async (challengeBase64: string) => {
    try {
      const agentPrivateKey = process.env.AGENT_WALLET_PRIVATE_KEY as `0x${string}`; // make sure to add 0x prefix to the private key if its not shown while exporting the private key from the wallet

      const chainId = process.env.CHAIN_ID;

      const policy = new DhruvaSigningPolicy({
        agentPrivateKey,
        chainId: Number(chainId),
        whitelistedOwners: [],
      });

      const signature = await policy.evaluate({
        base64Challenge: challengeBase64,
        chainId: Number(chainId),
      });
      // console.log("signature", signature);
      if (!signature.ok) {
        throw new Error(signature.reason);
      }
      // console.log("signature", signature);
      return signature;
    } catch (error: unknown) {
      console.error("error", error);
      return {
        error: "Error getting signature",
        message: error instanceof Error ? error.message : String(error),
      };
    }
  },
  {
    name: "get_712_signature_for_challenge",
    description: "Returns the EIP-712 signature for the Dhruva audit challenge which is a json object with the following fields: domain, types, message.",
    schema: z.string().describe("The base64 encoded challenge."),
  },
);
