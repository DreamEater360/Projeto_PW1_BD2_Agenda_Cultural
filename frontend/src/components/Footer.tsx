export function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        {/* <h3 style={{ color: 'var(--purple)', margin: '0 0 10px 0' }}>Agenda Cultural</h3> */}
        <p>© 2026 Agenda Cultural. Todos os direitos reservados.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '5px' }}>
          <a href="#" style={{ color: 'var(--gray)', textDecoration: 'none', fontSize: '13px' }}>Sobre</a>
          <a href="#" style={{ color: 'var(--gray)', textDecoration: 'none', fontSize: '13px' }}>Privacidade</a>
          <a href="#" style={{ color: 'var(--gray)', textDecoration: 'none', fontSize: '13px' }}>Contato</a>
        </div>
      </div>
    </footer>
  );
}