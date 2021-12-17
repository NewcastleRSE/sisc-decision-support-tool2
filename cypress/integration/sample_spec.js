describe('My First Test', () => {
  it('should load map container in background and display info dialog after spinner finishes', () => {
    cy.visit('http://localhost:4200/')

    cy.get('.map-container').should('not.be.visible')


    cy.get('#spinner', { timeout: 50000 }).should("not.be.visible");

    cy.contains('The site has two functions: data visualisation and sensor placement decision support.')
  })
})
