describe('app', () => {
  beforeEach(() => cy.visit('/'));

  it('should list all nav items', () => {
    cy.findByText('Home').click();
    cy.findByText('Customers').click();
    cy.url().should('contain', '/auth/login');
  });

  it('should fail login', () => {
    cy.login('something', 'badpass');
    cy.findByText('Error: Wrong user or password');
  });

  it('should login', () => {
    cy.login('test', 'goodpass');
    cy.url().should('contain', '/home');
  });

  it('should navigate to routes', () => {
    cy.login('test', 'goodpass');
    cy.findByText('Home').click();
    cy.url().should('contain', '/home');
    cy.findByText('Customers').click();
    cy.url().should('contain', '/customers');
  });
});
