// src/hooks/useFirestore.js
// Real-time Firestore Hooks for SportsChatPlus
// Replaces your API calls with real-time Firebase data
// ====================================================

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase-config';

// Generic real-time collection hook (replaces your API.get calls)
export const useCollection = (collectionName, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const collectionRef = collection(db, collectionName);
      const q = queryConstraints.length > 0 
        ? query(collectionRef, ...queryConstraints)
        : collectionRef;

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const documents = [];
          snapshot.forEach((doc) => {
            const docData = doc.data();
            documents.push({
              id: doc.id,
              ...docData,
              // Convert Firestore timestamps to JS dates
              createdAt: docData.createdAt?.toDate(),
              updatedAt: docData.updatedAt?.toDate(),
              timestamp: docData.timestamp?.toDate(),
              gameTime: docData.gameTime?.toDate(), // For your games
              date: docData.date?.toDate() // For your teams/stats
            });
          });
          setData(documents);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error(`Error setting up ${collectionName} listener:`, err);
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
};

// Real-time games data (replaces your fetchGames function)
export const useGames = (gameType = 'upcoming') => {
  const constraints = [orderBy('gameTime', 'asc'), limit(50)];
  
  // Add filter based on game type
  if (gameType === 'live') {
    constraints.unshift(where('status', '==', 'live'));
  } else if (gameType === 'recent') {
    constraints.unshift(where('status', '==', 'completed'));
  } else {
    constraints.unshift(where('status', '==', 'upcoming'));
  }

  return useCollection('games', constraints);
};

// Real-time teams data (replaces your fetchTeams function)
export const useTeams = () => {
  return useCollection('teams', [orderBy('name', 'asc')]);
};

// Real-time stats data (replaces your getGameStats, getPlayerStats, getTeamStats)
export const useStats = (statsType = 'games', filter = 'all') => {
  const constraints = [];
  
  // Add ordering based on stats type
  if (statsType === 'games') {
    constraints.push(orderBy('totalScore', 'desc'));
  } else if (statsType === 'players') {
    constraints.push(orderBy('ppg', 'desc'));
  } else if (statsType === 'teams') {
    constraints.push(orderBy('winPct', 'desc'));
  }
  
  constraints.push(limit(50));

  return useCollection(`stats_${statsType}`, constraints);
};

// Real-time chat messages (replaces your fetchChatMessages)
export const useChatMessages = (chatRoomId = 'global', messageLimit = 100) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const messagesRef = collection(db, 'chatrooms', chatRoomId, 'messages');
      const q = query(
        messagesRef,
        orderBy('timestamp', 'asc'),
        limit(messageLimit)
      );

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const messageList = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            messageList.push({
              id: doc.id,
              ...data,
              timestamp: data.timestamp?.toDate() || new Date()
            });
          });
          setMessages(messageList);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching messages:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up messages listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [chatRoomId, messageLimit]);

  return { messages, loading, error };
};

// Generic document hook (replaces your game detail API calls)
export const useDocument = (collectionName, documentId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, collectionName, documentId);
      
      const unsubscribe = onSnapshot(docRef,
        (doc) => {
          if (doc.exists()) {
            const docData = doc.data();
            setData({
              id: doc.id,
              ...docData,
              createdAt: docData.createdAt?.toDate(),
              updatedAt: docData.updatedAt?.toDate(),
              timestamp: docData.timestamp?.toDate(),
              gameTime: docData.gameTime?.toDate()
            });
          } else {
            setData(null);
          }
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Error fetching document ${documentId}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error(`Error setting up document listener:`, err);
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName, documentId]);

  return { data, loading, error };
};

// Firestore operations hook (replaces your API POST/PUT/DELETE calls)
export const useFirestoreOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add document (replaces POST API calls)
  const addDocument = async (collectionName, data) => {
    try {
      setLoading(true);
      setError(null);
      
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (err) {
      console.error('Error adding document:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update document (replaces PUT API calls)
  const updateDocument = async (collectionName, documentId, data) => {
    try {
      setLoading(true);
      setError(null);
      
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating document:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete document (replaces DELETE API calls)
  const deleteDocument = async (collectionName, documentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send chat message (replaces your chat API calls)
  const sendChatMessage = async (chatRoomId, message, userId, username) => {
    try {
      setLoading(true);
      setError(null);
      
      const messagesRef = collection(db, 'chatrooms', chatRoomId, 'messages');
      await addDoc(messagesRef, {
        userId,
        username,
        message: message.trim(),
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Place bet (replaces your betting API calls)
  const placeBet = async (gameId, teamId, amount, userId) => {
    try {
      setLoading(true);
      setError(null);
      
      await addDoc(collection(db, 'bets'), {
        gameId,
        teamId,
        amount,
        userId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error placing bet:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    sendChatMessage,
    placeBet,
    clearError: () => setError(null)
  };
};