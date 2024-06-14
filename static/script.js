$(document).ready(function() {
    var table = $('#data-table').DataTable();

    $('#apply-filters').click(function() {
        var filter1 = $('#filter1').val();
        var filter2 = $('#filter2').val();
        
        $.get('/api/filter', { filter1: filter1, filter2: filter2 }, function(data) {
            table.clear();
            table.rows.add(data);
            table.draw();
        });
    });
});

