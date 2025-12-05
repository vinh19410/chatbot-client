export const PAGE_URL = '/manage-postion/position'
export const API_URL = '/manage-position'

export interface PositionType {
  id?: string
  title: string
  dateSetup?: string
  dateEnd: string
  dateOfficial: string
  decisionNumber: string
  agency: string
}
