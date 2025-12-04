export type DifferenceType = 'Numeric' | 'NoEnAyer' | 'NoEnHoy' | 'Invalid'
export type StatusType = 'Existing' | 'NewToday' | 'MissingToday'

export interface ChangeRecord {
  code: string
  description: string
  price_yesterday: number | null
  price_today: number | null
  difference_type: DifferenceType
  difference_value: number | null
  difference_label: string
  status: StatusType
}

export interface FileInfo {
  name: string
  modified_at: string
}

export interface ComparisonResponse {
  success: boolean
  error?: string
  today_file?: FileInfo
  yesterday_file?: FileInfo
  changes?: ChangeRecord[]
}
