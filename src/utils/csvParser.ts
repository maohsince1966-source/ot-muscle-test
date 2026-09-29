import { Muscle, MuscleCategory } from '../types/muscle';

/**
 * Standard CSV Line Parser accounting for quoted cells with internal commas
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function inferCourseFromCategory(category: MuscleCategory): 'upper' | 'lower' | 'trunk_neck' {
  if (['shoulder_thorax', 'shoulder_joint', 'arm', 'forearm', 'hand'].includes(category)) {
    return 'upper';
  }
  if (['pelvis_lower', 'thigh', 'leg_foot'].includes(category)) {
    return 'lower';
  }
  return 'trunk_neck';
}

/**
 * Parses multi-line CSV with the schema:
 * 筋名,起始,停止,支配神経,髄節レベル,作用(運動),画像URL
 */
export function parseMuscleCSV(csvText: string, defaultCategory: MuscleCategory): Muscle[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const muscles: Muscle[] = [];
  const course = inferCourseFromCategory(defaultCategory);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const columns = parseCSVLine(line);

    // Skip header row if it matches typical column titles
    if (i === 0 && (columns[0] === '筋名' || columns[0]?.includes('筋') || columns[1]?.includes('起始'))) {
      continue;
    }

    const name = columns[0] || '';
    if (!name.trim()) continue;

    const origin = columns[1] || '';
    const insertion = columns[2] || '';
    const nerve = columns[3] || '';
    const segmentLevel = columns[4] || '';
    const action = columns[5] || '';
    const imageUrl = columns[6] || '';

    muscles.push({
      id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      course,
      category: defaultCategory,
      origin: origin.trim(),
      insertion: insertion.trim(),
      nerve: nerve.trim(),
      segmentLevel: segmentLevel.trim(),
      action: action.trim(),
      imageUrl: imageUrl.trim()
    });
  }

  return muscles;
}
