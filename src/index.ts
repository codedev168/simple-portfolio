/**
 * SimplePortfolio - A lightweight portfolio generator with TypeScript
 * Generates structured HTML content for personal portfolios with projects and user information
 */

export interface Project {
  /** Unique identifier for the project */
  id: string;
  /** Project title */
  title: string;
  /** Brief description of the project */
  description: string;
  /** Technologies used in the project */
  technologies: string[];
  /** Project URL (GitHub, live demo, etc.) */
  url: string;
  /** Optional image URL for visual representation */
  imageUrl?: string;
}

export interface PortfolioConfig {
  /** User's full name */
  name: string;
  /** Professional title or role */
  title: string;
  /** Personal bio or introduction */
  bio: string;
  /** Contact email address */
  email: string;
  /** Optional social media links */
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  /** Theme preference: 'light' or 'dark' */
  theme?: 'light' | 'dark';
}

export interface Portfolio {
  /** Portfolio configuration data */
  config: PortfolioConfig;
  /** Collection of featured projects */
  projects: Project[];
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates a URL format using regex
 * @param url - URL to validate
 * @returns True if URL is valid
 */
function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a new portfolio instance with the provided configuration
 * @param config - Configuration object containing user information
 * @returns Initialized portfolio object
 * @throws Error if required configuration fields are missing or invalid
 */
export function createPortfolio(config: PortfolioConfig): Portfolio {
  if (!config.name || !config.title || !config.bio || !config.email) {
    throw new Error('Portfolio requires name, title, bio, and email in configuration');
  }

  // Validate social links URLs
  if (config.socialLinks) {
    const invalidLinks = Object.entries(config.socialLinks)
      .filter(([_, url]) => url && !isValidURL(url))
      .map(([platform, url]) => `${platform}: ${url}`);
    
    if (invalidLinks.length > 0) {
      throw new Error(`Invalid URLs in social links: ${invalidLinks.join(', ')}`);
    }
  }

  return {
    config: {
      ...config,
      theme: config.theme || 'light'
    },
    projects: []
  };
}

/**
 * Adds a project to the portfolio
 * @param portfolio - Target portfolio to add the project to
 * @param project - Project data to add
 * @throws Error if project is missing required fields, already exists, or has invalid URLs
 */
export function addProject(portfolio: Portfolio, project: Project): void {
  if (!project.id || !project.title || !project.description || !project.url) {
    throw new Error('Project requires id, title, description, and url');
  }

  if (portfolio.projects.some(p => p.id === project.id)) {
    throw new Error(`Project with ID "${project.id}" already exists`);
  }

  if (!isValidURL(project.url)) {
    throw new Error(`Invalid URL in project "${project.title}": ${project.url}`);
  }

  if (project.imageUrl && !isValidURL(project.imageUrl)) {
    throw new Error(`Invalid image URL in project "${project.title}": ${project.imageUrl}`);
  }

  portfolio.projects.push({ ...project });
}

/**
 * Generates HTML content for the portfolio
 * @param portfolio - Portfolio data to render
 * @returns Complete HTML document as a string
 * @throws Error if portfolio is empty or invalid
 */
export function generateHTML(portfolio: Portfolio): string {
  if (!portfolio.config || portfolio.projects.length === 0) {
    throw new Error('Cannot generate HTML for empty portfolio');
  }

  const themeStyles = portfolio.config.theme === 'dark' 
    ? 'body { background: #121212; color: #ffffff; }' 
    : 'body { background: #ffffff; color: #000000; }';

  const projectCards = portfolio.projects
    .map(project => `
      <div class="project-card">
        <h3>${escapeHTML(project.title)}</h3>
        <p>${escapeHTML(project.description)}</p>
        <div class="tech-list">${project.technologies.map(tech => 
          `<span class="tech-tag">${escapeHTML(tech)}</span>`).join('')}</div>
        <a href="${escapeHTML(project.url)}" target="_blank" rel="noopener noreferrer">View Project</a>
        ${project.imageUrl ? `<img src="${escapeHTML(project.imageUrl)}" alt="${escapeHTML(project.title)}">` : ''}
      </div>
    `)
    .join('');

  const socialLinks = portfolio.config.socialLinks 
    ? Object.entries(portfolio.config.socialLinks)
        .map(([platform, url]) => `<a href="${escapeHTML(url)}" class="social-link" rel="noopener noreferrer">${escapeHTML(platform)}</a>`)
        .join('')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(portfolio.config.name)} - ${escapeHTML(portfolio.config.title)}</title>
  <style>
    ${themeStyles}
    body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 1000px; margin: auto; }
    h1, h2 { color: #1a73e8; }
    .project-card { border: 1px solid #ccc; padding: 1rem; margin: 1rem 0; border-radius: 8px; }
    .tech-tag { background: #eee; padding: 0.3rem 0.6rem; margin: 0.3rem; border-radius: 4px; }
    .social-link { margin: 0 0.5rem; color: inherit; text-decoration: none; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHTML(portfolio.config.name)}</h1>
    <h2>${escapeHTML(portfolio.config.title)}</h2>
    <p>${escapeHTML(portfolio.config.bio)}</p>
    <p>Email: <a href="mailto:${escapeHTML(portfolio.config.email)}">${escapeHTML(portfolio.config.email)}</a></p>
    <div>${socialLinks}</div>
  </header>
  <main>
    <h2>Projects</h2>
    ${projectCards}
  </main>
</body>
</html>`;
}