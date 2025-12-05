export const PAGE_URL = '/manage-received-document'
export const API_URL = 'manage-received-document'

export interface ReceivedDocument {
  id?: number
  documentId: string
  receivedId: string
  receivedDate: string
  workUnit: number[]
  documentType: number
  signedDate: string
  piority: number
  security: number
  note: string
  status?: number
}

export const STATUSES = [
  {
    value: 1,
    title: 'Lưu'
  },
  {
    value: 2,
    title: 'Xử lý'
  },
  {
    value: 3,
    title: 'Xong'
  }
]

export const PIORTY = [
  {
    value: 1,
    title: 'Thường'
  },
  {
    value: 2,
    title: 'Khẩn'
  },
  {
    value: 3,
    title: 'Thượng khẩn'
  },
  {
    value: 4,
    title: 'Hoả tốc'
  }
]

export const SECURITY = [
  {
    value: 1,
    title: 'Thường'
  },
  {
    value: 2,
    title: 'Mật'
  },
  {
    value: 3,
    title: 'Tối mật'
  },
  {
    value: 4,
    title: 'Tuyệt mật'
  }
]

export const DOCUMENT_TYPES = [
  {
    value: 1,
    title: 'Hồ sơ'
  },
  {
    value: 2,
    title: 'Quyết định'
  }
]

export const WORK_UNIT = [
  {
    value: 1,
    title: 'CA Hà Nội'
  },
  {
    value: 2,
    title: 'CA Hưng Yên'
  },
  {
    value: 3,
    title: 'CA Thái Bình'
  },
  {
    value: 4,
    title: 'CA Lạng Sơn'
  }
]
