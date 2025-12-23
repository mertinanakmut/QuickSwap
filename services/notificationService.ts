
import { supabase } from '../lib/supabase';
import { NotificationType, NotificationPriority } from '../types';

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  relatedContent?: {
    type: 'listing' | 'order' | 'message';
    id: string;
    preview?: string;
  };
}

/**
 * Uygulama genelinde herhangi bir kullanıcıya bildirim gönderir.
 */
export const sendNotification = async (params: SendNotificationParams) => {
  try {
    const { error } = await supabase.from('notifications').insert([{
      user_id: params.userId,
      type: params.type,
      priority: params.priority,
      title: params.title,
      message: params.message,
      sender: params.sender || null,
      related_content: params.relatedContent || null,
      timestamp: Date.now(),
      read: false,
      pinned: false
    }]);

    if (error) {
      console.error("Bildirim gönderilemedi:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Notification Service Error:", err);
    return false;
  }
};
