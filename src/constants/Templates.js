export const Templates = [
  {
    name: 'Minimal',
    description: 'Basic structure with Project Name, Description, and License.',
    elements: [
      { id: 't1-1', type: 'heading', text: '[PROJECT_NAME]', level: 1 },
      { id: 't1-2', type: 'badge', label: 'License', imageUrl: 'https://img.shields.io/badge/license-MIT-blue.svg', targetUrl: '' },
      { id: 't1-3', type: 'paragraph', text: 'A brief description of what this project does and who it\'s for.' },
      { id: 't1-4', type: 'heading', text: 'License', level: 2 },
      { id: 't1-5', type: 'paragraph', text: 'MIT License. Copyright (c) [CURRENT_YEAR] [GITHUB_USERNAME]' },
    ],
  },
  {
    name: 'Full Project',
    description: 'Comprehensive structure including Prerequisites, Contributing, and Tests.',
    elements: [
      { id: 't2-1', type: 'heading', text: '[PROJECT_NAME]', level: 1 },
      { id: 't2-2', type: 'paragraph', text: 'A complete solution for...' },
      { id: 't2-3', type: 'heading', text: 'Features', level: 2 },
      { id: 't2-4', type: 'list', items: ['Feature A', 'Feature B', 'Feature C'], isOrdered: false },
      { id: 't2-5', type: 'heading', text: 'Installation', level: 2 },
      { id: 't2-6', type: 'code', code: 'git clone https://github.com/[GITHUB_USERNAME]/[PROJECT_NAME].git\nnpm install', language: 'bash' },
    ],
  }
];
