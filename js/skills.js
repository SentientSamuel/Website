// Skills Section Interactive Functionality
(function() {
  let projectsData = null;
  let currentSkill = null;
  let skillsContainer, skillItems, projectsListWrapper, projectsListTitle, projectsListItems;

  // Initialize elements
  function initElements() {
    skillsContainer = document.querySelector('.skills-container');
    skillItems = document.querySelectorAll('.skill-item');
    projectsListWrapper = document.querySelector('.projects-list-wrapper');
    projectsListTitle = document.querySelector('.projects-list-title');
    projectsListItems = document.querySelector('.projects-list-items');

    // Check if all required elements exist
    if (!skillsContainer || !projectsListWrapper || !projectsListTitle || !projectsListItems) {
      console.error('Skills section elements not found');
      return false;
    }
    return true;
  }

  // Load projects data from JSON
  async function loadProjectsData() {
    try {
      const response = await fetch('js/projects-data.json');
      if (!response.ok) {
        throw new Error('Failed to load projects data');
      }
      projectsData = await response.json();
    } catch (error) {
      console.error('Error loading projects data:', error);
      projectsData = {};
    }
  }

  // Render projects list
  function renderProjects(skillName) {
    if (!projectsListTitle || !projectsListItems) {
      console.error('Projects list elements not found');
      return;
    }

    if (!projectsData || !projectsData[skillName] || projectsData[skillName].length === 0) {
      projectsListItems.innerHTML = '<p class="text-muted">No projects available for this skill.</p>';
      projectsListTitle.textContent = skillName;
      return;
    }

    projectsListTitle.textContent = skillName;
    projectsListItems.innerHTML = '';

    projectsData[skillName].forEach(project => {
      const projectItem = document.createElement('div');
      projectItem.className = 'project-item';
      projectItem.innerHTML = `
        <div class="project-item-name">${escapeHtml(project.name)}</div>
        <div class="project-item-description">${escapeHtml(project.description)}</div>
      `;
      projectsListItems.appendChild(projectItem);
    });
  }

  // Show projects for a skill
  function showProjects(skillName) {
    if (!skillsContainer) return;
    
    currentSkill = skillName;
    skillsContainer.classList.add('active');
    
    // Mark the clicked skill as active
    skillItems.forEach(item => {
      if (item.dataset.skill === skillName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    renderProjects(skillName);
  }

  // Hide projects and return to skill bars
  function hideProjects() {
    if (!skillsContainer) return;
    
    currentSkill = null;
    skillsContainer.classList.remove('active');
    skillItems.forEach(item => item.classList.remove('active'));
  }

  // Check if mobile device
  function isMobile() {
    return window.innerWidth <= 991.98;
  }

  // Initialize event listeners
  function initEventListeners() {
    // Only add click handlers on desktop (not mobile)
    if (isMobile()) {
      return; // Don't add click handlers on mobile
    }
    
    // Handle skill item clicks
    skillItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        const skillName = this.dataset.skill;
        
        // If clicking the same skill, toggle off
        if (currentSkill === skillName) {
          hideProjects();
        } else {
          showProjects(skillName);
        }
      });
    });

    // Handle click outside to close
    document.addEventListener('click', function(e) {
      if (currentSkill && skillsContainer && !skillsContainer.contains(e.target)) {
        hideProjects();
      }
    });

    // Prevent closing when clicking inside the projects list
    if (projectsListWrapper) {
      projectsListWrapper.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on page load
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        if (initElements()) {
          loadProjectsData().then(() => {
            initEventListeners();
          });
        }
      });
    } else {
      if (initElements()) {
        loadProjectsData().then(() => {
          initEventListeners();
        });
      }
    }
  }

  init();
})();
