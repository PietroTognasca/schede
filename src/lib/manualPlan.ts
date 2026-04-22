import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'

export interface PlanExerciseEntry {
  id: string
  exerciseId: string
  name: string
  imageUrl: string
  equipment: string
  primaryMuscles: string[]
  sets: string
  reps: string
  rest: string
  notes: string
}

export interface PlanDay {
  id: string
  title: string
  focus: string
  notes: string
  exercises: PlanExerciseEntry[]
}

export interface FriendPlan {
  id: string
  friendName: string
  objective: string
  duration: string
  coachNotes: string
  createdAt: string
  updatedAt: string
  days: PlanDay[]
}

const DEFAULT_OBJECTIVE = 'Ipertrofia generale'

function randomToken(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${randomToken()}`
}

export function createEmptyDay(dayNumber: number): PlanDay {
  return {
    id: createId('day'),
    title: `Giorno ${dayNumber}`,
    focus: '',
    notes: '',
    exercises: [],
  }
}

export function createEmptyPlan(): FriendPlan {
  const now = new Date().toISOString()
  return {
    id: createId('plan'),
    friendName: 'Nuovo Atleta',
    objective: DEFAULT_OBJECTIVE,
    duration: '4 settimane',
    coachNotes: '',
    createdAt: now,
    updatedAt: now,
    days: [createEmptyDay(1)],
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeExercise(value: unknown): PlanExerciseEntry | null {
  if (!isObject(value)) {
    return null
  }

  const id = typeof value.id === 'string' ? value.id : createId('entry')
  const name = typeof value.name === 'string' ? value.name : ''
  if (!name) {
    return null
  }

  const primaryMuscles = Array.isArray(value.primaryMuscles)
    ? value.primaryMuscles.filter((muscle): muscle is string => typeof muscle === 'string')
    : []

  return {
    id,
    exerciseId: typeof value.exerciseId === 'string' ? value.exerciseId : id,
    name,
    imageUrl: typeof value.imageUrl === 'string' ? value.imageUrl : '',
    equipment: typeof value.equipment === 'string' ? value.equipment : 'N/A',
    primaryMuscles,
    sets: typeof value.sets === 'string' ? value.sets : '3',
    reps: typeof value.reps === 'string' ? value.reps : '8-12',
    rest: typeof value.rest === 'string' ? value.rest : '90 sec',
    notes: typeof value.notes === 'string' ? value.notes : '',
  }
}

function normalizeDay(value: unknown, fallbackIndex: number): PlanDay | null {
  if (!isObject(value)) {
    return null
  }

  const exercisesInput = Array.isArray(value.exercises) ? value.exercises : []
  const exercises = exercisesInput
    .map((exercise) => normalizeExercise(exercise))
    .filter((exercise): exercise is PlanExerciseEntry => exercise !== null)

  return {
    id: typeof value.id === 'string' ? value.id : createId('day'),
    title:
      typeof value.title === 'string' && value.title.trim().length > 0
        ? value.title
        : `Giorno ${fallbackIndex + 1}`,
    focus: typeof value.focus === 'string' ? value.focus : '',
    notes: typeof value.notes === 'string' ? value.notes : '',
    exercises,
  }
}

function normalizePlan(value: unknown): FriendPlan | null {
  if (!isObject(value)) {
    return null
  }

  const friendName =
    typeof value.friendName === 'string' ? value.friendName.trim() : ''
  if (!friendName) {
    return null
  }

  const daysInput = Array.isArray(value.days) ? value.days : []
  const days = daysInput
    .map((day, index) => normalizeDay(day, index))
    .filter((day): day is PlanDay => day !== null)

  if (days.length === 0) {
    days.push(createEmptyDay(1))
  }

  return {
    id: typeof value.id === 'string' ? value.id : createId('plan'),
    friendName,
    objective:
      typeof value.objective === 'string' && value.objective.trim().length > 0
        ? value.objective
        : DEFAULT_OBJECTIVE,
    duration:
      typeof value.duration === 'string' && value.duration.trim().length > 0
        ? value.duration
        : '4 settimane',
    coachNotes: typeof value.coachNotes === 'string' ? value.coachNotes : '',
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
    days,
  }
}

export function normalizePlans(input: unknown): FriendPlan[] {
  if (!Array.isArray(input)) {
    return []
  }

  return input
    .map((plan) => normalizePlan(plan))
    .filter((plan): plan is FriendPlan => plan !== null)
}

export function encodePlansForUrl(plans: FriendPlan[]): string {
  const payload = plans.map((plan) => ({
    ...plan,
    friendName: plan.friendName.trim(),
  }))

  return compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodePlansFromUrl(encoded: string | null): FriendPlan[] | null {
  if (!encoded) {
    return null
  }

  try {
    const json = decompressFromEncodedURIComponent(encoded)
    if (!json) {
      return null
    }

    const parsed = JSON.parse(json)
    const plans = normalizePlans(parsed)
    return plans.length > 0 ? plans : null
  } catch {
    return null
  }
}

export function formatDateLabel(dateIso: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateIso))
}

export function countPlanExercises(plan: FriendPlan): number {
  return plan.days.reduce((total, day) => total + day.exercises.length, 0)
}

export function formatPlanForClipboard(plan: FriendPlan): string {
  const lines: string[] = [
    `Scheda Allenamento - ${plan.friendName}`,
    `Obiettivo: ${plan.objective}`,
    `Durata: ${plan.duration}`,
    `Ultimo aggiornamento: ${formatDateLabel(plan.updatedAt)}`,
    '',
  ]

  if (plan.coachNotes.trim().length > 0) {
    lines.push('Note Coach:')
    lines.push(plan.coachNotes.trim())
    lines.push('')
  }

  for (const day of plan.days) {
    lines.push(`${day.title}${day.focus ? ` - ${day.focus}` : ''}`)

    if (day.notes.trim().length > 0) {
      lines.push(`Nota giorno: ${day.notes.trim()}`)
    }

    for (const exercise of day.exercises) {
      const muscles = exercise.primaryMuscles.join(', ')
      lines.push(
        `- ${exercise.name} | ${exercise.sets} serie | ${exercise.reps} reps | recupero ${exercise.rest}${muscles ? ` | muscoli: ${muscles}` : ''}`,
      )

      if (exercise.notes.trim().length > 0) {
        lines.push(`  note: ${exercise.notes.trim()}`)
      }
    }

    lines.push('')
  }

  return lines.join('\n')
}
