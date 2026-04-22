import { type FormEvent, useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  type EquipmentTag,
  type FriendProfile,
  type GeneratedPlan,
  type TrainingContext,
  contextOptions,
  equipmentOptions,
  formatPlanForClipboard,
  generateWorkoutPlan,
  goalOptions,
  levelOptions,
} from './lib/planGenerator'

const STORAGE_KEY = 'schede-workout-social-coach-v1'

const defaultProfile: FriendProfile = {
  friendName: '',
  goal: 'ipertrofia',
  level: 'principiante',
  daysPerWeek: 3,
  sessionMinutes: 60,
  context: 'palestra',
  equipment: ['bodyweight', 'dumbbells', 'bands'],
  notes: '',
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function loadSavedPlans(): GeneratedPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed as GeneratedPlan[]
  } catch {
    return []
  }
}

function formatDateLabel(dateIso: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateIso))
}

function App() {
  const [profile, setProfile] = useState<FriendProfile>(defaultProfile)
  const [savedPlans, setSavedPlans] = useState<GeneratedPlan[]>(() =>
    loadSavedPlans(),
  )
  const [activePlanId, setActivePlanId] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState('')

  const activePlan = useMemo(
    () => savedPlans.find((plan) => plan.id === activePlanId) ?? null,
    [activePlanId, savedPlans],
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlans))
  }, [savedPlans])

  useEffect(() => {
    if (!activePlanId && savedPlans.length > 0) {
      setActivePlanId(savedPlans[0].id)
    }
  }, [activePlanId, savedPlans])

  function updateProfile<Key extends keyof FriendProfile>(
    key: Key,
    value: FriendProfile[Key],
  ): void {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function toggleEquipment(equipment: EquipmentTag): void {
    setProfile((current) => {
      if (current.context === 'palestra') {
        return current
      }

      return {
        ...current,
        equipment: current.equipment.includes(equipment)
          ? current.equipment.filter((item) => item !== equipment)
          : [...current.equipment, equipment],
      }
    })
  }

  function handleContextChange(context: TrainingContext): void {
    setProfile((current) => ({
      ...current,
      context,
      equipment: context === 'palestra' ? [] : current.equipment,
    }))
  }

  function handleGeneratePlan(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const friendName = profile.friendName.trim() || 'Atleta'
    const profileForPlan: FriendProfile = {
      ...profile,
      friendName,
      daysPerWeek: clamp(profile.daysPerWeek, 2, 6),
      sessionMinutes: clamp(profile.sessionMinutes, 35, 120),
      equipment: profile.context === 'palestra' ? [] : profile.equipment,
    }

    const generatedPlan = generateWorkoutPlan(profileForPlan)

    setSavedPlans((current) => [generatedPlan, ...current])
    setActivePlanId(generatedPlan.id)
    setCopyFeedback('')
  }

  async function handleCopyPlan(): Promise<void> {
    if (!activePlan) {
      return
    }

    try {
      await navigator.clipboard.writeText(formatPlanForClipboard(activePlan))
      setCopyFeedback('Scheda copiata negli appunti.')
    } catch {
      setCopyFeedback('Clipboard non disponibile nel browser corrente.')
    }

    window.setTimeout(() => {
      setCopyFeedback('')
    }, 2200)
  }

  function handleDeletePlan(planId: string): void {
    const selectedPlan = savedPlans.find((plan) => plan.id === planId)
    if (!selectedPlan) {
      return
    }

    const shouldDelete = window.confirm(
      `Eliminare la scheda di ${selectedPlan.profile.friendName}?`,
    )

    if (!shouldDelete) {
      return
    }

    setSavedPlans((current) => {
      const filtered = current.filter((plan) => plan.id !== planId)
      if (activePlanId === planId) {
        setActivePlanId(filtered[0]?.id ?? null)
      }
      return filtered
    })
  }

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <p className="kicker">Coach Builder</p>
        <h1>Schede Allenamento Per I Tuoi Amici</h1>
        <p className="hero-subtitle">
          Progetta programmi credibili da personal trainer, adatta il carico al
          livello e conserva uno storico pronto da condividere.
        </p>
        <div className="hero-metrics">
          <article>
            <span>Schede Salvate</span>
            <strong>{savedPlans.length}</strong>
          </article>
          <article>
            <span>Sessioni Settimanali</span>
            <strong>{activePlan?.days.length ?? profile.daysPerWeek}</strong>
          </article>
          <article>
            <span>Durata Tipo</span>
            <strong>{profile.sessionMinutes} min</strong>
          </article>
        </div>
      </header>

      <main className="layout-grid">
        <section className="panel panel-form">
          <div className="panel-head">
            <h2>Profilo Atleta</h2>
            <p>
              Imposta obiettivo, disponibilita e attrezzatura per creare una
              scheda concreta e sostenibile.
            </p>
          </div>

          <form className="planner-form" onSubmit={handleGeneratePlan}>
            <label>
              Nome amico
              <input
                type="text"
                placeholder="Es. Marco"
                value={profile.friendName}
                onChange={(event) => updateProfile('friendName', event.target.value)}
                required
              />
            </label>

            <div className="field-grid">
              <label>
                Obiettivo
                <select
                  value={profile.goal}
                  onChange={(event) =>
                    updateProfile('goal', event.target.value as FriendProfile['goal'])
                  }
                >
                  {goalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Livello
                <select
                  value={profile.level}
                  onChange={(event) =>
                    updateProfile('level', event.target.value as FriendProfile['level'])
                  }
                >
                  {levelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="field-grid">
              <label>
                Giorni a settimana
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={profile.daysPerWeek}
                  onChange={(event) =>
                    updateProfile(
                      'daysPerWeek',
                      clamp(Number(event.target.value), 2, 6),
                    )
                  }
                />
              </label>

              <label>
                Minuti per sessione
                <input
                  type="number"
                  min={35}
                  max={120}
                  step={5}
                  value={profile.sessionMinutes}
                  onChange={(event) =>
                    updateProfile(
                      'sessionMinutes',
                      clamp(Number(event.target.value), 35, 120),
                    )
                  }
                />
              </label>
            </div>

            <label>
              Contesto
              <select
                value={profile.context}
                onChange={(event) =>
                  handleContextChange(event.target.value as FriendProfile['context'])
                }
              >
                {contextOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {profile.context !== 'palestra' ? (
              <fieldset className="equipment-fieldset">
                <legend>Attrezzatura disponibile</legend>
                <div className="chip-grid">
                  {equipmentOptions.map((option) => {
                    const isChecked = profile.equipment.includes(option.value)

                    return (
                      <label
                        key={option.value}
                        className={`chip ${isChecked ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleEquipment(option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ) : null}

            <label>
              Note o limitazioni
              <textarea
                placeholder="Es. lieve fastidio alla spalla destra in overhead"
                value={profile.notes}
                onChange={(event) => updateProfile('notes', event.target.value)}
                rows={4}
              />
            </label>

            <div className="button-row">
              <button type="submit" className="btn-primary">
                Genera Scheda
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setProfile(defaultProfile)}
              >
                Reset Profilo
              </button>
            </div>
          </form>

          <aside className="saved-plans">
            <div className="saved-plans-head">
              <h3>Archivio Schede</h3>
              <span>{savedPlans.length}</span>
            </div>
            {savedPlans.length === 0 ? (
              <p className="empty-note">
                Nessuna scheda salvata. Generane una per iniziare.
              </p>
            ) : (
              <ul>
                {savedPlans.map((plan) => (
                  <li key={plan.id}>
                    <button
                      type="button"
                      className={plan.id === activePlanId ? 'active' : ''}
                      onClick={() => setActivePlanId(plan.id)}
                    >
                      <strong>{plan.profile.friendName}</strong>
                      <span>{formatDateLabel(plan.createdAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </section>

        <section className="panel panel-plan">
          {activePlan ? (
            <>
              <header className="plan-head">
                <div>
                  <p className="plan-meta">Programma Attivo</p>
                  <h2>{activePlan.profile.friendName}</h2>
                  <p>
                    {formatDateLabel(activePlan.createdAt)} · {activePlan.days.length}{' '}
                    sessioni
                  </p>
                </div>
                <div className="plan-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCopyPlan}
                  >
                    Copia Testo
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDeletePlan(activePlan.id)}
                  >
                    Elimina
                  </button>
                </div>
              </header>

              {copyFeedback ? <p className="copy-feedback">{copyFeedback}</p> : null}

              <section className="guidelines">
                <h3>Linee Guida Settimanali</h3>
                <ul>
                  {activePlan.weeklyGuidelines.map((guideline, index) => (
                    <li key={guideline}>{`${index + 1}. ${guideline}`}</li>
                  ))}
                </ul>
              </section>

              <section className="days-grid" aria-label="Dettaglio giorni allenamento">
                {activePlan.days.map((day, index) => (
                  <article
                    key={`${day.title}-${day.focus}`}
                    className="day-card"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <header>
                      <p>{day.title}</p>
                      <h4>{day.focus}</h4>
                    </header>

                    <div className="day-block">
                      <h5>Warm-up</h5>
                      <ul>
                        {day.warmup.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="exercise-table">
                      {day.exercises.map((exercise) => (
                        <div key={`${day.title}-${exercise.block}`} className="exercise-row">
                          <p>{exercise.block}</p>
                          <h5>{exercise.name}</h5>
                          <p>{exercise.prescription}</p>
                          <small>{exercise.note}</small>
                        </div>
                      ))}
                    </div>

                    <div className="day-block">
                      <h5>Finisher</h5>
                      <p>{day.finisher}</p>
                    </div>

                    <div className="day-block">
                      <h5>Cooldown</h5>
                      <ul>
                        {day.cooldown.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </section>
            </>
          ) : (
            <div className="empty-plan">
              <h2>Nessuna Scheda Selezionata</h2>
              <p>
                Compila il profilo a sinistra e crea la prima programmazione.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
