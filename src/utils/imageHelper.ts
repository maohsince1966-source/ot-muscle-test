/**
 * Google Drive画像URLパーサー & アナトミー画像ユーティリティ
 */

export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  
  // Format: /file/d/FILE_ID/
  const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    return matchFileD[1];
  }

  // Format: id=FILE_ID
  const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) {
    return matchIdParam[1];
  }

  return null;
}

export function getOptimizedImageUrl(rawUrl: string): {
  primaryUrl: string;
  fallbackUrl: string;
  driveViewUrl: string | null;
  isDrive: boolean;
} {
  if (!rawUrl || rawUrl.trim() === '') {
    return {
      primaryUrl: '',
      fallbackUrl: '',
      driveViewUrl: null,
      isDrive: false
    };
  }

  const fileId = extractDriveFileId(rawUrl);
  if (fileId) {
    return {
      // lh3.googleusercontent.com provides direct, fast thumbnail serving from Google Drive
      primaryUrl: `https://lh3.googleusercontent.com/d/${fileId}=w1000`,
      fallbackUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
      driveViewUrl: `https://drive.google.com/file/d/${fileId}/view`,
      isDrive: true
    };
  }

  return {
    primaryUrl: rawUrl,
    fallbackUrl: rawUrl,
    driveViewUrl: null,
    isDrive: false
  };
}

/**
 * 筋肉の解剖学的イラスト・ダイアグラムのフォールバック情報
 */
export function getAnatomicalDiagramMeta(muscleName: string, category: string) {
  if (category === 'shoulder_thorax') {
    return {
      region: '上肢帯・肩甲帯・胸郭',
      iconType: 'shoulder',
      focusArea: '肩甲骨・鎖骨・胸郭の連動と筋腱の走行',
      color: 'sky'
    };
  } else if (category === 'pelvis_lower') {
    return {
      region: '骨盤帯・股関節・大腿',
      iconType: 'pelvis',
      focusArea: '寛骨・大腿骨頭・腸脛靱帯の作用線',
      color: 'emerald'
    };
  } else {
    return {
      region: '頸部・舌骨・頭蓋頸椎移行部',
      iconType: 'neck',
      focusArea: '側頭骨・舌骨・甲状軟骨・頸椎の連動',
      color: 'indigo'
    };
  }
}
