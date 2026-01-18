import * as chatRepo from '../repositories/chatRepository.js';

export const chatService = {
    createChat: chatRepo.createChat,
    getChatBetweenUsers: chatRepo.getChatBetweenUsers,
    getUserChats: chatRepo.getUserChats,
    sendMessage: chatRepo.sendMessage,
    getMessages: chatRepo.getChatMessages,
    bulkSaveMessages: chatRepo.bulkSaveMessages,
};
