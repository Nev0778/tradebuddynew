import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Conversation, Message, AppSettings, InboxFilter, QuickReplyTemplate } from '../lib/types';
import { DEMO_CONVERSATIONS, DEFAULT_SETTINGS } from '../lib/demo-data';
import { generateId } from '../lib/utils';

const STORAGE_KEY = 'tradebuddy_state_v3';

interface AppState {
  conversations: Conversation[];
  settings: AppSettings;
  activeFilter: InboxFilter;
}

type Action =
  | { type: 'SEND_MESSAGE'; conversationId: string; text: string }
  | { type: 'MARK_READ'; conversationId: string }
  | { type: 'SET_FILTER'; filter: InboxFilter }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'ADD_QUICK_REPLY'; template: Omit<QuickReplyTemplate, 'id'> }
  | { type: 'UPDATE_QUICK_REPLY'; template: QuickReplyTemplate }
  | { type: 'DELETE_QUICK_REPLY'; id: string }
  | { type: 'ADD_CONVERSATION'; conversation: Conversation }
  | { type: 'LOAD_STATE'; state: AppState };

const initialState: AppState = {
  conversations: DEMO_CONVERSATIONS,
  settings: DEFAULT_SETTINGS,
  activeFilter: 'all',
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.state;

    case 'SEND_MESSAGE': {
      const newMsg: Message = {
        id: generateId(),
        conversationId: action.conversationId,
        direction: 'outgoing',
        text: action.text,
        timestamp: new Date(),
        channelType: state.conversations.find(c => c.id === action.conversationId)?.channelType ?? 'messenger',
        isRead: true,
      };
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.conversationId
            ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg, unreadCount: 0 }
            : c
        ),
      };
    }

    case 'MARK_READ':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.conversationId
            ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) }
            : c
        ),
      };

    case 'SET_FILTER':
      return { ...state, activeFilter: action.filter };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'ADD_QUICK_REPLY':
      return {
        ...state,
        settings: {
          ...state.settings,
          quickReplies: [...state.settings.quickReplies, { ...action.template, id: generateId() }],
        },
      };

    case 'UPDATE_QUICK_REPLY':
      return {
        ...state,
        settings: {
          ...state.settings,
          quickReplies: state.settings.quickReplies.map(qr =>
            qr.id === action.template.id ? action.template : qr
          ),
        },
      };

    case 'DELETE_QUICK_REPLY':
      return {
        ...state,
        settings: {
          ...state.settings,
          quickReplies: state.settings.quickReplies.filter(qr => qr.id !== action.id),
        },
      };

    case 'ADD_CONVERSATION':
      return { ...state, conversations: [action.conversation, ...state.conversations] };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  filteredConversations: Conversation[];
  totalUnread: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Rehydrate dates
        const conversations: Conversation[] = (parsed.conversations ?? []).map((c: Conversation) => ({
          ...c,
          lastMessage: { ...c.lastMessage, timestamp: new Date(c.lastMessage.timestamp) },
          messages: c.messages.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })),
        }));
        dispatch({ type: 'LOAD_STATE', state: { ...parsed, conversations } });
      }
    } catch {
      // ignore parse errors, use defaults
    }
  }, []);

  // Persist state on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  const filteredConversations = state.conversations.filter(c => {
    if (state.activeFilter === 'all') return true;
    return c.channelType === state.activeFilter;
  }).sort((a, b) => b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime());

  const totalUnread = state.conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <AppContext.Provider value={{ state, dispatch, filteredConversations, totalUnread }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
