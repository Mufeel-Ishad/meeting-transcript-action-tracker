export interface ActionItem {
  owner: string
  task: string
}

export interface UploadResponse {
  success: boolean
  transcript: string
  actions: ActionItem[]
  actionCount: number
}

