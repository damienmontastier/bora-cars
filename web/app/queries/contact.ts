export interface ContactData {
  heading: string | null
}

export const CONTACT_QUERY = `*[_type == "contact"][0]{
  heading
}`
