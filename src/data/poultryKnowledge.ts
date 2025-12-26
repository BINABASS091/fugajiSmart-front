/**
 * Comprehensive Poultry Farming Knowledge Base
 * Contains all educational content for farmers
 */

export interface KnowledgeSection {
    id: string;
    title: string;
    subtitle?: string;
    content: string;
    sections?: KnowledgeSubSection[];
    tips?: string[];
    warnings?: string[];
    comparisons?: ComparisonTable;
}

export interface KnowledgeSubSection {
    id: string;
    title: string;
    content?: string;
    items?: string[];
}

export interface ComparisonTable {
    headers: string[];
    rows: string[][];
}

// Multilingual knowledge base structure
const knowledgeData: Record<string, KnowledgeSection> = {
    chickenTypes: {
        id: 'chicken-types',
        title: 'Types of Chicken Based on Their Usage',
        subtitle: 'Understanding the different types of chickens is crucial for every poultry farmer',
        content: 'Each breed and category has been selectively developed to meet specific production goals whether for meat, eggs, or a balance of both.',
        sections: [
            {
                id: 'layers',
                title: '1. Layers',
                content: 'Layers are chickens genetically bred and optimized for high egg production. They convert feed efficiently into eggs rather than muscle or fat.',
                items: [
                    'Egg Production: 300+ eggs per hen per year and 400+ in 90 weeks',
                    'Consume around 6kg before starting to reach point of lay',
                    'Body Weight: Average adult weight is 1.5-2.0 kg',
                    'Onset of Lay: Begins between 18–21 weeks of age',
                    'Laying Duration: 72–80 weeks (around 18–20 months)',
                    'Lighting Requirements: Require 14–16 hours of light daily',
                    'Examples: ISA Brown, Lohmann Brown, Hy-Line Brown, Bovan Brown, Shaver White',
                    'Best Rearing System: Cage System or Deep Litter',
                    'Suitability: Ideal for commercial egg production enterprises, schools, or urban farms'
                ]
            },
            {
                id: 'broilers',
                title: '2. Broilers',
                content: 'Broilers are selectively bred for rapid growth rate, high feed conversion ratio (FCR) and optimum meat yield within a short rearing cycle.',
                items: [
                    'Growth Rate: Reach 1.5–2.5 kg live weight in 28–42 days',
                    'Feed Conversion Ratio (FCR): 1.6–1.8 (i.e., 1.6–1.8 kg of feed for 1 kg of live weight)',
                    'Body Composition: Large breast muscles, thick thighs, and less fat',
                    'Examples: Cobb 500, Ross 308, Arbor Acres, Hubbard Classic',
                    'Best Rearing System: Deep Litter System',
                    'Suitability: Best for short-cycle commercial meat production, hotels, restaurants'
                ]
            },
            {
                id: 'dual-purpose',
                title: '3. Dual-Purpose / Hybrid Chickens',
                content: 'Dual-purpose chickens are breeds developed to serve both meat and egg production functions.',
                items: [
                    'Egg Production: 220–300 eggs per year',
                    'Body Weight: 2.5–3.5 kg at 16–18 weeks',
                    'Feed Conversion: 2.2–2.5 (slightly higher than broilers)',
                    'Hardiness: Highly adaptable to varying climatic and management conditions',
                    'Behavior: Active foragers, good scavengers',
                    'Examples: Kuroiler, Sasso T451 (France), Rainbow Rooster',
                    'Best Rearing System: Free Range or Semi-Intensive (Deep Litter)',
                    'Suitability: Best for rural farmers, semi-commercial producers'
                ]
            }
        ],
        comparisons: {
            headers: ['Feature', 'Layers', 'Broilers', 'Dual Purpose / Hybrid'],
            rows: [
                ['Main Product', 'Eggs', 'Meat', 'Both'],
                ['Growth Speed', 'Slow', 'Very Fast', 'Moderate'],
                ['Feed Efficiency', 'High (for eggs)', 'High (for growth)', 'Moderate'],
                ['Market Age', '18–20 months', '4–6 weeks', '3–4 months'],
                ['Body Weight', '1.5–2.0 kg', '1.5–2.5 kg', '2.5–3.5 kg'],
                ['Eggs/Year', '300–420', 'Few or none', '220–300'],
                ['Hardiness', 'Moderate', 'Low', 'High'],
                ['Best System', 'Cage / Deep Litter', 'Deep Litter', 'Free Range / Semi-Intensive'],
                ['Examples', 'ISA Brown, Hy-Line', 'Cobb 500, Ross 308', 'Kuroiler, Sasso']
            ]
        }
    },
    broilerRaising: {
        id: 'broiler-raising',
        title: 'How to Raise Broiler Chicken',
        subtitle: 'Comprehensive guide to raising broilers for meat production',
        content: 'Broiler chickens represent the predominant poultry type raised throughout Tanzania, primarily cultivated for meat production purposes. Within Tanzania, the predominant broiler breeds include Cobb 500 and Ross 308, which excel in meat production owing to their superior Feed Conversion Ratio (FCR).',
        sections: [
            {
                id: 'selecting-chicks',
                title: 'Selecting Quality Chicks',
                content: 'The caliber of your chicks primarily depends upon the hatchery or breeder facility from which they originate. Exercise extreme caution when sourcing chicks from trustworthy suppliers.',
                items: [
                    'Bright, clear eyes without cloudiness',
                    'Clean, properly aligned beak structure',
                    'Well-hydrated, straight legs and feet without defects',
                    'Properly healed navel area',
                    'Absence of red hocks or leg injuries',
                    'Firm stance with proper walking ability',
                    'Energetic and responsive behavior',
                    'Note: Young chicks lack body temperature regulation capability until their fifth day'
                ]
            },
            {
                id: 'housing-preparation',
                title: 'Housing Preparation and Brooder Setup',
                content: 'A brooder consists of a temperature-controlled enclosure designed for raising newly hatched chicks throughout their initial weeks.',
                items: [
                    'Space Requirements: Accommodate maximum 13-16 broilers per square meter at average weight of 1.5kg',
                    'During peak heat periods, reduce to maximum 10-12 chickens per square meter',
                    'Initial stocking densities: Below 50-60 birds per square meter during winter',
                    'Summer stocking: 40-50 birds per square meter',
                    'Brooder Size Calculation: Number of Chicks ÷ 40 = Required Square Meters',
                    'Example: For 400 chicks, the necessary space equals (400÷40) = 10 square meters (3.16m × 3.16m)'
                ]
            },
            {
                id: 'bird-behavior',
                title: 'Bird Distribution and Behavior Under Brooders',
                items: [
                    'Excessive Heat: Silent chicks, panting with drooping heads and wings, movement away from heat source',
                    'Proper Temperature: Even distribution throughout space, contented noise levels',
                    'Insufficient Heat: Crowding near brooder, loud distressed calling'
                ]
            },
            {
                id: 'crop-fill',
                title: 'Crop Fill Assessment',
                content: 'Immediately upon placement in the broiler facility, provide feed and water, then conduct Crop Fill evaluations. Critical crop monitoring must occur within the initial 24 hours.',
                items: [
                    'Collect samples of 30-40 chicks from three or four house locations',
                    'Gently palpate each chick\'s crop',
                    'Empty crop: Chick experiences difficulty locating feed and water',
                    'Full but extremely soft crop: Contains primarily water, indicating feed access problems',
                    'Full but firm crop: Contains primarily feed, indicating water access difficulties',
                    'Full and supple crop: Contains proper feed and water mixture - this is the desired outcome'
                ]
            },
            {
                id: 'litter-quality',
                title: 'Managing Litter Quality',
                content: 'Optimal broiler welfare and health require litter covering the complete floor area while remaining dry and friable (loose texture).',
                items: [
                    'Dry Sawdust: 1 inch or 2.5cm depth (equivalent to one index finger section)',
                    'Rice Husks/Hulls: 2 inches or 5cm depth (equivalent to two finger sections)',
                    'Squeeze Test: Properly managed litter should form loose compaction when hand-squeezed',
                    'Litter remaining clumped after squeezing indicates excessive moisture'
                ]
            },
            {
                id: 'pre-placement',
                title: 'Pre-Placement Verification Checklist',
                items: [
                    'Temperature: Preheat houses to 20°C ensuring floor, litter, and ambient temperatures stabilize at least 24 hours before chick placement',
                    'Feeders: Provide feed in crumble format placed on trays or plates (red coloring recommended)',
                    'Safety: Construct brooder walls with rounded edges preventing chicks from becoming trapped in corners',
                    'Water: Fill drinkers and nipple lines maximum 2-3 hours before chick arrival',
                    'Allow chicks access to drinkers approximately 2 hours before providing initial feed ration'
                ]
            },
            {
                id: 'nutritional-management',
                title: 'Nutritional Management',
                content: 'Broiler diets are formulated delivering energy and nutrients essential for healthy, efficient broiler production. Feed represents substantial broiler production costs.',
                items: [
                    'Starter Feed (7-10 days): Energy 2975-3000 kcal/kg, Crude Protein 23%, Calcium 0.96%, Phosphorus 0.5%',
                    'Grower Feed (10-14 days): Energy 3100 Kcal/kg, Crude Protein 22%, Calcium 0.87%, Phosphorus 0.435%',
                    'Finisher Feed (after 25 days): Energy 3200 Kcal/kg, Crude Protein 20%, Calcium 0.81%, Phosphorus 0.405%',
                    'Feed pelleting improves broiler growth and feed efficiency',
                    'Manage starter-to-grower transition carefully by mixing feeds for 1-2 days'
                ]
            },
            {
                id: 'water-management',
                title: 'Water Management',
                content: 'Birds require unlimited access to clean, fresh, high-quality drinking water continuously.',
                items: [
                    'At 21°C, birds consume sufficient water when water volume (L) to feed weight (kg) ratio remains near 1.6-1.8',
                    'Water requirements vary with ambient temperature',
                    'Each 1°C increase matters - prolonged high temperatures double daily water consumption',
                    'In hot weather, regularly flush drinker lines ensuring water doesn\'t become excessively warm',
                    'Position nipples at birds\' eye level during initial brooding stages'
                ]
            },
            {
                id: 'lighting-program',
                title: 'Lighting Program',
                content: 'Lighting programs represent important management tools for good broiler performance and flock welfare. Research demonstrates that lighting programs incorporating 6 hours of continuous darkness improve immune system development.',
                items: [
                    'Day 0: 0 hours of darkness',
                    'Day 1: 1 hour of darkness',
                    'At 130-180g: 6 hours of darkness',
                    'Day 21: 5 hours of darkness',
                    'Day 28: 4 hours of darkness',
                    'Two days before processing: 2 hours of darkness',
                    'One day before processing: 1 hour of darkness'
                ]
            },
            {
                id: 'flock-uniformity',
                title: 'Flock Uniformity',
                content: 'Assess live flock performance through regular bird weighing and comparing against age targets. Profitability depends on maximizing the flock proportion closely meeting target specifications.',
                items: [
                    'The measure represents the flock percentage falling within +/-10% of average body weight',
                    'Use Fuga App for monitoring flock uniformity',
                    'Verify whether your Broilers are growing as required',
                    'Regular weighing ensures defined end-product specifications are met'
                ]
            }
        ],
        tips: [
            'Use Fuga App Calculator to determine appropriate quantity of mini drinkers and plate feeders',
            'Inadequate litter and air temperatures cause decreased internal body temperature',
            'Overheated chicks spread wings and pant for heat elimination',
            'Feed pelleting reduces feed wastage and improves palatability',
            'Darkness periods represent natural requirements for all animals'
        ],
        warnings: [
            'Young chicks cannot achieve complete thermoregulation until approximately 12-14 days of age',
            'Failing to achieve proper crop fill creates irreversible flock performance issues',
            'Inadequate water supply produces reduced growth rates',
            'One standard lighting program won\'t succeed for all global regions'
        ]
    },
    dayOldChicks: {
        id: 'day-old-chicks',
        title: 'What to Consider When Your Day-Old Chicks Arrive',
        subtitle: 'The first 7 days determine 50–70% of your flock\'s future performance',
        content: 'Receiving day-old chicks is one of the most important moments in any poultry project. Preparation and early care are critical.',
        sections: [
            {
                id: 'brooder-preparation',
                title: '1. Prepare the Brooder Before Arrival',
                items: [
                    'Clean and disinfect the brooding area at least 48 hours before',
                    'Pre-heat the brooder for 3–4 hours before placement',
                    'Ideal temperatures: Brooder floor 32–35°C, Room temperature 28–30°C',
                    'Lay clean wood shavings (5–7 cm deep)',
                    'Set up guard rings to prevent piling'
                ]
            },
            {
                id: 'equipment-check',
                title: '2. Check All Equipment',
                items: [
                    'Drinkers filled with clean warm water (28–30°C)',
                    'Feeders filled with starter crumble',
                    'Heat source (charcoal, gas, bulbs, or brooder stoves)',
                    'Adequate lighting for the first 24–48 hours'
                ]
            },
            {
                id: 'nutritional-boosters',
                title: '3. Prepare Nutritional Boosters',
                items: [
                    'Glucose + multivitamin solution for the first 3 days',
                    'Electrolytes to reduce stress and dehydration',
                    'Avoid antibiotics on day one unless prescribed by a vet'
                ]
            },
            {
                id: 'inspect-chicks',
                title: '4. Inspect the Chicks on Arrival',
                items: [
                    'Active, alert behavior',
                    'Bright eyes and clean vents',
                    'No signs of deformities or weakness',
                    'Uniform size and weight'
                ]
            },
            {
                id: 'monitoring',
                title: '5. Monitor Closely in the First 24 Hours',
                items: [
                    'Too cold: They crowd under the heat source',
                    'Too hot: They move far away and pant',
                    'Comfortable: They spread evenly across the brooder'
                ]
            }
        ]
    },
    vaccination: {
        id: 'vaccination',
        title: 'Things to Consider When Administering Vaccinations',
        subtitle: 'A Beginner-Friendly Guide for Poultry Farmers',
        content: 'Vaccination is one of the best ways to protect your chickens from dangerous and costly diseases.',
        sections: [
            {
                id: 'what-is-vaccine',
                title: '1. What is a Vaccine?',
                content: 'A vaccine is a small, safe dose of a virus or bacteria that helps the chicken\'s body build immunity. When the real disease comes, the chicken\'s immune system reacts quickly and protects the bird.'
            },
            {
                id: 'cold-chain',
                title: '2. Cold Chain Handling (Very Important!)',
                content: 'Vaccines are destroyed by heat within minutes. Keep them safe by:',
                items: [
                    'Carry in a cool box with ice packs',
                    'Avoid sunlight',
                    'Do not open the vial until the moment of use',
                    'Return unused vaccines to ice immediately'
                ]
            },
            {
                id: 'chlorine-warning',
                title: '3. Why Chlorine Is Not Good for Vaccines',
                content: 'Many farmers use chlorinated tap water without knowing it kills live vaccines instantly. Always use clean water with no chlorine. Add skimmed milk or a vaccine stabilizer.'
            },
            {
                id: 'preparation',
                title: '4. Preparing Chicks Before Vaccination',
                items: [
                    'Make sure birds are healthy and active',
                    'Do not vaccinate sick, stressed, or weak birds',
                    'Withhold water for 1 hour for chicks, 2–3 hours for older birds',
                    'Avoid vaccinating during extreme heat or very cold mornings'
                ]
            },
            {
                id: 'administration',
                title: '5. How to Administer Vaccinations',
                items: [
                    'Eye Drop: Common for Newcastle (Hitchner B1), Gumboro - Drop 1 dose into the eye',
                    'Drinking Water: Used for Lasota and some boosters - Mix exact number of doses',
                    'Injection: Subcutaneous or intramuscular - Used for Marek\'s, Fowl Typhoid',
                    'Wing Stab: Used for Fowl Pox - Quick method for large flocks',
                    'One dose per bird = no sharing, no splitting'
                ]
            },
            {
                id: 'timing',
                title: '6. How Long Before the Vaccine Goes Bad?',
                content: 'Live vaccines (Newcastle, Gumboro) last 30–60 minutes after mixing. After 1 hour, most vaccines lose strength. Never store or refrigerate mixed vaccines.'
            }
        ],
        warnings: [
            'Vaccines prevent disease—they do NOT cure sick birds',
            'Never vaccinate sick or weak chickens',
            'If the vaccine becomes warm → it becomes useless'
        ]
    },
    commonDiseases: {
        id: 'common-diseases',
        title: 'Common Poultry Diseases & Their Symptoms',
        subtitle: 'Simple guide to the most common diseases, their causes, symptoms, and prevention',
        content: 'Most poultry diseases spread through poor hygiene, contaminated equipment, dirty drinking water, sick birds, wild birds, and poor vaccination schedules. Always consult your local veterinarian for accurate diagnosis and treatment.',
        sections: [
            {
                id: 'newcastle',
                title: '1. Newcastle Disease (ND / Kideri)',
                content: 'Spread by a virus through the air, contaminated equipment, clothing, and wild birds.',
                items: [
                    'Type: Viral | Age at Risk: All ages | Mortality: Up to 80–100% if unvaccinated | Egg Drop: Up to 40–60%',
                    'Symptoms: Sudden deaths, greenish diarrhea, twisted necks, paralysis, severe breathing difficulty, drop in egg production',
                    'Effects on Humans: NCD does not harm humans seriously',
                    'Prevention: Strict vaccination (Hitchner B1 day-old, Lasota 3–4 weeks and monthly boosters), strong biosecurity'
                ]
            },
            {
                id: 'gumboro',
                title: '2. Gumboro Disease (Infectious Bursal Disease – IBD)',
                content: 'A virus that damages the immune system. Spreads through dirty litter, contaminated shoes, and equipment.',
                items: [
                    'Type: Viral | Age at Risk: 3–6 weeks old | Mortality: Up to 20–50%',
                    'Symptoms: Ruffled feathers, watery diarrhea, birds pecking at their vent, sudden deaths, dehydration',
                    'Effects on Humans: No effect on humans',
                    'Prevention: Vaccination at Day 14 & 28, keep litter dry, practice good hygiene'
                ]
            },
            {
                id: 'coccidiosis',
                title: '3. Coccidiosis',
                content: 'Caused by parasites that thrive in wet litter, dirty drinkers, and overcrowded houses.',
                items: [
                    'Type: Parasite (protozoa) | Age at Risk: 3–6 weeks most common | Mortality: 10–40% | Egg Drop: 10–20%',
                    'Symptoms: Bloody or watery diarrhea, birds become weak and dull, sitting in corners, ruffled feathers, reduced growth',
                    'Treatment: Amprolium in drinking water, other coccidiostats on Feed',
                    'Prevention: Keep litter dry, raise drinkers, use coccidiostats in feed'
                ]
            },
            {
                id: 'fowl-typhoid',
                title: '4. Fowl Typhoid (Salmonella gallinarum)',
                content: 'Caused by Salmonella bacteria. Spreads through contaminated feed and water, dirty equipment, infected parent stock, and poor hygiene.',
                items: [
                    'Type: Bacterial | Age at Risk: All ages | Mortality: 30–70% | Egg Drop: Up to 20–40%',
                    'Symptoms: Weakness, pale combs, yellow diarrhea, sudden deaths, low egg production',
                    'Effects on Humans: Low risk to humans but hygiene is important',
                    'Treatment: Antibiotics like oxytetracycline or enrofloxacin (with vet guidance)',
                    'Prevention: Good biosecurity, clean houses, purchase healthy chicks'
                ]
            },
            {
                id: 'coryza',
                title: '5. Infectious Coryza',
                content: 'Spread through contaminated air, close contact, and poor ventilation.',
                items: [
                    'Type: Bacterial | Age at Risk: Growers and adult layers | Mortality: Low but causes heavy losses | Egg Drop: Up to 10–30%',
                    'Symptoms: Swollen eyes, swollen face, thick white discharge, bad smell around the head, breathing difficulty',
                    'Effects on Humans: Not harmful to humans',
                    'Treatment: Sulpher drugs, tylosin, or doxycycline',
                    'Prevention: Good ventilation, isolate sick birds'
                ]
            },
            {
                id: 'crd',
                title: '6. Chronic Respiratory Disease (CRD / Mycoplasma)',
                content: 'Caused by Mycoplasma bacteria. Triggered by dust, humidity, poor ventilation, and overcrowding.',
                items: [
                    'Type: Bacterial | Age at Risk: All ages | Mortality: 5–20% | Egg Drop: Up to 10–30%',
                    'Symptoms: Sneezing and coughing, foamy eyes, slow growth, poor feed conversion',
                    'Effects on Humans: Does not infect humans',
                    'Treatment: Tylosin, doxycycline, or tiamulin',
                    'Prevention: Reduce dust, increase ventilation, maintain dry litter'
                ]
            },
            {
                id: 'fowl-pox',
                title: '7. Fowl Pox (Chicken Pox)',
                content: 'Spread by mosquitoes and direct contact. Very common in Tanzania.',
                items: [
                    'Type: Viral | Age at Risk: All ages | Mortality: Low but affects performance | Egg Drop: 10–20%',
                    'Symptoms: Brown scabs on comb, eyelids, legs; ulcers inside the mouth in severe cases',
                    'Effects on Humans: Not harmful to humans',
                    'Prevention: Vaccination, mosquito control. No treatment available'
                ]
            },
            {
                id: 'mareks',
                title: '8. Marek\'s Disease',
                content: 'A virus that spreads from dust and infected feathers.',
                items: [
                    'Type: Viral | Age at Risk: 4–20 weeks | Mortality: >50%',
                    'Symptoms: Paralysis of legs/wings, grey eyes/blindness, weight loss',
                    'Effects on Humans: Does not affect humans',
                    'Prevention: Vaccination at day-old. No cure'
                ]
            },
            {
                id: 'avian-influenza',
                title: '9. Avian Influenza (Bird Flu)',
                content: 'Spread through wild birds and contaminated equipment.',
                items: [
                    'Type: Viral | Age at Risk: All ages | Mortality: Up to 90–100%',
                    'Symptoms: Sudden deaths, blue comb, severe breathing difficulty',
                    'Effects on Humans: Certain strains can infect humans. Report immediately',
                    'Prevention: Report to authorities. Strict biosecurity'
                ]
            },
            {
                id: 'worms',
                title: '10. Worm Infestation',
                content: 'Caused by roundworms, tapeworms, and cecal worms from dirty soil or contaminated feed.',
                items: [
                    'Type: Parasite | Age at Risk: Mostly adults and free-range birds | Mortality: Low | Egg Drop: 10–20%',
                    'Symptoms: Poor growth, pale comb, diarrhea, low body weight',
                    'Effects on Humans: Some worms can infect humans if hygiene is poor',
                    'Treatment: Deworm every 2–3 months (albendazole, levamisole)',
                    'Prevention: Clean environment, rotate ranges'
                ]
            },
            {
                id: 'vitamin-deficiency',
                title: '11. Vitamin Deficiency Problems',
                content: 'Caused by poor-quality feed, old feed, or unbalanced homemade feed.',
                items: [
                    'Type: Nutritional | Age at Risk: All ages | Mortality: Low | Egg Drop: 10–20%',
                    'Symptoms: Curled toes (Vit B), weak legs, white spots in eyes (Vit A deficiency), poor growth',
                    'Effects on Humans: No effect on humans',
                    'Treatment: Add vitamin supplements regularly, use quality feed'
                ]
            },
            {
                id: 'seasonal-patterns',
                title: 'Seasonal Disease Pattern in Tanzania',
                content: 'Different seasons bring different disease risks:',
                items: [
                    'Rainy Season: Coccidiosis, Worms, CRD, Coryza, Fowl pox (mosquitoes)',
                    'Dry Season: Newcastle, Gumboro, Heat stress problems'
                ]
            }
        ],
        tips: [
            'Follow a consistent vaccination program',
            'Keep the house clean and dry',
            'Avoid overcrowding',
            'Limit visitors',
            'Buy chicks from certified hatcheries',
            'Use clean water and balanced feed',
            'NEVER MISS A VACCINATION BY USING FUGA APP'
        ],
        warnings: [
            'For accurate diagnosis, proper treatment, and professional advice, always consult your local veterinarian',
            'Do not rely on this guide alone to diagnose or treat your chickens',
            'Symptoms can look similar between diseases'
        ]
    },
    housingSystems: {
        id: 'housing-systems',
        title: 'Understanding Poultry Housing Systems',
        subtitle: 'The way you rear your chickens has a huge impact on their health, productivity, and overall farm profitability',
        content: 'Let\'s break down the three main poultry rearing systems: Free Range, Cage System, and Deep Litter System.',
        sections: [
            {
                id: 'free-range',
                title: '1. Free Range System',
                content: 'Chickens are allowed to move freely in an open space during the day. They feed on natural insects, grass, and grains.',
                items: [
                    'Advantages: Lower feed cost, environmentally friendly, preferred by consumers, chickens get plenty of exercise',
                    'Shortcomings: Requires large land areas (2.5 acres for only 400 chickens), difficult to control diseases, harder to monitor production, lower productivity',
                    'Best Suited For: Dual-purpose and indigenous breeds'
                ]
            },
            {
                id: 'cage-system',
                title: '2. Cage System',
                content: 'Chickens are kept in cages arranged in tiers or rows inside a controlled building.',
                items: [
                    'Advantages: Easy management, space-efficient (keep many chickens in small space), better disease control, high egg production, saves labor costs (1 person can manage 4,000 chickens)',
                    'Shortcomings: High setup cost, limited movement can lead to stress, high dependency on artificial feed, not ideal for meat breeds',
                    'Best Suited For: Layers (egg-producing breeds) such as ISA Brown, Lohmann, Hy-Line'
                ]
            },
            {
                id: 'deep-litter',
                title: '3. Deep Litter System',
                content: 'Chickens are kept on the floor of a house covered with litter material such as sawdust, rice husks or wood shavings.',
                items: [
                    'Advantages: Easier and cheaper to set up, birds can move freely, suitable for small and medium-scale farmers, litter can be reused as organic fertilizer',
                    'Shortcomings: Needs regular cleaning, hard to control litter-borne diseases (Coccidiosis), diseases spread fast, slightly higher feed wastage, birds consume more feed',
                    'Best Suited For: Broilers and Dual-purpose breeds such as Cobb 500, Ross 308, Kuroiler, or Sasso'
                ]
            }
        ],
        tips: [
            'There\'s no one-size-fits-all system',
            'What matters most is management, hygiene, and consistency',
            'Choose based on your available space, capital, breed of chicken, and production goal'
        ]
    },
    temperatureHumidity: {
        id: 'temperature-humidity',
        title: 'Understanding Temperature and Humidity in Poultry Houses',
        subtitle: 'The climate inside a poultry house is one of the most important things in chicken farming',
        content: 'Poor climate conditions can cause breathing problems, digestive issues, stress, and poor growth. Healthy birds use their feed better and grow faster.',
        sections: [
            {
                id: 'broilers-temp',
                title: 'Recommended Temperatures for Broilers',
                content: 'Broilers grow fast and need the right temperature and humidity to stay healthy.',
                items: [
                    'Age 0 days: 30–34°C (depending on relative humidity)',
                    'Age 7 days: 28–32°C',
                    'Age 14 days: 25–29°C',
                    'Mature (28 kg/m²): 21–25°C',
                    'Ideal relative humidity: 60% – 80%',
                    'Too dry (RH below 60%): causes dusty air and breathing problems - Try spraying water',
                    'Too humid (RH above 80%): causes wet litter and diseases - Change litter or increase temperature'
                ]
            },
            {
                id: 'layers-temp',
                title: 'Recommended Temperatures for Layers',
                content: 'For layers, temperature affects both egg size and Feed Consumption.',
                items: [
                    'Best range: 20°C – 24°C',
                    'Below 20°C: For every 1°C drop, each bird needs about 1.5g more feed per day',
                    'Age 0-3 days: 35-36°C',
                    'Age 4-7 days: 33-35°C',
                    'Age 8-14 days: 31-33°C',
                    'Age 15-21 days: 25-29°C',
                    'Age 36-42 days: 21°C',
                    'Ideal relative humidity: 60% – 80%'
                ]
            },
            {
                id: 'physical-regulation',
                title: 'Physical Heat Regulation in Chickens',
                items: [
                    'Tissue insulation: Birds with a layer of fat can handle cold better',
                    'Feathers: Trap warm air and reduce heat loss',
                    'Body position: In cold weather, chickens huddle; in hot weather, they spread out',
                    'Evaporation (panting): When too hot, chickens lose heat by breathing out moisture',
                    'Blood flow: Blood vessels widen to release heat or tighten to retain heat'
                ]
            },
            {
                id: 'thermometer-placement',
                title: 'Placement of Thermometers',
                items: [
                    'Don\'t place the thermometer near walls or behind objects',
                    'Don\'t hang it too high',
                    'Put it close to the birds\' level',
                    'Make sure fresh air passes the thermometer before reaching the chickens'
                ]
            }
        ],
        tips: [
            'Temperature is not the same in every part of the house',
            'Keeping the right conditions helps reduce diseases and improve feed use',
            'Ideal relative humidity: 60%–80%',
            'Best temperature for layers: 20°C–24°C',
            'Temperature for broilers: 34°C at day-old, reducing to around 25°C by maturity'
        ],
        warnings: [
            'When it\'s too cold: Chicks huddle together tightly, eat less, grow slowly, and easily get dehydrated',
            'When it\'s too hot: Chicks lie flat, breathe fast, drink a lot of water, and growth becomes uneven'
        ]
    },
    startingFarm: {
        id: 'starting-farm',
        title: 'Things to Consider Before You Start Your Poultry Farm',
        subtitle: 'Essential planning steps for a successful poultry business',
        content: 'Poultry is one of the food items that never recedes in demand in Tanzania as Urbanization grows. Alternative and affordable protein sources are needed, making poultry the best option.',
        sections: [
            {
                id: 'customers-market',
                title: '1. Your Customers and Market',
                content: 'Before you start, ask yourself "Who am I selling to?" Understanding your customers helps you decide what type of chicken to rear and how much to produce.',
                items: [
                    'Are you targeting restaurants, bars, schools, households, or local shops?',
                    'Understand eligibility criteria for high-end hotels (e.g., some require less than 5% fishmeal in feed)',
                    'Consider order size and payment terms',
                    'Understanding your customers helps you decide layers or broilers and production volume'
                ]
            },
            {
                id: 'budget',
                title: '2. Budget',
                content: 'Just like any other business, poultry farming requires proper budgeting.',
                items: [
                    'Know how many chickens you can raise with your available capital',
                    'Be aware of all costs: chicks, feed, medicine, housing, and more',
                    'Know how much you need to build a coop',
                    'Calculate when you will start making money so that the chicken can sustain themselves',
                    'Know when you will start generating profits on your Farm',
                    'A small budgeting mistake can lead to losses even before you start',
                    'Use Fuga App or Fuga Web Calculator (www.primaxtz.com) to estimate your budget'
                ]
            },
            {
                id: 'infrastructure',
                title: '3. Infrastructure and Equipment',
                content: 'Decide which system will be suitable for you: Deep Litter or Battery Cages. This decision will help you save money in the future and reduce costs caused by renovations.',
                items: [
                    'Understand space requirements and what makes a good chicken coop',
                    'Ensure well-ventilated, protected from wind and rain',
                    'Safe from predators',
                    'Have all essentials: feeders, drinkers, heat lamps, thermometers',
                    'Avoid having to stall poultry cycles for infrastructure fixes'
                ]
            },
            {
                id: 'hygiene',
                title: '4. Ensuring Proper Hygiene and Biosecurity',
                content: 'One crucial factor to ensure that your poultry\'s health is always in check is proper hygiene and biosecurity.',
                items: [
                    'Establish disinfection and quarantine protocols',
                    'Limit visitors',
                    'Consult a veterinarian for health monitoring',
                    'Having all necessary measures prevents disease outbreaks'
                ]
            },
            {
                id: 'record-keeping',
                title: '5. Record Keeping',
                content: 'Keeping proper farm records is the backbone of a successful poultry business.',
                items: [
                    'Record daily expenses, sales and bird performance',
                    'Track your profit and loss',
                    'Know when and where to cut costs or improve',
                    'Provide accurate data when applying for loans',
                    'Record keeping helps banks understand your business',
                    'Helps you improve on coming batches/cycle production',
                    'Fuga App simplifies record keeping better than pen and paper',
                    'Provides analytics to help you understand your Poultry business'
                ]
            },
            {
                id: 'marketing',
                title: '6. Marketing and Selling Your Products',
                content: 'At the end of the day, selling and earning money is also a major consideration for having your own poultry farm.',
                items: [
                    'Consider direct sales to consumers, local markets, or online platforms',
                    'Consider wholesale distribution',
                    'Establish and build your network through customer relationships',
                    'Consider branding and product differentiation for better market performance'
                ]
            }
        ]
    }
};

// Export multilingual structure
export const poultryKnowledge = {
    en: knowledgeData,
    sw: knowledgeData // TODO: Add Swahili translations
};

const categoriesData = [
    { id: 'chickenTypes', name: 'Types of Chickens', icon: '🐔' },
    { id: 'broilerRaising', name: 'Raising Broilers', icon: '🍗' },
    { id: 'dayOldChicks', name: 'Day-Old Chicks Arrival', icon: '🐣' },
    { id: 'vaccination', name: 'Vaccination Guide', icon: '💉' },
    { id: 'commonDiseases', name: 'Common Diseases', icon: '🦠' },
    { id: 'housingSystems', name: 'Housing Systems', icon: '🏠' },
    { id: 'temperatureHumidity', name: 'Temperature & Humidity', icon: '🌡️' },
    { id: 'startingFarm', name: 'Starting a Farm', icon: '🚀' }
];

export const knowledgeCategories = {
    en: categoriesData,
    sw: categoriesData // TODO: Add Swahili translations
};

