describe('customers', () => {
  beforeEach(() => {
    cy.login('test', 'goodpass');
    cy.findByText('Customers').click();
  });

  it('should display correctly', () => {
    cy.wait(30000);
    cy.findByText('Customer Data');
    cy.findByRole('grid')
      .get('tbody tr:first-child')
      .should('contain', '1')
      .should('contain', 'Waulker');
  });
  it('should sort by first name', () => {
    cy.findByText('first_name').click();
    cy.findByRole('grid')
      .get('tbody tr:first-child')
      .should('contain', '22')
      .should('contain', 'Scattergood');

    cy.findByText('first_name').click();
    cy.findByRole('grid')
      .get('tbody tr:first-child')
      .should('contain', '25')
      .should('contain', 'Getley');

    cy.findByText('first_name').click();
    cy.findByRole('grid')
      .get('tbody tr:first-child')
      .should('contain', '1')
      .should('contain', 'Waulker');
  });
});
