beforeEach(() => {
  cy.visit('http://localhost:4200/')
  cy.get('.map-container').should('not.be.visible')
  cy.get('#spinner', { timeout: 50000 }).should("not.be.visible");
  //click to enter site
  cy.get('#enterSiteBtn').click();
})

describe('Submitting query', () => {
  it('should open expansion panel when clicked, let user progress to results panel and display chart', () => {
    //open configuration panel
    cy.get('app-genetic-algorithm-configuration').click();
    cy.contains('Objectives:');

    // click an objectives and submit
    cy.get('#Workers').click();
    cy.get('#submitBtn').click();

   // results panel should open and display chart with 2 series
    cy.get('mat-error').should('not.exist');
    cy.get('app-genetic-algorithm-results').should('be.visible');
    cy.get('highcharts-chart').should('be.visible');
    cy.get('#viewNetworkBtn').should('be.disabled');
    cy.get('.highcharts-series-0').should('be.visible');
    cy.get('.highcharts-series-1').should('not.exist');
  })

  it('should display error message and not display config panel if no objectives are selected', () => {
    //open configuration panel
    cy.get('app-genetic-algorithm-configuration').click();
    // submit
    cy.get('#submitBtn').click();

    cy.get('app-genetic-algorithm-results').should('not.be.visible');
    cy.get('mat-error').should('be.visible');
  })
})


