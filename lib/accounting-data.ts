import { generateId } from "sigilid"

// Norwegian Standard Kontoplan (NS 4102) - Common accounts
export interface Account {
  code: string
  name: string
  category: string
  description: string
}

export const ACCOUNTS: Account[] = [
  // Klasse 1 - Eiendeler
  { code: "1200", name: "Maskiner", category: "Eiendeler", description: "Varige driftsmidler" },
  { code: "1500", name: "Kundefordringer", category: "Eiendeler", description: "Fordringer" },
  { code: "1920", name: "Bankinnskudd", category: "Eiendeler", description: "Kontanter og bank" },
  { code: "1930", name: "Kontanter", category: "Eiendeler", description: "Kassebeholdning" },
  
  // Klasse 2 - Gjeld og egenkapital
  { code: "2000", name: "Aksjekapital", category: "Egenkapital", description: "Innskutt kapital" },
  { code: "2400", name: "Leverandørgjeld", category: "Gjeld", description: "Kortsiktig gjeld" },
  { code: "2710", name: "Utgående MVA", category: "Gjeld", description: "Merverdiavgift" },
  { code: "2711", name: "Inngående MVA", category: "Eiendeler", description: "Merverdiavgift" },
  
  // Klasse 3 - Inntekter
  { code: "3000", name: "Salgsinntekter", category: "Inntekter", description: "Omsetning" },
  { code: "3100", name: "Tjenestesalg", category: "Inntekter", description: "Salg av tjenester" },
  
  // Klasse 4 - Varekostnad
  { code: "4000", name: "Varekostnad", category: "Kostnad", description: "Innkjøp varer" },
  { code: "4300", name: "Innkjøp varer", category: "Kostnad", description: "Vareforbruk" },
  
  // Klasse 5 - Lønnskostnader
  { code: "5000", name: "Lønn", category: "Kostnad", description: "Lønnskostnader" },
  { code: "5400", name: "Arbeidsgiveravgift", category: "Kostnad", description: "Sosiale kostnader" },
  
  // Klasse 6 - Andre driftskostnader
  { code: "6000", name: "Avskrivninger", category: "Kostnad", description: "Avskrivning" },
  { code: "6300", name: "Leiekostnader", category: "Kostnad", description: "Husleie" },
  { code: "6540", name: "Inventar", category: "Kostnad", description: "Kontorutstyr" },
  { code: "6800", name: "Kontorrekvisita", category: "Kostnad", description: "Rekvisita" },
  
  // Klasse 7 - Andre kostnader
  { code: "7100", name: "Bilkostnader", category: "Kostnad", description: "Transport" },
  { code: "7350", name: "Reisekostnader", category: "Kostnad", description: "Reiser" },
  { code: "7500", name: "Forsikring", category: "Kostnad", description: "Forsikringer" },
]

// Transaction templates for procedural generation
export interface TransactionTemplate {
  description: string
  correctAccount: string
  amount: { min: number; max: number }
  keywords: string[]
}

export const TRANSACTION_TEMPLATES: TransactionTemplate[] = [
  // Bank transactions
  { description: "Innbetaling fra kunde", correctAccount: "1920", amount: { min: 5000, max: 150000 }, keywords: ["betaling", "innbetaling", "overføring"] },
  { description: "Utbetaling til leverandør", correctAccount: "1920", amount: { min: 2000, max: 80000 }, keywords: ["betaling", "utbetaling"] },
  { description: "Kontantuttak fra bank", correctAccount: "1930", amount: { min: 1000, max: 10000 }, keywords: ["kontant", "uttak"] },
  
  // Customer/Supplier
  { description: "Faktura sendt til kunde", correctAccount: "1500", amount: { min: 10000, max: 500000 }, keywords: ["faktura", "kunde"] },
  { description: "Faktura mottatt fra leverandør", correctAccount: "2400", amount: { min: 5000, max: 200000 }, keywords: ["faktura", "leverandør"] },
  
  // VAT
  { description: "Beregnet utgående MVA", correctAccount: "2710", amount: { min: 2500, max: 125000 }, keywords: ["mva", "utgående"] },
  { description: "Fradragsberettiget MVA", correctAccount: "2711", amount: { min: 500, max: 50000 }, keywords: ["mva", "inngående", "fradrag"] },
  
  // Income
  { description: "Salg av varer", correctAccount: "3000", amount: { min: 10000, max: 500000 }, keywords: ["salg", "varer", "inntekt"] },
  { description: "Konsulenthonorar mottatt", correctAccount: "3100", amount: { min: 15000, max: 200000 }, keywords: ["tjeneste", "honorar", "konsulent"] },
  
  // Cost of goods
  { description: "Innkjøp av varer for videresalg", correctAccount: "4000", amount: { min: 5000, max: 300000 }, keywords: ["innkjøp", "varer", "lager"] },
  { description: "Varekjøp", correctAccount: "4300", amount: { min: 2000, max: 100000 }, keywords: ["varer", "kjøp"] },
  
  // Salaries
  { description: "Utbetaling av lønn", correctAccount: "5000", amount: { min: 30000, max: 80000 }, keywords: ["lønn", "utbetaling"] },
  { description: "Arbeidsgiveravgift", correctAccount: "5400", amount: { min: 4000, max: 15000 }, keywords: ["avgift", "arbeidsgiver"] },
  
  // Operating expenses
  { description: "Betaling av husleie", correctAccount: "6300", amount: { min: 8000, max: 50000 }, keywords: ["leie", "lokale", "husleie"] },
  { description: "Kjøp av kontormøbler", correctAccount: "6540", amount: { min: 3000, max: 30000 }, keywords: ["inventar", "møbler", "kontor"] },
  { description: "Kontorrekvisita", correctAccount: "6800", amount: { min: 500, max: 5000 }, keywords: ["rekvisita", "papir", "kontor"] },
  
  // Other costs
  { description: "Drivstoffutgifter", correctAccount: "7100", amount: { min: 500, max: 3000 }, keywords: ["bil", "drivstoff", "bensin"] },
  { description: "Flybilletter forretningsreise", correctAccount: "7350", amount: { min: 2000, max: 15000 }, keywords: ["reise", "fly", "hotell"] },
  { description: "Forsikringspremie", correctAccount: "7500", amount: { min: 5000, max: 50000 }, keywords: ["forsikring", "premie"] },
  
  // Assets
  { description: "Kjøp av produksjonsmaskin", correctAccount: "1200", amount: { min: 50000, max: 500000 }, keywords: ["maskin", "utstyr", "produksjon"] },
  { description: "Avskrivning på maskiner", correctAccount: "6000", amount: { min: 5000, max: 50000 }, keywords: ["avskrivning", "verdifall"] },
]

// Company name generator
const COMPANY_PREFIXES = ["Norsk", "Bergen", "Oslo", "Fjord", "Viking", "Nordland", "Vestland", "Polar", "Aurora"]
const COMPANY_SUFFIXES = ["Handel AS", "Konsult AS", "Service AS", "Tech AS", "Bygg AS", "Transport AS", "Produksjon AS", "Import AS"]

export function generateCompanyName(): string {
  const prefix = COMPANY_PREFIXES[Math.floor(Math.random() * COMPANY_PREFIXES.length)]
  const suffix = COMPANY_SUFFIXES[Math.floor(Math.random() * COMPANY_SUFFIXES.length)]
  return `${prefix} ${suffix}`
}

// Generate random transaction
export interface Transaction {
  id: string
  description: string
  amount: number
  correctAccount: string
  accountName: string
  company: string
  date: string
}

export function generateTransaction(): Transaction {
  const template = TRANSACTION_TEMPLATES[Math.floor(Math.random() * TRANSACTION_TEMPLATES.length)]
  const account = ACCOUNTS.find(a => a.code === template.correctAccount)!
  const amount = Math.floor(Math.random() * (template.amount.max - template.amount.min) + template.amount.min)
  
  // Generate random date within last 30 days
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 30))
  
  return {
    id: generateId(9),
    description: template.description,
    amount,
    correctAccount: template.correctAccount,
    accountName: account.name,
    company: generateCompanyName(),
    date: date.toLocaleDateString('nb-NO')
  }
}

// Get hint for an account
export function getAccountHint(code: string): string {
  const account = ACCOUNTS.find(a => a.code === code)
  if (!account) return ""
  return `${account.category}: ${account.description}`
}

// Difficulty settings
export interface DifficultySettings {
  fallSpeed: number // pixels per frame
  spawnInterval: number // ms between spawns
  lives: number
  pointsPerCorrect: number
  bonusTimeThreshold: number // seconds for time bonus
}

export const DIFFICULTY_LEVELS: Record<string, DifficultySettings> = {
  easy: {
    fallSpeed: 0.5,
    spawnInterval: 5000,
    lives: 5,
    pointsPerCorrect: 100,
    bonusTimeThreshold: 8,
  },
  medium: {
    fallSpeed: 0.8,
    spawnInterval: 3500,
    lives: 4,
    pointsPerCorrect: 150,
    bonusTimeThreshold: 6,
  },
  hard: {
    fallSpeed: 1.2,
    spawnInterval: 2500,
    lives: 3,
    pointsPerCorrect: 200,
    bonusTimeThreshold: 4,
  },
  expert: {
    fallSpeed: 1.6,
    spawnInterval: 2000,
    lives: 2,
    pointsPerCorrect: 300,
    bonusTimeThreshold: 3,
  },
}
