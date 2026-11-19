const zh = {
  title: '示例设置',
  summary: '设置只在当前 DSH 进程内有效。',
  name: '显示名称',
  status: '显示状态',
  save: '保存',
  saving: '保存中…',
  saved: '设置已保存。',
  loading: '正在加载设置…',
  loadError: '加载失败，请重试。',
  saveError: '保存失败，请重试。',
  retry: '重试',
  active: '{name} 已就绪。',
}

const en: typeof zh = {
  title: 'Example settings',
  summary: 'Settings apply to this DSH process.',
  name: 'Display name',
  status: 'Show status',
  save: 'Save',
  saving: 'Saving…',
  saved: 'Settings saved.',
  loading: 'Loading settings…',
  loadError: 'Could not load settings. Try again.',
  saveError: 'Could not save settings. Try again.',
  retry: 'Retry',
  active: '{name} is ready.',
}

export const MESSAGES = { zh, en }
export type Translate = (key: keyof typeof zh) => string
