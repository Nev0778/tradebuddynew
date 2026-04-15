import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Conversation, Message, AppSettings, InboxFilter, ReadFilter, QuickReplyTemplate } from '../lib/types';
import { DEFAULT_SETTINGS, DEFAULT_CREDENTIALS } from '../lib/demo-data';
import { generateId } from '../lib/utils';
import { conversations as conversationsApi, type ApiConversation } from '../lib/api';
import { getToken } from '../lib/api';

const STORAGE_KEY = 'socialsunited_state_v4';

interface AppState {
  conversations: Conversation[];
  settings: AppSettings;
  activeFilter: InboxFilter;
  readFilter: ReadFilter;
  searchQuery: string;
}

type Action =
  | { type: 'SEND_MESSAGE'; conversationId: string; text: string }
  | { type: 'MARK_READ'; conversationId: string }
  | { type: 'MARK_UNREAD'; conversationId: string }
  | { type: 'SET_FILTER'; filter: InboxFilter }
  | { type: 'SET_READ_FILTER'; filter: ReadFilter }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'ADD_QUICK_REPLY'; template: Omit<QuickReplyTemplate, 'id'> }
  | { type: 'UPDATE_QUICK_REPLY'; template: QuickReplyTemplate }
  | { type: 'DELETE_QUICK_REPLY'; id: string }
  | { type: 'ADD_CONVERSATION'; conversation: Conversation }
  | { type: 'SET_CONVERSATIONS'; conversations: Conversation[] }
  | { type: 'LOAD_STATE'; state: AppState };

// Always start with empty conversations — demo data is gone
const initialState: AppState = {
  conversations: [],
  settings: DEFAULT_SETTINGS,
  activeFilter: 'all',
  readFilter: 'all',
  searchQuery: '',
};

// Convert API conversation format to frontend Conversation type
function apiConvToLocal(c: ApiConversation): Conversation {
  const lastMsg = c.last_message;
  const lastMessage: Message = lastMsg
    ? {
        id: lastMsg.id,
        conversationId: c.id,
        direction: lastMsg.direction,
        text: lastMsg.text,
        timestamp: new Date(lastMsg.created_at),
        channelType: lastMsg.channel_type as Conversation['channelType'],
        isRead: lastMsg.is_read,
      }
    : {
        id: 'placeholder',
        conversationId: c.id,
        direction: 'incoming' as const,
        text: '',
        timestamp: new Date(c.created_at),
        channelType: c.channel_type as Conversation['channelType'],
        isRead: true,
      };

  // Generate initials and a stable avatar colour from the contact name
  const initials = c.contact_name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const avatarColors = ['#E57373', '#64B5F6', '#81C784', '#FFB74D', '#BA68C8', '#4DB6AC'];
  const avatarColor = avatarColors[c.contact_name.charCodeAt(0) % avatarColors.length];

  return {
    id: c.id,
    contactName: c.contact_name,
    contactInitials: initials,
    contactAvatarColor: avatarColor,
    channelType: c.channel_type as Conversation['channelType'],
    channelId: c.channel_id,
    pageName: c.page_name,
    unreadCount: c.unread_count,
    messages: [lastMessage],
    lastMessage,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.state;

    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.conversations };

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

    case 'MARK_UNREAD':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.conversationId
            ? { ...c, unreadCount: 1, messages: c.messages.map((m, i, arr) => i === arr.length - 1 ? { ...m, isRead: false } : m) }
            : c
        ),
      };

    case 'SET_FILTER':
      return { ...state, activeFilter: action.filter };

    case 'SET_READ_FILTER':
      return { ...state, readFilter: action.filter };

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };

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
  totalUnreadCount: number;
  refreshConversations: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted settings (NOT conversations — those come from the API)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const settings = {
          ...DEFAULT_SETTINGS,
          ...parsed.settings,
          credentials: { ...DEFAULT_CREDENTIALS, ...(parsed.settings?.credentials ?? {}) },
        };
        dispatch({
          type: 'LOAD_STATE',
          state: {
            ...initialState,
            settings,
            activeFilter: parsed.activeFilter ?? 'all',
            readFilter: parsed.readFilter ?? 'all',
            searchQuery: '',
            conversations: [], // always start empty — fetch from API below
          },
        });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Fetch real conversations from backend when authenticated
  const refreshConversations = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const apiConvs: ApiConversation[] = await conversationsApi.list();
      const local = apiConvs.map(apiConvToLocal);
      dispatch({ type: 'SET_CONVERSATIONS', conversations: local });
    } catch {
      // silently fail — user sees empty inbox rather than crashing
    }
  };

  useEffect(() => {
    refreshConversations();
    // Poll every 30 seconds for new messages
    const interval = setInterval(refreshConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Persist settings only (not conversations — they come from the API)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        settings: state.settings,
        activeFilter: state.activeFilter,
        readFilter: state.readFilter,
      }));
    } catch {
      // ignore storage errors
    }
  }, [state.settings, state.activeFilter, state.readFilter]);

  const filteredConversations = state.conversations.filter(c => {
    if (state.activeFilter !== 'all' && c.channelType !== state.activeFilter) return false;
    if (state.readFilter === 'unread' && c.unreadCount === 0) return false;
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchesName = c.contactName.toLowerCase().includes(q);
      const matchesMsg = c.lastMessage.text.toLowerCase().includes(q);
      if (!matchesName && !matchesMsg) return false;
    }
    return true;
  }).sort((a, b) => b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime());

  const totalUnread = state.conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const totalUnreadCount = totalUnread;

  return (
    <AppContext.Provider value={{ state, dispatch, filteredConversations, totalUnread, totalUnreadCount, refreshConversations }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
