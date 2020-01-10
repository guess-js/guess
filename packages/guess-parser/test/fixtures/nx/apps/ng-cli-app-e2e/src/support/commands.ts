// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import '@testing-library/cypress/add-commands';

// tslint:disable-next-line: no-namespace
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      login(email: string, password: string): void;
    }
  }
}

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth/login');
  cy.findByLabelText('Username').type(email);
  cy.findByLabelText('Password').type(password);
  cy.contains('button', 'Login').click();
});
