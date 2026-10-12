describe('Portfolio E2E Tests', () => {
  
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the homepage', () => {
    cy.contains('S K Ismail');
    cy.contains('Full Stack Web Developer');
  });

  it('should navigate to sections', () => {
    cy.contains('About').click();
    cy.url().should('include', '#about');

    cy.contains('Projects').click();
    cy.url().should('include', '#projects');
  });

  it('should display project cards', () => {
    cy.contains('Projects').click();
    cy.get('.project-box').should('have.length.greaterThan', 0);
  });

  it('should filter projects', () => {
    cy.contains('Projects').click();
    cy.get('.projects-tab').first().click();
    cy.get('.project-box').should('be.visible');
  });

  it('should submit contact form', () => {
    cy.contains('Contact').click();
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('textarea[name="message"]').type('Test message');
    cy.get('button[type="submit"]').click();
  });
});
