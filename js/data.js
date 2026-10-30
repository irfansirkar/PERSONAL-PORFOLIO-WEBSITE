/* All portfolio content lives here. Edit this file to update the game; nothing else needs to change. */
window.RESUME = {
  name: 'Mohammad Irfan Sirkar',
  short: 'Irfan',
  role: 'ML Developer',
  location: 'Hyderabad, India',
  email: 'sirkarks@gmail.com',
  linkedin: '', // paste your LinkedIn URL here, e.g. 'https://www.linkedin.com/in/your-handle'
  github: '',   // optional

  summary: 'Computer Science student specialising in Artificial Intelligence and Data Science, building real-world tech: AI model aggregation, fine-tuned assistants, computer vision and full-stack web apps with React and Next.js. I learn fast, work well in teams, and love exploring emerging technologies to solve meaningful problems.',

  education: {
    school: 'Muffakham Jah College of Engineering and Technology (MJCET)',
    degree: 'B.E. in Artificial Intelligence and Data Science',
    years: '2023 – Present',
  },

  work: [
    {role: 'Tech Head', org: 'CSI – MJCET', date: 'Jan – Apr 2025'},
    {role: 'Lead Developer', org: 'Robust-3D · CSI Hackathon', date: 'Nov 2024'},
    {role: 'Lead Developer', org: 'Synapsify · MJCET Expo', date: 'Jun – Aug 2024'},
  ],

  achievements: [
    {place: '3rd Place', name: 'AWS Cloud Ignite', date: 'July 2025'},
    {place: '3rd Place', name: 'SMC Expogenix', date: 'July 2025'},
  ],

  projects: [
    {
      id: 'medimap', name: 'MediMap', event: 'Expogenix 2024', date: 'Aug 2024', color: '#5B8CFF',
      tagline: 'Multi-LLM consensus engine for researchers',
      stat: '−80% manual comparison effort',
      stack: ['FastAPI', 'Python', 'BART (Hugging Face)', 'OpenAI / Groq / Gemini APIs', 'AWS', 'HTML & CSS', 'JavaScript'],
      points: [
        'Aggregates answers from several LLMs and returns a consensus-based answer for researchers.',
        'Adaptive summarisation with BART, plus semantic-similarity and cross-model validation.',
        'Cut manual comparison effort by 80% and introduced a scoring system now mirrored by emerging commercial tools.',
      ],
    },
    {
      id: 'medzo', name: 'Medzo', event: 'Malla Reddy Hackathon · Encode', date: 'Jan 2024', color: '#FF9F43',
      tagline: 'Domain-restricted AWS chatbot for the AWS Club',
      stack: ['Python', 'AWS SDK (Boto3)', 'LLM'],
      points: [
        'Filters out non-AWS questions and gives precise answers to AWS ones.',
        'Scalable knowledge architecture so club members get instant technical help.',
      ],
    },
    {
      id: 'stackfarm', name: 'Stack-Farm', event: 'Hackathon project', date: 'Nov 2024', color: '#4ADE80',
      tagline: 'AI plant-disease diagnosis for farmers',
      stack: ['Python', 'Streamlit', 'TensorFlow', 'Image processing'],
      points: [
        'Detects early-stage plant disease from leaf photos with a trained image classifier.',
        'Lightweight, responsive Streamlit UI built for farmers and field agents.',
      ],
    },
    {
      id: 'robust3d', name: 'Robust-3D', event: 'HackRev', date: 'Apr 2025', color: '#FF5D8F',
      tagline: 'Photo-to-3D AI fitness coach',
      stack: ['Computer Vision', '3D body modelling', 'AI recommendations'],
      points: [
        'Turns a photo into a 3D model of the user’s current body and reveals the muscle structure they could reach.',
        'Click any body part for targeted home or gym workouts with form guidance.',
        'Personalised diet plans, daily photo progress tracking, goal-time estimates and motivational checkpoints.',
        'Recommends an optimal physique for different sports based on height and goals.',
      ],
    },
    {
      id: 'comparev2', name: 'LLM Compare Engine v2', event: 'CSI Tech Nova', date: 'May 2025', color: '#B9A7F5',
      tagline: 'Next-gen LLM comparison with a plugin architecture',
      stack: ['Next.js', 'FastAPI', 'Python', 'AWS', 'PEGASUS', 'LLM APIs'],
      points: [
        'Built on v1 with interactive model selection, an analytics dashboard and plugin-based extensibility.',
        'Integrated Claude 3 and Gemini with real-time response validation and conflict alerts.',
        'Rebuilt the frontend around usability and configurability.',
      ],
    },
    {
      id: 'teachassist', name: 'TeachAssist', event: 'SMC Expogenix & AWS Cloud', date: 'Jun 2025', color: '#FFC94A',
      tagline: 'AI study co-pilot with RAG and OCR',
      stack: ['Python', 'Streamlit', 'Google Gemini', 'LangChain', 'PIL', 'PyPDF2', 'python-docx'],
      points: [
        'Personalised learning across many subjects, powered by Google Gemini.',
        'Multi-format document analysis (PDF, DOCX, TXT) with RAG for Q&A and exploration.',
        'OCR image analysis, AI-generated practice tests with adjustable difficulty, and usage analytics.',
      ],
    },
    {
      id: 'medimap2', name: 'MediMap Multimodal', event: 'Expogenix', date: 'Jun 2025', color: '#2EE6D6',
      tagline: 'Multimodal emergency diagnostics',
      stack: ['Python', 'PyTorch', 'Transformers', 'Streamlit', 'BiMediX2', 'CUDA'],
      points: [
        'Combines text, X-rays and CT scans for real-time, transparent diagnostics in emergencies.',
        'BiMediX2 multimodal medical model with an interactive chat interface.',
        'Runs on CPU or GPU, with tunable generation and pre-built emergency scenario prompts.',
      ],
    },
    {
      id: 'skentics', name: 'Skentics', event: 'Vision project', date: 'Jul 2025', color: '#FF6B3D',
      tagline: 'Real-time AI vision system',
      stat: '60+ FPS live detection',
      stack: ['Python', 'YOLO11', 'PaliGemma 3B', 'Tesseract OCR', 'PyTorch', 'CUDA'],
      points: [
        'Combines object detection, a vision-language model, OCR and speech on live RTSP video streams.',
        '60+ FPS with YOLO11, plus PaliGemma 3B visual question answering with voice commands.',
        'Multi-threaded pipeline with adaptive frame skipping for live feeds.',
      ],
    },
  ],

  // Each skill unlocks when the player finds any listed project, or talks to the listed character.
  skills: [
    {branch: 'Machine Learning', color: '#FF6B3D', items: [
      ['PyTorch', ['medimap2', 'skentics']],
      ['Transformers', ['medimap', 'medimap2']],
      ['LLM fine-tuning', ['sage']],
      ['LangChain', ['teachassist']],
      ['Computer Vision', ['stackfarm', 'skentics', 'robust3d']],
      ['TensorFlow', ['stackfarm']],
      ['YOLO & VLMs', ['skentics']],
      ['Tesseract OCR', ['skentics', 'teachassist']],
    ]},
    {branch: 'Backend & Cloud', color: '#5B8CFF', items: [
      ['Python', ['medzo', 'medimap', 'stackfarm', 'teachassist', 'medimap2', 'skentics']],
      ['FastAPI', ['medimap', 'comparev2']],
      ['AWS', ['medzo', 'medimap', 'comparev2']],
      ['API integrations', ['medimap', 'comparev2']],
      ['Streamlit', ['stackfarm', 'teachassist', 'medimap2']],
      ['CUDA', ['medimap2', 'skentics']],
    ]},
    {branch: 'Web & Design', color: '#4ADE80', items: [
      ['HTML & CSS', ['medimap']],
      ['JavaScript', ['medimap']],
      ['React', ['prof']],
      ['Next.js', ['comparev2']],
      ['Figma', ['sage']],
    ]},
    {branch: 'People', color: '#FFC94A', items: [
      ['Communication', ['prof']],
      ['Leadership', ['guild']],
      ['Teamwork', ['guild']],
      ['Critical thinking', ['sage']],
      ['Time management', ['keeper']],
      ['Attention to detail', ['post']],
    ]},
  ],
};
