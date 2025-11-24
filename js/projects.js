$(document).ready(function() {
  const username = 'SentientSamuel';
  const apiUrl = `https://api.github.com/users/${username}/repos`;

  // Fetch repositories
  $.getJSON(apiUrl, function(repos) {
    const $indicators = $('.carousel-indicators');
    const $inner = $('.carousel-inner');
    
    $indicators.empty();
    $inner.empty();

    // Filter out forks if desired, or sort by updated_at
    repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    repos.forEach((repo, index) => {
      // Create Indicator
      const indicator = $(`<li data-target="#demo" data-slide-to="${index}" class="${index === 0 ? 'active' : ''}"></li>`);
      $indicators.append(indicator);

      // Create Carousel Item
      const itemClass = index === 0 ? 'carousel-item active' : 'carousel-item';
      const description = repo.description ? repo.description : 'No description available.';
      
      const itemHtml = `
        <div class="${itemClass}">
          <div class="card">
            <div class="card-body text-center" style="min-height: 300px; display: flex; flex-direction: column; justify-content: center;">
              <h3 class="card-title">${repo.name}</h3>
              <p class="card-text">${description}</p>
              <div class="mt-3">
                <button class="btn btn-primary expand-btn" data-repo="${repo.name}" data-toggle="modal" data-target="#projectModal">
                  Expand
                </button>
                <a href="${repo.html_url}" target="_blank" class="btn btn-outline-primary ml-2">View on GitHub</a>
              </div>
            </div>
          </div>
        </div>
      `;
      $inner.append(itemHtml);
    });

    // Handle Expand Button Click
    $('.expand-btn').click(function() {
      const repoName = $(this).data('repo');
      const $modalBody = $('#projectModal .modal-body');
      const $modalTitle = $('#projectModal .modal-title');
      
      $modalTitle.text(repoName);
      $modalBody.html('<div class="text-center"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Loading README...</p></div>');

      // Fetch README
      $.ajax({
        url: `https://api.github.com/repos/${username}/${repoName}/readme`,
        headers: { 'Accept': 'application/vnd.github.html+json' },
        success: function(data) {
          $modalBody.html(data);
        },
        error: function() {
          $modalBody.html('<p class="text-danger">Could not load README. Please view on GitHub.</p>');
        }
      });
    });
  }).fail(function() {
    $('.carousel-inner').html('<div class="alert alert-warning text-center">Failed to load projects from GitHub.</div>');
  });
});

