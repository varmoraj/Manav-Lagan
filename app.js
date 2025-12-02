// app.js - મુખ્ય JavaScript લોજિક
let filteredData = [...rawData];
let currentFilterType = "all";
let eventSelections = {
    coming: [],
    notComing: []
};

// Populate filter dropdowns
function populateFilters() {
    const cities = [...new Set(rawData.map(item => item.city).filter(c => c))];
    const persons = [...new Set(rawData.map(item => item.person).filter(p => p))];

    const citySelect = document.getElementById('filterCity');
    const personSelect = document.getElementById('filterPerson');

    citySelect.innerHTML = '<option value="">બધા</option>';
    personSelect.innerHTML = '<option value="">બધા</option>';

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city || "-";
        citySelect.appendChild(option);
    });

    persons.forEach(person => {
        const option = document.createElement('option');
        option.value = person;
        option.textContent = person;
        personSelect.appendChild(option);
    });
}

// Get selected events
function getSelectedEvents() {
    const coming = [];
    const notComing = [];
    
    // Coming events
    if (document.getElementById('comingSagai').checked) coming.push('sagai');
    if (document.getElementById('comingHaldi').checked) coming.push('haldi');
    if (document.getElementById('comingMandap').checked) coming.push('mandap');
    if (document.getElementById('comingDandiya').checked) coming.push('dandiya');
    if (document.getElementById('comingJaan').checked) coming.push('jaan');
    
    // Not coming events
    if (document.getElementById('notComingSagai').checked) notComing.push('sagai');
    if (document.getElementById('notComingHaldi').checked) notComing.push('haldi');
    if (document.getElementById('notComingMandap').checked) notComing.push('mandap');
    if (document.getElementById('notComingDandiya').checked) notComing.push('dandiya');
    if (document.getElementById('notComingJaan').checked) notComing.push('jaan');
    
    return { coming, notComing };
}

// Update selection display
function updateSelectionDisplay() {
    const { coming, notComing } = getSelectedEvents();
    const display = document.getElementById('currentSelection');
    
    let text = "સિલેક્શન: ";
    
    if (coming.length > 0) {
        text += "આવવાના: " + coming.map(e => {
            const names = { sagai: "સગાઈ", haldi: "હળદી", mandap: "મંડપ", dandiya: "ડાંડિયા", jaan: "જાન" };
            return names[e];
        }).join(", ");
    }
    
    if (notComing.length > 0) {
        if (coming.length > 0) text += " | ";
        text += "ન આવવાના: " + notComing.map(e => {
            const names = { sagai: "સગાઈ", haldi: "હળદી", mandap: "મંડપ", dandiya: "ડાંડિયા", jaan: "જાન" };
            return names[e];
        }).join(", ");
    }
    
    if (coming.length === 0 && notComing.length === 0) {
        text = "કોઈ ઇવેન્ટ સિલેક્ટ નથી (બધું બતાવશે)";
    }
    
    display.textContent = text;
}

// Apply event filters
function applyEventFilters() {
    const city = document.getElementById('filterCity').value;
    const person = document.getElementById('filterPerson').value;
    const kankotriCard = document.getElementById('filterKankotriCard').value;
    const { coming, notComing } = getSelectedEvents();
    
    // Store current selections
    eventSelections = { coming, notComing };
    
    // Start with all data
    filteredData = [...rawData];
    
    // Apply city filter
    if (city) {
        filteredData = filteredData.filter(item => item.city === city);
    }
    
    // Apply person filter
    if (person) {
        filteredData = filteredData.filter(item => item.person === person);
    }
    
    // Apply kankotri/card filter
    if (kankotriCard) {
        filteredData = filteredData.filter(item => item.kankotriCard === kankotriCard);
    }
    
    // Apply coming events filter
    if (coming.length > 0) {
        filteredData = filteredData.filter(item => {
            return coming.every(event => item[event] > 0);
        });
    }
    
    // Apply not coming events filter
    if (notComing.length > 0) {
        filteredData = filteredData.filter(item => {
            return notComing.every(event => item[event] === 0);
        });
    }
    
    // Update UI
    currentFilterType = "custom";
    const eventNames = {
        sagai: "સગાઈ", haldi: "હળદી", mandap: "મંડપ", 
        dandiya: "ડાંડિયા", jaan: "જાન"
    };
    
    let statusText = "";
    if (coming.length > 0) {
        statusText += "આવવાના: " + coming.map(e => eventNames[e]).join(", ");
    }
    if (notComing.length > 0) {
        if (statusText) statusText += " | ";
        statusText += "ન આવવાના: " + notComing.map(e => eventNames[e]).join(", ");
    }
    
    document.getElementById('filterStatus').textContent = statusText ? `(${statusText})` : "";
    
    renderTable();
    updateSummary();
    updateSelectionDisplay();
}

// Clear event filters
function clearEventFilters() {
    // Clear all checkboxes
    document.getElementById('comingSagai').checked = false;
    document.getElementById('comingHaldi').checked = false;
    document.getElementById('comingMandap').checked = false;
    document.getElementById('comingDandiya').checked = false;
    document.getElementById('comingJaan').checked = false;
    
    document.getElementById('notComingSagai').checked = false;
    document.getElementById('notComingHaldi').checked = false;
    document.getElementById('notComingMandap').checked = false;
    document.getElementById('notComingDandiya').checked = false;
    document.getElementById('notComingJaan').checked = false;
    
    // Clear dropdowns
    document.getElementById('filterCity').value = '';
    document.getElementById('filterPerson').value = '';
    document.getElementById('filterKankotriCard').value = '';
    
    // Reset data
    filteredData = [...rawData];
    currentFilterType = "all";
    eventSelections = { coming: [], notComing: [] };
    
    document.getElementById('filterStatus').textContent = "";
    document.getElementById('currentSelection').textContent = "કોઈ ઇવેન્ટ સિલેક્ટ નથી (બધું બતાવશે)";
    
    renderTable();
    updateSummary();
}

// Show all data
function showAllData() {
    clearEventFilters();
}

// Render table
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="11" class="border p-4 text-center text-gray-500">કોઈ ડેટા મળ્યો નથી</td>`;
        tbody.appendChild(row);
        return;
    }

    // Sort by srNo
    const sortedData = [...filteredData].sort((a, b) => a.srNo - b.srNo);

    sortedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border p-2">${item.srNo}</td>
            <td class="border p-2">${item.name}</td>
            <td class="border p-2">${item.mobile || "-"}</td>
            <td class="border p-2">${item.city || "-"}</td>
            <td class="border p-2">${item.person}</td>
            <td class="border p-2">${item.kankotriCard}</td>
            <td class="border p-2 ${item.sagai > 0 ? 'bg-green-50' : ''}">${item.sagai}</td>
            <td class="border p-2 ${item.haldi > 0 ? 'bg-yellow-50' : ''}">${item.haldi}</td>
            <td class="border p-2 ${item.mandap > 0 ? 'bg-purple-50' : ''}">${item.mandap}</td>
            <td class="border p-2 ${item.dandiya > 0 ? 'bg-pink-50' : ''}">${item.dandiya}</td>
            <td class="border p-2 ${item.jaan > 0 ? 'bg-indigo-50' : ''}">${item.jaan}</td>
        `;
        tbody.appendChild(row);
    });
}

// Update summary
function updateSummary() {
    const totalPeople = filteredData.length;
    const totalSagai = filteredData.reduce((sum, item) => sum + item.sagai, 0);
    const totalHaldi = filteredData.reduce((sum, item) => sum + item.haldi, 0);
    const totalMandap = filteredData.reduce((sum, item) => sum + item.mandap, 0);
    const totalDandiya = filteredData.reduce((sum, item) => sum + item.dandiya, 0);
    const totalJaan = filteredData.reduce((sum, item) => sum + item.jaan, 0);

    document.getElementById('totalPeople').textContent = totalPeople;
    document.getElementById('totalSagai').textContent = totalSagai;
    document.getElementById('totalHaldi').textContent = totalHaldi;
    document.getElementById('totalMandap').textContent = totalMandap;
    document.getElementById('totalDandiya').textContent = totalDandiya;
    document.getElementById('totalJaan').textContent = totalJaan;
}

// Download PDF
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); // Landscape for more columns

    // Title
    doc.setFontSize(18);
    doc.text("માસ્ટર ઇન્વિટેશન લિસ્ટ", 14, 15);
    
    // Filter info
    doc.setFontSize(10);
    let filterText = "બધું ડેટા";
    if (eventSelections.coming.length > 0 || eventSelections.notComing.length > 0) {
        filterText = "કસ્ટમ ઇવેન્ટ ફિલ્ટર";
    }
    doc.text(`ફિલ્ટર: ${filterText}`, 14, 22);
    
    // Event selections
    let yPos = 28;
    const eventNames = {
        sagai: "સગાઈ", haldi: "હળદી", mandap: "મંડપ", 
        dandiya: "ડાંડિયા", jaan: "જાન"
    };
    
    if (eventSelections.coming.length > 0) {
        const comingText = "આવવાના: " + eventSelections.coming.map(e => eventNames[e]).join(", ");
        doc.text(comingText, 14, yPos);
        yPos += 7;
    }
    
    if (eventSelections.notComing.length > 0) {
        const notComingText = "ન આવવાના: " + eventSelections.notComing.map(e => eventNames[e]).join(", ");
        doc.text(notComingText, 14, yPos);
        yPos += 7;
    }

    // Summary
    doc.setFontSize(12);
    doc.text(`કુલ લોકો: ${filteredData.length}`, 14, yPos + 5);
    doc.text(`સગાઈ: ${filteredData.reduce((s, i) => s + i.sagai, 0)}`, 14, yPos + 12);
    doc.text(`હળદી: ${filteredData.reduce((s, i) => s + i.haldi, 0)}`, 14, yPos + 19);
    doc.text(`મંડપ: ${filteredData.reduce((s, i) => s + i.mandap, 0)}`, 14, yPos + 26);
    doc.text(`ડાંડિયા: ${filteredData.reduce((s, i) => s + i.dandiya, 0)}`, 14, yPos + 33);
    doc.text(`જાન: ${filteredData.reduce((s, i) => s + i.jaan, 0)}`, 14, yPos + 40);

    // Table headers (with all columns)
    const headers = [
        ["Sr No.", "નામ", "મોબાઈલ નંબર", "શહેર", "સંબંધ", "કંકોત્રી/કાર્ડ", 
         "સગાઈ", "હળદી", "મંડપ", "ડાંડિયા", "જાન"]
    ];

    // Sort data by srNo for PDF
    const sortedData = [...filteredData].sort((a, b) => a.srNo - b.srNo);

    const data = sortedData.map(item => [
        item.srNo.toString(),
        item.name, 
        item.mobile || "-",
        item.city || "-", 
        item.person, 
        item.kankotriCard,
        item.sagai.toString(),
        item.haldi.toString(),
        item.mandap.toString(),
        item.dandiya.toString(),
        item.jaan.toString()
    ]);

    doc.autoTable({
        head: headers,
        body: data,
        startY: yPos + 45,
        theme: 'grid',
        styles: { fontSize: 7 },
        headStyles: { fillColor: [100, 100, 255] }
    });

    doc.save(`invitation_list_${Date.now()}.pdf`);
}

// Initialize
window.onload = function() {
    populateFilters();
    updateSelectionDisplay();
    renderTable();
    updateSummary();
};
