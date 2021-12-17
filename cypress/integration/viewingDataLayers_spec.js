beforeEach(() => {
  // runs once before all tests
  cy.visit('http://localhost:4200/')
  // wait for spinner to finish
  cy.get('#spinner', { timeout: 50000 }).should("not.be.visible");
  // enter site
  cy.get('#enterSiteBtn').click();
})

describe('Toggling data layers', () => {

})
