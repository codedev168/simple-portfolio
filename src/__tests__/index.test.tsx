import { describe, it, expect, vi } from 'vitest';
import { createPortfolio, addProject, generateHTML, Project, PortfolioConfig } from '../index.js';

describe('createPortfolio', () => {
  it('should create a portfolio with default light theme when not specified', () => {
    const config: PortfolioConfig = {
      name: 'John Doe',
      title: 'Web Developer',
      bio: 'A passionate developer',
      email: 'john@example.com'
    };
    
    const portfolio = createPortfolio(config);
    
    expect(portfolio.config).toEqual({
      ...config,
      theme: 'light'
    });
    expect(portfolio.projects).toEqual([]);
  });

  it('should create a portfolio with specified dark theme', () => {
    const config: PortfolioConfig = {
      name: 'Jane Smith',
      title: 'Designer',
      bio: 'Creative designer',
      email: 'jane@example.com',
      theme: 'dark'
    };
    
    const portfolio = createPortfolio(config);
    
    expect(portfolio.config.theme).toBe('dark');
  });

  it('should throw error when required config fields are missing', () => {
    const incompleteConfig = {
      name: 'Test',
      title: 'Title',
      bio: 'Bio',
      // Missing email
    } as unknown as PortfolioConfig;
    
    expect(() => createPortfolio(incompleteConfig)).toThrow(
      'Portfolio requires name, title, bio, and email in configuration'
    );
  });
});

describe('addProject', () => {
  const basePortfolio = createPortfolio({
    name: 'Test User',
    title: 'Developer',
    bio: 'Tester',
    email: 'test@example.com'
  });

  it('should add a valid project to the portfolio', () => {
    const project: Project = {
      id: '1',
      title: 'Test Project',
      description: 'A test project',
      technologies: ['JavaScript', 'TypeScript'],
      url: 'https://example.com'
    };
    
    addProject(basePortfolio, project);
    
    expect(basePortfolio.projects).toHaveLength(1);
    expect(basePortfolio.projects[0]).toEqual(project);
  });

  it('should throw error when adding project with missing required fields', () => {
    const invalidProject = {
      id: '2',
      title: 'Incomplete',
      // Missing description and url
      technologies: ['HTML'],
    } as unknown as Project;
    
    expect(() => addProject(basePortfolio, invalidProject)).toThrow(
      'Project requires id, title, description, and url'
    );
  });

  it('should throw error when adding duplicate project ID', () => {
    const project1: Project = {
      id: '1',
      title: 'First',
      description: 'First project',
      technologies: ['TypeScript'],
      url: 'https://first.com'
    };
    
    const project2: Project = {
      id: '1',
      title: 'Duplicate',
      description: 'Duplicate ID',
      technologies: ['JavaScript'],
      url: 'https://duplicate.com'
    };
    
    addProject(basePortfolio, project1);
    
    expect(() => addProject(basePortfolio, project2)).toThrow(
      `Project with ID "1" already exists`
    );
  });
});

describe('generateHTML', () => {
  const basePortfolio = createPortfolio({
    name: 'Alice',
    title: 'Developer',
    bio: 'Full stack developer',
    email: 'alice@example.com',
    socialLinks: {
      github: 'https://github.com/alice',
      linkedin: 'https://linkedin.com/in/alice'
    },
    theme: 'dark'
  });

  const testProject: Project = {
    id: '1',
    title: 'Test Project',
    description: 'A sample project',
    technologies: ['React', 'TypeScript'],
    url: 'https://project.com',
    imageUrl: 'https://image.com/project.jpg'
  };

  beforeEach(() => {
    addProject(basePortfolio, testProject);
  });

  it('should generate HTML with correct structure and content', () => {
    const html = generateHTML(basePortfolio);
    
    expect(html).toContain('<h1>Alice</h1>');
    expect(html).toContain('<h2>Developer</h2>');
    expect(html).toContain('Full stack developer');
    expect(html).toContain('Email: <a href="mailto:alice@example.com">alice@example.com</a>');
    expect(html).toContain('<a href="https://github.com/alice" class="social-link">github</a>');
    expect(html).toContain('<a href="https://linkedin.com/in/alice" class="social-link">linkedin</a>');
    expect(html).toContain('<h3>Test Project</h3>');
    expect(html).toContain('<span class="tech-tag">React</span>');
    expect(html).toContain('<span class="tech-tag">TypeScript</span>');
    expect(html).toContain('<a href="https://project.com" target="_blank">View Project</a>');
    expect(html).toContain('<img src="https://image.com/project.jpg" alt="Test Project">');
    
    // Check dark theme styles
    expect(html).toContain('body { background: #121212; color: #ffffff; }');
  });

  it('should throw error when generating HTML for empty portfolio', () => {
    const emptyPortfolio = createPortfolio({
      name: 'Empty',
      title: 'Portfolio',
      bio: 'No projects',
      email: 'empty@example.com'
    });
    
    expect(() => generateHTML(emptyPortfolio)).toThrow(
      'Cannot generate HTML for empty portfolio'
    );
  });

  it('should generate light theme styles when theme is not specified', () => {
    const lightPortfolio = createPortfolio({
      name: 'Light',
      title: 'Theme',
      bio: 'Light mode',
      email: 'light@example.com'
    });
    
    addProject(lightPortfolio, testProject);
    
    const html = generateHTML(lightPortfolio);
    expect(html).toContain('body { background: #ffffff; color: #000000; }');
  });
});