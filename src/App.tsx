import { type SyntheticEvent, useEffect, useMemo, useState } from 'react'
import './App.css'
import exercisePlaceholder from './assets/exercise-placeholder.svg'
import {
  FALLBACK_EXERCISES,
  fetchExerciseLibrary,
  type ExerciseLibraryItem,
} from './lib/exerciseLibrary'
import {
  countPlanExercises,
  createEmptyDay,
  createEmptyPlan,
  createId,
  decodePlansFromUrl,
  encodePlansForUrl,
  formatDateLabel,
  formatPlanForClipboard,
  normalizePlans,
  type FriendPlan,
  type PlanExerciseEntry,
} from './lib/manualPlan'

const TRAINER_STORAGE_KEY = 'schede-manuali-trainer-v2'
const TRAINER_BACKUP_STORAGE_KEY = 'schede-manuali-trainer-v2-backup'
const MAX_LIBRARY_RESULTS = 90
const GENERIC_FALLBACK_IMAGE = exercisePlaceholder

interface CustomExerciseDraft {
  name: string
  equipment: string
  primaryMuscles: string
  imageUrl: string
  notes: string
}

const INITIAL_CUSTOM_EXERCISE_DRAFT: CustomExerciseDraft = {
  name: '',
  equipment: '',
  primaryMuscles: '',
  imageUrl: '',
  notes: '',
}

function parseStoredPlans(raw: string | null): FriendPlan[] {
  if (!raw) {
    return []
  }

  try {
    return normalizePlans(JSON.parse(raw))
  } catch {
    return []
  }
}

function loadTrainerPlans(): FriendPlan[] {
  const currentPlans = parseStoredPlans(localStorage.getItem(TRAINER_STORAGE_KEY))
  if (currentPlans.length > 0) {
    return currentPlans
  }

  const backupRaw = localStorage.getItem(TRAINER_BACKUP_STORAGE_KEY)
  if (!backupRaw) {
    return []
  }

  try {
    const parsedBackup = JSON.parse(backupRaw) as {
      plans?: unknown
    }

    if (Array.isArray(parsedBackup)) {
      return normalizePlans(parsedBackup)
    }

    return normalizePlans(parsedBackup.plans)
  } catch {
    return []
  }
}

function toLabel(value: string): string {
  if (!value) {
    return 'N/A'
  }

  return value
    .replace(/[_-]/g, ' ')
    .split(' ')
    .filter((piece) => piece.length > 0)
    .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
    .join(' ')
}

function readSharedPlansTokenFromLocation(): string | null {
  if (window.location.hash.startsWith('#plans=')) {
    const rawHashToken = window.location.hash.slice('#plans='.length)
    try {
      return decodeURIComponent(rawHashToken)
    } catch {
      return rawHashToken
    }
  }

  const params = new URLSearchParams(window.location.search)
  return params.get('plans')
}

function buildPublicShareLink(encodedPlans: string): string {
  return `${window.location.origin}${window.location.pathname}?plans=${encodeURIComponent(encodedPlans)}`
}

function App() {
  const [viewMode, setViewMode] = useState<'public' | 'trainer'>('public')
  const [trainerPlans, setTrainerPlans] = useState<FriendPlan[]>(() =>
    loadTrainerPlans(),
  )
  const [selectedTrainerPlanId, setSelectedTrainerPlanId] = useState<string | null>(
    null,
  )
  const [selectedPublicPlanId, setSelectedPublicPlanId] = useState<string | null>(
    null,
  )
  const [targetDayId, setTargetDayId] = useState<string | null>(null)
  const [trainerFeedback, setTrainerFeedback] = useState('')

  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseLibraryItem[]>(
    FALLBACK_EXERCISES,
  )
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [libraryError, setLibraryError] = useState('')

  const [searchText, setSearchText] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('all')
  const [equipmentFilter, setEquipmentFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [customExerciseDraft, setCustomExerciseDraft] =
    useState<CustomExerciseDraft>(INITIAL_CUSTOM_EXERCISE_DRAFT)

  const sharedPlansToken = useMemo(() => readSharedPlansTokenFromLocation(), [])

  const sharedPlansFromUrl = useMemo(() => {
    return decodePlansFromUrl(sharedPlansToken)
  }, [sharedPlansToken])

  const sharedTokenDetected =
    typeof sharedPlansToken === 'string' && sharedPlansToken.trim().length > 0

  const publicPlans = useMemo(() => {
    if (sharedPlansFromUrl && sharedPlansFromUrl.length > 0) {
      return sharedPlansFromUrl
    }

    return trainerPlans
  }, [sharedPlansFromUrl, trainerPlans])

  const selectedTrainerPlan = useMemo(
    () => trainerPlans.find((plan) => plan.id === selectedTrainerPlanId) ?? null,
    [selectedTrainerPlanId, trainerPlans],
  )

  const selectedPublicPlan = useMemo(
    () => publicPlans.find((plan) => plan.id === selectedPublicPlanId) ?? null,
    [publicPlans, selectedPublicPlanId],
  )

  const muscleOptions = useMemo(
    () =>
      [...new Set(exerciseLibrary.flatMap((exercise) => exercise.primaryMuscles))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [exerciseLibrary],
  )

  const equipmentOptions = useMemo(
    () =>
      [...new Set(exerciseLibrary.map((exercise) => exercise.equipment))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [exerciseLibrary],
  )

  const levelOptions = useMemo(
    () =>
      [...new Set(exerciseLibrary.map((exercise) => exercise.level))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [exerciseLibrary],
  )

  const matchingExercises = useMemo(() => {
    const query = searchText.trim().toLowerCase()

    return exerciseLibrary.filter((exercise) => {
      const matchesSearch =
        query.length === 0 ||
        exercise.name.toLowerCase().includes(query) ||
        exercise.primaryMuscles.join(' ').toLowerCase().includes(query) ||
        exercise.equipment.toLowerCase().includes(query)

      const matchesMuscle =
        muscleFilter === 'all' || exercise.primaryMuscles.includes(muscleFilter)
      const matchesEquipment =
        equipmentFilter === 'all' || exercise.equipment === equipmentFilter
      const matchesLevel = levelFilter === 'all' || exercise.level === levelFilter

      return matchesSearch && matchesMuscle && matchesEquipment && matchesLevel
    })
  }, [equipmentFilter, exerciseLibrary, levelFilter, muscleFilter, searchText])

  const visibleExercises = useMemo(
    () => matchingExercises.slice(0, MAX_LIBRARY_RESULTS),
    [matchingExercises],
  )

  useEffect(() => {
    localStorage.setItem(TRAINER_STORAGE_KEY, JSON.stringify(trainerPlans))
    localStorage.setItem(
      TRAINER_BACKUP_STORAGE_KEY,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        plans: trainerPlans,
      }),
    )
  }, [trainerPlans])

  useEffect(() => {
    if (trainerPlans.length === 0) {
      setSelectedTrainerPlanId(null)
      return
    }

    if (
      !selectedTrainerPlanId ||
      !trainerPlans.some((plan) => plan.id === selectedTrainerPlanId)
    ) {
      setSelectedTrainerPlanId(trainerPlans[0].id)
    }
  }, [selectedTrainerPlanId, trainerPlans])

  useEffect(() => {
    if (publicPlans.length === 0) {
      setSelectedPublicPlanId(null)
      return
    }

    if (
      !selectedPublicPlanId ||
      !publicPlans.some((plan) => plan.id === selectedPublicPlanId)
    ) {
      setSelectedPublicPlanId(publicPlans[0].id)
    }
  }, [publicPlans, selectedPublicPlanId])

  useEffect(() => {
    if (!selectedTrainerPlan || selectedTrainerPlan.days.length === 0) {
      setTargetDayId(null)
      return
    }

    if (!targetDayId || !selectedTrainerPlan.days.some((day) => day.id === targetDayId)) {
      setTargetDayId(selectedTrainerPlan.days[0].id)
    }
  }, [selectedTrainerPlan, targetDayId])

  useEffect(() => {
    let isMounted = true
    setLibraryLoading(true)

    fetchExerciseLibrary()
      .then((items) => {
        if (!isMounted) {
          return
        }

        setExerciseLibrary(items)
        setLibraryError('')
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setExerciseLibrary(FALLBACK_EXERCISES)
        setLibraryError(
          'Connessione non disponibile: caricata una libreria locale ridotta.',
        )
      })
      .finally(() => {
        if (!isMounted) {
          return
        }

        setLibraryLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  function setFeedback(message: string): void {
    setTrainerFeedback(message)
    window.setTimeout(() => {
      setTrainerFeedback('')
    }, 2600)
  }

  function updateSelectedPlan(updater: (plan: FriendPlan) => FriendPlan): void {
    if (!selectedTrainerPlanId) {
      return
    }

    setTrainerPlans((current) =>
      current.map((plan) => {
        if (plan.id !== selectedTrainerPlanId) {
          return plan
        }

        const updated = updater(plan)
        return {
          ...updated,
          updatedAt: new Date().toISOString(),
        }
      }),
    )
  }

  function handleCreatePlan(): void {
    const freshPlan = createEmptyPlan()
    setTrainerPlans((current) => [freshPlan, ...current])
    setSelectedTrainerPlanId(freshPlan.id)
    setViewMode('trainer')
  }

  function handleDeletePlan(planId: string): void {
    const planToDelete = trainerPlans.find((plan) => plan.id === planId)
    if (!planToDelete) {
      return
    }

    const shouldDelete = window.confirm(
      `Eliminare la scheda di ${planToDelete.friendName}?`,
    )

    if (!shouldDelete) {
      return
    }

    setTrainerPlans((current) => current.filter((plan) => plan.id !== planId))
    setFeedback('Scheda eliminata.')
  }

  function handlePlanFieldChange(
    field: 'friendName' | 'objective' | 'duration' | 'coachNotes',
    value: string,
  ): void {
    updateSelectedPlan((plan) => ({
      ...plan,
      [field]: value,
    }))
  }

  function handleAddDay(): void {
    updateSelectedPlan((plan) => ({
      ...plan,
      days: [...plan.days, createEmptyDay(plan.days.length + 1)],
    }))
  }

  function handleDayFieldChange(
    dayId: string,
    field: 'title' | 'focus' | 'notes',
    value: string,
  ): void {
    updateSelectedPlan((plan) => ({
      ...plan,
      days: plan.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              [field]: value,
            }
          : day,
      ),
    }))
  }

  function handleDeleteDay(dayId: string): void {
    updateSelectedPlan((plan) => {
      if (plan.days.length <= 1) {
        return plan
      }

      return {
        ...plan,
        days: plan.days.filter((day) => day.id !== dayId),
      }
    })
  }

  function handleAddExerciseToTargetDay(exercise: ExerciseLibraryItem): void {
    if (!targetDayId) {
      setFeedback('Seleziona prima il giorno in cui aggiungere l esercizio.')
      return
    }

    const newEntry: PlanExerciseEntry = {
      id: createId('entry'),
      exerciseId: exercise.id,
      name: exercise.name,
      imageUrl: exercise.imageUrl.startsWith('data:image') ? '' : exercise.imageUrl,
      equipment: exercise.equipment,
      primaryMuscles: exercise.primaryMuscles,
      sets: '3',
      reps: '8-12',
      rest: '90 sec',
      notes: '',
    }

    updateSelectedPlan((plan) => ({
      ...plan,
      days: plan.days.map((day) =>
        day.id === targetDayId
          ? {
              ...day,
              exercises: [...day.exercises, newEntry],
            }
          : day,
      ),
    }))
  }

  function handleExerciseFieldChange(
    dayId: string,
    entryId: string,
    field: 'sets' | 'reps' | 'rest' | 'notes',
    value: string,
  ): void {
    updateSelectedPlan((plan) => ({
      ...plan,
      days: plan.days.map((day) => {
        if (day.id !== dayId) {
          return day
        }

        return {
          ...day,
          exercises: day.exercises.map((exercise) =>
            exercise.id === entryId
              ? {
                  ...exercise,
                  [field]: value,
                }
              : exercise,
          ),
        }
      }),
    }))
  }

  function handleRemoveExercise(dayId: string, entryId: string): void {
    updateSelectedPlan((plan) => ({
      ...plan,
      days: plan.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.filter((exercise) => exercise.id !== entryId),
            }
          : day,
      ),
    }))
  }

  function handleMoveExercise(
    dayId: string,
    entryId: string,
    direction: 'up' | 'down',
  ): void {
    updateSelectedPlan((plan) => ({
      ...plan,
      days: plan.days.map((day) => {
        if (day.id !== dayId) {
          return day
        }

        const sourceIndex = day.exercises.findIndex(
          (exercise) => exercise.id === entryId,
        )

        if (sourceIndex < 0) {
          return day
        }

        const targetIndex = direction === 'up' ? sourceIndex - 1 : sourceIndex + 1
        if (targetIndex < 0 || targetIndex >= day.exercises.length) {
          return day
        }

        const reordered = [...day.exercises]
        const [movedExercise] = reordered.splice(sourceIndex, 1)
        reordered.splice(targetIndex, 0, movedExercise)

        return {
          ...day,
          exercises: reordered,
        }
      }),
    }))
  }

  function handleCustomExerciseFieldChange(
    field: keyof CustomExerciseDraft,
    value: string,
  ): void {
    setCustomExerciseDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleAddCustomExerciseToTargetDay(): void {
    if (!targetDayId || !selectedTrainerPlan) {
      setFeedback('Seleziona prima il giorno di destinazione.')
      return
    }

    const customName = customExerciseDraft.name.trim()
    if (customName.length === 0) {
      setFeedback('Inserisci il nome dell esercizio personalizzato.')
      return
    }

    const muscles = customExerciseDraft.primaryMuscles
      .split(',')
      .map((muscle) => muscle.trim().toLowerCase())
      .filter((muscle) => muscle.length > 0)

    const newEntry: PlanExerciseEntry = {
      id: createId('entry'),
      exerciseId: createId('custom-exercise'),
      name: customName,
      imageUrl: customExerciseDraft.imageUrl.trim(),
      equipment: customExerciseDraft.equipment.trim() || 'Custom',
      primaryMuscles: muscles,
      sets: '3',
      reps: '8-12',
      rest: '90 sec',
      notes: customExerciseDraft.notes.trim(),
    }

    updateSelectedPlan((plan) => ({
      ...plan,
      days: plan.days.map((day) =>
        day.id === targetDayId
          ? {
              ...day,
              exercises: [...day.exercises, newEntry],
            }
          : day,
      ),
    }))

    setCustomExerciseDraft(INITIAL_CUSTOM_EXERCISE_DRAFT)
    setFeedback('Esercizio personalizzato aggiunto alla scheda.')
  }

  async function handleCopyPlanText(): Promise<void> {
    if (!selectedTrainerPlan) {
      return
    }

    try {
      await navigator.clipboard.writeText(formatPlanForClipboard(selectedTrainerPlan))
      setFeedback('Scheda copiata in formato testo.')
    } catch {
      setFeedback('Clipboard non disponibile in questo browser.')
    }
  }

  async function handleCopyPublicLink(): Promise<void> {
    if (trainerPlans.length === 0) {
      setFeedback('Crea almeno una scheda prima di condividere il link.')
      return
    }

    try {
      const encodedPlans = encodePlansForUrl(trainerPlans)
      const publicLink = buildPublicShareLink(encodedPlans)
      await navigator.clipboard.writeText(publicLink)
      setFeedback('Link pubblico copiato. Invia questo URL ai tuoi amici.')
    } catch {
      setFeedback('Non riesco a copiare il link automaticamente.')
    }
  }

  async function handleCopySelectedPlanPublicLink(): Promise<void> {
    if (!selectedTrainerPlan) {
      setFeedback('Seleziona una scheda da condividere.')
      return
    }

    try {
      const encodedPlans = encodePlansForUrl([selectedTrainerPlan])
      const publicLink = buildPublicShareLink(encodedPlans)
      await navigator.clipboard.writeText(publicLink)
      setFeedback('Link singola scheda copiato.')
    } catch {
      setFeedback('Non riesco a copiare il link della scheda selezionata.')
    }
  }

  function handleImportSharedPlans(): void {
    if (!sharedPlansFromUrl || sharedPlansFromUrl.length === 0) {
      return
    }

    setTrainerPlans(sharedPlansFromUrl)
    setSelectedTrainerPlanId(sharedPlansFromUrl[0].id)
    setViewMode('trainer')
    setFeedback('Schede del link importate nella tua area Personal Trainer.')
  }

  function handleImageError(event: SyntheticEvent<HTMLImageElement>): void {
    event.currentTarget.src = GENERIC_FALLBACK_IMAGE
  }

  return (
    <div className="workspace-shell">
      <header className="main-hero">
        <div>
          <p className="eyebrow">Coach Landing</p>
          <h1>Le Schede Del Team</h1>
          <p>
            I tuoi amici entrano dal link e aprono subito la loro scheda. Tu,
            dalla sezione Personal Trainer, crei i programmi manualmente usando
            una libreria ampia con immagini esercizi.
          </p>
        </div>

        <div className="hero-actions">
          {viewMode === 'public' ? (
            <button className="btn-primary" onClick={() => setViewMode('trainer')}>
              Entra In Area Personal Trainer
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => setViewMode('public')}>
              Torna Alla Landing Pubblica
            </button>
          )}

          {sharedPlansFromUrl ? (
            <span className="pill">Modalita link condiviso attiva</span>
          ) : (
            <span className="pill muted">Modalita locale trainer</span>
          )}
        </div>
      </header>

      {viewMode === 'public' ? (
        <main className="public-grid">
          <section className="surface public-list-panel">
            <div className="panel-header">
              <h2>Elenco Schede</h2>
              <span>{publicPlans.length}</span>
            </div>

            {publicPlans.length === 0 ? (
              <p className="empty-message">
                Nessuna scheda disponibile. Entra nell area Personal Trainer per
                crearne una.
              </p>
            ) : (
              <ul className="public-plan-list">
                {publicPlans.map((plan) => (
                  <li key={plan.id}>
                    <button
                      type="button"
                      className={plan.id === selectedPublicPlanId ? 'active' : ''}
                      onClick={() => setSelectedPublicPlanId(plan.id)}
                    >
                      <strong>{plan.friendName}</strong>
                      <span>{plan.objective}</span>
                      <small>
                        {plan.days.length} giorni · {countPlanExercises(plan)} esercizi
                      </small>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {sharedTokenDetected && (!sharedPlansFromUrl || sharedPlansFromUrl.length === 0) ? (
              <p className="warning-banner">
                Link condiviso non valido o incompleto. Rigenera il link da
                Personal Trainer e condividilo senza modificarlo.
              </p>
            ) : null}
          </section>

          <section className="surface public-detail-panel">
            {selectedPublicPlan ? (
              <>
                <header className="detail-header">
                  <div>
                    <p className="mini-label">Scheda di</p>
                    <h2>{selectedPublicPlan.friendName}</h2>
                    <p>
                      {selectedPublicPlan.objective} · {selectedPublicPlan.duration}
                    </p>
                  </div>
                  <div className="detail-stats">
                    <span>Aggiornata: {formatDateLabel(selectedPublicPlan.updatedAt)}</span>
                    <span>{countPlanExercises(selectedPublicPlan)} esercizi totali</span>
                  </div>
                </header>

                {selectedPublicPlan.coachNotes.trim().length > 0 ? (
                  <p className="coach-note">{selectedPublicPlan.coachNotes}</p>
                ) : null}

                <div className="public-days">
                  {selectedPublicPlan.days.map((day) => (
                    <article key={day.id} className="public-day-card">
                      <header>
                        <h3>{day.title}</h3>
                        {day.focus ? <p>{day.focus}</p> : null}
                      </header>

                      {day.notes.trim().length > 0 ? (
                        <p className="day-note">{day.notes}</p>
                      ) : null}

                      {day.exercises.length === 0 ? (
                        <p className="empty-inline">Nessun esercizio inserito.</p>
                      ) : (
                        <div className="public-exercises">
                          {day.exercises.map((exercise) => (
                            <div key={exercise.id} className="public-exercise">
                              <img
                                src={exercise.imageUrl || GENERIC_FALLBACK_IMAGE}
                                alt={exercise.name}
                                loading="lazy"
                                onError={handleImageError}
                              />
                              <div>
                                <h4>{exercise.name}</h4>
                                <p>
                                  {exercise.sets} serie · {exercise.reps} reps · recupero{' '}
                                  {exercise.rest}
                                </p>
                                <small>
                                  {exercise.equipment}
                                  {exercise.primaryMuscles.length > 0
                                    ? ` · ${exercise.primaryMuscles.join(', ')}`
                                    : ''}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-message-block">
                <h2>Seleziona una scheda</h2>
                <p>
                  Clicca il nome dell atleta nella colonna di sinistra per vedere
                  il piano completo.
                </p>
              </div>
            )}
          </section>
        </main>
      ) : (
        <main className="trainer-grid">
          <aside className="surface trainer-sidebar">
            <div className="sidebar-actions">
              <button className="btn-primary" onClick={handleCreatePlan}>
                Nuova Scheda
              </button>
              <button className="btn-secondary" onClick={handleCopyPublicLink}>
                Copia Link Pubblico
              </button>
              <button
                className="btn-secondary"
                onClick={handleCopySelectedPlanPublicLink}
                disabled={!selectedTrainerPlan}
              >
                Copia Link Scheda Selezionata
              </button>

              {sharedPlansFromUrl ? (
                <button className="btn-secondary" onClick={handleImportSharedPlans}>
                  Importa Schede Dal Link
                </button>
              ) : null}
            </div>

            {trainerFeedback ? <p className="feedback-banner">{trainerFeedback}</p> : null}

            <div className="panel-header">
              <h2>Le Tue Schede</h2>
              <span>{trainerPlans.length}</span>
            </div>

            {trainerPlans.length === 0 ? (
              <p className="empty-message">
                Ancora nessuna scheda. Premi Nuova Scheda per iniziare.
              </p>
            ) : (
              <ul className="trainer-plan-list">
                {trainerPlans.map((plan) => (
                  <li key={plan.id}>
                    <button
                      type="button"
                      className={plan.id === selectedTrainerPlanId ? 'active' : ''}
                      onClick={() => setSelectedTrainerPlanId(plan.id)}
                    >
                      <strong>{plan.friendName}</strong>
                      <span>{plan.objective}</span>
                      <small>{formatDateLabel(plan.updatedAt)}</small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="surface trainer-editor">
            {selectedTrainerPlan ? (
              <>
                <header className="editor-top">
                  <div>
                    <p className="mini-label">Editor Manuale</p>
                    <h2>{selectedTrainerPlan.friendName}</h2>
                  </div>
                  <div className="editor-actions">
                    <button className="btn-secondary" onClick={handleCopyPlanText}>
                      Copia Scheda Testo
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeletePlan(selectedTrainerPlan.id)}
                    >
                      Elimina Scheda
                    </button>
                  </div>
                </header>

                <div className="meta-grid">
                  <label>
                    Nome atleta
                    <input
                      type="text"
                      value={selectedTrainerPlan.friendName}
                      onChange={(event) =>
                        handlePlanFieldChange('friendName', event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Obiettivo
                    <input
                      type="text"
                      value={selectedTrainerPlan.objective}
                      onChange={(event) =>
                        handlePlanFieldChange('objective', event.target.value)
                      }
                      placeholder="Es. forza su panca e squat"
                    />
                  </label>

                  <label>
                    Durata blocco
                    <input
                      type="text"
                      value={selectedTrainerPlan.duration}
                      onChange={(event) =>
                        handlePlanFieldChange('duration', event.target.value)
                      }
                      placeholder="Es. 6 settimane"
                    />
                  </label>
                </div>

                <label className="coach-notes">
                  Note generali coach
                  <textarea
                    value={selectedTrainerPlan.coachNotes}
                    rows={3}
                    onChange={(event) =>
                      handlePlanFieldChange('coachNotes', event.target.value)
                    }
                  />
                </label>

                <div className="days-header">
                  <h3>Struttura Giorni</h3>
                  <button className="btn-secondary" onClick={handleAddDay}>
                    Aggiungi Giorno
                  </button>
                </div>

                <div className="days-stack">
                  {selectedTrainerPlan.days.map((day) => (
                    <article
                      key={day.id}
                      className={`trainer-day-card ${targetDayId === day.id ? 'target' : ''}`}
                    >
                      <header className="day-card-head">
                        <input
                          type="text"
                          value={day.title}
                          onChange={(event) =>
                            handleDayFieldChange(day.id, 'title', event.target.value)
                          }
                          placeholder="Titolo giorno"
                        />
                        <input
                          type="text"
                          value={day.focus}
                          onChange={(event) =>
                            handleDayFieldChange(day.id, 'focus', event.target.value)
                          }
                          placeholder="Focus (es. Push / Pull / Legs)"
                        />
                        <div className="day-card-actions">
                          <button
                            className="btn-secondary"
                            onClick={() => setTargetDayId(day.id)}
                          >
                            Destinazione Libreria
                          </button>
                          <button
                            className="btn-danger ghost"
                            onClick={() => handleDeleteDay(day.id)}
                            disabled={selectedTrainerPlan.days.length === 1}
                          >
                            Rimuovi Giorno
                          </button>
                        </div>
                      </header>

                      <label>
                        Note giorno
                        <textarea
                          rows={2}
                          value={day.notes}
                          onChange={(event) =>
                            handleDayFieldChange(day.id, 'notes', event.target.value)
                          }
                        />
                      </label>

                      {day.exercises.length === 0 ? (
                        <p className="empty-inline">
                          Nessun esercizio. Seleziona questo giorno come destinazione e
                          aggiungi dalla libreria a destra.
                        </p>
                      ) : (
                        <div className="trainer-exercise-list">
                          {day.exercises.map((exercise, exerciseIndex) => (
                            <div key={exercise.id} className="trainer-exercise-row">
                              <img
                                src={exercise.imageUrl || GENERIC_FALLBACK_IMAGE}
                                alt={exercise.name}
                                loading="lazy"
                                onError={handleImageError}
                              />

                              <div className="exercise-edit-fields">
                                <h4>{exercise.name}</h4>
                                <p>
                                  {exercise.equipment}
                                  {exercise.primaryMuscles.length > 0
                                    ? ` · ${exercise.primaryMuscles.join(', ')}`
                                    : ''}
                                </p>

                                <div className="micro-grid">
                                  <label>
                                    Serie
                                    <input
                                      type="text"
                                      value={exercise.sets}
                                      onChange={(event) =>
                                        handleExerciseFieldChange(
                                          day.id,
                                          exercise.id,
                                          'sets',
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </label>
                                  <label>
                                    Reps
                                    <input
                                      type="text"
                                      value={exercise.reps}
                                      onChange={(event) =>
                                        handleExerciseFieldChange(
                                          day.id,
                                          exercise.id,
                                          'reps',
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </label>
                                  <label>
                                    Recupero
                                    <input
                                      type="text"
                                      value={exercise.rest}
                                      onChange={(event) =>
                                        handleExerciseFieldChange(
                                          day.id,
                                          exercise.id,
                                          'rest',
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </label>
                                </div>

                                <label>
                                  Note esercizio
                                  <textarea
                                    rows={2}
                                    value={exercise.notes}
                                    onChange={(event) =>
                                      handleExerciseFieldChange(
                                        day.id,
                                        exercise.id,
                                        'notes',
                                        event.target.value,
                                      )
                                    }
                                  />
                                </label>
                              </div>

                              <div className="exercise-row-actions">
                                <button
                                  className="btn-secondary compact"
                                  onClick={() =>
                                    handleMoveExercise(day.id, exercise.id, 'up')
                                  }
                                  disabled={exerciseIndex === 0}
                                >
                                  Su
                                </button>
                                <button
                                  className="btn-secondary compact"
                                  onClick={() =>
                                    handleMoveExercise(day.id, exercise.id, 'down')
                                  }
                                  disabled={exerciseIndex === day.exercises.length - 1}
                                >
                                  Giu
                                </button>
                                <button
                                  className="btn-danger ghost"
                                  onClick={() => handleRemoveExercise(day.id, exercise.id)}
                                >
                                  Rimuovi
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-message-block">
                <h2>Nessuna scheda selezionata</h2>
                <p>Crea o seleziona una scheda dalla colonna sinistra.</p>
              </div>
            )}
          </section>

          <aside className="surface trainer-library">
            <header className="library-header">
              <h2>Libreria Esercizi</h2>
              <p>
                Dataset open con immagini: {exerciseLibrary.length} esercizi caricati.
              </p>
            </header>

            <div className="library-filters">
              <label>
                Cerca esercizio
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Es. bench press, squat, lat pulldown"
                />
              </label>

              <label>
                Muscolo principale
                <select
                  value={muscleFilter}
                  onChange={(event) => setMuscleFilter(event.target.value)}
                >
                  <option value="all">Tutti</option>
                  {muscleOptions.map((muscle) => (
                    <option key={muscle} value={muscle}>
                      {toLabel(muscle)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Attrezzatura
                <select
                  value={equipmentFilter}
                  onChange={(event) => setEquipmentFilter(event.target.value)}
                >
                  <option value="all">Tutte</option>
                  {equipmentOptions.map((equipment) => (
                    <option key={equipment} value={equipment}>
                      {toLabel(equipment)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Livello
                <select
                  value={levelFilter}
                  onChange={(event) => setLevelFilter(event.target.value)}
                >
                  <option value="all">Tutti</option>
                  {levelOptions.map((level) => (
                    <option key={level} value={level}>
                      {toLabel(level)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {libraryError ? <p className="warning-banner">{libraryError}</p> : null}

            <p className="library-meta">
              {libraryLoading
                ? 'Caricamento libreria in corso...'
                : `${matchingExercises.length} risultati, mostrati i primi ${visibleExercises.length}.`}
            </p>

            <p className="target-info">
              Giorno destinazione:{' '}
              <strong>
                {selectedTrainerPlan?.days.find((day) => day.id === targetDayId)?.title ??
                  'non selezionato'}
              </strong>
            </p>

            <section className="custom-exercise-panel">
              <h3>Esercizio personalizzato</h3>
              <p>
                Se non trovi un movimento in libreria, inseriscilo manualmente e
                aggiungilo al giorno selezionato.
              </p>

              <label>
                Nome esercizio
                <input
                  type="text"
                  value={customExerciseDraft.name}
                  onChange={(event) =>
                    handleCustomExerciseFieldChange('name', event.target.value)
                  }
                  placeholder="Es. Landmine press"
                />
              </label>

              <div className="custom-exercise-grid">
                <label>
                  Attrezzatura
                  <input
                    type="text"
                    value={customExerciseDraft.equipment}
                    onChange={(event) =>
                      handleCustomExerciseFieldChange('equipment', event.target.value)
                    }
                    placeholder="Es. Bilanciere, Elastico"
                  />
                </label>
                <label>
                  Muscoli (separati da virgola)
                  <input
                    type="text"
                    value={customExerciseDraft.primaryMuscles}
                    onChange={(event) =>
                      handleCustomExerciseFieldChange('primaryMuscles', event.target.value)
                    }
                    placeholder="Es. petto, spalle, tricipiti"
                  />
                </label>
              </div>

              <label>
                URL immagine (opzionale)
                <input
                  type="url"
                  value={customExerciseDraft.imageUrl}
                  onChange={(event) =>
                    handleCustomExerciseFieldChange('imageUrl', event.target.value)
                  }
                  placeholder="https://..."
                />
              </label>

              <label>
                Note iniziali (opzionale)
                <textarea
                  rows={2}
                  value={customExerciseDraft.notes}
                  onChange={(event) =>
                    handleCustomExerciseFieldChange('notes', event.target.value)
                  }
                  placeholder="Es. ROM ridotto in caso di fastidio"
                />
              </label>

              <button
                className="btn-primary"
                disabled={!targetDayId || !selectedTrainerPlan}
                onClick={handleAddCustomExerciseToTargetDay}
              >
                Aggiungi Esercizio Personalizzato
              </button>
            </section>

            <div className="library-grid">
              {visibleExercises.map((exercise) => (
                <article key={exercise.id} className="library-card">
                  <img
                    src={exercise.imageUrl || GENERIC_FALLBACK_IMAGE}
                    alt={exercise.name}
                    loading="lazy"
                    onError={handleImageError}
                  />
                  <div>
                    <h4>{exercise.name}</h4>
                    <p>
                      {toLabel(exercise.equipment)} · {toLabel(exercise.level)}
                    </p>
                    <small>
                      {exercise.primaryMuscles.length > 0
                        ? exercise.primaryMuscles.map((muscle) => toLabel(muscle)).join(', ')
                        : 'Muscoli non specificati'}
                    </small>
                  </div>
                  <button
                    className="btn-primary"
                    disabled={!targetDayId || !selectedTrainerPlan}
                    onClick={() => handleAddExerciseToTargetDay(exercise)}
                  >
                    Aggiungi Al Giorno
                  </button>
                </article>
              ))}
            </div>
          </aside>
        </main>
      )}
    </div>
  )
}

export default App
