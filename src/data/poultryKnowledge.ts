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

export const poultryKnowledge: Record<string, Record<string, KnowledgeSection>> = {
  en: {
    'chicken-types': {
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
            'Egg Production: +300 eggs per hen per year and +400 in 90 weeks',
            'Body Weight: Average adult weight is 1.5 - 2.0 kg',
            'Onset of Lay: Begins between 18–21 weeks of age',
            'Examples: ISA Brown, Lohmann Brown, Hy-Line Brown'
          ]
        },
        {
          id: 'broilers',
          title: '2. Broilers',
          content: 'Broilers are selectively bred for rapid growth rate and optimum meat yield.',
          items: [
            'Growth Rate: Reach 1.5–2.5 kg live weight in 28–42 days',
            'Feed Conversion Ratio (FCR): 1.6–1.8',
            'Examples: Cobb 500, Ross 308, Arbor Acres'
          ]
        },
        {
          id: 'dual-purpose',
          title: '3. Dual-Purpose / Hybrid Chickens',
          content: 'Dual-purpose chickens serve both meat and egg production functions.',
          items: [
            'Egg Production: 220–300 eggs per year',
            'Body Weight: 2.5–3.5 kg at 16–18 weeks',
            'Examples: Kuroiler, Sasso, Rainbow Rooster'
          ]
        }
      ],
      comparisons: {
        headers: ['Feature', 'Layers', 'Broilers', 'Dual Purpose'],
        rows: [
          ['Main Product', 'Eggs', 'Meat', 'Both'],
          ['Growth Speed', 'Slow', 'Very Fast', 'Moderate'],
          ['Eggs/Year', '300–420', 'Few', '220–300']
        ]
      }
    },
    'broiler-raising': {
      id: 'broiler-raising',
      title: 'How to Raise Broiler Chicken',
      subtitle: 'A comprehensive guide to meat production excellence',
      content: 'Broiler chickens represent the predominant poultry type raised throughout Tanzania.',
      sections: [
        {
          id: 'quality-chicks',
          title: 'Selecting Quality Chicks',
          items: [
            'Source from trustworthy hatcheries',
            'Check for active, alert behavior',
            'Avoid chicks with deformities'
          ]
        },
        {
          id: 'brooder-setup',
          title: 'Housing and Brooder Setup',
          items: [
            'Space: 13-16 broilers/m²',
            'Pre-heat the brooder for 3–4 hours'
          ]
        }
      ]
    },
    'vaccination': {
      id: 'vaccination',
      title: 'Vaccination Guide',
      subtitle: 'A Beginner-Friendly Guide',
      content: 'Vaccination is the best way to protect your chickens from dangerous and costly diseases.',
      sections: [
        {
          id: 'what-is-vaccine',
          title: 'What is a Vaccine?',
          items: [
            'Vaccines prevent disease—they do NOT cure sick birds',
            'Cold chain must be maintained at 2–8°C',
            'Never vaccinate sick or weak chickens'
          ]
        }
      ]
    },
    'common-diseases': {
      id: 'common-diseases',
      title: 'Common Poultry Diseases',
      subtitle: 'Guide to symptoms and prevention',
      content: 'Diseases spread through poor hygiene and lack of vaccination.',
      sections: [
        {
          id: 'newcastle',
          title: 'Newcastle Disease (ND / Kideri)',
          items: [
            'Symptoms: Twisted necks, paralysis, greenish diarrhea',
            'Prevention: Regular vaccination'
          ]
        }
      ]
    }
  },
  sw: {
    'chicken-types': {
      id: 'chicken-types',
      title: 'Aina za Kuku Kulingana na Matumizi Yao',
      subtitle: 'Kuelewa aina tofauti za kuku ni muhimu kwa kila mfugaji',
      content: 'Kila aina imetengenezwa kwa ajili ya nyama, mayai, au vyote.',
      sections: [
        {
          id: 'layers',
          title: '1. Kuku wa Mayai (Layers)',
          content: 'Hawa wameboreshwa kwa ajili ya uzalishaji mkubwa wa mayai.',
          items: [
            'Uzalishaji: Mayai 300+ kwa mwaka',
            'Uzito: Kilo 1.5 - 2.0',
            'Kuanza kutaga: Wiki 18–21'
          ]
        },
        {
          id: 'broilers',
          title: '2. Kuku wa Nyama (Broilers)',
          content: 'Hawa wanakua haraka sana kwa ajili ya nyama.',
          items: [
            'Ukuaji: Kilo 1.5–2.5 ndani ya siku 28–42',
            'Ufanisi wa chakula: Kilo 1.6-1.8 kwa kilo ya nyama'
          ]
        },
        {
          id: 'dual-purpose',
          title: '3. Kuku wa Kienyeji Boresha (Dual-Purpose)',
          content: 'Hawa ni kwa ajili ya nyama na mayai.',
          items: [
            'Uzalishaji: Mayai 220–300 kwa mwaka',
            'Uvumilivu: Wanahimili mazingira tofauti'
          ]
        }
      ],
      comparisons: {
        headers: ['Sifa', 'Mayai', 'Nyama', 'Kienyeji Boresha'],
        rows: [
          ['Bidhaa Kuu', 'Mayai', 'Nyama', 'Vyote'],
          ['Kasi ya Kukua', 'Polepole', 'Haraka Sana', 'Wastani']
        ]
      }
    },
    'broiler-raising': {
      id: 'broiler-raising',
      title: 'Jinsi ya Kufuga Kuku wa Nyama (Broilers)',
      subtitle: 'Mwongozo kamili wa kupata matokeo bora',
      content: 'Kuku wa nyama ni maarufu sana kwa wafugaji nchini Tanzania.',
      sections: [
        {
          id: 'quality-chicks',
          title: 'Kuchagua Vifaranga',
          items: [
            'Nunua kutoka sehemu zinazoeleweka',
            'Vifaranga wawe wachangamfu'
          ]
        }
      ]
    },
    'vaccination': {
      id: 'vaccination',
      title: 'Mwongozo wa Chanjo',
      subtitle: 'Mwongozo rahisi kwa kila mmoja',
      content: 'Chanjo ndiyo njia pekee ya kuzuia magonjwa hatari.',
      sections: [
        {
          id: 'what-is-vaccine',
          title: 'Chanjo ni Nini?',
          items: [
            'Chanjo huzuia lakini haitibu kuku aliye tayari mgonjwa',
            'Lazima iwekwe kwenye baridi (2–8°C)'
          ]
        }
      ]
    },
    'common-diseases': {
      id: 'common-diseases',
      title: 'Magonjwa ya Kuku',
      subtitle: 'Dalili na kinga',
      content: 'Magonjwa huenea kwa kukosa usafi na chanjo.',
      sections: [
        {
          id: 'newcastle',
          title: 'Mdondo (Kideri)',
          items: [
            'Dalili: Shingo kupinda, kuhara kijani',
            'Kinga: Chanjo ya mara kwa mara'
          ]
        }
      ]
    }
  }
};

export const knowledgeCategories: Record<string, { id: string; name: string; icon: string }[]> = {
  en: [
    { id: 'chicken-types', name: 'Types of Chickens', icon: '🐔' },
    { id: 'broiler-raising', name: 'Raising Broilers', icon: '🍗' },
    { id: 'day-old-chicks', name: 'Day-Old Chicks Arrival', icon: '🐣' },
    { id: 'vaccination', name: 'Vaccination Guide', icon: '💉' },
    { id: 'common-diseases', name: 'Common Diseases', icon: '🦠' }
  ],
  sw: [
    { id: 'chicken-types', name: 'Aina za Kuku', icon: '🐔' },
    { id: 'broiler-raising', name: 'Kufuga Broilers', icon: '🍗' },
    { id: 'day-old-chicks', name: 'Mapokezi ya Vifaranga', icon: '🐣' },
    { id: 'vaccination', name: 'Mwongozo wa Chanjo', icon: '💉' },
    { id: 'common-diseases', name: 'Magonjwa ya Kuku', icon: '🦠' }
  ]
};
