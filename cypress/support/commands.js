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
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import '@testing-library/cypress/add-commands';
import './selection';

Cypress.Commands.add(
  'paste',
  { prevSubject: true },
  (selector, data, type = 'text/plain') => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
    cy.wrap(selector).then(($destination) => {
      const pasteEvent = Object.assign(
        new Event('paste', { bubbles: true, cancelable: true }),
        {
          clipboardData: {
            getData: () => data,
            types: [type],
          },
        }
      );

      $destination[0].dispatchEvent(pasteEvent);
    });
  }
);

Cypress.Commands.add('getEditor', () => cy.get('[data-testid="note-editor"]'));

// This is not a great way to target elements, but
// Toastify doesn't support adding data attributes
Cypress.Commands.add('getToastByContent', (content) =>
  cy.get('.Toastify__toast-body').should('be.visible').contains(content)
);

Cypress.Commands.add('getSidebarNoteLink', (noteTitle) => {
  cy.get(`[data-testid="sidebar-note-link-${noteTitle}"]`);
});

Cypress.Commands.add('getNoteLinkElement', (noteTitle) => {
  cy.get(`[data-testid="note-link-element-${noteTitle}"]`);
});

// Gets the element where the note's title is editable
// contains() by default allows for partial matches
// But this RegExp finds the exact match of noteTitle
// '^' asserts position at start of the string
// '$' asserts position at end of string
Cypress.Commands.add('getNoteTitle', (noteTitle) => {
  cy.get('[data-testid="note-title"]').contains(
    new RegExp('^' + noteTitle + '$')
  );
});

// Gets a linked or unlinked reference by the note's title
// You must pass "linked" or "unlinked" for referenceType
// Linked references have the testid of "linked-reference"
// Unlinked references have the testid of "unlinked-reference"
Cypress.Commands.add('getReference', (noteTitle, referenceType) => {
  cy.get(`[data-testid="${referenceType}-reference"]`).contains(
    new RegExp('^' + noteTitle + '$')
  );
});

// Asserts the amount of references of a specific type a note should have
// You must pass "linked" or "unlinked" for referenceType
Cypress.Commands.add(
  'numberOfReferencesShouldEqual',
  (number, referenceType) => {
    cy.get(`[data-testid="${referenceType}-reference"]`).should(
      'have.length',
      number
    );
  }
);

// Uses within() to target elements within that page
// see: https://docs.cypress.io/api/commands/within

// Example:
//    cy.targetPage('noteTitle').within(() => {
//      // write test code here
//    })
Cypress.Commands.add('targetPage', (noteTitle) => {
  cy.getNoteTitle(noteTitle).parent();
});
