describe('Main page', () => {
  it('loads and shows main header', () => {
    cy.visit('/');
    cy.contains('Hardban');
  });
});
