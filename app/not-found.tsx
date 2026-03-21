import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="card empty-state">
          <span className="eyebrow">404</span>
          <h1>That page does not exist.</h1>
          <p>Use the main navigation to continue exploring the site.</p>
          <Link className="button button-primary" href="/">
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
