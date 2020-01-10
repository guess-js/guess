describe('shared-components', () => {
  it('should render the component', () => {
    cy.visit(
      '/iframe.html?id=infoboxcomponent--primary&knob-icon=person&knob-message=O-H-I-O'
    );
    cy.get('app-info-box').should('exist');
    cy.contains('Go Bucks');
  });
});
