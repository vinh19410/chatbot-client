export const PAGE_URL = '/manage-postion/party-position'
export const API_URL = '/manage-party-position'

export interface PartyPositionType {
  id?: string
  title: string
  dateSetup?: string
  dateEnd: string
  dateOfficial: string
  decisionNumber: string
  agency: string
}
