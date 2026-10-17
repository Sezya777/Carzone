import { useTranslation } from 'react-i18next'

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="hero" id="home">
      <video
        className="hero-video"
        src="/images/IMG_1921.MP4"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="hero-content">
        <p className="small-title">{t('hero.title')}</p>
        <h1>CARZONE</h1>
        <p className="hero-text">{t('hero.subtitle')}</p>
        <a href="/cars" className="hero-btn">
          {t('hero.btn')}
        </a>
      </div>
    </section>
  )
}
