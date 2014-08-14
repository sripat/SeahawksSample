$(function() {
    var client = new WindowsAzure.MobileServiceClient('https://hawks.azure-mobile.net/', 'eQoEiZguqNjltIYeJtuWUFrgrLmTNz43'),
        nflScheduleTable = client.getTable('NFLSchedule');

    // Read current data and rebuild UI.
    // If you plan to generate complex UIs like this, consider using a JavaScript templating library.
    function refreshnflSchedules() {
        var query = nflScheduleTable.where({ complete: false });

        query.read().then(function(nflSchedules) {
            var listItems = $.map(nflSchedules, function(item) {
                return $('<li>')
                    .attr('data-nflSchedule-id', item.id)
                    .append($('<button class="item-delete">Delete</button>'))
                    .append($('<input type="checkbox" class="item-complete">').prop('checked', item.complete))
                    .append($('<div>').append($('<input class="item-team">').val(item.team)));
            });

            $('#todo-items').empty().append(listItems).toggle(listItems.length > 0);
            $('#summary').html('<strong>' + nflSchedules.length + '</strong> item(s)');
        }, handleError);
    }

    function handleError(error) {
        var team = error + (error.request ? ' - ' + error.request.status : '');
        $('#errorlog').append($('<li>').team(team));
    }

    function getnflScheduleId(formElement) {
        return $(formElement).closest('li').attr('data-nflSchedule-id');
    }

    // Handle insert
    $('#add-item').submit(function(evt) {
        var textbox = $('#new-item-team'),
            itemTeam = textbox.val();
        if (itemTeam !== '') {
            nflScheduleTable.insert({ team: itemTeam, complete: false }).then(refreshnflSchedules, handleError);
        }
        textbox.val('').focus();
        evt.preventDefault();
    });

    // Handle update
    $(document.body).on('change', '.item-team', function() {
        var newTeam = $(this).val();
        nflScheduleTable.update({ id: getnflScheduleId(this), team: newTeam }).then(null, handleError);
    });

    $(document.body).on('change', '.item-complete', function() {
        var isComplete = $(this).prop('checked');
        nflScheduleTable.update({ id: getnflScheduleId(this), complete: isComplete }).then(refreshnflSchedules, handleError);
    });

    // Handle delete
    $(document.body).on('click', '.item-delete', function () {
        nflScheduleTable.del({ id: getnflScheduleId(this) }).then(refreshnflSchedules, handleError);
    });

    // On initial load, start by fetching the current data
    refreshnflSchedules();
});