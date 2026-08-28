import type { DomainId, Question } from '../types'
import domain1 from '../data/clf-c02/domain1.json'
import domain2 from '../data/clf-c02/domain2.json'
import domain3 from '../data/clf-c02/domain3.json'
import domain4 from '../data/clf-c02/domain4.json'

type RawQuestion = Omit<Question, 'domain'>

function withDomain(raw: RawQuestion[], domain: DomainId): Question[] {
  return raw.map((q) => ({ ...q, domain }))
}

export const QUESTION_BANK: Question[] = [
  ...withDomain(domain1 as RawQuestion[], 1),
  ...withDomain(domain2 as RawQuestion[], 2),
  ...withDomain(domain3 as RawQuestion[], 3),
  ...withDomain(domain4 as RawQuestion[], 4),
]
