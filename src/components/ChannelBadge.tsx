import type { ChannelType } from '../lib/types';

interface ChannelConfig {
  label: string;
  bg: string;
  text: string;
  title: string;
}

const CHANNEL_CONFIG: Record<ChannelType, ChannelConfig> = {
  messenger: { label: 'M', bg: '#0084FF', text: '#FFFFFF', title: 'Messenger' },
  page_comment: { label: 'f', bg: '#1877F2', text: '#FFFFFF', title: 'Page Comments' },
  whatsapp: { label: 'W', bg: '#25D366', text: '#FFFFFF', title: 'WhatsApp' },
  sms: { label: 'SMS', bg: '#6B7A99', text: '#FFFFFF', title: 'SMS' },
};

interface Props {
  channel: ChannelType;
  size?: 'sm' | 'md' | 'lg';
}

export function ChannelBadge({ channel, size = 'md' }: Props) {
  const cfg = CHANNEL_CONFIG[channel];
  const dim = size === 'sm' ? 20 : size === 'lg' ? 32 : 26;
  const fontSize = size === 'sm' ? 9 : size === 'lg' ? 13 : 11;

  return (
    <span
      title={cfg.title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: '50%',
        background: cfg.bg,
        color: cfg.text,
        fontSize,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: channel === 'sms' ? '-0.5px' : undefined,
        lineHeight: 1,
      }}
    >
      {cfg.label}
    </span>
  );
}

export function channelTitle(channel: ChannelType): string {
  return CHANNEL_CONFIG[channel].title;
}
