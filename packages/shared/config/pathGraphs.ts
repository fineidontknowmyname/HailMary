// Path graphs - predefined learning paths
export const pathGraphs = {
  webDevelopment: {
    name: 'Web Development Roadmap',
    domain: 'web',
    levels: [
      {
        level: 1,
        name: 'Foundations',
        topics: ['HTML', 'CSS', 'JavaScript Basics'],
      },
      {
        level: 2,
        name: 'Intermediate',
        topics: ['DOM', 'ES6+', 'Async Programming'],
      },
      {
        level: 3,
        name: 'Advanced',
        topics: ['React', 'Performance', 'Testing'],
      },
    ],
  },
  dataScience: {
    name: 'Data Science Path',
    domain: 'data-science',
    levels: [
      {
        level: 1,
        name: 'Foundations',
        topics: ['Python', 'Statistics', 'Pandas'],
      },
      {
        level: 2,
        name: 'Intermediate',
        topics: ['Machine Learning', 'Scikit-learn', 'SQL'],
      },
      {
        level: 3,
        name: 'Advanced',
        topics: ['Deep Learning', 'TensorFlow', 'Big Data'],
      },
    ],
  },
};

// Domain maps - mapping between domains and resources
export const domainMaps = {
  web: {
    name: 'Web Development',
    categories: ['Frontend', 'Backend', 'Full Stack'],
  },
  mobile: {
    name: 'Mobile Development',
    categories: ['iOS', 'Android', 'Cross-Platform'],
  },
  'data-science': {
    name: 'Data Science',
    categories: ['Analytics', 'ML', 'Deep Learning'],
  },
};
