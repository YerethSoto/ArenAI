import * as chatbotRepo from '../repositories/chatbotRepository.js';

export const chatbotService = {
    createSession: chatbotRepo.createChatbotSession,
    getSession: chatbotRepo.getChatbotSession,
    addMessage: chatbotRepo.addChatbotMessage,
    getMessages: chatbotRepo.getChatbotMessages,
};
