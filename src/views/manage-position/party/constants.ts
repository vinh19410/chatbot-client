export const PAGE_URL = '/manage-postion/party'
export const API_URL = '/manage-party'

export interface PartyType {
  id?: string
  title: string
  dateSetup?: string
  dateEnd: string
  dateOfficial: string
  decisionNumber: string
  agency: string
}
