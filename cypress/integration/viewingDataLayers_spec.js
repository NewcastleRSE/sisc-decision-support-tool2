beforeEach(() => {
  // runs once before all tests
  cy.visit('http://localhost:4200/')
  // wait for spinner to finish
  cy.get('#spinner', { timeout: 50000 }).should("not.be.visible");
  // enter site
  cy.get('#enterSiteBtn').click();
})

describe('Toggling data layers', () => {
  it('should open and close data layers list using button', () => {
    cy.get('app-data-layers').should('not.be.visible');

    // open
    cy.get('#dataLayersBtnStep').click();
    cy.get('app-data-layers').should('be.visible');
    cy.get('.dataLayersList').should('be.visible');
    //individual toggles
    cy.get('.disToggle').should('be.visible');
    cy.get('.imdToggle').should('be.visible');
    cy.get('.toToggle').should('be.visible');
    cy.get('.throughToggle').should('be.visible');
    cy.get('.uoToggle').should('be.visible');
    cy.get('.oaToggle').should('be.visible');
    cy.get('.schoolsToggle').should('be.visible');


    // close
    cy.get('#dataLayersBtnStep').click();
    cy.get('app-data-layers').should('not.be.visible');
    //individual toggles
    cy.get('.disToggle').should('not.be.visible');
    cy.get('.imdToggle').should('not.be.visible');
    cy.get('.toToggle').should('not.be.visible');
    cy.get('.throughToggle').should('not.be.visible');
    cy.get('.uoToggle').should('not.be.visible');
    cy.get('.oaToggle').should('not.be.visible');
    cy.get('.schoolsToggle').should('not.be.visible');
  })


})


