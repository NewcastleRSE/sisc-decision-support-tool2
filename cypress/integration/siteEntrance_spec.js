describe('Loading site', () => {
  it('should load map container in background and display info dialog after spinner finishes', () => {
    cy.visit('http://localhost:4200/')
    cy.get('.map-container').should('not.be.visible')
    cy.get('#spinner', { timeout: 50000 }).should("not.be.visible");
    cy.contains('The site has two functions: data visualisation and sensor placement decision support.')
  })

  it('should remove dialog and display map, buttons, footer etc when user selects to enter site', () => {
    cy.visit('http://localhost:4200/')
    cy.get('#spinner', { timeout: 50000 }).should("not.be.visible");
    //click to enter site
    cy.get('#enterSiteBtn').click();
    //check elements are visible
    cy.get('.map-container').should('be.visible');
    cy.get('.map-container #sensorQueryStep').should('be.visible');
    cy.get('app-footer').should('be.visible');
    cy.get('app-genetic-algorithm-results').should('not.be.visible');
    cy.get('app-genetic-algorithm-configuration').should('be.visible');
    cy.get('#LAStep').should('be.visible');
    cy.get('#dataLayersBtnStep').should('be.visible');
  })

})

