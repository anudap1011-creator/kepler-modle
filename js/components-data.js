/**
 * Educational Data & Component Mapping for NASA Kepler Space Telescope
 * Scientifically verified against NASA Ames Research Center & JPL Kepler Mission specifications.
 */

export const KEPLER_COMPONENTS = {
    'tex_01.001': {
        id: 'tex_01.001',
        name: 'Schmidt Corrector & 95-MP Photometer Array',
        category: 'Optical Telescope Assembly (OTA)',
        nodeName: 'tex_01.001',
        explodeOffset: { x: 0, y: 2.3, z: 0 },
        tag: 'Primary Science Instrument',
        specs: [
            { label: 'Aperture Diameter', value: '0.95 meters (37.4 in)' },
            { label: 'Detector', value: '42 CCDs (94.6 megapixels)' },
            { label: 'Field of View', value: '115 sq degrees (105x Moon)' },
            { label: 'Photometric Precision', value: '84 parts-per-million (ppm)' }
        ],
        shortDesc: 'The optical front-end aperture containing the fused-silica Schmidt corrector plate and the curved 95-megapixel focal plane array.',
        fullDesc: 'Kepler operates as a specialized wide-field Schmidt camera. Light enters through this 0.95-meter fused-silica Schmidt corrector lens, which removes spherical aberration before starlight strikes the primary mirror. At the prime focus sits the largest digital camera launched into deep space at the time: an array of 42 charge-coupled devices (CCDs) totaling 94.6 megapixels. This photometer continuously monitored over 150,000 stars simultaneously to register microscopic brightness dips (transits) caused by passing exoplanets.',
        missionContext: 'Engineered under PI Dr. William Borucki and Deputy PI David Koch, this photometer detected thousands of transiting exoplanets, proving for the first time that planets are more numerous than stars in our galaxy.'
    },

    'tex_01': {
        id: 'tex_01',
        name: 'Telescope Barrel & 1.4-Meter Primary Mirror',
        category: 'Structural & Optics Assembly',
        nodeName: 'tex_01',
        explodeOffset: { x: 0, y: 0.6, z: 0.7 },
        tag: 'Optical Backbone',
        specs: [
            { label: 'Primary Mirror Diameter', value: '1.4 meters (55 in)' },
            { label: 'Mirror Substrate', value: 'Ultra-low expansion glass (ULE)' },
            { label: 'Light Baffle Length', value: '2.7 meters cylindrical tube' },
            { label: 'Light Attenuation', value: '> 10^9 stray light rejection' }
        ],
        shortDesc: 'The graphite-cyanate composite cylindrical tube housing the 1.4m primary mirror and stray-light rejection baffles.',
        fullDesc: 'The main barrel of the Kepler telescope is fabricated from lightweight, thermally stable graphite-cyanate composite. Inside at the base rests the 1.4-meter primary mirror, polished to extreme precision to focus incoming starlight back up onto the CCD photometer array. Internal annular vane baffles reject off-axis starlight and sunlight glare by a factor of over 1 billion, allowing the telescope to capture faint 84-ppm transit dips without optical interference.',
        missionContext: 'The optical alignment of the primary mirror and the detector remained diffraction-limited and rock-solid across nine years in deep-space heliocentric orbit.'
    },

    'shiny_panel': {
        id: 'shiny_panel',
        name: 'Photovoltaic Solar Power Array',
        category: 'Electrical Power Subsystem (EPS)',
        nodeName: 'shiny_panel',
        explodeOffset: { x: -2.3, y: 0.1, z: -0.6 },
        tag: 'Power Generation',
        specs: [
            { label: 'Array Area', value: '10.2 sq meters' },
            { label: 'Solar Cells', value: 'Gallium Arsenide (GaAs) triple-junction' },
            { label: 'Power Output', value: '~1,100 Watts (BOL)' },
            { label: 'Storage', value: '20 Ah rechargeable Li-ion battery' }
        ],
        shortDesc: 'Curved solar cell panels mounted on the sunward side that generate electrical power for the observatory.',
        fullDesc: 'Kepler was locked into an Earth-trailing heliocentric orbit where one side of the spacecraft continuously faced the Sun while its telescope pointed fixedly at the Cygnus-Lyra star field. This curved solar array is blanketed with high-efficiency multi-junction Gallium Arsenide solar cells providing 1.1 kilowatts of DC power. The electricity feeds the photometer electronics, attitude control system, computers, and battery charging circuits.',
        missionContext: 'The asymmetric pressure of solar photons against this panel played a legendary role: after two reaction wheels failed in 2013, NASA engineers used balanced solar photon pressure against the array to stabilize Kepler, launching the triumphant K2 extended mission.'
    },

    'foil_gold': {
        id: 'foil_gold',
        name: 'Thermal Sunshield & Gold MLI Blanket',
        category: 'Thermal Control Subsystem (TCS)',
        nodeName: 'foil_gold',
        explodeOffset: { x: 2.2, y: 0.1, z: 0.7 },
        tag: 'Thermal Protection',
        specs: [
            { label: 'Material', value: 'Gold-coated Kapton Multi-Layer Insulation' },
            { label: 'Operating Temp Range', value: '-120°C to +40°C' },
            { label: 'Photometer Operating Temp', value: '-85°C (cryo-radiator stabilized)' },
            { label: 'Layers', value: 'Up to 20 embossed reflective films' }
        ],
        shortDesc: 'Reflective gold multi-layer insulation blanket protecting sensitive electronics and optics from solar heating.',
        fullDesc: 'In space, sunlight causes scorching surface temperatures up to +120°C, while shadow drops to cryogenic -150°C. This gold-coated Kapton Multi-Layer Insulation (MLI) blanket acts as an extreme radiant heat barrier. It reflects solar infrared radiation away from the telescope tube, preventing thermal expansion from warping the structural cylinder or distorting the sub-micron optical focus.',
        missionContext: 'Thanks to this thermal blanket and dedicated heat pipes radiating into deep space, the 42 CCD sensors stayed cooled to -85°C, suppressing thermal dark current and enabling detection of Earth-sized planets.'
    },

    'dish_AO': {
        id: 'dish_AO',
        name: 'High-Gain Communication Antenna (HGA)',
        category: 'Telecommunications Subsystem',
        nodeName: 'dish_AO',
        explodeOffset: { x: -0.9, y: -1.3, z: -2.2 },
        tag: 'Earth Downlink',
        specs: [
            { label: 'Dish Diameter', value: '0.86 meters parabolic reflector' },
            { label: 'Downlink Frequencies', value: 'X-band & Ka-band' },
            { label: 'Data Downlink Rate', value: 'Up to 4.33 Mbps (Ka-band)' },
            { label: 'Network', value: 'NASA Deep Space Network (DSN)' }
        ],
        shortDesc: 'A steerable parabolic dish antenna used to transmit gigabytes of scientific photometric data back to Earth.',
        fullDesc: 'Because Kepler drifted tens of millions of kilometers behind Earth in heliocentric orbit, ordinary omnidirectional antennas were insufficient for science data. This steerable 0.86-meter parabolic dish antenna beamed recorded photometric star-light curves back to NASA Deep Space Network (DSN) 70-meter ground stations in Goldstone, Madrid, and Canberra. Every month, Kepler paused observations for roughly 24 hours, orienting this dish precisely towards Earth to downlink all stored data.',
        missionContext: 'Over 678 gigabytes of science data were successfully downlinked through this antenna, now preserved in the Mikulski Archive for Space Telescopes (MAST).'
    },

    'foil_silver': {
        id: 'foil_silver',
        name: 'Spacecraft Bus & Attitude Control Subsystem (ADCS)',
        category: 'Spacecraft Service Module',
        nodeName: 'foil_silver',
        explodeOffset: { x: 0, y: -1.8, z: 0 },
        tag: 'Reaction Wheels & Avionics',
        specs: [
            { label: 'Reaction Wheels', value: '4 Goodrich reaction wheels (30 Nms)' },
            { label: 'Star Trackers', value: 'Dual optical star trackers' },
            { label: 'Pointing Precision', value: '0.009 arcseconds (sub-pixel)' },
            { label: 'Flight Computer', value: 'RAD750 radiation-hardened processor' }
        ],
        shortDesc: 'The silver-insulated octagonal service bus housing reaction wheels, star trackers, flight computers, and avionics.',
        fullDesc: 'The spacecraft service bus forms the octagonal foundation beneath the optical telescope. Wrapped in protective silver MLI film, it houses the heart of Kepler’s precision pointing hardware: four high-speed reaction wheels that spin up or slow down to orient the spacecraft without expending propellant. Dual optical star trackers continually verify pointing down to 9 milli-arcseconds—equivalent to aiming a laser pointer at a golf ball 10 kilometers away.',
        missionContext: 'Reaction wheel #2 failed in July 2012, followed by wheel #4 in May 2013. When conventional three-axis control became impossible, the mission team engineered the K2 mission, balancing solar photon pressure with the two remaining wheels to continue discovering worlds.'
    },

    'ring_AO': {
        id: 'ring_AO',
        name: 'Launch Vehicle Adapter & Separation Interface',
        category: 'Mechanical & Propulsion Interface',
        nodeName: 'ring_AO',
        explodeOffset: { x: 0, y: -3.3, z: 0 },
        tag: 'Launch & Propulsion Interface',
        specs: [
            { label: 'Launch Vehicle', value: 'Delta II 7925-10L rocket' },
            { label: 'Separation Mechanism', value: 'Pyrotechnic marman clamp ring' },
            { label: 'Hydrazine Thrusters', value: '8 x 1-Newton monopropellant thrusters' },
            { label: 'Propellant Mass', value: '64.6 kg anhydrous hydrazine' }
        ],
        shortDesc: 'The structural interface ring that mated Kepler to the Delta II upper stage and houses RCS separation thrusters.',
        fullDesc: 'On March 7, 2009, Kepler launched into space from Cape Canaveral atop a Delta II rocket. This circular 1-meter adapter ring secured the observatory to the rocket second-stage payload adapter. After reaching escape velocity, pyrotechnic release nuts fired simultaneously, separating Kepler into its independent heliocentric orbit. The ring assembly also integrates hydrazine reaction-control thrusters (RCS) used to periodically desaturate the momentum of the reaction wheels.',
        missionContext: 'On October 30, 2018, after nine years and six months of trailblazing discoveries, Kepler exhausted its final drop of hydrazine propellant in this system, gracefully retiring in a stable, eternal orbit around the Sun.'
    }
};

export const MISSION_OVERVIEW = {
    title: "NASA's Kepler Space Telescope",
    subtitle: "Interactive 3D Dismantling & Engineering Explorer",
    summary: "Launched in 2009, Kepler revolutionized astrophysics by confirming over 2,700 exoplanets—proving that planets outnumber stars in the Milky Way. Explore the 3D spacecraft below by dismantling its actual components in high-fidelity 3D.",
    stats: [
        { label: 'Confirmed Exoplanets', value: '2,700+' },
        { label: 'Stars Monitored', value: '150,000+' },
        { label: 'Mission Duration', value: '9.6 Years' },
        { label: 'Orbit', value: 'Heliocentric Earth-Trailing' }
    ]
};
