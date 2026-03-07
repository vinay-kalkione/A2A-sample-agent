// server.ts
import 'dotenv/config';
import express from 'express';
import { Server, ServerCredentials } from '@grpc/grpc-js';
import { v4 as uuidv4 } from 'uuid';
import { AGENT_CARD_PATH, Message} from '@a2a-js/sdk';
import {
  DefaultRequestHandler,
  ExecutionEventBus,
  InMemoryTaskStore,
  RequestContext,
} from '@a2a-js/sdk/server';
import { agentCardHandler, jsonRpcHandler, restHandler, UserBuilder } from '@a2a-js/sdk/server/express';
import { grpcService, A2AService } from '@a2a-js/sdk/server/grpc';
import { invokeAgent } from './stockmarket-agent/agent.js';

// In hosted env: set BASE_URL to your public URL
// Locally: BASE_URL defaults to http://localhost:4000
const baseUrl = (process.env.BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
const agentRpcUrl = `${baseUrl}/a2a/jsonrpc`;
const agentRestUrl = `${baseUrl}/a2a/rest`;
const agentGrpcUrl = process.env.GRPC_URL || 'localhost:4001';

// 1. Define your agent's identity card.
const stockMarketAgentCard = {
  name: 'Stock Market Agent',
  description: 'A agent that provides stock market information.',
  protocolVersion: '0.3.0',
  version: '0.1.0',
  url: agentRpcUrl, // The public URL of your agent server
  skills: [{ id: 'chat', name: 'Chat', description: 'Provide stock market information', tags: ['chat'] }],
  capabilities: {
    pushNotifications: false,
  },
  defaultInputModes: ['text'],
  defaultOutputModes: ['text'],
  additionalInterfaces: [
    { url: agentRpcUrl, transport: 'JSONRPC' }, // Default JSON-RPC transport
    { url: agentRestUrl, transport: 'HTTP+JSON' }, // HTTP+JSON/REST transport
    { url: agentGrpcUrl, transport: 'GRPC' }, // GRPC transport (optional in hosted env)
  ],
};

// 2. Implement the agent's logic.
class StockMarketExecutor {
  async execute(requestContext: RequestContext, eventBus: ExecutionEventBus) {

    const response = await invokeAgent(requestContext.userMessage);


    // Create a direct message response.
    const responseMessage = {
      kind: 'message',
      messageId: uuidv4(),
      role: 'agent',
      parts: [{ kind: 'text', text: response }],
      // Associate the response with the incoming request's context.
      contextId: requestContext.contextId,
    } as Message;

    // Publish the message and signal that the interaction is finished.
    eventBus.publish(responseMessage);
    eventBus.finished();
  }

  // cancelTask is not needed for this simple, non-stateful agent.
  cancelTask = async () => {};
}

// 3. Set up and run the server.
const agentExecutor = new StockMarketExecutor();
const requestHandler = new DefaultRequestHandler(
  stockMarketAgentCard,
  new InMemoryTaskStore(),
  agentExecutor
);

const app = express();

app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: requestHandler }));
app.use('/a2a/jsonrpc', jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
app.use('/a2a/rest', restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));

app.listen(4000, () => {
  console.log(`🚀 Server started on ${baseUrl}`);
});

const server = new Server();
server.addService(A2AService, grpcService({
  requestHandler,
  userBuilder: UserBuilder.noAuthentication,
}));
server.bindAsync(agentGrpcUrl, ServerCredentials.createInsecure(), () => {
  console.log(`🚀 Server started on ${agentGrpcUrl}`);
});