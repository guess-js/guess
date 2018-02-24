(function () {
    function render(report) {
        console.log(report);
    }
    function processReport(id) {
        fetch('/reports/' + id)
            .then(function (r) { return r.json(); })
            .then(render);
    }
    document.getElementById('report-btn').addEventListener('click', function () {
        var input = document.getElementById('report-input');
        var id = input.value;
        input.value = '';
        processReport(id);
    });
})();
