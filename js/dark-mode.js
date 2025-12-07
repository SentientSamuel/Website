// Dark Mode Toggle Functionality (Tailwind CSS)
(function() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const html = document.documentElement; // Tailwind uses html element for dark mode
  const icon = darkModeToggle.querySelector('i');

  // Check for saved dark mode preference
  const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
  
  if (isDarkMode) {
    html.classList.add('dark');
    document.body.classList.add('dark-mode'); // Keep for any legacy CSS
    updateIcon(true);
  }

  // Toggle dark mode
  darkModeToggle.addEventListener('click', function() {
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
    
    // Update icon
    updateIcon(isEnabled);
  });

  function updateIcon(isDark) {
    if (isDark) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
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

