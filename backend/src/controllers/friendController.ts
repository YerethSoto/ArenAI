import { Request, Response } from 'express';
import { 
    searchUsersNotFriends, 
    createFriendRequest, 
    findExistingRequest, 
    getPendingRequests, 
    getRequestById, 
    updateRequestStatus, 
    checkChatExists, 
    createChat 
} from '../repositories/friendRepository.js';

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    // Properly access user.id from the AuthenticatedUser interface attached by middleware
    const currentUserId = req.user!.id;

    if (!query || typeof query !== 'string' || query.length < 3) {
      return res.status(400).json({ message: 'Search query must be at least 3 characters' });
    }

    const users = await searchUsersNotFriends(query, currentUserId);
    return res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    if (error && typeof error === 'object' && 'code' in error) {
        console.error('Error Code:', (error as any).code);
        console.error('Error Message:', (error as any).message);
    }
    return res.status(500).json({ message: 'Internal server error', error: (error as any).message });
  }
};

export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user!.id;

    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'Cannot friend yourself' });
    }

    const existing = await findExistingRequest(currentUserId, targetUserId);

    if (existing) {
        if (existing.status === 'pending') return res.status(400).json({ message: 'Request already pending' });
        if (existing.status === 'accepted') return res.status(400).json({ message: 'Already friends' });
        if (existing.status === 'rejected') return res.status(400).json({ message: 'Request previously rejected' });
    }

    await createFriendRequest(currentUserId, targetUserId);

    return res.status(201).json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Send request error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFriendRequests = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.id;
    const requests = await getPendingRequests(currentUserId);
    return res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    // Log detailed error for debugging
    if (error && typeof error === 'object' && 'code' in error) {
        console.error('Error Code:', (error as any).code);
        console.error('Error Message:', (error as any).message);
        console.error('SQL State:', (error as any).sqlState);
    }
    return res.status(500).json({ message: 'Internal server error', error: (error as any).message });
  }
};

export const respondToFriendRequest = async (req: Request, res: Response) => {
    try {
      const { requestId, action } = req.body; // action: 'accept' | 'reject'
      const currentUserId = req.user!.id;

      console.log(`[respondToFriendRequest] Processing: requestId=${requestId}, action=${action}, userId=${currentUserId}`);

      if (!['accept', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
      }
  
      const request = await getRequestById(requestId);
      console.log('[respondToFriendRequest] Request found:', request);
  
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
      
      // Note: id_receiver in DB vs currentUserId
      // Ensure types match (number vs string)
      if (Number(request.id_receiver) !== Number(currentUserId)) {
          console.warn(`[respondToFriendRequest] Unauthorized: req.receiver=${request.id_receiver}, currentUser=${currentUserId}`);
          return res.status(403).json({ message: 'Not authorized' });
      }
  
      if (request.status !== 'pending') {
           console.warn(`[respondToFriendRequest] Not pending: status=${request.status}`);
          return res.status(400).json({ message: 'Request already handled' });
      }
  
      const mappedStatus = action === 'accept' ? 'accepted' : 'rejected';
      console.log(`[respondToFriendRequest] Mapping action '${action}' to status '${mappedStatus}'`);

      const updateSuccess = await updateRequestStatus(requestId, mappedStatus);
      console.log(`[respondToFriendRequest] Update status success: ${updateSuccess}`);
  
      if (action === 'accept') {
        const chatExists = await checkChatExists(request.id_sender, currentUserId);
        console.log(`[respondToFriendRequest] Chat exists? ${chatExists}`);
        if (!chatExists) {
            const newChatId = await createChat(request.id_sender, currentUserId);
            console.log(`[respondToFriendRequest] Created new chat: ${newChatId}`);
        }
      }
  
      return res.json({ message: `Request ${action}ed` });
    } catch (error) {
      console.error('[respondToFriendRequest] ERROR:', error);
      if (error instanceof Error) {
          console.error('Message:', error.message);
          console.error('Stack:', error.stack);
      }
      return res.status(500).json({ message: 'Internal server error', error: String(error) });
    }
};
