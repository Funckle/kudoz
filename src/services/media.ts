import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { File as ExpoFile } from 'expo-file-system';
import { Platform } from 'react-native';
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
  if (Platform.OS === 'web') {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: LIMITS.IMAGE_MAX_DIMENSION } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return { uri: result.uri, width: result.width, height: result.height };
  }

  // On native, the resize interpolation produces 1px artifacts at edges.
  // Resize slightly larger, then crop the border away.
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: LIMITS.IMAGE_MAX_DIMENSION + 2 } }],
    { format: ImageManipulator.SaveFormat.JPEG }
  );
  const result = await ImageManipulator.manipulateAsync(
    resized.uri,
    [{ crop: { originX: 1, originY: 1, width: resized.width - 2, height: resized.height - 2 } }],
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

  try {
    let body: ArrayBuffer | Blob;

    if (Platform.OS !== 'web') {
      // On native (iOS/Android), fetch(file://) produces corrupt blobs.
      // Use expo-file-system's File class to read as ArrayBuffer instead.
      const file = new ExpoFile(uri);
      const buffer = await file.arrayBuffer();
      if (buffer.byteLength > LIMITS.IMAGE_MAX_SIZE) {
        return { error: 'Image must be under 2MB' };
      }
      body = buffer;
    } else {
      const response = await fetch(uri);
      const blob = await response.blob();
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(blob.type)) {
        return { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
      }
      if (blob.size > LIMITS.IMAGE_MAX_SIZE) {
        return { error: 'Image must be under 2MB' };
      }
      body = blob;
    }

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, body, { contentType: 'image/jpeg', upsert: true });

    if (error) return { error: error.message };

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e: any) {
    return { error: e?.message || 'Failed to upload image' };
  }
}

export async function deleteImage(url: string, bucket: 'post-images' | 'avatars' = 'post-images') {
  // Extract path from URL
  const parts = url.split(`/${bucket}/`);
  if (parts.length < 2) return;
  const path = parts[1];
  await supabase.storage.from(bucket).remove([path]);
}
