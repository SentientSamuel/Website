(function () {
  'use strict';

  // Public HTTPS origin for the inventory API, or '' to load same-origin items.json.
  // Never use Tailscale, LAN, CGNAT (100.64.0.0/10), localhost, or other private addresses
  // in this public repository — visitors are not on your tailnet, and browsers block
  // mixed-content HTTP from https://samuellamb.dev.
  const API_BASE_URL = '';

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function isPrivateHostname(hostname) {
    const host = String(hostname || '').replace(/^\[|\]$/g, '').toLowerCase();
    if (!host) return true;
    if (host === 'localhost' || host === '::1' || host === '0.0.0.0' || host === '::') return true;
    if (host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.localhost')) return true;

    const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4) {
      const octets = ipv4.slice(1, 5).map(Number);
      if (octets.some(function (n) { return n > 255; })) return true;
      const a = octets[0];
      const b = octets[1];
      if (a === 0 || a === 10 || a === 127) return true;
      if (a === 169 && b === 254) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
      if (a === 100 && b >= 64 && b <= 127) return true;
      return false;
    }

    if (host.indexOf(':') !== -1) {
      if (host === '::1' || host.indexOf('fe80:') === 0 || host.indexOf('fc') === 0 || host.indexOf('fd') === 0) {
        return true;
      }
    }

    return false;
  }

  function isSafePublicOrigin(rawUrl) {
    if (!rawUrl) return false;
    var parsed;
    try {
      parsed = new URL(rawUrl, window.location.href);
    } catch (e) {
      return false;
    }
    if (parsed.origin === window.location.origin) {
      return true;
    }
    if (parsed.protocol !== 'https:') return false;
    if (isPrivateHostname(parsed.hostname)) return false;
    return true;
  }

  function publicItemsUrl() {
    if (API_BASE_URL && isSafePublicOrigin(API_BASE_URL)) {
      return API_BASE_URL.replace(/\/$/, '') + '/api/public/items';
    }
    if (API_BASE_URL) {
      console.warn('API_BASE_URL was ignored because it is not a public HTTPS origin.');
    }
    return 'items.json';
  }

  function publicImageUrl(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') return '';
    if (!API_BASE_URL || !isSafePublicOrigin(API_BASE_URL)) return '';
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(imagePath) || imagePath.indexOf('//') === 0 || imagePath.indexOf('..') !== -1) {
      return '';
    }
    var path = imagePath.charAt(0) === '/' ? imagePath : '/' + imagePath;
    return API_BASE_URL.replace(/\/$/, '') + path;
  }

  var inventoryData = [];

  function itemStatus(row) {
    var qtyAvail = parseInt(row['Quantity Available'] || '0', 10);
    return qtyAvail === 0 ? 'In Use' : 'Available';
  }

  function getFilteredData() {
    var searchEl = document.getElementById('search');
    var statusEl = document.getElementById('statusFilter');
    var search = searchEl ? searchEl.value.toLowerCase() : '';
    var statusFilter = statusEl ? statusEl.value : '';

    return inventoryData.filter(function (row) {
      var name = (row['Item Name'] || '').toLowerCase();
      var model = (row['Model / Version'] || '').toLowerCase();
      var tags = (row['AI Tags'] || '').toLowerCase();
      var status = itemStatus(row);

      var matchesSearch =
        !search ||
        name.indexOf(search) !== -1 ||
        model.indexOf(search) !== -1 ||
        tags.indexOf(search) !== -1;

      var matchesStatus = !statusFilter || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  function renderTable() {
    var tbody = document.querySelector('#inventoryTable tbody');
    if (!tbody) return;

    var filtered = getFilteredData();

    if (inventoryData.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="10" class="no-results">' +
        '<i class="fas fa-box-open"></i>' +
        '<div>No inventory data is published for public view.</div>' +
        '</td></tr>';
      return;
    }

    if (filtered.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="10" class="no-results">' +
        '<i class="fas fa-search"></i>' +
        '<div>No items found matching your criteria.</div>' +
        '</td></tr>';
      return;
    }

    tbody.innerHTML = '';

    filtered.forEach(function (row) {
      var tr = document.createElement('tr');
      var itemId = row['Item ID'] || '';
      var qtyOwned = row['Quantity Owned'] || '';
      var qtyAvail = parseInt(row['Quantity Available'] || '0', 10);
      var status = itemStatus(row);
      var statusClass = status === 'In Use' ? 'status-InUse' : 'status-Available';
      var imageUrl = publicImageUrl(row['Image Path'] || '');
      var name = row['Item Name'] || '';

      tr.innerHTML =
        '<td>' + escapeHtml(itemId) + '</td>' +
        '<td>' + escapeHtml(name) +
          (imageUrl
            ? '<br/><img src="' + escapeHtml(imageUrl) + '" style="max-width: 100px; max-height: 100px; margin-top: 0.5rem; border-radius: 4px;" alt="' + escapeHtml(name) + '" />'
            : '') +
        '</td>' +
        '<td>' + escapeHtml(row['Category'] || '') + '</td>' +
        '<td><span class="status-badge ' + statusClass + '">' + escapeHtml(status) + '</span></td>' +
        '<td>' + escapeHtml(String(qtyAvail)) + ' / ' + escapeHtml(String(qtyOwned)) + '</td>' +
        '<td>' + escapeHtml(row['Location'] || '') + '</td>' +
        '<td>' + escapeHtml(row['Currently Used In'] || '') + '</td>' +
        '<td>' + escapeHtml(row['Use Cases'] || '') + '</td>' +
        '<td>' + escapeHtml(row['Notes'] || '') + '</td>' +
        '<td>' + escapeHtml(row['AI Tags'] || '') + '</td>';

      tbody.appendChild(tr);
    });
  }

  function showLoadError(message) {
    var tbody = document.querySelector('#inventoryTable tbody');
    if (!tbody) return;
    tbody.innerHTML =
      '<tr><td colspan="10" class="no-results">' +
      '<i class="fas fa-exclamation-triangle"></i>' +
      '<div>Error loading inventory data: ' + escapeHtml(message) + '</div>' +
      '</td></tr>';
  }

  function normalizeItems(data) {
    if (!Array.isArray(data)) {
      throw new Error('Inventory response was not a list of items.');
    }
    return data.map(function (item) {
      if (item && (item['Item Name'] || item['Item ID'])) {
        return item;
      }
      return {
        'Item ID': item.item_id || '',
        'Item Name': item.name || '',
        'Category': item.category || '',
        'Model / Version': item.model_version || '',
        'Quantity Owned': item.quantity_owned || '0',
        'Quantity In Use': item.quantity_in_use || '0',
        'Quantity Available': item.quantity_available || '0',
        'Status': item.status || 'Available',
        'Location': item.location || '',
        'Currently Used In': item.currently_used_in || '',
        'Use Cases': item.use_cases || '',
        'Notes': item.notes || '',
        'AI Tags': Array.isArray(item.ai_tags) ? item.ai_tags.join(', ') : (item.ai_tags || ''),
        'Image Path': item.image_path || ''
      };
    });
  }

  function loadInventory() {
    return fetch(publicItemsUrl(), { credentials: 'omit' })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Failed to load inventory data');
        }
        return res.json();
      })
      .then(function (data) {
        inventoryData = normalizeItems(data);
        renderTable();
      })
      .catch(function (error) {
        console.error('Error loading inventory:', error);
        showLoadError(error && error.message ? error.message : 'Unknown error');
        throw error;
      });
  }

  function escapeCSVField(field) {
    if (field === null || field === undefined) return '';
    var stringField = String(field);
    if (stringField.indexOf(',') !== -1 || stringField.indexOf('"') !== -1 || stringField.indexOf('\n') !== -1) {
      return '"' + stringField.replace(/"/g, '""') + '"';
    }
    return stringField;
  }

  function exportToCSV() {
    var filtered = getFilteredData();
    if (filtered.length === 0) {
      window.alert('No data to export. Please adjust your filters.');
      return;
    }

    var allHeaders = {};
    filtered.forEach(function (row) {
      Object.keys(row).forEach(function (key) {
        allHeaders[key] = true;
      });
    });
    var headers = Object.keys(allHeaders);
    var csvRows = [headers.map(escapeCSVField).join(',')];

    filtered.forEach(function (row) {
      csvRows.push(headers.map(function (header) {
        return escapeCSVField(row[header] || '');
      }).join(','));
    });

    var blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_export_' + new Date().toISOString().split('T')[0] + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function applyIdFromURL() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    if (!id) return;
    var search = document.getElementById('search');
    if (search) {
      search.value = id;
      renderTable();
    }
  }

  function bindEvents() {
    var search = document.getElementById('search');
    var statusFilter = document.getElementById('statusFilter');
    var exportBtn = document.getElementById('exportBtn');
    var refreshBtn = document.getElementById('refreshBtn');

    if (search) search.addEventListener('input', renderTable);
    if (statusFilter) statusFilter.addEventListener('change', renderTable);
    if (exportBtn) exportBtn.addEventListener('click', exportToCSV);

    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        var btn = refreshBtn;
        var originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Refreshing...</span>';
        loadInventory()
          .then(function () {
            btn.innerHTML = '<i class="fas fa-check"></i> <span>Refreshed!</span>';
          })
          .catch(function () {
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Error</span>';
          })
          .then(function () {
            window.setTimeout(function () {
              btn.innerHTML = originalHTML;
              btn.disabled = false;
            }, 2000);
          });
      });
    }
  }

  bindEvents();
  loadInventory().then(applyIdFromURL).catch(function () { /* error already rendered */ });
})();
