// Dark Mode Toggle Functionality (Tailwind CSS)
(function() {
  const html = document.documentElement; // Tailwind uses html element for dark mode
  
  // Function to toggle dark mode
  function toggleDarkMode() {
    html.classList.toggle('dark');
    const isEnabled = html.classList.contains('dark');
    
    // Keep body class for legacy support during transition
    if (isEnabled) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Save preference
    localStorage.setItem('darkMode', isEnabled ? 'enabled' : 'disabled');
    
    // Update all icons
    updateAllIcons(isEnabled);
  }

  function updateAllIcons(isDark) {
    document.querySelectorAll('#darkModeToggle i, #darkModeToggleMobile i').forEach(icon => {
      if (isDark) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    });
  }

  // Wait for DOM to be ready, then attach event listeners
  function initDarkMode() {
    // Check for saved dark mode preference and update icons
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    updateAllIcons(isDarkMode);
    
    // Add event listeners to both toggle buttons
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
    
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    if (darkModeToggleMobile) {
      darkModeToggleMobile.addEventListener('click', toggleDarkMode);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
  } else {
    // DOM is already ready
    initDarkMode();
  }
})();

// Skill Bar Animation on Scroll
(function() {
  const skillBars = document.querySelectorAll('.skill-progress');
  let animated = false;

  function animateSkills() {
    if (animated) return;
    
    const skillSection = document.getElementById('skills');
    if (!skillSection) return;

    const rect = skillSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

    if (isVisible) {
      skillBars.forEach(bar => {
        bar.classList.add('animate');
      });
      animated = true;
    }
  }

  window.addEventListener('scroll', animateSkills);
  window.addEventListener('load', animateSkills);
})();

// Fix navbar visibility on blog post pages (pages without masthead)
(function() {
  // Check if there's no masthead element (blog post pages)
  const hasMasthead = document.querySelector('header.masthead');
  if (!hasMasthead) {
    // Add class to body for CSS targeting
    document.body.classList.add('no-masthead');
    // Also ensure navbar has scrolled styling from the start
    const mainNav = document.getElementById('mainNav');
    if (mainNav) {
      mainNav.classList.add('navbar-scrolled');
    }
  }
})();

