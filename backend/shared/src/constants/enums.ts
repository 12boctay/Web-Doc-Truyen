export const COMIC_COUNTRIES = ['manga', 'manhua', 'manhwa', 'comic'] as const;
export const COMIC_STATUSES = ['ongoing', 'completed', 'dropped'] as const;
export const USER_STATUSES = ['active', 'banned', 'suspended'] as const;
export const DONOR_BADGES = ['none', 'bronze', 'silver', 'gold', 'diamond'] as const;
export const PAYMENT_METHODS = ['momo', 'vnpay', 'zalopay', 'stripe', 'bank_transfer'] as const;
export const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const;
export const NOTIFICATION_TYPES = [
  'new_chapter',
  'reply_comment',
  'announcement',
  'chat_message',
  'donation_thanks',
] as const;
export const COMMENT_STATUSES = ['visible', 'hidden', 'deleted'] as const;
export const CHAT_ROOM_TYPES = ['global', 'group', 'direct'] as const;
export const CHAT_MESSAGE_STATUSES = ['visible', 'deleted'] as const;
