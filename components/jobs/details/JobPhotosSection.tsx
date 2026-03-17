import { PhotoThumbnail } from "@/components/PhotoThumbnail";
import { Photo } from "@/types/job";
import { Camera } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type JobPhotosSectionProps = {
  photos: Photo[];
  onTakePhoto: () => void;
  onAddPhoto: () => void;
};

export function JobPhotosSection({
  photos,
  onTakePhoto,
  onAddPhoto,
}: JobPhotosSectionProps) {
  return (
    <View className="px-4 py-4">
      <Text className="mb-3 text-lg font-semibold text-slate-800">
        Photos ({photos.length})
      </Text>
      <View className="mb-2 flex-row flex-wrap">
        {photos.map((photo) => (
          <PhotoThumbnail key={photo.id} photo={photo} />
        ))}
      </View>
      <View className="flex-row space-x-2">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3"
          onPress={onTakePhoto}
        >
          <Camera size={20} color="#3b82f6" />
          <Text className="text-sm font-semibold text-blue-500">
            Take Photo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3"
          onPress={onAddPhoto}
        >
          <Camera size={20} color="#3b82f6" />
          <Text className="text-sm font-semibold text-blue-500">
            Choose Photo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

