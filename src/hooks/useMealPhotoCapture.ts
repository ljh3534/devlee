import { fetchAlbumPhotos, openCamera } from "@apps-in-toss/web-framework";
import { useDialog } from "@toss/tds-mobile";
import { useCallback, useState } from "react";

interface CapturedPhoto {
  id: string;
  dataUri: string;
}

interface UseMealPhotoCaptureReturn {
  capture: () => Promise<CapturedPhoto | null>;
  pickFromAlbum: () => Promise<CapturedPhoto | null>;
  isCapturing: boolean;
}

interface PermissionGate {
  getPermission: () => Promise<string>;
  openPermissionDialog: () => Promise<string>;
}

export function useMealPhotoCapture(): UseMealPhotoCaptureReturn {
  const dialog = useDialog();
  const [isCapturing, setIsCapturing] = useState(false);

  const ensureAllowed = useCallback(async (permissionGate: PermissionGate) => {
    const permission = await permissionGate.getPermission();
    return (
      permission === "allowed" ||
      (await permissionGate.openPermissionDialog()) === "allowed"
    );
  }, []);

  const capture = useCallback(async (): Promise<CapturedPhoto | null> => {
    setIsCapturing(true);

    try {
      const allowed = await ensureAllowed(openCamera);

      if (!allowed) {
        dialog.openAlert({
          title: "카메라 권한이 필요해요",
          description: "설정에서 카메라 접근을 허용한 뒤 다시 시도해주세요.",
        });
        return null;
      }

      const photo = await openCamera({ base64: true, maxWidth: 800 });

      return { id: photo.id, dataUri: `data:image/jpeg;base64,${photo.dataUri}` };
    } catch (error) {
      console.error("카메라 촬영 실패:", error);
      dialog.openAlert({
        title: "카메라를 사용할 수 없어요",
        description:
          "이 환경에서는 카메라 기능을 사용할 수 없어요.\n토스 앱 또는 샌드박스 앱에서 다시 시도해주세요.",
      });
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [dialog, ensureAllowed]);

  const pickFromAlbum = useCallback(async (): Promise<CapturedPhoto | null> => {
    setIsCapturing(true);

    try {
      const allowed = await ensureAllowed(fetchAlbumPhotos);

      if (!allowed) {
        dialog.openAlert({
          title: "앨범 권한이 필요해요",
          description: "설정에서 사진 접근을 허용한 뒤 다시 시도해주세요.",
        });
        return null;
      }

      const [photo] = await fetchAlbumPhotos({
        base64: true,
        maxWidth: 800,
        maxCount: 1,
      });

      if (!photo) {
        return null;
      }

      return { id: photo.id, dataUri: `data:image/jpeg;base64,${photo.dataUri}` };
    } catch (error) {
      console.error("앨범 선택 실패:", error);
      dialog.openAlert({
        title: "앨범을 사용할 수 없어요",
        description:
          "이 환경에서는 앨범 기능을 사용할 수 없어요.\n토스 앱 또는 샌드박스 앱에서 다시 시도해주세요.",
      });
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [dialog, ensureAllowed]);

  return { capture, pickFromAlbum, isCapturing };
}
