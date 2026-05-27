import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fmhjcjjzovwxwzapdaey.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtaGpjamp6b3Z3eHd6YXBkYWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxODkxODUsImV4cCI6MjA5NDc2NTE4NX0.POcFXyMS5eZX9fxgqw0knaEvdt4if-uUr7UMeo1Rjug'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let passed = 0
let failed = 0

const createdIds = { tasks: [], documents: [], writing_styles: [] }

function assert(condition, message) {
  if (!condition) throw new Error(message ?? 'Assertion failed')
}

async function test(name, fn) {
  try {
    await fn()
    console.log(`  ✓ ${name}`)
    passed++
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`)
    failed++
  }
}

function throwIfError({ data, error }, label) {
  if (error) throw new Error(`${label}: ${error.message} (code: ${error.code})`)
  return data
}

// ─── tasks テーブル ───────────────────────────────────────────
console.log('\ntasks テーブル')

let insertedTaskId = null

await test('INSERT: タスクを1件作成できる', async () => {
  const result = throwIfError(
    await supabase
      .from('tasks')
      .insert({ title: 'テストタスク', priority: 'high', status: 'pending' })
      .select()
      .single(),
    'tasks INSERT'
  )
  assert(result.id, 'id が返却されること')
  assert(result.title === 'テストタスク', 'title が一致すること')
  assert(result.priority === 'high', 'priority が一致すること')
  assert(result.status === 'pending', 'status が一致すること')
  insertedTaskId = result.id
  createdIds.tasks.push(result.id)
})

await test('SELECT: 作成したタスクが一覧に含まれる', async () => {
  assert(insertedTaskId, '前のテストで id が取得できていること')
  const data = throwIfError(
    await supabase.from('tasks').select('*').eq('id', insertedTaskId),
    'tasks SELECT'
  )
  assert(data.length === 1, '1件取得できること')
  assert(data[0].title === 'テストタスク', 'title が一致すること')
})

await test('UPDATE: status を "completed" に更新できる', async () => {
  assert(insertedTaskId, '前のテストで id が取得できていること')
  const data = throwIfError(
    await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', insertedTaskId)
      .select()
      .single(),
    'tasks UPDATE'
  )
  assert(data.status === 'completed', 'status が completed に更新されること')
})

let alertTaskId = null

await test('期限アラート: due_date=明日のタスクが getAlertTasks 相当クエリで取得できる', async () => {
  // 明日の日付を ISO 文字列で生成
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 0)
  const tomorrowIso = tomorrow.toISOString()

  const result = throwIfError(
    await supabase
      .from('tasks')
      .insert({
        title: 'アラートテストタスク',
        priority: 'medium',
        status: 'pending',
        due_date: tomorrowIso,
      })
      .select()
      .single(),
    'alert task INSERT'
  )
  alertTaskId = result.id
  createdIds.tasks.push(result.id)

  // getAlertTasks 相当: due_date が 48時間以内 & status=pending
  const now = new Date()
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000)

  const data = throwIfError(
    await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'pending')
      .lte('due_date', in48h.toISOString())
      .gte('due_date', now.toISOString()),
    'alert tasks SELECT'
  )
  const found = data.some((t) => t.id === alertTaskId)
  assert(found, 'アラート対象タスクが結果に含まれること')
})

await test('DELETE: タスクを削除でき、削除後に一覧から消える', async () => {
  assert(insertedTaskId, '前のテストで id が取得できていること')
  throwIfError(
    await supabase.from('tasks').delete().eq('id', insertedTaskId),
    'tasks DELETE'
  )
  const data = throwIfError(
    await supabase.from('tasks').select('*').eq('id', insertedTaskId),
    'tasks SELECT after DELETE'
  )
  assert(data.length === 0, '削除後は取得できないこと')
  // createdIds から除外（クリーンアップ不要になった）
  createdIds.tasks = createdIds.tasks.filter((id) => id !== insertedTaskId)
})

// ─── documents テーブル ───────────────────────────────────────
console.log('\ndocuments テーブル')

let insertedDocId = null

await test('INSERT: ドキュメントを1件作成できる', async () => {
  const result = throwIfError(
    await supabase
      .from('documents')
      .insert({ type: 'proofread', title: 'テスト文書' })
      .select()
      .single(),
    'documents INSERT'
  )
  assert(result.id, 'id が返却されること')
  assert(result.type === 'proofread', 'type が一致すること')
  assert(result.title === 'テスト文書', 'title が一致すること')
  insertedDocId = result.id
  createdIds.documents.push(result.id)
})

await test('SELECT: type でフィルタして取得できる', async () => {
  assert(insertedDocId, '前のテストで id が取得できていること')
  const data = throwIfError(
    await supabase
      .from('documents')
      .select('*')
      .eq('type', 'proofread')
      .eq('id', insertedDocId),
    'documents SELECT by type'
  )
  assert(data.length === 1, '1件取得できること')
  assert(data[0].type === 'proofread', 'type が一致すること')
})

await test('DELETE: ドキュメントを削除できる', async () => {
  assert(insertedDocId, '前のテストで id が取得できていること')
  throwIfError(
    await supabase.from('documents').delete().eq('id', insertedDocId),
    'documents DELETE'
  )
  const data = throwIfError(
    await supabase.from('documents').select('*').eq('id', insertedDocId),
    'documents SELECT after DELETE'
  )
  assert(data.length === 0, '削除後は取得できないこと')
  createdIds.documents = createdIds.documents.filter((id) => id !== insertedDocId)
})

// ─── writing_styles テーブル ──────────────────────────────────
console.log('\nwriting_styles テーブル')

let insertedStyleId = null

await test('INSERT: style_patterns を持つレコードを作成できる', async () => {
  const patterns = { tone: 'formal', length: 'medium' }
  const result = throwIfError(
    await supabase
      .from('writing_styles')
      .insert({ style_patterns: patterns, sample_count: 3 })
      .select()
      .single(),
    'writing_styles INSERT'
  )
  assert(result.id, 'id が返却されること')
  assert(
    JSON.stringify(result.style_patterns) === JSON.stringify(patterns),
    'style_patterns が一致すること'
  )
  insertedStyleId = result.id
  createdIds.writing_styles.push(result.id)
})

await test('SELECT: 作成したレコードを取得できる', async () => {
  assert(insertedStyleId, '前のテストで id が取得できていること')
  const data = throwIfError(
    await supabase
      .from('writing_styles')
      .select('*')
      .eq('id', insertedStyleId),
    'writing_styles SELECT'
  )
  assert(data.length === 1, '1件取得できること')
  assert(data[0].sample_count === 3, 'sample_count が一致すること')
})

// ─── バリデーション ───────────────────────────────────────────
console.log('\nバリデーション')

await test('priority CHECK 制約: 不正な priority 値でエラーになる', async () => {
  const { error } = await supabase
    .from('tasks')
    .insert({ title: 'バリデーションテスト', priority: 'invalid', status: 'pending' })
  assert(error !== null, 'エラーが返却されること')
})

await test('status CHECK 制約: 不正な status 値でエラーになる', async () => {
  const { error } = await supabase
    .from('tasks')
    .insert({ title: 'バリデーションテスト', priority: 'medium', status: 'unknown' })
  assert(error !== null, 'エラーが返却されること')
})

await test('title NOT NULL 制約: title=null でエラーになる', async () => {
  const { error } = await supabase
    .from('tasks')
    .insert({ title: null, priority: 'medium', status: 'pending' })
  assert(error !== null, 'エラーが返却されること')
})

// ─── クリーンアップ ───────────────────────────────────────────
console.log('\nクリーンアップ')

async function cleanup(table, ids) {
  if (ids.length === 0) return
  const { error } = await supabase.from(table).delete().in('id', ids)
  if (error) {
    console.log(`  警告: ${table} クリーンアップ失敗 — ${error.message}`)
  } else {
    console.log(`  ${table}: ${ids.length} 件削除`)
  }
}

await cleanup('tasks', createdIds.tasks)
await cleanup('documents', createdIds.documents)
await cleanup('writing_styles', createdIds.writing_styles)

// ─── 結果サマリー ─────────────────────────────────────────────
console.log(`\n結果: ${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
