export const PAGE_URL = '/manage-officer'
export const API_URL = 'manage-officer'

export interface OfficerType {
  id?: string
  level: string
  fullname: string
  idNumber: string
  dateOfBirth: string
  homeTown: string
  workUnit: string
  position: string
  title: string
  gender?: string
  dateJoinParty?: string
  partyName?: string
  partyPosition?: string
  placeOfBirth?: string
  dateStartPosition?: string
  address?: string
  address2?: string
  phone?: string
  nation?: string
  familyMember?: string
  jobBefore?: string
  recruitmentDate?: string
  officialDate?: string
  officialDate2?: string
  currentUnitDate?: string
  organForRecruitment?: string
  note?: string
}
