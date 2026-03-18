import { PhotoThumbnail } from "@/components/PhotoThumbnail";
import { Photo } from "@/types/job";
import { Camera, Trash2 } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type JobPhotosSectionProps = {
  photos: Photo[];
  onTakePhoto: () => void;
  onAddPhoto: () => void;
  onDeletePhoto?: (photoId: string) => void;
};

export function JobPhotosSection({
  photos,
  onTakePhoto,
  onAddPhoto,
  onDeletePhoto,
}: JobPhotosSectionProps) {
  return (
    <View className="px-4 py-4">
      <Text className="mb-3 text-lg font-semibold text-slate-800">
        Photos ({photos.length})
      </Text>
      <View className="mb-2 flex-row flex-wrap">
        {photos.map((photo) => (
          <View
            key={photo.id}
            style={{ position: "relative", marginRight: 8, marginBottom: 8 }}
          >
            <PhotoThumbnail photo={photo} />
            {onDeletePhoto ? (
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => onDeletePhoto(photo.id)}
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  width: 26,
                  height: 26,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  backgroundColor: "#ef4444",
                  zIndex: 2,
                }}
              >
                <Trash2 size={14} color="#ffffff" />
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </View>
      <View className="flex-row space-x-2">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3"
          onPress={onTakePhoto}
        >
          <Camera size={20} color="#3b82f6" />
          <Text className="ml-2 text-sm font-semibold text-blue-500">
            Take Photo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3"
          onPress={onAddPhoto}
        >
          <Camera size={20} color="#3b82f6" />
          <Text className="ml-2 text-sm font-semibold text-blue-500">
            Choose Photo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
