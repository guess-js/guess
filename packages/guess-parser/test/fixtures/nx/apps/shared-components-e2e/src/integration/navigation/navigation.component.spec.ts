describe('shared-components', () => {
  beforeEach(() => cy.visit('/iframe.html?id=navigationcomponent--primary'));

  it('should render the component', () => {
    cy.get('app-navigation').should('exist');
  });
});
