// ─── Channel Types ────────────────────────────────────────────────────────────
export type ChannelType = 'messenger' | 'page_comment' | 'whatsapp' | 'sms';

export type MessageDirection = 'incoming' | 'outgoing';

export interface Message {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  text: string;
  timestamp: Date;
  channelType: ChannelType;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  channelType: ChannelType;
  channelId: string;
  contactName: string;
  contactInitials: string;
  contactAvatarColor: string;
  pageName: string;
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
  isAutoReplied?: boolean;
}

export type QuickReplyCategory = 'Qualifying' | 'Booking' | 'Follow-up' | 'Holding' | 'General';

export interface QuickReplyTemplate {
  id: string;
  text: string;
  category: QuickReplyCategory;
  label?: string;
}

export interface AutoReplyConfig {
  enabled: boolean;
  message: string;
  outsideHoursOnly: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
}

export type TradeType = 'electrician' | 'plumber' | 'builder' | 'carpenter' | 'painter' | 'other';

export interface AppSettings {
  businessName: string;
  tradeType: TradeType;
  autoReply: AutoReplyConfig;
  quickReplies: QuickReplyTemplate[];
}

export type InboxFilter = 'all' | 'messenger' | 'page_comment' | 'whatsapp' | 'sms';
