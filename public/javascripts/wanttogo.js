$(document).ready(function() {
    $('#wanttogo-btn').on('click', function() {
        const destination = $(this).data('destination');
        const button = $(this);
        const isRemove = button.hasClass('remove-btn');
        
        button.prop('disabled', true);
        button.text(isRemove ? 'Removing...' : 'Adding...');
        
        const url = isRemove ? '/removefromwanttogo' : '/addtowanttogo';
        const successMessage = isRemove ? 'Destination removed from your list' : 'Destination added to your Want-to-Go list!';
        
        $.ajax({
            url: url,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ destination: destination }),
            success: function(response) {
                if (response.success) {
                    if (isRemove) {
                        button.text('Add to Want-to-Go List');
                        button.removeClass('remove-btn btn-danger-premium').addClass('btn-premium');
                        button.data('action', 'add');
                    } else {
                        button.text('Remove from List');
                        button.removeClass('btn-premium').addClass('remove-btn btn-danger-premium');
                        button.data('action', 'remove');
                    }
                    button.prop('disabled', false);
                    showNotification(successMessage, 'success');
                } else {
                    button.text(isRemove ? 'Remove from List' : 'Add to Want-to-Go List');
                    button.prop('disabled', false);
                    showNotification(response.message || 'An error occurred', 'error');
                }
            },
            error: function() {
                button.text(isRemove ? 'Remove from List' : 'Add to Want-to-Go List');
                button.prop('disabled', false);
                showNotification('An error occurred. Please try again.', 'error');
            }
        });
    });
    
    $(document).on('click', '.remove-destination-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const destination = $(this).data('destination');
        const item = $(this).closest('.wanttogo-item');
        const button = $(this);
        const originalText = button.text();
        
        console.log('Remove button clicked for:', destination);
        
        if (!destination) {
            console.error('No destination found in data attribute');
            showNotification('Error: Destination name not found', 'error');
            return false;
        }
        
        button.prop('disabled', true);
        button.text('Removing...');
        
        $.ajax({
            url: '/removefromwanttogo',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ destination: destination }),
            success: function(response) {
                console.log('Remove response:', response);
                if (response.success) {
                    showNotification('Destination removed from your list', 'success');
                    item.fadeOut(300, function() {
                        $(this).remove();
                        if ($('.wanttogo-item').length === 0) {
                            setTimeout(function() {
                                location.reload();
                            }, 500);
                        }
                    });
                } else {
                    button.text(originalText);
                    button.prop('disabled', false);
                    showNotification(response.message || 'Error removing destination', 'error');
                }
            },
            error: function(xhr, status, error) {
                button.text(originalText);
                button.prop('disabled', false);
                console.error('Remove error:', error, xhr.responseText);
                showNotification('An error occurred. Please try again.', 'error');
            }
        });
        
        return false;
    });
});

function showNotification(message, type) {
    $('.notification').remove();
    
    const notification = $('<div class="notification"></div>');
    notification.css({
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 25px',
        borderRadius: '12px',
        color: '#fff',
        fontWeight: '600',
        zIndex: '9999',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        animation: 'slideIn 0.3s ease-out'
    });
    
    if (type === 'success') {
        notification.css('background', 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.9) 100%)');
    } else {
        notification.css('background', 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)');
    }
    
    notification.text(message);
    $('body').append(notification);
    
    setTimeout(function() {
        notification.fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}

if (!$('#notification-styles').length) {
    $('<style id="notification-styles">@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }</style>').appendTo('head');
}

