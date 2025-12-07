// Dark Mode Toggle Functionality (Tailwind CSS)
// This script must be loaded on all pages for dark mode to work

(function() {
  'use strict';
  
  const html = document.documentElement; // Tailwind uses html element for dark mode
  
  // Function to toggle dark mode
  function toggleDarkMode(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const currentlyDark = html.classList.contains('dark');
    
    if (currentlyDark) {
      // Switching to light mode
      html.classList.remove('dark');
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'disabled');
      updateAllIcons(false);
      console.log('Switched to LIGHT mode');
    } else {
      // Switching to dark mode
      html.classList.add('dark');
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'enabled');
      updateAllIcons(true);
      console.log('Switched to DARK mode');
    }
    
    // Force a repaint to ensure styles update
    void html.offsetHeight;
  }

  function updateAllIcons(isDark) {
    const icons = document.querySelectorAll('#darkModeToggle i, #darkModeToggleMobile i');
    icons.forEach(icon => {
      if (isDark) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    });
  }

  // Initialize dark mode system
  function initDarkMode() {
    console.log('Initializing dark mode...');
    
    // Check for saved dark mode preference and update icons
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    
    // Ensure body class is set (body exists now)
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    updateAllIcons(isDarkMode);
    
    // Add event listeners to both toggle buttons using event delegation
    // This is more reliable than direct listeners
    document.addEventListener('click', function(e) {
      const target = e.target.closest('#darkModeToggle, #darkModeToggleMobile');
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        toggleDarkMode(e);
      }
    });
    
    // Also try direct listeners as backup
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
    
    if (darkModeToggle) {
      console.log('Found darkModeToggle button');
      darkModeToggle.addEventListener('click', toggleDarkMode);
    } else {
      console.warn('darkModeToggle button not found');
    }
    
    if (darkModeToggleMobile) {
      console.log('Found darkModeToggleMobile button');
      darkModeToggleMobile.addEventListener('click', toggleDarkMode);
    } else {
      console.warn('darkModeToggleMobile button not found');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
  } else {
    // DOM is already ready
    initDarkMode();
  }
  
  // Also expose toggle function globally for debugging
  window.toggleDarkMode = toggleDarkMode;
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
