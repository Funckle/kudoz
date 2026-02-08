import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';
import { LIMITS } from '../utils/validation';

export async function pickImage(): Promise<{
  uri?: string;
  width?: number;
  height?: number;
  cancelled: boolean;
}> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    return { cancelled: true };
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    cancelled: false,
  };
}

export async function optimizeImage(uri: string): Promise<{
  uri: string;
  width: number;
  height: number;
}> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: LIMITS.IMAGE_MAX_DIMENSION } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  return { uri: result.uri, width: result.width, height: result.height };
}

export async function uploadImage(
  uri: string,
  userId: string,
  fileName: string,
  bucket: 'post-images' | 'avatars' = 'post-images'
): Promise<{ url?: string; error?: string }> {
  const path = `${userId}/${fileName}.jpg`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(blob.type)) {
    return { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
  }

  if (blob.size > LIMITS.IMAGE_MAX_SIZE) {
    return { error: 'Image must be under 2MB' };
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function deleteImage(url: string, bucket: 'post-images' | 'avatars' = 'post-images') {
  // Extract path from URL
  const parts = url.split(`/${bucket}/`);
  if (parts.length < 2) return;
  const path = parts[1];
  await supabase.storage.from(bucket).remove([path]);
}
