import { useEffect, useState, type ReactNode } from 'react'
import { Check, ChevronRight, FolderOpen, LoaderCircle, Minus, Pin, PinOff, RotateCcw, Settings as SettingsIcon, Sparkles, X } from 'lucide-react'
import type { DueItem, Evaluation, ReviewResult, Settings } from './types'
import './App.css'

const defaultSettings: Settings = { projectPath: '', model: 'gpt-5-mini', reminderMinutes: 45, launchAtLogin: true, alwaysOnTop: true, opacity: 0.94, token: '' }
const resultOptions: Array<{ value: ReviewResult; label: string; hint: string }> = [
  { value: 'forgot', label: '忘了', hint: '1 天' }, { value: 'hard', label: '困难', hint: '3 天' },
  { value: 'good', label: '掌握', hint: '7 天' }, { value: 'easy', label: '轻松', hint: '14 天' }
]

function cueSection(cues: string, names: string[]) {
  for (const name of names) {
    const match = cues.match(new RegExp(`### ${name}\\n([\\s\\S]*?)(?=\\n\\n### |$)`, 'i'))
    if (match) return match[1].trim()
  }
  return ''
}

function questionFor(item: DueItem) {
  const prompt = cueSection(item.cues, ['Production Prompts', 'Review Questions', '主动回忆测试'])
  const intention = cueSection(item.cues, ['Chinese Intention', 'Expression Intention'])
  if (intention) return `怎样用自然英语表达：${intention}`
  if (prompt) return prompt.split('\n').find((line) => line.trim())?.replace(/^\d+[.)]\s*/, '') ?? prompt
  return `你能回忆起 “${item.summary}” 对应的英语表达吗？`
}

function App() {
  const [view, setView] = useState<'review' | 'settings'>('review')
  const [settings, setSettings] = useState(defaultSettings)
  const [items, setItems] = useState<DueItem[]>([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const item = items[index]

  async function loadReview() {
    setLoading(true); setError('')
    try {
      const [saved, due] = await Promise.all([window.reviewApp.getSettings(), window.reviewApp.getDueItems(20)])
      setSettings(saved); setItems(due.items); setIndex(0)
    } catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    loadReview(); window.reviewApp.onNavigate(setView); window.reviewApp.onSettingsChanged(setSettings)
  }, [])

  async function submitAnswer() {
    if (!item || !answer.trim()) return
    setLoading(true); setError('')
    try { setEvaluation(await window.reviewApp.evaluate({ item, answer })) }
    catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)) }
    finally { setLoading(false) }
  }

  async function recordResult(result: ReviewResult) {
    if (!item) return
    setLoading(true)
    try {
      await window.reviewApp.updateReview({ item, result, note: evaluation?.feedback ?? '' })
      setAnswer(''); setEvaluation(null); setIndex((current) => current + 1)
    } catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)) }
    finally { setLoading(false) }
  }

  return <main className="app-shell">
    <header className="titlebar">
      <button className="brand" onClick={() => setView('review')} aria-label="回到复习"><span className="brand-mark">S</span><span>Quick Review</span></button>
      <div className="window-actions">
        <button title={settings.alwaysOnTop ? '取消置顶' : '置顶'} onClick={() => window.reviewApp.setPinned(!settings.alwaysOnTop)}>{settings.alwaysOnTop ? <Pin size={15} /> : <PinOff size={15} />}</button>
        <button title="设置" onClick={() => setView(view === 'settings' ? 'review' : 'settings')}><SettingsIcon size={15} /></button>
        <button title="最小化到托盘" onClick={window.reviewApp.minimize}><Minus size={15} /></button>
        <button title="隐藏" onClick={window.reviewApp.close}><X size={15} /></button>
      </div>
    </header>
    {view === 'settings' ? <SettingsView settings={settings} onSaved={(saved) => { setSettings(saved); setView('review'); loadReview() }} /> :
      <section className="review-view">
        <div className="progress-row"><span className="eyebrow">今日复习</span><span>{items.length ? `${Math.min(index + 1, items.length)} / ${items.length}` : '0 项'}</span></div>
        <div className="progress-track"><span style={{ width: `${items.length ? Math.min(index / items.length * 100, 100) : 0}%` }} /></div>
        {loading && !item ? <Empty icon={<LoaderCircle className="spin" />} title="正在整理今天的卡片" />
          : error ? <Empty icon={<RotateCcw />} title="暂时无法读取语料" detail={error} action="重试" onAction={loadReview} />
          : !item ? <Empty icon={<Check />} title="今天已经复习完了" detail="做得够好就停下来。下一次提醒时再见。" action="重新扫描" onAction={loadReview} />
          : <>
            <article className="prompt-card"><div className="item-meta"><span>{item.type}</span><span>复习 {item.reviewCount} 次</span></div><h1>{questionFor(item)}</h1><p className="memory-hint">先回忆，再输入。不要急着看答案。</p></article>
            {!evaluation ? <div className="answer-zone">
              <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.ctrlKey && event.key === 'Enter') submitAnswer() }} placeholder="用英语回答…" autoFocus />
              <button className="primary" disabled={!answer.trim() || loading} onClick={submitAnswer}>{loading ? <LoaderCircle className="spin" size={17} /> : settings.token ? <Sparkles size={17} /> : <ChevronRight size={17} />}检查回答</button>
            </div> : <div className={`feedback ${evaluation.correct ? 'correct' : 'retry'}`}>
              <div className="feedback-title">{evaluation.correct ? <Check size={18} /> : <RotateCcw size={18} />}<strong>{evaluation.correct ? '回忆成功' : '再连接一次'}</strong></div><p>{evaluation.feedback}</p>
              <div className="ideal"><span>参考表达</span>{evaluation.idealAnswer}</div>
              <div className="rating-row">{resultOptions.map((option) => <button key={option.value} className={evaluation.suggestedResult === option.value ? 'suggested' : ''} onClick={() => recordResult(option.value)}><strong>{option.label}</strong><span>{option.hint}</span></button>)}</div>
            </div>}
          </>}
      </section>}
  </main>
}

function SettingsView({ settings, onSaved }: { settings: Settings; onSaved: (settings: Settings) => void }) {
  const [draft, setDraft] = useState(settings); const [saving, setSaving] = useState(false)
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => setDraft((current) => ({ ...current, [key]: value }))
  async function save() { setSaving(true); onSaved(await window.reviewApp.saveSettings(draft)); setSaving(false) }
  return <section className="settings-view">
    <div><span className="eyebrow">设置</span><h1>让复习适合你的节奏</h1></div>
    <label>语料项目<div className="input-with-action"><input value={draft.projectPath} onChange={(event) => update('projectPath', event.target.value)} /><button title="选择文件夹" onClick={async () => { const chosen = await window.reviewApp.chooseProject(); if (chosen) update('projectPath', chosen) }}><FolderOpen size={17} /></button></div></label>
    <div className="field-grid"><label>模型<select value={draft.model} onChange={(event) => update('model', event.target.value)}><option>gpt-5-mini</option><option>gpt-5</option><option>claude-sonnet-4.5</option></select></label><label>提醒间隔<select value={draft.reminderMinutes} onChange={(event) => update('reminderMinutes', Number(event.target.value))}><option value="20">20 分钟</option><option value="45">45 分钟</option><option value="90">90 分钟</option><option value="180">3 小时</option></select></label></div>
    <label>GitHub Token<input type="password" value={draft.token} onChange={(event) => update('token', event.target.value)} placeholder="不填写则使用本地检查" /><small>使用 Windows 安全存储加密，仅保存在本机。</small></label>
    <label>窗口透明度<input type="range" min="0.78" max="1" step="0.01" value={draft.opacity} onChange={(event) => update('opacity', Number(event.target.value))} /></label>
    <div className="toggles"><Toggle label="开机自动运行" checked={draft.launchAtLogin} onChange={(value) => update('launchAtLogin', value)} /><Toggle label="窗口保持置顶" checked={draft.alwaysOnTop} onChange={(value) => update('alwaysOnTop', value)} /></div>
    <button className="primary save" disabled={saving} onClick={save}>{saving ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}保存设置</button>
  </section>
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <button className="toggle" onClick={() => onChange(!checked)}><span>{label}</span><i className={checked ? 'on' : ''}><b /></i></button>
}

function Empty({ icon, title, detail, action, onAction }: { icon: ReactNode; title: string; detail?: string; action?: string; onAction?: () => void }) {
  return <div className="empty">{icon}<h1>{title}</h1>{detail && <p>{detail}</p>}{action && <button className="secondary" onClick={onAction}>{action}</button>}</div>
}

export default App
