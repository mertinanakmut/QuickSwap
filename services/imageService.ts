
import { supabase } from "../lib/supabase";

export async function uploadImageToStorage(userId: string, imageBlob: Blob): Promise<string> {
  const fileId = Math.random().toString(36).substr(2, 9);
  const filePath = `products/${userId}/${fileId}.jpg`;
  
  const { data, error } = await supabase.storage
    .from('marketplace_assets')
    .upload(filePath, imageBlob, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('marketplace_assets')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadAvatarToStorage(userId: string, imageBlob: Blob): Promise<string> {
  const filePath = `avatars/${userId}/profile.jpg`;
  
  const { data, error } = await supabase.storage
    .from('marketplace_assets')
    .upload(filePath, imageBlob, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('marketplace_assets')
    .getPublicUrl(filePath);

  return publicUrl;
}
