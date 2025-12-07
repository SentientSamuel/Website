// Skills Section Interactive Functionality
(function() {
  let projectsData = null;
  let currentSkill = null;
  const skillsContainer = document.querySelector('.skills-container');
  const skillItems = document.querySelectorAll('.skill-item');
  const projectsListWrapper = document.querySelector('.projects-list-wrapper');
  const projectsListContent = document.querySelector('.projects-list-content');
  const projectsListTitle = document.querySelector('.projects-list-title');
  const projectsListItems = document.querySelector('.projects-list-items');

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
    if (!projectsData || !projectsData[skillName] || projectsData[skillName].length === 0) {
      projectsListItems.innerHTML = '<p class= text-muted>No projects available for this skill.</p>';
      return;
    }

    projectsListTitle.textContent = skillName;
    projectsListItems.innerHTML = '';

    projectsData[skillName].forEach(project => {
      const projectItem = document.createElement('div');
      projectItem.className = 'project-item';
      projectItem.innerHTML = 
        <div class=\project-item-name\></div>
        <div class=\project-item-description\></div>
      ;
      projectsListItems.appendChild(projectItem);
    });
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Show projects for a skill
  function showProjects(skillName) {
    currentSkill = skillName;
    skillsContainer.classList.add('active');
    if (projectsListWrapper) {
      projectsListWrapper.style.maxHeight = '1000px';
      projectsListWrapper.style.display = 'block';
    }
    if (projectsListContent) projectsListContent.style.minHeight = '400px';
    
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
    currentSkill = null;
    skillsContainer.classList.remove('active');
    if (projectsListWrapper) {
      projectsListWrapper.style.maxHeight = '0px';
      projectsListWrapper.style.display = 'none';
    }
    if (projectsListContent) projectsListContent.style.minHeight = '0px';
    skillItems.forEach(item => item.classList.remove('active'));
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
    if (currentSkill && !skillsContainer.contains(e.target)) {
      hideProjects();
    }
  });

  // Prevent closing when clicking inside the projects list
  if (projectsListWrapper) {
    projectsListWrapper.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  // Initialize on page load
  loadProjectsData();
})();
