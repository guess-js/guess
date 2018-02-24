(function() {
  function render(report) {
    console.log(report);
  }

  function processReport(id: string) {
    fetch('/reports/' + id)
      .then(r => r.json())
      .then(render);
  }

  document.getElementById('report-btn').addEventListener('click', () => {
    const input = document.getElementById('report-input') as HTMLInputElement;
    const id = input.value;
    input.value = '';
    processReport(id);
  });
})();
