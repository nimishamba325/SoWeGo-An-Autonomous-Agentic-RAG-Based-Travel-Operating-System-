import Hero from './Hero'
import ZoomEarthSection from './ZoomEarthSection'
import FeaturesSection from './FeaturesSection'

const HomePage = () => {
  return (
    <>
      {/* Hero section scoped to 100vh with CityBackground inside */}
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <Hero />
      </div>
      
      {/* ZoomEarthSection - scroll-driven animation immediately below hero */}
      <ZoomEarthSection />
      
      {/* FeaturesSection - seamless transition immediately after ZoomEarthSection */}
      <FeaturesSection />
    </>
  )
}

export default HomePage
