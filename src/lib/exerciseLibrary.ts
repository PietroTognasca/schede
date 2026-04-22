const EXERCISE_DATA_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const EXERCISE_IMAGE_BASE_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

interface RemoteExercise {
  id: string
  name: string
  category: string
  level: string
  equipment: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  images: string[]
}

export interface ExerciseLibraryItem {
  id: string
  name: string
  category: string
  level: string
  equipment: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  imageUrl: string
}

let exerciseCache: ExerciseLibraryItem[] | null = null

function toSentenceCase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'N/A'
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function buildPlaceholderImage(label: string): string {
  const safeLabel = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 460 260'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#ffe2cc'/><stop offset='100%' stop-color='#ffd0a8'/></linearGradient></defs><rect width='460' height='260' fill='url(#g)'/><circle cx='90' cy='74' r='30' fill='#d6452f'/><rect x='75' y='106' width='30' height='96' rx='12' fill='#d6452f'/><line x1='90' y1='126' x2='40' y2='162' stroke='#d6452f' stroke-width='16' stroke-linecap='round'/><line x1='90' y1='126' x2='140' y2='162' stroke='#d6452f' stroke-width='16' stroke-linecap='round'/><line x1='90' y1='202' x2='62' y2='244' stroke='#d6452f' stroke-width='16' stroke-linecap='round'/><line x1='90' y1='202' x2='118' y2='244' stroke='#d6452f' stroke-width='16' stroke-linecap='round'/><text x='170' y='122' font-size='26' font-family='Verdana,sans-serif' fill='#12202a' font-weight='700'>Esercizio</text><text x='170' y='162' font-size='20' font-family='Verdana,sans-serif' fill='#233746'>${safeLabel}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function mapRemoteExercise(entry: RemoteExercise): ExerciseLibraryItem {
  const imagePath = entry.images?.[0]
  const imageUrl = imagePath
    ? `${EXERCISE_IMAGE_BASE_URL}${imagePath}`
    : buildPlaceholderImage(entry.name)

  return {
    id: entry.id,
    name: entry.name,
    category: toSentenceCase(entry.category || 'strength'),
    level: toSentenceCase(entry.level || 'beginner'),
    equipment: toSentenceCase(entry.equipment || 'body only'),
    primaryMuscles: Array.isArray(entry.primaryMuscles) ? entry.primaryMuscles : [],
    secondaryMuscles: Array.isArray(entry.secondaryMuscles)
      ? entry.secondaryMuscles
      : [],
    instructions: Array.isArray(entry.instructions) ? entry.instructions : [],
    imageUrl,
  }
}

export const FALLBACK_EXERCISES: ExerciseLibraryItem[] = [
  {
    id: 'fallback-bench-press',
    name: 'Barbell Bench Press',
    category: 'Strength',
    level: 'Intermediate',
    equipment: 'Barbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    instructions: ['Piedi stabili, scapole addotte, traiettoria controllata.'],
    imageUrl: buildPlaceholderImage('Bench Press'),
  },
  {
    id: 'fallback-back-squat',
    name: 'Back Squat',
    category: 'Strength',
    level: 'Intermediate',
    equipment: 'Barbell',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    instructions: ['Scendi con controllo mantenendo il core attivo.'],
    imageUrl: buildPlaceholderImage('Back Squat'),
  },
  {
    id: 'fallback-lat-pulldown',
    name: 'Lat Pulldown',
    category: 'Strength',
    level: 'Beginner',
    equipment: 'Machine',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps'],
    instructions: ['Tira con i gomiti verso il basso mantenendo il petto alto.'],
    imageUrl: buildPlaceholderImage('Lat Pulldown'),
  },
  {
    id: 'fallback-romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'Strength',
    level: 'Intermediate',
    equipment: 'Barbell',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['lower back'],
    instructions: ['Anca indietro, schiena neutra, ritorno esplosivo controllato.'],
    imageUrl: buildPlaceholderImage('Romanian Deadlift'),
  },
  {
    id: 'fallback-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    category: 'Strength',
    level: 'Beginner',
    equipment: 'Dumbbell',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    instructions: ['Spingi in verticale senza inarcare la zona lombare.'],
    imageUrl: buildPlaceholderImage('Shoulder Press'),
  },
]

export async function fetchExerciseLibrary(): Promise<ExerciseLibraryItem[]> {
  if (exerciseCache) {
    return exerciseCache
  }

  const response = await fetch(EXERCISE_DATA_URL)
  if (!response.ok) {
    throw new Error('Impossibile scaricare la libreria esercizi.')
  }

  const payload = (await response.json()) as RemoteExercise[]
  const mapped = payload
    .map(mapRemoteExercise)
    .sort((a, b) => a.name.localeCompare(b.name))

  if (mapped.length === 0) {
    throw new Error('La libreria esercizi e vuota.')
  }

  exerciseCache = mapped
  return mapped
}
