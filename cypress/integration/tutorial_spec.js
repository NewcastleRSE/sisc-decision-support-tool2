beforeEach(() => {
  // runs once before all tests
  cy.visit('http://localhost:4200/')
})

describe('Taking tutorial', () => {
  let walkthrough = [
    // data layers button
    {
      stepNumber: 1,
      elementId: 'dataLayersBtnStep',
      instructions: 'Click here to view available data layers.',
      anchorSide: 'right',
      final: false
    },
    // data layers
    {
      stepNumber: 2, elementId: 'dataLayersStep', instructions: 'Toggle data layers on the map to explore population ' +
        'characteristics, movement and schools. To find out information such as units of measurement, ' +
        'click on the info symbol next to each layer or group of layers.', anchorSide: 'right', final: false
    },
    // local authority choice
    {
      stepNumber: 3, elementId: 'LAStep', instructions: 'View data and sensor placements for Newcastle-upon-Tyne or ' +
        'Gateshead Local Authorities by changing the location here.', anchorSide: 'right', final: false
    },
    // sensor query
    {
      stepNumber: 4,
      elementId: 'sensorQueryStep',
      instructions: 'To create a new optimal sensor placement, begin by selecting the objectives ' +
        'that interest you, along with the number of sensors you would like to place and the satisfaction coverage of each sensor. ' +
        'To find out more about these terms, click on the info symbols.',
      anchorSide: 'left',
      final: false
    },
    // sensor query results panel
    {
      stepNumber: 5,
      elementId: 'sensorResultsStep',
      instructions: 'Once you have submitted a query you will be able to view ' +
        'a scatter graph showing the resulting optimal sensor placements and their coverage for each of your selected ' +
        'objectives. You can filter the networks by setting a minimum coverage for one of the objectives. Once you have ' +
        'selected a network you can view the sensors and satisfaction coverage for the output areas in the selected Local ' +
        'Authority on the map. ' +
        'Each suggested sensor will be placed at the population centroid of the output area to cover the maximum number of people in the output area. Only one sensor is placed in each output area, and an output area is considered 100% covered with that sensor. The coverage decays over distance. ',
      anchorSide: 'left',
      final: true
    }
  ];



  it('should remove dialog and show tutorial steps in order when select tutorial from dialog', () => {
   // wait for spinner to finish
    cy.get('#spinner', { timeout: 50000 }).should("not.be.visible");
    // start tutorial
    cy.get('#welcomeDialog #startTutorialBtn').click();
    // dialog is no longer visible
    cy.get('#welcomeDialog').should('not.exist');
    // map is visible
    cy.get('.map-container').should('be.visible');

    // click through tutorial
    for (let index = 0; index < walkthrough.length-1; index++) {
      cy.get('#tutorialDialog').should('be.visible');
      cy.contains(walkthrough[index].instructions)
      cy.get('#nextBtn').click();
    }
    // final step
    cy.contains(walkthrough[walkthrough.length-1].instructions);
    cy.get('#nextBtn').should('not.exist');
    cy.get('#exitBtn').should('not.exist');
    cy.get('#finishBtn').click();
    cy.get('#tutorialDialog').should('not.exist');
  })

  it('should show tutorial steps in order when select tutorial from footer', () => {
    // wait for spinner to finish
    cy.get('#spinner', { timeout: 50000 }).should("not.be.visible");
    // start tutorial
    cy.get('#enterSiteBtn').click();
    // dialog is no longer visible
    cy.get('#welcomeDialog').should('not.exist');
    // map is visible
    cy.get('.map-container').should('be.visible');
    // open tutorial
    cy.get('mat-toolbar #startTutorialBtn').click();

    // click through tutorial
    for (let index = 0; index < walkthrough.length-1; index++) {
      cy.get('#tutorialDialog').should('be.visible');
      cy.contains(walkthrough[index].instructions)
      cy.get('#nextBtn').click();
    }
    // final step
    cy.contains(walkthrough[walkthrough.length-1].instructions);
    cy.get('#nextBtn').should('not.exist');
    cy.get('#exitBtn').should('not.exist');
    cy.get('#finishBtn').click();
    cy.get('#tutorialDialog').should('not.exist');
  })


})





// submit opitmisation query opens panel, select objectives changes colour,
// click submit shows next panel which includes graph, once click on element on graph
// view network button becomes visible, click this and then another layer is shown on map.
// show network toggle removes layer

// submmit optimisation query opens panel, click submit without selecting objective, does
// not naviagte but shows error message
