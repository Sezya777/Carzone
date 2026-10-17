export default function AboutSection() {
  return (
    <section className="about about-video-section" id="about">
      {/* Фоновое видео */}
      <video
        className="about-bg-video"
        src="/images/795958315659.mp4"
        autoPlay
        muted
        loop
        playsInline
        onLoadedMetadata={(e) => { e.target.currentTime = 60 }}
      />
      {/* Затемнение */}
      <div className="about-bg-overlay" />

      <div className="about-content">
        <p className="small-title">О НАС</p>
        <h2>
          Мы помогаем <span>выбрать идеальный автомобиль</span>
        </h2>
        <p>
          CARZONE предлагает премиальные автомобили, индивидуальный подход и
          комфортную работу на каждом этапе покупки. Наши специалисты помогают
          подобрать модель под ваш стиль жизни, бюджет и желания.
        </p>
        <div className="numbers">
          <div><strong>12+</strong><span>лет опыта</span></div>
          <div><strong>1.5K</strong><span>довольных клиентов</span></div>
          <div><strong>200+</strong><span>авто в наличии</span></div>
        </div>
      </div>
    </section>
  )
}
