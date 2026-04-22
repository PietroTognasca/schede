export type Goal = 'ipertrofia' | 'forza' | 'dimagrimento' | 'ricomposizione'
export type Level = 'principiante' | 'intermedio' | 'avanzato'
export type TrainingContext = 'palestra' | 'casa' | 'ibrido'
export type EquipmentTag =
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell'
  | 'machines'
  | 'bands'
  | 'kettlebell'

export interface FriendProfile {
  friendName: string
  goal: Goal
  level: Level
  daysPerWeek: number
  sessionMinutes: number
  context: TrainingContext
  equipment: EquipmentTag[]
  notes: string
}

export interface WorkoutExercise {
  block: string
  name: string
  prescription: string
  note: string
}

export interface WorkoutDay {
  title: string
  focus: string
  warmup: string[]
  exercises: WorkoutExercise[]
  finisher: string
  cooldown: string[]
}

export interface GeneratedPlan {
  id: string
  createdAt: string
  profile: FriendProfile
  weeklyGuidelines: string[]
  days: WorkoutDay[]
}

export const goalOptions: Array<{ value: Goal; label: string }> = [
  { value: 'ipertrofia', label: 'Ipertrofia' },
  { value: 'forza', label: 'Forza' },
  { value: 'dimagrimento', label: 'Dimagrimento' },
  { value: 'ricomposizione', label: 'Ricomposizione' },
]

export const levelOptions: Array<{ value: Level; label: string }> = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzato', label: 'Avanzato' },
]

export const contextOptions: Array<{ value: TrainingContext; label: string }> = [
  { value: 'palestra', label: 'Palestra' },
  { value: 'casa', label: 'Casa' },
  { value: 'ibrido', label: 'Ibrido' },
]

export const equipmentOptions: Array<{ value: EquipmentTag; label: string }> = [
  { value: 'bodyweight', label: 'Corpo libero' },
  { value: 'dumbbells', label: 'Manubri' },
  { value: 'barbell', label: 'Bilanciere' },
  { value: 'machines', label: 'Macchine' },
  { value: 'bands', label: 'Elastici' },
  { value: 'kettlebell', label: 'Kettlebell' },
]

type Focus =
  | 'Spinta'
  | 'Trazione'
  | 'Gambe'
  | 'Upper'
  | 'Lower'
  | 'Full Body'
  | 'Conditioning'

interface ExerciseOption {
  name: string
  equipment: EquipmentTag[]
  cue: string
}

interface FocusLibrary {
  compounds: ExerciseOption[]
  accessories: ExerciseOption[]
  core: ExerciseOption[]
  finishers: string[]
}

interface GoalPreset {
  mainVolume: string
  secondaryVolume: string
  accessoryVolume: string
  coreVolume: string
  restMain: string
  restAccessory: string
  finisherDuration: string
  intensityHint: string
}

const GOAL_PRESETS: Record<Goal, GoalPreset> = {
  ipertrofia: {
    mainVolume: '4 x 6-8',
    secondaryVolume: '4 x 8-10',
    accessoryVolume: '3 x 10-15',
    coreVolume: '3 x 30-45 sec',
    restMain: '90-120 sec',
    restAccessory: '45-75 sec',
    finisherDuration: '8-10 min',
    intensityHint: 'Mantieni RPE 7-8 e lascia 1-2 ripetizioni in riserva.',
  },
  forza: {
    mainVolume: '5 x 3-5',
    secondaryVolume: '4 x 4-6',
    accessoryVolume: '3 x 6-10',
    coreVolume: '4 x 20-30 sec',
    restMain: '150-210 sec',
    restAccessory: '60-90 sec',
    finisherDuration: '6-8 min',
    intensityHint: 'Lavora con RPE 8 sui multiarticolari e tecnica impeccabile.',
  },
  dimagrimento: {
    mainVolume: '3-4 x 8-12',
    secondaryVolume: '3 x 10-12',
    accessoryVolume: '2-3 x 12-18',
    coreVolume: '3 x 35-50 sec',
    restMain: '60-90 sec',
    restAccessory: '30-60 sec',
    finisherDuration: '10-14 min',
    intensityHint: 'Densita alta: recuperi stretti e ritmo costante.',
  },
  ricomposizione: {
    mainVolume: '4 x 5-8',
    secondaryVolume: '3-4 x 8-10',
    accessoryVolume: '3 x 10-14',
    coreVolume: '3 x 30-40 sec',
    restMain: '90-150 sec',
    restAccessory: '45-75 sec',
    finisherDuration: '8-12 min',
    intensityHint: 'Alterna giorni piu intensi e giorni orientati al pump.',
  },
}

const LEVEL_PROGRESSIONS: Record<Level, string> = {
  principiante:
    'Progressione consigliata: aggiungi 1-2 ripetizioni totali a settimana prima di aumentare il carico.',
  intermedio:
    'Progressione consigliata: aumento carico del 2.5-5% ogni 1-2 settimane quando completi tutte le serie target.',
  avanzato:
    'Progressione consigliata: cicli di 3 settimane con incremento graduale e 1 settimana di scarico tecnico.',
}

const FOCUS_LIBRARY: Record<Focus, FocusLibrary> = {
  Spinta: {
    compounds: [
      { name: 'Panca piana bilanciere', equipment: ['barbell'], cue: 'Piedi stabili e scapole addotte.' },
      { name: 'Distensioni manubri inclinata', equipment: ['dumbbells'], cue: 'Controlla l eccentrica per 2-3 secondi.' },
      { name: 'Military press in piedi', equipment: ['barbell', 'dumbbells'], cue: 'Core attivo e traiettoria verticale.' },
      { name: 'Push-up zavorrati', equipment: ['bodyweight'], cue: 'Linea testa-anca-talloni sempre allineata.' },
      { name: 'Chest press macchina', equipment: ['machines'], cue: 'Spingi fino a quasi estensione completa.' },
    ],
    accessories: [
      { name: 'Alzate laterali', equipment: ['dumbbells', 'bands'], cue: 'Altezza spalle, gomito morbido.' },
      { name: 'Dip su parallele assistite', equipment: ['machines', 'bodyweight'], cue: 'Scendi finche il petto resta aperto.' },
      { name: 'Estensioni tricipiti ai cavi', equipment: ['machines', 'bands'], cue: 'Gomiti fissi vicino al corpo.' },
      { name: 'French press manubrio', equipment: ['dumbbells'], cue: 'Movimento pieno senza compensi lombari.' },
      { name: 'Push-up stretti', equipment: ['bodyweight'], cue: 'Mani sotto le spalle, gomiti vicini.' },
    ],
    core: [
      { name: 'Dead bug', equipment: ['bodyweight'], cue: 'Mantieni zona lombare a contatto con il suolo.' },
      { name: 'Plank RKC', equipment: ['bodyweight'], cue: 'Contrai glutei e addome al massimo.' },
      { name: 'Pallof press', equipment: ['bands', 'machines'], cue: 'Resisti alla rotazione del busto.' },
    ],
    finishers: [
      'EMOM: 8 burpees + 10 mountain climber per lato.',
      'Circuito 3 giri: battle rope 30 sec + camminata veloce 60 sec.',
      'AMRAP tecnico: 10 push-up + 12 squat a corpo libero + 20 sec plank.',
    ],
  },
  Trazione: {
    compounds: [
      { name: 'Rematore bilanciere', equipment: ['barbell'], cue: 'Busto inclinato stabile e tirata verso ombelico.' },
      { name: 'Trazioni alla sbarra', equipment: ['bodyweight'], cue: 'Parti da scapole depresse e petto alto.' },
      { name: 'Lat machine presa neutra', equipment: ['machines'], cue: 'Porta i gomiti in basso e indietro.' },
      { name: 'Rematore manubrio su panca', equipment: ['dumbbells'], cue: 'Paura zero per il range completo.' },
      { name: 'Pulley basso', equipment: ['machines'], cue: 'Chiudi con una forte adduzione scapolare.' },
    ],
    accessories: [
      { name: 'Face pull', equipment: ['bands', 'machines'], cue: 'Tira verso il volto con gomiti alti.' },
      { name: 'Curl manubri alternato', equipment: ['dumbbells'], cue: 'Evita slancio del busto.' },
      { name: 'Hammer curl', equipment: ['dumbbells'], cue: 'Polso neutro e controllo totale.' },
      { name: 'Pullover con elastico', equipment: ['bands'], cue: 'Senti il dorsale nella fase finale.' },
      { name: 'Inverted row', equipment: ['bodyweight'], cue: 'Corpo in asse e petto verso la barra.' },
    ],
    core: [
      { name: 'Side plank', equipment: ['bodyweight'], cue: 'Spalle e anche allineate.' },
      { name: 'Hollow hold', equipment: ['bodyweight'], cue: 'Respira senza perdere tenuta addominale.' },
      { name: 'Farmer carry', equipment: ['dumbbells', 'kettlebell'], cue: 'Passo corto, tronco stabile.' },
    ],
    finishers: [
      'Rowing machine a intervalli: 30 sec forte / 30 sec facile.',
      'Circuito 4 giri: 12 band row + 10 reverse lunge per lato.',
      'Sprint bike 10 x 20 sec con 40 sec recupero.',
    ],
  },
  Gambe: {
    compounds: [
      { name: 'Back squat', equipment: ['barbell'], cue: 'Scendi controllato e risali spingendo il pavimento.' },
      { name: 'Front squat', equipment: ['barbell'], cue: 'Gomiti alti e tronco verticale.' },
      { name: 'Leg press', equipment: ['machines'], cue: 'Piede pieno sulla pedana e ROM completo.' },
      { name: 'Goblet squat', equipment: ['dumbbells', 'kettlebell'], cue: 'Ginocchia in linea con le punte.' },
      { name: 'Bulgarian split squat', equipment: ['dumbbells', 'bodyweight'], cue: 'Controlla il ginocchio anteriore.' },
    ],
    accessories: [
      { name: 'Romanian deadlift', equipment: ['barbell', 'dumbbells'], cue: 'Anca indietro e schiena neutra.' },
      { name: 'Hip thrust', equipment: ['barbell', 'dumbbells'], cue: 'Picco di contrazione in alto.' },
      { name: 'Leg curl', equipment: ['machines', 'bands'], cue: 'Mantieni bacino fermo.' },
      { name: 'Calf raise', equipment: ['machines', 'bodyweight'], cue: 'Massimo allungamento e massimo picco.' },
      { name: 'Step-up', equipment: ['dumbbells', 'bodyweight'], cue: 'Spingi con la gamba sul box.' },
    ],
    core: [
      { name: 'Plank con sollevamento alternato', equipment: ['bodyweight'], cue: 'Ruota il minimo possibile il bacino.' },
      { name: 'Ab wheel / rollout', equipment: ['bodyweight'], cue: 'Range gestito senza perdere postura.' },
      { name: 'Suitcase carry', equipment: ['dumbbells', 'kettlebell'], cue: 'Cammina senza inclinare il busto.' },
    ],
    finishers: [
      'Sled push o camminata in salita per 10 minuti.',
      'Circuito metabolico: 12 squat jump + 10 affondi per lato + 30 sec jump rope.',
      'Bike interval: 12 minuti in progressione da zona 2 a zona 4.',
    ],
  },
  Upper: {
    compounds: [
      { name: 'Panca piana manubri', equipment: ['dumbbells'], cue: 'Stabilita scapolare costante.' },
      { name: 'Rematore chest-supported', equipment: ['dumbbells', 'machines'], cue: 'Evita compensi lombari.' },
      { name: 'Overhead press seduto', equipment: ['dumbbells'], cue: 'Spingi in verticale senza iperestendere la schiena.' },
      { name: 'Lat machine presa larga', equipment: ['machines'], cue: 'Controlla la fase eccentrica.' },
      { name: 'Push-up con elastico', equipment: ['bodyweight', 'bands'], cue: 'Mantieni cadenza regolare.' },
    ],
    accessories: [
      { name: 'Alzate laterali su panca inclinata', equipment: ['dumbbells'], cue: 'Movimento pulito e senza slanci.' },
      { name: 'Face pull con corda', equipment: ['machines', 'bands'], cue: 'Chiudi forte tra le scapole.' },
      { name: 'Curl su panca inclinata', equipment: ['dumbbells'], cue: 'Fase eccentrica lenta.' },
      { name: 'Pushdown tricipiti', equipment: ['machines', 'bands'], cue: 'Evita apertura dei gomiti.' },
      { name: 'Rear delt fly', equipment: ['dumbbells', 'machines'], cue: 'Pollice leggermente ruotato in basso.' },
    ],
    core: [
      { name: 'Pallof hold', equipment: ['bands', 'machines'], cue: 'Bacino neutro e respirazione nasale.' },
      { name: 'Crunch con espirazione profonda', equipment: ['bodyweight'], cue: 'Schiena bassa stabile sul suolo.' },
      { name: 'Plank laterale dinamico', equipment: ['bodyweight'], cue: 'Movimento piccolo ma controllato.' },
    ],
    finishers: [
      'Circuito upper pump: 45 sec lavoro / 15 sec pausa per 10 minuti.',
      'Assault bike interval: 6 round da 40 sec lavoro + 20 sec pausa.',
      'Farmer carry + battle rope alternati per 8 minuti.',
    ],
  },
  Lower: {
    compounds: [
      { name: 'Trap bar deadlift', equipment: ['barbell'], cue: 'Spingi con gambe e mantieni petto alto.' },
      { name: 'Squat bulgaro avanzato', equipment: ['dumbbells'], cue: 'Fase eccentrica lenta e controllo totale.' },
      { name: 'Hack squat', equipment: ['machines'], cue: 'Scendi in profondita gestibile.' },
      { name: 'Stacco sumo', equipment: ['barbell'], cue: 'Apri le anche e mantieni traiettoria corta.' },
      { name: 'Affondi camminati', equipment: ['dumbbells', 'bodyweight'], cue: 'Passo ampio e tronco stabile.' },
    ],
    accessories: [
      { name: 'Leg extension', equipment: ['machines', 'bands'], cue: 'Picco di contrazione al top.' },
      { name: 'Nordic curl assistito', equipment: ['bodyweight', 'bands'], cue: 'Mantieni linea ginocchia-spalle.' },
      { name: 'Hip thrust monopodalico', equipment: ['bodyweight', 'dumbbells'], cue: 'Anca in estensione piena.' },
      { name: 'Good morning leggero', equipment: ['barbell', 'bands'], cue: 'Focalizzati sulla catena posteriore.' },
      { name: 'Calf raise seduto', equipment: ['machines', 'dumbbells'], cue: 'Tempo sotto tensione elevato.' },
    ],
    core: [
      { name: 'Bird dog controllato', equipment: ['bodyweight'], cue: 'Mantieni bacino fermo durante il gesto.' },
      { name: 'Reverse crunch', equipment: ['bodyweight'], cue: 'Solleva il bacino senza slancio.' },
      { name: 'Carry front rack', equipment: ['kettlebell', 'dumbbells'], cue: 'Gomiti alti e tronco verticale.' },
    ],
    finishers: [
      'Sled drag o camminata inclinata 10-12 minuti.',
      'EMOM 12 min: 12 swing + 8 goblet squat.',
      'Intervalli corsa: 1 min veloce / 1 min lento per 12 min.',
    ],
  },
  'Full Body': {
    compounds: [
      { name: 'Goblet squat + push press', equipment: ['dumbbells', 'kettlebell'], cue: 'Sequenza fluida e tecnica pulita.' },
      { name: 'Stacco rumeno + rematore', equipment: ['barbell', 'dumbbells'], cue: 'Mantieni schiena neutra in tutto il set.' },
      { name: 'Affondo indietro + curl', equipment: ['dumbbells', 'bodyweight'], cue: 'Controlla equilibrio e ritmo.' },
      { name: 'Thruster manubri', equipment: ['dumbbells'], cue: 'Esplosivita in salita e controllo in discesa.' },
      { name: 'Push-up + row elastico', equipment: ['bodyweight', 'bands'], cue: 'Alterna spinta e trazione con postura attiva.' },
    ],
    accessories: [
      { name: 'Hip hinge con elastico', equipment: ['bands'], cue: 'Senti il lavoro su glutei e femorali.' },
      { name: 'Rematore TRX / inverted row', equipment: ['bodyweight'], cue: 'Mantieni allineamento testa-colonna.' },
      { name: 'Alzate laterali + frontali', equipment: ['dumbbells'], cue: 'Volume moderato ma costante.' },
      { name: 'Push-up incline', equipment: ['bodyweight'], cue: 'ROM completo con controllo del core.' },
      { name: 'Swing kettlebell', equipment: ['kettlebell'], cue: 'Potenza dell anca, non delle braccia.' },
    ],
    core: [
      { name: 'Plank dinamico', equipment: ['bodyweight'], cue: 'Mantieni bacino stabile durante la transizione.' },
      { name: 'Sit-up controllato', equipment: ['bodyweight'], cue: 'Espira forte in chiusura.' },
      { name: 'Russian twist', equipment: ['bodyweight', 'dumbbells'], cue: 'Ruota il busto senza perdere assetto.' },
    ],
    finishers: [
      'Circuito total body 4 round da 3 minuti, 1 minuto pausa.',
      'Jump rope + air squat in ladder 10 minuti.',
      'AMRAP 12 minuti: 8 burpees, 12 swing, 16 mountain climber.',
    ],
  },
  Conditioning: {
    compounds: [
      { name: 'Camminata in salita', equipment: ['bodyweight'], cue: 'Mantieni respirazione nasale per le prime fasi.' },
      { name: 'Bike ergometro', equipment: ['machines'], cue: 'Cadenza stabile e postura rilassata.' },
      { name: 'Row ergometro', equipment: ['machines'], cue: 'Spinta con gambe e tirata coordinata.' },
      { name: 'Circuito kettlebell base', equipment: ['kettlebell'], cue: 'Tecnica sempre prioritaria sulla velocita.' },
      { name: 'Step-up a tempo', equipment: ['bodyweight', 'dumbbells'], cue: 'Appoggio completo del piede sulla pedana.' },
    ],
    accessories: [
      { name: 'Mobility flow torace/anche', equipment: ['bodyweight'], cue: 'Respirazione lunga durante ogni transizione.' },
      { name: 'Band pull-apart', equipment: ['bands'], cue: 'Rallenta il ritorno per stimolo posturale.' },
      { name: 'Wall sit', equipment: ['bodyweight'], cue: 'Ginocchia a 90 gradi e schiena aderente al muro.' },
      { name: 'Shadow boxing', equipment: ['bodyweight'], cue: 'Movimento leggero e continuo.' },
      { name: 'Jump rope', equipment: ['bodyweight'], cue: 'Atterraggio morbido e frequenza costante.' },
    ],
    core: [
      { name: 'Breathing plank', equipment: ['bodyweight'], cue: 'Espira lunga e attiva trasverso addominale.' },
      { name: 'Glute bridge hold', equipment: ['bodyweight'], cue: 'Tieni il bacino in linea senza cedere.' },
      { name: 'Anti-rotation march', equipment: ['bands'], cue: 'Controlla ogni appoggio del piede.' },
    ],
    finishers: [
      'Zone 2 continua: 20 minuti a ritmo conversazionale.',
      'Intervalli 10 x 1 minuto forte + 1 minuto facile.',
      'Circuito mobilita + core 15 minuti per recupero attivo.',
    ],
  },
}

const ALL_EQUIPMENT: EquipmentTag[] = [
  'bodyweight',
  'dumbbells',
  'barbell',
  'machines',
  'bands',
  'kettlebell',
]

function buildWeeklySplit(daysPerWeek: number): string[] {
  switch (daysPerWeek) {
    case 2:
      return ['Full Body A', 'Full Body B']
    case 3:
      return ['Spinta', 'Trazione', 'Gambe']
    case 4:
      return ['Upper A', 'Lower A', 'Upper B', 'Lower B']
    case 5:
      return ['Spinta', 'Trazione', 'Gambe', 'Upper Richiamo', 'Conditioning']
    case 6:
      return ['Spinta', 'Trazione', 'Gambe', 'Upper', 'Lower', 'Conditioning']
    default:
      return ['Full Body', 'Full Body B']
  }
}

function resolveFocus(splitLabel: string): Focus {
  if (splitLabel.startsWith('Spinta')) return 'Spinta'
  if (splitLabel.startsWith('Trazione')) return 'Trazione'
  if (splitLabel.startsWith('Gambe')) return 'Gambe'
  if (splitLabel.startsWith('Upper')) return 'Upper'
  if (splitLabel.startsWith('Lower')) return 'Lower'
  if (splitLabel.startsWith('Full Body')) return 'Full Body'
  return 'Conditioning'
}

function isExerciseAvailable(
  exercise: ExerciseOption,
  availableEquipment: Set<EquipmentTag>,
): boolean {
  return exercise.equipment.some((equipment) => availableEquipment.has(equipment))
}

function pickExercise(
  pool: ExerciseOption[],
  seed: number,
  availableEquipment: Set<EquipmentTag>,
  usedNames: Set<string>,
): ExerciseOption {
  const availablePool = pool.filter((exercise) =>
    isExerciseAvailable(exercise, availableEquipment),
  )
  const source = availablePool.length > 0 ? availablePool : pool

  for (let offset = 0; offset < source.length; offset += 1) {
    const candidate = source[(seed + offset) % source.length]
    if (!usedNames.has(candidate.name)) {
      usedNames.add(candidate.name)
      return candidate
    }
  }

  return source[seed % source.length]
}

function buildWarmup(focus: Focus): string[] {
  const mobilityMap: Record<Focus, string> = {
    Spinta: 'Mobilita toracica + attivazione cuffia dei rotatori (2 serie leggere).',
    Trazione: 'Attivazione dorsali e scapole con elastico (2 serie).',
    Gambe: 'Mobilita anche/caviglie e squat a corpo libero progressivi.',
    Upper: 'Mobilita spalle + scap push-up + rotazioni esterne con elastico.',
    Lower: 'Mobilita anca/caviglia + glute bridge + affondi dinamici.',
    'Full Body': 'Attivazione globale con 5 minuti di circuito tecnico.',
    Conditioning: 'Partenza graduale in zona cardio bassa per 4-5 minuti.',
  }

  return [
    '5-8 minuti di riscaldamento generale (camminata, bike o salto corda).',
    mobilityMap[focus],
    '1-2 serie di avvicinamento sul primo esercizio multiarticolare.',
  ]
}

function buildCooldown(focus: Focus): string[] {
  if (focus === 'Conditioning') {
    return [
      'Defaticamento 5 minuti a ritmo blando.',
      'Respirazione diaframmatica 2 minuti e mobilita leggera.',
    ]
  }

  return [
    'Defaticamento 4-6 minuti con respirazione controllata.',
    'Stretching leggero dei distretti coinvolti (30-40 sec per posizione).',
  ]
}

function buildAvailableEquipment(profile: FriendProfile): Set<EquipmentTag> {
  if (profile.context === 'palestra') {
    return new Set(ALL_EQUIPMENT)
  }

  const equipment: EquipmentTag[] =
    profile.equipment.length > 0 ? profile.equipment : ['bodyweight']
  return new Set<EquipmentTag>(['bodyweight', ...equipment])
}

function formatGoalLabel(goal: Goal): string {
  return goalOptions.find((option) => option.value === goal)?.label ?? goal
}

function formatLevelLabel(level: Level): string {
  return levelOptions.find((option) => option.value === level)?.label ?? level
}

function formatContextLabel(context: TrainingContext): string {
  return contextOptions.find((option) => option.value === context)?.label ?? context
}

function buildWeeklyGuidelines(profile: FriendProfile, preset: GoalPreset): string[] {
  const base = [
    `${preset.intensityHint} Recupero multiarticolari: ${preset.restMain}; accessori: ${preset.restAccessory}.`,
    LEVEL_PROGRESSIONS[profile.level],
    `Volume settimanale suggerito: ${profile.daysPerWeek} sessioni da ${profile.sessionMinutes} minuti circa.`,
    'Mantieni 7-9 ore di sonno e almeno 1 giornata di recupero completo nelle settimane intense.',
  ]

  if (profile.notes.trim().length > 0) {
    base.push(`Nota personal trainer: ${profile.notes.trim()}`)
  }

  return base
}

export function generateWorkoutPlan(profile: FriendProfile): GeneratedPlan {
  const split = buildWeeklySplit(profile.daysPerWeek)
  const preset = GOAL_PRESETS[profile.goal]
  const availableEquipment = buildAvailableEquipment(profile)
  const usedNames = new Set<string>()

  const days = split.map((splitLabel, index) => {
    const focus = resolveFocus(splitLabel)
    const library = FOCUS_LIBRARY[focus]

    const mainLift = pickExercise(
      library.compounds,
      index,
      availableEquipment,
      usedNames,
    )
    const secondaryLift = pickExercise(
      library.compounds,
      index + 1,
      availableEquipment,
      usedNames,
    )
    const accessoryA = pickExercise(
      library.accessories,
      index * 2,
      availableEquipment,
      usedNames,
    )
    const accessoryB = pickExercise(
      library.accessories,
      index * 2 + 1,
      availableEquipment,
      usedNames,
    )
    const core = pickExercise(library.core, index, availableEquipment, usedNames)

    const finisher =
      library.finishers[index % library.finishers.length] +
      ` Durata: ${preset.finisherDuration}.`

    return {
      title: `Giorno ${index + 1}`,
      focus: splitLabel,
      warmup: buildWarmup(focus),
      exercises: [
        {
          block: 'Main Lift',
          name: mainLift.name,
          prescription: preset.mainVolume,
          note: `${mainLift.cue} Recupero ${preset.restMain}.`,
        },
        {
          block: 'Secondary Lift',
          name: secondaryLift.name,
          prescription: preset.secondaryVolume,
          note: `${secondaryLift.cue} Recupero ${preset.restMain}.`,
        },
        {
          block: 'Accessory A',
          name: accessoryA.name,
          prescription: preset.accessoryVolume,
          note: `${accessoryA.cue} Recupero ${preset.restAccessory}.`,
        },
        {
          block: 'Accessory B',
          name: accessoryB.name,
          prescription: preset.accessoryVolume,
          note: `${accessoryB.cue} Recupero ${preset.restAccessory}.`,
        },
        {
          block: 'Core',
          name: core.name,
          prescription: preset.coreVolume,
          note: core.cue,
        },
      ],
      finisher,
      cooldown: buildCooldown(focus),
    }
  })

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    profile,
    weeklyGuidelines: buildWeeklyGuidelines(profile, preset),
    days,
  }
}

export function formatPlanForClipboard(plan: GeneratedPlan): string {
  const createdDate = new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(plan.createdAt))

  const lines: string[] = [
    `Scheda Allenamento - ${plan.profile.friendName}`,
    `Data creazione: ${createdDate}`,
    `Obiettivo: ${formatGoalLabel(plan.profile.goal)} | Livello: ${formatLevelLabel(plan.profile.level)}`,
    `Contesto: ${formatContextLabel(plan.profile.context)} | Giorni: ${plan.profile.daysPerWeek}`,
    '',
    'Linee guida settimanali:',
    ...plan.weeklyGuidelines.map((guideline, index) => `${index + 1}. ${guideline}`),
    '',
  ]

  for (const day of plan.days) {
    lines.push(`${day.title} - ${day.focus}`)
    lines.push('Warm-up:')
    lines.push(...day.warmup.map((item) => `- ${item}`))
    lines.push('Esercizi:')

    for (const exercise of day.exercises) {
      lines.push(
        `- ${exercise.block}: ${exercise.name} | ${exercise.prescription} | ${exercise.note}`,
      )
    }

    lines.push(`Finisher: ${day.finisher}`)
    lines.push('Cooldown:')
    lines.push(...day.cooldown.map((item) => `- ${item}`))
    lines.push('')
  }

  return lines.join('\n')
}
