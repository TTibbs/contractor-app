import { Photo } from "@/types/job";
import { Image as ExpoImage } from "expo-image";
import { Text, TouchableOpacity } from "react-native";

interface PhotoThumbnailProps {
  photo: Photo;
  onPress?: () => void;
}

export function PhotoThumbnail({ photo, onPress }: PhotoThumbnailProps) {
  return (
    <TouchableOpacity
      className="rounded-lg bg-slate-100"
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <ExpoImage
        source={{ uri: photo.uri }}
        style={{ height: 96, width: 96, borderRadius: 8 }}
        cachePolicy="memory-disk"
        contentFit="cover"
      />
      <Text className="px-1 py-1 text-center text-[10px] text-gray-500">
        {new Date(photo.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}
