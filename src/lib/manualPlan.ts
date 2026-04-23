import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string'
import { buildExerciseImageUrlFromId } from './exerciseLibrary'

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
const SHARE_PAYLOAD_VERSION = 3
const SHARE_PAYLOAD_VERSION_V2 = 2

interface SharedExerciseV2 {
  n?: string
  i?: string
  e?: string
  m?: string[]
  s?: string
  r?: string
  t?: string
  o?: string
  u?: string
}

interface SharedDayV2 {
  t: string
  f?: string
  n?: string
  x: SharedExerciseV2[]
}

interface SharedPlanV2 {
  n: string
  o?: string
  d?: string
  c?: string
  y: SharedDayV2[]
}

interface SharedEnvelopeV2 {
  v: number
  p: SharedPlanV2[]
}

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
    imageUrl:
      typeof value.imageUrl === 'string' && !value.imageUrl.startsWith('data:image')
        ? value.imageUrl
        : '',
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

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function shouldIncludeImageUrl(imageUrl: string, exerciseId: string): boolean {
  const normalized = imageUrl.trim()
  if (!normalized || normalized.startsWith('data:image')) {
    return false
  }

  if (
    exerciseId.length > 0 &&
    !exerciseId.startsWith('custom-exercise-') &&
    normalized === buildExerciseImageUrlFromId(exerciseId)
  ) {
    return false
  }

  return true
}

function labelFromExerciseId(exerciseId: string): string {
  const normalized = exerciseId
    .trim()
    .replace(/^custom-exercise-/, '')
    .replace(/^shared-exercise-/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')

  if (!normalized) {
    return ''
  }

  return normalized
    .split(' ')
    .filter((piece) => piece.length > 0)
    .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
    .join(' ')
}

function toSharedExerciseV2(exercise: PlanExerciseEntry): SharedExerciseV2 {
  const shared: SharedExerciseV2 = {}

  const exerciseId = exercise.exerciseId.trim()
  const isCustomExercise =
    exerciseId.length === 0 || exerciseId.startsWith('custom-exercise-')

  if (exerciseId.length > 0) {
    shared.i = exerciseId
  }

  // For built-in exercises we can rebuild the display name from exerciseId,
  // so we keep `n` only for custom entries to keep shared URLs shorter.
  if (isCustomExercise && exercise.name.trim().length > 0) {
    shared.n = exercise.name
  }

  if (
    isCustomExercise &&
    exercise.equipment.trim().length > 0 &&
    exercise.equipment !== 'N/A'
  ) {
    shared.e = exercise.equipment
  }

  if (isCustomExercise && exercise.primaryMuscles.length > 0) {
    shared.m = exercise.primaryMuscles
  }

  if (exercise.sets !== '3') {
    shared.s = exercise.sets
  }

  if (exercise.reps !== '8-12') {
    shared.r = exercise.reps
  }

  if (exercise.rest !== '90 sec') {
    shared.t = exercise.rest
  }

  if (exercise.notes.trim().length > 0) {
    shared.o = exercise.notes
  }

  if (shouldIncludeImageUrl(exercise.imageUrl, exercise.exerciseId)) {
    shared.u = exercise.imageUrl
  }

  return shared
}

function toSharedPlanV2(plan: FriendPlan): SharedPlanV2 {
  return {
    n: plan.friendName.trim(),
    o: plan.objective.trim(),
    d: plan.duration.trim(),
    c: plan.coachNotes.trim(),
    y: plan.days.map((day) => ({
      t: day.title,
      f: day.focus,
      n: day.notes,
      x: day.exercises.map(toSharedExerciseV2),
    })),
  }
}

function fromSharedExerciseV2(value: unknown): PlanExerciseEntry | null {
  if (!isObject(value)) {
    return null
  }

  const exerciseId =
    typeof value.i === 'string' && value.i.trim().length > 0
      ? value.i
      : createId('shared-exercise')

  const explicitName = typeof value.n === 'string' ? value.n.trim() : ''
  const inferredName = labelFromExerciseId(exerciseId)
  const name = explicitName || inferredName
  if (!name) {
    return null
  }

  const explicitImage =
    typeof value.u === 'string' && value.u.trim().length > 0 ? value.u.trim() : ''
  const inferredImage =
    explicitImage.length === 0 && !exerciseId.startsWith('custom-exercise-')
      ? buildExerciseImageUrlFromId(exerciseId)
      : ''

  const primaryMuscles = Array.isArray(value.m)
    ? value.m.filter((muscle): muscle is string => typeof muscle === 'string')
    : []

  return {
    id: createId('entry'),
    exerciseId,
    name,
    imageUrl: explicitImage || inferredImage,
    equipment: typeof value.e === 'string' && value.e.trim().length > 0 ? value.e : 'N/A',
    primaryMuscles,
    sets: typeof value.s === 'string' && value.s.trim().length > 0 ? value.s : '3',
    reps: typeof value.r === 'string' && value.r.trim().length > 0 ? value.r : '8-12',
    rest: typeof value.t === 'string' && value.t.trim().length > 0 ? value.t : '90 sec',
    notes: typeof value.o === 'string' ? value.o : '',
  }
}

function fromSharedDayV2(value: unknown, dayIndex: number): PlanDay | null {
  if (!isObject(value)) {
    return null
  }

  const title =
    typeof value.t === 'string' && value.t.trim().length > 0
      ? value.t
      : `Giorno ${dayIndex + 1}`

  const exercisesInput = Array.isArray(value.x) ? value.x : []
  const exercises = exercisesInput
    .map((exercise) => fromSharedExerciseV2(exercise))
    .filter((exercise): exercise is PlanExerciseEntry => exercise !== null)

  return {
    id: createId('day'),
    title,
    focus: typeof value.f === 'string' ? value.f : '',
    notes: typeof value.n === 'string' ? value.n : '',
    exercises,
  }
}

function fromSharedPlanV2(value: unknown): FriendPlan | null {
  if (!isObject(value)) {
    return null
  }

  const friendName =
    typeof value.n === 'string' && value.n.trim().length > 0
      ? value.n.trim()
      : ''

  if (!friendName) {
    return null
  }

  const now = new Date().toISOString()
  const daysInput = Array.isArray(value.y) ? value.y : []
  const days = daysInput
    .map((day, index) => fromSharedDayV2(day, index))
    .filter((day): day is PlanDay => day !== null)

  if (days.length === 0) {
    days.push(createEmptyDay(1))
  }

  return {
    id: createId('plan'),
    friendName,
    objective:
      typeof value.o === 'string' && value.o.trim().length > 0
        ? value.o
        : DEFAULT_OBJECTIVE,
    duration:
      typeof value.d === 'string' && value.d.trim().length > 0
        ? value.d
        : '4 settimane',
    coachNotes: typeof value.c === 'string' ? value.c : '',
    createdAt: now,
    updatedAt: now,
    days,
  }
}

function decodeV2Payload(input: unknown): FriendPlan[] | null {
  if (!isObject(input)) {
    return null
  }

  const version = input.v
  const plansPayload = input.p

  if (
    (version !== SHARE_PAYLOAD_VERSION && version !== SHARE_PAYLOAD_VERSION_V2) ||
    !Array.isArray(plansPayload)
  ) {
    return null
  }

  const plans = plansPayload
    .map((plan) => fromSharedPlanV2(plan))
    .filter((plan): plan is FriendPlan => plan !== null)

  return plans.length > 0 ? plans : null
}

function decodeFromEncodedPayload(encoded: string): FriendPlan[] | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded)
    if (!json) {
      return null
    }

    const parsed = JSON.parse(json)
    const compactPlans = decodeV2Payload(parsed)
    if (compactPlans) {
      return compactPlans
    }

    const legacyPlans = normalizePlans(parsed)
    return legacyPlans.length > 0 ? legacyPlans : null
  } catch {
    return null
  }
}

export function encodePlansForUrl(plans: FriendPlan[]): string {
  const payload: SharedEnvelopeV2 = {
    v: SHARE_PAYLOAD_VERSION,
    p: plans.map((plan) => toSharedPlanV2(plan)),
  }

  return compressToEncodedURIComponent(JSON.stringify(payload))
}

export function decodePlansFromUrl(encoded: string | null): FriendPlan[] | null {
  if (!encoded) {
    return null
  }

  const trimmed = encoded.trim()
  if (!trimmed) {
    return null
  }

  const decodedComponent = safeDecodeURIComponent(trimmed)
  const candidates = Array.from(
    new Set([
      trimmed,
      trimmed.replace(/ /g, '+'),
      decodedComponent,
      decodedComponent.replace(/ /g, '+'),
    ]),
  )

  for (const candidate of candidates) {
    const decoded = decodeFromEncodedPayload(candidate)
    if (decoded && decoded.length > 0) {
      return decoded
    }
  }

  return null
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
