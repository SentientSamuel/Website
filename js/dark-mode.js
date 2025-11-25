// Dark Mode Toggle Functionality
(function() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.body;
  const icon = darkModeToggle.querySelector('i');

  // Check for saved dark mode preference
  const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
  
  if (isDarkMode) {
    body.classList.add('dark-mode');
    updateIcon(true);
  }

  // Toggle dark mode
  darkModeToggle.addEventListener('click', function() {
    body.classList.toggle('dark-mode');
    const isEnabled = body.classList.contains('dark-mode');
    
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

