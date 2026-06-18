// Autocomplete search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('input[name="Search"]');
    if (!searchInput) return;

    let searchTimeout;
    let currentFocus = -1;
    let autocompleteResults = [];

    // Create dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'autocomplete-dropdown';
    dropdownContainer.id = 'autocomplete-dropdown';
    
    // Ensure parent form has relative positioning
    const formElement = searchInput.closest('form');
    if (formElement) {
        formElement.style.position = 'relative';
        formElement.appendChild(dropdownContainer);
    } else {
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(dropdownContainer);
    }

    // Handle input changes
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (query.length < 1) {
            hideDropdown();
            return;
        }

        // Debounce API calls
        searchTimeout = setTimeout(() => {
            fetchAutocompleteResults(query);
        }, 200);
    });

    // Handle keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        const dropdown = document.getElementById('autocomplete-dropdown');
        const items = dropdown.querySelectorAll('.autocomplete-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus++;
            if (currentFocus >= items.length) currentFocus = 0;
            setActiveItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus--;
            if (currentFocus < 0) currentFocus = items.length - 1;
            setActiveItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocus >= 0 && items[currentFocus]) {
                items[currentFocus].click();
            } else if (items.length > 0) {
                items[0].click();
            } else {
                // Submit form if no suggestions
                searchInput.form.submit();
            }
        } else if (e.key === 'Escape') {
            hideDropdown();
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const formElement = searchInput.closest('form');
        const dropdown = document.getElementById('autocomplete-dropdown');
        if (formElement && !formElement.contains(e.target) && e.target !== searchInput) {
            hideDropdown();
        }
    });

    // Fetch autocomplete results from API
    function fetchAutocompleteResults(query) {
        fetch(`/api/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                autocompleteResults = data;
                displayDropdown(data);
            })
            .catch(error => {
                console.error('Autocomplete error:', error);
                hideDropdown();
            });
    }

    // Display dropdown with results
    function displayDropdown(results) {
        const dropdown = document.getElementById('autocomplete-dropdown');
        
        if (results.length === 0) {
            hideDropdown();
            return;
        }

        dropdown.innerHTML = '';
        currentFocus = -1;

        results.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.setAttribute('data-index', index);
            item.innerHTML = `
                <div class="autocomplete-item-content">
                    <img src="${result.image}" alt="${result.name}" class="autocomplete-item-image">
                    <div class="autocomplete-item-text">
                        <div class="autocomplete-item-name">${highlightMatch(result.name, searchInput.value)}</div>
                        <div class="autocomplete-item-category">${result.category}</div>
                    </div>
                </div>
            `;
            
            item.addEventListener('click', function() {
                window.location.href = result.url;
            });

            item.addEventListener('mouseenter', function() {
                currentFocus = index;
                setActiveItem(dropdown.querySelectorAll('.autocomplete-item'));
            });

            dropdown.appendChild(item);
        });

        dropdown.style.display = 'block';
    }

    // Hide dropdown
    function hideDropdown() {
        const dropdown = document.getElementById('autocomplete-dropdown');
        dropdown.style.display = 'none';
        currentFocus = -1;
    }

    // Set active item for keyboard navigation
    function setActiveItem(items) {
        items.forEach((item, index) => {
            if (index === currentFocus) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Highlight matching text
    function highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }
});

