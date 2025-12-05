export const PAGE_URL = '/manage-officer-relatives'
export const API_URL = 'manage-officer-relatives'

export interface OfficerRelativeType {
  id?: string
  level: string
  fullname: string
  dateOfBirth: string
  homeTown: string
  title: string
  gender?: string
  placeOfBirth?: string
  address?: string
  address2?: string
  phone?: string
  nation?: string
  note?: string
  cardId?: string
  cardStatus?: string
  officerName: string
  officerId?: number
  workUnit?: string
}
