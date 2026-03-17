import { Photo } from "@/types/job";
import { Image, Text, TouchableOpacity } from "react-native";

interface PhotoThumbnailProps {
  photo: Photo;
  onPress?: () => void;
}

export function PhotoThumbnail({ photo, onPress }: PhotoThumbnailProps) {
  return (
    <TouchableOpacity
      className="m-1 rounded-lg bg-slate-100"
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Image
        source={{ uri: photo.uri }}
        className="h-24 w-24"
      />
      <Text className="px-1 py-1 text-center text-[10px] text-gray-500">
        {new Date(photo.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}

