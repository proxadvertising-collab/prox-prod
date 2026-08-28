export function checkDealCredit(businessCredits: number) {
  if (businessCredits > 0) {
    console.log('MVP log: Business has credits, credit applied successfully.')
    return true
  }
  return false
}
